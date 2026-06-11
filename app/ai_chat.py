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















# import os
# import json
# import httpx
# import google.generativeai as genai
# from fastapi import APIRouter, Header
# from pydantic import BaseModel
# from supabase import create_client

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel("gemini-2.5-flash")

# router = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# class ChatRequest(BaseModel):
#     message: str


# # ── Fetch helpers ─────────────────────────────────────

# def fetch_area_stats(area: str):
#     try:
#         res = supabase.table("avm").select(
#             "area_name_en, price_per_sqm, procedure_area, actual_worth, instance_date"
#         ).ilike("area_name_en", f"%{area}%").limit(200).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_top_areas():
#     try:
#         res = supabase.table("avm").select(
#             "area_name_en, price_per_sqm, actual_worth"
#         ).limit(500).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_signals():
#     try:
#         if not SIGNALS_API:
#             return []
#         import requests
#         r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
#         return r.json() if r.status_code == 200 else []
#     except:
#         return []


# def fetch_project_data(project: str):
#     try:
#         res = supabase.table("avm").select(
#             "project_name_en, area_name_en, price_per_sqm, actual_worth, rooms_en, procedure_area"
#         ).ilike("project_name_en", f"%{project}%").limit(100).execute()
#         return res.data or []
#     except:
#         return []


# # ── Main endpoint ─────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question."}

#     msg_lower = message.lower()

#     # Decide what data to fetch based on question
#     context_data = {}

#     # Area-specific query
#     area_keywords = [
#         "marina", "jvc", "downtown", "business bay", "palm", "jumeirah",
#         "deira", "bur dubai", "silicon oasis", "sports city", "creek",
#         "hills", "springs", "meadows", "al barsha", "mirdif", "arjan",
#         "discovery gardens", "international city", "town square"
#     ]
#     detected_area = next((a for a in area_keywords if a in msg_lower), None)

#     if detected_area:
#         area_data = fetch_area_stats(detected_area)
#         if area_data:
#             prices = [r["price_per_sqm"] for r in area_data if r.get("price_per_sqm")]
#             context_data["area"] = detected_area
#             context_data["transaction_count"] = len(area_data)
#             context_data["avg_price_sqm"] = round(sum(prices) / len(prices), 0) if prices else None
#             context_data["min_price_sqm"] = round(min(prices), 0) if prices else None
#             context_data["max_price_sqm"] = round(max(prices), 0) if prices else None
#             context_data["sample_transactions"] = area_data[:5]

#     # Signals query
#     if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
#         signals = fetch_signals()
#         context_data["signals"] = signals[:10]

#     # Top areas / market overview
#     if any(w in msg_lower for w in ["best area", "top area", "highest yield", "compare", "market", "overview"]):
#         top = fetch_top_areas()
#         if top:
#             from collections import defaultdict
#             area_map = defaultdict(list)
#             for r in top:
#                 if r.get("area_name_en") and r.get("price_per_sqm"):
#                     area_map[r["area_name_en"]].append(r["price_per_sqm"])
#             area_summary = [
#                 {
#                     "area": k,
#                     "avg_psm": round(sum(v) / len(v), 0),
#                     "count": len(v)
#                 }
#                 for k, v in area_map.items() if len(v) >= 5
#             ]
#             area_summary.sort(key=lambda x: x["avg_psm"], reverse=True)
#             context_data["top_areas"] = area_summary[:15]

#     # Build prompt
#     system = """You are ACQAR's AI analytics assistant for Dubai real estate.
# You have access to real transaction data from our Supabase database and live market signals.
# Always answer based on the data provided in the context.
# If data is present, give specific numbers. Never invent data.

# Respond in this exact JSON format:
# {
#   "reply": "your text answer here with specific numbers from the data",
#   "chart_type": "bar" or "line" or "none",
#   "chart_data": [{"label": "Area Name", "value": 1234}] or [],
#   "insight": "one key takeaway in one sentence",
#   "data_source": "Acqar AVM Database" or "Live Signals" or "Acqar AVM + Signals"
# }

# Rules:
# - chart_type = "bar" for area comparisons
# - chart_type = "line" for price trends over time  
# - chart_type = "none" for simple factual questions
# - chart_data max 10 items
# - reply must be 2-4 sentences with actual numbers"""

#     user_prompt = f"""User question: {message}

# Available data context:
# {json.dumps(context_data, indent=2)}

# Answer based strictly on this data."""

#     try:
#         response = model.generate_content(f"{system}\n\n{user_prompt}")
#         raw = response.text.strip()

#         # Clean markdown if present
#         if raw.startswith("```"):
#             raw = raw.split("```")[1]
#             if raw.startswith("json"):
#                 raw = raw[4:]
#         raw = raw.strip()

#         result = json.loads(raw)
#         result["type"] = "structured"
#         return result

#     except Exception as e:
#         return {
#             "type": "text",
#             "reply": "I couldn't process that query. Please try again.",
#             "chart_type": "none",
#             "chart_data": [],
#             "insight": "",
#             "data_source": ""
#         }











# import os
# import json
# import google.generativeai as genai
# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel("gemini-2.5-flash")

# router = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")

# SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
# SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


# class ChatRequest(BaseModel):
#     message: str


# # ── Area keyword → area_id mapping (verified against DB) ────────────
# AREA_ID_MAP = {
#     "dubai marina": 36,
#     "marina": 36,
#     "jumeirah village circle": 59,
#     "jvc": 59,
#     "downtown dubai": 10,
#     "downtown": 10,
#     "business bay": 54,
#     "palm jumeirah": 410,
#     "palm": 410,
#     "jumeirah": 23,
#     "deira": 545,
#     "bur dubai": 345,
#     "silicon oasis": 91,
#     "dubai hills estate": 53,
#     "dubai hills": 53,
#     "al barsha": 105,
#     "mirdif": 232,
#     "arjan": 91,
#     "discovery gardens": 13,
#     "international city": 368,
#     "town square": 386,
#     "difc": 117,
#     "bluewaters island": 1754,
#     "bluewaters": 1754,
#     "dubai south": 3355,
#     "al furjan": 41,
#     "motor city": 268,
#     "dubai sports city": 67,
#     "sports city": 67,
#     "dubai creek harbour": 1509,
#     "creek harbour": 1509,
#     "al jaddaf": 1509,
#     "jaddaf": 1509,
#     "jumeirah lake towers": 12,
#     "jlt": 12,
#     "arabian ranches 3": 16296,
#     "arabian ranches 2": 133,
#     "arabian ranches": 133,
#     "damac hills 2": 352,
#     "damac hills": 352,
#     "barsha heights": 25,
#     "tecom": 25,
#     "the greens": 25,
#     "greens": 25,
#     "al quoz": 293,
#     "al satwa": 1347,
#     "satwa": 1347,
#     "al karama": 271,
#     "karama": 271,
#     "meydan": 43,
#     "palm jebel ali": 1519,
#     "palm jabal ali": 411,
#     "dubai islands": 5178,
#     "expo city": 85082,
#     "dubai internet city": 1621,
#     "dubai media city": 95,
#     "dubai production city": 5036,
#     "impz": 5036,
#     "jumeirah golf estates": 347,
#     "jumeirah park": 73,
#     "dubailand": 51,
#     "tilal al ghaf": 5173,
#     "damac lagoons": 75266,
#     "dubai harbour": 3512,
#     "oud metha": 388,
#     "nad al sheba": 161,
#     "culture village": 190,
#     "jaddaf waterfront": 190,
#     "burj khalifa": 390,
#     "green community": 673,
#     "dubai design district": 22688,
#     "d3": 22688,
#     "al mamzer": 231,
#     "mamzer": 231,
#     "al garhoud": 378,
#     "garhoud": 378,
#     "dubai festival city": 277,
#     "festival city": 277,
#     "port saeed": 240,
#     "hor al anz": 233,
#     "muhaisnah": 1793,
#     "al nahda": 355,
#     "nahda": 355,
#     "nad al hamar": 1045,
#     "ras al khor": 1036,
#     "al rashidiya": 2418,
#     "rashidiya": 2418,
#     "al wasl": 914,
#     "wasl": 914,
#     "pearl jumeirah": 344,
#     "um suqaim": 229,
#     "jumeirah second": 375,
#     "jumeirah third": 318,
#     "jumeirah first": 317,
#     "al manara": 315,
#     "al saffa": 313,
# }


# def get_area_id(msg_lower: str):
#     for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             return area_id, keyword
#     return None, None


# # ── Fetch helpers ─────────────────────────────────────────────────

# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, total_area_ha, completion_rate, "
#             "residential_units, parks_info, retail_info, active_project_count, "
#             "buyer_nationalities, key_developers, active_project_names, "
#             "tx_7d, tx_7d_delta_pct, distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except:
#         return None


# def fetch_area_stats(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "area_name_en, price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month, instance_date"
#         ).eq("area_id", area_id).limit(1000).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_price_history(area_id: int):
#     try:
#         res = supabase_chat.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_area_catalysts(area_id: int):
#     try:
#         res = supabase_chat.table("area_catalysts").select(
#             "area_name_en, catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(10).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_developer_track_records(developer_names: list):
#     try:
#         if not developer_names:
#             return []
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase_chat.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_area_shock_impacts(zone_type: str):
#     try:
#         if not zone_type:
#             return []
#         res = supabase_chat.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_dld_projects(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "project_name_en"
#         ).eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
#         if not res.data:
#             return []
#         proj_map = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 proj_map[r["project_name_en"]] += 1
#         return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
#     except:
#         return []


# def fetch_top_areas_intelligence():
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(20).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_signals():
#     try:
#         if not SIGNALS_API:
#             return []
#         import requests
#         r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
#         return r.json() if r.status_code == 200 else []
#     except:
#         return []


# # ── Main endpoint ─────────────────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question."}

#     msg_lower = message.lower()
#     context_data = {}

#     # ── Detect area ──
#     area_id, detected_area = get_area_id(msg_lower)

#     if area_id:
#         context_data["detected_area"] = detected_area
#         context_data["area_id"] = area_id

#         # 1. Area intelligence
#         intel = fetch_area_intelligence(area_id)
#         if intel:
#             context_data["area_intelligence"] = intel

#             # 2. Developer track records
#             devs = intel.get("key_developers") or []
#             if devs:
#                 dev_records = fetch_developer_track_records(devs)
#                 if dev_records:
#                     context_data["developer_track_records"] = dev_records

#             # 3. Shock resilience
#             zone = intel.get("zone_type")
#             if zone:
#                 shocks = fetch_area_shock_impacts(zone)
#                 if shocks:
#                     context_data["historical_shock_resilience"] = shocks

#         # 4. Raw AVM transactions
#         area_data = fetch_area_stats(area_id)
#         if area_data:
#             prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#             worths = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]

#             room_map = defaultdict(list)
#             for r in area_data:
#                 rooms = str(r.get("rooms_en", ""))
#                 if rooms and r.get("price_per_sqm"):
#                     label = {
#                         "0": "Studio", "0.0": "Studio",
#                         "1": "1 BR",   "1.0": "1 BR",
#                         "2": "2 BR",   "2.0": "2 BR",
#                         "3": "3 BR",   "3.0": "3 BR",
#                         "4": "4 BR",   "4.0": "4 BR",
#                     }.get(rooms)
#                     if label:
#                         room_map[label].append(float(r["price_per_sqm"]))

#             year_map = defaultdict(list)
#             for r in area_data:
#                 if r.get("sale_year") and r.get("price_per_sqm"):
#                     year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#             context_data["transaction_stats"] = {
#                 "count": len(area_data),
#                 "avg_price_sqm": round(sum(prices) / len(prices), 0) if prices else None,
#                 "min_price_sqm": round(min(prices), 0) if prices else None,
#                 "max_price_sqm": round(max(prices), 0) if prices else None,
#                 "avg_worth_aed": round(sum(worths) / len(worths), 0) if worths else None,
#                 "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                 "yearly_avg_psm": {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
#             }

#         # 5. Price history
#         history = fetch_price_history(area_id)
#         if history:
#             year_avg = defaultdict(list)
#             for r in history:
#                 year_avg[r["sale_year"]].append(r["psf"])
#             context_data["price_history_by_year"] = {
#                 str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
#             }
#             context_data["price_history_recent"] = [
#                 {"year": r["sale_year"], "month": r["sale_month"], "psf": r["psf"], "transactions": r["cnt"]}
#                 for r in history[-6:]
#             ]

#         # 6. Catalysts
#         catalysts = fetch_area_catalysts(area_id)
#         if catalysts:
#             context_data["area_catalysts"] = catalysts

#         # 7. Top projects
#         projects = fetch_dld_projects(area_id)
#         if projects:
#             context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

#     # ── Top areas / compare / market overview ──
#     if any(w in msg_lower for w in ["best area", "top area", "highest yield", "compare", "market", "overview", "which area", "invest", "yield", "rental", "rank", "buy", "best", "which", "recommend", "suggest"]):
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             # Auto-fetch full data for the top 3 areas
#             for area in top[:3]:
#                 area_name = area.get("area_name_en", "")
#                 # Find area_id from map
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     stats = fetch_area_stats(matched_id)
#                     catalysts = fetch_area_catalysts(matched_id)
#                     history = fetch_price_history(matched_id)
#                     if stats:
#                         prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
#                         room_map = defaultdict(list)
#                         for r in stats:
#                             rooms = str(r.get("rooms_en", ""))
#                             label = {"0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR", "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR"}.get(rooms)
#                             if label and r.get("price_per_sqm"):
#                                 room_map[label].append(float(r["price_per_sqm"]))
#                         context_data[f"area_detail_{key}"] = {
#                             "area_name": area_name,
#                             "avg_psm": round(sum(prices) / len(prices), 0) if prices else None,
#                             "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                             "catalysts": [{"name": c["name"], "date": c["expected_date"], "confidence": c["confidence"]} for c in (catalysts or [])[:3]],
#                             "price_history": {str(r["sale_year"]): r["psf"] for r in (history or [])[-6:]},
#                         }

#     # ── Signals ──
#     if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
#         signals = fetch_signals()
#         if signals:
#             context_data["live_signals"] = signals[:10]

#     # ── Build prompt ──
#     has_db_data = bool(context_data)

#     system = """You are ACQAR's AI analytics assistant for Dubai real estate.
# You have access to 365,000+ real DLD transactions, area intelligence scores, price history, developer track records, catalyst timelines, and historical shock resilience data.

# Respond ONLY in this exact JSON format — no markdown, no extra text outside the JSON:
# {
#   "reply": "USE THESE EXACT EMOJI SECTION HEADERS SEPARATED BY BLANK LINES:\\n\\n📊 MARKET OVERVIEW\\n[investment score X/100, verdict BUY/HOLD/WATCH, gross yield X.X% vs Dubai avg 6.1%, price trend direction, ranking, distress %]\\n\\n💰 PRICING\\n[avg PSM, min-max range, avg property worth in AED, then each bedroom: Studio AED X,XXX/sqm · 1BR AED X,XXX/sqm · 2BR AED X,XXX/sqm · 3BR AED X,XXX/sqm]\\n\\n🏗️ DEVELOPERS & PROJECTS\\n[list each developer: Name — X% on-time · X★ rating · avg delay X months · X projects delivered. Then active project count and pipeline.]\\n\\n📈 PRICE HISTORY\\n[year by year: 2021: AED X,XXX → 2022: AED X,XXX → ... showing the trend direction clearly]\\n\\n⚡ CATALYSTS\\n[each catalyst on its own line: • Name (Type) — Date — Confidence — Expected impact]\\n\\n🛡️ RESILIENCE\\n[each shock: • Event (Period): X% impact, recovered in X months via Driver]\\n\\n✅ VERDICT\\n[Clear BUY/HOLD/WATCH with 2-3 specific reasons from the data]",
#   "charts": [
#     {"title": "Price by Bedroom (AED/sqm)", "type": "bar", "data": [{"label": "Studio", "value": 0}, {"label": "1 BR", "value": 0}, {"label": "2 BR", "value": 0}, {"label": "3 BR", "value": 0}]},
#     {"title": "Price History by Year (AED/sqft)", "type": "line", "data": [{"label": "2021", "value": 0}, {"label": "2022", "value": 0}, {"label": "2023", "value": 0}, {"label": "2024", "value": 0}, {"label": "2025", "value": 0}]},
#     {"title": "Developer On-Time Delivery %", "type": "bar", "data": [{"label": "Developer Name", "value": 0}]}
#   ],
#   "insight": "one key actionable takeaway for an investor or buyer",
#   "data_source": "Acqar AVM · 365K+ DLD Transactions · Area Intelligence"
# }

# STRICT RULES:
# - reply MUST contain ALL sections that have data — never skip a section if data exists
# - Every section uses the exact emoji header shown
# - charts array MUST have all 3 charts populated with real numbers from the data
# - bedroom chart: use bedroom_avg_psm values
# - price history chart: use price_history_by_year values — label=year string, value=avg psf
# - developer chart: use developer_track_records on_time_pct — label=developer_name, value=on_time_pct
# - If a chart has no data, remove it from the array entirely
# - FORMAT: prices as AED X,XXX · yields as X.X% · scores as XX/100
# - IF NO DB DATA: answer from expert knowledge, mark as estimates, still use section headers
# - For general "best area / which area / recommend / buy" queries: list each recommended area as its own mini-report. Format the reply as: "🏙️ AREA NAME\\n📊 MARKET OVERVIEW\\n[data]\\n\\n💰 PRICING\\n[data]\\n\\n⚡ CATALYSTS\\n[data]\\n\\n✅ VERDICT\\n[reason]\\n\\n---\\n\\n🏙️ NEXT AREA NAME\\n..." — repeat for top 3 areas
# - Use area_detail_* keys in the data to populate each area's real numbers — bedroom_avg_psm for pricing, catalysts array for catalysts, price_history for trend
# - For multi-area responses, charts array should show: chart 1 = investment scores comparison (bar, label=area_name, value=investment_score), chart 2 = yield comparison (bar, label=area_name, value=gross_yield_pct)"""

#     user_prompt = f"""User question: {message}

# {"Full data context from Acqar database:" if has_db_data else "NOTE: No specific database data found for this query. Use your expert Dubai real estate knowledge to answer in detail. State that figures are based on market knowledge, not live data."}
# {json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"}

# Give a detailed, analytical answer like a senior Dubai real estate analyst. {"Use all available data above — reference specific numbers." if has_db_data else "Use your Dubai real estate expertise. Be specific and helpful."}"""

#     try:
#         response = model.generate_content(f"{system}\n\n{user_prompt}")
#         raw = response.text.strip()

#         if raw.startswith("```"):
#             raw = raw.split("```")[1]
#             if raw.startswith("json"):
#                 raw = raw[4:]
#         raw = raw.strip()

#         result = json.loads(raw)
#         result["type"] = "structured"
#         return result

#     except Exception as e:
#         return {
#             "type": "text",
#             "reply": "I encountered an error processing your query. Please try rephrasing or ask about a specific Dubai area like 'Tell me about JVC' or 'Best areas for rental yield'.",
#             "chart_type": "none",
#             "chart_data": [],
#             "insight": "",
#             "data_source": ""
#         }

















# import os
# import json
# import traceback

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict

# # ADD these 3 lines
# from openai import OpenAI
# client = OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")


# router = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")

# SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
# SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


# class ChatRequest(BaseModel):
#     message: str


# # ── Area keyword → area_id mapping (verified against DB) ────────────
# AREA_ID_MAP = {
#     "dubai marina": 36,
#     "marina": 36,
#     "jumeirah village circle": 59,
#     "jvc": 59,
#     "downtown dubai": 10,
#     "downtown": 10,
#     "business bay": 54,
#     "palm jumeirah": 410,
#     "palm": 410,
#     "jumeirah": 23,
#     "deira": 545,
#     "bur dubai": 345,
#     "silicon oasis": 91,
#     "dubai hills estate": 53,
#     "dubai hills": 53,
#     "al barsha": 105,
#     "mirdif": 232,
#     "arjan": 91,
#     "discovery gardens": 13,
#     "international city": 368,
#     "town square": 386,
#     "difc": 117,
#     "bluewaters island": 1754,
#     "bluewaters": 1754,
#     "dubai south": 3355,
#     "al furjan": 41,
#     "motor city": 268,
#     "dubai sports city": 67,
#     "sports city": 67,
#     "dubai creek harbour": 1509,
#     "creek harbour": 1509,
#     "al jaddaf": 1509,
#     "jaddaf": 1509,
#     "jumeirah lake towers": 12,
#     "jlt": 12,
#     "arabian ranches 3": 16296,
#     "arabian ranches 2": 133,
#     "arabian ranches": 133,
#     "damac hills 2": 352,
#     "damac hills": 352,
#     "barsha heights": 25,
#     "tecom": 25,
#     "the greens": 25,
#     "greens": 25,
#     "al quoz": 293,
#     "al satwa": 1347,
#     "satwa": 1347,
#     "al karama": 271,
#     "karama": 271,
#     "meydan": 43,
#     "palm jebel ali": 1519,
#     "palm jabal ali": 411,
#     "dubai islands": 5178,
#     "expo city": 85082,
#     "dubai internet city": 1621,
#     "dubai media city": 95,
#     "dubai production city": 5036,
#     "impz": 5036,
#     "jumeirah golf estates": 347,
#     "jumeirah park": 73,
#     "dubailand": 51,
#     "tilal al ghaf": 5173,
#     "damac lagoons": 75266,
#     "dubai harbour": 3512,
#     "oud metha": 388,
#     "nad al sheba": 161,
#     "culture village": 190,
#     "jaddaf waterfront": 190,
#     "burj khalifa": 390,
#     "green community": 673,
#     "dubai design district": 22688,
#     "d3": 22688,
#     "al mamzer": 231,
#     "mamzer": 231,
#     "al garhoud": 378,
#     "garhoud": 378,
#     "dubai festival city": 277,
#     "festival city": 277,
#     "port saeed": 240,
#     "hor al anz": 233,
#     "muhaisnah": 1793,
#     "al nahda": 355,
#     "nahda": 355,
#     "nad al hamar": 1045,
#     "ras al khor": 1036,
#     "al rashidiya": 2418,
#     "rashidiya": 2418,
#     "al wasl": 914,
#     "wasl": 914,
#     "pearl jumeirah": 344,
#     "um suqaim": 229,
#     "jumeirah second": 375,
#     "jumeirah third": 318,
#     "jumeirah first": 317,
#     "al manara": 315,
#     "al saffa": 313,
# }


# def get_area_id(msg_lower: str):
#     for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             return area_id, keyword
#     return None, None


# # ── Median helper ─────────────────────────────────────────────────

# def median_millions(lst: list):
#     if not lst:
#         return None
#     s = sorted(lst)
#     n = len(s)
#     return round(s[n // 2] / 1_000_000, 2)


# # ── JSON extraction helper ────────────────────────────────────────

# def extract_json(raw: str) -> dict:
#     """Robustly extract JSON from Gemini response regardless of wrapping."""
#     raw = raw.strip()

#     # Strip markdown code fences
#     if "```" in raw:
#         parts = raw.split("```")
#         for part in parts:
#             part = part.strip()
#             if part.startswith("json"):
#                 part = part[4:].strip()
#             if part.startswith("{"):
#                 raw = part
#                 break

#     # Find the outermost { ... }
#     start = raw.find("{")
#     end = raw.rfind("}")
#     if start != -1 and end != -1 and end > start:
#         raw = raw[start:end+1]

#     return json.loads(raw)


# # ── Fetch helpers ─────────────────────────────────────────────────

# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, total_area_ha, completion_rate, "
#             "residential_units, parks_info, retail_info, active_project_count, "
#             "buyer_nationalities, key_developers, active_project_names, "
#             "tx_7d, tx_7d_delta_pct, distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except:
#         return None


# def fetch_area_stats(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "area_name_en, price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month, instance_date"
#         ).eq("area_id", area_id).limit(1000).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_price_history(area_id: int):
#     try:
#         res = supabase_chat.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_area_catalysts(area_id: int):
#     try:
#         res = supabase_chat.table("area_catalysts").select(
#             "area_name_en, catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(10).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_developer_track_records(developer_names: list):
#     try:
#         if not developer_names:
#             return []
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase_chat.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_area_shock_impacts(zone_type: str):
#     try:
#         if not zone_type:
#             return []
#         res = supabase_chat.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_dld_projects(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "project_name_en"
#         ).eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
#         if not res.data:
#             return []
#         proj_map = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 proj_map[r["project_name_en"]] += 1
#         return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
#     except:
#         return []


# def fetch_top_areas_intelligence():
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(20).execute()
#         return res.data or []
#     except:
#         return []


# def fetch_signals():
#     try:
#         if not SIGNALS_API:
#             return []
#         import requests
#         r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
#         return r.json() if r.status_code == 200 else []
#     except:
#         return []


# # ── Main endpoint ─────────────────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question."}

#     msg_lower = message.lower()
#     context_data = {}
#     raw = ""

#     # ── Detect area ──
#     area_id, detected_area = get_area_id(msg_lower)

#     if area_id:
#         context_data["detected_area"] = detected_area
#         context_data["area_id"] = area_id

#         # 1. Area intelligence
#         intel = fetch_area_intelligence(area_id)
#         if intel:
#             context_data["area_intelligence"] = intel

#             # 2. Developer track records
#             devs = intel.get("key_developers") or []
#             if devs:
#                 dev_records = fetch_developer_track_records(devs)
#                 if dev_records:
#                     context_data["developer_track_records"] = dev_records

#             # 3. Shock resilience
#             zone = intel.get("zone_type")
#             if zone:
#                 shocks = fetch_area_shock_impacts(zone)
#                 if shocks:
#                     context_data["historical_shock_resilience"] = shocks

#         # 4. Raw AVM transactions
#         area_data = fetch_area_stats(area_id)
#         if area_data:
#             prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#             worths = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]

#             BEDROOM_KEYS = {
#                 "0": "Studio", "0.0": "Studio",
#                 "1": "1 BR",   "1.0": "1 BR",
#                 "2": "2 BR",   "2.0": "2 BR",
#                 "3": "3 BR",   "3.0": "3 BR",
#                 "4": "4 BR",   "4.0": "4 BR",
#             }

#             room_map = defaultdict(list)
#             worth_map = defaultdict(list)

#             for r in area_data:
#                 rooms = str(r.get("rooms_en", ""))
#                 label = BEDROOM_KEYS.get(rooms)
#                 if not label:
#                     continue
#                 if r.get("price_per_sqm"):
#                     room_map[label].append(float(r["price_per_sqm"]))
#                 if r.get("actual_worth"):
#                     worth_map[label].append(float(r["actual_worth"]))

#             year_map = defaultdict(list)
#             for r in area_data:
#                 if r.get("sale_year") and r.get("price_per_sqm"):
#                     year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#             context_data["transaction_stats"] = {
#                 "count": len(area_data),
#                 "avg_price_sqm": round(sum(prices) / len(prices), 0) if prices else None,
#                 "min_price_sqm": round(min(prices), 0) if prices else None,
#                 "max_price_sqm": round(max(prices), 0) if prices else None,
#                 "avg_worth_aed": round(sum(worths) / len(worths), 0) if worths else None,
#                 "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                 "yearly_avg_psm": {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
#                 "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#             }

#         # 5. Price history
#         history = fetch_price_history(area_id)
#         if history:
#             year_avg = defaultdict(list)
#             for r in history:
#                 year_avg[r["sale_year"]].append(r["psf"])
#             context_data["price_history_by_year"] = {
#                 str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
#             }
#             context_data["price_history_recent"] = [
#                 {"year": r["sale_year"], "month": r["sale_month"], "psf": r["psf"], "transactions": r["cnt"]}
#                 for r in history[-6:]
#             ]

#         # 6. Catalysts
#         catalysts = fetch_area_catalysts(area_id)
#         if catalysts:
#             context_data["area_catalysts"] = catalysts

#         # 7. Top projects
#         projects = fetch_dld_projects(area_id)
#         if projects:
#             context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

#     # ── Top areas / compare / market overview ──
#     if any(w in msg_lower for w in ["best area", "top area", "highest yield", "compare", "market", "overview", "which area", "invest", "yield", "rental", "rank", "buy", "best", "which", "recommend", "suggest"]):
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             for area in top[:3]:
#                 area_name = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     stats = fetch_area_stats(matched_id)
#                     catalysts = fetch_area_catalysts(matched_id)
#                     history = fetch_price_history(matched_id)
#                     if stats:
#                         prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
#                         room_map = defaultdict(list)
#                         worth_map = defaultdict(list)
#                         BEDROOM_KEYS_SMALL = {
#                             "0": "Studio", "0.0": "Studio",
#                             "1": "1 BR",   "1.0": "1 BR",
#                             "2": "2 BR",   "2.0": "2 BR",
#                             "3": "3 BR",   "3.0": "3 BR",
#                         }
#                         for r in stats:
#                             rooms = str(r.get("rooms_en", ""))
#                             label = BEDROOM_KEYS_SMALL.get(rooms)
#                             if not label:
#                                 continue
#                             if r.get("price_per_sqm"):
#                                 room_map[label].append(float(r["price_per_sqm"]))
#                             if r.get("actual_worth"):
#                                 worth_map[label].append(float(r["actual_worth"]))
#                         context_data[f"area_detail_{key}"] = {
#                             "area_name": area_name,
#                             "avg_psm": round(sum(prices) / len(prices), 0) if prices else None,
#                             "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                             "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#                             "catalysts": [{"name": c["name"], "date": c["expected_date"], "confidence": c["confidence"]} for c in (catalysts or [])[:3]],
#                             "price_history": {str(r["sale_year"]): r["psf"] for r in (history or [])[-6:]},
#                         }

#                       # ── General buyer/lifestyle queries — auto-fetch top areas ──
#     BUYER_KEYWORDS = [
#         "buy home", "buy a home", "buy house", "buy a house", "buy property",
#         "buy apartment", "buy flat", "luxury home", "affordable home",
#         "where to buy", "how to buy", "can i buy", "can we buy",
#         "invest in dubai", "moving to dubai", "relocating to dubai",
#         "best place to live", "where to live", "home in dubai",
#         "property in dubai", "apartment in dubai", "villa in dubai",
#         "indian buy", "expat buy", "foreigner buy", "freehold",
#         "who can buy", "can anyone buy", "us citizen buy", "buy new home",
#         "home in dubai price", "buy home in dubai",
#     ]
#     is_buyer_query = any(w in msg_lower for w in BUYER_KEYWORDS)

#     if is_buyer_query and "top_areas" not in context_data:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             context_data["buyer_query_mode"] = True
#             for area in top[:5]:
#                 area_name = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     stats = fetch_area_stats(matched_id)
#                     catalysts = fetch_area_catalysts(matched_id)
#                     if stats:
#                         prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
#                         worth_map = defaultdict(list)
#                         BEDROOM_KEYS_SMALL = {
#                             "0": "Studio", "0.0": "Studio",
#                             "1": "1 BR",   "1.0": "1 BR",
#                             "2": "2 BR",   "2.0": "2 BR",
#                             "3": "3 BR",   "3.0": "3 BR",
#                         }
#                         for r in stats:
#                             rooms = str(r.get("rooms_en", ""))
#                             label = BEDROOM_KEYS_SMALL.get(rooms)
#                             if label and r.get("actual_worth"):
#                                 worth_map[label].append(float(r["actual_worth"]))
#                         context_data[f"area_detail_{key}"] = {
#                             "area_name": area_name,
#                             "investment_score": area.get("investment_score"),
#                             "verdict": area.get("verdict"),
#                             "gross_yield_pct": area.get("gross_yield_pct"),
#                             "price_trend_pct": area.get("price_trend_pct"),
#                             "avg_psm": round(sum(prices) / len(prices), 0) if prices else None,
#                             "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#                             "catalysts": [{"name": c["name"], "type": c["catalyst_type"], "confidence": c["confidence"]} for c in (catalysts or [])[:2]],
#                         }  

#     # ── Signals ──
#     if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
#         signals = fetch_signals()
#         if signals:
#             context_data["live_signals"] = signals[:10]

#     # ── Yield vs Dubai average note ──
#     intel_for_rank = context_data.get("area_intelligence", {})
#     if intel_for_rank.get("gross_yield_pct"):
#         diff = round(intel_for_rank["gross_yield_pct"] - 6.1, 1)
#         direction = f"+{diff}%" if diff >= 0 else f"{diff}%"
#         context_data["yield_vs_avg_note"] = (
#             f"This area yields {direction} vs Dubai average of 6.1%. "
#             + ("Above average — strong rental income." if diff >= 0 else "Below average — price appreciation play.")
#         )

#     # ── Build prompt ──
#     has_db_data = bool(context_data)

#     system = """You are ACQAR's AI analytics assistant for Dubai real estate.
# You have access to 365,000+ real DLD transactions, area intelligence scores, price history, developer track records, catalyst timelines, and historical shock resilience data.

# Respond ONLY in this exact JSON format — no markdown, no extra text outside the JSON:
# {
#   "reply": "USE THESE EXACT EMOJI SECTION HEADERS SEPARATED BY BLANK LINES:\\n\\n📊 MARKET OVERVIEW\\n[investment score X/100, verdict BUY/HOLD/WATCH, gross yield X.X% vs Dubai avg 6.1%, price trend direction, ranking, distress %]\\n\\n💰 PRICING\\n[avg PSM, min-max range, avg property worth in AED. Then PSM per bedroom: Studio AED X,XXX/sqm · 1BR AED X,XXX/sqm · 2BR AED X,XXX/sqm · 3BR AED X,XXX/sqm. Then median closed-sale totals from real DLD transactions: Studio AED XM · 1BR AED XM · 2BR AED XM · 3BR AED XM]\\n\\n🏗️ DEVELOPERS & PROJECTS\\n[list each developer on its own line: Name — X% on-time · X★ rating · avg delay X months · X projects delivered. If on_time_pct < 70 add: ⚠️ DELAY RISK — factor in avg X-month delay for off-plan. Then active project count and pipeline names.]\\n\\n📈 PRICE HISTORY\\n[year by year: 2021: AED X,XXX → 2022: AED X,XXX → ... showing trend direction clearly]\\n\\n⚡ CATALYSTS\\n[each catalyst on its own line: • Name (Type) — Date — Confidence — Expected impact on yield/price]\\n\\n🛡️ RESILIENCE\\n[each shock: • Event (Period): X% price impact, recovered in X months via Driver]\\n\\n📉 WORST CASE\\n[Only include when verdict is BUY. Use historical_shock_resilience data. Format: In past shocks this zone dropped X% and recovered in X months via [driver]. If a similar shock repeats: ~AED X,XXX/sqm downside, recovery by approx [estimated year].]\\n\\n✅ VERDICT\\n[Clear BUY/HOLD/WATCH with 2-3 specific data-backed reasons. End with yield_vs_avg_note if available.]",
#   "charts": [
#     {"title": "Price by Bedroom (AED/sqm)", "type": "bar", "data": [{"label": "Studio", "value": 0}, {"label": "1 BR", "value": 0}, {"label": "2 BR", "value": 0}, {"label": "3 BR", "value": 0}]},
#     {"title": "Price History by Year (AED/sqft)", "type": "line", "data": [{"label": "2021", "value": 0}, {"label": "2022", "value": 0}, {"label": "2023", "value": 0}, {"label": "2024", "value": 0}, {"label": "2025", "value": 0}]},
#     {"title": "Developer On-Time Delivery %", "type": "bar", "data": [{"label": "Developer Name", "value": 0}]}
#   ],
#   "insight": "one key actionable takeaway for an investor or buyer — must reference a specific number from the data",
#   "data_source": "Acqar AVM · 365K+ DLD Transactions · Area Intelligence"
# }

# STRICT RULES:
# - reply MUST contain ALL sections that have data — never skip a section if data exists
# - Every section uses the exact emoji header shown
# - charts array MUST have all 3 charts populated with real numbers from the data
# - bedroom chart: use bedroom_avg_psm values
# - price history chart: use price_history_by_year values — label=year string, value=avg psf
# - developer chart: use developer_track_records on_time_pct — label=developer_name, value=on_time_pct
# - If a chart has no data, remove it from the array entirely
# - FORMAT: prices as AED X,XXX · yields as X.X% · scores as XX/100 · total prices as AED X.XXM
# - DEVELOPER RISK FLAG: if any developer has on_time_pct < 70, add "⚠️ DELAY RISK: [Name] delivered only X% on time — factor in avg X-month delay for off-plan purchases."
# - MEDIAN TOTAL PRICE: always show median_total_price_by_bedroom from transaction_stats in the PRICING section. Label them clearly as "Median transaction prices (real DLD closed sales, not asking prices)"
# - WORST CASE BLOCK: include 📉 WORST CASE section for every BUY verdict, using historical_shock_resilience data. If no shock data exists, omit the section entirely — do not fabricate figures.
# - YIELD NOTE: always end the VERDICT section with the yield_vs_avg_note if present in context data
# - IF NO DB DATA: answer from expert knowledge, mark as estimates, still use section headers
# - For general "best area / which area / recommend / buy" queries: list each recommended area as its own mini-report. Format: "🏙️ AREA NAME\\n📊 MARKET OVERVIEW\\n[data]\\n\\n💰 PRICING\\n[data]\\n\\n⚡ CATALYSTS\\n[data]\\n\\n✅ VERDICT\\n[reason]\\n\\n---\\n\\n🏙️ NEXT AREA NAME\\n..." repeat for top 3 areas
# - Use area_detail_* keys to populate each area's real numbers — bedroom_avg_psm + median_total_price_by_bedroom for pricing, catalysts for catalysts, price_history for trend
# - For multi-area responses, charts: chart 1 = investment scores comparison (bar, label=area_name, value=investment_score), chart 2 = yield comparison (bar, label=area_name, value=gross_yield_pct)
# - BUYER QUERY MODE: when buyer_query_mode is True in context data, respond with top 5 areas comparison using area_detail_* keys. For each area show: "🏙️ AREA NAME\\nScore: XX/100 · Verdict: BUY/HOLD · Yield: X.X% · Avg PSM: AED X,XXX\\nMedian prices — 1BR: AED XM · 2BR: AED XM · 3BR: AED XM\\nTop catalyst: [name]\\n\\n". End with 🔢 COMPARISON TABLE listing all 5 areas side by side. Always use real numbers from area_detail_* — never market knowledge estimates."""

#     user_prompt = f"""User question: {message}

# {"Full data context from Acqar database:" if has_db_data else "NOTE: No specific database data found for this query. Use your expert Dubai real estate knowledge to answer in detail. State that figures are based on market knowledge, not live data."}
# {json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"}

# Give a detailed, analytical answer like a senior Dubai real estate analyst. {"Use all available data above — reference specific numbers from the data, especially median_total_price_by_bedroom for total price figures and yield_vs_avg_note for the yield context." if has_db_data else "Use your Dubai real estate expertise. Be specific and helpful."}"""

#     try:
#         response = client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[
#                 {"role": "system", "content": system},
#                 {"role": "user", "content": user_prompt},
#             ],
#             temperature=0.3,
#             max_tokens=8192,
#         )
#         raw = response.choices[0].message.content.strip()

#         result = extract_json(raw)
#         result["type"] = "structured"

#         # ── Expose key signals as top-level fields for frontend hero card ──
#         intel = context_data.get("area_intelligence", {})
#         if intel:
#             result["score"]        = intel.get("investment_score")
#             result["verdict"]      = intel.get("verdict")
#             result["yield_pct"]    = intel.get("gross_yield_pct")
#             result["price_trend"]  = intel.get("price_trend_pct")
#             result["ranking"]      = intel.get("ranking_rank")
#             result["distress_pct"] = intel.get("distress_pct")

#             y = intel.get("gross_yield_pct")
#             if y:
#                 result["yield_vs_dubai_avg"] = round(y - 6.1, 2)

#         return result

#     except Exception as e:
#         # ── Print full traceback to Railway logs ──
#         print("=" * 60)
#         print("INTELLIGENCE CHAT ERROR")
#         print(f"Message: {message}")
#         print(f"Error: {str(e)}")
#         print(f"Raw response preview: {raw[:500] if raw else 'EMPTY - Gemini never responded'}")
#         print(traceback.format_exc())
#         print("=" * 60)

#         return {
#             "type": "text",
#             "reply": "I encountered an error processing your query. Please try rephrasing or ask about a specific Dubai area like 'Tell me about JVC' or 'Best areas for rental yield'.",
#             "chart_type": "none",
#             "chart_data": [],
#             "insight": "",
#             "data_source": "",
#         }










# import os
# import json
# import traceback

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict

# from cerebras.cloud.sdk import Cerebras
# client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))

# router = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")

# SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
# SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


# class ChatRequest(BaseModel):
#     message: str


# AREA_ID_MAP = {
#     "dubai marina": 36, "marina": 36,
#     "jumeirah village circle": 59, "jvc": 59,
#     "downtown dubai": 10, "downtown": 10,
#     "business bay": 54,
#     "palm jumeirah": 410, "palm": 410,
#     "jumeirah": 23,
#     "deira": 545, "bur dubai": 345,
#     "silicon oasis": 91,
#     "dubai hills estate": 53, "dubai hills": 53,
#     "al barsha": 105, "mirdif": 232, "arjan": 91,
#     "discovery gardens": 13, "international city": 368,
#     "town square": 386, "difc": 117,
#     "bluewaters island": 1754, "bluewaters": 1754,
#     "dubai south": 3355, "al furjan": 41,
#     "motor city": 268, "dubai sports city": 67, "sports city": 67,
#     "dubai creek harbour": 1509, "creek harbour": 1509,
#     "al jaddaf": 1509, "jaddaf": 1509,
#     "jumeirah lake towers": 12, "jlt": 12,
#     "arabian ranches 3": 16296, "arabian ranches 2": 133, "arabian ranches": 133,
#     "damac hills 2": 352, "damac hills": 352,
#     "barsha heights": 25, "tecom": 25, "the greens": 25, "greens": 25,
#     "al quoz": 293, "al satwa": 1347, "satwa": 1347,
#     "al karama": 271, "karama": 271,
#     "meydan": 43, "palm jebel ali": 1519, "palm jabal ali": 411,
#     "dubai islands": 5178, "expo city": 85082,
#     "dubai internet city": 1621, "dubai media city": 95,
#     "dubai production city": 5036, "impz": 5036,
#     "jumeirah golf estates": 347, "jumeirah park": 73,
#     "dubailand": 51, "tilal al ghaf": 5173,
#     "damac lagoons": 75266, "dubai harbour": 3512,
#     "oud metha": 388, "nad al sheba": 161,
#     "culture village": 190, "jaddaf waterfront": 190,
#     "burj khalifa": 390, "green community": 673,
#     "dubai design district": 22688, "d3": 22688,
#     "al mamzer": 231, "mamzer": 231,
#     "al garhoud": 378, "garhoud": 378,
#     "dubai festival city": 277, "festival city": 277,
#     "port saeed": 240, "hor al anz": 233,
#     "muhaisnah": 1793, "al nahda": 355, "nahda": 355,
#     "nad al hamar": 1045, "ras al khor": 1036,
#     "al rashidiya": 2418, "rashidiya": 2418,
#     "al wasl": 914, "wasl": 914,
#     "pearl jumeirah": 344, "um suqaim": 229,
#     "jumeirah second": 375, "jumeirah third": 318, "jumeirah first": 317,
#     "al manara": 315, "al saffa": 313,
# }

# # ── Lifestyle keyword → best matching area IDs ────────────────────
# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 133],        # Dubai Hills, Jumeirah, Arabian Ranches
#     "british school": [53, 105, 23], # Dubai Hills, Al Barsha, Jumeirah
#     "british community": [53, 23, 73], # Dubai Hills, Jumeirah, Jumeirah Park
#     "expat": [36, 53, 59],           # Marina, Dubai Hills, JVC
#     "family": [53, 133, 73],         # Dubai Hills, Arabian Ranches, Jumeirah Park
#     "school": [53, 105, 23],         # Dubai Hills, Al Barsha, Jumeirah
#     "villa": [133, 53, 73],          # Arabian Ranches, Dubai Hills, Jumeirah Park
#     "safe": [53, 133, 73],
#     "quiet": [53, 133, 232],
#     "kids": [53, 133, 73],
#     "children": [53, 133, 73],
#     "community": [53, 133, 23],
# }

# def get_area_id(msg_lower: str):
#     for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             return area_id, keyword
#     return None, None

# def get_lifestyle_areas(msg_lower: str):
#     """Return list of area_ids for lifestyle/community queries."""
#     matched = []
#     for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             for aid in area_ids:
#                 if aid not in matched:
#                     matched.append(aid)
#     return matched[:3]  # max 3 areas

# def median_millions(lst: list):
#     if not lst:
#         return None
#     s = sorted(lst)
#     n = len(s)
#     return round(s[n // 2] / 1_000_000, 2)

# def extract_json(raw: str) -> dict:
#     import re
#     raw = raw.strip()
#     if "```" in raw:
#         parts = raw.split("```")
#         for part in parts:
#             part = part.strip()
#             if part.startswith("json"):
#                 part = part[4:].strip()
#             if part.startswith("{"):
#                 raw = part
#                 break
#     start = raw.find("{")
#     end = raw.rfind("}")
#     if start != -1 and end != -1 and end > start:
#         raw = raw[start:end+1]

#     # Fix literal newlines/tabs inside JSON strings (LLM often emits these)
#     def fix_string_newlines(m):
#         inner = m.group(1)
#         inner = inner.replace(chr(13)+chr(10), chr(92)+"n")
#         inner = inner.replace(chr(13), chr(92)+"n")
#         inner = inner.replace(chr(10), chr(92)+"n")
#         inner = inner.replace(chr(9), chr(92)+"t")
#         return chr(34) + inner + chr(34)
#     raw = re.sub(r'"((?:[^"\\]|\\.)*)"', fix_string_newlines, raw, flags=re.DOTALL)

#     return json.loads(raw)

# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, total_area_ha, completion_rate, "
#             "residential_units, parks_info, retail_info, active_project_count, "
#             "buyer_nationalities, key_developers, active_project_names, "
#             "tx_7d, tx_7d_delta_pct, distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except:
#         return None

# def fetch_area_stats(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "area_name_en, price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month, instance_date"
#         ).eq("area_id", area_id).limit(1000).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_price_history(area_id: int):
#     try:
#         res = supabase_chat.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_area_catalysts(area_id: int):
#     try:
#         res = supabase_chat.table("area_catalysts").select(
#             "area_name_en, catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(10).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_developer_track_records(developer_names: list):
#     try:
#         if not developer_names:
#             return []
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase_chat.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_area_shock_impacts(zone_type: str):
#     try:
#         if not zone_type:
#             return []
#         res = supabase_chat.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_dld_projects(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "project_name_en"
#         ).eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
#         if not res.data:
#             return []
#         proj_map = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 proj_map[r["project_name_en"]] += 1
#         return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
#     except:
#         return []

# def fetch_top_areas_intelligence():
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(20).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_signals():
#     try:
#         if not SIGNALS_API:
#             return []
#         import requests
#         r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
#         return r.json() if r.status_code == 200 else []
#     except:
#         return []

# def build_area_detail(area_id: int, area_name: str, intel: dict = None) -> dict:
#     """Fetch full stats for one area and return a detail dict."""
#     stats = fetch_area_stats(area_id)
#     catalysts = fetch_area_catalysts(area_id)
#     history = fetch_price_history(area_id)

#     detail = {
#         "area_name": area_name,
#         "area_id": area_id,
#     }
#     if intel:
#         detail["investment_score"] = intel.get("investment_score")
#         detail["verdict"] = intel.get("verdict")
#         detail["gross_yield_pct"] = intel.get("gross_yield_pct")
#         detail["price_trend_pct"] = intel.get("price_trend_pct")

#     if stats:
#         prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
#         BEDROOM_KEYS = {
#             "0": "Studio", "0.0": "Studio",
#             "1": "1 BR", "1.0": "1 BR",
#             "2": "2 BR", "2.0": "2 BR",
#             "3": "3 BR", "3.0": "3 BR",
#         }
#         room_map = defaultdict(list)
#         worth_map = defaultdict(list)
#         for r in stats:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 if r.get("price_per_sqm"):
#                     room_map[label].append(float(r["price_per_sqm"]))
#                 if r.get("actual_worth"):
#                     worth_map[label].append(float(r["actual_worth"]))
#         detail["avg_psm"] = round(sum(prices) / len(prices), 0) if prices else None
#         detail["bedroom_avg_psm"] = {k: round(sum(v) / len(v), 0) for k, v in room_map.items()}
#         detail["median_total_price_by_bedroom"] = {k: median_millions(v) for k, v in worth_map.items()}

#     if catalysts:
#         detail["catalysts"] = [
#             {"name": c["name"], "type": c.get("catalyst_type"), "confidence": c.get("confidence")}
#             for c in catalysts[:3]
#         ]

#     if history:
#         year_avg = defaultdict(list)
#         for r in history:
#             year_avg[r["sale_year"]].append(r["psf"])
#         detail["price_history"] = {str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())}

#     return detail


# # ── Vague/general query detector ─────────────────────────────────
# VAGUE_PATTERNS = [
#     "just landed", "new to dubai", "moving to dubai", "relocating",
#     "want to buy", "looking to buy", "thinking of buying", "interested in buying",
#     "buy property", "buy a property", "buy properties", "buy real estate",
#     "invest in dubai", "where should i", "help me find", "guide me",
#     "i dont know", "i don't know", "not sure", "any suggestions",
#     "what should", "where to start", "first time",
# ]

# CLARIFYING_QUESTIONS = {
#     "type": "clarify",
#     "reply": "Welcome to Dubai! To find the right property for you, I need a few quick details:\n\n1. What is your budget? (e.g. AED 1M-2M, AED 2M-5M, AED 5M+)\n2. Are you buying to live in or as an investment for rental income?\n3. Any lifestyle preferences? (beach/marina, city centre, family community with schools, villa vs apartment)\n4. How many bedrooms do you need?\n\nOnce I know these, I'll pull real transaction data and give you a shortlist of the best areas with actual prices.",
#     "charts": [],
#     "insight": "",
#     "is_clarifying": True,
# }



# def is_vague_query(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     """Return True if query is too vague to fetch meaningful data."""
#     if area_id or is_lifestyle:
#         return False
#     # Must match a vague pattern AND have no specific area/data intent
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield", "price", "psm", "sqm", "trend", "compare", "vs",
#         "score", "invest", "return", "roi", "catalyst", "developer",
#         "jvc", "marina", "downtown", "hills", "bay", "palm",
#     ])
#     word_count = len(msg_lower.split())
#     # Vague if: matches pattern and no specific data keywords and short message
#     return has_vague and not has_specific and word_count < 20


# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question."}

#     msg_lower = message.lower()
#     context_data = {}
#     raw = ""

#     # ── 1. Detect explicit area name ──────────────────────────────
#     area_id, detected_area = get_area_id(msg_lower)

#     # ── 2. Detect lifestyle/community query (no explicit area) ────
#     lifestyle_area_ids = []
#     LIFESTYLE_KEYWORDS = ["british", "expat", "family", "school", "villa", "community", "kids", "children", "safe", "quiet"]
#     is_lifestyle_query = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)

#     # ── 2b. Detect vague query — return clarifying questions immediately ──
#     if is_vague_query(msg_lower, area_id, is_lifestyle_query):
#         return CLARIFYING_QUESTIONS

#     if is_lifestyle_query and not area_id:
#         lifestyle_area_ids = get_lifestyle_areas(msg_lower)
#         context_data["query_type"] = "lifestyle"
#         context_data["lifestyle_keywords"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]

#     # ── 3. Fetch single area data ─────────────────────────────────
#     if area_id:
#         context_data["detected_area"] = detected_area
#         context_data["area_id"] = area_id

#         intel = fetch_area_intelligence(area_id)
#         if intel:
#             context_data["area_intelligence"] = intel
#             devs = intel.get("key_developers") or []
#             if devs:
#                 dev_records = fetch_developer_track_records(devs)
#                 if dev_records:
#                     context_data["developer_track_records"] = dev_records
#             zone = intel.get("zone_type")
#             if zone:
#                 shocks = fetch_area_shock_impacts(zone)
#                 if shocks:
#                     context_data["historical_shock_resilience"] = shocks

#         area_data = fetch_area_stats(area_id)
#         if area_data:
#             prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#             worths = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]
#             BEDROOM_KEYS = {
#                 "0": "Studio", "0.0": "Studio",
#                 "1": "1 BR", "1.0": "1 BR",
#                 "2": "2 BR", "2.0": "2 BR",
#                 "3": "3 BR", "3.0": "3 BR",
#                 "4": "4 BR", "4.0": "4 BR",
#             }
#             room_map = defaultdict(list)
#             worth_map = defaultdict(list)
#             for r in area_data:
#                 label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#                 if label:
#                     if r.get("price_per_sqm"):
#                         room_map[label].append(float(r["price_per_sqm"]))
#                     if r.get("actual_worth"):
#                         worth_map[label].append(float(r["actual_worth"]))
#             year_map = defaultdict(list)
#             for r in area_data:
#                 if r.get("sale_year") and r.get("price_per_sqm"):
#                     year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))
#             context_data["transaction_stats"] = {
#                 "count": len(area_data),
#                 "avg_price_sqm": round(sum(prices) / len(prices), 0) if prices else None,
#                 "min_price_sqm": round(min(prices), 0) if prices else None,
#                 "max_price_sqm": round(max(prices), 0) if prices else None,
#                 "avg_worth_aed": round(sum(worths) / len(worths), 0) if worths else None,
#                 "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                 "yearly_avg_psm": {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
#                 "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#             }

#         history = fetch_price_history(area_id)
#         if history:
#             year_avg = defaultdict(list)
#             for r in history:
#                 year_avg[r["sale_year"]].append(r["psf"])
#             context_data["price_history_by_year"] = {
#                 str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
#             }
#             context_data["price_history_recent"] = [
#                 {"year": r["sale_year"], "month": r["sale_month"], "psf": r["psf"], "transactions": r["cnt"]}
#                 for r in history[-6:]
#             ]

#         catalysts = fetch_area_catalysts(area_id)
#         if catalysts:
#             context_data["area_catalysts"] = catalysts

#         projects = fetch_dld_projects(area_id)
#         if projects:
#             context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

#     # ── 4. Fetch lifestyle areas (multi-area for community queries) ──
#     if lifestyle_area_ids:
#         area_name_map = {v: k for k, v in AREA_ID_MAP.items()}
#         for lid in lifestyle_area_ids:
#             intel = fetch_area_intelligence(lid)
#             area_name = intel.get("area_name_en") if intel else area_name_map.get(lid, str(lid))
#             key = area_name.replace(" ", "_").lower()
#             context_data[f"lifestyle_area_{key}"] = build_area_detail(lid, area_name, intel)

#     # ── 5. Top areas / compare / market overview ──────────────────
#     MARKET_KEYWORDS = ["best area", "top area", "highest yield", "compare", "market", "overview",
#                        "which area", "invest", "yield", "rental", "rank", "best", "which",
#                        "recommend", "suggest"]
#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle_query:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             for area in top[:3]:
#                 area_name = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

#     # ── 6. General buyer queries ──────────────────────────────────
#     BUYER_KEYWORDS = [
#         "buy home", "buy a home", "buy house", "buy a house", "buy property",
#         "buy apartment", "buy flat", "luxury home", "affordable home",
#         "where to buy", "how to buy", "can i buy", "can we buy",
#         "invest in dubai", "moving to dubai", "relocating to dubai",
#         "best place to live", "where to live", "home in dubai",
#         "property in dubai", "apartment in dubai", "villa in dubai",
#         "freehold", "who can buy", "can anyone buy",
#     ]
#     is_buyer_query = any(w in msg_lower for w in BUYER_KEYWORDS)

#     if is_buyer_query and not is_lifestyle_query and "top_areas" not in context_data:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             context_data["buyer_query_mode"] = True
#             for area in top[:5]:
#                 area_name = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

#     # ── 7. Signals ────────────────────────────────────────────────
#     if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
#         signals = fetch_signals()
#         if signals:
#             context_data["live_signals"] = signals[:10]

#     # ── 8. Yield vs Dubai average ─────────────────────────────────
#     intel_for_rank = context_data.get("area_intelligence", {})
#     if intel_for_rank.get("gross_yield_pct"):
#         diff = round(intel_for_rank["gross_yield_pct"] - 6.1, 1)
#         direction = f"+{diff}%" if diff >= 0 else f"{diff}%"
#         context_data["yield_vs_avg_note"] = (
#             f"This area yields {direction} vs Dubai average of 6.1%. "
#             + ("Above average — strong rental income." if diff >= 0 else "Below average — price appreciation play.")
#         )

#     # ── Build prompt ──────────────────────────────────────────────
#     has_db_data = bool(context_data)

#     # FIX: System prompt no longer leaks instructions into the reply example
#     system = """You are ACQAR's AI analytics assistant for Dubai real estate.
# You have access to 365,000+ real DLD transactions, area intelligence scores, price history, developer track records, catalyst timelines, and historical shock resilience data.

# You MUST respond ONLY with valid JSON. No text before or after the JSON. No markdown fences.

# The JSON must have this exact shape:
# {
#   "reply": "<full response as a plain string using \\n for newlines>",
#   "charts": [],
#   "insight": "<one actionable takeaway with a specific number>"
# }

# HOW TO WRITE THE REPLY STRING:
# - Start with the emoji section header on its own line, then the content below it
# - Sections available (use only those with real data):
#     📊 MARKET OVERVIEW
#     💰 PRICING
#     🏗️ DEVELOPERS & PROJECTS
#     📈 PRICE HISTORY
#     ⚡ CATALYSTS
#     🛡️ RESILIENCE
#     📉 WORST CASE
#     ✅ VERDICT
# - For lifestyle/community queries (british, expat, family, school): use 🏙️ AREA NAME as a section header for each recommended area, then sub-sections below it
# - Separate each section with a blank line (\\n\\n)
# - Never write the word "NONE", "not available", "N/A" for a whole section — omit the section entirely if no data exists
# - Do NOT echo any instructions into the reply — only write actual data and analysis

# CONTENT RULES:
# - 📊 MARKET OVERVIEW: investment score X/100, verdict BUY/HOLD/WATCH, gross yield X.X%, price trend, ranking, distress %
# - 💰 PRICING: avg PSM, min-max, avg worth. Then PSM by bedroom. Then median DLD closed-sale prices by bedroom
# - 🏗️ DEVELOPERS: each developer on own line — Name · X% on-time · X★ · avg delay X months. Add ⚠️ if on_time_pct < 70
# - 📈 PRICE HISTORY: year → year showing direction e.g. 2021: AED 1,200 → 2022: AED 1,350 → 2023: AED 1,480
# - ⚡ CATALYSTS: bullet each catalyst with type, date, confidence, expected impact
# - 🛡️ RESILIENCE: bullet each shock event with price impact and recovery time
# - 📉 WORST CASE: only for BUY verdict, only if shock data exists — downside PSM and recovery estimate
# - ✅ VERDICT: BUY/HOLD/WATCH with 2-3 data-backed reasons. End with yield_vs_avg_note if available
# - For lifestyle queries: for each area write 🏙️ AREA NAME then explain why it fits the criteria (british schools, expat community, downtown access), then pricing, then verdict. Be specific and helpful like a senior analyst.

# CHART RULES (populate only with real numbers, remove chart if no data):
# - bedroom chart: bedroom_avg_psm values, type=bar
# - price history chart: price_history_by_year values, type=line
# - developer chart: on_time_pct per developer, type=bar
# - multi-area: investment_score comparison bar chart

# TOKEN LIMIT: Keep reply concise — max 800 words. Never pad with filler."""

#     user_prompt = f"""User question: {message}

# {"Database context (use these exact numbers — do not invent figures):" if has_db_data else "No specific DB data found. Use expert Dubai market knowledge and clearly state figures are estimates."}
# {json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"}

# Respond with JSON only."""

#     try:
#         response = client.chat.completions.create(
#         model="gpt-oss-120b",
#             messages=[
#                 {"role": "system", "content": system},
#                 {"role": "user", "content": user_prompt},
#             ],
#             temperature=0.2,
#             max_completion_tokens=3000,
        
#         )
#         raw = response.choices[0].message.content.strip()

#         result = extract_json(raw)
#         result["type"] = "structured"
#         result.pop("data_source", None)  # Remove data_source — frontend no longer shows it

#         intel = context_data.get("area_intelligence", {})
#         if intel:
#             result["score"]        = intel.get("investment_score")
#             result["verdict"]      = intel.get("verdict")
#             result["yield_pct"]    = intel.get("gross_yield_pct")
#             result["price_trend"]  = intel.get("price_trend_pct")
#             result["ranking"]      = intel.get("ranking_rank")
#             result["distress_pct"] = intel.get("distress_pct")
#             y = intel.get("gross_yield_pct")
#             if y:
#                 result["yield_vs_dubai_avg"] = round(y - 6.1, 2)

#         return result

#     except Exception as e:
#         print("=" * 60)
#         print("INTELLIGENCE CHAT ERROR")
#         print(f"Message: {message}")
#         print(f"Error: {str(e)}")
#         print(f"Raw response preview: {raw[:500] if raw else 'EMPTY'}")
#         print(traceback.format_exc())
#         print("=" * 60)

#         return {
#             "type": "text",
#             "reply": "I encountered an error processing your query. Please try again.",
#             "chart_type": "none",
#             "chart_data": [],
#             "insight": "",
#         }



















# import os
# import json
# import traceback

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict

# from cerebras.cloud.sdk import Cerebras
# client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))

# router = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")
# SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
# SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


# class ChatRequest(BaseModel):
#     message: str
#     history: list = []


# AREA_ID_MAP = {
#     "dubai marina": 36, "marina": 36,
#     "jumeirah village circle": 59, "jvc": 59,
#     "downtown dubai": 10, "downtown": 10,
#     "business bay": 54,
#     "palm jumeirah": 410, "palm": 410,
#     "jumeirah": 23,
#     "deira": 545, "bur dubai": 345,
#     "silicon oasis": 91,
#     "dubai hills estate": 53, "dubai hills": 53,
#     "al barsha": 105, "mirdif": 232, "arjan": 91,
#     "discovery gardens": 13, "international city": 368,
#     "town square": 386, "difc": 117,
#     "bluewaters island": 1754, "bluewaters": 1754,
#     "dubai south": 3355, "al furjan": 41,
#     "motor city": 268, "dubai sports city": 67, "sports city": 67,
#     "dubai creek harbour": 1509, "creek harbour": 1509,
#     "al jaddaf": 1509, "jaddaf": 1509,
#     "jumeirah lake towers": 12, "jlt": 12,
#     "arabian ranches 3": 16296, "arabian ranches 2": 133, "arabian ranches": 133,
#     "damac hills 2": 352, "damac hills": 352,
#     "barsha heights": 25, "tecom": 25, "the greens": 25, "greens": 25,
#     "al quoz": 293, "al satwa": 1347, "satwa": 1347,
#     "al karama": 271, "karama": 271,
#     "meydan": 43, "palm jebel ali": 1519, "palm jabal ali": 411,
#     "dubai islands": 5178, "expo city": 85082,
#     "dubai internet city": 1621, "dubai media city": 95,
#     "dubai production city": 5036, "impz": 5036,
#     "jumeirah golf estates": 347, "jumeirah park": 73,
#     "dubailand": 51, "tilal al ghaf": 5173,
#     "damac lagoons": 75266, "dubai harbour": 3512,
#     "oud metha": 388, "nad al sheba": 161,
#     "culture village": 190, "jaddaf waterfront": 190,
#     "burj khalifa": 390, "green community": 673,
#     "dubai design district": 22688, "d3": 22688,
#     "al mamzer": 231, "mamzer": 231,
#     "al garhoud": 378, "garhoud": 378,
#     "dubai festival city": 277, "festival city": 277,
#     "port saeed": 240, "hor al anz": 233,
#     "muhaisnah": 1793, "al nahda": 355, "nahda": 355,
#     "nad al hamar": 1045, "ras al khor": 1036,
#     "al rashidiya": 2418, "rashidiya": 2418,
#     "al wasl": 914, "wasl": 914,
#     "pearl jumeirah": 344, "um suqaim": 229,
#     "jumeirah second": 375, "jumeirah third": 318, "jumeirah first": 317,
#     "al manara": 315, "al saffa": 313,
# }

# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 133],
#     "british school": [53, 105, 23],
#     "british community": [53, 23, 73],
#     "expat": [36, 53, 59],
#     "family": [53, 133, 73],
#     "school": [53, 105, 23],
#     "villa": [133, 53, 73],
#     "safe": [53, 133, 73],
#     "quiet": [53, 133, 232],
#     "kids": [53, 133, 73],
#     "children": [53, 133, 73],
#     "community": [53, 133, 23],
#     "beach": [36, 410, 1754],
#     "beachfront": [36, 410, 1754],
#     "luxury": [10, 36, 410],
#     "affordable": [59, 386, 13],
#     "cheap": [59, 386, 13],
#     "metro": [12, 59, 25],
#     "investment": [59, 54, 36],
#     "rental income": [59, 36, 12],
#     "golf": [347, 53, 43],
#     "waterfront": [36, 1509, 3512],
#     "new": [1509, 5173, 75266],
#     "modern": [10, 54, 36],
# }

# def get_area_id(msg_lower: str):
#     for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             return area_id, keyword
#     return None, None

# def get_lifestyle_areas(msg_lower: str) -> list:
#     matched = []
#     for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             for aid in area_ids:
#                 if aid not in matched:
#                     matched.append(aid)
#     return matched[:3]

# def median_millions(lst: list):
#     if not lst:
#         return None
#     s = sorted(lst)
#     n = len(s)
#     return round(s[n // 2] / 1_000_000, 2)

# def extract_json(raw: str) -> dict:
#     import re
#     raw = raw.strip()
#     if "```" in raw:
#         parts = raw.split("```")
#         for part in parts:
#             part = part.strip()
#             if part.startswith("json"):
#                 part = part[4:].strip()
#             if part.startswith("{"):
#                 raw = part
#                 break
#     start = raw.find("{")
#     end = raw.rfind("}")
#     if start != -1 and end != -1 and end > start:
#         raw = raw[start:end+1]
#     def fix_string_newlines(m):
#         inner = m.group(1)
#         inner = inner.replace(chr(13)+chr(10), chr(92)+"n")
#         inner = inner.replace(chr(13), chr(92)+"n")
#         inner = inner.replace(chr(10), chr(92)+"n")
#         inner = inner.replace(chr(9), chr(92)+"t")
#         return chr(34) + inner + chr(34)
#     raw = re.sub(r'"((?:[^"\\]|\\.)*)"', fix_string_newlines, raw, flags=re.DOTALL)
#     return json.loads(raw)

# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, total_area_ha, completion_rate, "
#             "residential_units, parks_info, retail_info, active_project_count, "
#             "buyer_nationalities, key_developers, active_project_names, "
#             "tx_7d, tx_7d_delta_pct, distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except:
#         return None

# def fetch_area_stats(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "area_name_en, price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month, instance_date"
#         ).eq("area_id", area_id).limit(1000).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_price_history(area_id: int):
#     try:
#         res = supabase_chat.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_area_catalysts(area_id: int):
#     try:
#         res = supabase_chat.table("area_catalysts").select(
#             "area_name_en, catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(10).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_developer_track_records(developer_names: list):
#     try:
#         if not developer_names:
#             return []
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase_chat.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_area_shock_impacts(zone_type: str):
#     try:
#         if not zone_type:
#             return []
#         res = supabase_chat.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_dld_projects(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "project_name_en"
#         ).eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
#         if not res.data:
#             return []
#         proj_map = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 proj_map[r["project_name_en"]] += 1
#         return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
#     except:
#         return []

# def fetch_top_areas_intelligence():
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(20).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_signals():
#     try:
#         if not SIGNALS_API:
#             return []
#         import requests
#         r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
#         return r.json() if r.status_code == 200 else []
#     except:
#         return []

# def build_area_detail(area_id: int, area_name: str, intel: dict = None) -> dict:
#     stats = fetch_area_stats(area_id)
#     catalysts = fetch_area_catalysts(area_id)
#     history = fetch_price_history(area_id)
#     detail = {"area_name": area_name, "area_id": area_id}
#     if intel:
#         detail["investment_score"] = intel.get("investment_score")
#         detail["verdict"] = intel.get("verdict")
#         detail["gross_yield_pct"] = intel.get("gross_yield_pct")
#         detail["price_trend_pct"] = intel.get("price_trend_pct")
#         detail["ranking_rank"] = intel.get("ranking_rank")
#         detail["distress_pct"] = intel.get("distress_pct")
#     if stats:
#         prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
#         BEDROOM_KEYS = {
#             "0": "Studio", "0.0": "Studio",
#             "1": "1 BR", "1.0": "1 BR",
#             "2": "2 BR", "2.0": "2 BR",
#             "3": "3 BR", "3.0": "3 BR",
#             "4": "4 BR", "4.0": "4 BR",
#         }
#         room_map = defaultdict(list)
#         worth_map = defaultdict(list)
#         for r in stats:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 if r.get("price_per_sqm"):
#                     room_map[label].append(float(r["price_per_sqm"]))
#                 if r.get("actual_worth"):
#                     worth_map[label].append(float(r["actual_worth"]))
#         detail["avg_psm"] = round(sum(prices) / len(prices), 0) if prices else None
#         detail["bedroom_avg_psm"] = {k: round(sum(v) / len(v), 0) for k, v in room_map.items()}
#         detail["median_total_price_by_bedroom"] = {k: median_millions(v) for k, v in worth_map.items()}
#         detail["transaction_count"] = len(stats)
#     if catalysts:
#         detail["catalysts"] = [
#             {"name": c["name"], "type": c.get("catalyst_type"), "confidence": c.get("confidence"), "date": c.get("expected_date")}
#             for c in catalysts[:3]
#         ]
#     if history:
#         year_avg = defaultdict(list)
#         for r in history:
#             year_avg[r["sale_year"]].append(r["psf"])
#         detail["price_history"] = {str(y): round(sum(v)/len(v), 0) for y, v in sorted(year_avg.items())}
#     return detail

# CLARIFYING_QUESTIONS = {
#     "type": "clarify",
#     "reply": "Happy to help you find the right property in Dubai! I just need a few quick details to pull accurate data for you:\n\n1. What is your budget? (e.g. AED 1M-2M, AED 2M-5M, AED 5M+)\n2. Are you buying to live in or as an investment for rental income?\n3. Any lifestyle preferences? (beach/marina, city centre, family community with schools, villa vs apartment)\n4. How many bedrooms do you need?\n\nOnce I have these, I'll search our database of 365,000+ real DLD transactions and give you a data-backed shortlist with actual closed-sale prices — not just asking prices.",
#     "charts": [],
#     "insight": "",
#     "is_clarifying": True,
# }

# def is_vague_query(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle:
#         return False
#     VAGUE_PATTERNS = [
#         "just landed", "new to dubai", "moving to dubai", "relocating",
#         "want to buy", "looking to buy", "thinking of buying", "interested in buying",
#         "buy property", "buy a property", "buy properties", "buy real estate",
#         "invest in dubai", "where should i", "help me find", "guide me",
#         "i dont know", "i don't know", "not sure", "any suggestions",
#         "what should", "where to start", "first time",
#     ]
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield", "price", "psm", "sqm", "trend", "compare", "vs",
#         "score", "return", "roi", "catalyst", "developer",
#         "jvc", "marina", "downtown", "hills", "bay", "palm",
#         "bedroom", "studio", "1br", "2br", "3br", "aed",
#     ])
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question."}

#     msg_lower = message.lower()
#     context_data = {}
#     raw = ""

#     # ── 1. Detect area ────────────────────────────────────────────
#     area_id, detected_area = get_area_id(msg_lower)

#     # ── 2. Detect lifestyle ───────────────────────────────────────
#     lifestyle_area_ids = []
#     LIFESTYLE_KEYWORDS = [
#         "british", "expat", "family", "school", "villa", "community",
#         "kids", "children", "safe", "quiet", "beach", "beachfront",
#         "luxury", "affordable", "cheap", "metro", "golf", "waterfront",
#         "new", "modern", "rental income",
#     ]
#     is_lifestyle_query = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)

#     # ── 3. Vague check ────────────────────────────────────────────
#     if is_vague_query(msg_lower, area_id, is_lifestyle_query):
#         return CLARIFYING_QUESTIONS

#     # ── 4. Fetch lifestyle areas ──────────────────────────────────
#     if is_lifestyle_query and not area_id:
#         lifestyle_area_ids = get_lifestyle_areas(msg_lower)
#         context_data["query_type"] = "lifestyle"
#         context_data["lifestyle_keywords"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]

#     # ── 5. Fetch single area full report ──────────────────────────
#     if area_id:
#         context_data["detected_area"] = detected_area
#         context_data["area_id"] = area_id

#         intel = fetch_area_intelligence(area_id)
#         if intel:
#             context_data["area_intelligence"] = intel
#             devs = intel.get("key_developers") or []
#             if devs:
#                 dev_records = fetch_developer_track_records(devs)
#                 if dev_records:
#                     context_data["developer_track_records"] = dev_records
#             zone = intel.get("zone_type")
#             if zone:
#                 shocks = fetch_area_shock_impacts(zone)
#                 if shocks:
#                     context_data["historical_shock_resilience"] = shocks

#         area_data = fetch_area_stats(area_id)
#         if area_data:
#             prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#             worths = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]
#             BEDROOM_KEYS = {
#                 "0": "Studio", "0.0": "Studio",
#                 "1": "1 BR", "1.0": "1 BR",
#                 "2": "2 BR", "2.0": "2 BR",
#                 "3": "3 BR", "3.0": "3 BR",
#                 "4": "4 BR", "4.0": "4 BR",
#             }
#             room_map = defaultdict(list)
#             worth_map = defaultdict(list)
#             for r in area_data:
#                 label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#                 if label:
#                     if r.get("price_per_sqm"):
#                         room_map[label].append(float(r["price_per_sqm"]))
#                     if r.get("actual_worth"):
#                         worth_map[label].append(float(r["actual_worth"]))
#             year_map = defaultdict(list)
#             for r in area_data:
#                 if r.get("sale_year") and r.get("price_per_sqm"):
#                     year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))
#             context_data["transaction_stats"] = {
#                 "count": len(area_data),
#                 "avg_price_sqm": round(sum(prices)/len(prices), 0) if prices else None,
#                 "min_price_sqm": round(min(prices), 0) if prices else None,
#                 "max_price_sqm": round(max(prices), 0) if prices else None,
#                 "avg_worth_aed": round(sum(worths)/len(worths), 0) if worths else None,
#                 "bedroom_avg_psm": {k: round(sum(v)/len(v), 0) for k, v in room_map.items()},
#                 "yearly_avg_psm": {str(k): round(sum(v)/len(v), 0) for k, v in sorted(year_map.items())},
#                 "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#             }

#         history = fetch_price_history(area_id)
#         if history:
#             year_avg = defaultdict(list)
#             for r in history:
#                 year_avg[r["sale_year"]].append(r["psf"])
#             context_data["price_history_by_year"] = {
#                 str(y): round(sum(v)/len(v), 0) for y, v in sorted(year_avg.items())
#             }

#         catalysts = fetch_area_catalysts(area_id)
#         if catalysts:
#             context_data["area_catalysts"] = catalysts

#         projects = fetch_dld_projects(area_id)
#         if projects:
#             context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

#     # ── 6. Fetch lifestyle area details ───────────────────────────
#     if lifestyle_area_ids:
#         area_name_map = {v: k for k, v in AREA_ID_MAP.items()}
#         for lid in lifestyle_area_ids:
#             intel = fetch_area_intelligence(lid)
#             area_name = intel.get("area_name_en") if intel else area_name_map.get(lid, str(lid))
#             key = area_name.replace(" ", "_").lower()
#             context_data[f"lifestyle_area_{key}"] = build_area_detail(lid, area_name, intel)

#     # ── 7. Market overview / compare ──────────────────────────────
#     MARKET_KEYWORDS = [
#         "best area", "top area", "highest yield", "compare", "market",
#         "overview", "which area", "yield", "rental", "rank", "best",
#         "which", "recommend", "suggest", "vs", "versus",
#     ]
#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle_query:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             for area in top[:3]:
#                 area_name = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

#     # ── 8. Buyer queries ──────────────────────────────────────────
#     BUYER_KEYWORDS = [
#         "buy home", "buy a home", "buy house", "buy apartment", "buy flat",
#         "where to buy", "how to buy", "can i buy", "home in dubai",
#         "property in dubai", "apartment in dubai", "villa in dubai",
#         "freehold", "who can buy", "first home", "own property",
#     ]
#     is_buyer_query = any(w in msg_lower for w in BUYER_KEYWORDS)
#     if is_buyer_query and not is_lifestyle_query and "top_areas" not in context_data:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             context_data["buyer_query_mode"] = True
#             for area in top[:5]:
#                 area_name = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

#     # ── 9. Signals ────────────────────────────────────────────────
#     if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
#         signals = fetch_signals()
#         if signals:
#             context_data["live_signals"] = signals[:10]

#     # ── 10. Yield vs Dubai average ────────────────────────────────
#     intel_check = context_data.get("area_intelligence", {})
#     if intel_check.get("gross_yield_pct"):
#         diff = round(intel_check["gross_yield_pct"] - 6.1, 1)
#         sign = "+" if diff >= 0 else ""
#         context_data["yield_vs_avg_note"] = (
#             f"Yields {sign}{diff}% vs Dubai average of 6.1%. "
#             + ("Above average — strong rental income potential." if diff >= 0 else "Below average — price appreciation play.")
#         )

#     has_db_data = bool(context_data)

#     # ── Build system prompt ───────────────────────────────────────
#     system = """You are ACQAR Intelligence — Dubai's most data-driven real estate assistant.
# You have exclusive access to 365,000+ real DLD closed transactions (not asking prices), area investment scores, price history, developer track records with delay data, catalyst timelines, and historical shock resilience data.

# You MUST respond ONLY with valid JSON. No text before or after. No markdown fences.

# JSON shape:
# {
#   "reply": "<response as plain string, use \\n for newlines>",
#   "charts": [],
#   "insight": "<one sharp data-backed takeaway the user can act on>"
# }

# ═══════════════════════════════════════════
# RESPONSE STRUCTURE BY QUERY TYPE
# ═══════════════════════════════════════════

# ── TYPE 1: LIFESTYLE / BUYER QUERY (family, school, beach, british, expat, etc.) ──

# Structure:
# 🏆 TOP PICK: [AREA NAME]
# [2 sentences: why this is the #1 match for their specific needs]

# • [Specific reason 1 — name actual schools, drive times, landmarks]
# • [Specific reason 2 — community vibe, expat population, lifestyle]
# • [Specific reason 3 — commute/access with road name and minutes]

# 💰 Real Transaction Prices (DLD closed sales)
# [bedroom table: type | median price | price/sqm]

# ─────────────────────────────────────────
# 🏙️ OTHER STRONG OPTIONS

# [Area 2 name] — [1 line why it fits + key price]
# [Area 3 name] — [1 line why it fits + key price]

# Quick comparison:
# Area | Schools | Downtown | [key bedroom] Median
# [row 1]
# [row 2]  
# [row 3]

# ─────────────────────────────────────────
# 💡 ACQAR DATA EDGE
# [Something only real DLD data can show — e.g. "Median closed sale is X% below asking prices in this area" or "Transaction volume up X% this year — high demand signal"]

# ─────────────────────────────────────────
# To narrow this down further:
# 1. [Relevant follow-up question about budget/bedrooms]
# 2. [Relevant follow-up about ready vs off-plan or specific schools]
# 3. [Optional: about timeline or investment vs living]

# ── TYPE 2: SPECIFIC AREA REPORT (JVC, Marina, Downtown, etc.) ──

# Structure:
# [1-2 sentence opener about the area — what makes it distinctive right now]

# 📊 INVESTMENT SNAPSHOT
# Score: XX/100 · Verdict: BUY/HOLD/WATCH · Yield: X.X% · Trend: +X% YoY · Rank: #X in Dubai · Distress: X%

# 💰 TRANSACTION PRICES (Real DLD Data — not asking prices)
# Avg PSM: AED X,XXX · Range: AED X,XXX–X,XXX
# [bedroom breakdown: Studio · 1BR · 2BR · 3BR — PSM and median total]

# 📈 PRICE TREND
# [year → year with direction and % change, show momentum clearly]

# 🏗️ DEVELOPERS
# [Name · on-time % · star rating · avg delay. Flag ⚠️ if below 70%]

# ⚡ WHAT'S COMING
# [catalysts with dates and expected impact on prices/yield]

# 🛡️ RESILIENCE
# [past shocks and recovery — shows how safe the investment is]

# ✅ VERDICT
# [BUY/HOLD/WATCH — 2-3 sharp data-backed reasons. Include yield vs Dubai avg note if available]

# Want me to:
# • Compare [this area] with [nearby area]?
# • Show price trend for a specific bedroom type?
# • Calculate potential rental income?

# ── TYPE 3: BUDGET / BEDROOM SEARCH ──

# Structure:
# [opener: "Based on X DLD transactions, here are areas where you can find [X bed] under [budget]..."]

# 🏙️ [AREA 1] ✅ fits budget
# Best for: [1 line — what makes it good]
# [X]BR median closed sale: AED X.XM — AED [budget gap/surplus] [under/over] your budget
# Yield: X.X% · Score: XX/100

# 🏙️ [AREA 2] ✅ fits budget  
# [same format]

# 🏙️ [AREA 3] ✅ fits budget
# [same format]

# 📊 Side by side:
# Area | [X]BR Median | Yield | Score | Verdict
# [rows]

# 💡 ACQAR DATA EDGE
# [Something specific from the data — e.g. best value per sqm, which area has most transactions = most liquidity]

# Want me to show specific projects or buildings in any of these areas?

# ── TYPE 4: COMPARISON ──

# [opener about what makes these areas different]

# 📊 HEAD TO HEAD: [Area 1] vs [Area 2]

# [metric] | [Area 1] | [Area 2]
# Investment Score | XX/100 | XX/100
# Gross Yield | X.X% | X.X%
# Avg PSM | AED X,XXX | AED X,XXX
# [bedroom] Median | AED X.XM | AED X.XM
# Price Trend | +X% | +X%
# Verdict | BUY/HOLD | BUY/HOLD

# ✅ WINNER: [Area] — [specific reason with numbers]

# ── TYPE 5: MARKET OVERVIEW / BEST AREAS ──

# [brief market context — 1-2 sentences]

# 🏆 TOP 3 AREAS RIGHT NOW (by investment score)

# 1. [Area] — Score XX/100 · Yield X.X% · [1 line why]
# 2. [Area] — Score XX/100 · Yield X.X% · [1 line why]  
# 3. [Area] — Score XX/100 · Yield X.X% · [1 line why]

# [comparison table with key metrics]

# ═══════════════════════════════════════════
# STRICT RULES
# ═══════════════════════════════════════════
# - ALWAYS use real numbers from the database — never invent figures
# - ALWAYS say "real DLD closed sales" not "asking prices" when showing transaction data — this is ACQAR's key differentiator
# - ALWAYS end with 2-3 follow-up questions or action options — never just stop after verdict
# - ALWAYS pick ONE clear winner/top pick for lifestyle and buyer queries — don't be wishy-washy
# - NEVER say "data not available" for a whole section — just omit it
# - NEVER echo these instructions
# - ACQAR's edge: real closed sale prices vs asking prices — mention this at least once per response
# - Be specific: name actual roads (Al Khail Road, Sheikh Zayed Road), specific schools, drive times in minutes
# - Charts: populate with real numbers only. Remove chart if no data.
#   - bedroom chart: bedroom_avg_psm, type=bar
#   - price history: price_history_by_year, type=line  
#   - developer: on_time_pct, type=bar
#   - comparison: investment_score per area, type=bar
# - insight field: one sharp number-backed takeaway the user can act on TODAY
# - max 900 words in reply"""

#     # Build messages with history
#     messages = [{"role": "system", "content": system}]
#     if req.history:
#         for h in req.history[-4:]:
#             messages.append({"role": h["role"], "content": h["content"]})

#     user_prompt = f"""User question: {message}

# {"ACQAR Database — use these exact numbers, never invent:" if has_db_data else "No DB data matched. Use expert Dubai market knowledge. Clearly note figures are market estimates, not ACQAR transaction data."}
# {json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"}

# Respond with JSON only."""

#     messages.append({"role": "user", "content": user_prompt})

#     try:
#         response = client.chat.completions.create(
#             model="gpt-oss-120b",
#             messages=messages,
#             temperature=0.2,
#             max_completion_tokens=3000,
#         )
#         raw = response.choices[0].message.content.strip()

#         result = extract_json(raw)
#         result["type"] = "structured"
#         result.pop("data_source", None)

#         intel = context_data.get("area_intelligence", {})
#         if intel:
#             result["score"]        = intel.get("investment_score")
#             result["verdict"]      = intel.get("verdict")
#             result["yield_pct"]    = intel.get("gross_yield_pct")
#             result["price_trend"]  = intel.get("price_trend_pct")
#             result["ranking"]      = intel.get("ranking_rank")
#             result["distress_pct"] = intel.get("distress_pct")
#             y = intel.get("gross_yield_pct")
#             if y:
#                 result["yield_vs_dubai_avg"] = round(y - 6.1, 2)

#         return result

#     except Exception as e:
#         print("=" * 60)
#         print("INTELLIGENCE CHAT ERROR")
#         print(f"Message: {message}")
#         print(f"Error: {str(e)}")
#         print(f"Raw preview: {raw[:500] if raw else 'EMPTY'}")
#         print(traceback.format_exc())
#         print("=" * 60)

#         return {
#             "type": "text",
#             "reply": "I encountered an error. Please try again.",
#             "chart_type": "none",
#             "chart_data": [],
#             "insight": "",
#         }















# import os
# import re
# import json
# import traceback
# import requests

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict

# from cerebras.cloud.sdk import Cerebras

# client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))

# router = APIRouter()

# SUPABASE_URL      = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY      = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API       = os.getenv("SIGNALS_API_URL", "")
# SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
# SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

# supabase      = create_client(SUPABASE_URL, SUPABASE_KEY)
# supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


# class ChatRequest(BaseModel):
#     message: str
#     history: list = []


# # ─────────────────────────────────────────────────────────────────
# # AREA ID MAP  (keyword → area_id)
# # ─────────────────────────────────────────────────────────────────
# AREA_ID_MAP = {
#     "dubai marina": 36, "marina": 36,
#     "jumeirah village circle": 59, "jvc": 59,
#     "downtown dubai": 10, "downtown": 10,
#     "business bay": 54,
#     "palm jumeirah": 410, "palm": 410,
#     "jumeirah": 23,
#     "deira": 545, "bur dubai": 345,
#     "silicon oasis": 91, "dso": 91,
#     "dubai hills estate": 53, "dubai hills": 53,
#     "al barsha": 105, "mirdif": 232, "arjan": 91,
#     "discovery gardens": 13, "international city": 368,
#     "town square": 386, "difc": 117,
#     "bluewaters island": 1754, "bluewaters": 1754,
#     "dubai south": 3355, "al furjan": 41,
#     "motor city": 268, "dubai sports city": 67, "sports city": 67,
#     "dubai creek harbour": 1509, "creek harbour": 1509,
#     "al jaddaf": 1509, "jaddaf": 1509,
#     "jumeirah lake towers": 12, "jlt": 12,
#     "arabian ranches 3": 16296, "arabian ranches 2": 133, "arabian ranches": 133,
#     "damac hills 2": 352, "damac hills": 352,
#     "barsha heights": 25, "tecom": 25, "the greens": 25, "greens": 25,
#     "al quoz": 293, "al satwa": 1347, "satwa": 1347,
#     "al karama": 271, "karama": 271,
#     "meydan": 43, "palm jebel ali": 1519, "palm jabal ali": 411,
#     "dubai islands": 5178, "expo city": 85082,
#     "dubai internet city": 1621, "dubai media city": 95,
#     "dubai production city": 5036, "impz": 5036,
#     "jumeirah golf estates": 347, "jumeirah park": 73,
#     "dubailand": 51, "tilal al ghaf": 5173,
#     "damac lagoons": 75266, "dubai harbour": 3512,
#     "oud metha": 388, "nad al sheba": 161,
#     "culture village": 190, "jaddaf waterfront": 190,
#     "burj khalifa": 390, "green community": 673,
#     "dubai design district": 22688, "d3": 22688,
#     "al mamzer": 231, "mamzer": 231,
#     "al garhoud": 378, "garhoud": 378,
#     "dubai festival city": 277, "festival city": 277,
#     "port saeed": 240, "hor al anz": 233,
#     "muhaisnah": 1793, "al nahda": 355, "nahda": 355,
#     "nad al hamar": 1045, "ras al khor": 1036,
#     "al rashidiya": 2418, "rashidiya": 2418,
#     "al wasl": 914, "wasl": 914,
#     "pearl jumeirah": 344, "um suqaim": 229,
#     "jumeirah second": 375, "jumeirah third": 318, "jumeirah first": 317,
#     "al manara": 315, "al saffa": 313,
#     "creek": 1509, "harbour": 3512,
#     "the palm": 410, "palm island": 410,
#     "emaar beachfront": 3512,
#     "al khail": 53,
# }

# # ─────────────────────────────────────────────────────────────────
# # SCHOOLS DATA  (area_id → list of schools)
# # Hardcoded — real data, never hallucinated
# # ─────────────────────────────────────────────────────────────────
# SCHOOLS_BY_AREA = {
#     53: [  # Dubai Hills
#         {"name": "GEMS Wellington Academy – Al Khail", "curriculum": "British", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 55K–75K/yr"},
#         {"name": "Kings' School Al Barsha", "curriculum": "British", "rating": "Outstanding", "drive_min": 8, "fees_range": "AED 60K–85K/yr"},
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 15, "fees_range": "AED 45K–65K/yr"},
#         {"name": "GEMS World Academy", "curriculum": "IB", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 70K–95K/yr"},
#     ],
#     23: [  # Jumeirah
#         {"name": "Jumeirah English Speaking School (JESS)", "curriculum": "British", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 50K–70K/yr"},
#         {"name": "Dubai College", "curriculum": "British", "rating": "Outstanding", "drive_min": 8, "fees_range": "AED 65K–90K/yr"},
#         {"name": "The English College", "curriculum": "British", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 55K–75K/yr"},
#     ],
#     73: [  # Jumeirah Park
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 3, "fees_range": "AED 45K–65K/yr"},
#         {"name": "Regent International School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 40K–55K/yr"},
#     ],
#     36: [  # Dubai Marina
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 12, "fees_range": "AED 45K–65K/yr"},
#         {"name": "American School of Dubai", "curriculum": "American", "rating": "Outstanding", "drive_min": 15, "fees_range": "AED 60K–80K/yr"},
#         {"name": "Emirates International School – Meadows", "curriculum": "IB", "rating": "Good", "drive_min": 10, "fees_range": "AED 50K–70K/yr"},
#     ],
#     12: [  # JLT
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 45K–65K/yr"},
#         {"name": "Regent International School", "curriculum": "British", "rating": "Good", "drive_min": 6, "fees_range": "AED 40K–55K/yr"},
#         {"name": "Nord Anglia International School", "curriculum": "British/IB", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 65K–90K/yr"},
#     ],
#     105: [  # Al Barsha
#         {"name": "Kings' School Al Barsha", "curriculum": "British", "rating": "Outstanding", "drive_min": 3, "fees_range": "AED 60K–85K/yr"},
#         {"name": "GEMS World Academy", "curriculum": "IB", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 70K–95K/yr"},
#         {"name": "Dubai American Academy", "curriculum": "American", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 55K–75K/yr"},
#     ],
#     59: [  # JVC
#         {"name": "JSS International School", "curriculum": "IB/Indian", "rating": "Good", "drive_min": 5, "fees_range": "AED 30K–50K/yr"},
#         {"name": "Sunmarke School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 38K–55K/yr"},
#         {"name": "Arcadia School", "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 35K–48K/yr"},
#     ],
#     133: [  # Arabian Ranches
#         {"name": "Ranches Primary School", "curriculum": "British", "rating": "Good", "drive_min": 3, "fees_range": "AED 38K–52K/yr"},
#         {"name": "GEMS Winchester School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 42K–58K/yr"},
#         {"name": "Fairgreen International School", "curriculum": "IB", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 55K–75K/yr"},
#     ],
#     41: [  # Al Furjan
#         {"name": "The Arbor School", "curriculum": "British/IB", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 48K–65K/yr"},
#         {"name": "GEMS Founders School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 38K–52K/yr"},
#     ],
#     54: [  # Business Bay
#         {"name": "Hartland International School", "curriculum": "IB/British", "rating": "Good", "drive_min": 10, "fees_range": "AED 55K–80K/yr"},
#         {"name": "GEMS Wellington Primary", "curriculum": "British", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 50K–70K/yr"},
#     ],
#     10: [  # Downtown
#         {"name": "Hartland International School", "curriculum": "IB/British", "rating": "Good", "drive_min": 12, "fees_range": "AED 55K–80K/yr"},
#         {"name": "Swiss International Scientific School", "curriculum": "IB", "rating": "Outstanding", "drive_min": 15, "fees_range": "AED 70K–95K/yr"},
#     ],
#     347: [  # Jumeirah Golf Estates
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 45K–65K/yr"},
#         {"name": "Regent International School", "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 40K–55K/yr"},
#     ],
#     5173: [  # Tilal Al Ghaf
#         {"name": "Fairgreen International School", "curriculum": "IB", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 55K–75K/yr"},
#         {"name": "GEMS Winchester School", "curriculum": "British", "rating": "Good", "drive_min": 12, "fees_range": "AED 42K–58K/yr"},
#     ],
# }

# # ─────────────────────────────────────────────────────────────────
# # COMMUNITY PROFILES  (area_id → profile)
# # ─────────────────────────────────────────────────────────────────
# COMMUNITY_PROFILES = {
#     53:  {"vibe": "Master-planned family community", "dominant_expats": "British, Australian, European", "british_index": 9, "walkability": "High", "amenities": ["Dubai Hills Mall", "Golf course", "Hospitals", "Large parks", "Cycling tracks"], "family_score": 10, "lifestyle": "suburban-premium"},
#     23:  {"vibe": "Classic villa/townhouse residential", "dominant_expats": "British, Western expats", "british_index": 9, "walkability": "Medium", "amenities": ["Beach clubs", "Souk Madinat", "Jumeirah Mosque", "Boutique dining"], "family_score": 9, "lifestyle": "beachside-residential"},
#     73:  {"vibe": "Quiet suburban family community", "dominant_expats": "British, European families", "british_index": 9, "walkability": "Medium", "amenities": ["Community pools", "Parks", "Nearby schools", "Easy highway access"], "family_score": 9, "lifestyle": "suburban-quiet"},
#     133: {"vibe": "Gated villa community, very family-oriented", "dominant_expats": "British, South African, Australian", "british_index": 8, "walkability": "Low", "amenities": ["Community pools", "Ranches Souk", "Equestrian centre", "Parks"], "family_score": 10, "lifestyle": "gated-suburban"},
#     36:  {"vibe": "Urban waterfront, vibrant lifestyle", "dominant_expats": "British, European, mixed", "british_index": 7, "walkability": "Very High", "amenities": ["Marina Walk", "JBR Beach", "Metro", "Restaurants"], "family_score": 6, "lifestyle": "urban-waterfront"},
#     12:  {"vibe": "Affordable expat hub, good connectivity", "dominant_expats": "British, South Asian, mixed nationalities", "british_index": 6, "walkability": "High", "amenities": ["JLT Lake", "Metro", "Restaurants", "Retail"], "family_score": 6, "lifestyle": "urban-affordable"},
#     59:  {"vibe": "Affordable apartments, young professionals & families", "dominant_expats": "Mixed international expats", "british_index": 5, "walkability": "Medium", "amenities": ["Circle Mall", "Parks", "Nurseries"], "family_score": 7, "lifestyle": "suburban-affordable"},
#     105: {"vibe": "Well-established residential, schools hub", "dominant_expats": "British, Arab, mixed", "british_index": 7, "walkability": "Medium", "amenities": ["Mall of Emirates", "Metro", "Top schools"], "family_score": 8, "lifestyle": "suburban-established"},
#     10:  {"vibe": "Premium urban, iconic skyline", "dominant_expats": "Mixed high-income international", "british_index": 5, "walkability": "Very High", "amenities": ["Dubai Mall", "Burj Khalifa", "Opera", "Metro"], "family_score": 4, "lifestyle": "urban-luxury"},
#     54:  {"vibe": "Business hub, young professionals", "dominant_expats": "British, Indian, mixed professionals", "british_index": 6, "walkability": "High", "amenities": ["Canal walk", "Restaurants", "Metro"], "family_score": 5, "lifestyle": "urban-business"},
#     410: {"vibe": "Ultra-luxury island living", "dominant_expats": "High-net-worth international", "british_index": 7, "walkability": "Low", "amenities": ["Private beaches", "Nakheel Mall", "5-star hotels", "Marina"], "family_score": 7, "lifestyle": "ultra-luxury"},
#     41:  {"vibe": "Modern family community, growing area", "dominant_expats": "British, European, South Asian", "british_index": 7, "walkability": "Medium", "amenities": ["Ibn Battuta Mall", "Parks", "Community retail"], "family_score": 8, "lifestyle": "suburban-modern"},
#     347: {"vibe": "Golf & leisure lifestyle, exclusive", "dominant_expats": "European, British, mixed", "british_index": 7, "walkability": "Low", "amenities": ["Two golf courses", "Clubhouse", "Pools", "Tennis"], "family_score": 7, "lifestyle": "leisure-golf"},
#     1509:{"vibe": "New waterfront development, growing community", "dominant_expats": "Mixed international, young professionals", "british_index": 5, "walkability": "High", "amenities": ["Waterfront promenade", "Restaurants", "Retail"], "family_score": 6, "lifestyle": "waterfront-new"},
#     5173:{"vibe": "Luxury master community, new and modern", "dominant_expats": "Mixed high-income international", "british_index": 6, "walkability": "Medium", "amenities": ["Crystal Lagoon", "Parks", "Retail"], "family_score": 8, "lifestyle": "luxury-modern"},
#     117: {"vibe": "Financial hub, premium apartments", "dominant_expats": "Finance professionals, international", "british_index": 6, "walkability": "Very High", "amenities": ["Gate Avenue mall", "Restaurants", "Metro"], "family_score": 3, "lifestyle": "urban-financial"},
#     1754:{"vibe": "Waterfront island, luxury lifestyle", "dominant_expats": "Mixed high-income", "british_index": 6, "walkability": "Medium", "amenities": ["Ain Dubai", "Beach access", "Retail"], "family_score": 5, "lifestyle": "island-luxury"},
#     232: {"vibe": "Quiet suburban, established community", "dominant_expats": "Mixed Arab and Asian expats", "british_index": 4, "walkability": "Low", "amenities": ["Uptown Mirdif Mall", "Parks", "Schools"], "family_score": 7, "lifestyle": "suburban-quiet"},
#     386: {"vibe": "Affordable modern community", "dominant_expats": "Mixed expats, young families", "british_index": 4, "walkability": "Medium", "amenities": ["Town Square Park", "Retail", "Pools"], "family_score": 8, "lifestyle": "suburban-affordable"},
#     43:  {"vibe": "Premium equestrian and golf", "dominant_expats": "High-income mixed international", "british_index": 6, "walkability": "Low", "amenities": ["Meydan Racecourse", "Golf", "Restaurants"], "family_score": 6, "lifestyle": "leisure-premium"},
#     3512:{"vibe": "New luxury harbour development", "dominant_expats": "Mixed high-income international", "british_index": 5, "walkability": "High", "amenities": ["Harbour views", "Marina", "Retail", "Beaches"], "family_score": 5, "lifestyle": "luxury-waterfront"},
# }

# # ─────────────────────────────────────────────────────────────────
# # LIFESTYLE → AREA SCORING MAP
# # For any lifestyle keyword: best matching area_ids in priority order
# # ─────────────────────────────────────────────────────────────────
# LIFESTYLE_AREA_MAP = {
#     "british":          [53, 23, 73, 133, 12],
#     "british school":   [53, 73, 105, 23, 133],
#     "british community":[53, 23, 73, 133, 12],
#     "expat":            [36, 53, 59, 12, 54],
#     "family":           [53, 133, 73, 41, 386],
#     "school":           [53, 105, 73, 23, 133],
#     "villa":            [133, 53, 73, 347, 5173],
#     "safe":             [53, 133, 73, 41, 23],
#     "quiet":            [53, 133, 73, 232, 386],
#     "kids":             [53, 133, 73, 41, 386],
#     "children":         [53, 133, 73, 41, 386],
#     "community":        [53, 133, 73, 41, 23],
#     "beach":            [36, 410, 1754, 3512, 23],
#     "beachfront":       [410, 36, 1754, 3512, 23],
#     "luxury":           [10, 410, 117, 1754, 3512],
#     "affordable":       [59, 386, 13, 12, 41],
#     "cheap":            [59, 386, 13, 368, 232],
#     "budget":           [59, 386, 13, 41, 232],
#     "metro":            [12, 59, 25, 36, 54],
#     "investment":       [59, 54, 36, 12, 53],
#     "rental income":    [59, 36, 12, 54, 41],
#     "high yield":       [59, 12, 41, 386, 36],
#     "yield":            [59, 36, 12, 54, 41],
#     "golf":             [347, 53, 43, 133, 5173],
#     "waterfront":       [36, 1509, 3512, 1754, 410],
#     "marina":           [36, 1509, 3512, 410, 1754],
#     "new development":  [1509, 5173, 75266, 3512, 16296],
#     "modern":           [10, 54, 36, 1509, 5173],
#     "downtown access":  [54, 10, 36, 12, 53],
#     "city centre":      [10, 54, 117, 36, 12],
#     "off plan":         [1509, 5173, 75266, 16296, 3355],
#     "off-plan":         [1509, 5173, 75266, 16296, 3355],
#     "apartment":        [36, 59, 12, 54, 10],
#     "studio":           [59, 12, 36, 54, 25],
#     "townhouse":        [53, 133, 73, 41, 386],
#     "pet":              [53, 133, 73, 41, 36],
#     "pool":             [53, 133, 36, 410, 347],
#     "gym":              [36, 54, 12, 10, 53],
#     "furnished":        [36, 54, 10, 12, 117],
#     "short term":       [36, 10, 410, 54, 117],
#     "airbnb":           [36, 10, 410, 54, 117],
#     "holiday home":     [36, 10, 410, 1754, 3512],
#     "foreigner":        [36, 59, 12, 54, 53],
#     "freehold":         [36, 59, 12, 54, 53],
#     "first time":       [59, 41, 12, 386, 36],
#     "relocat":          [53, 36, 12, 23, 54],
#     "new to dubai":     [53, 36, 12, 23, 54],
# }

# # ─────────────────────────────────────────────────────────────────
# # INTENT DETECTION
# # ─────────────────────────────────────────────────────────────────
# INTENT_KEYWORDS = {
#     "investor":    ["yield", "roi", "return", "invest", "rental income", "capital", "appreciation", "off plan", "off-plan", "portfolio", "buy to let", "cash flow", "passive income", "gross yield", "net yield"],
#     "buyer":       ["buy", "purchase", "apartment", "villa", "townhouse", "flat", "home", "live", "move", "relocat", "freehold", "mortgage", "own", "2br", "3br", "1br", "studio", "bedroom"],
#     "renter":      ["rent", "lease", "monthly", "annually", "per year", "per month", "furnished", "unfurnished", "short term", "long term", "tenancy"],
#     "family":      ["family", "kids", "children", "school", "british school", "british community", "safe", "quiet", "playground", "nursery", "expat community"],
#     "luxury":      ["luxury", "ultra luxury", "penthouse", "5 star", "five star", "premium", "exclusive", "high end", "palm", "difc", "downtown"],
#     "comparison":  ["compare", "vs", "versus", "difference", "better", "which is", "between"],
#     "market":      ["market", "overview", "trend", "best area", "top area", "where to", "which area", "rank", "ranking", "2024", "2025", "2026"],
#     "developer":   ["developer", "emaar", "damac", "nakheel", "meraas", "aldar", "sobha", "ellington", "tiger", "azizi", "binghatti"],
#     "price":       ["price", "cost", "how much", "psm", "per sqm", "sqft", "per sqft", "median", "average price", "transaction"],
#     "visa":        ["visa", "golden visa", "residency", "uae visa", "property visa"],
#     "process":     ["how to buy", "process", "steps", "guide", "procedure", "dld", "registration", "transfer", "oqood", "noc"],
#     "signal":      ["signal", "alert", "news", "launch", "regulation", "rera", "law"],
# }

# def detect_intent(msg_lower: str) -> list:
#     """Returns list of matched intents, ordered by strength."""
#     scores = defaultdict(int)
#     for intent, keywords in INTENT_KEYWORDS.items():
#         for kw in keywords:
#             if kw in msg_lower:
#                 scores[intent] += 1
#     return sorted(scores.keys(), key=lambda x: -scores[x])

# def get_area_id(msg_lower: str):
#     for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             return area_id, keyword
#     return None, None

# def get_lifestyle_areas(msg_lower: str) -> list:
#     """Score areas by lifestyle keyword matches. Return top 3 area_ids."""
#     area_scores = defaultdict(int)
#     for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             for rank, aid in enumerate(area_ids):
#                 area_scores[aid] += (5 - rank)  # higher score for better match
#     return sorted(area_scores.keys(), key=lambda x: -area_scores[x])[:3]

# def extract_budget(msg: str) -> float | None:
#     """Extract budget in AED from message."""
#     msg_clean = msg.lower().replace(",", "").replace("aed", "")
#     patterns = [
#         r'(\d+\.?\d*)\s*(?:million|m)\b',
#         r'(\d{7,})',
#         r'(\d+\.?\d*)\s*(?:k)\b',
#     ]
#     for pat in patterns:
#         match = re.search(pat, msg_clean)
#         if match:
#             val = float(match.group(1))
#             if "k" in msg_clean[match.start():match.end()+1]:
#                 return val * 1_000
#             if val < 1000:
#                 return val * 1_000_000
#             return val
#     return None

# def extract_bedrooms(msg: str) -> str | None:
#     """Extract bedroom count from message."""
#     msg_lower = msg.lower()
#     patterns = [
#         (r'\bstudio\b', "Studio"),
#         (r'\b1\s*(?:br|bed|bedroom)\b', "1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b', "2 BR"),
#         (r'\b3\s*(?:br|bed|bedroom)\b', "3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b', "4 BR"),
#         (r'\bone\s*bedroom\b', "1 BR"),
#         (r'\btwo\s*bedroom\b', "2 BR"),
#         (r'\bthree\s*bedroom\b', "3 BR"),
#     ]
#     for pat, label in patterns:
#         if re.search(pat, msg_lower):
#             return label
#     return None


# # ─────────────────────────────────────────────────────────────────
# # HELPERS
# # ─────────────────────────────────────────────────────────────────
# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio",
#     "1": "1 BR",   "1.0": "1 BR",
#     "2": "2 BR",   "2.0": "2 BR",
#     "3": "3 BR",   "3.0": "3 BR",
#     "4": "4 BR",   "4.0": "4 BR",
# }

# def median_millions(lst: list):
#     if not lst:
#         return None
#     s = sorted(lst)
#     n = len(s)
#     return round(s[n // 2] / 1_000_000, 2)

# def extract_json(raw: str) -> dict:
#     raw = raw.strip()
#     if "```" in raw:
#         parts = raw.split("```")
#         for part in parts:
#             part = part.strip()
#             if part.startswith("json"):
#                 part = part[4:].strip()
#             if part.startswith("{"):
#                 raw = part
#                 break
#     start = raw.find("{")
#     end   = raw.rfind("}")
#     if start != -1 and end != -1 and end > start:
#         raw = raw[start:end+1]

#     def fix_string_newlines(m):
#         inner = m.group(1)
#         inner = inner.replace("\r\n", "\\n").replace("\r", "\\n").replace("\n", "\\n").replace("\t", "\\t")
#         return '"' + inner + '"'

#     raw = re.sub(r'"((?:[^"\\]|\\.)*)"', fix_string_newlines, raw, flags=re.DOTALL)
#     return json.loads(raw)


# # ─────────────────────────────────────────────────────────────────
# # DATABASE FETCH FUNCTIONS
# # ─────────────────────────────────────────────────────────────────
# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, total_area_ha, completion_rate, "
#             "residential_units, parks_info, retail_info, active_project_count, "
#             "buyer_nationalities, key_developers, active_project_names, "
#             "tx_7d, tx_7d_delta_pct, distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except:
#         return None

# def fetch_area_stats(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select(
#             "area_name_en, price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month, instance_date"
#         ).eq("area_id", area_id).limit(1000).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_price_history(area_id: int):
#     try:
#         res = supabase_chat.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_area_catalysts(area_id: int):
#     try:
#         res = supabase_chat.table("area_catalysts").select(
#             "area_name_en, catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(10).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_developer_track_records(developer_names: list):
#     try:
#         if not developer_names:
#             return []
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase_chat.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_area_shock_impacts(zone_type: str):
#     try:
#         if not zone_type:
#             return []
#         res = supabase_chat.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_dld_projects(area_id: int):
#     try:
#         res = supabase_chat.table("avm").select("project_name_en").eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
#         if not res.data:
#             return []
#         proj_map = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 proj_map[r["project_name_en"]] += 1
#         return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
#     except:
#         return []

# def fetch_top_areas_intelligence(limit: int = 20):
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type, distress_pct"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(limit).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_top_yield_areas():
#     try:
#         res = supabase_chat.table("area_intelligence").select(
#             "area_name_en, gross_yield_pct, investment_score, verdict, ranking_rank, truvalu_psm"
#         ).not_.is_("gross_yield_pct", "null").order("gross_yield_pct", desc=True).limit(10).execute()
#         return res.data or []
#     except:
#         return []

# def fetch_signals():
#     try:
#         if not SIGNALS_API:
#             return []
#         r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
#         return r.json() if r.status_code == 200 else []
#     except:
#         return []

# def fetch_developer_by_name(name: str):
#     try:
#         res = supabase_chat.table("developer_track_records").select("*").ilike("developer_name", f"%{name}%").limit(3).execute()
#         return res.data or []
#     except:
#         return []


# # ─────────────────────────────────────────────────────────────────
# # BUILD AREA DETAIL  (used for multi-area responses)
# # ─────────────────────────────────────────────────────────────────
# def build_area_detail(area_id: int, area_name: str, intel: dict = None) -> dict:
#     stats     = fetch_area_stats(area_id)
#     catalysts = fetch_area_catalysts(area_id)
#     history   = fetch_price_history(area_id)

#     detail = {"area_name": area_name, "area_id": area_id}

#     if intel:
#         for field in ["investment_score", "verdict", "gross_yield_pct", "price_trend_pct",
#                       "ranking_rank", "distress_pct", "active_project_count", "active_project_names"]:
#             if intel.get(field) is not None:
#                 detail[field] = intel[field]

#     if stats:
#         prices    = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
#         room_map  = defaultdict(list)
#         worth_map = defaultdict(list)
#         for r in stats:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 if r.get("price_per_sqm"):
#                     room_map[label].append(float(r["price_per_sqm"]))
#                 if r.get("actual_worth"):
#                     worth_map[label].append(float(r["actual_worth"]))
#         detail["avg_psm"]                      = round(sum(prices) / len(prices), 0) if prices else None
#         detail["bedroom_avg_psm"]              = {k: round(sum(v) / len(v), 0) for k, v in room_map.items()}
#         detail["median_total_price_by_bedroom"] = {k: median_millions(v) for k, v in worth_map.items()}
#         detail["transaction_count"]            = len(stats)

#     if catalysts:
#         detail["catalysts"] = [
#             {"name": c["name"], "type": c.get("catalyst_type"), "confidence": c.get("confidence"), "date": c.get("expected_date")}
#             for c in catalysts[:3]
#         ]

#     if history:
#         year_avg = defaultdict(list)
#         for r in history:
#             year_avg[r["sale_year"]].append(r["psf"])
#         detail["price_history"] = {str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())}

#     # Attach community profile + schools if available
#     if area_id in COMMUNITY_PROFILES:
#         detail["community_profile"] = COMMUNITY_PROFILES[area_id]
#     if area_id in SCHOOLS_BY_AREA:
#         detail["nearby_schools"] = SCHOOLS_BY_AREA[area_id]

#     return detail


# # ─────────────────────────────────────────────────────────────────
# # CLARIFYING QUESTIONS  (only for truly vague queries)
# # ─────────────────────────────────────────────────────────────────
# CLARIFYING_QUESTIONS = {
#     "type":          "clarify",
#     "is_clarifying": True,
#     "charts":        [],
#     "insight":       "",
#     "reply": (
#         "Happy to help you find the right property in Dubai! A few quick questions so I can pull accurate data:\n\n"
#         "1. What is your budget? (e.g. AED 1M–2M, AED 2M–5M, AED 5M+)\n"
#         "2. Are you buying to live in, or investing for rental income?\n"
#         "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
#         "4. How many bedrooms do you need?\n\n"
#         "Once I have these, I'll search our 365,000+ real DLD closed-sale transactions and give you a data-backed shortlist — not just asking prices."
#     ),
# }

# def is_vague_query(msg_lower: str, area_id, is_lifestyle: bool, intents: list) -> bool:
#     """Only trigger clarifying questions when the query is truly empty of direction."""
#     # If we have an area, lifestyle keyword, or strong intent — answer directly
#     if area_id or is_lifestyle:
#         return False
#     if any(i in intents for i in ["investor", "renter", "family", "luxury", "comparison", "market", "developer", "price", "visa", "process", "signal"]):
#         return False
#     VAGUE_PATTERNS = [
#         "just landed", "new to dubai", "moving to dubai", "relocating to dubai",
#         "want to buy", "looking to buy", "thinking of buying", "interested in buying",
#         "buy property in dubai", "invest in dubai", "where should i buy",
#         "help me find", "guide me", "i dont know", "i don't know",
#         "not sure", "any suggestions", "what should i buy", "where to start",
#     ]
#     has_vague   = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_context = len(msg_lower.split()) > 20 or any(w in msg_lower for w in [
#         "aed", "bedroom", "studio", "apartment", "villa", "yield", "price",
#         "school", "family", "beach", "cheap", "affordable", "luxury", "invest",
#     ])
#     return has_vague and not has_context


# # ─────────────────────────────────────────────────────────────────
# # SYSTEM PROMPT
# # ─────────────────────────────────────────────────────────────────
# SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's most data-driven real estate assistant.
# You have exclusive access to 365,000+ real DLD closed-sale transactions (not asking prices), area investment scores, price history, developer track records, catalyst timelines, community profiles, school data, and historical shock resilience.

# RESPOND ONLY with valid JSON. No text before or after. No markdown fences.

# JSON shape:
# {
#   "reply": "<full response as plain string, use \\n for newlines, never use actual newline characters inside the string>",
#   "charts": [],
#   "insight": "<one sharp, number-backed takeaway the user can act on TODAY>"
# }

# ═══════════════════════════════════════════════════════════════
# RESPONSE RULES — READ EVERY ONE BEFORE RESPONDING
# ═══════════════════════════════════════════════════════════════

# 1. ADAPT TO THE USER TYPE
#    - Family/lifestyle buyer → lead with community, schools, amenities. Investment data is secondary.
#    - Investor → lead with yield, score, trend, developer risk. Community profile is secondary.
#    - Renter → lead with rental ranges, which areas have most supply, service charges.
#    - First-time buyer → be warm and educational. Explain DLD, freehold, process clearly.
#    - Comparison → structured table with clear winner at the end.
#    - General Dubai question → answer it clearly and fully, then offer to go deeper.

# 2. NEVER HALLUCINATE
#    - Only use numbers from context_data. If a field is missing, say "data not available for this" — never invent a figure.
#    - Schools: ONLY use the nearby_schools list from context_data. Never invent school names.
#    - Community profiles: ONLY use community_profile from context_data. Never invent vibe or expat mix.
#    - If no DB data matched: say clearly "These are market estimates — for exact closed-sale data, ask me about a specific area."

# 3. ACQAR'S EDGE — MENTION ONCE PER RESPONSE
#    - Always distinguish: "These are real DLD closed-sale prices, not asking prices."
#    - If asking price gap data is available, state it as negotiation leverage.

# 4. ALWAYS PICK A WINNER
#    - For any query with multiple options, always say which is the best pick and WHY with a specific number.
#    - Never give a list of equal options with no recommendation. Be decisive.

# 5. SCHOOL RULES
#    - Only name schools from the nearby_schools data in context_data.
#    - If no school data in context: say "I have school data for [area] — ask me specifically about schools in [area]."
#    - Never say "British School Dubai" generically — use exact school names from data.

# 6. FAMILY QUERY RULE
#    - For family/British/school/expat/kids queries WITHOUT a specific area:
#      Top picks are: Dubai Hills Estate, Jumeirah, Jumeirah Park, Arabian Ranches, Al Furjan.
#      NEVER recommend Downtown Dubai as the top family pick.
#      Downtown is correct ONLY for investor/luxury/young professional queries.

# 7. BUDGET RULE
#    - If user_budget_aed is in context, check every area's median price.
#    - Flag areas above budget clearly: "⚠️ Above your AED X budget"
#    - Always include at least one option within budget.

# 8. PROCESS / HOW-TO QUESTIONS
#    - Answer these fully from your knowledge of Dubai real estate law.
#    - Include DLD registration fees (4%), agency fees (2%), NOC, transfer process, freehold vs leasehold.
#    - For mortgage: mention 20-25% down payment for expats, 15% for UAE nationals.
#    - For visa: AED 750K+ gets 2-year visa, AED 2M+ gets 10-year Golden Visa.

# 9. DEVELOPER QUESTIONS
#    - Use developer_track_records from context if available.
#    - If not in DB: answer from knowledge, flag as "market knowledge, not ACQAR verified."

# 10. RENTAL QUERIES
#     - Provide annual rental ranges per bedroom type when available.
#     - Always show gross yield = (annual rent / purchase price) × 100.
#     - Mention that Dubai has no income tax on rental income.

# 11. GENERAL DUBAI REAL ESTATE QUESTIONS
#     - Answer these fully: market outlook, freehold areas, who can buy, taxes, laws, etc.
#     - Use a conversational, confident tone — like a senior Dubai real estate advisor.
#     - Always end with a relevant follow-up offer.

# 12. RESPONSE FORMAT BY QUERY TYPE

# ── LIFESTYLE / FAMILY / COMMUNITY ──
# 🏆 TOP PICK: [AREA NAME]
# [2 sentences: why it's #1 for their specific needs]

# • [Specific reason 1: school names, drive times, KHDA ratings from nearby_schools data]
# • [Specific reason 2: community vibe, dominant_expats, amenities from community_profile]
# • [Specific reason 3: commute — road name and exact minutes to Downtown/key hubs]

# 💰 Real Transaction Prices (DLD closed sales — not asking prices)
# [bedroom | median price | price/sqm — from median_total_price_by_bedroom and bedroom_avg_psm]

# ─────────────────────────
# 🏙️ OTHER STRONG OPTIONS
# [Area 2]: [1 line why + key price]
# [Area 3]: [1 line why + key price]

# Quick comparison:
# Area | Community | Schools | Downtown | [bed] Median
# [row per area]

# ─────────────────────────
# 💡 ACQAR DATA EDGE
# [One specific DLD insight — e.g. asking vs closed-sale gap, transaction volume trend]

# To narrow down further:
# 1. [Budget/bedrooms question]
# 2. [Ready vs off-plan question]
# 3. [Specific school preference or lifestyle detail]

# ── SPECIFIC AREA REPORT ──
# [1-2 sentence opener: what makes this area distinctive RIGHT NOW]

# 📊 INVESTMENT SNAPSHOT
# Score: XX/100 · Verdict: BUY/HOLD/WATCH · Yield: X.X% · Trend: +X.X% · Rank: #X in Dubai · Distress: X%

# 💰 TRANSACTION PRICES (Real DLD closed sales)
# Avg PSM: AED X,XXX · Range: AED X,XXX–X,XXX
# [Studio · 1BR · 2BR · 3BR — PSM and median total from real data]

# 📈 PRICE TREND
# [year by year from price_history data — show direction clearly with → arrows]

# 🏗️ DEVELOPERS
# [Each on own line: Name · on-time X% · X★ · avg delay X months]
# [⚠️ DELAY RISK flag if on_time_pct < 70]

# ⚡ WHAT'S COMING
# [catalysts with date, confidence, expected impact]

# 🛡️ RESILIENCE
# [past shocks and recovery timeline]

# 🏡 COMMUNITY
# [community_profile vibe, dominant_expats, amenities — only if in context]

# 🏫 SCHOOLS NEARBY
# [Only from nearby_schools data — name, curriculum, rating, drive time, fees]

# ✅ VERDICT
# [BUY/HOLD/WATCH + 2-3 sharp data-backed reasons. End with yield vs Dubai avg if available.]

# Want me to:
# • [Relevant follow-up option 1]
# • [Relevant follow-up option 2]

# ── COMPARISON ──
# [opener: what fundamentally separates these two areas]

# 📊 HEAD TO HEAD: [Area A] vs [Area B]
# Metric | [Area A] | [Area B]
# Investment Score | | 
# Gross Yield | |
# Avg PSM | |
# [bed] Median | |
# Price Trend | |
# Community Fit | |
# Verdict | |

# ✅ WINNER: [Area] — [reason with specific numbers]

# ── BUDGET / BEDROOM SEARCH ──
# [opener: "Based on X DLD transactions, here's what AED X buys you in Dubai..."]

# 🏙️ [AREA 1] ✅ fits your budget
# [1 line what makes it good]
# [X]BR median: AED X.XM · Yield: X.X% · Score: XX/100
# [⚠️ ABOVE BUDGET flag if median > budget]

# [repeat for 3 areas]

# 📊 Side by side:
# Area | [X]BR Median | vs Budget | Yield | Score
# [rows]

# 💡 ACQAR DATA EDGE
# [specific insight from the data]

# ── INVESTOR / YIELD ──
# [opener: market context for investors]

# 🏆 TOP AREAS BY YIELD RIGHT NOW
# [Area] — X.X% yield · Score XX/100 · [1 line why]
# [ranked list of top 5]

# 📊 Yield comparison table
# Area | Yield | Score | Trend | Verdict

# 💰 What AED [budget if given] gets you:
# [Area]: [bed] median AED X.XM — [above/below budget] · X.X% yield

# ✅ BEST BET: [Area] — [reason with numbers]

# ── PROCESS / HOW-TO / VISA ──
# [Answer fully and clearly, no hedging]
# [Use numbered steps where appropriate]
# [Include exact fees, percentages, timelines]
# [End with relevant follow-up offer]

# ── GENERAL MARKET / NEWS / SIGNALS ──
# [Answer directly with available data]
# [Use live_signals if in context]
# [Give Dubai market context from your knowledge]
# [End with relevant follow-up offer]

# 13. CHARTS
#    - Only populate charts with real numbers from context_data — never invent values
#    - bedroom_avg_psm → bar chart "Price by Bedroom (AED/sqm)"
#    - price_history_by_year → line chart "Price History (AED/sqft)"
#    - developer on_time_pct → bar chart "Developer On-Time Delivery %"
#    - investment scores for multiple areas → bar chart "Investment Score Comparison"
#    - If no real data for a chart: remove it from array entirely

# 14. INSIGHT FIELD
#    - One sentence. Must contain a specific number. Must be actionable today.
#    - Example: "JVC 2BR median closed-sale price is AED 1.4M — 11% below current asking prices, giving you immediate negotiation leverage."

# 15. RESPONSE LENGTH
#    - Specific area report: full detail, all sections
#    - Lifestyle/family query: full TOP PICK + 2 alternatives + comparison table
#    - Simple question: concise and direct, 200-400 words
#    - Never pad with generic filler — every sentence must add value
#    - Max 1000 words in reply field"""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────
# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower = message.lower()
#     context_data: dict = {}
#     raw = ""

#     # ── Step 1: Detect area, intent, lifestyle, budget, bedrooms ──
#     area_id, detected_area = get_area_id(msg_lower)
#     intents               = detect_intent(msg_lower)
#     budget                = extract_budget(message)
#     bedrooms              = extract_bedrooms(message)

#     LIFESTYLE_KEYWORDS = [
#         "british", "expat", "family", "school", "villa", "community", "kids",
#         "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#         "cheap", "budget", "metro", "golf", "waterfront", "new development",
#         "modern", "downtown access", "off plan", "off-plan", "apartment",
#         "studio", "townhouse", "pet", "pool", "gym", "furnished", "short term",
#         "airbnb", "holiday home", "foreigner", "freehold", "first time",
#         "relocat", "new to dubai", "rental income", "high yield",
#     ]
#     is_lifestyle_query = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)

#     # ── Step 2: Vague check → clarifying questions ──
#     if is_vague_query(msg_lower, area_id, is_lifestyle_query, intents):
#         return CLARIFYING_QUESTIONS

#     # ── Step 3: Attach budget & bedroom to context ──
#     if budget:
#         context_data["user_budget_aed"]   = budget
#         context_data["user_budget_label"] = f"AED {budget/1_000_000:.1f}M"
#     if bedrooms:
#         context_data["user_bedrooms"] = bedrooms

#     # ── Step 4: Attach detected intents ──
#     if intents:
#         context_data["detected_intents"] = intents[:3]

#     # ── Step 5: Single area — full deep report ──
#     if area_id:
#         context_data["detected_area"] = detected_area
#         context_data["area_id"]       = area_id

#         intel = fetch_area_intelligence(area_id)
#         if intel:
#             context_data["area_intelligence"] = intel
#             devs = intel.get("key_developers") or []
#             if devs:
#                 dev_records = fetch_developer_track_records(devs)
#                 if dev_records:
#                     context_data["developer_track_records"] = dev_records
#             zone = intel.get("zone_type")
#             if zone:
#                 shocks = fetch_area_shock_impacts(zone)
#                 if shocks:
#                     context_data["historical_shock_resilience"] = shocks

#         area_data = fetch_area_stats(area_id)
#         if area_data:
#             prices    = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#             worths    = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]
#             room_map  = defaultdict(list)
#             worth_map = defaultdict(list)
#             year_map  = defaultdict(list)

#             for r in area_data:
#                 label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#                 if label:
#                     if r.get("price_per_sqm"):
#                         room_map[label].append(float(r["price_per_sqm"]))
#                     if r.get("actual_worth"):
#                         worth_map[label].append(float(r["actual_worth"]))
#                 if r.get("sale_year") and r.get("price_per_sqm"):
#                     year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#             context_data["transaction_stats"] = {
#                 "count":                         len(area_data),
#                 "avg_price_sqm":                 round(sum(prices) / len(prices), 0) if prices else None,
#                 "min_price_sqm":                 round(min(prices), 0) if prices else None,
#                 "max_price_sqm":                 round(max(prices), 0) if prices else None,
#                 "avg_worth_aed":                 round(sum(worths) / len(worths), 0) if worths else None,
#                 "bedroom_avg_psm":               {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                 "yearly_avg_psm":                {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
#                 "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#             }

#         history = fetch_price_history(area_id)
#         if history:
#             year_avg = defaultdict(list)
#             for r in history:
#                 year_avg[r["sale_year"]].append(r["psf"])
#             context_data["price_history_by_year"] = {
#                 str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
#             }

#         catalysts = fetch_area_catalysts(area_id)
#         if catalysts:
#             context_data["area_catalysts"] = catalysts

#         projects = fetch_dld_projects(area_id)
#         if projects:
#             context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

#         # Always attach community profile and schools for specific area
#         if area_id in COMMUNITY_PROFILES:
#             context_data["community_profile"] = COMMUNITY_PROFILES[area_id]
#         if area_id in SCHOOLS_BY_AREA:
#             context_data["nearby_schools"] = SCHOOLS_BY_AREA[area_id]

#     # ── Step 6: Lifestyle query — fetch top matching areas ──
#     if is_lifestyle_query and not area_id:
#         lifestyle_area_ids = get_lifestyle_areas(msg_lower)
#         context_data["query_type"]        = "lifestyle"
#         context_data["lifestyle_keywords"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         area_name_map = {v: k for k, v in AREA_ID_MAP.items()}
#         for lid in lifestyle_area_ids:
#             intel      = fetch_area_intelligence(lid)
#             area_name  = (intel.get("area_name_en") if intel else None) or area_name_map.get(lid, str(lid))
#             key        = area_name.replace(" ", "_").lower()
#             context_data[f"lifestyle_area_{key}"] = build_area_detail(lid, area_name, intel)

#     # ── Step 7: Yield-focused query ──
#     if any(w in msg_lower for w in ["yield", "rental yield", "highest yield", "best yield", "top yield", "rental income"]) and not area_id:
#         top_yield = fetch_top_yield_areas()
#         if top_yield:
#             context_data["top_yield_areas"] = top_yield

#     # ── Step 8: Market overview / comparison / best areas ──
#     MARKET_KEYWORDS = [
#         "best area", "top area", "highest yield", "compare", "market", "overview",
#         "which area", "rank", "best", "which", "recommend", "suggest", "vs", "versus",
#         "where to buy", "where should", "top 5", "top 3",
#     ]
#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle_query:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             for area in top[:3]:
#                 area_name  = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

#     # ── Step 9: Budget-based search — fetch areas matching budget ──
#     if budget and not area_id:
#         top = fetch_top_areas_intelligence(30)
#         if top:
#             context_data["budget_search_areas"] = top
#             for area in top[:5]:
#                 area_name  = area.get("area_name_en", "")
#                 matched_id = None
#                 for keyword, aid in AREA_ID_MAP.items():
#                     if keyword in area_name.lower() or area_name.lower() in keyword:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = area_name.replace(" ", "_").lower()
#                     if f"area_detail_{key}" not in context_data:
#                         context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

#     # ── Step 10: Developer query ──
#     DEVELOPER_NAMES = [
#         "emaar", "damac", "nakheel", "meraas", "aldar", "sobha", "ellington",
#         "tiger", "azizi", "binghatti", "danube", "reportage", "imtiaz",
#         "select group", "deyaar", "mag", "omniyat",
#     ]
#     for dev_name in DEVELOPER_NAMES:
#         if dev_name in msg_lower:
#             dev_data = fetch_developer_by_name(dev_name)
#             if dev_data:
#                 context_data["developer_info"] = dev_data

#     # ── Step 11: Signals / news / RERA ──
#     if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld", "law"]):
#         signals = fetch_signals()
#         if signals:
#             context_data["live_signals"] = signals[:10]

#     # ── Step 12: Yield vs Dubai average ──
#     intel_check = context_data.get("area_intelligence", {})
#     if intel_check.get("gross_yield_pct"):
#         diff = round(intel_check["gross_yield_pct"] - 6.1, 1)
#         sign = "+" if diff >= 0 else ""
#         context_data["yield_vs_avg_note"] = (
#             f"Yields {sign}{diff}% vs Dubai average of 6.1%. "
#             + ("Above average — strong rental income potential." if diff >= 0 else "Below average — price appreciation play.")
#         )

#     has_db_data = bool(context_data)

#     # ── Build messages ──
#     messages = [{"role": "system", "content": SYSTEM_PROMPT}]

#     if req.history:
#         for h in req.history[-4:]:
#             messages.append({"role": h["role"], "content": h["content"]})

#     db_label   = "ACQAR Database — use ONLY these numbers, never invent:" if has_db_data else "No specific DB data matched this query."
#     db_content = json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"
#     no_db_note = "" if has_db_data else "\nAnswer from expert Dubai real estate knowledge. Flag all figures as 'market estimates, not ACQAR transaction data.'"

#     user_prompt = f"""User question: {message}

# {db_label}{no_db_note}
# {db_content}

# Respond with valid JSON only. No markdown. No text outside the JSON."""

#     messages.append({"role": "user", "content": user_prompt})

#     # ── Call LLM ──
#     try:
#         response = client.chat.completions.create(
#             model="gpt-oss-120b",
#             messages=messages,
#             temperature=0.2,
#             max_completion_tokens=3000,
#         )
#         raw    = response.choices[0].message.content.strip()
#         result = extract_json(raw)
#         result["type"] = "structured"
#         result.pop("data_source", None)

#         # Attach hero metrics for frontend cards
#         intel = context_data.get("area_intelligence", {})
#         if intel:
#             result["score"]        = intel.get("investment_score")
#             result["verdict"]      = intel.get("verdict")
#             result["yield_pct"]    = intel.get("gross_yield_pct")
#             result["price_trend"]  = intel.get("price_trend_pct")
#             result["ranking"]      = intel.get("ranking_rank")
#             result["distress_pct"] = intel.get("distress_pct")
#             y = intel.get("gross_yield_pct")
#             if y:
#                 result["yield_vs_dubai_avg"] = round(y - 6.1, 2)

#         return result

#     except Exception as e:
#         print("=" * 60)
#         print("INTELLIGENCE CHAT ERROR")
#         print(f"Message : {message}")
#         print(f"Error   : {str(e)}")
#         print(f"Raw     : {raw[:500] if raw else 'EMPTY'}")
#         print(traceback.format_exc())
#         print("=" * 60)

#         return {
#             "type":       "text",
#             "reply":      "I hit an error processing that query. Please try again.",
#             "chart_type": "none",
#             "chart_data": [],
#             "insight":    "",
#         }








import os
import re
import json
import traceback
import requests

from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
from collections import defaultdict

from groq import Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

router = APIRouter()

SUPABASE_URL      = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY      = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SIGNALS_API       = os.getenv("SIGNALS_API_URL", "")
SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

supabase      = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


class ChatRequest(BaseModel):
    message: str
    history: list = []


# ─────────────────────────────────────────────────────────────────
# AREA ID MAP  (keyword → area_id)
# ─────────────────────────────────────────────────────────────────
AREA_ID_MAP = {
    "dubai marina": 36, "marina": 36,
    "jumeirah village circle": 59, "jvc": 59,
    "downtown dubai": 10, "downtown": 10,
    "business bay": 54,
    "palm jumeirah": 410, "palm": 410,
    "jumeirah": 23,
    "deira": 545, "bur dubai": 345,
    "silicon oasis": 91, "dso": 91,
    "dubai hills estate": 53, "dubai hills": 53,
    "al barsha": 105, "mirdif": 232, "arjan": 91,
    "discovery gardens": 13, "international city": 368,
    "town square": 386, "difc": 117,
    "bluewaters island": 1754, "bluewaters": 1754,
    "dubai south": 3355, "al furjan": 41,
    "motor city": 268, "dubai sports city": 67, "sports city": 67,
    "dubai creek harbour": 1509, "creek harbour": 1509,
    "al jaddaf": 1509, "jaddaf": 1509,
    "jumeirah lake towers": 12, "jlt": 12,
    "arabian ranches 3": 16296, "arabian ranches 2": 133, "arabian ranches": 133,
    "damac hills 2": 352, "damac hills": 352,
    "barsha heights": 25, "tecom": 25, "the greens": 25, "greens": 25,
    "al quoz": 293, "al satwa": 1347, "satwa": 1347,
    "al karama": 271, "karama": 271,
    "meydan": 43, "palm jebel ali": 1519, "palm jabal ali": 411,
    "dubai islands": 5178, "expo city": 85082,
    "dubai internet city": 1621, "dubai media city": 95,
    "dubai production city": 5036, "impz": 5036,
    "jumeirah golf estates": 347, "jumeirah park": 73,
    "dubailand": 51, "tilal al ghaf": 5173,
    "damac lagoons": 75266, "dubai harbour": 3512,
    "oud metha": 388, "nad al sheba": 161,
    "culture village": 190, "jaddaf waterfront": 190,
    "burj khalifa": 390, "green community": 673,
    "dubai design district": 22688, "d3": 22688,
    "al mamzer": 231, "mamzer": 231,
    "al garhoud": 378, "garhoud": 378,
    "dubai festival city": 277, "festival city": 277,
    "port saeed": 240, "hor al anz": 233,
    "muhaisnah": 1793, "al nahda": 355, "nahda": 355,
    "nad al hamar": 1045, "ras al khor": 1036,
    "al rashidiya": 2418, "rashidiya": 2418,
    "al wasl": 914, "wasl": 914,
    "pearl jumeirah": 344, "um suqaim": 229,
    "jumeirah second": 375, "jumeirah third": 318, "jumeirah first": 317,
    "al manara": 315, "al saffa": 313,
    "creek": 1509, "harbour": 3512,
    "the palm": 410, "palm island": 410,
    "emaar beachfront": 3512,
    "al khail": 53,
}

# ─────────────────────────────────────────────────────────────────
# SCHOOLS DATA  (area_id → list of schools)
# Hardcoded — real data, never hallucinated
# ─────────────────────────────────────────────────────────────────
SCHOOLS_BY_AREA = {
    53: [  # Dubai Hills
        {"name": "GEMS Wellington Academy – Al Khail", "curriculum": "British", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 55K–75K/yr"},
        {"name": "Kings' School Al Barsha", "curriculum": "British", "rating": "Outstanding", "drive_min": 8, "fees_range": "AED 60K–85K/yr"},
        {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 15, "fees_range": "AED 45K–65K/yr"},
        {"name": "GEMS World Academy", "curriculum": "IB", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 70K–95K/yr"},
    ],
    23: [  # Jumeirah
        {"name": "Jumeirah English Speaking School (JESS)", "curriculum": "British", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 50K–70K/yr"},
        {"name": "Dubai College", "curriculum": "British", "rating": "Outstanding", "drive_min": 8, "fees_range": "AED 65K–90K/yr"},
        {"name": "The English College", "curriculum": "British", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 55K–75K/yr"},
    ],
    73: [  # Jumeirah Park
        {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 3, "fees_range": "AED 45K–65K/yr"},
        {"name": "Regent International School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 40K–55K/yr"},
    ],
    36: [  # Dubai Marina
        {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 12, "fees_range": "AED 45K–65K/yr"},
        {"name": "American School of Dubai", "curriculum": "American", "rating": "Outstanding", "drive_min": 15, "fees_range": "AED 60K–80K/yr"},
        {"name": "Emirates International School – Meadows", "curriculum": "IB", "rating": "Good", "drive_min": 10, "fees_range": "AED 50K–70K/yr"},
    ],
    12: [  # JLT
        {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 45K–65K/yr"},
        {"name": "Regent International School", "curriculum": "British", "rating": "Good", "drive_min": 6, "fees_range": "AED 40K–55K/yr"},
        {"name": "Nord Anglia International School", "curriculum": "British/IB", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 65K–90K/yr"},
    ],
    105: [  # Al Barsha
        {"name": "Kings' School Al Barsha", "curriculum": "British", "rating": "Outstanding", "drive_min": 3, "fees_range": "AED 60K–85K/yr"},
        {"name": "GEMS World Academy", "curriculum": "IB", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 70K–95K/yr"},
        {"name": "Dubai American Academy", "curriculum": "American", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 55K–75K/yr"},
    ],
    59: [  # JVC
        {"name": "JSS International School", "curriculum": "IB/Indian", "rating": "Good", "drive_min": 5, "fees_range": "AED 30K–50K/yr"},
        {"name": "Sunmarke School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 38K–55K/yr"},
        {"name": "Arcadia School", "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 35K–48K/yr"},
    ],
    133: [  # Arabian Ranches
        {"name": "Ranches Primary School", "curriculum": "British", "rating": "Good", "drive_min": 3, "fees_range": "AED 38K–52K/yr"},
        {"name": "GEMS Winchester School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 42K–58K/yr"},
        {"name": "Fairgreen International School", "curriculum": "IB", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 55K–75K/yr"},
    ],
    41: [  # Al Furjan
        {"name": "The Arbor School", "curriculum": "British/IB", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 48K–65K/yr"},
        {"name": "GEMS Founders School", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 38K–52K/yr"},
    ],
    54: [  # Business Bay
        {"name": "Hartland International School", "curriculum": "IB/British", "rating": "Good", "drive_min": 10, "fees_range": "AED 55K–80K/yr"},
        {"name": "GEMS Wellington Primary", "curriculum": "British", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 50K–70K/yr"},
    ],
    10: [  # Downtown
        {"name": "Hartland International School", "curriculum": "IB/British", "rating": "Good", "drive_min": 12, "fees_range": "AED 55K–80K/yr"},
        {"name": "Swiss International Scientific School", "curriculum": "IB", "rating": "Outstanding", "drive_min": 15, "fees_range": "AED 70K–95K/yr"},
    ],
    347: [  # Jumeirah Golf Estates
        {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 45K–65K/yr"},
        {"name": "Regent International School", "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 40K–55K/yr"},
    ],
    5173: [  # Tilal Al Ghaf
        {"name": "Fairgreen International School", "curriculum": "IB", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 55K–75K/yr"},
        {"name": "GEMS Winchester School", "curriculum": "British", "rating": "Good", "drive_min": 12, "fees_range": "AED 42K–58K/yr"},
    ],
}

# ─────────────────────────────────────────────────────────────────
# COMMUNITY PROFILES  (area_id → profile)
# ─────────────────────────────────────────────────────────────────
COMMUNITY_PROFILES = {
    53:  {"vibe": "Master-planned family community", "dominant_expats": "British, Australian, European", "british_index": 9, "walkability": "High", "amenities": ["Dubai Hills Mall", "Golf course", "Hospitals", "Large parks", "Cycling tracks"], "family_score": 10, "lifestyle": "suburban-premium"},
    23:  {"vibe": "Classic villa/townhouse residential", "dominant_expats": "British, Western expats", "british_index": 9, "walkability": "Medium", "amenities": ["Beach clubs", "Souk Madinat", "Jumeirah Mosque", "Boutique dining"], "family_score": 9, "lifestyle": "beachside-residential"},
    73:  {"vibe": "Quiet suburban family community", "dominant_expats": "British, European families", "british_index": 9, "walkability": "Medium", "amenities": ["Community pools", "Parks", "Nearby schools", "Easy highway access"], "family_score": 9, "lifestyle": "suburban-quiet"},
    133: {"vibe": "Gated villa community, very family-oriented", "dominant_expats": "British, South African, Australian", "british_index": 8, "walkability": "Low", "amenities": ["Community pools", "Ranches Souk", "Equestrian centre", "Parks"], "family_score": 10, "lifestyle": "gated-suburban"},
    36:  {"vibe": "Urban waterfront, vibrant lifestyle", "dominant_expats": "British, European, mixed", "british_index": 7, "walkability": "Very High", "amenities": ["Marina Walk", "JBR Beach", "Metro", "Restaurants"], "family_score": 6, "lifestyle": "urban-waterfront"},
    12:  {"vibe": "Affordable expat hub, good connectivity", "dominant_expats": "British, South Asian, mixed nationalities", "british_index": 6, "walkability": "High", "amenities": ["JLT Lake", "Metro", "Restaurants", "Retail"], "family_score": 6, "lifestyle": "urban-affordable"},
    59:  {"vibe": "Affordable apartments, young professionals & families", "dominant_expats": "Mixed international expats", "british_index": 5, "walkability": "Medium", "amenities": ["Circle Mall", "Parks", "Nurseries"], "family_score": 7, "lifestyle": "suburban-affordable"},
    105: {"vibe": "Well-established residential, schools hub", "dominant_expats": "British, Arab, mixed", "british_index": 7, "walkability": "Medium", "amenities": ["Mall of Emirates", "Metro", "Top schools"], "family_score": 8, "lifestyle": "suburban-established"},
    10:  {"vibe": "Premium urban, iconic skyline", "dominant_expats": "Mixed high-income international", "british_index": 5, "walkability": "Very High", "amenities": ["Dubai Mall", "Burj Khalifa", "Opera", "Metro"], "family_score": 4, "lifestyle": "urban-luxury"},
    54:  {"vibe": "Business hub, young professionals", "dominant_expats": "British, Indian, mixed professionals", "british_index": 6, "walkability": "High", "amenities": ["Canal walk", "Restaurants", "Metro"], "family_score": 5, "lifestyle": "urban-business"},
    410: {"vibe": "Ultra-luxury island living", "dominant_expats": "High-net-worth international", "british_index": 7, "walkability": "Low", "amenities": ["Private beaches", "Nakheel Mall", "5-star hotels", "Marina"], "family_score": 7, "lifestyle": "ultra-luxury"},
    41:  {"vibe": "Modern family community, growing area", "dominant_expats": "British, European, South Asian", "british_index": 7, "walkability": "Medium", "amenities": ["Ibn Battuta Mall", "Parks", "Community retail"], "family_score": 8, "lifestyle": "suburban-modern"},
    347: {"vibe": "Golf & leisure lifestyle, exclusive", "dominant_expats": "European, British, mixed", "british_index": 7, "walkability": "Low", "amenities": ["Two golf courses", "Clubhouse", "Pools", "Tennis"], "family_score": 7, "lifestyle": "leisure-golf"},
    1509:{"vibe": "New waterfront development, growing community", "dominant_expats": "Mixed international, young professionals", "british_index": 5, "walkability": "High", "amenities": ["Waterfront promenade", "Restaurants", "Retail"], "family_score": 6, "lifestyle": "waterfront-new"},
    5173:{"vibe": "Luxury master community, new and modern", "dominant_expats": "Mixed high-income international", "british_index": 6, "walkability": "Medium", "amenities": ["Crystal Lagoon", "Parks", "Retail"], "family_score": 8, "lifestyle": "luxury-modern"},
    117: {"vibe": "Financial hub, premium apartments", "dominant_expats": "Finance professionals, international", "british_index": 6, "walkability": "Very High", "amenities": ["Gate Avenue mall", "Restaurants", "Metro"], "family_score": 3, "lifestyle": "urban-financial"},
    1754:{"vibe": "Waterfront island, luxury lifestyle", "dominant_expats": "Mixed high-income", "british_index": 6, "walkability": "Medium", "amenities": ["Ain Dubai", "Beach access", "Retail"], "family_score": 5, "lifestyle": "island-luxury"},
    232: {"vibe": "Quiet suburban, established community", "dominant_expats": "Mixed Arab and Asian expats", "british_index": 4, "walkability": "Low", "amenities": ["Uptown Mirdif Mall", "Parks", "Schools"], "family_score": 7, "lifestyle": "suburban-quiet"},
    386: {"vibe": "Affordable modern community", "dominant_expats": "Mixed expats, young families", "british_index": 4, "walkability": "Medium", "amenities": ["Town Square Park", "Retail", "Pools"], "family_score": 8, "lifestyle": "suburban-affordable"},
    43:  {"vibe": "Premium equestrian and golf", "dominant_expats": "High-income mixed international", "british_index": 6, "walkability": "Low", "amenities": ["Meydan Racecourse", "Golf", "Restaurants"], "family_score": 6, "lifestyle": "leisure-premium"},
    3512:{"vibe": "New luxury harbour development", "dominant_expats": "Mixed high-income international", "british_index": 5, "walkability": "High", "amenities": ["Harbour views", "Marina", "Retail", "Beaches"], "family_score": 5, "lifestyle": "luxury-waterfront"},
}

# ─────────────────────────────────────────────────────────────────
# LIFESTYLE → AREA SCORING MAP
# For any lifestyle keyword: best matching area_ids in priority order
# ─────────────────────────────────────────────────────────────────
LIFESTYLE_AREA_MAP = {
    "british":          [53, 23, 73, 133, 12],
    "british school":   [53, 73, 105, 23, 133],
    "british community":[53, 23, 73, 133, 12],
    "expat":            [36, 53, 59, 12, 54],
    "family":           [53, 133, 73, 41, 386],
    "school":           [53, 105, 73, 23, 133],
    "villa":            [133, 53, 73, 347, 5173],
    "safe":             [53, 133, 73, 41, 23],
    "quiet":            [53, 133, 73, 232, 386],
    "kids":             [53, 133, 73, 41, 386],
    "children":         [53, 133, 73, 41, 386],
    "community":        [53, 133, 73, 41, 23],
    "beach":            [36, 410, 1754, 3512, 23],
    "beachfront":       [410, 36, 1754, 3512, 23],
    "luxury":           [10, 410, 117, 1754, 3512],
    "affordable":       [59, 386, 13, 12, 41],
    "cheap":            [59, 386, 13, 368, 232],
    "budget":           [59, 386, 13, 41, 232],
    "metro":            [12, 59, 25, 36, 54],
    "investment":       [59, 54, 36, 12, 53],
    "rental income":    [59, 36, 12, 54, 41],
    "high yield":       [59, 12, 41, 386, 36],
    "yield":            [59, 36, 12, 54, 41],
    "golf":             [347, 53, 43, 133, 5173],
    "waterfront":       [36, 1509, 3512, 1754, 410],
    "marina":           [36, 1509, 3512, 410, 1754],
    "new development":  [1509, 5173, 75266, 3512, 16296],
    "modern":           [10, 54, 36, 1509, 5173],
    "downtown access":  [54, 10, 36, 12, 53],
    "city centre":      [10, 54, 117, 36, 12],
    "off plan":         [1509, 5173, 75266, 16296, 3355],
    "off-plan":         [1509, 5173, 75266, 16296, 3355],
    "apartment":        [36, 59, 12, 54, 10],
    "studio":           [59, 12, 36, 54, 25],
    "townhouse":        [53, 133, 73, 41, 386],
    "pet":              [53, 133, 73, 41, 36],
    "pool":             [53, 133, 36, 410, 347],
    "gym":              [36, 54, 12, 10, 53],
    "furnished":        [36, 54, 10, 12, 117],
    "short term":       [36, 10, 410, 54, 117],
    "airbnb":           [36, 10, 410, 54, 117],
    "holiday home":     [36, 10, 410, 1754, 3512],
    "foreigner":        [36, 59, 12, 54, 53],
    "freehold":         [36, 59, 12, 54, 53],
    "first time":       [59, 41, 12, 386, 36],
    "relocat":          [53, 36, 12, 23, 54],
    "new to dubai":     [53, 36, 12, 23, 54],
}

# ─────────────────────────────────────────────────────────────────
# INTENT DETECTION
# ─────────────────────────────────────────────────────────────────
INTENT_KEYWORDS = {
    "investor":    ["yield", "roi", "return", "invest", "rental income", "capital", "appreciation", "off plan", "off-plan", "portfolio", "buy to let", "cash flow", "passive income", "gross yield", "net yield"],
    "buyer":       ["buy", "purchase", "apartment", "villa", "townhouse", "flat", "home", "live", "move", "relocat", "freehold", "mortgage", "own", "2br", "3br", "1br", "studio", "bedroom"],
    "renter":      ["rent", "lease", "monthly", "annually", "per year", "per month", "furnished", "unfurnished", "short term", "long term", "tenancy"],
    "family":      ["family", "kids", "children", "school", "british school", "british community", "safe", "quiet", "playground", "nursery", "expat community"],
    "luxury":      ["luxury", "ultra luxury", "penthouse", "5 star", "five star", "premium", "exclusive", "high end", "palm", "difc", "downtown"],
    "comparison":  ["compare", "vs", "versus", "difference", "better", "which is", "between"],
    "market":      ["market", "overview", "trend", "best area", "top area", "where to", "which area", "rank", "ranking", "2024", "2025", "2026"],
    "developer":   ["developer", "emaar", "damac", "nakheel", "meraas", "aldar", "sobha", "ellington", "tiger", "azizi", "binghatti"],
    "price":       ["price", "cost", "how much", "psm", "per sqm", "sqft", "per sqft", "median", "average price", "transaction"],
    "visa":        ["visa", "golden visa", "residency", "uae visa", "property visa"],
    "process":     ["how to buy", "process", "steps", "guide", "procedure", "dld", "registration", "transfer", "oqood", "noc"],
    "signal":      ["signal", "alert", "news", "launch", "regulation", "rera", "law"],
}

def detect_intent(msg_lower: str) -> list:
    """Returns list of matched intents, ordered by strength."""
    scores = defaultdict(int)
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in msg_lower:
                scores[intent] += 1
    return sorted(scores.keys(), key=lambda x: -scores[x])

def get_area_id(msg_lower: str):
    for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
        if keyword in msg_lower:
            return area_id, keyword
    return None, None

def get_lifestyle_areas(msg_lower: str) -> list:
    """Score areas by lifestyle keyword matches. Return top 3 area_ids."""
    area_scores = defaultdict(int)
    for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
        if keyword in msg_lower:
            for rank, aid in enumerate(area_ids):
                area_scores[aid] += (5 - rank)  # higher score for better match
    return sorted(area_scores.keys(), key=lambda x: -area_scores[x])[:3]

def extract_budget(msg: str) -> float | None:
    """Extract budget in AED from message."""
    msg_clean = msg.lower().replace(",", "").replace("aed", "")
    patterns = [
        r'(\d+\.?\d*)\s*(?:million|m)\b',
        r'(\d{7,})',
        r'(\d+\.?\d*)\s*(?:k)\b',
    ]
    for pat in patterns:
        match = re.search(pat, msg_clean)
        if match:
            val = float(match.group(1))
            if "k" in msg_clean[match.start():match.end()+1]:
                return val * 1_000
            if val < 1000:
                return val * 1_000_000
            return val
    return None

def extract_bedrooms(msg: str) -> str | None:
    """Extract bedroom count from message."""
    msg_lower = msg.lower()
    patterns = [
        (r'\bstudio\b', "Studio"),
        (r'\b1\s*(?:br|bed|bedroom)\b', "1 BR"),
        (r'\b2\s*(?:br|bed|bedroom)\b', "2 BR"),
        (r'\b3\s*(?:br|bed|bedroom)\b', "3 BR"),
        (r'\b4\s*(?:br|bed|bedroom)\b', "4 BR"),
        (r'\bone\s*bedroom\b', "1 BR"),
        (r'\btwo\s*bedroom\b', "2 BR"),
        (r'\bthree\s*bedroom\b', "3 BR"),
    ]
    for pat, label in patterns:
        if re.search(pat, msg_lower):
            return label
    return None


# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────
BEDROOM_KEYS = {
    "0": "Studio", "0.0": "Studio",
    "1": "1 BR",   "1.0": "1 BR",
    "2": "2 BR",   "2.0": "2 BR",
    "3": "3 BR",   "3.0": "3 BR",
    "4": "4 BR",   "4.0": "4 BR",
}

def median_millions(lst: list):
    if not lst:
        return None
    s = sorted(lst)
    n = len(s)
    return round(s[n // 2] / 1_000_000, 2)

def extract_json(raw: str) -> dict:
    raw = raw.strip()
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                raw = part
                break
    start = raw.find("{")
    end   = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        raw = raw[start:end+1]

    def fix_string_newlines(m):
        inner = m.group(1)
        inner = inner.replace("\r\n", "\\n").replace("\r", "\\n").replace("\n", "\\n").replace("\t", "\\t")
        return '"' + inner + '"'

    raw = re.sub(r'"((?:[^"\\]|\\.)*)"', fix_string_newlines, raw, flags=re.DOTALL)
    return json.loads(raw)


# ─────────────────────────────────────────────────────────────────
# DATABASE FETCH FUNCTIONS
# ─────────────────────────────────────────────────────────────────
def fetch_area_intelligence(area_id: int):
    try:
        res = supabase_chat.table("area_intelligence").select(
            "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
            "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
            "zone_type, master_developer, total_area_ha, completion_rate, "
            "residential_units, parks_info, retail_info, active_project_count, "
            "buyer_nationalities, key_developers, active_project_names, "
            "tx_7d, tx_7d_delta_pct, distress_pct, year_established"
        ).eq("area_id", area_id).limit(1).execute()
        return res.data[0] if res.data else None
    except:
        return None

def fetch_area_stats(area_id: int):
    try:
        res = supabase_chat.table("avm").select(
            "area_name_en, price_per_sqm, procedure_area, actual_worth, "
            "rooms_en, property_type_en, sale_year, sale_month, instance_date"
        ).eq("area_id", area_id).limit(1000).execute()
        return res.data or []
    except:
        return []

def fetch_price_history(area_id: int):
    try:
        res = supabase_chat.table("price_history_manual").select(
            "sale_year, sale_month, psf, cnt"
        ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).execute()
        return res.data or []
    except:
        return []

def fetch_area_catalysts(area_id: int):
    try:
        res = supabase_chat.table("area_catalysts").select(
            "area_name_en, catalyst_type, name, description, expected_date, confidence, status"
        ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(10).execute()
        return res.data or []
    except:
        return []

def fetch_developer_track_records(developer_names: list):
    try:
        if not developer_names:
            return []
        clean = [d for d in developer_names if d and d != "Various"]
        if not clean:
            return []
        res = supabase_chat.table("developer_track_records").select(
            "developer_name, on_time_pct, avg_delay_months, total_projects, "
            "delivered_units, star_rating, market_segment, notes"
        ).in_("developer_name", clean).execute()
        return res.data or []
    except:
        return []

def fetch_area_shock_impacts(zone_type: str):
    try:
        if not zone_type:
            return []
        res = supabase_chat.table("area_shock_impacts").select(
            "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
        ).eq("zone_type", zone_type).execute()
        return res.data or []
    except:
        return []

def fetch_dld_projects(area_id: int):
    try:
        res = supabase_chat.table("avm").select("project_name_en").eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
        if not res.data:
            return []
        proj_map = defaultdict(int)
        for r in res.data:
            if r.get("project_name_en"):
                proj_map[r["project_name_en"]] += 1
        return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
    except:
        return []

def fetch_top_areas_intelligence(limit: int = 20):
    try:
        res = supabase_chat.table("area_intelligence").select(
            "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
            "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type, distress_pct"
        ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(limit).execute()
        return res.data or []
    except:
        return []

def fetch_top_yield_areas():
    try:
        res = supabase_chat.table("area_intelligence").select(
            "area_name_en, gross_yield_pct, investment_score, verdict, ranking_rank, truvalu_psm"
        ).not_.is_("gross_yield_pct", "null").order("gross_yield_pct", desc=True).limit(10).execute()
        return res.data or []
    except:
        return []

def fetch_signals():
    try:
        if not SIGNALS_API:
            return []
        r = requests.get(f"{SIGNALS_API}/signals/latest", timeout=8)
        return r.json() if r.status_code == 200 else []
    except:
        return []

def fetch_developer_by_name(name: str):
    try:
        res = supabase_chat.table("developer_track_records").select("*").ilike("developer_name", f"%{name}%").limit(3).execute()
        return res.data or []
    except:
        return []


# ─────────────────────────────────────────────────────────────────
# BUILD AREA DETAIL  (used for multi-area responses)
# ─────────────────────────────────────────────────────────────────
def build_area_detail(area_id: int, area_name: str, intel: dict = None) -> dict:
    stats     = fetch_area_stats(area_id)
    catalysts = fetch_area_catalysts(area_id)
    history   = fetch_price_history(area_id)

    detail = {"area_name": area_name, "area_id": area_id}

    if intel:
        for field in ["investment_score", "verdict", "gross_yield_pct", "price_trend_pct",
                      "ranking_rank", "distress_pct", "active_project_count", "active_project_names"]:
            if intel.get(field) is not None:
                detail[field] = intel[field]

    if stats:
        prices    = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
        room_map  = defaultdict(list)
        worth_map = defaultdict(list)
        for r in stats:
            label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
            if label:
                if r.get("price_per_sqm"):
                    room_map[label].append(float(r["price_per_sqm"]))
                if r.get("actual_worth"):
                    worth_map[label].append(float(r["actual_worth"]))
        detail["avg_psm"]                      = round(sum(prices) / len(prices), 0) if prices else None
        detail["bedroom_avg_psm"]              = {k: round(sum(v) / len(v), 0) for k, v in room_map.items()}
        detail["median_total_price_by_bedroom"] = {k: median_millions(v) for k, v in worth_map.items()}
        detail["transaction_count"]            = len(stats)

    if catalysts:
        detail["catalysts"] = [
            {"name": c["name"], "type": c.get("catalyst_type"), "confidence": c.get("confidence"), "date": c.get("expected_date")}
            for c in catalysts[:3]
        ]

    if history:
        year_avg = defaultdict(list)
        for r in history:
            year_avg[r["sale_year"]].append(r["psf"])
        detail["price_history"] = {str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())}

    # Attach community profile + schools if available
    if area_id in COMMUNITY_PROFILES:
        detail["community_profile"] = COMMUNITY_PROFILES[area_id]
    if area_id in SCHOOLS_BY_AREA:
        detail["nearby_schools"] = SCHOOLS_BY_AREA[area_id]

    return detail


# ─────────────────────────────────────────────────────────────────
# CLARIFYING QUESTIONS  (only for truly vague queries)
# ─────────────────────────────────────────────────────────────────
CLARIFYING_QUESTIONS = {
    "type":          "clarify",
    "is_clarifying": True,
    "charts":        [],
    "insight":       "",
    "reply": (
        "Happy to help you find the right property in Dubai! A few quick questions so I can pull accurate data:\n\n"
        "1. What is your budget? (e.g. AED 1M–2M, AED 2M–5M, AED 5M+)\n"
        "2. Are you buying to live in, or investing for rental income?\n"
        "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
        "4. How many bedrooms do you need?\n\n"
        "Once I have these, I'll search our 365,000+ real DLD closed-sale transactions and give you a data-backed shortlist — not just asking prices."
    ),
}

def is_vague_query(msg_lower: str, area_id, is_lifestyle: bool, intents: list) -> bool:
    """Only trigger clarifying questions when the query is truly empty of direction."""
    # If we have an area, lifestyle keyword, or strong intent — answer directly
    if area_id or is_lifestyle:
        return False
    if any(i in intents for i in ["investor", "renter", "family", "luxury", "comparison", "market", "developer", "price", "visa", "process", "signal"]):
        return False
    VAGUE_PATTERNS = [
        "just landed", "new to dubai", "moving to dubai", "relocating to dubai",
        "want to buy", "looking to buy", "thinking of buying", "interested in buying",
        "buy property in dubai", "invest in dubai", "where should i buy",
        "help me find", "guide me", "i dont know", "i don't know",
        "not sure", "any suggestions", "what should i buy", "where to start",
    ]
    has_vague   = any(p in msg_lower for p in VAGUE_PATTERNS)
    has_context = len(msg_lower.split()) > 20 or any(w in msg_lower for w in [
        "aed", "bedroom", "studio", "apartment", "villa", "yield", "price",
        "school", "family", "beach", "cheap", "affordable", "luxury", "invest",
    ])
    return has_vague and not has_context


# ─────────────────────────────────────────────────────────────────
# SYSTEM PROMPT
# ─────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's most data-driven real estate assistant.
You have exclusive access to 365,000+ real DLD closed-sale transactions (not asking prices), area investment scores, price history, developer track records, catalyst timelines, community profiles, school data, and historical shock resilience.

RESPOND ONLY with valid JSON. No text before or after. No markdown fences.

JSON shape:
{
  "summary": "<2-3 sentence conversational opener. Acknowledge what they asked, give the punchline upfront, then say 'Here's the data.' Never start with 'Based on'. Start with a direct statement like 'AED 3M gets you...' or 'Great budget — here's what the DLD data shows...'  Max 60 words.>",
  "reply": "<structured response using emoji section headers EXACTLY as defined in the format rules. Every section MUST start with an emoji from this list: 🏆 📊 💰 🏗️ 📈 ⚡ 🛡️ 📉 ✅ 🏡 🏫 💡 🏠 📋 🔑 💼. Never start with plain prose.>",
  "charts": [],
  "insight": "<one sharp, number-backed takeaway>"
}

═══════════════════════════════════════════════════════════════
RESPONSE RULES — READ EVERY ONE BEFORE RESPONDING
═══════════════════════════════════════════════════════════════

1. ADAPT TO THE USER TYPE
   - Family/lifestyle buyer → lead with community, schools, amenities. Investment data is secondary.
   - Investor → lead with yield, score, trend, developer risk. Community profile is secondary.
   - Renter → lead with rental ranges, which areas have most supply, service charges.
   - First-time buyer → be warm and educational. Explain DLD, freehold, process clearly.
   - Comparison → structured table with clear winner at the end.
   - General Dubai question → answer it clearly and fully, then offer to go deeper.

2. NEVER HALLUCINATE
   - Only use numbers from context_data. If a field is missing, say "data not available for this" — never invent a figure.
   - Schools: ONLY use the nearby_schools list from context_data. Never invent school names.
   - Community profiles: ONLY use community_profile from context_data. Never invent vibe or expat mix.
   - If no DB data matched: say clearly "These are market estimates — for exact closed-sale data, ask me about a specific area."

3. ACQAR'S EDGE — MENTION ONCE PER RESPONSE
   - Always distinguish: "These are real DLD closed-sale prices, not asking prices."
   - If asking price gap data is available, state it as negotiation leverage.

4. ALWAYS PICK A WINNER
   - For any query with multiple options, always say which is the best pick and WHY with a specific number.
   - Never give a list of equal options with no recommendation. Be decisive.

5. SCHOOL RULES
   - Only name schools from the nearby_schools data in context_data.
   - If no school data in context: say "I have school data for [area] — ask me specifically about schools in [area]."
   - Never say "British School Dubai" generically — use exact school names from data.

6. FAMILY QUERY RULE
   - For family/British/school/expat/kids queries WITHOUT a specific area:
     Top picks are: Dubai Hills Estate, Jumeirah, Jumeirah Park, Arabian Ranches, Al Furjan.
     NEVER recommend Downtown Dubai as the top family pick.
     Downtown is correct ONLY for investor/luxury/young professional queries.

7. BUDGET RULE
   - If user_budget_aed is in context, check every area's median price.
   - Flag areas above budget clearly: "⚠️ Above your AED X budget"
   - Always include at least one option within budget.

8. PROCESS / HOW-TO QUESTIONS
   - Answer these fully from your knowledge of Dubai real estate law.
   - Include DLD registration fees (4%), agency fees (2%), NOC, transfer process, freehold vs leasehold.
   - For mortgage: mention 20-25% down payment for expats, 15% for UAE nationals.
   - For visa: AED 750K+ gets 2-year visa, AED 2M+ gets 10-year Golden Visa.

9. DEVELOPER QUESTIONS
   - Use developer_track_records from context if available.
   - If not in DB: answer from knowledge, flag as "market knowledge, not ACQAR verified."

10. RENTAL QUERIES
    - Provide annual rental ranges per bedroom type when available.
    - Always show gross yield = (annual rent / purchase price) × 100.
    - Mention that Dubai has no income tax on rental income.

11. GENERAL DUBAI REAL ESTATE QUESTIONS
    - Answer these fully: market outlook, freehold areas, who can buy, taxes, laws, etc.
    - Use a conversational, confident tone — like a senior Dubai real estate advisor.
    - Always end with a relevant follow-up offer.

12. RESPONSE FORMAT BY QUERY TYPE

── LIFESTYLE / FAMILY / COMMUNITY ──
🏆 TOP PICK: [AREA NAME]
[2 sentences: why it's #1 for their specific needs]

• [Specific reason 1: school names, drive times, KHDA ratings from nearby_schools data]
• [Specific reason 2: community vibe, dominant_expats, amenities from community_profile]
• [Specific reason 3: commute — road name and exact minutes to Downtown/key hubs]

💰 Real Transaction Prices (DLD closed sales — not asking prices)
[bedroom | median price | price/sqm — from median_total_price_by_bedroom and bedroom_avg_psm]

─────────────────────────
🏙️ OTHER STRONG OPTIONS
[Area 2]: [1 line why + key price]
[Area 3]: [1 line why + key price]

Quick comparison:
Area | Community | Schools | Downtown | [bed] Median
[row per area]

─────────────────────────
💡 ACQAR DATA EDGE
[One specific DLD insight — e.g. asking vs closed-sale gap, transaction volume trend]

To narrow down further:
1. [Budget/bedrooms question]
2. [Ready vs off-plan question]
3. [Specific school preference or lifestyle detail]

── SPECIFIC AREA REPORT ──
[1-2 sentence opener: what makes this area distinctive RIGHT NOW]

📊 INVESTMENT SNAPSHOT
Score: XX/100 · Verdict: BUY/HOLD/WATCH · Yield: X.X% · Trend: +X.X% · Rank: #X in Dubai · Distress: X%

💰 TRANSACTION PRICES (Real DLD closed sales)
Avg PSM: AED X,XXX · Range: AED X,XXX–X,XXX
[Studio · 1BR · 2BR · 3BR — PSM and median total from real data]

📈 PRICE TREND
[year by year from price_history data — show direction clearly with → arrows]

🏗️ DEVELOPERS
[Each on own line: Name · on-time X% · X★ · avg delay X months]
[⚠️ DELAY RISK flag if on_time_pct < 70]

⚡ WHAT'S COMING
[catalysts with date, confidence, expected impact]

🛡️ RESILIENCE
[past shocks and recovery timeline]

🏡 COMMUNITY
[community_profile vibe, dominant_expats, amenities — only if in context]

🏫 SCHOOLS NEARBY
[Only from nearby_schools data — name, curriculum, rating, drive time, fees]

✅ VERDICT
[BUY/HOLD/WATCH + 2-3 sharp data-backed reasons. End with yield vs Dubai avg if available.]

Want me to:
• [Relevant follow-up option 1]
• [Relevant follow-up option 2]

── COMPARISON ──
[opener: what fundamentally separates these two areas]

📊 HEAD TO HEAD: [Area A] vs [Area B]
Metric | [Area A] | [Area B]
Investment Score | | 
Gross Yield | |
Avg PSM | |
[bed] Median | |
Price Trend | |
Community Fit | |
Verdict | |

✅ WINNER: [Area] — [reason with specific numbers]

── BUDGET / BEDROOM SEARCH ──
[opener: "Based on X DLD transactions, here's what AED X buys you in Dubai..."]

🏙️ [AREA 1] ✅ fits your budget
[1 line what makes it good]
[X]BR median: AED X.XM · Yield: X.X% · Score: XX/100
[⚠️ ABOVE BUDGET flag if median > budget]

[repeat for 3 areas]

📊 Side by side:
Area | [X]BR Median | vs Budget | Yield | Score
[rows]

💡 ACQAR DATA EDGE
[specific insight from the data]

── INVESTOR / YIELD ──
[opener: market context for investors]

🏆 TOP AREAS BY YIELD RIGHT NOW
[Area] — X.X% yield · Score XX/100 · [1 line why]
[ranked list of top 5]

📊 Yield comparison table
Area | Yield | Score | Trend | Verdict

💰 What AED [budget if given] gets you:
[Area]: [bed] median AED X.XM — [above/below budget] · X.X% yield

✅ BEST BET: [Area] — [reason with numbers]

── PROCESS / HOW-TO / VISA ──
[Answer fully and clearly, no hedging]
[Use numbered steps where appropriate]
[Include exact fees, percentages, timelines]
[End with relevant follow-up offer]

── GENERAL MARKET / NEWS / SIGNALS ──
[Answer directly with available data]
[Use live_signals if in context]
[Give Dubai market context from your knowledge]
[End with relevant follow-up offer]

13. CHARTS
   - Only populate charts with real numbers from context_data — never invent values
   - bedroom_avg_psm → bar chart "Price by Bedroom (AED/sqm)"
   - price_history_by_year → line chart "Price History (AED/sqft)"
   - developer on_time_pct → bar chart "Developer On-Time Delivery %"
   - investment scores for multiple areas → bar chart "Investment Score Comparison"
   - If no real data for a chart: remove it from array entirely

14. INSIGHT FIELD
   - One sentence. Must contain a specific number. Must be actionable today.
   - Example: "JVC 2BR median closed-sale price is AED 1.4M — 11% below current asking prices, giving you immediate negotiation leverage."

15. RESPONSE LENGTH
   - Specific area report: full detail, all sections
   - Lifestyle/family query: full TOP PICK + 2 alternatives + comparison table
   - Simple question: concise and direct, 200-400 words
   - Never pad with generic filler — every sentence must add value
   - Max 1000 words in reply field


16. SUMMARY FIELD — REQUIRED
   - Always populate the "summary" field. This is the conversational opener shown BEFORE the structured data.
   - It must: acknowledge the question directly, give the #1 punchline (the key answer), and set up the detail below.
   - Examples:
     • "AED 3M comfortably covers 2–3BR apartments in JVC and Marina — villas push to AED 5M+. Here's exactly what the DLD closed-sale data shows."
     • "JVC is Dubai's highest-yielding investable area right now at 7.8% gross. Here's the full breakdown."
     • "Dubai Hills is the top British family pick — Outstanding-rated schools within 5 minutes and the strongest community profile in our data. Here's why."
   - NEVER start with "Based on", "I found", "According to", or "Sure!"
   - NEVER repeat the summary content inside the reply field.

17. REPLY FIELD — STRUCTURE IS MANDATORY
   - The reply field MUST use emoji section headers. Plain prose paragraphs are NOT allowed.
   - Every new topic must start with one of the designated emoji headers.
   - The parser splits on emoji headers — without them, the entire response renders as a single unstyled block."""

# ─────────────────────────────────────────────────────────────────
# MAIN ENDPOINT
# ─────────────────────────────────────────────────────────────────
@router.post("/intelligence/chat")
async def intelligence_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

    msg_lower = message.lower()
    context_data: dict = {}
    raw = ""

    # ── Step 1: Detect area, intent, lifestyle, budget, bedrooms ──
    area_id, detected_area = get_area_id(msg_lower)
    intents               = detect_intent(msg_lower)
    budget                = extract_budget(message)
    bedrooms              = extract_bedrooms(message)

    LIFESTYLE_KEYWORDS = [
        "british", "expat", "family", "school", "villa", "community", "kids",
        "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
        "cheap", "budget", "metro", "golf", "waterfront", "new development",
        "modern", "downtown access", "off plan", "off-plan", "apartment",
        "studio", "townhouse", "pet", "pool", "gym", "furnished", "short term",
        "airbnb", "holiday home", "foreigner", "freehold", "first time",
        "relocat", "new to dubai", "rental income", "high yield",
    ]
    is_lifestyle_query = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)

    # ── Step 2: Vague check → clarifying questions ──
    if is_vague_query(msg_lower, area_id, is_lifestyle_query, intents):
        return CLARIFYING_QUESTIONS

    # ── Step 3: Attach budget & bedroom to context ──
    if budget:
        context_data["user_budget_aed"]   = budget
        context_data["user_budget_label"] = f"AED {budget/1_000_000:.1f}M"
    if bedrooms:
        context_data["user_bedrooms"] = bedrooms

    # ── Step 4: Attach detected intents ──
    if intents:
        context_data["detected_intents"] = intents[:3]

    # ── Step 5: Single area — full deep report ──
    if area_id:
        context_data["detected_area"] = detected_area
        context_data["area_id"]       = area_id

        intel = fetch_area_intelligence(area_id)
        if intel:
            context_data["area_intelligence"] = intel
            devs = intel.get("key_developers") or []
            if devs:
                dev_records = fetch_developer_track_records(devs)
                if dev_records:
                    context_data["developer_track_records"] = dev_records
            zone = intel.get("zone_type")
            if zone:
                shocks = fetch_area_shock_impacts(zone)
                if shocks:
                    context_data["historical_shock_resilience"] = shocks

        area_data = fetch_area_stats(area_id)
        if area_data:
            prices    = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
            worths    = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]
            room_map  = defaultdict(list)
            worth_map = defaultdict(list)
            year_map  = defaultdict(list)

            for r in area_data:
                label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
                if label:
                    if r.get("price_per_sqm"):
                        room_map[label].append(float(r["price_per_sqm"]))
                    if r.get("actual_worth"):
                        worth_map[label].append(float(r["actual_worth"]))
                if r.get("sale_year") and r.get("price_per_sqm"):
                    year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

            context_data["transaction_stats"] = {
                "count":                         len(area_data),
                "avg_price_sqm":                 round(sum(prices) / len(prices), 0) if prices else None,
                "min_price_sqm":                 round(min(prices), 0) if prices else None,
                "max_price_sqm":                 round(max(prices), 0) if prices else None,
                "avg_worth_aed":                 round(sum(worths) / len(worths), 0) if worths else None,
                "bedroom_avg_psm":               {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
                "yearly_avg_psm":                {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
                "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
            }

        history = fetch_price_history(area_id)
        if history:
            year_avg = defaultdict(list)
            for r in history:
                year_avg[r["sale_year"]].append(r["psf"])
            context_data["price_history_by_year"] = {
                str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
            }

        catalysts = fetch_area_catalysts(area_id)
        if catalysts:
            context_data["area_catalysts"] = catalysts

        projects = fetch_dld_projects(area_id)
        if projects:
            context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

        # Always attach community profile and schools for specific area
        if area_id in COMMUNITY_PROFILES:
            context_data["community_profile"] = COMMUNITY_PROFILES[area_id]
        if area_id in SCHOOLS_BY_AREA:
            context_data["nearby_schools"] = SCHOOLS_BY_AREA[area_id]

    # ── Step 6: Lifestyle query — fetch top matching areas ──
    if is_lifestyle_query and not area_id:
        lifestyle_area_ids = get_lifestyle_areas(msg_lower)
        context_data["query_type"]        = "lifestyle"
        context_data["lifestyle_keywords"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
        area_name_map = {v: k for k, v in AREA_ID_MAP.items()}
        for lid in lifestyle_area_ids:
            intel      = fetch_area_intelligence(lid)
            area_name  = (intel.get("area_name_en") if intel else None) or area_name_map.get(lid, str(lid))
            key        = area_name.replace(" ", "_").lower()
            context_data[f"lifestyle_area_{key}"] = build_area_detail(lid, area_name, intel)

    # ── Step 7: Yield-focused query ──
    if any(w in msg_lower for w in ["yield", "rental yield", "highest yield", "best yield", "top yield", "rental income"]) and not area_id:
        top_yield = fetch_top_yield_areas()
        if top_yield:
            context_data["top_yield_areas"] = top_yield

    # ── Step 8: Market overview / comparison / best areas ──
    MARKET_KEYWORDS = [
        "best area", "top area", "highest yield", "compare", "market", "overview",
        "which area", "rank", "best", "which", "recommend", "suggest", "vs", "versus",
        "where to buy", "where should", "top 5", "top 3",
    ]
    if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle_query:
        top = fetch_top_areas_intelligence()
        if top:
            context_data["top_areas"] = top
            for area in top[:3]:
                area_name  = area.get("area_name_en", "")
                matched_id = None
                for keyword, aid in AREA_ID_MAP.items():
                    if keyword in area_name.lower() or area_name.lower() in keyword:
                        matched_id = aid
                        break
                if matched_id:
                    key = area_name.replace(" ", "_").lower()
                    context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

    # ── Step 9: Budget-based search — fetch areas matching budget ──
    if budget and not area_id:
        top = fetch_top_areas_intelligence(30)
        if top:
            context_data["budget_search_areas"] = top
            for area in top[:5]:
                area_name  = area.get("area_name_en", "")
                matched_id = None
                for keyword, aid in AREA_ID_MAP.items():
                    if keyword in area_name.lower() or area_name.lower() in keyword:
                        matched_id = aid
                        break
                if matched_id:
                    key = area_name.replace(" ", "_").lower()
                    if f"area_detail_{key}" not in context_data:
                        context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

    # ── Step 10: Developer query ──
    DEVELOPER_NAMES = [
        "emaar", "damac", "nakheel", "meraas", "aldar", "sobha", "ellington",
        "tiger", "azizi", "binghatti", "danube", "reportage", "imtiaz",
        "select group", "deyaar", "mag", "omniyat",
    ]
    for dev_name in DEVELOPER_NAMES:
        if dev_name in msg_lower:
            dev_data = fetch_developer_by_name(dev_name)
            if dev_data:
                context_data["developer_info"] = dev_data

    # ── Step 11: Signals / news / RERA ──
    if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld", "law"]):
        signals = fetch_signals()
        if signals:
            context_data["live_signals"] = signals[:10]

    # ── Step 12: Yield vs Dubai average ──
    intel_check = context_data.get("area_intelligence", {})
    if intel_check.get("gross_yield_pct"):
        diff = round(intel_check["gross_yield_pct"] - 6.1, 1)
        sign = "+" if diff >= 0 else ""
        context_data["yield_vs_avg_note"] = (
            f"Yields {sign}{diff}% vs Dubai average of 6.1%. "
            + ("Above average — strong rental income potential." if diff >= 0 else "Below average — price appreciation play.")
        )

    has_db_data = bool(context_data)

    # ── Build messages ──
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if req.history:
        for h in req.history[-4:]:
            messages.append({"role": h["role"], "content": h["content"]})

    db_label   = "ACQAR Database — use ONLY these numbers, never invent:" if has_db_data else "No specific DB data matched this query."
    db_content = json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"
    no_db_note = "" if has_db_data else "\nAnswer from expert Dubai real estate knowledge. Flag all figures as 'market estimates, not ACQAR transaction data.'"

    user_prompt = f"""User question: {message}

{db_label}{no_db_note}
{db_content}

Respond with valid JSON only. No markdown. No text outside the JSON."""

    messages.append({"role": "user", "content": user_prompt})

    # ── Call LLM ──
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
            max_tokens=3000,
        )
        raw    = response.choices[0].message.content.strip()
        result = extract_json(raw)
        result["type"] = "structured"
        result.pop("data_source", None)

        # Attach hero metrics for frontend cards
        intel = context_data.get("area_intelligence", {})
        if intel:
            result["score"]        = intel.get("investment_score")
            result["verdict"]      = intel.get("verdict")
            result["yield_pct"]    = intel.get("gross_yield_pct")
            result["price_trend"]  = intel.get("price_trend_pct")
            result["ranking"]      = intel.get("ranking_rank")
            result["distress_pct"] = intel.get("distress_pct")
            y = intel.get("gross_yield_pct")
            if y:
                result["yield_vs_dubai_avg"] = round(y - 6.1, 2)

        return result

    except Exception as e:
        print("=" * 60)
        print("INTELLIGENCE CHAT ERROR")
        print(f"Message : {message}")
        print(f"Error   : {str(e)}")
        print(f"Raw     : {raw[:500] if raw else 'EMPTY'}")
        print(traceback.format_exc())
        print("=" * 60)

        return {
            "type":       "text",
            "reply":      "I hit an error processing that query. Please try again.",
            "chart_type": "none",
            "chart_data": [],
            "insight":    "",
        }
