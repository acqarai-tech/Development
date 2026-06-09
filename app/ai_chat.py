# import os
# from fastapi import APIRouter
# from pydantic import BaseModel
# import google.generativeai as genai

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel("gemini-2.5-flash")

# router = APIRouter()

# SYSTEM = """You are ACQAR's AI assistant — an expert on Dubai real estate.
# You help users with property prices, rental yields, area comparisons, 
# investment analysis, and market trends in Dubai and UAE.
# Be concise, factual, and helpful.
# Never invent specific transaction prices or data you don't know."""

# class ChatRequest(BaseModel):
#     message: str

# @router.post("/ai/chat")
# async def ai_chat(req: ChatRequest):
#     try:
#         response = model.generate_content(
#             f"{SYSTEM}\n\nUser: {req.message}"
#         )
#         return {"reply": response.text}
#     except Exception as e:
#         return {"reply": "Sorry, I could not process that. Please try again."}















import os
import json
import httpx
import google.generativeai as genai
from fastapi import APIRouter, Header
from pydantic import BaseModel
from supabase import create_client

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class ChatRequest(BaseModel):
    message: str


# ── Fetch helpers ─────────────────────────────────────

def fetch_area_stats(area: str):
    try:
        res = supabase.table("avm").select(
            "area_name_en, price_per_sqm, procedure_area, actual_worth, instance_date"
        ).ilike("area_name_en", f"%{area}%").limit(200).execute()
        return res.data or []
    except:
        return []


def fetch_top_areas():
    try:
        res = supabase.table("avm").select(
            "area_name_en, price_per_sqm, actual_worth"
        ).limit(500).execute()
        return res.data or []
    except:
        return []


def fetch_signals():
    try:
        if not SIGNALS_API:
            return []
        import requests
        r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
        return r.json() if r.status_code == 200 else []
    except:
        return []


def fetch_project_data(project: str):
    try:
        res = supabase.table("avm").select(
            "project_name_en, area_name_en, price_per_sqm, actual_worth, rooms_en, procedure_area"
        ).ilike("project_name_en", f"%{project}%").limit(100).execute()
        return res.data or []
    except:
        return []


# ── Main endpoint ─────────────────────────────────────

@router.post("/intelligence/chat")
async def intelligence_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"type": "text", "reply": "Please ask a question."}

    msg_lower = message.lower()

    # Decide what data to fetch based on question
    context_data = {}

    # Area-specific query
    area_keywords = [
        "marina", "jvc", "downtown", "business bay", "palm", "jumeirah",
        "deira", "bur dubai", "silicon oasis", "sports city", "creek",
        "hills", "springs", "meadows", "al barsha", "mirdif", "arjan",
        "discovery gardens", "international city", "town square"
    ]
    detected_area = next((a for a in area_keywords if a in msg_lower), None)

    if detected_area:
        area_data = fetch_area_stats(detected_area)
        if area_data:
            prices = [r["price_per_sqm"] for r in area_data if r.get("price_per_sqm")]
            context_data["area"] = detected_area
            context_data["transaction_count"] = len(area_data)
            context_data["avg_price_sqm"] = round(sum(prices) / len(prices), 0) if prices else None
            context_data["min_price_sqm"] = round(min(prices), 0) if prices else None
            context_data["max_price_sqm"] = round(max(prices), 0) if prices else None
            context_data["sample_transactions"] = area_data[:5]

    # Signals query
    if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
        signals = fetch_signals()
        context_data["signals"] = signals[:10]

    # Top areas / market overview
    if any(w in msg_lower for w in ["best area", "top area", "highest yield", "compare", "market", "overview"]):
        top = fetch_top_areas()
        if top:
            from collections import defaultdict
            area_map = defaultdict(list)
            for r in top:
                if r.get("area_name_en") and r.get("price_per_sqm"):
                    area_map[r["area_name_en"]].append(r["price_per_sqm"])
            area_summary = [
                {
                    "area": k,
                    "avg_psm": round(sum(v) / len(v), 0),
                    "count": len(v)
                }
                for k, v in area_map.items() if len(v) >= 5
            ]
            area_summary.sort(key=lambda x: x["avg_psm"], reverse=True)
            context_data["top_areas"] = area_summary[:15]

    # Build prompt
    system = """You are ACQAR's AI analytics assistant for Dubai real estate.
You have access to real transaction data from our Supabase database and live market signals.
Always answer based on the data provided in the context.
If data is present, give specific numbers. Never invent data.

Respond in this exact JSON format:
{
  "reply": "your text answer here with specific numbers from the data",
  "chart_type": "bar" or "line" or "none",
  "chart_data": [{"label": "Area Name", "value": 1234}] or [],
  "insight": "one key takeaway in one sentence",
  "data_source": "Acqar AVM Database" or "Live Signals" or "Acqar AVM + Signals"
}

Rules:
- chart_type = "bar" for area comparisons
- chart_type = "line" for price trends over time  
- chart_type = "none" for simple factual questions
- chart_data max 10 items
- reply must be 2-4 sentences with actual numbers"""

    user_prompt = f"""User question: {message}

Available data context:
{json.dumps(context_data, indent=2)}

Answer based strictly on this data."""

    try:
        response = model.generate_content(f"{system}\n\n{user_prompt}")
        raw = response.text.strip()

        # Clean markdown if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        result["type"] = "structured"
        return result

    except Exception as e:
        return {
            "type": "text",
            "reply": "I couldn't process that query. Please try again.",
            "chart_type": "none",
            "chart_data": [],
            "insight": "",
            "data_source": ""
        }
