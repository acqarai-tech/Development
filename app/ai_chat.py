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

















import os
import json
import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
from supabase import create_client
from collections import defaultdict

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

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


# ── Area keyword → area_id mapping (verified against DB) ────────────
AREA_ID_MAP = {
    "dubai marina": 36,
    "marina": 36,
    "jumeirah village circle": 59,
    "jvc": 59,
    "downtown dubai": 10,
    "downtown": 10,
    "business bay": 54,
    "palm jumeirah": 410,
    "palm": 410,
    "jumeirah": 23,
    "deira": 545,
    "bur dubai": 345,
    "silicon oasis": 91,
    "dubai hills estate": 53,
    "dubai hills": 53,
    "al barsha": 105,
    "mirdif": 232,
    "arjan": 91,
    "discovery gardens": 13,
    "international city": 368,
    "town square": 386,
    "difc": 117,
    "bluewaters island": 1754,
    "bluewaters": 1754,
    "dubai south": 3355,
    "al furjan": 41,
    "motor city": 268,
    "dubai sports city": 67,
    "sports city": 67,
    "dubai creek harbour": 1509,
    "creek harbour": 1509,
    "al jaddaf": 1509,
    "jaddaf": 1509,
    "jumeirah lake towers": 12,
    "jlt": 12,
    "arabian ranches 3": 16296,
    "arabian ranches 2": 133,
    "arabian ranches": 133,
    "damac hills 2": 352,
    "damac hills": 352,
    "barsha heights": 25,
    "tecom": 25,
    "the greens": 25,
    "greens": 25,
    "al quoz": 293,
    "al satwa": 1347,
    "satwa": 1347,
    "al karama": 271,
    "karama": 271,
    "meydan": 43,
    "palm jebel ali": 1519,
    "palm jabal ali": 411,
    "dubai islands": 5178,
    "expo city": 85082,
    "dubai internet city": 1621,
    "dubai media city": 95,
    "dubai production city": 5036,
    "impz": 5036,
    "jumeirah golf estates": 347,
    "jumeirah park": 73,
    "dubailand": 51,
    "tilal al ghaf": 5173,
    "damac lagoons": 75266,
    "dubai harbour": 3512,
    "oud metha": 388,
    "nad al sheba": 161,
    "culture village": 190,
    "jaddaf waterfront": 190,
    "burj khalifa": 390,
    "green community": 673,
    "dubai design district": 22688,
    "d3": 22688,
    "al mamzer": 231,
    "mamzer": 231,
    "al garhoud": 378,
    "garhoud": 378,
    "dubai festival city": 277,
    "festival city": 277,
    "port saeed": 240,
    "hor al anz": 233,
    "muhaisnah": 1793,
    "al nahda": 355,
    "nahda": 355,
    "nad al hamar": 1045,
    "ras al khor": 1036,
    "al rashidiya": 2418,
    "rashidiya": 2418,
    "al wasl": 914,
    "wasl": 914,
    "pearl jumeirah": 344,
    "um suqaim": 229,
    "jumeirah second": 375,
    "jumeirah third": 318,
    "jumeirah first": 317,
    "al manara": 315,
    "al saffa": 313,
}


def get_area_id(msg_lower: str):
    for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
        if keyword in msg_lower:
            return area_id, keyword
    return None, None


# ── Median helper ─────────────────────────────────────────────────

def median_millions(lst: list):
    """Return median of a list rounded to 2dp in AED millions. Returns None if empty."""
    if not lst:
        return None
    s = sorted(lst)
    n = len(s)
    return round(s[n // 2] / 1_000_000, 2)


# ── Fetch helpers ─────────────────────────────────────────────────

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


# ── Main endpoint ─────────────────────────────────────────────────

@router.post("/intelligence/chat")
async def intelligence_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"type": "text", "reply": "Please ask a question."}

    msg_lower = message.lower()
    context_data = {}

    # ── Detect area ──
    area_id, detected_area = get_area_id(msg_lower)

    if area_id:
        context_data["detected_area"] = detected_area
        context_data["area_id"] = area_id

        # 1. Area intelligence
        intel = fetch_area_intelligence(area_id)
        if intel:
            context_data["area_intelligence"] = intel

            # 2. Developer track records
            devs = intel.get("key_developers") or []
            if devs:
                dev_records = fetch_developer_track_records(devs)
                if dev_records:
                    context_data["developer_track_records"] = dev_records

            # 3. Shock resilience
            zone = intel.get("zone_type")
            if zone:
                shocks = fetch_area_shock_impacts(zone)
                if shocks:
                    context_data["historical_shock_resilience"] = shocks

        # 4. Raw AVM transactions
        area_data = fetch_area_stats(area_id)
        if area_data:
            prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
            worths = [float(r["actual_worth"]) for r in area_data if r.get("actual_worth")]

            BEDROOM_KEYS = {
                "0": "Studio", "0.0": "Studio",
                "1": "1 BR",   "1.0": "1 BR",
                "2": "2 BR",   "2.0": "2 BR",
                "3": "3 BR",   "3.0": "3 BR",
                "4": "4 BR",   "4.0": "4 BR",
            }

            room_map = defaultdict(list)   # psm per bedroom
            worth_map = defaultdict(list)  # actual_worth per bedroom

            for r in area_data:
                rooms = str(r.get("rooms_en", ""))
                label = BEDROOM_KEYS.get(rooms)
                if not label:
                    continue
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
                # ── NEW: median closed-sale total price per bedroom in AED millions ──
                "median_total_price_by_bedroom": {
                    k: median_millions(v) for k, v in worth_map.items()
                },
            }

        # 5. Price history
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

        # 6. Catalysts
        catalysts = fetch_area_catalysts(area_id)
        if catalysts:
            context_data["area_catalysts"] = catalysts

        # 7. Top projects
        projects = fetch_dld_projects(area_id)
        if projects:
            context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

    # ── Top areas / compare / market overview ──
    if any(w in msg_lower for w in ["best area", "top area", "highest yield", "compare", "market", "overview", "which area", "invest", "yield", "rental", "rank", "buy", "best", "which", "recommend", "suggest"]):
        top = fetch_top_areas_intelligence()
        if top:
            context_data["top_areas"] = top
            # Auto-fetch full data for the top 3 areas
            for area in top[:3]:
                area_name = area.get("area_name_en", "")
                matched_id = None
                for keyword, aid in AREA_ID_MAP.items():
                    if keyword in area_name.lower() or area_name.lower() in keyword:
                        matched_id = aid
                        break
                if matched_id:
                    key = area_name.replace(" ", "_").lower()
                    stats = fetch_area_stats(matched_id)
                    catalysts = fetch_area_catalysts(matched_id)
                    history = fetch_price_history(matched_id)
                    if stats:
                        prices = [float(r["price_per_sqm"]) for r in stats if r.get("price_per_sqm")]
                        room_map = defaultdict(list)
                        worth_map = defaultdict(list)
                        BEDROOM_KEYS = {
                            "0": "Studio", "0.0": "Studio",
                            "1": "1 BR",   "1.0": "1 BR",
                            "2": "2 BR",   "2.0": "2 BR",
                            "3": "3 BR",   "3.0": "3 BR",
                        }
                        for r in stats:
                            rooms = str(r.get("rooms_en", ""))
                            label = BEDROOM_KEYS.get(rooms)
                            if not label:
                                continue
                            if r.get("price_per_sqm"):
                                room_map[label].append(float(r["price_per_sqm"]))
                            if r.get("actual_worth"):
                                worth_map[label].append(float(r["actual_worth"]))
                        context_data[f"area_detail_{key}"] = {
                            "area_name": area_name,
                            "avg_psm": round(sum(prices) / len(prices), 0) if prices else None,
                            "bedroom_avg_psm": {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
                            "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
                            "catalysts": [{"name": c["name"], "date": c["expected_date"], "confidence": c["confidence"]} for c in (catalysts or [])[:3]],
                            "price_history": {str(r["sale_year"]): r["psf"] for r in (history or [])[-6:]},
                        }

    # ── Signals ──
    if any(w in msg_lower for w in ["signal", "alert", "news", "launch", "regulation", "rera", "dld"]):
        signals = fetch_signals()
        if signals:
            context_data["live_signals"] = signals[:10]

    # ── Yield vs Dubai average note ──
    intel_for_rank = context_data.get("area_intelligence", {})
    if intel_for_rank.get("gross_yield_pct"):
        diff = round(intel_for_rank["gross_yield_pct"] - 6.1, 1)
        direction = f"+{diff}%" if diff >= 0 else f"{diff}%"
        context_data["yield_vs_avg_note"] = (
            f"This area yields {direction} vs Dubai average of 6.1%. "
            + ("Above average — strong rental income." if diff >= 0 else "Below average — price appreciation play.")
        )

    # ── Build prompt ──
    has_db_data = bool(context_data)

    system = """You are ACQAR's AI analytics assistant for Dubai real estate.
You have access to 365,000+ real DLD transactions, area intelligence scores, price history, developer track records, catalyst timelines, and historical shock resilience data.

Respond ONLY in this exact JSON format — no markdown, no extra text outside the JSON:
{
  "reply": "USE THESE EXACT EMOJI SECTION HEADERS SEPARATED BY BLANK LINES:\\n\\n📊 MARKET OVERVIEW\\n[investment score X/100, verdict BUY/HOLD/WATCH, gross yield X.X% vs Dubai avg 6.1%, price trend direction, ranking, distress %]\\n\\n💰 PRICING\\n[avg PSM, min-max range, avg property worth in AED. Then PSM per bedroom: Studio AED X,XXX/sqm · 1BR AED X,XXX/sqm · 2BR AED X,XXX/sqm · 3BR AED X,XXX/sqm. Then median closed-sale totals from real DLD transactions: Studio AED XM · 1BR AED XM · 2BR AED XM · 3BR AED XM]\\n\\n🏗️ DEVELOPERS & PROJECTS\\n[list each developer on its own line: Name — X% on-time · X★ rating · avg delay X months · X projects delivered. If on_time_pct < 70 add: ⚠️ DELAY RISK — factor in avg X-month delay for off-plan. Then active project count and pipeline names.]\\n\\n📈 PRICE HISTORY\\n[year by year: 2021: AED X,XXX → 2022: AED X,XXX → ... showing trend direction clearly]\\n\\n⚡ CATALYSTS\\n[each catalyst on its own line: • Name (Type) — Date — Confidence — Expected impact on yield/price]\\n\\n🛡️ RESILIENCE\\n[each shock: • Event (Period): X% price impact, recovered in X months via Driver]\\n\\n📉 WORST CASE\\n[Only include when verdict is BUY. Use historical_shock_resilience data. Format: In past shocks this zone dropped X% and recovered in X months via [driver]. If a similar shock repeats: ~AED X,XXX/sqm downside, recovery by approx [estimated year].]\\n\\n✅ VERDICT\\n[Clear BUY/HOLD/WATCH with 2-3 specific data-backed reasons. End with yield_vs_avg_note if available.]",
  "charts": [
    {"title": "Price by Bedroom (AED/sqm)", "type": "bar", "data": [{"label": "Studio", "value": 0}, {"label": "1 BR", "value": 0}, {"label": "2 BR", "value": 0}, {"label": "3 BR", "value": 0}]},
    {"title": "Price History by Year (AED/sqft)", "type": "line", "data": [{"label": "2021", "value": 0}, {"label": "2022", "value": 0}, {"label": "2023", "value": 0}, {"label": "2024", "value": 0}, {"label": "2025", "value": 0}]},
    {"title": "Developer On-Time Delivery %", "type": "bar", "data": [{"label": "Developer Name", "value": 0}]}
  ],
  "insight": "one key actionable takeaway for an investor or buyer — must reference a specific number from the data",
  "data_source": "Acqar AVM · 365K+ DLD Transactions · Area Intelligence"
}

STRICT RULES:
- reply MUST contain ALL sections that have data — never skip a section if data exists
- Every section uses the exact emoji header shown
- charts array MUST have all 3 charts populated with real numbers from the data
- bedroom chart: use bedroom_avg_psm values
- price history chart: use price_history_by_year values — label=year string, value=avg psf
- developer chart: use developer_track_records on_time_pct — label=developer_name, value=on_time_pct
- If a chart has no data, remove it from the array entirely
- FORMAT: prices as AED X,XXX · yields as X.X% · scores as XX/100 · total prices as AED X.XXM
- DEVELOPER RISK FLAG: if any developer has on_time_pct < 70, add "⚠️ DELAY RISK: [Name] delivered only X% on time — factor in avg X-month delay for off-plan purchases."
- MEDIAN TOTAL PRICE: always show median_total_price_by_bedroom from transaction_stats in the PRICING section. Label them clearly as "Median transaction prices (real DLD closed sales, not asking prices)"
- WORST CASE BLOCK: include 📉 WORST CASE section for every BUY verdict, using historical_shock_resilience data. If no shock data exists, omit the section entirely — do not fabricate figures.
- YIELD NOTE: always end the VERDICT section with the yield_vs_avg_note if present in context data
- IF NO DB DATA: answer from expert knowledge, mark as estimates, still use section headers
- For general "best area / which area / recommend / buy" queries: list each recommended area as its own mini-report. Format: "🏙️ AREA NAME\\n📊 MARKET OVERVIEW\\n[data]\\n\\n💰 PRICING\\n[data]\\n\\n⚡ CATALYSTS\\n[data]\\n\\n✅ VERDICT\\n[reason]\\n\\n---\\n\\n🏙️ NEXT AREA NAME\\n..." repeat for top 3 areas
- Use area_detail_* keys to populate each area's real numbers — bedroom_avg_psm + median_total_price_by_bedroom for pricing, catalysts for catalysts, price_history for trend
- For multi-area responses, charts: chart 1 = investment scores comparison (bar, label=area_name, value=investment_score), chart 2 = yield comparison (bar, label=area_name, value=gross_yield_pct)"""

    user_prompt = f"""User question: {message}

{"Full data context from Acqar database:" if has_db_data else "NOTE: No specific database data found for this query. Use your expert Dubai real estate knowledge to answer in detail. State that figures are based on market knowledge, not live data."}
{json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"}

Give a detailed, analytical answer like a senior Dubai real estate analyst. {"Use all available data above — reference specific numbers from the data, especially median_total_price_by_bedroom for total price figures and yield_vs_avg_note for the yield context." if has_db_data else "Use your Dubai real estate expertise. Be specific and helpful."}"""

    try:
        response = model.generate_content(f"{system}\n\n{user_prompt}")
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        result["type"] = "structured"

        # ── Expose key signals as top-level fields for frontend hero card ──
        intel = context_data.get("area_intelligence", {})
        if intel:
            result["score"]        = intel.get("investment_score")
            result["verdict"]      = intel.get("verdict")
            result["yield_pct"]    = intel.get("gross_yield_pct")
            result["price_trend"]  = intel.get("price_trend_pct")
            result["ranking"]      = intel.get("ranking_rank")
            result["distress_pct"] = intel.get("distress_pct")

            # Yield delta vs Dubai average 6.1%
            y = intel.get("gross_yield_pct")
            if y:
                result["yield_vs_dubai_avg"] = round(y - 6.1, 2)

        return result

    except Exception as e:
        return {
            "type": "text",
            "reply": "I encountered an error processing your query. Please try rephrasing or ask about a specific Dubai area like 'Tell me about JVC' or 'Best areas for rental yield'.",
            "chart_type": "none",
            "chart_data": [],
            "insight": "",
            "data_source": "",
        }
