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










import os
import json
import traceback

from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
from collections import defaultdict

from openai import OpenAI
client = OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SIGNALS_API  = os.getenv("SIGNALS_API_URL", "")

SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase


class ChatRequest(BaseModel):
    message: str


AREA_ID_MAP = {
    "dubai marina": 36, "marina": 36,
    "jumeirah village circle": 59, "jvc": 59,
    "downtown dubai": 10, "downtown": 10,
    "business bay": 54,
    "palm jumeirah": 410, "palm": 410,
    "jumeirah": 23,
    "deira": 545, "bur dubai": 345,
    "silicon oasis": 91,
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
}

# ── Lifestyle keyword → best matching area IDs ────────────────────
LIFESTYLE_AREA_MAP = {
    "british": [53, 23, 133],        # Dubai Hills, Jumeirah, Arabian Ranches
    "british school": [53, 105, 23], # Dubai Hills, Al Barsha, Jumeirah
    "british community": [53, 23, 73], # Dubai Hills, Jumeirah, Jumeirah Park
    "expat": [36, 53, 59],           # Marina, Dubai Hills, JVC
    "family": [53, 133, 73],         # Dubai Hills, Arabian Ranches, Jumeirah Park
    "school": [53, 105, 23],         # Dubai Hills, Al Barsha, Jumeirah
    "villa": [133, 53, 73],          # Arabian Ranches, Dubai Hills, Jumeirah Park
    "safe": [53, 133, 73],
    "quiet": [53, 133, 232],
    "kids": [53, 133, 73],
    "children": [53, 133, 73],
    "community": [53, 133, 23],
}

def get_area_id(msg_lower: str):
    for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
        if keyword in msg_lower:
            return area_id, keyword
    return None, None

def get_lifestyle_areas(msg_lower: str):
    """Return list of area_ids for lifestyle/community queries."""
    matched = []
    for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
        if keyword in msg_lower:
            for aid in area_ids:
                if aid not in matched:
                    matched.append(aid)
    return matched[:3]  # max 3 areas

def median_millions(lst: list):
    if not lst:
        return None
    s = sorted(lst)
    n = len(s)
    return round(s[n // 2] / 1_000_000, 2)

def extract_json(raw: str) -> dict:
    import re
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
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        raw = raw[start:end+1]

    # Fix literal newlines/tabs inside JSON strings (LLM often emits these)
    def fix_string_newlines(m):
        inner = m.group(1)
        inner = inner.replace(chr(13)+chr(10), chr(92)+"n")
        inner = inner.replace(chr(13), chr(92)+"n")
        inner = inner.replace(chr(10), chr(92)+"n")
        inner = inner.replace(chr(9), chr(92)+"t")
        return chr(34) + inner + chr(34)
    raw = re.sub(r'"((?:[^"\\]|\\.)*)"', fix_string_newlines, raw, flags=re.DOTALL)

    return json.loads(raw)

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
        res = supabase_chat.table("avm").select(
            "project_name_en"
        ).eq("area_id", area_id).not_.is_("project_name_en", "null").limit(200).execute()
        if not res.data:
            return []
        proj_map = defaultdict(int)
        for r in res.data:
            if r.get("project_name_en"):
                proj_map[r["project_name_en"]] += 1
        return sorted(proj_map.items(), key=lambda x: -x[1])[:10]
    except:
        return []

def fetch_top_areas_intelligence():
    try:
        res = supabase_chat.table("area_intelligence").select(
            "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
            "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
        ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(20).execute()
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

def build_area_detail(area_id: int, area_name: str, intel: dict = None) -> dict:
    """Fetch full stats for one area and return a detail dict."""
    stats = fetch_area_stats(area_id)
    catalysts = fetch_area_catalysts(area_id)
    history = fetch_price_history(area_id)

    detail = {
        "area_name": area_name,
        "area_id": area_id,
    }
    if intel:
        detail["investment_score"] = intel.get("investment_score")
        detail["verdict"] = intel.get("verdict")
        detail["gross_yield_pct"] = intel.get("gross_yield_pct")
        detail["price_trend_pct"] = intel.get("price_trend_pct")

    if stats:
        prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
        BEDROOM_KEYS = {
            "0": "Studio", "0.0": "Studio",
            "1": "1 BR", "1.0": "1 BR",
            "2": "2 BR", "2.0": "2 BR",
            "3": "3 BR", "3.0": "3 BR",
        }
        room_map = defaultdict(list)
        worth_map = defaultdict(list)
        for r in stats:
            label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
            if label:
                if r.get("price_per_sqm"):
                    room_map[label].append(float(r["price_per_sqm"]))
                if r.get("actual_worth"):
                    worth_map[label].append(float(r["actual_worth"]))
        detail["avg_psm"] = round(sum(prices) / len(prices), 0) if prices else None
        detail["bedroom_avg_psm"] = {k: round(sum(v) / len(v), 0) for k, v in room_map.items()}
        detail["median_total_price_by_bedroom"] = {k: median_millions(v) for k, v in worth_map.items()}

    if catalysts:
        detail["catalysts"] = [
            {"name": c["name"], "type": c.get("catalyst_type"), "confidence": c.get("confidence")}
            for c in catalysts[:3]
        ]

    if history:
        year_avg = defaultdict(list)
        for r in history:
            year_avg[r["sale_year"]].append(r["psf"])
        detail["price_history"] = {str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())}

    return detail


# ── Vague/general query detector ─────────────────────────────────
VAGUE_PATTERNS = [
    "just landed", "new to dubai", "moving to dubai", "relocating",
    "want to buy", "looking to buy", "thinking of buying", "interested in buying",
    "buy property", "buy a property", "buy properties", "buy real estate",
    "invest in dubai", "where should i", "help me find", "guide me",
    "i dont know", "i don't know", "not sure", "any suggestions",
    "what should", "where to start", "first time",
]

CLARIFYING_QUESTIONS = {
    "type": "clarify",
    "reply": "Welcome to Dubai! To find the right property for you, I need a few quick details:\n\n1. What is your budget? (e.g. AED 1M-2M, AED 2M-5M, AED 5M+)\n2. Are you buying to live in or as an investment for rental income?\n3. Any lifestyle preferences? (beach/marina, city centre, family community with schools, villa vs apartment)\n4. How many bedrooms do you need?\n\nOnce I know these, I'll pull real transaction data and give you a shortlist of the best areas with actual prices.",
    "charts": [],
    "insight": "",
    "is_clarifying": True,
}



def is_vague_query(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
    """Return True if query is too vague to fetch meaningful data."""
    if area_id or is_lifestyle:
        return False
    # Must match a vague pattern AND have no specific area/data intent
    has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
    has_specific = any(w in msg_lower for w in [
        "yield", "price", "psm", "sqm", "trend", "compare", "vs",
        "score", "invest", "return", "roi", "catalyst", "developer",
        "jvc", "marina", "downtown", "hills", "bay", "palm",
    ])
    word_count = len(msg_lower.split())
    # Vague if: matches pattern and no specific data keywords and short message
    return has_vague and not has_specific and word_count < 20


@router.post("/intelligence/chat")
async def intelligence_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"type": "text", "reply": "Please ask a question."}

    msg_lower = message.lower()
    context_data = {}
    raw = ""

    # ── 1. Detect explicit area name ──────────────────────────────
    area_id, detected_area = get_area_id(msg_lower)

    # ── 2. Detect lifestyle/community query (no explicit area) ────
    lifestyle_area_ids = []
    LIFESTYLE_KEYWORDS = ["british", "expat", "family", "school", "villa", "community", "kids", "children", "safe", "quiet"]
    is_lifestyle_query = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)

    # ── 2b. Detect vague query — return clarifying questions immediately ──
    if is_vague_query(msg_lower, area_id, is_lifestyle_query):
        return CLARIFYING_QUESTIONS

    if is_lifestyle_query and not area_id:
        lifestyle_area_ids = get_lifestyle_areas(msg_lower)
        context_data["query_type"] = "lifestyle"
        context_data["lifestyle_keywords"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]

    # ── 3. Fetch single area data ─────────────────────────────────
    if area_id:
        context_data["detected_area"] = detected_area
        context_data["area_id"] = area_id

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
            prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
            worths = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]
            BEDROOM_KEYS = {
                "0": "Studio", "0.0": "Studio",
                "1": "1 BR", "1.0": "1 BR",
                "2": "2 BR", "2.0": "2 BR",
                "3": "3 BR", "3.0": "3 BR",
                "4": "4 BR", "4.0": "4 BR",
            }
            room_map = defaultdict(list)
            worth_map = defaultdict(list)
            for r in area_data:
                label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
                if label:
                    if r.get("price_per_sqm"):
                        room_map[label].append(float(r["price_per_sqm"]))
                    if r.get("actual_worth"):
                        worth_map[label].append(float(r["actual_worth"]))
            year_map = defaultdict(list)
            for r in area_data:
                if r.get("sale_year") and r.get("price_per_sqm"):
                    year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))
            context_data["transaction_stats"] = {
                "count": len(area_data),
                "avg_price_sqm": round(sum(prices) / len(prices), 0) if prices else None,
                "min_price_sqm": round(min(prices), 0) if prices else None,
                "max_price_sqm": round(max(prices), 0) if prices else None,
                "avg_worth_aed": round(sum(worths) / len(worths), 0) if worths else None,
                "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
                "yearly_avg_psm": {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
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
            context_data["price_history_recent"] = [
                {"year": r["sale_year"], "month": r["sale_month"], "psf": r["psf"], "transactions": r["cnt"]}
                for r in history[-6:]
            ]

        catalysts = fetch_area_catalysts(area_id)
        if catalysts:
            context_data["area_catalysts"] = catalysts

        projects = fetch_dld_projects(area_id)
        if projects:
            context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

    # ── 4. Fetch lifestyle areas (multi-area for community queries) ──
    if lifestyle_area_ids:
        area_name_map = {v: k for k, v in AREA_ID_MAP.items()}
        for lid in lifestyle_area_ids:
            intel = fetch_area_intelligence(lid)
            area_name = intel.get("area_name_en") if intel else area_name_map.get(lid, str(lid))
            key = area_name.replace(" ", "_").lower()
            context_data[f"lifestyle_area_{key}"] = build_area_detail(lid, area_name, intel)

    # ── 5. Top areas / compare / market overview ──────────────────
    MARKET_KEYWORDS = ["best area", "top area", "highest yield", "compare", "market", "overview",
                       "which area", "invest", "yield", "rental", "rank", "best", "which",
                       "recommend", "suggest"]
    if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle_query:
        top = fetch_top_areas_intelligence()
        if top:
            context_data["top_areas"] = top
            for area in top[:3]:
                area_name = area.get("area_name_en", "")
                matched_id = None
                for keyword, aid in AREA_ID_MAP.items():
                    if keyword in area_name.lower() or area_name.lower() in keyword:
                        matched_id = aid
                        break
                if matched_id:
                    key = area_name.replace(" ", "_").lower()
                    context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

    # ── 6. General buyer queries ──────────────────────────────────
    BUYER_KEYWORDS = [
        "buy home", "buy a home", "buy house", "buy a house", "buy property",
        "buy apartment", "buy flat", "luxury home", "affordable home",
        "where to buy", "how to buy", "can i buy", "can we buy",
        "invest in dubai", "moving to dubai", "relocating to dubai",
        "best place to live", "where to live", "home in dubai",
        "property in dubai", "apartment in dubai", "villa in dubai",
        "freehold", "who can buy", "can anyone buy",
    ]
    is_buyer_query = any(w in msg_lower for w in BUYER_KEYWORDS)

    if is_buyer_query and not is_lifestyle_query and "top_areas" not in context_data:
        top = fetch_top_areas_intelligence()
        if top:
            context_data["top_areas"] = top
            context_data["buyer_query_mode"] = True
            for area in top[:5]:
                area_name = area.get("area_name_en", "")
                matched_id = None
                for keyword, aid in AREA_ID_MAP.items():
                    if keyword in area_name.lower() or area_name.lower() in keyword:
                        matched_id = aid
                        break
                if matched_id:
                    key = area_name.replace(" ", "_").lower()
                    context_data[f"area_detail_{key}"] = build_area_detail(matched_id, area_name, area)

    # ── 7. Signals ────────────────────────────────────────────────
    if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
        signals = fetch_signals()
        if signals:
            context_data["live_signals"] = signals[:10]

    # ── 8. Yield vs Dubai average ─────────────────────────────────
    intel_for_rank = context_data.get("area_intelligence", {})
    if intel_for_rank.get("gross_yield_pct"):
        diff = round(intel_for_rank["gross_yield_pct"] - 6.1, 1)
        direction = f"+{diff}%" if diff >= 0 else f"{diff}%"
        context_data["yield_vs_avg_note"] = (
            f"This area yields {direction} vs Dubai average of 6.1%. "
            + ("Above average — strong rental income." if diff >= 0 else "Below average — price appreciation play.")
        )

    # ── Build prompt ──────────────────────────────────────────────
    has_db_data = bool(context_data)

    # FIX: System prompt no longer leaks instructions into the reply example
    system = """You are ACQAR's AI analytics assistant for Dubai real estate.
You have access to 365,000+ real DLD transactions, area intelligence scores, price history, developer track records, catalyst timelines, and historical shock resilience data.

You MUST respond ONLY with valid JSON. No text before or after the JSON. No markdown fences.

The JSON must have this exact shape:
{
  "reply": "<full response as a plain string using \\n for newlines>",
  "charts": [],
  "insight": "<one actionable takeaway with a specific number>"
}

HOW TO WRITE THE REPLY STRING:
- Start with the emoji section header on its own line, then the content below it
- Sections available (use only those with real data):
    📊 MARKET OVERVIEW
    💰 PRICING
    🏗️ DEVELOPERS & PROJECTS
    📈 PRICE HISTORY
    ⚡ CATALYSTS
    🛡️ RESILIENCE
    📉 WORST CASE
    ✅ VERDICT
- For lifestyle/community queries (british, expat, family, school): use 🏙️ AREA NAME as a section header for each recommended area, then sub-sections below it
- Separate each section with a blank line (\\n\\n)
- Never write the word "NONE", "not available", "N/A" for a whole section — omit the section entirely if no data exists
- Do NOT echo any instructions into the reply — only write actual data and analysis

CONTENT RULES:
- 📊 MARKET OVERVIEW: investment score X/100, verdict BUY/HOLD/WATCH, gross yield X.X%, price trend, ranking, distress %
- 💰 PRICING: avg PSM, min-max, avg worth. Then PSM by bedroom. Then median DLD closed-sale prices by bedroom
- 🏗️ DEVELOPERS: each developer on own line — Name · X% on-time · X★ · avg delay X months. Add ⚠️ if on_time_pct < 70
- 📈 PRICE HISTORY: year → year showing direction e.g. 2021: AED 1,200 → 2022: AED 1,350 → 2023: AED 1,480
- ⚡ CATALYSTS: bullet each catalyst with type, date, confidence, expected impact
- 🛡️ RESILIENCE: bullet each shock event with price impact and recovery time
- 📉 WORST CASE: only for BUY verdict, only if shock data exists — downside PSM and recovery estimate
- ✅ VERDICT: BUY/HOLD/WATCH with 2-3 data-backed reasons. End with yield_vs_avg_note if available
- For lifestyle queries: for each area write 🏙️ AREA NAME then explain why it fits the criteria (british schools, expat community, downtown access), then pricing, then verdict. Be specific and helpful like a senior analyst.

CHART RULES (populate only with real numbers, remove chart if no data):
- bedroom chart: bedroom_avg_psm values, type=bar
- price history chart: price_history_by_year values, type=line
- developer chart: on_time_pct per developer, type=bar
- multi-area: investment_score comparison bar chart

TOKEN LIMIT: Keep reply concise — max 800 words. Never pad with filler."""

    user_prompt = f"""User question: {message}

{"Database context (use these exact numbers — do not invent figures):" if has_db_data else "No specific DB data found. Use expert Dubai market knowledge and clearly state figures are estimates."}
{json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"}

Respond with JSON only."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=3000,
            response_format={"type": "json_object"},  # Forces valid JSON output — no literal newlines
        )
        raw = response.choices[0].message.content.strip()

        result = extract_json(raw)
        result["type"] = "structured"
        result.pop("data_source", None)  # Remove data_source — frontend no longer shows it

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
        print(f"Message: {message}")
        print(f"Error: {str(e)}")
        print(f"Raw response preview: {raw[:500] if raw else 'EMPTY'}")
        print(traceback.format_exc())
        print("=" * 60)

        return {
            "type": "text",
            "reply": "I encountered an error processing your query. Please try rephrasing or ask about a specific Dubai area like 'Tell me about JVC' or 'Best areas for rental yield'.",
            "chart_type": "none",
            "chart_data": [],
            "insight": "",
        }
