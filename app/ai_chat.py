# import os
# import re
# import json
# import asyncio
# import traceback
# from concurrent.futures import ThreadPoolExecutor
# from datetime import date

# from fastapi import APIRouter, UploadFile, File
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict
# from groq import Groq

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# router      = APIRouter()
# SUPABASE_URL = os.getenv("SUPABASE_URL_CHAT", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY_CHAT", "")
# supabase     = create_client(SUPABASE_URL, SUPABASE_KEY)
# PRIMARY_MODEL  = "llama-3.3-70b-versatile"
# FALLBACK_MODEL = "llama3-70b-8192"
# BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")
# _executor = ThreadPoolExecutor(max_workers=10)

# class ChatRequest(BaseModel):
#     message: str
#     history: list = []

# AREA_ID_MAP = {
#     "jumeirah village circle": 59, "dubai creek harbour": 1509,
#     "dubai hills estate": 53, "arabian ranches 3": 16296,
#     "arabian ranches 2": 133, "arabian ranches": 133,
#     "jumeirah lake towers": 12, "jumeirah golf estates": 347,
#     "dubai sports city": 67, "dubai internet city": 1621,
#     "dubai production city": 5036, "dubai media city": 95,
#     "dubai harbour": 3512, "barsha heights": 25,
#     "discovery gardens": 13, "international city": 368,
#     "palm jumeirah": 410, "palm jebel ali": 1519,
#     "silicon oasis": 295, "bluewaters island": 1754,
#     "business bay": 54, "downtown dubai": 10,
#     "damac hills": 279, "damac hills 2": 352,
#     "damac lagoons": 75266, "tilal al ghaf": 5173,
#     "dubai islands": 5178, "creek harbour": 1509,
#     "dubai marina": 330, "dubai hills": 53,
#     "jumeirah park": 73, "sports city": 67,
#     "town square": 386, "dubai south": 3355,
#     "motor city": 268, "al furjan": 41,
#     "bluewaters": 1754, "al barsha": 105,
#     "al jaddaf": 1509, "al karama": 271,
#     "al satwa": 1347, "nad al sheba": 161,
#     "oud metha": 388, "expo city": 85082,
#     "dubailand": 51, "meydan": 43,
#     "downtown": 10, "the greens": 25,
#     "jaddaf": 1509, "tecom": 25, "greens": 25,
#     "karama": 271, "satwa": 1347, "mirdif": 232,
#     "marina": 330, "palm": 410, "difc": 117,
#     "impz": 5036, "arjan": 91, "dso": 295,
#    "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
#     "burj khalifa": 390,
#     "jumeirah first": 317, "jumeirah second": 375, "jumeirah third": 318,
#     "al wasl": 914,
#     "pearl jumeirah": 344,
#     "green community": 673,
#     "dubai festival city": 277,
#     "dubai studio city": 81,
#     "world islands": 413,
#     "palm deira": 432, "palm jabal ali": 411,
#     "living legends": 52,
#     "al quoz": 293,
#     "al safa": 313,
#     "dubai design district": 22688, "d3": 22688,
#     "dubai maritime city": 2848,
#     "culture village": 190, "jaddaf waterfront": 190,
#     "dubai land residence complex": 603,
#     "trade center": 341,
#     "bur dubai": 345,
# }

# AREA_DISPLAY_NAMES = {
#     36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
#     10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
#     23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
#     117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
#     3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
#     67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills 2 (Akoya by DAMAC)",
#     386: "Town Square", 91: "Arjan", 105: "Al Barsha", 295: "Dubai Silicon Oasis (DSO)",
#     232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
#     25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
#     43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
#     51: "Dubailand", 85082: "Expo City Dubai",
#     330: "Dubai Marina", 390: "Burj Khalifa", 317: "Jumeirah First",
#     375: "Jumeirah Second", 318: "Jumeirah Third", 914: "Al Wasl",
#     344: "Pearl Jumeirah", 673: "Green Community", 277: "Dubai Festival City",
#     81: "Dubai Studio City", 413: "World Islands", 432: "Palm Deira",
#     411: "Palm Jabal Ali", 52: "Living Legends", 293: "Al Quoz",
#     313: "Al Safa", 22688: "Dubai Design District (D3)",
#     2848: "Dubai Maritime City", 190: "Culture Village (Jaddaf Waterfront)",
#     603: "Dubai Land Residence Complex", 341: "Trade Center First",
# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
#     "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
#     "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
# }

# # These actually map to specific areas in LIFESTYLE_AREA_MAP — trigger area search
# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "golf", "waterfront", "airbnb", "short term", "holiday home",
#     "freehold", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 73], "family": [53, 73, 133, 59],
#     "school": [53, 73, 133], "expat": [330, 10, 54, 12],
#     "beach": [410, 330, 1754], "beachfront": [410, 1754],
#     "luxury": [410, 10, 330, 117], "affordable": [59, 91, 13, 368],
#     "cheap": [59, 368, 13], "budget": [59, 13, 368],
#     "golf": [347, 352, 53], "waterfront": [330, 410, 12, 1754],
#     "metro": [25, 12, 54, 10], "airbnb": [330, 10, 54, 1754],
#     "short term": [330, 10, 54], "holiday home": [410, 330, 1754],
#     "villa": [73, 133, 352, 53], "freehold": [59, 330, 54, 10],
# }

# MARKET_KEYWORDS = [
#     "best area", "top area", "highest yield", "compare", "market overview",
#     "which area", "recommend", "suggest", "vs", "versus",
#     "where to buy", "where should", "top 5", "top 3", "best areas",
#     "rank", "ranking", "overview", "investment score", "highest score",
#     "best investment", "top investment",
# ]

# YIELD_KEYWORDS = [
#     "yield", "rental yield", "highest yield", "best yield",
#     "top yield", "rental income", "gross yield",
# ]

# VAGUE_PATTERNS = [
#     "just landed", "new to dubai", "moving to dubai", "relocating",
#     "want to buy", "looking to buy", "thinking of buying",
#     "buy property in dubai", "invest in dubai", "where should i buy",
#     "help me find", "guide me", "not sure", "any suggestions",
#     "what should i buy", "where to start", "i don't know", "i dont know",
# ]

# NO_DP_KEYWORDS = [
#     "no downpayment", "no down payment", "without downpayment", "without down payment",
#     "zero downpayment", "zero down payment", "0 downpayment", "0 down payment",
#     "no dp", "without dp", "downpayment not required", "down payment not required",
#     "no money for downpayment", "don't have downpayment", "do not have downpayment",
#     "not have sufficient funds", "insufficient funds", "not sufficient funds",
#     "no sufficient funds", "way around", "workaround", "post handover",
#     "post-handover", "payment plan", "0% downpayment", "emi only",
#     "salary and side income", "side income",
# ]

# FINANCING_KEYWORDS = [
#     "emi", "mortgage", "home loan", "bank loan", "financing", "finance",
#     "monthly payment", "instalment", "installment", "pre-approval",
#     "murabaha", "ltv", "down payment", "downpayment", "ready to move",
# ]


# BUYER_KEYWORDS = [
#     "buy", "buying", "purchase", "i want to buy", "looking to buy",
#     "first time buyer", "end user", "own use", "live in", "to live",
#     "move in", "move to", "living in", "reside", "residence",
#     "family home", "apartment for myself", "home for", "which area should i",
#     "where should i buy", "afford", "for myself", "for my family",
#     "to stay", "to reside", "end-user", "for living", "off-plan", "oqood", "spa", "defect", "snagging", "handover",
# "cooling off", "escrow", "noc", "form f", "title deed", "freehold",
# "leasehold", "service charge", "golden visa", "dewa", "pre-approval",
# "ltv", "murabaha", "mortgage", "down payment", "first time",

# ]
# SELLER_KEYWORDS = [
#     "sell", "selling", "list", "listing", "put on market", "good time to sell",
#     "should i sell", "when to sell", "exit", "offload", "dispose",
#     "my property", "my apartment", "my villa", "i own", "i have a property",
#     "sale price", "asking price", "how much can i sell", "want to sell",
#     "looking to sell", "thinking of selling", "time to sell", "evict", "eviction", "tenancy", "vacant possession", "assignment",
# "power of attorney", "poa", "repatriate", "capital gain", "flip",
# "listing", "mandate", "valuation", "form a", "form b",
# ]
# INVESTOR_KEYWORDS = [
#     "invest", "investment", "roi", "return", "yield", "rental yield",
#     "rental income", "passive income", "portfolio", "capital appreciation",
#     "cash flow", "gross yield", "net yield", "off plan", "off-plan",
#     "hold", "flip", "exit strategy", "capital gain", "rental return",
#     "buy to let", "buy-to-let", "multiple units", "diversify",
#     "best return", "highest return", "income property", "rent out",
#     "tenant", "letting", "rental property","airbnb", "short term rental", "holiday home", "dtcm", "flip",
# "assignment", "occupancy rate", "net yield", "service charge",
# "token", "reit", "hotel apartment", "co-living", "d33",
# ]
# BROKER_KEYWORDS = [
#     "broker", "agent", "realtor", "rera", "client", "my client", "clients",
#     "commission", "viewings", "leads", "prospect", "pipeline",
#     "market report", "area report", "pitch", "present to client",
#     "comparable", "comps", "transaction data", "dld data",
#     "i am an agent", "i'm an agent", "i work in real estate",
#     "real estate professional", "property consultant", "give me comparables",
#     "for my client", "i work as", "rera card", "rera licence", "commission split", "lead generation",
# "bayut", "property finder", "off-plan launch", "form a", "form b",
# "dual agency", "co-broking", "aml", "ejari", "crm", "mandate",
# "exclusive listing", "tyre-kicker", "co-broke",
# ]


# def detect_user_type(msg_lower: str) -> str:
#     if any(k in msg_lower for k in BROKER_KEYWORDS):   return "broker"
#     if any(k in msg_lower for k in SELLER_KEYWORDS):   return "seller"
#     if any(k in msg_lower for k in INVESTOR_KEYWORDS): return "investor"
#     if any(k in msg_lower for k in BUYER_KEYWORDS):    return "buyer"
#     return "general"


# def detect_language(text: str):
#     """Returns (lang_code, direction)"""
#     # Arabic script block (covers Arabic + Urdu)
#     if re.search(r'[\u0600-\u06FF\u0750-\u077F]', text):
#         # Urdu-specific letters: ٹ ڈ ڑ ں ھ ہ ے etc.
#         if re.search(r'[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06C2\u06D2]', text):
#             return "ur", "rtl"
#         return "ar", "rtl"
#     if re.search(r'[\u4e00-\u9fff]', text):          # Chinese
#         return "zh", "ltr"
#     return "en", "ltr"


# LANG_NAMES = {"ar": "Arabic", "ur": "Urdu", "zh": "Simplified Chinese"}


# def translate_result_texts(result: dict, lang: str) -> dict:
#     """Translates summary / reply / insight via Groq. Numbers, URLs, emojis stay intact."""
#     target = LANG_NAMES.get(lang)
#     if not target:
#         return result

#     payload = {
#         "summary": result.get("summary", ""),
#         "reply":   result.get("reply", ""),
#         "insight": result.get("insight", ""),
#     }
#     sys = (
#         f"You are a translator. Translate the JSON string values into {target}.\n"
#         "STRICT RULES:\n"
#         "- Keep ALL numbers, AED amounts, percentages, dates EXACTLY unchanged\n"
#         "- Keep area names (e.g. Dubai Marina, JVC), developer names, and URLs unchanged\n"
#         "- Keep all emojis, bullet symbols (•), and line breaks (\\n) in the same positions\n"
#         "- TRANSLATE section header text (e.g. '📌 INVESTMENT VERDICT' → '📌 قرار الاستثمار') but the emoji must remain the FIRST character of the header line\n"
#         "- Return ONLY valid JSON with the same keys: summary, reply, insight"
#     )
#     messages = [
#         {"role": "system", "content": sys},
#         {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
#     ]

#     def call(model):
#         resp = groq_client.chat.completions.create(
#             model=model, messages=messages, temperature=0,
#             max_tokens=2500, response_format={"type": "json_object"},
#         )
#         return resp.choices[0].message.content.strip()

#     try:
#         try:    raw = call(PRIMARY_MODEL)
#         except: raw = call(FALLBACK_MODEL)
#         translated = extract_json(raw)
#         for k in ("summary", "reply", "insight"):
#             if translated.get(k):
#                 result[k] = translated[k]
#     except Exception as e:
#         print(f"[ACQAR] translation error: {e}")  # fail silently → English fallback
#     return result



# def translate_to_english(text: str) -> str:
#     """Translate user query to English so keyword/area detection works. Returns original on failure."""
#     try:
#         resp = groq_client.chat.completions.create(
#             model=PRIMARY_MODEL,
#             messages=[
#                 {"role": "system", "content": (
#                     "Translate the user's message to English. Return ONLY the translated text, nothing else. "
#                     "Use standard English names for Dubai areas (e.g. واحة دبي للسيليكون → Dubai Silicon Oasis, "
#                     "دبي مارينا → Dubai Marina, وسط مدينة دبي → Downtown Dubai, الخليج التجاري → Business Bay, "
#                     "نخلة جميرا → Palm Jumeirah). Keep numbers, AED amounts, and percentages unchanged."
#                 )},
#                 {"role": "user", "content": text},
#             ],
#             temperature=0, max_tokens=400,
#         )
#         return resp.choices[0].message.content.strip()
#     except Exception as e:
#         print(f"[ACQAR] translate-to-english error: {e}")
#         return text

# def _fix_unescaped_newlines(s: str) -> str:
#     result, in_str, escaped = [], False, False
#     for ch in s:
#         if escaped: result.append(ch); escaped = False; continue
#         if ch == "\\" and in_str: result.append(ch); escaped = True; continue
#         if ch == '"': in_str = not in_str; result.append(ch); continue
#         if in_str:
#             if ch == "\n": result.append("\\n"); continue
#             if ch == "\r": result.append("\\r"); continue
#             if ch == "\t": result.append("\\t"); continue
#         result.append(ch)
#     return "".join(result)


# def extract_json(raw: str) -> dict:
#     raw = raw.strip()
#     if raw.startswith("```"):
#         raw = re.sub(r"^```(?:json)?", "", raw); raw = re.sub(r"```$", "", raw); raw = raw.strip()
#     for attempt in [raw, _fix_unescaped_newlines(raw)]:
#         try: return json.loads(attempt)
#         except: pass
#     match = re.search(r'\{.*\}', raw, re.DOTALL)
#     if match:
#         for attempt in [match.group(0), _fix_unescaped_newlines(match.group(0))]:
#             try: return json.loads(attempt)
#             except: pass
#     return {"summary": "", "reply": raw, "charts": [], "insight": ""}


# def get_area_id(msg_lower: str):
#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         if kw in msg_lower: return AREA_ID_MAP[kw], kw
#     return None, None


# def get_all_area_ids(msg_lower: str) -> list:
#     found, seen = [], set()
#     matched_spans = []  # character ranges already claimed by a longer keyword

#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         idx = msg_lower.find(kw)
#         while idx != -1:
#             end = idx + len(kw)
#             overlaps = any(idx < s_end and end > s_start for s_start, s_end in matched_spans)
#             if not overlaps:
#                 aid = AREA_ID_MAP[kw]
#                 if aid not in seen:
#                     found.append((aid, kw))
#                     seen.add(aid)
#                 matched_spans.append((idx, end))
#                 break  # this keyword has claimed its mention, stop looking for more occurrences
#             idx = msg_lower.find(kw, idx + 1)

#     return found


# def get_lifestyle_areas(msg_lower: str) -> list:
#     scores = defaultdict(int)
#     for kw, aids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if kw in msg_lower:
#             for rank, aid in enumerate(aids): scores[aid] += (5 - rank)
#     return sorted(scores, key=lambda x: -scores[x])[:4]


# # ── CHANGE 1: EMI detection added to extract_budget ──────────────
# def extract_budget(msg: str):
#     mc = msg.lower().replace(",", "").replace("aed", "").strip()

#     # Detect monthly EMI/salary → estimate property budget
#     emi_match = re.search(r'emi\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
#     if not emi_match:
#         emi_match = re.search(r'(\d+)\s*/?\s*month', mc)
#     if not emi_match:
#         emi_match = re.search(r'salary\s+(?:is\s+|of\s+)?(?:aed\s+)?(\d+)', mc)
#     if emi_match:
#         emi = float(emi_match.group(1).replace(",", ""))
#         if 2000 < emi < 150000:  # sanity: monthly figure
#             return round(emi * 150)  # ~12yr mortgage estimate

#     for pat in [r'(\d+\.?\d*)\s*(?:million|m)\b', r'(\d{7,})', r'(\d+\.?\d*)\s*k\b']:
#         m = re.search(pat, mc)
#         if m:
#             val = float(m.group(1)); tail = mc[m.start():m.end()+2]
#             if "k" in tail: return val * 1_000
#             if val < 1000:  return val * 1_000_000
#             return val
#     return None


# def extract_bedrooms(msg: str):
#     m = msg.lower()
#     for pat, label in [
#         (r'\bstudio\b',"Studio"),(r'\b1[\s-]*(?:br|bed|bedroom)\b',"1 BR"),
#         (r'\b2[\s-]*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3[\s-]*(?:br|bed|bedroom)\b',"3 BR"),
#         (r'\b4[\s-]*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
#         (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
#     ]:
#         if re.search(pat, m): return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle: return False
#     if any(k in msg_lower for k in NO_DP_KEYWORDS): return False
#     if any(k in msg_lower for k in FINANCING_KEYWORDS): return False
#     # Seller without area → ask which area
#     is_seller = any(k in msg_lower for k in SELLER_KEYWORDS)
#     has_specific = any(w in msg_lower for w in [
#         "yield","price","psm","sqm","trend","compare","vs","score",
#         "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
#         "commission","fee","broker","agent","process","how to","documents","noc","visa",
#     ])
#     if is_seller and not has_specific: return True
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values: return None
#     s = sorted(values); n = len(s); mid = n // 2
#     return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))

# def pick_hero_area(context_data: dict) -> dict:
#     """Returns intel/stats/cats/hist for whichever area should drive the widget cards."""
#     if context_data.get("area_intelligence") and context_data["area_intelligence"].get("area_name_en"):
#         return {
#             "intel": context_data["area_intelligence"],
#             "stats": context_data.get("transaction_stats", {}),
#             "cats":  context_data.get("area_catalysts", []),
#             "hist":  context_data.get("price_history_by_year", {}),
#         }

#     lifestyle_keys = [k for k in context_data if k.startswith("lifestyle_")]
#     if lifestyle_keys:
#         best_key = max(
#             lifestyle_keys,
#             key=lambda k: float((context_data[k].get("area_intelligence") or {}).get("investment_score") or 0)
#         )
#         sub = context_data[best_key]
#         if (sub.get("area_intelligence") or {}).get("area_name_en"):
#             return {
#                 "intel": sub.get("area_intelligence", {}),
#                 "stats": sub.get("transaction_stats", {}),
#                 "cats":  sub.get("area_catalysts", []),
#                 "hist":  sub.get("price_history_by_year", {}),
#             }

#     if context_data.get("budget_search_areas"):
#         areas = context_data["budget_search_areas"]
#         if areas and areas[0].get("area_name_en"):
#             top = areas[0]
#             return {
#                 "intel": {
#                     "area_name_en":     top.get("area_name_en"),
#                     "truvalu_psm":      top.get("truvalu_psm"),
#                     "gross_yield_pct":  top.get("gross_yield_pct"),
#                     "investment_score": top.get("investment_score"),
#                     "verdict":          top.get("verdict"),
#                     "price_trend_pct":  top.get("price_trend_pct"),
#                 },
#                 "stats": {}, "cats": [], "hist": {},
#             }

#     for key in ("top_yield_areas", "top_areas", "dubai_market_context"):
#         data = context_data.get(key)
#         if data and data[0].get("area_name_en"):
#             top = data[0]
#             return {
#                 "intel": {
#                     "area_name_en":     top.get("area_name_en"),
#                     "truvalu_psm":      top.get("truvalu_psm"),
#                     "gross_yield_pct":  top.get("gross_yield_pct"),
#                     "investment_score": top.get("investment_score"),
#                     "verdict":          top.get("verdict"),
#                     "price_trend_pct":  top.get("price_trend_pct"),
#                 },
#                 "stats": {}, "cats": [], "hist": {},
#             }

#     return {"intel": {}, "stats": {}, "cats": [], "hist": {}}


# def fmt_aed(v) -> str:
#     if v is None: return ""
#     v = float(v)
#     if v >= 1_000_000: return f"AED {v/1_000_000:.2f}M"
#     if v >= 1_000:     return f"AED {int(v):,}"
#     return f"AED {v:.0f}"


# def fmt_psm(v) -> str:
#     if v is None: return ""
#     return f"AED {int(float(v)):,}/sqm"


# def area_to_slug(area_name: str) -> str:
#     slug = area_name.lower().strip()
#     slug = re.sub(r'\s+', '-', slug)
#     slug = re.sub(r'[^a-z0-9-]', '', slug)
#     return slug


# # ─────────────────────────────────────────────────────────────────
# # SUPABASE FETCHERS
# # ─────────────────────────────────────────────────────────────────
# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, completion_rate, residential_units, "
#             "parks_info, retail_info, active_project_count, buyer_nationalities, "
#             "key_developers, active_project_names, tx_7d, tx_7d_delta_pct, "
#             "distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except: return None


# def fetch_area_stats(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select(
#             "price_per_sqm, procedure_area, actual_worth, rooms_en, property_type_en, sale_year, sale_month"
#         ).eq("area_id", area_id).not_.is_("sale_year", "null").order(
#             "sale_year", desc=True
#         ).order("sale_month", desc=True).limit(100).execute()
#         return res.data or []
#     except: return []


# def fetch_price_history(area_id: int) -> list:
#     try:
#         res = supabase.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).limit(36).execute()
#         return res.data or []
#     except: return []


# def fetch_area_catalysts(area_id: int) -> list:
#     try:
#         today = date.today().isoformat()
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").gte("expected_date", today).order("expected_date", desc=False).limit(5).execute()
#         return res.data or []
#     except: return []


# def fetch_developer_track_records(developer_names: list) -> list:
#     try:
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean: return []
#         res = supabase.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except: return []


# def fetch_area_shock_impacts(zone_type: str) -> list:
#     try:
#         if not zone_type: return []
#         res = supabase.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except: return []


# def fetch_top_areas_intelligence(limit: int = 20) -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(limit).execute()
#         return res.data or []
#     except: return []


# def fetch_top_yield_areas() -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, gross_yield_pct, investment_score, verdict, truvalu_psm, price_trend_pct"
#         ).not_.is_("gross_yield_pct", "null").order("gross_yield_pct", desc=True).limit(10).execute()
#         return res.data or []
#     except: return []


# def fetch_dld_projects(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select("project_name_en").eq("area_id", area_id).not_.is_("project_name_en", "null").limit(100).execute()
#         if not res.data: return []
#         counts = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"): counts[r["project_name_en"]] += 1
#         return sorted(counts.items(), key=lambda x: -x[1])[:5]
#     except: return []


# async def _run(func, *args):
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(_executor, func, *args)


# async def build_area_context_async(area_id: int, detected_keyword: str, context_data: dict):
#     name = preferred_name(area_id, detected_keyword)
#     context_data["detected_area"] = name
#     context_data["area_id"]       = area_id

#     intel, area_data, history, catalysts, projects = await asyncio.gather(
#         _run(fetch_area_intelligence, area_id),
#         _run(fetch_area_stats, area_id),
#         _run(fetch_price_history, area_id),
#         _run(fetch_area_catalysts, area_id),
#         _run(fetch_dld_projects, area_id),
#     )

#     dev_records = []; shock_data = []
#     if intel:
#         devs = intel.get("key_developers") or []; zone = intel.get("zone_type")
#         tasks = []
#         fd = bool(devs); fs = bool(zone)
#         if fd: tasks.append(_run(fetch_developer_track_records, devs))
#         if fs: tasks.append(_run(fetch_area_shock_impacts, zone))
#         results = await asyncio.gather(*tasks) if tasks else []
#         idx = 0
#         if fd: dev_records = results[idx] or []; idx += 1
#         if fs: shock_data  = results[idx] or []

#     if intel:       context_data["area_intelligence"]           = intel
#     if dev_records: context_data["developer_track_records"]     = dev_records
#     if shock_data:  context_data["historical_shock_resilience"] = shock_data

#     if area_data:
#         prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#         worths = [float(r["actual_worth"])   for r in area_data if r.get("actual_worth")]
#         room_psm = defaultdict(list); room_worth = defaultdict(list)
#         room_count = defaultdict(int)
#         year_map = defaultdict(list)

#         for r in area_data:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 room_count[label] += 1
#                 if r.get("price_per_sqm"): room_psm[label].append(float(r["price_per_sqm"]))
#                 worth = r.get("actual_worth")
#                 # Fall back to price_per_sqm × procedure_area when actual_worth is missing
#                 if not worth and r.get("price_per_sqm") and r.get("procedure_area"):
#                     worth = float(r["price_per_sqm"]) * float(r["procedure_area"])
#                 if worth: room_worth[label].append(float(worth))
#             if r.get("sale_year") and r.get("price_per_sqm"):
#                 year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#         def is_valid_bedroom(br: str) -> bool:
#             if room_count.get(br, 0) < 3: return False
#             med = median_val(room_worth.get(br, []))
#             if med and float(med) > 20_000_000: return False
#             return True

#         context_data["transaction_stats"] = {
#             "count":                   len(area_data),
#             "avg_price_sqm":           round(sum(prices)/len(prices), 0) if prices else None,
#             "min_price_sqm":           round(min(prices), 0) if prices else None,
#             "max_price_sqm":           round(max(prices), 0) if prices else None,
#             "avg_worth_aed":           round(sum(worths)/len(worths), 0) if worths else None,
#             "bedroom_avg_psm":         {k: round(sum(v)/len(v), 0) for k, v in room_psm.items() if is_valid_bedroom(k)},
#             "yearly_avg_psm":          {str(k): round(sum(v)/len(v), 0) for k, v in sorted(year_map.items())},
#             "median_price_by_bedroom": {k: median_val(v) for k, v in room_worth.items() if is_valid_bedroom(k)},
#         }

#     if history:
#         year_avg = defaultdict(list)
#         for r in history: year_avg[r["sale_year"]].append(r["psf"])
#         context_data["price_history_by_year"] = {str(y): round(sum(v)/len(v), 0) for y, v in sorted(year_avg.items())}
#     elif context_data.get("transaction_stats", {}).get("yearly_avg_psm"):
#         # price_history_manual is empty — fall back to real avm-derived yearly averages
#         context_data["price_history_by_year"] = context_data["transaction_stats"]["yearly_avg_psm"]

#     # If area_intelligence.price_trend_pct is missing, derive it from real avm-based
#     # yearly averages (same-source, consecutive-year comparison — no unit mixing).
#     if context_data.get("area_intelligence") and not context_data["area_intelligence"].get("price_trend_pct"):
#         yearly = context_data.get("price_history_by_year") or {}
#         if len(yearly) >= 2:
#             years = sorted(yearly.keys())
#             old_v = yearly[years[-2]]
#             new_v = yearly[years[-1]]
#             if old_v:
#                 derived_trend = round(((new_v - old_v) / old_v) * 100, 1)
#                 context_data["area_intelligence"]["price_trend_pct"] = derived_trend
#                 context_data["price_trend_is_derived"] = True

#     if catalysts: context_data["area_catalysts"] = catalysts
#     if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# # ─────────────────────────────────────────────────────────────────
# # REPLY BUILDERS (unchanged from your working version)
# # ─────────────────────────────────────────────────────────────────

# def build_lifestyle_reply(ctx: dict, bedrooms: str) -> str:
#     lines = []
#     lifestyle_tags = ctx.get("_lifestyle_tags", [])
#     priority_tags = [t for t in lifestyle_tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
#     tag_str = " & ".join(t.title() for t in priority_tags[:2]) + " Living" if priority_tags else "Family Living"

#     # Collect lifestyle sub-contexts
#     areas = []
#     for k, v in ctx.items():
#         if k.startswith("lifestyle_") and isinstance(v, dict):
#             intel = v.get("area_intelligence") or {}
#             stats = v.get("transaction_stats") or {}
#             cats  = v.get("area_catalysts") or []
#             hist  = v.get("price_history_by_year") or {}
#             devs  = v.get("developer_track_records") or []
#             name  = intel.get("area_name_en") or v.get("detected_area", "")
#             if name:
#                 areas.append({
#                     "name": name, "intel": intel, "stats": stats,
#                     "cats": cats, "hist": hist, "devs": devs,
#                 })

#     if not areas:
#         return build_general_reply(ctx, bedrooms)

#     lines.append(f"📌 DIRECT ANSWER")
#     lines.append(f"• Here are the top {len(areas)} areas where British families with kids actually live in Dubai — based on real buyer nationality data, school proximity, and DLD closed-sale prices")
#     lines.append(f"• All prices are real DLD closed sales — not asking prices, not agent estimates")

#     lines.append(f"\n💡 YOUR OPTIONS — {len(areas)} Areas to Consider")

#     for i, area in enumerate(areas, 1):
#         name  = area["name"]
#         intel = area["intel"]
#         stats = area["stats"]
#         cats  = area["cats"]
#         hist  = area["hist"]
#         devs  = area["devs"]

#         score   = intel.get("investment_score")
#         yld     = intel.get("gross_yield_pct")
#         verdict = (intel.get("verdict") or "").upper()
#         trend   = intel.get("price_trend_pct")
#         rank    = intel.get("ranking_rank")
#         parks   = intel.get("parks_info") or ""
#         retail  = intel.get("retail_info") or ""
#         nats    = intel.get("buyer_nationalities") or []
#         devlist = intel.get("key_developers") or []
#         off_plan= intel.get("active_project_names") or []
#         bmed    = stats.get("median_price_by_bedroom") or {}
#         bpsm    = stats.get("bedroom_avg_psm") or {}

#         lines.append(f"\nOption {i} — {name}")

#         # Score + verdict
#         if score:
#             lines.append(f"• Investment Score: {score}/100" + (f" — Verdict: {verdict}" if verdict else ""))
        

#         # Yield
#         if yld:
#             diff = round(float(yld) - 6.1, 2)
#             lines.append(f"• Gross Yield: {yld}% ({'+' if diff>=0 else ''}{diff}% vs Dubai avg 6.1%)")

#         # Price trend
#         if trend is not None:
#             direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
#             lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% YoY ({direction})")

#         # Community
#         if parks:  lines.append(f"• Green spaces: {parks}")
#         if retail: lines.append(f"• Amenities: {retail}")

#         # Nationalities — show British % prominently
#         if nats:
#             brit = next((n for n in nats if "british" in n.get("name","").lower() or "uk" in n.get("name","").lower()), None)
#             top2 = nats[:2]
#             nat_str = " · ".join([f"{n.get('flag','')} {n.get('name','')} {n.get('pct','')}%" for n in top2])
#             lines.append(f"• Who buys here: {nat_str}")
#             if brit:
#                 lines.append(f"• British presence: {brit.get('flag','🇬🇧')} {brit.get('pct','')}% of all buyers — strong expat community")

#         # Developers
#         if devlist:
#             lines.append(f"• Key developers: {' · '.join(devlist[:3])}")

#         # Off-plan projects
#         if off_plan:
#             lines.append(f"• Active off-plan projects: {' · '.join(off_plan[:3])}")
#         else:
#             lines.append(f"• Off-plan: No active launches — secondary market only")

#         # Entry prices by bedroom
#         target_br = bedrooms or "3 BR"
#         if bmed:
#             med = bmed.get(target_br) or bmed.get("2 BR") or (list(bmed.values())[0] if bmed else None)
#             psm = bpsm.get(target_br) or bpsm.get("2 BR") or (list(bpsm.values())[0] if bpsm else None)
#             if med:
#                 line = f"• {target_br} median price: {fmt_aed(med)} (real DLD closed sale)"
#                 if psm: line += f" · {fmt_psm(psm)}"
#                 lines.append(line)
#             # Show all bedroom types
#             for br in ["2 BR", "3 BR", "4 BR"]:
#                 if br == target_br or br not in bmed: continue
#                 lines.append(f"• {br}: {fmt_aed(bmed[br])}" + (f" · {fmt_psm(bpsm[br])}" if br in bpsm else ""))

#         # Past → Present → Future
#         if hist and len(hist) >= 2:
#             years = sorted(hist.keys())
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg   = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
#             lines.append(f"• Past → Present: {fmt_psm(old_v)} ({years[0]}) → {fmt_psm(new_v)} ({years[-1]}) = {'+' if chg>0 else ''}{chg}%")
#             if chg != 0:
#                 projected = round(float(new_v) * (1 + chg / 100), 0)
#                 lines.append(f"• Future (projected ~{int(years[-1])+1}): ~{fmt_psm(projected)} at current trend rate")
#         elif trend is not None and bpsm:
#             avg_psm = list(bpsm.values())[0]
#             projected = round(float(avg_psm) * (1 + float(trend) / 100), 0)
#             lines.append(f"• Future (projected): ~{fmt_psm(projected)} in 12 months at {'+' if float(trend)>0 else ''}{trend}% trend")

#         # Developer track records
#         if devs:
#             for d in devs[:2]:
#                 flag = " ⚠️ delay risk" if (d.get("on_time_pct") or 100) < 70 else ""
#                 lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

#         # Top catalyst
#         if cats:
#             cat = cats[0]
#             desc = cat.get("description") or ""
#             desc_str = f" — {desc}" if desc else ""
#             lines.append(f"• Upcoming: {cat.get('name','')} ({cat.get('expected_date','soon')}){desc_str}")

#     # Budget summary from best area
#     lines.append(f"\n💰 YOUR REALISTIC NUMBERS")
#     best = areas[0]
#     bmed = best["stats"].get("median_price_by_bedroom") or {}
#     all_meds = sorted([v for v in bmed.values() if v])
#     if all_meds:
#         lines.append(f"• Estimated property budget: {fmt_aed(min(all_meds))} – {fmt_aed(max(all_meds))}")
#     lines.append(f"• Minimum cash needed: AED 100,000+ (DLD 4% transfer fee mandatory regardless of financing)")
#     best_names = " · ".join([a["name"] for a in areas[:3]])
#     lines.append(f"• Best areas for your profile: {best_names}")

#     lines.append(f"\n⚠️ CRITICAL WARNINGS")
#     lines.append("• Check school catchment zones BEFORE committing — not all schools accept from all communities")
#     lines.append("• Service charges: 10–20 AED/sqft/year — always confirm before signing SPA")

#     school_map = {
#         "Dubai Hills Estate": "GEMS New Millennium, King's College School Dubai",
#         "Jumeirah": "Jumeirah English Speaking School (JESS), Dubai College",
#         "Jumeirah Park": "Regent International School, Dubai British School",
#         "Arabian Ranches": "JESS Arabian Ranches, Ranches Primary School",
#         "Arabian Ranches 2": "JESS Arabian Ranches, Ranches Primary School",
#         "Jumeirah Village Circle (JVC)": "JSS International School, Sunmarke School",
#         "Palm Jumeirah": "Dubai English Speaking School, GEMS Wellington Primary",
#         "Dubai Marina": "Dubai British School, Emirates International School",
#     }
#     lines.append(f"\n✅ NEXT STEPS — Do These This Week")
#     for i, area in enumerate(areas[:3], 1):
#         schools = school_map.get(area["name"], "check local British curriculum schools nearby")
#         lines.append(f"• Step {i}: Visit {area['name']} — nearest British schools: {schools}")
#     lines.append(f"• Step 4: Get a mortgage pre-approval before viewing — UAE banks take 3–5 working days")

#     return "\n".join(lines)



# def build_comparison_reply(ctx: dict, bedrooms: str) -> str:
#     lines = []
#     comparison_keys = [k for k in ctx if k.startswith("comparison_")]

#     areas = []
#     for k in comparison_keys:
#         sub = ctx[k]
#         if not isinstance(sub, dict): continue
#         intel = sub.get("area_intelligence") or {}
#         stats = sub.get("transaction_stats") or {}
#         cats  = sub.get("area_catalysts") or []
#         hist  = sub.get("price_history_by_year") or {}
#         name  = intel.get("area_name_en") or sub.get("detected_area", "")
#         if name:
#             areas.append({"name": name, "intel": intel, "stats": stats, "cats": cats, "hist": hist})

#     if len(areas) < 2:
#         return build_general_reply(ctx, bedrooms)

#     a, b = areas[0], areas[1]
#     target_br = bedrooms or "2 BR"

#     yld_a = a["intel"].get("gross_yield_pct"); yld_b = b["intel"].get("gross_yield_pct")
#     score_a = a["intel"].get("investment_score"); score_b = b["intel"].get("investment_score")
#     trend_a = a["intel"].get("price_trend_pct"); trend_b = b["intel"].get("price_trend_pct")

#     lines.append("📌 DIRECT ANSWER")
#     lines.append(
#         f"I pulled real DLD closed-sale data for both {a['name']} and {b['name']} — no asking-price "
#         f"guesswork, just what actually sold. Here's how they compare."
#     )

#     # ── Price history, written as prose, addressing both areas together ──
#     hist_sentences = []
#     for area in (a, b):
#         hist = area.get("hist", {})
#         if hist and len(hist) >= 2:
#             years = sorted(hist.keys())
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
#             direction = "climbed" if chg > 0 else "eased back"
#             sentence = (
#                 f"{area['name']} has {direction} from {fmt_psm(old_v)} in {years[0]} to "
#                 f"{fmt_psm(new_v)} in {years[-1]} — a {'+' if chg>0 else ''}{chg}% move"
#             )
#             if chg != 0:
#                 projected = round(float(new_v) * (1 + chg / 100), 0)
#                 sentence += f", putting it on track for roughly {fmt_psm(projected)} by {int(years[-1])+1} if the trend holds"
#             hist_sentences.append(sentence + ".")
#         else:
#             hist_sentences.append(
#                 f"{area['name']} doesn't have enough historical DLD records yet to chart a reliable price trend — "
#                 f"once more transactions land, that'll fill in."
#             )

#     if hist_sentences:
#         lines.append("\n📈 HOW PRICES HAVE MOVED")
#         lines.append(" ".join(hist_sentences))

#     # ── Analysis, written conversationally ──
#     lines.append("\n🔍 WHAT THIS TELLS US")
#     analysis_bits = []
#     if yld_a and yld_b:
#         if float(yld_a) != float(yld_b):
#             better_yield = a["name"] if float(yld_a) > float(yld_b) else b["name"]
#             worse_yield_val = min(float(yld_a), float(yld_b))
#             better_yield_val = max(float(yld_a), float(yld_b))
#             analysis_bits.append(
#                 f"On rental income, {better_yield} is the stronger of the two — {better_yield_val}% "
#                 f"gross yield versus {worse_yield_val}%, so an investor chasing cash flow would lean that way."
#             )
#         else:
#             analysis_bits.append(f"Both areas post an identical {yld_a}% gross yield, so yield alone won't decide it for you.")

#     if score_a and score_b:
#         if float(score_a) != float(score_b):
#             better_score = a["name"] if float(score_a) > float(score_b) else b["name"]
#             analysis_bits.append(
#                 f"On overall investment fundamentals, {better_score} scores higher "
#                 f"({max(float(score_a), float(score_b)):.0f}/100 vs {min(float(score_a), float(score_b)):.0f}/100)."
#             )
#         else:
#             analysis_bits.append(
#                 f"Both areas land at the same {score_a}/100 investment score, so this really comes down to "
#                 f"yield, price point, and what kind of tenant or buyer you're targeting."
#             )

#     if analysis_bits:
#         lines.append(" ".join(analysis_bits))
#     else:
#         lines.append(f"Both {a['name']} and {b['name']} are active, well-established Dubai markets — the choice comes down to your budget and what you're optimizing for.")

#     # ── Bottom line, written as a direct recommendation ──
#     lines.append("\n✅ BOTTOM LINE")
#     if score_a and score_b and float(score_a) != float(score_b):
#         winner = a if float(score_a) > float(score_b) else b
#         lines.append(
#             f"If I had to pick one on the numbers today, it's {winner['name']} — the stronger investment "
#             f"score at {winner['intel'].get('investment_score')}/100. That said, book a viewing in both: "
#             f"see {a['name']} and {b['name']} side by side before you commit, since a good unit in the "
#             f"'weaker' area can still outperform a mediocre one in the stronger area."
#         )
#     elif yld_a and yld_b and float(yld_a) != float(yld_b):
#         better_yield_area = a['name'] if float(yld_a) > float(yld_b) else b['name']
#         lines.append(
#             f"With fundamentals tied, yield breaks the tie — {better_yield_area} edges it out for rental "
#             f"income. If capital growth matters more to you than monthly cash flow, it's worth comparing "
#             f"specific buildings in both before deciding."
#         )
#     else:
#         lines.append(
#             f"Both {a['name']} and {b['name']} hold up well on the data available. Your best move is to "
#             f"book viewings in both and compare actual units at the same price point — the headline numbers "
#             f"only tell part of the story."
#         )

#     return "\n".join(lines)


# def build_comparison_charts(ctx: dict) -> list:
#     comparison_keys = [k for k in ctx if k.startswith("comparison_")]
#     areas = []
#     for k in comparison_keys:
#         sub = ctx[k]
#         if not isinstance(sub, dict): continue
#         intel = sub.get("area_intelligence") or {}
#         stats = sub.get("transaction_stats") or {}
#         name = intel.get("area_name_en")
#         if name:
#             areas.append((name, intel, stats))
#     if len(areas) < 2:
#         return []
#     charts = []
#     score_data = [{"label": n, "value": float(i.get("investment_score") or 0)} for n, i, s in areas]
#     if any(d["value"] > 0 for d in score_data):
#         charts.append({"type": "bar", "title": "Investment Score Comparison", "data": score_data})
#     yield_data = [{"label": n, "value": float(i.get("gross_yield_pct") or 0)} for n, i, s in areas]
#     if any(d["value"] > 0 for d in yield_data):
#         charts.append({"type": "bar", "title": "Gross Yield Comparison (%)", "data": yield_data})
#     price_data = [{"label": n, "value": float(i.get("truvalu_psm") or s.get("avg_price_sqm") or 0)} for n, i, s in areas]
#     if any(d["value"] > 0 for d in price_data):
#         charts.append({"type": "bar", "title": "Avg Price per sqm (AED)", "data": price_data})
#     return charts

# def build_buyer_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     lines = []

#     lines.append("🏠 IS THIS RIGHT FOR YOU?")
#     vibe_map = {
#         "Dubai Marina": "an upscale waterfront community — high-rises, dining, beach access",
#         "Jumeirah Village Circle (JVC)": "a family-friendly suburban community — quiet, gated, well-maintained",
#         "Downtown Dubai": "a city-centre luxury district — iconic skyline, walkable, high-energy",
#         "Business Bay": "an urban professional hub — canal views, close to DIFC",
#         "Palm Jumeirah": "a premium island community — private beaches, villa living",
#         "Dubai Hills Estate": "a green master-planned community — parks, schools, golf",
#         "Jumeirah Lake Towers (JLT)": "a mixed-use lakeside community — metro access, restaurants, community feel",
#     }
#     vibe = vibe_map.get(area, "an established Dubai residential community")
#     lines.append(f"• {area} is {vibe}")
#     target_br = bedrooms or "2 BR"
#     median_br = stats.get("median_price_by_bedroom", {}).get(target_br) or stats.get("avg_worth_aed")
#     if median_br:
#         lines.append(f"• Verdict: GOOD BUY — {target_br} median is {fmt_aed(median_br)}, real DLD closed-sale price")

#     lines.append("\n💰 WHAT YOUR MONEY GETS YOU")
#     bedroom_psm = stats.get("bedroom_avg_psm", {})
#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     if target_br in bedroom_psm:
#         lines.append(f"• {target_br}: {fmt_psm(bedroom_psm[target_br])} | Median closed sale: {fmt_aed(bedroom_med.get(target_br))}")
#     if stats.get("avg_price_sqm"):
#         lines.append(f"• Area average: {fmt_psm(stats['avg_price_sqm'])}")
#     if bedroom_med:
#         all_meds = [v for v in bedroom_med.values() if v]
#         if all_meds:
#             lines.append(f"• Unit price range: {fmt_aed(min(all_meds))} – {fmt_aed(max(all_meds))}")
#     for br, psm in bedroom_psm.items():
#         if br == target_br: continue
#         med = bedroom_med.get(br)
#         line = f"• {br}: {fmt_psm(psm)}"
#         if med: line += f" | Median: {fmt_aed(med)}"
#         lines.append(line)

#     lines.append("\n🏘️ COMMUNITY & LIFESTYLE")
#     community_map = {
#         "Jumeirah Village Circle (JVC)": ("Family-friendly, quiet, gated — popular with South Asian and European expat families", "20–25 min to Downtown via Al Khail Road"),
#         "Dubai Marina":                  ("Urban, vibrant, mixed expat — young professionals and couples", "25 min to Downtown via Sheikh Zayed Road"),
#         "Downtown Dubai":                ("City-centre cosmopolitan — tourists, professionals, luxury buyers", "Walking distance to DIFC and Dubai Mall"),
#         "Business Bay":                  ("Professional urban community — canal views, close to DIFC", "10 min to Downtown, direct metro access"),
#         "Palm Jumeirah":                 ("Premium island — wealthy expats, high-net-worth families", "25–35 min to Downtown via Sheikh Zayed Road"),
#         "Dubai Hills Estate":            ("Green, family-oriented — British families, school-age children", "20 min to Downtown via Al Khail Road"),
#         "Jumeirah Lake Towers (JLT)":   ("Mixed expat lakeside community — professionals, families", "Metro access, 5 min to Dubai Marina"),
#     }
#     comm, commute = community_map.get(area, ("Established mixed expat community", "20–30 min to Downtown"))
#     lines.append(f"• Who lives here: {comm}")
#     if intel.get("parks_info"):   lines.append(f"• Green spaces: {intel['parks_info']}")
#     if intel.get("retail_info"):  lines.append(f"• Retail/amenities: {intel['retail_info']}")
#     lines.append(f"• Commute to Downtown Dubai: {commute}")

#     lines.append("\n📈 IS IT A GOOD TIME TO BUY?")
#     trend = intel.get("price_trend_pct")
#     hist  = ctx.get("price_history_by_year", {})
#     if trend is not None:
#         direction = "Rising" if float(trend) > 0 else "Cooling"
#         lines.append(f"• Price trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year ({direction})")
#         if float(trend) > 0:
#             lines.append("• What this means: Market is rising — buying sooner gives you a better entry price")
#         else:
#             lines.append("• What this means: Prices cooling — you have stronger negotiation power right now")
#     elif hist:
#         years = sorted(hist.keys())
#         if len(years) >= 2:
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
#             lines.append(f"• Price moved {fmt_psm(old_v)} ({years[0]}) → {fmt_psm(new_v)} ({years[-1]}): {'+' if chg>0 else ''}{chg}%")
#             lines.append(f"• What this means: {'Rising trend — buy sooner' if chg > 0 else 'Stable — good negotiation window'}")
#         else:
#             lines.append(f"• Current price: {fmt_psm(list(hist.values())[0])} — stable market, good entry point")
#     else:
#         lines.append("• Market is active with strong transaction volume — buyer demand is consistent in this area")
#         lines.append("• What this means: Competitive market — move quickly on a unit you like")

#     devs = ctx.get("developer_track_records", [])
#     if devs:
#         lines.append("\n🏗️ DEVELOPER TRACK RECORD")
#         for d in devs[:3]:
#             flag = " ⚠️" if (d.get("on_time_pct") or 100) < 70 else ""
#             lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

#     lines.append("\n✅ BUYER VERDICT")
#     lifestyle_fit = {
#         "Jumeirah Village Circle (JVC)": "families and first-time buyers wanting space and community feel under AED 2M",
#         "Dubai Marina":                  "professionals wanting waterfront lifestyle with walkable dining and beach",
#         "Downtown Dubai":                "buyers wanting iconic address and city-centre access",
#         "Business Bay":                  "professionals wanting proximity to DIFC and canal views",
#         "Palm Jumeirah":                 "buyers wanting premium island lifestyle and private beach access",
#         "Dubai Hills Estate":            "families wanting green spaces, British schools, and a planned community",
#         "Jumeirah Lake Towers (JLT)":   "buyers wanting metro access and lakeside community feel",
#     }
#     lines.append(f"• Right for you if: {lifestyle_fit.get(area, 'you want a well-connected Dubai residential community')}")
#     lines.append("• Watch out for: Service charges and parking costs — confirm both before signing")
#     if median_br:
#         asking_est = round(float(median_br) * 1.10)
#         lines.append(f"• Negotiation tip: DLD median is {fmt_aed(median_br)} — asking prices run ~10% higher ({fmt_aed(asking_est)}), push back hard")
#     lines.append("• Next step: Book 2–3 viewings this week — compare layouts and floor levels at the same price point")

    
    

#     return "\n".join(lines)


# def build_seller_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     lines = []

#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     br_order = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5 BR"]
#     available_brs = [br for br in br_order if br in bedroom_med]

#     target_br = bedrooms  # None if user didn't say a size
#     median_v  = bedroom_med.get(target_br) if target_br else None
#     avg_psm   = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
#     trend     = intel.get("price_trend_pct")

#     lines.append("📌 SELL NOW OR WAIT?")
#     if trend is not None and float(trend) > 0:
#         lines.append("• Decision: Sell now")
#         lines.append(f"• Reason: Prices rising +{trend}% year-on-year — sell into strength before the market peaks")
#     elif trend is not None and float(trend) < 0:
#         lines.append("• Decision: Price carefully or wait")
#         lines.append(f"• Reason: Market cooling {trend}% YoY — buyers have leverage, price at or below median")
#     else:
#         lines.append("• Decision: Good time to sell")
#         lines.append("• Reason: Market is stable with active buyer demand — list now to catch current interest")

#     lines.append("\n📈 PRICE MOMENTUM")
#     if avg_psm: lines.append(f"• Current average: {fmt_psm(avg_psm)}")
#     if trend is not None:
#         direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
#         lines.append(f"• Year-on-year trend: {'+' if float(trend)>0 else ''}{trend}% ({direction})")
#     if hist:
#         years = sorted(hist.keys())
#         price_parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-3:]]
#         lines.append(f"• Price history: {' → '.join(price_parts)}")
#     tx = intel.get("tx_7d"); tx_delta = intel.get("tx_7d_delta_pct")
#     if tx:
#         delta_str = f" ({'+' if float(tx_delta or 0)>0 else ''}{tx_delta}% WoW)" if tx_delta else ""
#         lines.append(f"• Weekly transactions: {tx} deals{delta_str}")

#     lines.append("\n💰 YOUR REALISTIC ASKING PRICE")
#     if target_br and median_v:
#         recommended = round(float(median_v) * 1.06)
#         lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
#         lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
#     elif available_brs:
#         lines.append(f"• You didn't mention a unit size, so here's every size we have real DLD closed-sale data for in {area}:")
#         for br in available_brs:
#             med = bedroom_med[br]
#             rec = round(float(med) * 1.06)
#             lines.append(f"• {br}: Median {fmt_aed(med)} → Recommended list {fmt_aed(rec)}")
#     elif avg_psm:
#         recommended_psm = round(float(avg_psm) * 1.06)
#         lines.append(
#             f"• We don't have enough closed sales broken down by exact bedroom count for {area} right now — "
#             f"here's the overall benchmark instead: {fmt_psm(avg_psm)}."
#         )
#         lines.append(f"• Recommended list rate: AED {recommended_psm:,}/sqm (6% above average — leaves negotiation room)")
#     else:
#         lines.append(f"• Not enough recent DLD transaction data for {area} yet to give a reliable price estimate.")
#     distress = intel.get("distress_pct")
#     if distress:
#         lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

#     if cats:
#         lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name') or 'Catalyst'} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'infrastructure uplift expected'}")

#     lines.append("\n✅ SELLER ACTION PLAN")
#     if target_br and median_v:
#         lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
#     elif available_brs:
#         mid_br = available_brs[len(available_brs) // 2]
#         lines.append(f"• Step 1: Tell us your unit size for an exact number — a {mid_br} here typically lists around {fmt_aed(round(float(bedroom_med[mid_br])*1.06))}")
#     lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
#     lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
#     if target_br and median_v:
#         lines.append(f"• Bottom line: Expect 3–5 viewings in first 2 weeks at {fmt_aed(round(float(median_v)*1.06))}")

#     return "\n".join(lines)


# def build_investor_reply(ctx: dict, bedrooms: str) -> str:
#     intel  = ctx.get("area_intelligence", {})
#     stats  = ctx.get("transaction_stats", {})
#     area   = ctx.get("detected_area", "")
#     hist   = ctx.get("price_history_by_year", {})
#     cats   = ctx.get("area_catalysts", [])
#     shocks = ctx.get("historical_shock_resilience", [])
#     devs   = ctx.get("developer_track_records", [])
#     top_yield = ctx.get("top_yield_areas", [])
#     top_areas = ctx.get("top_areas", [])
#     lines = []

#     if top_yield or top_areas:
#         data = top_yield or top_areas
#         lines.append("📌 INVESTMENT VERDICT")
#         lines.append("• Signal: BUY — ranked below are Dubai's top-performing areas by real DLD investment data")
#         lines.append("• Best play: Buy-to-let Studio or 1BR for immediate rental income above 6.1% Dubai average")
#         lines.append("\n📊 TOP AREAS BY ROI — Real DLD Data")
#         for i, a in enumerate(data[:8], 1):
#             name  = a.get("area_name_en", "")
#             score = a.get("investment_score")
#             yld   = a.get("gross_yield_pct")
#             trend = a.get("price_trend_pct")
#             psm   = a.get("truvalu_psm")
#             parts = []
#             if score: parts.append(f"Score {score}/100")
#             if yld:   parts.append(f"Yield {yld}%")
#             if trend is not None: parts.append(f"Trend {'+' if float(trend)>0 else ''}{trend}%")
#             if psm:   parts.append(f"Avg {fmt_psm(psm)}")
#             if parts: lines.append(f"• #{i} {name} — {' · '.join(parts)} → https://www.acqar.com/areas/{area_to_slug(name)}")
#         lines.append("\n✅ INVESTOR DECISION")
#         if data:
#             top = data[0]
#             yld_top = top.get("gross_yield_pct", "")
#             score_top = top.get("investment_score", "")
#             diff = round(float(yld_top) - 6.1, 2) if yld_top else 0
#             lines.append(f"• Best entry: {top.get('area_name_en','')} — {yld_top}% gross yield ({'+' if diff>=0 else ''}{diff}% above Dubai avg)")
#             if score_top: lines.append(f"• Investment Score: {score_top}/100 — strongest fundamentals in Dubai right now")
#         lines.append("• Rule: Only invest in areas beating 6.1% Dubai average yield threshold")
#         lines.append("• Best unit type: Studio or 1BR — highest yield-to-price ratio in every top area")
        
#         return "\n".join(lines)

#     lines.append("📌 INVESTMENT VERDICT")
#     score = intel.get("investment_score"); yld = intel.get("gross_yield_pct")
#     trend = intel.get("price_trend_pct"); rank = intel.get("ranking_rank")
#     signal = "STRONG BUY" if (score and float(score) >= 75) else "BUY" if (score and float(score) >= 60) else "HOLD"
#     if yld and float(yld) > 6.1:
#         diff = round(float(yld) - 6.1, 2)
#         lines.append(f"• Signal: {signal} — {yld}% gross yield is +{diff}% above Dubai average of 6.1%")
#     elif score:
#         lines.append(f"• Signal: {signal} — Investment Score {score}/100")
#     else:
#         lines.append(f"• Signal: {signal} — active transaction market in {area}")
#     lines.append("• Best play: Buy-to-let for rental income + capital appreciation")

#     lines.append("\n📊 INVESTMENT SCORECARD")
#     if score: lines.append(f"• Investment Score: {score}/100")
#     if yld:
#         diff = round(float(yld) - 6.1, 2)
#         above = "above" if diff >= 0 else "below"
#         lines.append(f"• Gross Yield: {yld}% — Dubai avg 6.1%, this is {abs(diff)}% {above} average")
#     if trend is not None: lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year")
#     if rank:  lines.append(f"• Dubai Ranking: #{rank} out of all areas")
#     distress = intel.get("distress_pct")
#     if distress: lines.append(f"• Distress Sales: {distress}% — {'opportunity: motivated sellers' if float(distress)>10 else 'stable market'}")
#     abs_rate = intel.get("absorption_rate_pct")
#     if abs_rate: lines.append(f"• Absorption Rate: {abs_rate}% — {'fast-moving demand' if float(abs_rate)>50 else 'balanced supply/demand'}")

#     lines.append("\n💰 ENTRY PRICES — Real DLD Closed Sales")
#     bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
#     for br in ["Studio", "1 BR", "2 BR", "3 BR"]:
#         if br in bpsm:
#             line = f"• {br}: {fmt_psm(bpsm[br])}"
#             if br in bmed: line += f" | Median unit: {fmt_aed(bmed[br])}"
#             lines.append(line)

#     if hist:
#         lines.append("\n📈 CAPITAL APPRECIATION")
#         years = sorted(hist.keys())
#         price_parts = [f"{y}: {fmt_psm(hist[y])}" for y in years]
#         lines.append(f"• {' → '.join(price_parts)}")
#         if len(years) >= 2:
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg = round(((new_v-old_v)/old_v)*100, 1) if old_v else 0
#             lines.append(f"• Total: {'+' if chg>0 else ''}{chg}% over {len(years)} year(s)")

#     if cats:
#         lines.append("\n⚡ CATALYSTS — Price Drivers")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'uplift expected'}")

#     if shocks:
#         lines.append("\n🛡️ DOWNSIDE RISK")
#         for s in shocks[:2]:
#             lines.append(f"• {s.get('event_name','')}: dropped {s.get('price_impact_pct','')}%, recovered in {s.get('recovery_months','')} months")

#     if devs:
#         lines.append("\n🏗️ DEVELOPER RISK")
#         for d in devs[:3]:
#             flag = " ⚠️ (delay risk)" if (d.get("on_time_pct") or 100) < 70 else ""
#             lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

#     lines.append("\n✅ INVESTOR DECISION")
#     best_br = "Studio" if "Studio" in bmed else ("1 BR" if "1 BR" in bmed else None)
#     if best_br and best_br in bmed:
#         lines.append(f"• Best entry: {best_br} at {fmt_aed(bmed[best_br])} — highest yield-to-price ratio")
#     if yld: lines.append(f"• Expected gross yield: {yld}% annually")
#     lines.append(f"• Watch: Monitor new supply launches — oversupply can compress yields")
#     if best_br and best_br in bmed:
#         lines.append(f"• Bottom line: {fmt_aed(bmed[best_br])} entry on {best_br} in {area} is the strongest risk-adjusted play right now")

    
    

#     return "\n".join(lines)


# def build_broker_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     devs  = ctx.get("developer_track_records", [])
#     projs = ctx.get("top_projects", [])
#     lines = []

#     lines.append(f"📋 AREA BRIEFING — {area}")
#     score   = intel.get("investment_score"); rank    = intel.get("ranking_rank")
#     verdict = intel.get("verdict");          yld     = intel.get("gross_yield_pct")
#     trend   = intel.get("price_trend_pct"); avg_psm = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
#     tx      = intel.get("tx_7d");           tx_delta= intel.get("tx_7d_delta_pct")
#     distress= intel.get("distress_pct")

#     if score or rank:
#         score_str = f"Investment Score: {score}/100" if score else ""
#         rank_str  = f"Ranking: #{rank} in Dubai" if rank else ""
#         lines.append(f"• {' · '.join(filter(None, [score_str, rank_str]))}")
#     if verdict or yld:
#         verdict_str = f"Verdict: {verdict}" if verdict else ""
#         yld_str     = f"Gross Yield: {yld}%" if yld else ""
#         lines.append(f"• {' · '.join(filter(None, [verdict_str, yld_str]))}")
#     if trend is not None or avg_psm:
#         trend_str = f"Price Trend: {'+' if trend and float(trend)>0 else ''}{trend}% YoY" if trend is not None else ""
#         psm_str   = f"Avg PSM: {fmt_psm(avg_psm)}" if avg_psm else ""
#         lines.append(f"• {' · '.join(filter(None, [trend_str, psm_str]))}")
#     if tx:
#         delta_str = f" ({'+' if float(tx_delta or 0)>0 else ''}{tx_delta}% WoW)" if tx_delta else ""
#         lines.append(f"• Weekly DLD Volume: {tx} transactions{delta_str}")
#     if distress: lines.append(f"• Distress Sales: {distress}%")

#     lines.append("\n💰 DLD TRANSACTION COMPARABLES")
#     bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
#     for br in ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"]:
#         if br in bpsm:
#             line = f"• {br}: {fmt_psm(bpsm[br])}"
#             if br in bmed: line += f" | Median deal: {fmt_aed(bmed[br])}"
#             lines.append(line)

#     if hist:
#         lines.append("\n📈 PRICE MOMENTUM — Client Talking Points")
#         years = sorted(hist.keys())
#         parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-3:]]
#         lines.append(f"• {' → '.join(parts)}")
#         if trend is not None:
#             if float(trend) > 0:
#                 lines.append(f"• Direction: Rising +{trend}% — tell buyers: 'prices are up, this is the entry window'")
#             else:
#                 lines.append(f"• Direction: Cooling {trend}% — tell buyers: 'good value entry, negotiate from DLD median'")

#     if cats:
#         lines.append("\n⚡ UPCOMING CATALYSTS — For Pitch Decks")
#         for c in cats[:4]:
#             lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'demand uplift expected'}")

#     if devs:
#         lines.append("\n🏗️ DEVELOPER DATA — For Off-Plan Pitching")
#         for d in devs[:4]:
#             flag = " ⚠️ Disclose delay risk to client" if (d.get("on_time_pct") or 100) < 70 else ""
#             lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★ · {d.get('total_projects','?')} projects{flag}")

#     if projs:
#         lines.append("\n🏙️ TOP PROJECTS BY DLD VOLUME")
#         for p in projs[:5]:
#             lines.append(f"• {p['name']} — {p['transactions']} DLD transactions")

#     lines.append("\n✅ BROKER TALKING POINTS")
#     top_med = None
#     for br in ["1 BR", "Studio", "2 BR"]:
#         if br in bmed: top_med = (br, bmed[br]); break
#     if top_med:
#         asking_est = round(float(top_med[1]) * 1.10)
#         lines.append(f'• For buyer clients: "DLD median {top_med[0]} is {fmt_aed(top_med[1])} — asking prices run ~10% higher ({fmt_aed(asking_est)}), negotiate hard"')
#     if trend is not None and bmed:
#         direction_word = "rising" if float(trend) > 0 else "cooling"
#         first_med = float(list(bmed.values())[0])
#         rec_price = round(first_med * 1.06) if float(trend) > 0 else round(first_med * 1.0)
#         lines.append(f'• For seller clients: "Market {direction_word} {trend}% — list at {fmt_aed(rec_price)} to attract serious buyers quickly"')
#     if yld:
#         diff = round(float(yld) - 6.1, 2)
#         above = "above" if diff >= 0 else "below"
#         lines.append(f'• For investor clients: "{yld}% gross yield — {abs(diff)}% {above} Dubai 6.1% average — strong buy-to-let case"')
#     lines.append(f'• Objection "Is {area} overpriced?": DLD median is the real price — asking prices average 8–12% above actual closed sales')

    
    

#     return "\n".join(lines)


# def build_budget_reply(ctx: dict, bedrooms: str, budget: float) -> str:
#     lines = []
#     target_br = bedrooms or "2 BR"
#     budget_label = fmt_aed(budget)
#     areas = ctx.get("budget_search_areas") or ctx.get("top_areas") or []

#     lines.append("📌 DIRECT ANSWER")
#     lines.append(f"• Searching for {target_br} apartments under {budget_label} — here are the best-value areas from real DLD closed sales")
#     lines.append(f"• All prices below are actual DLD closed-sale transactions — not asking prices")

#     # Filter and rank areas by whether their median 2BR fits the budget
#     matched = []
#     for a in areas:
#         name  = a.get("area_name_en", "")
#         score = a.get("investment_score")
#         yld   = a.get("gross_yield_pct")
#         psm   = a.get("truvalu_psm")
#         trend = a.get("price_trend_pct")
#         if name:
#             matched.append((name, score, yld, psm, trend))

#     lines.append(f"\n💡 BEST AREAS FOR {target_br} UNDER {budget_label}")

#     shown = 0
#     for name, score, yld, psm, trend in matched[:10]:
#         if shown >= 5: break
#         lines.append(f"\n• {name}")
#         if score: lines.append(f"  — Investment Score: {score}/100" + (f" · Yield: {yld}%" if yld else ""))
#         if psm:   lines.append(f"  — Avg price: {fmt_psm(psm)}")
#         if trend is not None:
#             direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
#             lines.append(f"  — Price Trend: {'+' if float(trend)>0 else ''}{trend}% YoY ({direction})")
#         shown += 1

#     lines.append(f"\n💰 YOUR BUDGET BREAKDOWN")
#     lines.append(f"• Target: {target_br} under {budget_label}")
#     lines.append(f"• DLD transfer fee (mandatory): {fmt_aed(budget * 0.04)} (4% of purchase price)")
#     lines.append(f"• Agent fee: ~{fmt_aed(budget * 0.02)} (2% typical)")
#     lines.append(f"• Minimum cash needed upfront: {fmt_aed(budget * 0.06)} (fees) + down payment if mortgaging")
#     lines.append(f"• If mortgaging: 20% down = {fmt_aed(budget * 0.20)} minimum for expats")

#     lines.append(f"\n📊 AREAS WITH MOST {target_br} TRANSACTIONS UNDER {budget_label}")
#     lines.append(f"• Jumeirah Village Circle (JVC) — highest volume of 2BR under AED 2M")
#     lines.append(f"• Dubai Sports City — affordable 2BR with strong yield")
#     lines.append(f"• International City — budget entry point")
#     lines.append(f"• Discovery Gardens — established community, low price point")
#     lines.append(f"• Al Furjan — growing community, good value")

#     lines.append(f"\n⚠️ WATCH OUT FOR")
#     lines.append(f"• Service charges vary widely — confirm AED/sqft/year before signing")
#     lines.append(f"• Off-plan under {budget_label} may have 5–8% post-handover price jumps — buy ready when possible")

#     lines.append(f"\n✅ NEXT STEPS — Do These This Week")
#     lines.append(f"• Step 1: Check JVC listings for {target_br} under {budget_label} — highest inventory in this range")
#     lines.append(f"• Step 2: Get mortgage pre-approval (if financing) — UAE banks take 3–5 working days")
#     lines.append(f"• Step 3: Verify the real market value of any unit you like → https://www.acqar.com/valuation")

#     return "\n".join(lines)



# # Any English question word, wherever it starts the sentence — covers virtually
# # any way a follow-up question can be phrased, not just a fixed set of phrases.
# FOLLOWUP_QUESTION_WORDS = (
#     "what", "how", "can", "is", "are", "does", "do", "will", "should",
#     "why", "where", "when", "who", "which", "would", "could", "did",
#     "was", "were", "has", "have", "may", "shall",
# )

# FOLLOWUP_COMMAND_STARTERS = (
#     "show me", "show", "give me", "list", "tell me", "compare",
#     "break down", "breakdown", "explain", "summarize", "walk me through",
# )

# def is_specific_followup(message: str, history: list) -> bool:
#     """True when this is a narrow follow-up question (or a short data/info
#     request like 'show me X') that should get a direct answer instead of the
#     full templated area report."""
#     if not history:
#         return False
#     m = message.strip().lower()
#     is_question_mark = m.endswith("?") or m.endswith("؟")  # ASCII + Arabic/Urdu question marks
#     words = m.split()
#     first_word = words[0].strip(".,!?؟") if words else ""
#     is_question_word_start = first_word in FOLLOWUP_QUESTION_WORDS
#     is_command_start = m.startswith(FOLLOWUP_COMMAND_STARTERS)
#     is_short_request = (is_question_mark or is_question_word_start or is_command_start) \
#         and len(words) <= 25
#     is_fresh_intent = any(k in m for k in [
#         "i want to buy", "i want to sell", "i'm looking to",
#         "should i buy", "should i sell",
#     ])
#     return is_short_request and not is_fresh_intent


# DATA_VIZ_KEYWORDS = (
#     "compare", "comparison", "breakdown", "by bedroom", "each bedroom",
#     "price history", "show me", "chart", "graph", "table", "over time",
#     "per sqft", "per sqm", "trend", "yield by", "price by",
# )

# def wants_data_visual(message: str) -> bool:
#     m = message.strip().lower()
#     return any(k in m for k in DATA_VIZ_KEYWORDS)



# SPECIFIC_ANSWER_PROMPT = """You are ACQAR Intelligence. The user already has the full area report —
# do NOT repeat it. Answer ONLY the specific question below.

# Rules:
# - The AREA DATA FACTS JSON has a "transaction_stats" object containing
#   "bedroom_avg_psm" (price per sqm, keyed by "Studio"/"1 BR"/"2 BR"/etc.) and
#   "median_price_by_bedroom" (median total sale price, same keys). If the
#   question asks about price by bedroom/unit size, you MUST read these two
#   nested fields and list each bedroom type found there with its number —
#   never say the breakdown isn't available if bedroom_avg_psm has entries.
# - To convert AED/sqm to AED/sqft, divide by 10.7639.
# - The AREA DATA FACTS JSON has a "developer_track_records" list — each entry
#   has developer_name, on_time_pct, star_rating, total_projects, market_segment.
#   If asked to compare/list developers, use ONLY the developers present in
#   that list, with ONLY the numbers given there. NEVER add a developer that
#   isn't in developer_track_records, and NEVER invent price ranges, project
#   counts, or percentages for any developer — those fields are not provided
#   and must not be fabricated. If developer_track_records is empty, say
#   developer data isn't available for this area rather than making it up.
# - If the question is about something the data doesn't cover (legal rules, visa
#   eligibility, financing regulations, process steps, etc.), answer from accurate
#   general Dubai real-estate knowledge - do not say "I don't have data," just answer it correctly.
# - Keep it short: 2-5 sentences or up to 5 bullets (one bullet per bedroom type
#   if listing a breakdown). No section headers, no repeated report.
# - "summary" is REQUIRED and must never be empty — always give a one-sentence version of the answer there.
# - Output JSON only: {"summary":"","reply":"","insight":""}
# """

# def build_specific_answer(question: str, context_data: dict, bedrooms: str) -> dict:
#     facts = {
#         "area": context_data.get("detected_area"),
#         "area_intelligence": context_data.get("area_intelligence", {}),
#         "transaction_stats": context_data.get("transaction_stats", {}),
#         "developer_track_records": context_data.get("developer_track_records", []),
#         "area_catalysts": context_data.get("area_catalysts", []),
#         "requested_bedroom_type": bedrooms,
#     }
#     messages = [
#         {"role": "system", "content": SPECIFIC_ANSWER_PROMPT},
#         {"role": "user", "content": f"AREA DATA FACTS:\n{json.dumps(facts, default=str)}\n\nQUESTION: {question}"},
#     ]

#     def call(model):
#         resp = groq_client.chat.completions.create(
#             model=model, messages=messages, temperature=0.2,
#             max_tokens=500, response_format={"type": "json_object"},
#         )
#         return resp.choices[0].message.content.strip()

#     try:
#         try:    raw = call(PRIMARY_MODEL)
#         except: raw = call(FALLBACK_MODEL)
#         return extract_json(raw)
#     except Exception as e:
#         print(f"[ACQAR] specific-answer error: {e}")
#         return {"summary": "", "reply": "Sorry, I hit an error answering that — could you rephrase?", "insight": ""}



# def build_general_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     lines = []

#     lines.append("📌 QUICK ANSWER")
#     verdict = intel.get("verdict", "BUY"); score = intel.get("investment_score")
#     lines.append(f"• {area} is an active Dubai residential market with strong transaction volume")
#     lines.append(f"• Verdict: {verdict}" + (f" — Investment Score {score}/100" if score else ""))

#     yld = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct"); rank = intel.get("ranking_rank")
#     distress = intel.get("distress_pct")
#     snapshot_lines = []
#     if score:   snapshot_lines.append(f"• Investment Score: {score}/100")
#     if yld:     snapshot_lines.append(f"• Gross Yield: {yld}%")
#     if trend is not None: snapshot_lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year")
#     if rank:    snapshot_lines.append(f"• Dubai Ranking: #{rank}")
#     if distress: snapshot_lines.append(f"• Distress Sales: {distress}%")
#     if snapshot_lines:
#         lines.append("\n📊 MARKET SNAPSHOT"); lines.extend(snapshot_lines)

#     bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
#     price_lines = []
#     if stats.get("avg_price_sqm"): price_lines.append(f"• Average: {fmt_psm(stats['avg_price_sqm'])}")
#     for br in ["Studio", "1 BR", "2 BR", "3 BR"]:
#         if br in bpsm:
#             line = f"• {br}: {fmt_psm(bpsm[br])}"
#             if br in bmed: line += f" | Median: {fmt_aed(bmed[br])}"
#             price_lines.append(line)
#     if price_lines:
#         lines.append("\n💰 PRICES"); lines.extend(price_lines)

#     if hist:
#         years = sorted(hist.keys())
#         lines.append("\n📈 PRICE HISTORY")
#         parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-4:]]
#         lines.append(f"• {' → '.join(parts)}")

#     if cats:
#         lines.append("\n⚡ CATALYSTS")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'}")

#     lines.append("\n✅ VERDICT")
#     lines.append("• Best for: Investors and end-users looking for an established Dubai community")
#     if bmed:
#         best_br = list(bmed.keys())[0]
#         lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
#     lines.append("• Watch out for: Service charges and new supply pipeline in the area")

    
    

#     return "\n".join(lines)


# def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
#     # ── Lifestyle override ──
#     lifestyle_areas = []
#     for k, v in ctx.items():
#         if k.startswith("lifestyle_") and isinstance(v, dict):
#             name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
#             if name: lifestyle_areas.append(name)
#     if lifestyle_areas:
#         tags = ctx.get("_lifestyle_tags", [])
#         priority_tags = [t for t in tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
#         tag_str = " & ".join(t.title() for t in priority_tags[:2]) if priority_tags else "your profile"
#         names = " · ".join(lifestyle_areas[:3])
#         return f"Top areas for {tag_str} living in Dubai: {names} — ranked by real DLD data, buyer nationality mix, school proximity, and investment score."

#     # ── Budget override ──
#     if ctx.get("budget_search_areas"):
#         budget = ctx.get("user_budget_aed")
#         br = bedrooms or "2 BR"
#         budget_label = fmt_aed(budget) if budget else "your budget"
#         return f"Searching for {br} apartments under {budget_label} in Dubai — top areas by value, yield, and real DLD transaction volume below."
    
#     # ── Comparison override ──
#     comparison_areas = []
#     for k, v in ctx.items():
#         if k.startswith("comparison_") and isinstance(v, dict):
#             name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
#             if name: comparison_areas.append(name)
#     if len(comparison_areas) >= 2:
#         return f"Comparing {comparison_areas[0]} vs {comparison_areas[1]} on real DLD closed-sale data — investment scores, yields, and prices side by side below."

#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
#     br    = bedrooms
#     bedroom_med_all = stats.get("median_price_by_bedroom", {})
#     med   = (bedroom_med_all.get(br) if br else None) or stats.get("avg_worth_aed")

#     if user_type == "buyer":
#         if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
#         return f"{area} is a well-established Dubai community suited for home buyers and families."
#     elif user_type == "seller":
#         if br and med:
#             return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         if bedroom_med_all:
#             all_meds = sorted([v for v in bedroom_med_all.values() if v])
#             return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell in {area} — DLD closed sales here range {fmt_aed(all_meds[0])} to {fmt_aed(all_meds[-1])} depending on size. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
#         if yld:
#             diff = float(yld) - 6.1
#             comp = "above" if diff > 0.05 else ("below" if diff < -0.05 else "at")
#             return f"{area} offers {yld}% gross yield — {comp} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
#         return f"{area} shows active transaction volume — evaluate based on your target yield threshold vs Dubai's 6.1% average."
#     elif user_type == "broker":
#         avg_psm = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
#         if avg_psm and med: return f"{area} market report: avg {fmt_psm(avg_psm)}, {br} median {fmt_aed(med)} on DLD closed sales.{' Price trend ' + str(trend) + '% YoY.' if trend is not None else ''} Use these numbers to anchor client negotiations."
#         return f"Full {area} market data from DLD closed sales — use these comparables for client pitches and pricing."
#     else:
#         score = intel.get("investment_score"); verdict = intel.get("verdict","BUY")
#         if score and med: return f"{area} scores {score}/100 for investment — {br} median is {fmt_aed(med)} on real DLD data. Verdict: {verdict}."
#         return f"{area} is an active Dubai market — real DLD transaction data and market insights below."


# def build_insight(user_type: str, ctx: dict, bedrooms: str) -> str:
#     # ── Lifestyle override ──
#     lifestyle_areas = []
#     for k, v in ctx.items():
#         if k.startswith("lifestyle_") and isinstance(v, dict):
#             intel_sub = v.get("area_intelligence") or {}
#             name  = intel_sub.get("area_name_en") or v.get("detected_area", "")
#             score = intel_sub.get("investment_score")
#             yld   = intel_sub.get("gross_yield_pct")
#             if name and score:
#                 lifestyle_areas.append((name, score, yld))
#     if lifestyle_areas:
#         best = sorted(lifestyle_areas, key=lambda x: float(x[1] or 0), reverse=True)[0]
#         name, score, yld = best
#         yld_str = f" with {yld}% gross yield" if yld else ""
#         return f"Start with {name} — Score {score}/100{yld_str} — visit on a weekend to check school zones and community feel before committing."

#    # ── Budget override ──
#     if ctx.get("budget_search_areas"):
#         budget = ctx.get("user_budget_aed")
#         br = bedrooms or "2 BR"
#         budget_label = fmt_aed(budget) if budget else "your budget"
#         return f"JVC has the highest inventory of {br} apartments under {budget_label} — verify the real market value before making any offer at acqar.com/valuation"
    
#     # ── Comparison override ──
#     comparison_areas = []
#     for k, v in ctx.items():
#         if k.startswith("comparison_") and isinstance(v, dict):
#             intel_sub = v.get("area_intelligence") or {}
#             name  = intel_sub.get("area_name_en") or v.get("detected_area", "")
#             score = intel_sub.get("investment_score")
#             yld   = intel_sub.get("gross_yield_pct")
#             if name: comparison_areas.append((name, score, yld))
#     if len(comparison_areas) >= 2:
#         by_yield = sorted(comparison_areas, key=lambda x: float(x[2] or 0), reverse=True)
#         top = by_yield[0]
#         return f"{top[0]} has the stronger yield ({top[2]}%) — book a viewing there first if rental income is your priority."

#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     br    = bedrooms
#     bedroom_med_all = stats.get("median_price_by_bedroom", {})
#     med   = (bedroom_med_all.get(br) if br else None) or stats.get("avg_worth_aed")
#     yld   = intel.get("gross_yield_pct")

#     if user_type == "buyer" and med:
#         asking = round(float(med) * 1.10)
#         return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
#     elif user_type == "seller":
#         if br and med:
#             list_price = round(float(med) * 1.06)
#             return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
#         if bedroom_med_all:
#             mid_br = sorted(bedroom_med_all.keys(), key=lambda k: bedroom_med_all[k])[len(bedroom_med_all)//2]
#             list_price = round(float(bedroom_med_all[mid_br]) * 1.06)
#             return f"Tell us your exact unit size for a precise number — a {mid_br} in {area} would list around {fmt_aed(list_price)}."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             yld_top = top.get("gross_yield_pct", 6.1)
#             diff = round(float(yld_top) - 6.1, 2)
#             return f"#1 pick: {top.get('area_name_en','')} at {yld_top}% yield — {'+' if diff>=0 else ''}{diff}% above Dubai average on real DLD rental data."
#         if yld and med:
#             annual_rent = round(float(med) * float(yld) / 100)
#             return f"{area} {yld}% yield on {fmt_aed(med)} entry = approx {fmt_aed(annual_rent)}/year rental income based on DLD data."
#     elif user_type == "broker" and med:
#         return f"DLD median for {br} is {fmt_aed(med)} — use this as your negotiation anchor: buyers paying asking price pay ~10% above actual closed-sale market."

#     if br and med:
#         return f"Real DLD median for {br} in {area} is {fmt_aed(med)} — actual closed-sale price, not the asking price."
#     return f"{area} has active DLD transaction volume — use the data above to make a confident, data-backed decision."


# def build_charts(ctx: dict, user_type: str) -> list:
#     charts = []
#     stats = ctx.get("transaction_stats", {})
#     hist  = ctx.get("price_history_by_year", {})
#     devs  = ctx.get("developer_track_records", [])

#     bpsm = stats.get("bedroom_avg_psm", {})
#     if bpsm:
#         charts.append({"type": "bar", "title": "Price by Bedroom (AED/sqm)",
#             "data": [{"label": k, "value": int(v)} for k, v in bpsm.items() if v]})

#     if hist:
#         charts.append({"type": "line", "title": "Price History (AED/sqm)",
#             "data": [{"label": str(y), "value": int(v)} for y, v in sorted(hist.items()) if v]})

#     if user_type in ("broker", "investor") and devs:
#         dev_data = [{"label": d["developer_name"], "value": int(d["on_time_pct"])} for d in devs if d.get("on_time_pct")]
#         if dev_data:
#             charts.append({"type": "bar", "title": "Developer On-Time Delivery %", "data": dev_data})

#     top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
#     if user_type == "investor" and top_yield:
#         charts = []
#         charts.append({"type": "bar", "title": "Top Areas by Gross Yield (%)",
#             "data": [{"label": a.get("area_name_en",""), "value": float(a.get("gross_yield_pct",0))} for a in top_yield[:8] if a.get("gross_yield_pct")]})
#         charts.append({"type": "bar", "title": "Investment Score by Area",
#             "data": [{"label": a.get("area_name_en",""), "value": int(a.get("investment_score",0))} for a in top_yield[:8] if a.get("investment_score")]})

#     return charts


# # ── CHANGE 2: Comprehensive fallback system prompt ────────────────
# FALLBACK_SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's senior real estate expert with 15+ years of market knowledge.

# You answer ANY question about Dubai real estate with the depth and specificity of a top-tier consultant.
# When DB data is unavailable, use your expert knowledge — be confident, specific, and actionable.
# DO NOT say "I don't have data" or be vague. Give real answers like Gemini or Claude would.

# OUTPUT: Valid JSON only → {"summary":"...","reply":"...","charts":[],"insight":"..."}
# Use \\n for line breaks. Use • for bullets. Emoji header for every section.

# ═══════════════════════════════
# FORMAT FOR FINANCING / MORTGAGE / DOWN PAYMENT QUERIES
# ═══════════════════════════════

# 📋 DIRECT ANSWER
# • [One honest sentence answering exactly what they asked]
# • Key legal fact: [most important regulation they must know]

# 💡 YOUR OPTIONS — [X] Ways to Do This

# Option 1 — [Name of scheme/approach]
# • How it works: [2–3 specific sentences with real details]
# • Best for: [who this suits exactly]
# • The catch: [one honest downside]

# Option 2 — [Name]
# • How it works: [specific details]
# • Best for: [who]
# • The catch: [downside]

# Option 3 — [Name] (if applicable)
# • [same structure]

# 💰 YOUR REALISTIC NUMBERS
# - Monthly payment capacity: AED [X]
# - Estimated property budget: AED [X] – AED [X]
# - Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
# - Best areas in this budget: [Area 1] · [Area 2] · [Area 3] (ONLY include this
#   bullet if the user's question itself asked about affordability/budget/areas —
#   omit it entirely for fee, commission, process, or legal questions)

# ⚠️ CRITICAL WARNINGS
# • [Most important legal or financial risk with specific number]
# • [Second risk if applicable]

# ✅ NEXT STEPS — Do These This Week
# • Step 1: [Specific action — name the institution/platform/developer]
# • Step 2: [Specific action with timeline]
# • Step 3: [Specific action]

# ═══════════════════════════════
# FORMAT FOR PROCESS / HOW-TO QUERIES (buying steps, fees, visa, NOC, etc.)
# ═══════════════════════════════

# 📋 HOW TO [ACTION] IN DUBAI — Step by Step

# Step 1 — [Action name]
# • [Specific detail. Timeline or cost if known.]

# Step 2 — [Action name]
# • [Specific detail.]

# (continue all steps, typically 5–8 steps)

# 💰 COST BREAKDOWN
# • [Fee name]: [exact % or amount]
# • [Fee name]: [exact % or amount]
# • Total upfront on AED 1M property: AED [X]

# 📄 DOCUMENTS NEEDED
# • [Document 1 — who needs it]
# • [Document 2]

# ⚠️ COMMON MISTAKES
# • [Mistake 1 people make and how to avoid it]
# • [Mistake 2]

# ✅ KEY TAKEAWAY
# • [One actionable bottom line]

# ═══════════════════════════════
# FORMAT FOR LEGAL / OWNERSHIP / VISA QUERIES
# ═══════════════════════════════

# 📋 DIRECT ANSWER
# • [Specific answer to their exact question]

# 📜 THE RULES — What UAE Law Says
# • [Specific regulation with actual numbers/thresholds]
# • [Another specific rule]

# ✅ WHAT TO DO
# • Step 1: [action]
# • Step 2: [action]
# • Step 3: [action]

# ⚠️ WATCH OUT FOR
# • [Specific risk]

# ═══════════════════════════════
# FORMAT FOR GENERAL MARKET / TREND / OPINION QUERIES
# ═══════════════════════════════

# 📌 DIRECT ANSWER
# • [Answer the question directly in one sentence]

# 📊 THE DATA BEHIND IT
# • [Specific market fact with number]
# • [Another data point]
# • [Another data point]

# 🔍 ANALYSIS
# • [What this means for the user]
# • [Comparison or context]

# ✅ BOTTOM LINE
# • [Actionable conclusion]
# • [Next step if relevant]

# ═══════════════════════════════
# RULES FOR ALL RESPONSES
# ═══════════════════════════════
# 0. Pick the template that matches what was actually asked. A question about
#    commission, fees, legal process, or a named company is NOT a financing/
#    mortgage/area-recommendation question — do not use the FINANCING template's
#    "Best areas" bullet, and do not name specific areas (Downtown Dubai, Dubai
#    Marina, Palm Jumeirah, etc.) anywhere in the answer unless the user's
#    question was actually about choosing or comparing areas. Commission rates,
#    RERA rules, and legal fees apply the same Dubai-wide — they have nothing to
#    do with any particular neighborhood.
# 1. Be specific — real numbers, real developer names, real regulations
# 2b. If the user names a specific real estate company, brokerage, or agent and
#    asks about it, do NOT fabricate facts about that specific business — you do
#    not have verified, live company records (RERA status, service areas, past
#    performance, size). Say plainly that you don't have verified data on that
#    specific company, then give general guidance on how anyone can verify a
#    Dubai real-estate company (check its RERA/DLD broker registration number,
#    look it up on the DLD's Trakheesi system, check reviews). NEVER attach
#    unrelated area investment scores/yields to a company-identity question —
#    those numbers describe areas, not the company.
# 2. If budget is mentioned (salary/EMI/monthly), calculate the property budget and show the math
# 3. Always end with actionable next steps
# 4. Never write more than 2 lines per bullet
# 5. Never write paragraphs — always bullet points under emoji headers
# 6. summary: 2 sentences — direct answer + most useful number
# 7. insight: 1 sentence — one specific action the user can take TODAY
# 8. NEVER include URLs or markdown links in your reply text. Do not write [text](url) or https:// links inside reply. Area links are added automatically."""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────

# @router.post("/intelligence/transcribe")
# async def transcribe_audio(file: UploadFile = File(...)):
#     try:
#         audio_bytes = await file.read()

#         def call_whisper():
#             return groq_client.audio.transcriptions.create(
#                 file=(file.filename or "audio.webm", audio_bytes),
#                 model="whisper-large-v3",
#             )

#         result = await _run(call_whisper)
#         return {"text": result.text.strip()}
#     except Exception as e:
#         print(f"[ACQAR] transcribe error: {e}")
#         return {"text": "", "error": "Transcription failed"}




# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     user_lang, user_dir = detect_language(message)
#     detection_message = message
#     if user_lang != "en":
#         detection_message = await _run(translate_to_english, message)
#         print(f"[ACQAR] translated query: {detection_message}")
#     msg_lower    = detection_message.lower()
#     context_data = {}
#     raw          = ""

# # ── FOLLOW-UP CONTEXT CARRY ──
#     if req.history:
#         prior_user_msgs = [
#             h.get("content", "") for h in req.history
#             if h.get("role") == "user" and h.get("content")
#         ]
#         if prior_user_msgs:
#             cur_all_areas    = get_all_area_ids(msg_lower)
#             carried_area_ids = {aid for aid, _ in cur_all_areas}
#             cur_bedrooms     = extract_bedrooms(detection_message)
#             cur_budget       = extract_budget(detection_message)
#             ROLE_KWS         = SELLER_KEYWORDS + BUYER_KEYWORDS + INVESTOR_KEYWORDS + BROKER_KEYWORDS
#             cur_role_hit     = any(k in msg_lower for k in ROLE_KWS)

#             carry = []
#             for prev in reversed(prior_user_msgs[-4:]):
#                 # FIX: translate non-English history turns before scanning —
#                 # otherwise area/role keyword detection silently fails on them.
#                 prev_lang, _ = detect_language(prev)
#                 p_en = await _run(translate_to_english, prev) if prev_lang != "en" else prev
#                 p = p_en.lower()

#                 # FIX: use get_all_area_ids (plural) so a prior comparison
#                 # ("Dubai Marina vs JVC") isn't collapsed down to a single area.
#                 if len(carried_area_ids) < 2:
#                     for aid, pkw in get_all_area_ids(p):
#                         if aid not in carried_area_ids:
#                             carry.append(pkw)
#                             carried_area_ids.add(aid)

#                 if not cur_bedrooms:
#                     pb = extract_bedrooms(p_en)
#                     if pb:
#                         carry.append(pb.lower())
#                         cur_bedrooms = pb

#                 if not cur_budget:
#                     pbud = extract_budget(p_en)
#                     if pbud:
#                         # FIX: serialize as "X.XX million aed" — extract_budget's
#                         # own patterns reliably re-match this on re-parse, unlike
#                         # a raw "aed 800000" which fails for budgets under 1M.
#                         carry.append(f"{pbud/1_000_000:.2f} million aed")
#                         cur_budget = pbud

#                 if not cur_role_hit and any(k in p for k in ROLE_KWS):
#                     carry.append(p_en)
#                     cur_role_hit = True

#                 if len(carried_area_ids) >= 2 and cur_bedrooms and cur_budget and cur_role_hit:
#                     break

#             if carry:
#                 detection_message = f"{detection_message} {' '.join(carry)}"
#                 msg_lower = detection_message.lower()
#                 print(f"[ACQAR] follow-up merged: {detection_message}")
#     user_type = detect_user_type(msg_lower)

#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(detection_message)
#     bedrooms               = extract_bedrooms(detection_message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     if is_vague(msg_lower, area_id, is_lifestyle):
#         is_seller = any(k in msg_lower for k in SELLER_KEYWORDS)
#         if is_seller:
#             clar = {
#                 "type": "text",
#                 "is_clarifying": True,
#                 "summary": "Which area is your apartment in? I'll pull real DLD data and give you an exact listing price.",
#                 "reply": (
#                     "To give you accurate selling data, I need one detail:\n\n"
#                     "1. Which area is your apartment in? (e.g. Dubai Marina, JVC, Downtown Dubai, Business Bay)\n\n"
#                     "Once I know the area, I'll pull the real DLD median price, recommended listing price, "
#                     "weekly transaction volume, and tell you exactly whether to sell now or wait — with real numbers."
#                 ),
#                 "charts": [], "insight": "",
#             }
#             if user_lang != "en":
#                 clar = translate_result_texts(clar, user_lang)
#             clar["language"]  = user_lang
#             clar["direction"] = user_dir
#             return clar
#         clar = {
#             "type": "text",
#             "is_clarifying": True,
#             "summary": "Let me get a few details to find the best match for you.",
#             "reply": (
#                 "To give you a data-backed answer, I need a few quick details:\n\n"
#                 "1. What is your budget? (e.g. AED 1M–2M, AED 3M–5M, AED 5M+)\n"
#                 "2. Are you buying to live in, or investing for rental income?\n"
#                 "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
#                 "4. How many bedrooms do you need?\n\n"
#                 "Once I know these, I'll pull real DLD closed-sale data and give you a shortlist with actual numbers — not asking prices."
#             ),
#             "charts": [], "insight": "",
#         }
#         if user_lang != "en":
#             clar = translate_result_texts(clar, user_lang)
#         clar["language"]  = user_lang
#         clar["direction"] = user_dir
#         return clar

#     if budget:
#         context_data["user_budget_aed"]   = budget
#         context_data["user_budget_label"] = f"AED {budget/1_000_000:.2f}M"
#     if bedrooms:
#         context_data["user_bedrooms"] = bedrooms

#     if area_id and not is_comparison:
#         await build_area_context_async(area_id, detected_area, context_data)
#     elif is_comparison and len(all_area_ids) >= 2:
#         sub_tasks = []
#         for aid, kw in all_area_ids[:3]:
#             sub = {}
#             key = f"comparison_{preferred_name(aid, kw).replace(' ','_').lower()}"
#             if key not in context_data: sub_tasks.append((key, aid, kw, sub))
#         await asyncio.gather(*[build_area_context_async(aid, kw, sub) for _, aid, kw, sub in sub_tasks])
#         for key, _, _, sub in sub_tasks: context_data[key] = sub
#     elif is_lifestyle and not area_id:
#         context_data["query_type"]      = "lifestyle"
#         context_data["_lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         lifestyle_ids = get_lifestyle_areas(msg_lower)
#         subs = [{} for _ in lifestyle_ids]
#         await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
#         for lid, sub in zip(lifestyle_ids, subs):
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

#     is_financing_question = any(k in msg_lower for k in NO_DP_KEYWORDS + FINANCING_KEYWORDS)

#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id and not is_financing_question:
#         top = await _run(fetch_top_yield_areas)
#         if top: context_data["top_yield_areas"] = top

#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id and not is_financing_question:
#         top = await _run(fetch_top_areas_intelligence)
#         if top: context_data["top_areas"] = top

#     if budget and not area_id and not is_lifestyle and not is_financing_question:
#         top = await _run(fetch_top_areas_intelligence, 30)
#         if top: context_data["budget_search_areas"] = top

#    # Also check lifestyle sub-contexts
#     _lifestyle_keys   = [k for k in context_data if k.startswith("lifestyle_")]
#     _comparison_keys  = [k for k in context_data if k.startswith("comparison_")]

#     has_area_data = bool(
#     context_data.get("area_intelligence") or
#     context_data.get("transaction_stats") or
#     context_data.get("top_yield_areas") or
#     context_data.get("top_areas") or
#     context_data.get("budget_search_areas") or
#     _lifestyle_keys or
#     _comparison_keys
# )

#     # ── CHANGE 3: If no area data, still fetch top areas for context ──
#     if not has_area_data and not area_id:
#         top = await _run(fetch_top_areas_intelligence, 10)
#         if top:
#             context_data["dubai_market_context"] = top

#     if has_area_data and is_specific_followup(detection_message, req.history):
#         ans = build_specific_answer(detection_message, context_data, bedrooms)
#         summary = (ans.get("summary") or "").strip()
#         reply_text = (ans.get("reply") or "").strip()
#         if not summary and reply_text:
#             # LLM sometimes leaves summary blank — derive a short one from the reply
#             # so the frontend never falls back to the "thinking" placeholder text.
#             first_sentence = reply_text.split(". ")[0].strip()
#             summary = first_sentence if len(first_sentence) <= 140 else first_sentence[:137] + "..."
#         specific_charts = build_charts(context_data, user_type) if wants_data_visual(detection_message) else []
#         result = {
#             "type":          "structured",
#             "user_type":     user_type,
#             "response_mode": "specific_answer",
#             "summary":       summary,
#             "reply":         reply_text,
#             "charts":        specific_charts,
#             "insight":       ans.get("insight", ""),
#         }
#     elif has_area_data:
#         is_multi_area = bool(_comparison_keys) or bool(_lifestyle_keys) or bool(context_data.get("budget_search_areas")) or \
#                          (user_type == "investor" and bool(context_data.get("top_yield_areas") or context_data.get("top_areas")))

#         if _comparison_keys:                              reply = build_comparison_reply(context_data, bedrooms)
#         elif _lifestyle_keys:                              reply = build_lifestyle_reply(context_data, bedrooms)
#         elif context_data.get("budget_search_areas"):    reply = build_budget_reply(context_data, bedrooms, budget)
#         elif user_type == "buyer":                       reply = build_buyer_reply(context_data, bedrooms)
#         elif user_type == "seller":                      reply = build_seller_reply(context_data, bedrooms)
#         elif user_type == "investor":                    reply = build_investor_reply(context_data, bedrooms)
#         elif user_type == "broker":                      reply = build_broker_reply(context_data, bedrooms)
#         else:                                            reply = build_general_reply(context_data, bedrooms)

#         result = {
#             "type":          "structured",
#             "user_type":     user_type,
#             "response_mode": "multi_area" if is_multi_area else "single_area",
#             "summary":       build_summary(user_type, context_data, bedrooms),
#             "reply":         reply,
#             "charts":        [] if _comparison_keys else build_charts(context_data, user_type),
#             "insight":       build_insight(user_type, context_data, bedrooms),
#         }

#         if _comparison_keys:
#             comparison_data = []
#             for k in _comparison_keys:
#                 sub = context_data[k]
#                 intel = sub.get("area_intelligence", {})
#                 if intel.get("area_name_en"):
#                     comparison_data.append({
#                         "name": intel.get("area_name_en"),
#                         "score": intel.get("investment_score"),
#                         "verdict": intel.get("verdict"),
#                         "yield_pct": intel.get("gross_yield_pct"),
#                         "avg_psm": intel.get("truvalu_psm") or sub.get("transaction_stats", {}).get("avg_price_sqm"),
#                         "price_trend": intel.get("price_trend_pct"),
#                         "bedroom_avg_psm": sub.get("transaction_stats", {}).get("bedroom_avg_psm", {}),
#                         "median_price_by_bedroom": sub.get("transaction_stats", {}).get("median_price_by_bedroom", {}),
#                         "price_history": sub.get("price_history_by_year", {}),
#                     })
#             result["comparison_data"] = comparison_data
#     else:
#         # No area DB match — LLM answers with full expert knowledge + market context
#         db_context = ""
#         wants_area_recommendations = any(w in msg_lower for w in MARKET_KEYWORDS + YIELD_KEYWORDS)
#         if context_data.get("dubai_market_context") and wants_area_recommendations:
#             top_areas = context_data["dubai_market_context"]
#             area_list = ", ".join([
#                 f"{a.get('area_name_en','')} (Score {a.get('investment_score','')}/100, Yield {a.get('gross_yield_pct','')}%)"
#                 for a in top_areas[:5] if a.get("area_name_en")
#             ])
#             db_context = f"\n\nACQAR Dubai Market Context (real DLD data):\nTop areas by score: {area_list}\nUse these real area names and data points where relevant in your answer."

#         if budget:
#             db_context += f"\n\nUser's estimated budget from message: AED {budget:,.0f}"

#         messages = [{"role": "system", "content": FALLBACK_SYSTEM_PROMPT}]
#         for h in (req.history or [])[-4:]:
#             if h.get("role") in ("user","assistant") and h.get("content"):
#                 messages.append({"role": h["role"], "content": str(h["content"])})
#         lang_instr = ""
#         if user_lang != "en":
#             lang_instr = (
#                 f"\n\nIMPORTANT: Write summary, reply, and insight entirely in {LANG_NAMES[user_lang]}. "
#                 f"Translate the section headers too, but ALWAYS keep the emoji as the first character of each header line. "
#                 f"Keep numbers, AED amounts, percentages, area names, developer names, and URLs in Latin script unchanged."
#             )
#         messages.append({
#             "role": "user",
#             "content": f"Question: {message}{db_context}{lang_instr}\n\nAnswer this fully and specifically. Reply with JSON only."
#         })

#         def call_groq(model: str) -> str:
#             resp = groq_client.chat.completions.create(
#                 model=model, messages=messages, temperature=0.2,
#                 max_tokens=1800, response_format={"type": "json_object"},
#             )
#             return resp.choices[0].message.content.strip()

#         try:
#             try:    raw = await _run(call_groq, PRIMARY_MODEL)
#             except: raw = await _run(call_groq, FALLBACK_MODEL)
#             result = extract_json(raw)
#             result["_llm_answered"] = True
#             result["type"] = "structured"; result["user_type"] = user_type
#             result["response_mode"] = "multi_area" if context_data.get("dubai_market_context") else "single_area"
#             result.pop("data_source", None)
#             # NOTE: hero area (score/verdict/yield_pct/area_intelligence) is now promoted
#             # uniformly below via pick_hero_area() — no manual promotion needed here.

#             # Prefer area names the LLM actually mentioned in its own reply — this
#             # correctly links a genuine "top areas" answer and correctly adds NO
#             # links to unrelated FAQ/company questions.
#             top_fallback = (
#                 context_data.get("top_yield_areas") or
#                 context_data.get("top_areas") or
#                 context_data.get("dubai_market_context") or
#                 []
#             )
#             reply_text = result.get("reply", "")
#             extracted_links = []
#             for area_name, area_id_val in AREA_ID_MAP.items():
#                 if area_name in reply_text.lower():
#                     display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
#                     url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
#                     if not any(l["url"] == url for l in extracted_links):
#                         extracted_links.append({"name": display, "url": url})
#                 if len(extracted_links) >= 8:
#                     break
#             if extracted_links:
#                 result["area_links"] = extracted_links
#             elif top_fallback and any(w in msg_lower for w in MARKET_KEYWORDS + YIELD_KEYWORDS):
#                 # Only fall back to generic top-ranked areas when the question
#                 # actually asked for area recommendations.
#                 result["area_links"] = [
#                     {
#                         "name": a.get("area_name_en", ""),
#                         "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
#                     }
#                     for a in top_fallback[:8] if a.get("area_name_en")
#                 ]
#         except Exception as e:
#             print(f"[ACQAR] LLM error: {e}")
#             result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}
    
   

#     is_specific_answer_mode = result.get("response_mode") == "specific_answer"
#     hero  = pick_hero_area(context_data)
#     intel = hero["intel"]

#     # Hero data taken directly from a detected area (context_data["area_intelligence"])
#     # is always trustworthy — the whole report is about that area. But when hero falls
#     # back to a top-ranked area from dubai_market_context/top_areas/top_yield_areas
#     # (i.e. no area was actually detected in the user's message), only attach it if the
#     # reply genuinely mentions that area — otherwise we're stapling unrelated area
#     # stats/badges onto a question that has nothing to do with that area.
#     hero_is_real_detected_area = bool(context_data.get("area_intelligence"))
#     reply_check = (result.get("reply") or "").lower().replace(" ", "")
#     hero_area_check = (intel.get("area_name_en") or "").lower().replace(" ", "").replace("(", "").replace(")", "")
#     hero_area_relevant = hero_is_real_detected_area or (hero_area_check and hero_area_check in reply_check)

#     if intel and intel.get("area_name_en") and hero_area_relevant and not is_specific_answer_mode:
#         result["score"]        = intel.get("investment_score")
#         result["verdict"]      = intel.get("verdict")
#         result["yield_pct"]    = intel.get("gross_yield_pct")
#         result["price_trend"]  = intel.get("price_trend_pct")
#         result["ranking"]      = intel.get("ranking_rank")
#         result["distress_pct"] = intel.get("distress_pct")
#         y = intel.get("gross_yield_pct")
#         if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)
#         result["area_intelligence"]  = intel
#         result["transaction_stats"]  = hero["stats"]
#         result["area_catalysts"]     = hero["cats"]
#         result["price_history"]      = hero["hist"]
#         result["developer_track_records"] = context_data.get("developer_track_records", [])

# # ── Area links — only areas actually in the reply ──
#     reply_text = result.get("reply", "")
#     reply_lower = reply_text.lower().replace(" ", "").replace("(", "").replace(")", "")

#     final_links = []
#     seen_urls   = set()

#   # 1. Comparison + Lifestyle areas — only those mentioned in reply
#     for k in context_data:
#         if k.startswith("lifestyle_") or k.startswith("comparison_"):
#             sub  = context_data[k]
#             if not isinstance(sub, dict): continue
#             name = (sub.get("area_intelligence") or {}).get("area_name_en") or sub.get("detected_area", "")
#             if not name: continue
#             check = name.lower().replace(" ", "").replace("(", "").replace(")", "")
#             if check in reply_lower:
#                 url = f"https://www.acqar.com/areas/{area_to_slug(name)}"
#                 if url not in seen_urls:
#                     final_links.append({"name": name, "url": url})
#                     seen_urls.add(url)

#     # 2. Top yield / top areas — only if mentioned in reply
#     if not final_links:
#         top_yield      = context_data.get("top_yield_areas", [])
#         top_areas_list = context_data.get("top_areas", [])
#         top_data       = top_yield or top_areas_list or context_data.get("dubai_market_context", [])
#         for a in top_data:
#             name = a.get("area_name_en", "")
#             if not name: continue
#             check = name.lower().replace(" ", "").replace("(", "").replace(")", "")
#             if check in reply_lower:
#                 url = f"https://www.acqar.com/areas/{area_to_slug(name)}"
#                 if url not in seen_urls:
#                     final_links.append({"name": name, "url": url})
#                     seen_urls.add(url)

#    # 3. Single detected area fallback — skip for specific answers, since a
#     # narrow Q&A shouldn't be force-tagged with whatever area was last loaded
#     # in context unless the reply text actually mentions that area (tier 4 below
#     # still covers that case).
#     if not final_links and not is_specific_answer_mode:
#         detected = context_data.get("detected_area", "")
#         if detected:
#             url = f"https://www.acqar.com/areas/{area_to_slug(detected)}"
#             final_links.append({"name": detected, "url": url})
#             seen_urls.add(url)

#     # 4. LLM reply fallback — scan reply text for any known area names
#     if not final_links:
#         for area_name in sorted(AREA_ID_MAP, key=len, reverse=True):
#             if area_name in reply_text.lower():
#                 area_id_val = AREA_ID_MAP[area_name]
#                 display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
#                 url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
#                 if url not in seen_urls:
#                     final_links.append({"name": display, "url": url})
#                     seen_urls.add(url)
#             if len(final_links) >= 6: break

#     if final_links:
#         result["area_links"] = final_links[:6]

#     detected = context_data.get("detected_area", "")
#     if detected:
#         result["area_url"] = f"https://www.acqar.com/areas/{area_to_slug(detected)}"

#     print(f"[DEBUG] top_yield count: {len(context_data.get('top_yield_areas', []))}")
#     print(f"[DEBUG] top_areas count: {len(context_data.get('top_areas', []))}")
#     print(f"[DEBUG] dubai_market_context count: {len(context_data.get('dubai_market_context', []))}")
#     print(f"[DEBUG] has_area_data: {has_area_data}")

#     skip_translate = result.pop("_llm_answered", False)
#     if user_lang != "en" and not skip_translate:
#         result = translate_result_texts(result, user_lang)
#     result["language"]  = user_lang
#     result["direction"] = user_dir
#     return result
    
    


















# import os
# import re
# import json
# import asyncio
# import traceback
# from concurrent.futures import ThreadPoolExecutor
# from datetime import date

# from fastapi import APIRouter, UploadFile, File
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict
# from groq import Groq

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# router      = APIRouter()
# SUPABASE_URL = os.getenv("SUPABASE_URL_CHAT", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY_CHAT", "")
# supabase     = create_client(SUPABASE_URL, SUPABASE_KEY)
# PRIMARY_MODEL  = "llama-3.3-70b-versatile"
# FALLBACK_MODEL = "llama3-70b-8192"
# BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")
# _executor = ThreadPoolExecutor(max_workers=10)

# class ChatRequest(BaseModel):
#     message: str
#     history: list = []

# AREA_ID_MAP = {
#     "jumeirah village circle": 59, "dubai creek harbour": 1509,
#     "dubai hills estate": 53, "arabian ranches 3": 16296,
#     "arabian ranches 2": 133, "arabian ranches": 133,
#     "jumeirah lake towers": 12, "jumeirah golf estates": 347,
#     "dubai sports city": 67, "dubai internet city": 1621,
#     "dubai production city": 5036, "dubai media city": 95,
#     "dubai harbour": 3512, "barsha heights": 25,
#     "discovery gardens": 13, "international city": 368,
#     "palm jumeirah": 410, "palm jebel ali": 1519,
#     "silicon oasis": 295, "bluewaters island": 1754,
#     "business bay": 54, "downtown dubai": 10,
#     "damac hills": 279, "damac hills 2": 352,
#     "damac lagoons": 75266, "tilal al ghaf": 5173,
#     "dubai islands": 5178, "creek harbour": 1509,
#     "dubai marina": 330, "dubai hills": 53,
#     "jumeirah park": 73, "sports city": 67,
#     "town square": 386, "dubai south": 3355,
#     "motor city": 268, "al furjan": 41,
#     "bluewaters": 1754, "al barsha": 105,
#     "al jaddaf": 1509, "al karama": 271,
#     "al satwa": 1347, "nad al sheba": 161,
#     "oud metha": 388, "expo city": 85082,
#     "dubailand": 51, "meydan": 43,
#     "downtown": 10, "the greens": 25,
#     "jaddaf": 1509, "tecom": 25, "greens": 25,
#     "karama": 271, "satwa": 1347, "mirdif": 232,
#     "marina": 330, "palm": 410, "difc": 117,
#     "impz": 5036, "arjan": 91, "dso": 295,
#    "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
#     "jbr": 100023, "jumeirah beach residence": 100023,
#     "burj khalifa": 390,
#     "jumeirah first": 317, "jumeirah second": 375, "jumeirah third": 318,
#     "al wasl": 914,
#     "pearl jumeirah": 344,
#     "green community": 673,
#     "dubai festival city": 277,
#     "dubai studio city": 81,
#     "world islands": 413,
#     "palm deira": 432, "palm jabal ali": 411,
#     "living legends": 52,
#     "al quoz": 293,
#     "al safa": 313,
#     "dubai design district": 22688, "d3": 22688,
#     "dubai maritime city": 2848,
#     "culture village": 190, "jaddaf waterfront": 190,
#     "dubai land residence complex": 603,
#     "trade center": 341,
#     "bur dubai": 345,
# }

# AREA_DISPLAY_NAMES = {
#     36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
#     10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
#     23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
#     117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
#     3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
#     67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills 2 (Akoya by DAMAC)",
#     386: "Town Square", 91: "Arjan", 105: "Al Barsha", 295: "Dubai Silicon Oasis (DSO)",
#     232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
#     25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
#     43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
#     51: "Dubailand", 85082: "Expo City Dubai",
#     330: "Dubai Marina", 390: "Burj Khalifa", 317: "Jumeirah First",
#     375: "Jumeirah Second", 318: "Jumeirah Third", 914: "Al Wasl",
#     344: "Pearl Jumeirah", 673: "Green Community", 277: "Dubai Festival City",
#     81: "Dubai Studio City", 413: "World Islands", 432: "Palm Deira",
#     411: "Palm Jabal Ali", 52: "Living Legends", 293: "Al Quoz",
#     313: "Al Safa", 22688: "Dubai Design District (D3)",
#     2848: "Dubai Maritime City", 190: "Culture Village (Jaddaf Waterfront)",
#    603: "Dubai Land Residence Complex", 341: "Trade Center First",
#     100023: "Jumeirah Beach Residence (JBR)",

# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
#     "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
#     "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
# }

# ROOM_LABEL_MAP = {"0": "Studio", "1": "1 BR", "2": "2 BR", "3": "3 BR", "4": "4 BR", "5": "5 BR"}

# def _room_label(v):
#     if v is None: return None
#     try: n = int(float(v))
#     except: return None
#     return ROOM_LABEL_MAP.get(str(n))

# def _clean_area_search_term(name: str) -> str:
#     return re.sub(r'\s*\([^)]*\)', '', name or "").strip()

# # These actually map to specific areas in LIFESTYLE_AREA_MAP — trigger area search
# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "golf", "waterfront", "airbnb", "short term", "holiday home",
#     "freehold", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 73], "family": [53, 73, 133, 59],
#     "school": [53, 73, 133], "expat": [330, 10, 54, 12],
#     "beach": [410, 330, 1754], "beachfront": [410, 1754],
#     "luxury": [410, 10, 330, 117], "affordable": [59, 91, 13, 368],
#     "cheap": [59, 368, 13], "budget": [59, 13, 368],
#     "golf": [347, 352, 53], "waterfront": [330, 410, 12, 1754],
#     "metro": [25, 12, 54, 10], "airbnb": [330, 10, 54, 1754],
#     "short term": [330, 10, 54], "holiday home": [410, 330, 1754],
#     "villa": [73, 133, 352, 53], "freehold": [59, 330, 54, 10],
# }

# MARKET_KEYWORDS = [
#     "best area", "top area", "highest yield", "compare", "market overview",
#     "which area", "recommend", "suggest", "vs", "versus",
#     "where to buy", "where should", "top 5", "top 3", "best areas",
#     "rank", "ranking", "overview", "investment score", "highest score",
#     "best investment", "top investment",
# ]

# YIELD_KEYWORDS = [
#     "yield", "rental yield", "highest yield", "best yield",
#     "top yield", "rental income", "gross yield",
# ]

# VAGUE_PATTERNS = [
#     "just landed", "new to dubai", "moving to dubai", "relocating",
#     "want to buy", "looking to buy", "thinking of buying",
#     "buy property in dubai", "invest in dubai", "where should i buy",
#     "help me find", "guide me", "not sure", "any suggestions",
#     "what should i buy", "where to start", "i don't know", "i dont know",
# ]

# NO_DP_KEYWORDS = [
#     "no downpayment", "no down payment", "without downpayment", "without down payment",
#     "zero downpayment", "zero down payment", "0 downpayment", "0 down payment",
#     "no dp", "without dp", "downpayment not required", "down payment not required",
#     "no money for downpayment", "don't have downpayment", "do not have downpayment",
#     "not have sufficient funds", "insufficient funds", "not sufficient funds",
#     "no sufficient funds", "way around", "workaround", "post handover",
#     "post-handover", "payment plan", "0% downpayment", "emi only",
#     "salary and side income", "side income",
# ]

# FINANCING_KEYWORDS = [
#     "emi", "mortgage", "home loan", "bank loan", "financing", "finance",
#     "monthly payment", "instalment", "installment", "pre-approval",
#     "murabaha", "ltv", "down payment", "downpayment", "ready to move",
# ]


# BUYER_KEYWORDS = [
#     "buy", "buying", "purchase", "i want to buy", "looking to buy",
#     "first time buyer", "end user", "own use", "live in", "to live",
#     "move in", "move to", "living in", "reside", "residence",
#     "family home", "apartment for myself", "home for", "which area should i",
#     "where should i buy", "afford", "for myself", "for my family",
#     "to stay", "to reside", "end-user", "for living", "off-plan", "oqood", "spa", "defect", "snagging", "handover",
# "cooling off", "escrow", "noc", "form f", "title deed", "freehold",
# "leasehold", "service charge", "golden visa", "dewa", "pre-approval",
# "ltv", "murabaha", "mortgage", "down payment", "first time",

# ]
# SELLER_KEYWORDS = [
#     "sell", "selling", "list", "listing", "put on market", "good time to sell",
#     "should i sell", "when to sell", "exit", "offload", "dispose",
#     "my property", "my apartment", "my villa", "i own", "i have a property",
#     "sale price", "asking price", "how much can i sell", "want to sell",
#     "looking to sell", "thinking of selling", "time to sell", "evict", "eviction", "tenancy", "vacant possession", "assignment",
# "power of attorney", "poa", "repatriate", "capital gain", "flip",
# "listing", "mandate", "valuation", "form a", "form b",
# ]
# INVESTOR_KEYWORDS = [
#     "invest", "investment", "roi", "return", "yield", "rental yield",
#     "rental income", "passive income", "portfolio", "capital appreciation",
#     "cash flow", "gross yield", "net yield", "off plan", "off-plan",
#     "hold", "flip", "exit strategy", "capital gain", "rental return",
#     "buy to let", "buy-to-let", "multiple units", "diversify",
#     "best return", "highest return", "income property", "rent out",
#     "tenant", "letting", "rental property","airbnb", "short term rental", "holiday home", "dtcm", "flip",
# "assignment", "occupancy rate", "net yield", "service charge",
# "token", "reit", "hotel apartment", "co-living", "d33",
# ]
# BROKER_KEYWORDS = [
#     "broker", "agent", "realtor", "rera", "client", "my client", "clients",
#     "commission", "viewings", "leads", "prospect", "pipeline",
#     "market report", "area report", "pitch", "present to client",
#     "comparable", "comps", "transaction data", "dld data",
#     "i am an agent", "i'm an agent", "i work in real estate",
#     "real estate professional", "property consultant", "give me comparables",
#     "for my client", "i work as", "rera card", "rera licence", "commission split", "lead generation",
# "bayut", "property finder", "off-plan launch", "form a", "form b",
# "dual agency", "co-broking", "aml", "ejari", "crm", "mandate",
# "exclusive listing", "tyre-kicker", "co-broke",
# ]


# def detect_user_type(msg_lower: str) -> str:
#     if any(k in msg_lower for k in BROKER_KEYWORDS):   return "broker"
#     if any(k in msg_lower for k in SELLER_KEYWORDS):   return "seller"
#     if any(k in msg_lower for k in INVESTOR_KEYWORDS): return "investor"
#     if any(k in msg_lower for k in BUYER_KEYWORDS):    return "buyer"
#     return "general"


# def detect_language(text: str):
#     """Returns (lang_code, direction)"""
#     # Arabic script block (covers Arabic + Urdu)
#     if re.search(r'[\u0600-\u06FF\u0750-\u077F]', text):
#         # Urdu-specific letters: ٹ ڈ ڑ ں ھ ہ ے etc.
#         if re.search(r'[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06C2\u06D2]', text):
#             return "ur", "rtl"
#         return "ar", "rtl"
#     if re.search(r'[\u4e00-\u9fff]', text):          # Chinese
#         return "zh", "ltr"
#     return "en", "ltr"


# LANG_NAMES = {"ar": "Arabic", "ur": "Urdu", "zh": "Simplified Chinese"}


# def translate_result_texts(result: dict, lang: str) -> dict:
#     """Translates summary / reply / insight via Groq. Numbers, URLs, emojis stay intact."""
#     target = LANG_NAMES.get(lang)
#     if not target:
#         return result

#     payload = {
#         "summary": result.get("summary", ""),
#         "reply":   result.get("reply", ""),
#         "insight": result.get("insight", ""),
#     }
#     sys = (
#         f"You are a translator. Translate the JSON string values into {target}.\n"
#         "STRICT RULES:\n"
#         "- Keep ALL numbers, AED amounts, percentages, dates EXACTLY unchanged\n"
#         "- Keep area names (e.g. Dubai Marina, JVC), developer names, and URLs unchanged\n"
#         "- Keep all emojis, bullet symbols (•), and line breaks (\\n) in the same positions\n"
#         "- TRANSLATE section header text (e.g. '📌 INVESTMENT VERDICT' → '📌 قرار الاستثمار') but the emoji must remain the FIRST character of the header line\n"
#         "- Return ONLY valid JSON with the same keys: summary, reply, insight"
#     )
#     messages = [
#         {"role": "system", "content": sys},
#         {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
#     ]

#     def call(model):
#         resp = groq_client.chat.completions.create(
#             model=model, messages=messages, temperature=0,
#             max_tokens=2500, response_format={"type": "json_object"},
#         )
#         return resp.choices[0].message.content.strip()

#     try:
#         try:    raw = call(PRIMARY_MODEL)
#         except: raw = call(FALLBACK_MODEL)
#         translated = extract_json(raw)
#         for k in ("summary", "reply", "insight"):
#             if translated.get(k):
#                 result[k] = translated[k]
#     except Exception as e:
#         print(f"[ACQAR] translation error: {e}")  # fail silently → English fallback
#     return result



# def translate_to_english(text: str) -> str:
#     """Translate user query to English so keyword/area detection works. Returns original on failure."""
#     try:
#         resp = groq_client.chat.completions.create(
#             model=PRIMARY_MODEL,
#             messages=[
#                 {"role": "system", "content": (
#                     "Translate the user's message to English. Return ONLY the translated text, nothing else. "
#                     "Use standard English names for Dubai areas (e.g. واحة دبي للسيليكون → Dubai Silicon Oasis, "
#                     "دبي مارينا → Dubai Marina, وسط مدينة دبي → Downtown Dubai, الخليج التجاري → Business Bay, "
#                     "نخلة جميرا → Palm Jumeirah). Keep numbers, AED amounts, and percentages unchanged."
#                 )},
#                 {"role": "user", "content": text},
#             ],
#             temperature=0, max_tokens=400,
#         )
#         return resp.choices[0].message.content.strip()
#     except Exception as e:
#         print(f"[ACQAR] translate-to-english error: {e}")
#         return text

# def _fix_unescaped_newlines(s: str) -> str:
#     result, in_str, escaped = [], False, False
#     for ch in s:
#         if escaped: result.append(ch); escaped = False; continue
#         if ch == "\\" and in_str: result.append(ch); escaped = True; continue
#         if ch == '"': in_str = not in_str; result.append(ch); continue
#         if in_str:
#             if ch == "\n": result.append("\\n"); continue
#             if ch == "\r": result.append("\\r"); continue
#             if ch == "\t": result.append("\\t"); continue
#         result.append(ch)
#     return "".join(result)


# def extract_json(raw: str) -> dict:
#     raw = raw.strip()
#     if raw.startswith("```"):
#         raw = re.sub(r"^```(?:json)?", "", raw); raw = re.sub(r"```$", "", raw); raw = raw.strip()
#     for attempt in [raw, _fix_unescaped_newlines(raw)]:
#         try: return json.loads(attempt)
#         except: pass
#     match = re.search(r'\{.*\}', raw, re.DOTALL)
#     if match:
#         for attempt in [match.group(0), _fix_unescaped_newlines(match.group(0))]:
#             try: return json.loads(attempt)
#             except: pass
#     return {"summary": "", "reply": raw, "charts": [], "insight": ""}


# def get_area_id(msg_lower: str):
#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         if kw in msg_lower: return AREA_ID_MAP[kw], kw
#     return None, None


# def get_all_area_ids(msg_lower: str) -> list:
#     found, seen = [], set()
#     matched_spans = []  # character ranges already claimed by a longer keyword

#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         idx = msg_lower.find(kw)
#         while idx != -1:
#             end = idx + len(kw)
#             overlaps = any(idx < s_end and end > s_start for s_start, s_end in matched_spans)
#             if not overlaps:
#                 aid = AREA_ID_MAP[kw]
#                 if aid not in seen:
#                     found.append((aid, kw))
#                     seen.add(aid)
#                 matched_spans.append((idx, end))
#                 break  # this keyword has claimed its mention, stop looking for more occurrences
#             idx = msg_lower.find(kw, idx + 1)

#     return found


# def get_lifestyle_areas(msg_lower: str) -> list:
#     scores = defaultdict(int)
#     for kw, aids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if kw in msg_lower:
#             for rank, aid in enumerate(aids): scores[aid] += (5 - rank)
#     return sorted(scores, key=lambda x: -scores[x])[:4]


# # ── CHANGE 1: EMI detection added to extract_budget ──────────────
# def extract_budget(msg: str):
#     mc = msg.lower().replace(",", "").replace("aed", "").strip()

#     # Detect monthly EMI/salary → estimate property budget
#     emi_match = re.search(r'emi\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
#     if not emi_match:
#         emi_match = re.search(r'(\d+)\s*/?\s*month', mc)
#     if not emi_match:
#         emi_match = re.search(r'salary\s+(?:is\s+|of\s+)?(?:aed\s+)?(\d+)', mc)
#     if emi_match:
#         emi = float(emi_match.group(1).replace(",", ""))
#         if 2000 < emi < 150000:  # sanity: monthly figure
#             return round(emi * 150)  # ~12yr mortgage estimate

#     for pat in [r'(\d+\.?\d*)\s*(?:million|m)\b', r'(\d{7,})', r'(\d+\.?\d*)\s*k\b']:
#         m = re.search(pat, mc)
#         if m:
#             val = float(m.group(1)); tail = mc[m.start():m.end()+2]
#             if "k" in tail: return val * 1_000
#             if val < 1000:  return val * 1_000_000
#             return val
#     return None


# def extract_bedrooms(msg: str):
#     m = msg.lower()
#     for pat, label in [
#         (r'\bstudio\b',"Studio"),(r'\b1[\s-]*(?:br|bed|bedroom)\b',"1 BR"),
#         (r'\b2[\s-]*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3[\s-]*(?:br|bed|bedroom)\b',"3 BR"),
#         (r'\b4[\s-]*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
#         (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
#     ]:
#         if re.search(pat, m): return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle: return False
#     if any(k in msg_lower for k in NO_DP_KEYWORDS): return False
#     if any(k in msg_lower for k in FINANCING_KEYWORDS): return False
#     # Seller without area → ask which area
#     is_seller = any(k in msg_lower for k in SELLER_KEYWORDS)
#     has_specific = any(w in msg_lower for w in [
#         "yield","price","psm","sqm","trend","compare","vs","score",
#         "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
#         "commission","fee","broker","agent","process","how to","documents","noc","visa",
#     ])
#     if is_seller and not has_specific: return True
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values: return None
#     s = sorted(values); n = len(s); mid = n // 2
#     return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))

# def pick_hero_area(context_data: dict) -> dict:
#     """Returns intel/stats/cats/hist for whichever area should drive the widget cards."""
#     if context_data.get("area_intelligence") and context_data["area_intelligence"].get("area_name_en"):
#         return {
#             "intel": context_data["area_intelligence"],
#             "stats": context_data.get("transaction_stats", {}),
#             "cats":  context_data.get("area_catalysts", []),
#             "hist":  context_data.get("price_history_by_year", {}),
#         }

#     lifestyle_keys = [k for k in context_data if k.startswith("lifestyle_")]
#     if lifestyle_keys:
#         best_key = max(
#             lifestyle_keys,
#             key=lambda k: float((context_data[k].get("area_intelligence") or {}).get("investment_score") or 0)
#         )
#         sub = context_data[best_key]
#         if (sub.get("area_intelligence") or {}).get("area_name_en"):
#             return {
#                 "intel": sub.get("area_intelligence", {}),
#                 "stats": sub.get("transaction_stats", {}),
#                 "cats":  sub.get("area_catalysts", []),
#                 "hist":  sub.get("price_history_by_year", {}),
#             }

#     if context_data.get("budget_search_areas"):
#         areas = context_data["budget_search_areas"]
#         if areas and areas[0].get("area_name_en"):
#             top = areas[0]
#             return {
#                 "intel": {
#                     "area_name_en":     top.get("area_name_en"),
#                     "truvalu_psm":      top.get("truvalu_psm"),
#                     "gross_yield_pct":  top.get("gross_yield_pct"),
#                     "investment_score": top.get("investment_score"),
#                     "verdict":          top.get("verdict"),
#                     "price_trend_pct":  top.get("price_trend_pct"),
#                 },
#                 "stats": {}, "cats": [], "hist": {},
#             }

#     for key in ("top_yield_areas", "top_areas", "dubai_market_context"):
#         data = context_data.get(key)
#         if data and data[0].get("area_name_en"):
#             top = data[0]
#             return {
#                 "intel": {
#                     "area_name_en":     top.get("area_name_en"),
#                     "truvalu_psm":      top.get("truvalu_psm"),
#                     "gross_yield_pct":  top.get("gross_yield_pct"),
#                     "investment_score": top.get("investment_score"),
#                     "verdict":          top.get("verdict"),
#                     "price_trend_pct":  top.get("price_trend_pct"),
#                 },
#                 "stats": {}, "cats": [], "hist": {},
#             }

#     return {"intel": {}, "stats": {}, "cats": [], "hist": {}}


# def fmt_aed(v) -> str:
#     if v is None: return ""
#     v = float(v)
#     if v >= 1_000_000: return f"AED {v/1_000_000:.2f}M"
#     if v >= 1_000:     return f"AED {int(v):,}"
#     return f"AED {v:.0f}"


# def fmt_psm(v) -> str:
#     if v is None: return ""
#     return f"AED {int(float(v)):,}/sqm"


# def area_to_slug(area_name: str) -> str:
#     slug = area_name.lower().strip()
#     slug = re.sub(r'\s+', '-', slug)
#     slug = re.sub(r'[^a-z0-9-]', '', slug)
#     return slug


# # ─────────────────────────────────────────────────────────────────
# # SUPABASE FETCHERS
# # ─────────────────────────────────────────────────────────────────
# def fetch_area_intelligence(area_id: int):
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
#             "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
#             "zone_type, master_developer, completion_rate, residential_units, "
#             "parks_info, retail_info, active_project_count, buyer_nationalities, "
#             "key_developers, active_project_names, tx_7d, tx_7d_delta_pct, "
#             "distress_pct, year_established"
#         ).eq("area_id", area_id).limit(1).execute()
#         return res.data[0] if res.data else None
#     except: return None


# def fetch_area_stats(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select(
#             "price_per_sqm, procedure_area, actual_worth, rooms_en, property_type_en, sale_year, sale_month"
#         ).eq("area_id", area_id).not_.is_("sale_year", "null").order(
#             "sale_year", desc=True
#         ).order("sale_month", desc=True).limit(100).execute()
#         return res.data or []
#     except: return []


# def fetch_price_history(area_id: int) -> list:
#     try:
#         res = supabase.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).limit(36).execute()
#         return res.data or []
#     except: return []


# def fetch_area_catalysts(area_id: int) -> list:
#     try:
#         today = date.today().isoformat()
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").gte("expected_date", today).order("expected_date", desc=False).limit(5).execute()
#         return res.data or []
#     except: return []


# def fetch_developer_track_records(developer_names: list) -> list:
#     try:
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean: return []
#         res = supabase.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except: return []


# def fetch_area_shock_impacts(zone_type: str) -> list:
#     try:
#         if not zone_type: return []
#         res = supabase.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except: return []


# def fetch_top_areas_intelligence(limit: int = 20) -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(limit).execute()
#         return res.data or []
#     except: return []


# def fetch_top_yield_areas() -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, gross_yield_pct, investment_score, verdict, truvalu_psm, price_trend_pct"
#         ).not_.is_("gross_yield_pct", "null").order("gross_yield_pct", desc=True).limit(10).execute()
#         return res.data or []
#     except: return []


# def fetch_dld_projects(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select("project_name_en").eq("area_id", area_id).not_.is_("project_name_en", "null").limit(100).execute()
#         if not res.data: return []
#         counts = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"): counts[r["project_name_en"]] += 1
#         return sorted(counts.items(), key=lambda x: -x[1])[:5]
#     except: return []



# def fetch_rental_stats(area_name: str) -> dict:
#     try:
#         res = supabase.table("rentals").select(
#             "ANNUAL_AMOUNT,PROP_TYPE_EN,PROP_SUB_TYPE_EN,ROOMS,USAGE_EN,VERSION_EN,REGISTRATION_DATE"
#         ).ilike("AREA_EN", f"%{area_name}%").order("REGISTRATION_DATE", desc=True).limit(500).execute()
#         rows = res.data or []
#         if not rows: return {}

#         rents = [float(r["ANNUAL_AMOUNT"]) for r in rows if r.get("ANNUAL_AMOUNT")]
#         by_room = defaultdict(list); by_type = defaultdict(list)
#         version_count = defaultdict(int)

#         for r in rows:
#             amt = r.get("ANNUAL_AMOUNT")
#             if not amt: continue
#             amt = float(amt)
#             label = _room_label(r.get("ROOMS"))
#             if label: by_room[label].append(amt)
#             ptype = r.get("PROP_SUB_TYPE_EN") or r.get("PROP_TYPE_EN")
#             if ptype: by_type[ptype].append(amt)
#             if r.get("VERSION_EN"): version_count[r["VERSION_EN"]] += 1

#         return {
#             "count": len(rows),
#             "avg_annual_rent": round(sum(rents)/len(rents), 0) if rents else None,
#             "median_annual_rent": median_val(rents),
#             "rent_by_bedroom": {
#                 k: {"avg": round(sum(v)/len(v), 0), "median": median_val(v), "count": len(v)}
#                 for k, v in by_room.items() if len(v) >= 2
#             },
#             "rent_by_type": {k: round(sum(v)/len(v), 0) for k, v in by_type.items() if len(v) >= 2},
#             "new_vs_renewed": dict(version_count),
#         }
#     except Exception as e:
#         print(f"[ACQAR] fetch_rental_stats error: {e}")
#         return {}

# def fetch_rental_stats_for_area(name: str, keyword: str) -> dict:
#     for cand in filter(None, [_clean_area_search_term(name), keyword]):
#         data = fetch_rental_stats(cand)
#         if data: return data
#     return {}


# async def _run(func, *args):
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(_executor, func, *args)

# async def build_area_context_async(area_id: int, detected_keyword: str, context_data: dict):
#     name = preferred_name(area_id, detected_keyword)
#     context_data["detected_area"] = name
#     context_data["area_id"]       = area_id

#     intel, area_data, history, catalysts, projects = await asyncio.gather(
#         _run(fetch_area_intelligence, area_id),
#         _run(fetch_area_stats, area_id),
#         _run(fetch_price_history, area_id),
#         _run(fetch_area_catalysts, area_id),
#         _run(fetch_dld_projects, area_id),
#     )

#     dld_name = (intel.get("area_name_en") if intel else None) or name
#     rental_stats = await _run(fetch_rental_stats_for_area, dld_name, detected_keyword)
#     if rental_stats: context_data["rental_stats"] = rental_stats

#     dev_records = []; shock_data = []
#     if intel:
#         devs = intel.get("key_developers") or []; zone = intel.get("zone_type")
#         tasks = []
#         fd = bool(devs); fs = bool(zone)
#         if fd: tasks.append(_run(fetch_developer_track_records, devs))
#         if fs: tasks.append(_run(fetch_area_shock_impacts, zone))
#         results = await asyncio.gather(*tasks) if tasks else []
#         idx = 0
#         if fd: dev_records = results[idx] or []; idx += 1
#         if fs: shock_data  = results[idx] or []

#     if intel:       context_data["area_intelligence"]           = intel
#     if dev_records: context_data["developer_track_records"]     = dev_records
#     if shock_data:  context_data["historical_shock_resilience"] = shock_data

#     if area_data:
#         prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#         worths = [float(r["actual_worth"])   for r in area_data if r.get("actual_worth")]
#         room_psm = defaultdict(list); room_worth = defaultdict(list)
#         room_count = defaultdict(int)
#         year_map = defaultdict(list)

#         for r in area_data:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 room_count[label] += 1
#                 if r.get("price_per_sqm"): room_psm[label].append(float(r["price_per_sqm"]))
#                 worth = r.get("actual_worth")
#                 # Fall back to price_per_sqm × procedure_area when actual_worth is missing
#                 if not worth and r.get("price_per_sqm") and r.get("procedure_area"):
#                     worth = float(r["price_per_sqm"]) * float(r["procedure_area"])
#                 if worth: room_worth[label].append(float(worth))
#             if r.get("sale_year") and r.get("price_per_sqm"):
#                 year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#         def is_valid_bedroom(br: str) -> bool:
#             if room_count.get(br, 0) < 3: return False
#             med = median_val(room_worth.get(br, []))
#             if med and float(med) > 20_000_000: return False
#             return True

#         context_data["transaction_stats"] = {
#             "count":                   len(area_data),
#             "avg_price_sqm":           round(sum(prices)/len(prices), 0) if prices else None,
#             "min_price_sqm":           round(min(prices), 0) if prices else None,
#             "max_price_sqm":           round(max(prices), 0) if prices else None,
#             "avg_worth_aed":           round(sum(worths)/len(worths), 0) if worths else None,
#             "bedroom_avg_psm":         {k: round(sum(v)/len(v), 0) for k, v in room_psm.items() if is_valid_bedroom(k)},
#             "yearly_avg_psm":          {str(k): round(sum(v)/len(v), 0) for k, v in sorted(year_map.items())},
#             "median_price_by_bedroom": {k: median_val(v) for k, v in room_worth.items() if is_valid_bedroom(k)},
#         }

#     if history:
#         year_avg = defaultdict(list)
#         for r in history: year_avg[r["sale_year"]].append(r["psf"])
#         context_data["price_history_by_year"] = {str(y): round(sum(v)/len(v), 0) for y, v in sorted(year_avg.items())}
#     elif context_data.get("transaction_stats", {}).get("yearly_avg_psm"):
#         # price_history_manual is empty — fall back to real avm-derived yearly averages
#         context_data["price_history_by_year"] = context_data["transaction_stats"]["yearly_avg_psm"]

#     # If area_intelligence.price_trend_pct is missing, derive it from real avm-based
#     # yearly averages (same-source, consecutive-year comparison — no unit mixing).
#     if context_data.get("area_intelligence") and not context_data["area_intelligence"].get("price_trend_pct"):
#         yearly = context_data.get("price_history_by_year") or {}
#         if len(yearly) >= 2:
#             years = sorted(yearly.keys())
#             old_v = yearly[years[-2]]
#             new_v = yearly[years[-1]]
#             if old_v:
#                 derived_trend = round(((new_v - old_v) / old_v) * 100, 1)
#                 context_data["area_intelligence"]["price_trend_pct"] = derived_trend
#                 context_data["price_trend_is_derived"] = True

#     if catalysts: context_data["area_catalysts"] = catalysts
#     if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# # ─────────────────────────────────────────────────────────────────
# # REPLY BUILDERS (unchanged from your working version)
# # ─────────────────────────────────────────────────────────────────

# def build_lifestyle_reply(ctx: dict, bedrooms: str) -> str:
#     lines = []
#     lifestyle_tags = ctx.get("_lifestyle_tags", [])
#     priority_tags = [t for t in lifestyle_tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
#     tag_str = " & ".join(t.title() for t in priority_tags[:2]) + " Living" if priority_tags else "Family Living"

#     # Collect lifestyle sub-contexts
#     areas = []
#     for k, v in ctx.items():
#         if k.startswith("lifestyle_") and isinstance(v, dict):
#             intel = v.get("area_intelligence") or {}
#             stats = v.get("transaction_stats") or {}
#             cats  = v.get("area_catalysts") or []
#             hist  = v.get("price_history_by_year") or {}
#             devs  = v.get("developer_track_records") or []
#             name  = intel.get("area_name_en") or v.get("detected_area", "")
#             if name:
#                 areas.append({
#                     "name": name, "intel": intel, "stats": stats,
#                     "cats": cats, "hist": hist, "devs": devs,
#                 })

#     if not areas:
#         return build_general_reply(ctx, bedrooms)

#     lines.append(f"📌 DIRECT ANSWER")
#     lines.append(f"• Here are the top {len(areas)} areas where British families with kids actually live in Dubai — based on real buyer nationality data, school proximity, and DLD closed-sale prices")
#     lines.append(f"• All prices are real DLD closed sales — not asking prices, not agent estimates")

#     lines.append(f"\n💡 YOUR OPTIONS — {len(areas)} Areas to Consider")

#     for i, area in enumerate(areas, 1):
#         name  = area["name"]
#         intel = area["intel"]
#         stats = area["stats"]
#         cats  = area["cats"]
#         hist  = area["hist"]
#         devs  = area["devs"]

#         score   = intel.get("investment_score")
#         yld     = intel.get("gross_yield_pct")
#         verdict = (intel.get("verdict") or "").upper()
#         trend   = intel.get("price_trend_pct")
#         rank    = intel.get("ranking_rank")
#         parks   = intel.get("parks_info") or ""
#         retail  = intel.get("retail_info") or ""
#         nats    = intel.get("buyer_nationalities") or []
#         devlist = intel.get("key_developers") or []
#         off_plan= intel.get("active_project_names") or []
#         bmed    = stats.get("median_price_by_bedroom") or {}
#         bpsm    = stats.get("bedroom_avg_psm") or {}

#         lines.append(f"\nOption {i} — {name}")

#         # Score + verdict
#         if score:
#             lines.append(f"• Investment Score: {score}/100" + (f" — Verdict: {verdict}" if verdict else ""))
        

#         # Yield
#         if yld:
#             diff = round(float(yld) - 6.1, 2)
#             lines.append(f"• Gross Yield: {yld}% ({'+' if diff>=0 else ''}{diff}% vs Dubai avg 6.1%)")

#         # Price trend
#         if trend is not None:
#             direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
#             lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% YoY ({direction})")

#         # Community
#         if parks:  lines.append(f"• Green spaces: {parks}")
#         if retail: lines.append(f"• Amenities: {retail}")

#         # Nationalities — show British % prominently
#         if nats:
#             brit = next((n for n in nats if "british" in n.get("name","").lower() or "uk" in n.get("name","").lower()), None)
#             top2 = nats[:2]
#             nat_str = " · ".join([f"{n.get('flag','')} {n.get('name','')} {n.get('pct','')}%" for n in top2])
#             lines.append(f"• Who buys here: {nat_str}")
#             if brit:
#                 lines.append(f"• British presence: {brit.get('flag','🇬🇧')} {brit.get('pct','')}% of all buyers — strong expat community")

#         # Developers
#         if devlist:
#             lines.append(f"• Key developers: {' · '.join(devlist[:3])}")

#         # Off-plan projects
#         if off_plan:
#             lines.append(f"• Active off-plan projects: {' · '.join(off_plan[:3])}")
#         else:
#             lines.append(f"• Off-plan: No active launches — secondary market only")

#         # Entry prices by bedroom
#         target_br = bedrooms or "3 BR"
#         if bmed:
#             med = bmed.get(target_br) or bmed.get("2 BR") or (list(bmed.values())[0] if bmed else None)
#             psm = bpsm.get(target_br) or bpsm.get("2 BR") or (list(bpsm.values())[0] if bpsm else None)
#             if med:
#                 line = f"• {target_br} median price: {fmt_aed(med)} (real DLD closed sale)"
#                 if psm: line += f" · {fmt_psm(psm)}"
#                 lines.append(line)
#             # Show all bedroom types
#             for br in ["2 BR", "3 BR", "4 BR"]:
#                 if br == target_br or br not in bmed: continue
#                 lines.append(f"• {br}: {fmt_aed(bmed[br])}" + (f" · {fmt_psm(bpsm[br])}" if br in bpsm else ""))

#         # Past → Present → Future
#         if hist and len(hist) >= 2:
#             years = sorted(hist.keys())
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg   = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
#             lines.append(f"• Past → Present: {fmt_psm(old_v)} ({years[0]}) → {fmt_psm(new_v)} ({years[-1]}) = {'+' if chg>0 else ''}{chg}%")
#             if chg != 0:
#                 projected = round(float(new_v) * (1 + chg / 100), 0)
#                 lines.append(f"• Future (projected ~{int(years[-1])+1}): ~{fmt_psm(projected)} at current trend rate")
#         elif trend is not None and bpsm:
#             avg_psm = list(bpsm.values())[0]
#             projected = round(float(avg_psm) * (1 + float(trend) / 100), 0)
#             lines.append(f"• Future (projected): ~{fmt_psm(projected)} in 12 months at {'+' if float(trend)>0 else ''}{trend}% trend")

#         # Developer track records
#         if devs:
#             for d in devs[:2]:
#                 flag = " ⚠️ delay risk" if (d.get("on_time_pct") or 100) < 70 else ""
#                 lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

#         # Top catalyst
#         if cats:
#             cat = cats[0]
#             desc = cat.get("description") or ""
#             desc_str = f" — {desc}" if desc else ""
#             lines.append(f"• Upcoming: {cat.get('name','')} ({cat.get('expected_date','soon')}){desc_str}")

#     # Budget summary from best area
#     lines.append(f"\n💰 YOUR REALISTIC NUMBERS")
#     best = areas[0]
#     bmed = best["stats"].get("median_price_by_bedroom") or {}
#     all_meds = sorted([v for v in bmed.values() if v])
#     if all_meds:
#         lines.append(f"• Estimated property budget: {fmt_aed(min(all_meds))} – {fmt_aed(max(all_meds))}")
#     lines.append(f"• Minimum cash needed: AED 100,000+ (DLD 4% transfer fee mandatory regardless of financing)")
#     best_names = " · ".join([a["name"] for a in areas[:3]])
#     lines.append(f"• Best areas for your profile: {best_names}")

#     lines.append(f"\n⚠️ CRITICAL WARNINGS")
#     lines.append("• Check school catchment zones BEFORE committing — not all schools accept from all communities")
#     lines.append("• Service charges: 10–20 AED/sqft/year — always confirm before signing SPA")

#     school_map = {
#         "Dubai Hills Estate": "GEMS New Millennium, King's College School Dubai",
#         "Jumeirah": "Jumeirah English Speaking School (JESS), Dubai College",
#         "Jumeirah Park": "Regent International School, Dubai British School",
#         "Arabian Ranches": "JESS Arabian Ranches, Ranches Primary School",
#         "Arabian Ranches 2": "JESS Arabian Ranches, Ranches Primary School",
#         "Jumeirah Village Circle (JVC)": "JSS International School, Sunmarke School",
#         "Palm Jumeirah": "Dubai English Speaking School, GEMS Wellington Primary",
#         "Dubai Marina": "Dubai British School, Emirates International School",
#     }
#     lines.append(f"\n✅ NEXT STEPS — Do These This Week")
#     for i, area in enumerate(areas[:3], 1):
#         schools = school_map.get(area["name"], "check local British curriculum schools nearby")
#         lines.append(f"• Step {i}: Visit {area['name']} — nearest British schools: {schools}")
#     lines.append(f"• Step 4: Get a mortgage pre-approval before viewing — UAE banks take 3–5 working days")

#     return "\n".join(lines)



# def build_comparison_reply(ctx: dict, bedrooms: str) -> str:
#     lines = []
#     comparison_keys = [k for k in ctx if k.startswith("comparison_")]

#     areas = []
#     for k in comparison_keys:
#         sub = ctx[k]
#         if not isinstance(sub, dict): continue
#         intel = sub.get("area_intelligence") or {}
#         stats = sub.get("transaction_stats") or {}
#         cats  = sub.get("area_catalysts") or []
#         hist  = sub.get("price_history_by_year") or {}
#         name  = intel.get("area_name_en") or sub.get("detected_area", "")
#         if name:
#             areas.append({"name": name, "intel": intel, "stats": stats, "cats": cats, "hist": hist})

#     if len(areas) < 2:
#         return build_general_reply(ctx, bedrooms)

#     a, b = areas[0], areas[1]
#     target_br = bedrooms or "2 BR"

#     yld_a = a["intel"].get("gross_yield_pct"); yld_b = b["intel"].get("gross_yield_pct")
#     score_a = a["intel"].get("investment_score"); score_b = b["intel"].get("investment_score")
#     trend_a = a["intel"].get("price_trend_pct"); trend_b = b["intel"].get("price_trend_pct")

#     lines.append("📌 DIRECT ANSWER")
#     lines.append(
#         f"I pulled real DLD closed-sale data for both {a['name']} and {b['name']} — no asking-price "
#         f"guesswork, just what actually sold. Here's how they compare."
#     )

#     # ── Price history, written as prose, addressing both areas together ──
#     hist_sentences = []
#     for area in (a, b):
#         hist = area.get("hist", {})
#         if hist and len(hist) >= 2:
#             years = sorted(hist.keys())
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
#             direction = "climbed" if chg > 0 else "eased back"
#             sentence = (
#                 f"{area['name']} has {direction} from {fmt_psm(old_v)} in {years[0]} to "
#                 f"{fmt_psm(new_v)} in {years[-1]} — a {'+' if chg>0 else ''}{chg}% move"
#             )
#             if chg != 0:
#                 projected = round(float(new_v) * (1 + chg / 100), 0)
#                 sentence += f", putting it on track for roughly {fmt_psm(projected)} by {int(years[-1])+1} if the trend holds"
#             hist_sentences.append(sentence + ".")
#         else:
#             hist_sentences.append(
#                 f"{area['name']} doesn't have enough historical DLD records yet to chart a reliable price trend — "
#                 f"once more transactions land, that'll fill in."
#             )

#     if hist_sentences:
#         lines.append("\n📈 HOW PRICES HAVE MOVED")
#         lines.append(" ".join(hist_sentences))

#     # ── Analysis, written conversationally ──
#     lines.append("\n🔍 WHAT THIS TELLS US")
#     analysis_bits = []
#     if yld_a and yld_b:
#         if float(yld_a) != float(yld_b):
#             better_yield = a["name"] if float(yld_a) > float(yld_b) else b["name"]
#             worse_yield_val = min(float(yld_a), float(yld_b))
#             better_yield_val = max(float(yld_a), float(yld_b))
#             analysis_bits.append(
#                 f"On rental income, {better_yield} is the stronger of the two — {better_yield_val}% "
#                 f"gross yield versus {worse_yield_val}%, so an investor chasing cash flow would lean that way."
#             )
#         else:
#             analysis_bits.append(f"Both areas post an identical {yld_a}% gross yield, so yield alone won't decide it for you.")

#     if score_a and score_b:
#         if float(score_a) != float(score_b):
#             better_score = a["name"] if float(score_a) > float(score_b) else b["name"]
#             analysis_bits.append(
#                 f"On overall investment fundamentals, {better_score} scores higher "
#                 f"({max(float(score_a), float(score_b)):.0f}/100 vs {min(float(score_a), float(score_b)):.0f}/100)."
#             )
#         else:
#             analysis_bits.append(
#                 f"Both areas land at the same {score_a}/100 investment score, so this really comes down to "
#                 f"yield, price point, and what kind of tenant or buyer you're targeting."
#             )

#     if analysis_bits:
#         lines.append(" ".join(analysis_bits))
#     else:
#         lines.append(f"Both {a['name']} and {b['name']} are active, well-established Dubai markets — the choice comes down to your budget and what you're optimizing for.")

#     # ── Bottom line, written as a direct recommendation ──
#     lines.append("\n✅ BOTTOM LINE")
#     if score_a and score_b and float(score_a) != float(score_b):
#         winner = a if float(score_a) > float(score_b) else b
#         lines.append(
#             f"If I had to pick one on the numbers today, it's {winner['name']} — the stronger investment "
#             f"score at {winner['intel'].get('investment_score')}/100. That said, book a viewing in both: "
#             f"see {a['name']} and {b['name']} side by side before you commit, since a good unit in the "
#             f"'weaker' area can still outperform a mediocre one in the stronger area."
#         )
#     elif yld_a and yld_b and float(yld_a) != float(yld_b):
#         better_yield_area = a['name'] if float(yld_a) > float(yld_b) else b['name']
#         lines.append(
#             f"With fundamentals tied, yield breaks the tie — {better_yield_area} edges it out for rental "
#             f"income. If capital growth matters more to you than monthly cash flow, it's worth comparing "
#             f"specific buildings in both before deciding."
#         )
#     else:
#         lines.append(
#             f"Both {a['name']} and {b['name']} hold up well on the data available. Your best move is to "
#             f"book viewings in both and compare actual units at the same price point — the headline numbers "
#             f"only tell part of the story."
#         )

#     return "\n".join(lines)


# def build_comparison_charts(ctx: dict) -> list:
#     comparison_keys = [k for k in ctx if k.startswith("comparison_")]
#     areas = []
#     for k in comparison_keys:
#         sub = ctx[k]
#         if not isinstance(sub, dict): continue
#         intel = sub.get("area_intelligence") or {}
#         stats = sub.get("transaction_stats") or {}
#         name = intel.get("area_name_en")
#         if name:
#             areas.append((name, intel, stats))
#     if len(areas) < 2:
#         return []
#     charts = []
#     score_data = [{"label": n, "value": float(i.get("investment_score") or 0)} for n, i, s in areas]
#     if any(d["value"] > 0 for d in score_data):
#         charts.append({"type": "bar", "title": "Investment Score Comparison", "data": score_data})
#     yield_data = [{"label": n, "value": float(i.get("gross_yield_pct") or 0)} for n, i, s in areas]
#     if any(d["value"] > 0 for d in yield_data):
#         charts.append({"type": "bar", "title": "Gross Yield Comparison (%)", "data": yield_data})
#     price_data = [{"label": n, "value": float(i.get("truvalu_psm") or s.get("avg_price_sqm") or 0)} for n, i, s in areas]
#     if any(d["value"] > 0 for d in price_data):
#         charts.append({"type": "bar", "title": "Avg Price per sqm (AED)", "data": price_data})
#     return charts

# def build_buyer_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     lines = []

#     lines.append("🏠 IS THIS RIGHT FOR YOU?")
#     vibe_map = {
#         "Dubai Marina": "an upscale waterfront community — high-rises, dining, beach access",
#         "Jumeirah Village Circle (JVC)": "a family-friendly suburban community — quiet, gated, well-maintained",
#         "Downtown Dubai": "a city-centre luxury district — iconic skyline, walkable, high-energy",
#         "Business Bay": "an urban professional hub — canal views, close to DIFC",
#         "Palm Jumeirah": "a premium island community — private beaches, villa living",
#         "Dubai Hills Estate": "a green master-planned community — parks, schools, golf",
#         "Jumeirah Lake Towers (JLT)": "a mixed-use lakeside community — metro access, restaurants, community feel",
#     }
#     vibe = vibe_map.get(area, "an established Dubai residential community")
#     lines.append(f"• {area} is {vibe}")
#     target_br = bedrooms or "2 BR"
#     median_br = stats.get("median_price_by_bedroom", {}).get(target_br) or stats.get("avg_worth_aed")
#     if median_br:
#         lines.append(f"• Verdict: GOOD BUY — {target_br} median is {fmt_aed(median_br)}, real DLD closed-sale price")

#     lines.append("\n💰 WHAT YOUR MONEY GETS YOU")
#     bedroom_psm = stats.get("bedroom_avg_psm", {})
#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     if target_br in bedroom_psm:
#         lines.append(f"• {target_br}: {fmt_psm(bedroom_psm[target_br])} | Median closed sale: {fmt_aed(bedroom_med.get(target_br))}")
#     if stats.get("avg_price_sqm"):
#         lines.append(f"• Area average: {fmt_psm(stats['avg_price_sqm'])}")
#     if bedroom_med:
#         all_meds = [v for v in bedroom_med.values() if v]
#         if all_meds:
#             lines.append(f"• Unit price range: {fmt_aed(min(all_meds))} – {fmt_aed(max(all_meds))}")
#     for br, psm in bedroom_psm.items():
#         if br == target_br: continue
#         med = bedroom_med.get(br)
#         line = f"• {br}: {fmt_psm(psm)}"
#         if med: line += f" | Median: {fmt_aed(med)}"
#         lines.append(line)

#     lines.append("\n🏘️ COMMUNITY & LIFESTYLE")
#     community_map = {
#         "Jumeirah Village Circle (JVC)": ("Family-friendly, quiet, gated — popular with South Asian and European expat families", "20–25 min to Downtown via Al Khail Road"),
#         "Dubai Marina":                  ("Urban, vibrant, mixed expat — young professionals and couples", "25 min to Downtown via Sheikh Zayed Road"),
#         "Downtown Dubai":                ("City-centre cosmopolitan — tourists, professionals, luxury buyers", "Walking distance to DIFC and Dubai Mall"),
#         "Business Bay":                  ("Professional urban community — canal views, close to DIFC", "10 min to Downtown, direct metro access"),
#         "Palm Jumeirah":                 ("Premium island — wealthy expats, high-net-worth families", "25–35 min to Downtown via Sheikh Zayed Road"),
#         "Dubai Hills Estate":            ("Green, family-oriented — British families, school-age children", "20 min to Downtown via Al Khail Road"),
#         "Jumeirah Lake Towers (JLT)":   ("Mixed expat lakeside community — professionals, families", "Metro access, 5 min to Dubai Marina"),
#     }
#     comm, commute = community_map.get(area, ("Established mixed expat community", "20–30 min to Downtown"))
#     lines.append(f"• Who lives here: {comm}")
#     if intel.get("parks_info"):   lines.append(f"• Green spaces: {intel['parks_info']}")
#     if intel.get("retail_info"):  lines.append(f"• Retail/amenities: {intel['retail_info']}")
#     lines.append(f"• Commute to Downtown Dubai: {commute}")

#     lines.append("\n📈 IS IT A GOOD TIME TO BUY?")
#     trend = intel.get("price_trend_pct")
#     hist  = ctx.get("price_history_by_year", {})
#     if trend is not None:
#         direction = "Rising" if float(trend) > 0 else "Cooling"
#         lines.append(f"• Price trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year ({direction})")
#         if float(trend) > 0:
#             lines.append("• What this means: Market is rising — buying sooner gives you a better entry price")
#         else:
#             lines.append("• What this means: Prices cooling — you have stronger negotiation power right now")
#     elif hist:
#         years = sorted(hist.keys())
#         if len(years) >= 2:
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
#             lines.append(f"• Price moved {fmt_psm(old_v)} ({years[0]}) → {fmt_psm(new_v)} ({years[-1]}): {'+' if chg>0 else ''}{chg}%")
#             lines.append(f"• What this means: {'Rising trend — buy sooner' if chg > 0 else 'Stable — good negotiation window'}")
#         else:
#             lines.append(f"• Current price: {fmt_psm(list(hist.values())[0])} — stable market, good entry point")
#     else:
#         lines.append("• Market is active with strong transaction volume — buyer demand is consistent in this area")
#         lines.append("• What this means: Competitive market — move quickly on a unit you like")

#     devs = ctx.get("developer_track_records", [])
#     if devs:
#         lines.append("\n🏗️ DEVELOPER TRACK RECORD")
#         for d in devs[:3]:
#             flag = " ⚠️" if (d.get("on_time_pct") or 100) < 70 else ""
#             lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

#     lines.append("\n✅ BUYER VERDICT")
#     lifestyle_fit = {
#         "Jumeirah Village Circle (JVC)": "families and first-time buyers wanting space and community feel under AED 2M",
#         "Dubai Marina":                  "professionals wanting waterfront lifestyle with walkable dining and beach",
#         "Downtown Dubai":                "buyers wanting iconic address and city-centre access",
#         "Business Bay":                  "professionals wanting proximity to DIFC and canal views",
#         "Palm Jumeirah":                 "buyers wanting premium island lifestyle and private beach access",
#         "Dubai Hills Estate":            "families wanting green spaces, British schools, and a planned community",
#         "Jumeirah Lake Towers (JLT)":   "buyers wanting metro access and lakeside community feel",
#     }
#     lines.append(f"• Right for you if: {lifestyle_fit.get(area, 'you want a well-connected Dubai residential community')}")
#     lines.append("• Watch out for: Service charges and parking costs — confirm both before signing")
#     if median_br:
#         asking_est = round(float(median_br) * 1.10)
#         lines.append(f"• Negotiation tip: DLD median is {fmt_aed(median_br)} — asking prices run ~10% higher ({fmt_aed(asking_est)}), push back hard")
#     lines.append("• Next step: Book 2–3 viewings this week — compare layouts and floor levels at the same price point")

#     lines.extend(build_rental_section(ctx))

#     return "\n".join(lines)


# def build_seller_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     user_price = ctx.get("user_budget_aed")   # the price the seller actually listed at
#     lines = []

#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     br_order = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5 BR"]
#     available_brs = [br for br in br_order if br in bedroom_med]

#     target_br = bedrooms  # None if user didn't say a size
#     median_v  = bedroom_med.get(target_br) if target_br else None
#     avg_psm   = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
#     trend     = intel.get("price_trend_pct")

#     lines.append("📌 SELL NOW OR WAIT?")
#     if trend is not None and float(trend) > 0:
#         lines.append("• Decision: Sell now")
#         lines.append(f"• Reason: Prices rising +{trend}% year-on-year — sell into strength before the market peaks")
#     elif trend is not None and float(trend) < 0:
#         lines.append("• Decision: Price carefully or wait")
#         lines.append(f"• Reason: Market cooling {trend}% YoY — buyers have leverage, price at or below median")
#     else:
#         lines.append("• Decision: Good time to sell")
#         lines.append("• Reason: Market is stable with active buyer demand — list now to catch current interest")


#     if user_price:
#         bedroom_med = stats.get("median_price_by_bedroom", {})
#         benchmark = bedroom_med.get(bedrooms) if bedrooms else None
#         benchmark_label = f"{bedrooms} median" if benchmark else None
#         if not benchmark:
#             benchmark = intel.get("truvalu_psm") and stats.get("avg_price_sqm")
#             benchmark = stats.get("avg_worth_aed")
#             benchmark_label = "area-wide average (all unit types — not bedroom-specific)"

#         lines.append("\n💵 IS YOUR ASKING PRICE RIGHT?")
#         lines.append(f"• Your listed price: {fmt_aed(user_price)}")
#         if benchmark:
#             diff_pct = round((float(user_price) - float(benchmark)) / float(benchmark) * 100, 1)
#             lines.append(f"• DLD benchmark ({benchmark_label}): {fmt_aed(benchmark)}")
#             if diff_pct > 15:
#                 lines.append(f"• Verdict: {diff_pct}% above benchmark — this is likely why buyers are calling it high. Premium features (view, renovation) can justify some gap, but {diff_pct}% is a large premium to defend without strong comps.")
#             elif diff_pct > 5:
#                 lines.append(f"• Verdict: {diff_pct}% above benchmark — reasonable if the unit has real upgrades, but be ready to justify it to buyers.")
#             elif diff_pct < -5:
#                 lines.append(f"• Verdict: actually {abs(diff_pct)}% BELOW benchmark — you may be underpricing.")
#             else:
#                 lines.append(f"• Verdict: within {abs(diff_pct)}% of benchmark — in line with the market.")
#         else:
#             lines.append("• Not enough DLD data to benchmark this precisely yet — treat 'too high' feedback as opinion, not data.")

#     lines.append("\n📈 PRICE MOMENTUM")
#     if avg_psm: lines.append(f"• Current average: {fmt_psm(avg_psm)}")
#     if trend is not None:
#         direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
#         lines.append(f"• Year-on-year trend: {'+' if float(trend)>0 else ''}{trend}% ({direction})")
#     if hist:
#         years = sorted(hist.keys())
#         price_parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-3:]]
#         lines.append(f"• Price history: {' → '.join(price_parts)}")
#     tx = intel.get("tx_7d"); tx_delta = intel.get("tx_7d_delta_pct")
#     if tx:
#         delta_str = f" ({'+' if float(tx_delta or 0)>0 else ''}{tx_delta}% WoW)" if tx_delta else ""
#         lines.append(f"• Weekly transactions: {tx} deals{delta_str}")

#     lines.append("\n💰 YOUR REALISTIC ASKING PRICE")
#     if target_br and median_v:
#         recommended = round(float(median_v) * 1.06)
#         lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
#         lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
#     elif available_brs:
#         lines.append(f"• You didn't mention a unit size, so here's every size we have real DLD closed-sale data for in {area}:")
#         for br in available_brs:
#             med = bedroom_med[br]
#             rec = round(float(med) * 1.06)
#             lines.append(f"• {br}: Median {fmt_aed(med)} → Recommended list {fmt_aed(rec)}")
#     elif avg_psm:
#         recommended_psm = round(float(avg_psm) * 1.06)
#         lines.append(
#             f"• We don't have enough closed sales broken down by exact bedroom count for {area} right now — "
#             f"here's the overall benchmark instead: {fmt_psm(avg_psm)}."
#         )
#         lines.append(f"• Recommended list rate: AED {recommended_psm:,}/sqm (6% above average — leaves negotiation room)")
#     else:
#         lines.append(f"• Not enough recent DLD transaction data for {area} yet to give a reliable price estimate.")
#     distress = intel.get("distress_pct")
#     if distress:
#         lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

#     if cats:
#         lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name') or 'Catalyst'} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'infrastructure uplift expected'}")

#     lines.append("\n✅ SELLER ACTION PLAN")
#     if target_br and median_v:
#         lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
#     elif available_brs:
#         mid_br = available_brs[len(available_brs) // 2]
#         lines.append(f"• Step 1: Tell us your unit size for an exact number — a {mid_br} here typically lists around {fmt_aed(round(float(bedroom_med[mid_br])*1.06))}")
#     lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
#     lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
#     if target_br and median_v:
#         lines.append(f"• Bottom line: Expect 3–5 viewings in first 2 weeks at {fmt_aed(round(float(median_v)*1.06))}")

#     lines.extend(build_rental_section(ctx))

#     return "\n".join(lines)


# def build_investor_reply(ctx: dict, bedrooms: str) -> str:
#     intel  = ctx.get("area_intelligence", {})
#     stats  = ctx.get("transaction_stats", {})
#     area   = ctx.get("detected_area", "")
#     hist   = ctx.get("price_history_by_year", {})
#     cats   = ctx.get("area_catalysts", [])
#     shocks = ctx.get("historical_shock_resilience", [])
#     devs   = ctx.get("developer_track_records", [])
#     top_yield = ctx.get("top_yield_areas", [])
#     top_areas = ctx.get("top_areas", [])
#     lines = []

#     if top_yield or top_areas:
#         data = top_yield or top_areas
#         lines.append("📌 INVESTMENT VERDICT")
#         lines.append("• Signal: BUY — ranked below are Dubai's top-performing areas by real DLD investment data")
#         lines.append("• Best play: Buy-to-let Studio or 1BR for immediate rental income above 6.1% Dubai average")
#         lines.append("\n📊 TOP AREAS BY ROI — Real DLD Data")
#         for i, a in enumerate(data[:8], 1):
#             name  = a.get("area_name_en", "")
#             score = a.get("investment_score")
#             yld   = a.get("gross_yield_pct")
#             trend = a.get("price_trend_pct")
#             psm   = a.get("truvalu_psm")
#             parts = []
#             if score: parts.append(f"Score {score}/100")
#             if yld:   parts.append(f"Yield {yld}%")
#             if trend is not None: parts.append(f"Trend {'+' if float(trend)>0 else ''}{trend}%")
#             if psm:   parts.append(f"Avg {fmt_psm(psm)}")
#             if parts: lines.append(f"• #{i} {name} — {' · '.join(parts)} → https://www.acqar.com/areas/{area_to_slug(name)}")
#         lines.append("\n✅ INVESTOR DECISION")
#         if data:
#             top = data[0]
#             yld_top = top.get("gross_yield_pct", "")
#             score_top = top.get("investment_score", "")
#             diff = round(float(yld_top) - 6.1, 2) if yld_top else 0
#             lines.append(f"• Best entry: {top.get('area_name_en','')} — {yld_top}% gross yield ({'+' if diff>=0 else ''}{diff}% above Dubai avg)")
#             if score_top: lines.append(f"• Investment Score: {score_top}/100 — strongest fundamentals in Dubai right now")
#         lines.append("• Rule: Only invest in areas beating 6.1% Dubai average yield threshold")
#         lines.append("• Best unit type: Studio or 1BR — highest yield-to-price ratio in every top area")
        
#         return "\n".join(lines)

#     lines.append("📌 INVESTMENT VERDICT")
#     score = intel.get("investment_score"); yld = intel.get("gross_yield_pct")
#     trend = intel.get("price_trend_pct"); rank = intel.get("ranking_rank")
#     signal = "STRONG BUY" if (score and float(score) >= 75) else "BUY" if (score and float(score) >= 60) else "HOLD"
#     if yld and float(yld) > 6.1:
#         diff = round(float(yld) - 6.1, 2)
#         lines.append(f"• Signal: {signal} — {yld}% gross yield is +{diff}% above Dubai average of 6.1%")
#     elif score:
#         lines.append(f"• Signal: {signal} — Investment Score {score}/100")
#     else:
#         lines.append(f"• Signal: {signal} — active transaction market in {area}")
#     lines.append("• Best play: Buy-to-let for rental income + capital appreciation")

#     lines.append("\n📊 INVESTMENT SCORECARD")
#     if score: lines.append(f"• Investment Score: {score}/100")
#     if yld:
#         diff = round(float(yld) - 6.1, 2)
#         above = "above" if diff >= 0 else "below"
#         lines.append(f"• Gross Yield: {yld}% — Dubai avg 6.1%, this is {abs(diff)}% {above} average")
#     if trend is not None: lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year")
#     if rank:  lines.append(f"• Dubai Ranking: #{rank} out of all areas")
#     distress = intel.get("distress_pct")
#     if distress: lines.append(f"• Distress Sales: {distress}% — {'opportunity: motivated sellers' if float(distress)>10 else 'stable market'}")
#     abs_rate = intel.get("absorption_rate_pct")
#     if abs_rate: lines.append(f"• Absorption Rate: {abs_rate}% — {'fast-moving demand' if float(abs_rate)>50 else 'balanced supply/demand'}")

#     lines.append("\n💰 ENTRY PRICES — Real DLD Closed Sales")
#     bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
#     for br in ["Studio", "1 BR", "2 BR", "3 BR"]:
#         if br in bpsm:
#             line = f"• {br}: {fmt_psm(bpsm[br])}"
#             if br in bmed: line += f" | Median unit: {fmt_aed(bmed[br])}"
#             lines.append(line)

#     if hist:
#         lines.append("\n📈 CAPITAL APPRECIATION")
#         years = sorted(hist.keys())
#         price_parts = [f"{y}: {fmt_psm(hist[y])}" for y in years]
#         lines.append(f"• {' → '.join(price_parts)}")
#         if len(years) >= 2:
#             old_v = hist[years[0]]; new_v = hist[years[-1]]
#             chg = round(((new_v-old_v)/old_v)*100, 1) if old_v else 0
#             lines.append(f"• Total: {'+' if chg>0 else ''}{chg}% over {len(years)} year(s)")

#     if cats:
#         lines.append("\n⚡ CATALYSTS — Price Drivers")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'uplift expected'}")

#     if shocks:
#         lines.append("\n🛡️ DOWNSIDE RISK")
#         for s in shocks[:2]:
#             lines.append(f"• {s.get('event_name','')}: dropped {s.get('price_impact_pct','')}%, recovered in {s.get('recovery_months','')} months")

#     if devs:
#         lines.append("\n🏗️ DEVELOPER RISK")
#         for d in devs[:3]:
#             flag = " ⚠️ (delay risk)" if (d.get("on_time_pct") or 100) < 70 else ""
#             lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

#     lines.append("\n✅ INVESTOR DECISION")
#     best_br = "Studio" if "Studio" in bmed else ("1 BR" if "1 BR" in bmed else None)
#     if best_br and best_br in bmed:
#         lines.append(f"• Best entry: {best_br} at {fmt_aed(bmed[best_br])} — highest yield-to-price ratio")
#     if yld: lines.append(f"• Expected gross yield: {yld}% annually")
#     lines.append(f"• Watch: Monitor new supply launches — oversupply can compress yields")
#     if best_br and best_br in bmed:
#         lines.append(f"• Bottom line: {fmt_aed(bmed[best_br])} entry on {best_br} in {area} is the strongest risk-adjusted play right now")

#     lines.extend(build_rental_section(ctx))

#     return "\n".join(lines)


# def build_broker_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     devs  = ctx.get("developer_track_records", [])
#     projs = ctx.get("top_projects", [])
#     lines = []

#     lines.append(f"📋 AREA BRIEFING — {area}")
#     score   = intel.get("investment_score"); rank    = intel.get("ranking_rank")
#     verdict = intel.get("verdict");          yld     = intel.get("gross_yield_pct")
#     trend   = intel.get("price_trend_pct"); avg_psm = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
#     tx      = intel.get("tx_7d");           tx_delta= intel.get("tx_7d_delta_pct")
#     distress= intel.get("distress_pct")

#     if score or rank:
#         score_str = f"Investment Score: {score}/100" if score else ""
#         rank_str  = f"Ranking: #{rank} in Dubai" if rank else ""
#         lines.append(f"• {' · '.join(filter(None, [score_str, rank_str]))}")
#     if verdict or yld:
#         verdict_str = f"Verdict: {verdict}" if verdict else ""
#         yld_str     = f"Gross Yield: {yld}%" if yld else ""
#         lines.append(f"• {' · '.join(filter(None, [verdict_str, yld_str]))}")
#     if trend is not None or avg_psm:
#         trend_str = f"Price Trend: {'+' if trend and float(trend)>0 else ''}{trend}% YoY" if trend is not None else ""
#         psm_str   = f"Avg PSM: {fmt_psm(avg_psm)}" if avg_psm else ""
#         lines.append(f"• {' · '.join(filter(None, [trend_str, psm_str]))}")
#     if tx:
#         delta_str = f" ({'+' if float(tx_delta or 0)>0 else ''}{tx_delta}% WoW)" if tx_delta else ""
#         lines.append(f"• Weekly DLD Volume: {tx} transactions{delta_str}")
#     if distress: lines.append(f"• Distress Sales: {distress}%")

#     lines.append("\n💰 DLD TRANSACTION COMPARABLES")
#     bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
#     for br in ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"]:
#         if br in bpsm:
#             line = f"• {br}: {fmt_psm(bpsm[br])}"
#             if br in bmed: line += f" | Median deal: {fmt_aed(bmed[br])}"
#             lines.append(line)

#     if hist:
#         lines.append("\n📈 PRICE MOMENTUM — Client Talking Points")
#         years = sorted(hist.keys())
#         parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-3:]]
#         lines.append(f"• {' → '.join(parts)}")
#         if trend is not None:
#             if float(trend) > 0:
#                 lines.append(f"• Direction: Rising +{trend}% — tell buyers: 'prices are up, this is the entry window'")
#             else:
#                 lines.append(f"• Direction: Cooling {trend}% — tell buyers: 'good value entry, negotiate from DLD median'")

#     if cats:
#         lines.append("\n⚡ UPCOMING CATALYSTS — For Pitch Decks")
#         for c in cats[:4]:
#             lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'demand uplift expected'}")

#     if devs:
#         lines.append("\n🏗️ DEVELOPER DATA — For Off-Plan Pitching")
#         for d in devs[:4]:
#             flag = " ⚠️ Disclose delay risk to client" if (d.get("on_time_pct") or 100) < 70 else ""
#             lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★ · {d.get('total_projects','?')} projects{flag}")

#     if projs:
#         lines.append("\n🏙️ TOP PROJECTS BY DLD VOLUME")
#         for p in projs[:5]:
#             lines.append(f"• {p['name']} — {p['transactions']} DLD transactions")

#     lines.append("\n✅ BROKER TALKING POINTS")
#     top_med = None
#     for br in ["1 BR", "Studio", "2 BR"]:
#         if br in bmed: top_med = (br, bmed[br]); break
#     if top_med:
#         asking_est = round(float(top_med[1]) * 1.10)
#         lines.append(f'• For buyer clients: "DLD median {top_med[0]} is {fmt_aed(top_med[1])} — asking prices run ~10% higher ({fmt_aed(asking_est)}), negotiate hard"')
#     if trend is not None and bmed:
#         direction_word = "rising" if float(trend) > 0 else "cooling"
#         first_med = float(list(bmed.values())[0])
#         rec_price = round(first_med * 1.06) if float(trend) > 0 else round(first_med * 1.0)
#         lines.append(f'• For seller clients: "Market {direction_word} {trend}% — list at {fmt_aed(rec_price)} to attract serious buyers quickly"')
#     if yld:
#         diff = round(float(yld) - 6.1, 2)
#         above = "above" if diff >= 0 else "below"
#         lines.append(f'• For investor clients: "{yld}% gross yield — {abs(diff)}% {above} Dubai 6.1% average — strong buy-to-let case"')
#     lines.append(f'• Objection "Is {area} overpriced?": DLD median is the real price — asking prices average 8–12% above actual closed sales')

#     lines.extend(build_rental_section(ctx))

#     return "\n".join(lines)


# def build_budget_reply(ctx: dict, bedrooms: str, budget: float) -> str:
#     lines = []
#     target_br = bedrooms or "2 BR"
#     budget_label = fmt_aed(budget)
#     areas = ctx.get("budget_search_areas") or ctx.get("top_areas") or []

#     lines.append("📌 DIRECT ANSWER")
#     lines.append(f"• Searching for {target_br} apartments under {budget_label} — here are the best-value areas from real DLD closed sales")
#     lines.append(f"• All prices below are actual DLD closed-sale transactions — not asking prices")

#     # Filter and rank areas by whether their median 2BR fits the budget
#     matched = []
#     for a in areas:
#         name  = a.get("area_name_en", "")
#         score = a.get("investment_score")
#         yld   = a.get("gross_yield_pct")
#         psm   = a.get("truvalu_psm")
#         trend = a.get("price_trend_pct")
#         if name:
#             matched.append((name, score, yld, psm, trend))

#     lines.append(f"\n💡 BEST AREAS FOR {target_br} UNDER {budget_label}")

#     shown = 0
#     for name, score, yld, psm, trend in matched[:10]:
#         if shown >= 5: break
#         lines.append(f"\n• {name}")
#         if score: lines.append(f"  — Investment Score: {score}/100" + (f" · Yield: {yld}%" if yld else ""))
#         if psm:   lines.append(f"  — Avg price: {fmt_psm(psm)}")
#         if trend is not None:
#             direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
#             lines.append(f"  — Price Trend: {'+' if float(trend)>0 else ''}{trend}% YoY ({direction})")
#         shown += 1

#     lines.append(f"\n💰 YOUR BUDGET BREAKDOWN")
#     lines.append(f"• Target: {target_br} under {budget_label}")
#     lines.append(f"• DLD transfer fee (mandatory): {fmt_aed(budget * 0.04)} (4% of purchase price)")
#     lines.append(f"• Agent fee: ~{fmt_aed(budget * 0.02)} (2% typical)")
#     lines.append(f"• Minimum cash needed upfront: {fmt_aed(budget * 0.06)} (fees) + down payment if mortgaging")
#     lines.append(f"• If mortgaging: 20% down = {fmt_aed(budget * 0.20)} minimum for expats")

#     lines.append(f"\n📊 AREAS WITH MOST {target_br} TRANSACTIONS UNDER {budget_label}")
#     lines.append(f"• Jumeirah Village Circle (JVC) — highest volume of 2BR under AED 2M")
#     lines.append(f"• Dubai Sports City — affordable 2BR with strong yield")
#     lines.append(f"• International City — budget entry point")
#     lines.append(f"• Discovery Gardens — established community, low price point")
#     lines.append(f"• Al Furjan — growing community, good value")

#     lines.append(f"\n⚠️ WATCH OUT FOR")
#     lines.append(f"• Service charges vary widely — confirm AED/sqft/year before signing")
#     lines.append(f"• Off-plan under {budget_label} may have 5–8% post-handover price jumps — buy ready when possible")

#     lines.append(f"\n✅ NEXT STEPS — Do These This Week")
#     lines.append(f"• Step 1: Check JVC listings for {target_br} under {budget_label} — highest inventory in this range")
#     lines.append(f"• Step 2: Get mortgage pre-approval (if financing) — UAE banks take 3–5 working days")
#     lines.append(f"• Step 3: Verify the real market value of any unit you like → https://www.acqar.com/valuation")

#     return "\n".join(lines)



# # Any English question word, wherever it starts the sentence — covers virtually
# # any way a follow-up question can be phrased, not just a fixed set of phrases.
# FOLLOWUP_QUESTION_WORDS = (
#     "what", "how", "can", "is", "are", "does", "do", "will", "should",
#     "why", "where", "when", "who", "which", "would", "could", "did",
#     "was", "were", "has", "have", "may", "shall",
# )

# FOLLOWUP_COMMAND_STARTERS = (
#     "show me", "show", "give me", "list", "tell me", "compare",
#     "break down", "breakdown", "explain", "summarize", "walk me through",
# )

# def is_specific_followup(message: str, history: list) -> bool:
#     """True when this is a narrow follow-up question (or a short data/info
#     request like 'show me X') that should get a direct answer instead of the
#     full templated area report — regardless of whether it's the first message
#     or a later one in the conversation."""
#     m = message.strip().lower()
#     is_question_mark = m.endswith("?") or m.endswith("؟")
#     words = m.split()
#     first_word = words[0].strip(".,!?؟") if words else ""
#     is_question_word_start = first_word in FOLLOWUP_QUESTION_WORDS
#     is_command_start = m.startswith(FOLLOWUP_COMMAND_STARTERS)
#     is_short_request = (is_question_mark or is_question_word_start or is_command_start) \
#         and len(words) <= 25
#     is_fresh_intent = any(k in m for k in [
#         "i want to buy", "i want to sell", "i'm looking to",
#         "should i buy", "should i sell",
#     ])
#     return is_short_request and not is_fresh_intent


# DATA_VIZ_KEYWORDS = (
#     "compare", "comparison", "breakdown", "by bedroom", "each bedroom",
#     "price history", "show me", "chart", "graph", "table", "over time",
#     "per sqft", "per sqm", "trend", "yield by", "price by",
# )

# def wants_data_visual(message: str) -> bool:
#     m = message.strip().lower()
#     return any(k in m for k in DATA_VIZ_KEYWORDS)



# SPECIFIC_ANSWER_PROMPT = """You are ACQAR Intelligence. The user already has the full area report —
# do NOT repeat it. Answer ONLY the specific question below.

# Rules:
# - The AREA DATA FACTS JSON has a "transaction_stats" object containing
#   "bedroom_avg_psm" (price per sqm, keyed by "Studio"/"1 BR"/"2 BR"/etc.) and
#   "median_price_by_bedroom" (median total sale price, same keys). If the
#   question asks about price by bedroom/unit size, you MUST read these two
#   nested fields and list each bedroom type found there with its number —
#   never say the breakdown isn't available if bedroom_avg_psm has entries.
# - To convert AED/sqm to AED/sqft, divide by 10.7639.
# - The AREA DATA FACTS JSON has a "developer_track_records" list — each entry
#   has developer_name, on_time_pct, star_rating, total_projects, market_segment.
#   If asked to compare/list developers, use ONLY the developers present in
#   that list, with ONLY the numbers given there. NEVER add a developer that
#   isn't in developer_track_records, and NEVER invent price ranges, project
#   counts, or percentages for any developer — those fields are not provided
#   and must not be fabricated. If developer_track_records is empty, say
#   developer data isn't available for this area rather than making it up.
# - If the question is about something the data doesn't cover (legal rules, visa
#   eligibility, financing regulations, process steps, etc.), answer from accurate
#   general Dubai real-estate knowledge - do not say "I don't have data," just answer it correctly.
# - If the specific number the user asked for is missing from the AREA DATA
#   FACTS (rent, price, yield, developer stats, catalyst info, or anything
#   else), do NOT say the data isn't available and stop there. Instead, give a
#   realistic estimate using general Dubai real-estate market knowledge for
#   that area/bedroom type, and clearly label it as a market estimate rather
#   than a verified DLD figure — e.g. "DLD doesn't have registered rent
#   contracts for this area yet, but based on typical Dubai market rates, a 1BR
#   in JVC usually rents for approximately AED X–Y/year." Never invent a fake
#   DLD contract count, transaction count, or pretend an estimate is registered
#   data — the distinction between "real DLD data" and "market estimate" must
#   always be explicit in the wording.
# - The AREA DATA FACTS JSON may include "user_stated_price_aed" — a price the
#   user themselves listed or was quoted. If present, your answer MUST directly
#   compare that price against the most relevant DLD benchmark available
#   (bedroom-specific median if present in median_price_by_bedroom, otherwise
#   the area-wide average — and clearly say which one you're using), give an
#   explicit percentage difference, and a direct verdict (too high / fair /
#   underpriced). This comparison is the most important part of the answer —
#   don't bury it under general advice.
# - Write in plain, everyday language — say "typical price" instead of the
#   technical term "median," say "price per square meter/foot" instead of
#   "psm/psf" on first use, and avoid jargon a non-expert wouldn't know.
# - If you calculate or estimate any price/benchmark range in your answer, your
#   final verdict (too high / fair / underpriced) MUST be logically consistent
#   with where the user's stated price falls within that range. If the user's
#   price falls within or below your calculated range, do NOT call it "too
#   high" — say it looks fair or possibly underpriced instead. Double-check this
#   before finalizing your answer.
# - Keep it short: 2-5 sentences or up to 5 bullets (one bullet per bedroom type
#   if listing a breakdown). No section headers, no repeated report.
# - "summary" is REQUIRED and must never be empty — always give a one-sentence version of the answer there.
# - Output JSON only: {"summary":"","reply":"","insight":""}
# """

# def build_specific_answer(question: str, context_data: dict, bedrooms: str) -> dict:
#     facts = {
#         "area": context_data.get("detected_area"),
#         "user_stated_price_aed": context_data.get("user_budget_aed"),
#         "area_intelligence": context_data.get("area_intelligence", {}),
#         "transaction_stats": context_data.get("transaction_stats", {}),
#         "rental_stats": context_data.get("rental_stats", {}),
#         "developer_track_records": context_data.get("developer_track_records", []),
#         "area_catalysts": context_data.get("area_catalysts", []),
#         "requested_bedroom_type": bedrooms,
#     }
#     messages = [
#         {"role": "system", "content": SPECIFIC_ANSWER_PROMPT},
#         {"role": "user", "content": f"AREA DATA FACTS:\n{json.dumps(facts, default=str)}\n\nQUESTION: {question}"},
#     ]

#     def call(model):
#         resp = groq_client.chat.completions.create(
#             model=model, messages=messages, temperature=0.2,
#             max_tokens=500, response_format={"type": "json_object"},
#         )
#         return resp.choices[0].message.content.strip()

#     try:
#         try:    raw = call(PRIMARY_MODEL)
#         except: raw = call(FALLBACK_MODEL)
#         return extract_json(raw)
#     except Exception as e:
#         print(f"[ACQAR] specific-answer error: {e}")
#         return {"summary": "", "reply": "Sorry, I hit an error answering that — could you rephrase?", "insight": ""}


# def build_rental_section(ctx: dict) -> list:
#     rent = ctx.get("rental_stats")
#     if not rent: return []
#     lines = ["\n🏠 RENTAL MARKET DATA — Real DLD Ejari Contracts"]
#     if rent.get("count"): lines.append(f"• Based on {rent['count']} real rental contracts registered with DLD")
#     if rent.get("avg_annual_rent"): lines.append(f"• Average annual rent: {fmt_aed(rent['avg_annual_rent'])}")
#     if rent.get("median_annual_rent"): lines.append(f"• Median annual rent: {fmt_aed(rent['median_annual_rent'])}")
#     for br in ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5 BR"]:
#         d = rent.get("rent_by_bedroom", {}).get(br)
#         if d: lines.append(f"• {br}: Avg {fmt_aed(d['avg'])}/yr · Median {fmt_aed(d['median'])}/yr ({d['count']} contracts)")
#     rtype = rent.get("rent_by_type", {})
#     if rtype:
#         top = sorted(rtype.items(), key=lambda x: -x[1])[:3]
#         lines.append(f"• By property type: {' · '.join(f'{k}: {fmt_aed(v)}/yr' for k, v in top)}")
#     vr = rent.get("new_vs_renewed", {})
#     if vr: lines.append(f"• Lease mix: {' · '.join(f'{k}: {v}' for k, v in vr.items())}")
#     return lines

# def build_general_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     lines = []

#     lines.append("📌 QUICK ANSWER")
#     verdict = intel.get("verdict", "BUY"); score = intel.get("investment_score")
#     lines.append(f"• {area} is an active Dubai residential market with strong transaction volume")
#     lines.append(f"• Verdict: {verdict}" + (f" — Investment Score {score}/100" if score else ""))

#     yld = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct"); rank = intel.get("ranking_rank")
#     distress = intel.get("distress_pct")
#     snapshot_lines = []
#     if score:   snapshot_lines.append(f"• Investment Score: {score}/100")
#     if yld:     snapshot_lines.append(f"• Gross Yield: {yld}%")
#     if trend is not None: snapshot_lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year")
#     if rank:    snapshot_lines.append(f"• Dubai Ranking: #{rank}")
#     if distress: snapshot_lines.append(f"• Distress Sales: {distress}%")
#     if snapshot_lines:
#         lines.append("\n📊 MARKET SNAPSHOT"); lines.extend(snapshot_lines)

#     bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
#     price_lines = []
#     if stats.get("avg_price_sqm"): price_lines.append(f"• Average: {fmt_psm(stats['avg_price_sqm'])}")
#     for br in ["Studio", "1 BR", "2 BR", "3 BR"]:
#         if br in bpsm:
#             line = f"• {br}: {fmt_psm(bpsm[br])}"
#             if br in bmed: line += f" | Median: {fmt_aed(bmed[br])}"
#             price_lines.append(line)
#     if price_lines:
#         lines.append("\n💰 PRICES"); lines.extend(price_lines)

#     if hist:
#         years = sorted(hist.keys())
#         lines.append("\n📈 PRICE HISTORY")
#         parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-4:]]
#         lines.append(f"• {' → '.join(parts)}")

#     if cats:
#         lines.append("\n⚡ CATALYSTS")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'}")

#     lines.append("\n✅ VERDICT")
#     lines.append("• Best for: Investors and end-users looking for an established Dubai community")
#     if bmed:
#         best_br = list(bmed.keys())[0]
#         lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
#     lines.append("• Watch out for: Service charges and new supply pipeline in the area")

#     lines.extend(build_rental_section(ctx))

#     return "\n".join(lines)


# def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
#     # ── Lifestyle override ──
#     lifestyle_areas = []
#     for k, v in ctx.items():
#         if k.startswith("lifestyle_") and isinstance(v, dict):
#             name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
#             if name: lifestyle_areas.append(name)
#     if lifestyle_areas:
#         tags = ctx.get("_lifestyle_tags", [])
#         priority_tags = [t for t in tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
#         tag_str = " & ".join(t.title() for t in priority_tags[:2]) if priority_tags else "your profile"
#         names = " · ".join(lifestyle_areas[:3])
#         return f"Top areas for {tag_str} living in Dubai: {names} — ranked by real DLD data, buyer nationality mix, school proximity, and investment score."

#     # ── Budget override ──
#     if ctx.get("budget_search_areas"):
#         budget = ctx.get("user_budget_aed")
#         br = bedrooms or "2 BR"
#         budget_label = fmt_aed(budget) if budget else "your budget"
#         return f"Searching for {br} apartments under {budget_label} in Dubai — top areas by value, yield, and real DLD transaction volume below."
    
#     # ── Comparison override ──
#     comparison_areas = []
#     for k, v in ctx.items():
#         if k.startswith("comparison_") and isinstance(v, dict):
#             name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
#             if name: comparison_areas.append(name)
#     if len(comparison_areas) >= 2:
#         return f"Comparing {comparison_areas[0]} vs {comparison_areas[1]} on real DLD closed-sale data — investment scores, yields, and prices side by side below."

#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
#     br    = bedrooms
#     bedroom_med_all = stats.get("median_price_by_bedroom", {})
#     med   = (bedroom_med_all.get(br) if br else None) or stats.get("avg_worth_aed")

#     if user_type == "buyer":
#         if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
#         return f"{area} is a well-established Dubai community suited for home buyers and families."
#     elif user_type == "seller":
#         if br and med:
#             return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         if bedroom_med_all:
#             all_meds = sorted([v for v in bedroom_med_all.values() if v])
#             return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell in {area} — DLD closed sales here range {fmt_aed(all_meds[0])} to {fmt_aed(all_meds[-1])} depending on size. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
#         if yld:
#             diff = float(yld) - 6.1
#             comp = "above" if diff > 0.05 else ("below" if diff < -0.05 else "at")
#             return f"{area} offers {yld}% gross yield — {comp} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
#         return f"{area} shows active transaction volume — evaluate based on your target yield threshold vs Dubai's 6.1% average."
#     elif user_type == "broker":
#         avg_psm = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
#         if avg_psm and med: return f"{area} market report: avg {fmt_psm(avg_psm)}, {br} median {fmt_aed(med)} on DLD closed sales.{' Price trend ' + str(trend) + '% YoY.' if trend is not None else ''} Use these numbers to anchor client negotiations."
#         return f"Full {area} market data from DLD closed sales — use these comparables for client pitches and pricing."
#     else:
#         score = intel.get("investment_score"); verdict = intel.get("verdict","BUY")
#         if score and med: return f"{area} scores {score}/100 for investment — {br} median is {fmt_aed(med)} on real DLD data. Verdict: {verdict}."
#         return f"{area} is an active Dubai market — real DLD transaction data and market insights below."


# def build_insight(user_type: str, ctx: dict, bedrooms: str) -> str:
#     # ── Lifestyle override ──
#     lifestyle_areas = []
#     for k, v in ctx.items():
#         if k.startswith("lifestyle_") and isinstance(v, dict):
#             intel_sub = v.get("area_intelligence") or {}
#             name  = intel_sub.get("area_name_en") or v.get("detected_area", "")
#             score = intel_sub.get("investment_score")
#             yld   = intel_sub.get("gross_yield_pct")
#             if name and score:
#                 lifestyle_areas.append((name, score, yld))
#     if lifestyle_areas:
#         best = sorted(lifestyle_areas, key=lambda x: float(x[1] or 0), reverse=True)[0]
#         name, score, yld = best
#         yld_str = f" with {yld}% gross yield" if yld else ""
#         return f"Start with {name} — Score {score}/100{yld_str} — visit on a weekend to check school zones and community feel before committing."

#    # ── Budget override ──
#     if ctx.get("budget_search_areas"):
#         budget = ctx.get("user_budget_aed")
#         br = bedrooms or "2 BR"
#         budget_label = fmt_aed(budget) if budget else "your budget"
#         return f"JVC has the highest inventory of {br} apartments under {budget_label} — verify the real market value before making any offer at acqar.com/valuation"
    
#     # ── Comparison override ──
#     comparison_areas = []
#     for k, v in ctx.items():
#         if k.startswith("comparison_") and isinstance(v, dict):
#             intel_sub = v.get("area_intelligence") or {}
#             name  = intel_sub.get("area_name_en") or v.get("detected_area", "")
#             score = intel_sub.get("investment_score")
#             yld   = intel_sub.get("gross_yield_pct")
#             if name: comparison_areas.append((name, score, yld))
#     if len(comparison_areas) >= 2:
#         by_yield = sorted(comparison_areas, key=lambda x: float(x[2] or 0), reverse=True)
#         top = by_yield[0]
#         return f"{top[0]} has the stronger yield ({top[2]}%) — book a viewing there first if rental income is your priority."

#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     br    = bedrooms
#     bedroom_med_all = stats.get("median_price_by_bedroom", {})
#     med   = (bedroom_med_all.get(br) if br else None) or stats.get("avg_worth_aed")
#     yld   = intel.get("gross_yield_pct")

#     if user_type == "buyer" and med:
#         asking = round(float(med) * 1.10)
#         return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
#     elif user_type == "seller":
#         if br and med:
#             list_price = round(float(med) * 1.06)
#             return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
#         if bedroom_med_all:
#             mid_br = sorted(bedroom_med_all.keys(), key=lambda k: bedroom_med_all[k])[len(bedroom_med_all)//2]
#             list_price = round(float(bedroom_med_all[mid_br]) * 1.06)
#             return f"Tell us your exact unit size for a precise number — a {mid_br} in {area} would list around {fmt_aed(list_price)}."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             yld_top = top.get("gross_yield_pct", 6.1)
#             diff = round(float(yld_top) - 6.1, 2)
#             return f"#1 pick: {top.get('area_name_en','')} at {yld_top}% yield — {'+' if diff>=0 else ''}{diff}% above Dubai average on real DLD rental data."
#         if yld and med:
#             annual_rent = round(float(med) * float(yld) / 100)
#             return f"{area} {yld}% yield on {fmt_aed(med)} entry = approx {fmt_aed(annual_rent)}/year rental income based on DLD data."
#     elif user_type == "broker" and med:
#         return f"DLD median for {br} is {fmt_aed(med)} — use this as your negotiation anchor: buyers paying asking price pay ~10% above actual closed-sale market."

#     if br and med:
#         return f"Real DLD median for {br} in {area} is {fmt_aed(med)} — actual closed-sale price, not the asking price."
#     return f"{area} has active DLD transaction volume — use the data above to make a confident, data-backed decision."


# def build_charts(ctx: dict, user_type: str) -> list:
#     charts = []
#     stats = ctx.get("transaction_stats", {})
#     hist  = ctx.get("price_history_by_year", {})
#     devs  = ctx.get("developer_track_records", [])

#     bpsm = stats.get("bedroom_avg_psm", {})
#     if bpsm:
#         charts.append({"type": "bar", "title": "Price by Bedroom (AED/sqm)",
#             "data": [{"label": k, "value": int(v)} for k, v in bpsm.items() if v]})

#     if hist:
#         charts.append({"type": "line", "title": "Price History (AED/sqm)",
#             "data": [{"label": str(y), "value": int(v)} for y, v in sorted(hist.items()) if v]})

#     if user_type in ("broker", "investor") and devs:
#         dev_data = [{"label": d["developer_name"], "value": int(d["on_time_pct"])} for d in devs if d.get("on_time_pct")]
#         if dev_data:
#             charts.append({"type": "bar", "title": "Developer On-Time Delivery %", "data": dev_data})

#     top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
#     if user_type == "investor" and top_yield:
#         charts = []
#         charts.append({"type": "bar", "title": "Top Areas by Gross Yield (%)",
#             "data": [{"label": a.get("area_name_en",""), "value": float(a.get("gross_yield_pct",0))} for a in top_yield[:8] if a.get("gross_yield_pct")]})
#         charts.append({"type": "bar", "title": "Investment Score by Area",
#             "data": [{"label": a.get("area_name_en",""), "value": int(a.get("investment_score",0))} for a in top_yield[:8] if a.get("investment_score")]})

#     return charts


# # ── CHANGE 2: Comprehensive fallback system prompt ────────────────
# FALLBACK_SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's senior real estate expert with 15+ years of market knowledge.

# You answer ANY question about Dubai real estate with the depth and specificity of a top-tier consultant.
# When DB data is unavailable, use your expert knowledge — be confident, specific, and actionable.
# DO NOT say "I don't have data" or be vague. Give real answers like Gemini or Claude would.

# OUTPUT: Valid JSON only → {"summary":"...","reply":"...","charts":[],"insight":"..."}
# Use \\n for line breaks. Use • for bullets. Emoji header for every section.

# ═══════════════════════════════
# FORMAT FOR FINANCING / MORTGAGE / DOWN PAYMENT QUERIES
# ═══════════════════════════════

# 📋 DIRECT ANSWER
# • [One honest sentence answering exactly what they asked]
# • Key legal fact: [most important regulation they must know]

# 💡 YOUR OPTIONS — [X] Ways to Do This

# Option 1 — [Name of scheme/approach]
# • How it works: [2–3 specific sentences with real details]
# • Best for: [who this suits exactly]
# • The catch: [one honest downside]

# Option 2 — [Name]
# • How it works: [specific details]
# • Best for: [who]
# • The catch: [downside]

# Option 3 — [Name] (if applicable)
# • [same structure]

# 💰 YOUR REALISTIC NUMBERS
# - Monthly payment capacity: AED [X]
# - Estimated property budget: AED [X] – AED [X]
# - Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
# - Best areas in this budget: [Area 1] · [Area 2] · [Area 3] (ONLY include this
#   bullet if the user's question itself asked about affordability/budget/areas —
#   omit it entirely for fee, commission, process, or legal questions)

# ⚠️ CRITICAL WARNINGS
# • [Most important legal or financial risk with specific number]
# • [Second risk if applicable]

# ✅ NEXT STEPS — Do These This Week
# • Step 1: [Specific action — name the institution/platform/developer]
# • Step 2: [Specific action with timeline]
# • Step 3: [Specific action]

# ═══════════════════════════════
# FORMAT FOR PROCESS / HOW-TO QUERIES (buying steps, fees, visa, NOC, etc.)
# ═══════════════════════════════

# 📋 HOW TO [ACTION] IN DUBAI — Step by Step

# Step 1 — [Action name]
# • [Specific detail. Timeline or cost if known.]

# Step 2 — [Action name]
# • [Specific detail.]

# (continue all steps, typically 5–8 steps)

# 💰 COST BREAKDOWN
# • [Fee name]: [exact % or amount]
# • [Fee name]: [exact % or amount]
# • Total upfront on AED 1M property: AED [X]

# 📄 DOCUMENTS NEEDED
# • [Document 1 — who needs it]
# • [Document 2]

# ⚠️ COMMON MISTAKES
# • [Mistake 1 people make and how to avoid it]
# • [Mistake 2]

# ✅ KEY TAKEAWAY
# • [One actionable bottom line]

# ═══════════════════════════════
# FORMAT FOR LEGAL / OWNERSHIP / VISA QUERIES
# ═══════════════════════════════

# 📋 DIRECT ANSWER
# • [Specific answer to their exact question]

# 📜 THE RULES — What UAE Law Says
# • [Specific regulation with actual numbers/thresholds]
# • [Another specific rule]

# ✅ WHAT TO DO
# • Step 1: [action]
# • Step 2: [action]
# • Step 3: [action]

# ⚠️ WATCH OUT FOR
# • [Specific risk]

# ═══════════════════════════════
# FORMAT FOR GENERAL MARKET / TREND / OPINION QUERIES
# ═══════════════════════════════

# 📌 DIRECT ANSWER
# • [Answer the question directly in one sentence]

# 📊 THE DATA BEHIND IT
# • [Specific market fact with number]
# • [Another data point]
# • [Another data point]

# 🔍 ANALYSIS
# • [What this means for the user]
# • [Comparison or context]

# ✅ BOTTOM LINE
# • [Actionable conclusion]
# • [Next step if relevant]

# ═══════════════════════════════
# RULES FOR ALL RESPONSES
# ═══════════════════════════════
# 0. Pick the template that matches what was actually asked. A question about
#    commission, fees, legal process, or a named company is NOT a financing/
#    mortgage/area-recommendation question — do not use the FINANCING template's
#    "Best areas" bullet, and do not name specific areas (Downtown Dubai, Dubai
#    Marina, Palm Jumeirah, etc.) anywhere in the answer unless the user's
#    question was actually about choosing or comparing areas. Commission rates,
#    RERA rules, and legal fees apply the same Dubai-wide — they have nothing to
#    do with any particular neighborhood.
# 1. Be specific — real numbers, real developer names, real regulations
# 2b. If the user names a specific real estate company, brokerage, or agent and
#    asks about it, do NOT fabricate facts about that specific business — you do
#    not have verified, live company records (RERA status, service areas, past
#    performance, size). Say plainly that you don't have verified data on that
#    specific company, then give general guidance on how anyone can verify a
#    Dubai real-estate company (check its RERA/DLD broker registration number,
#    look it up on the DLD's Trakheesi system, check reviews). NEVER attach
#    unrelated area investment scores/yields to a company-identity question —
#    those numbers describe areas, not the company.
# 2. If budget is mentioned (salary/EMI/monthly), calculate the property budget and show the math
# 3. Always end with actionable next steps
# 4. Never write more than 2 lines per bullet
# 5. Never write paragraphs — always bullet points under emoji headers
# 6. summary: 2 sentences — direct answer + most useful number
# 7. insight: 1 sentence — one specific action the user can take TODAY
# 8. NEVER include URLs or markdown links in your reply text. Do not write [text](url) or https:// links inside reply. Area links are added automatically."""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────

# @router.post("/intelligence/transcribe")
# async def transcribe_audio(file: UploadFile = File(...)):
#     try:
#         audio_bytes = await file.read()

#         def call_whisper():
#             return groq_client.audio.transcriptions.create(
#                 file=(file.filename or "audio.webm", audio_bytes),
#                 model="whisper-large-v3",
#             )

#         result = await _run(call_whisper)
#         return {"text": result.text.strip()}
#     except Exception as e:
#         print(f"[ACQAR] transcribe error: {e}")
#         return {"text": "", "error": "Transcription failed"}




# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     user_lang, user_dir = detect_language(message)
#     detection_message = message
#     if user_lang != "en":
#         detection_message = await _run(translate_to_english, message)
#         print(f"[ACQAR] translated query: {detection_message}")
#     msg_lower    = detection_message.lower()
#     context_data = {}
#     raw          = ""

# # ── FOLLOW-UP CONTEXT CARRY ──
#     if req.history:
#         prior_user_msgs = [
#             h.get("content", "") for h in req.history
#             if h.get("role") == "user" and h.get("content")
#         ]
#         if prior_user_msgs:
#             cur_all_areas    = get_all_area_ids(msg_lower)
#             carried_area_ids = {aid for aid, _ in cur_all_areas}
#             cur_bedrooms     = extract_bedrooms(detection_message)
#             cur_budget       = extract_budget(detection_message)
#             ROLE_KWS         = SELLER_KEYWORDS + BUYER_KEYWORDS + INVESTOR_KEYWORDS + BROKER_KEYWORDS
#             cur_role_hit     = any(k in msg_lower for k in ROLE_KWS)

#             carry = []
#             for prev in reversed(prior_user_msgs[-4:]):
#                 # FIX: translate non-English history turns before scanning —
#                 # otherwise area/role keyword detection silently fails on them.
#                 prev_lang, _ = detect_language(prev)
#                 p_en = await _run(translate_to_english, prev) if prev_lang != "en" else prev
#                 p = p_en.lower()

#                 # FIX: use get_all_area_ids (plural) so a prior comparison
#                 # ("Dubai Marina vs JVC") isn't collapsed down to a single area.
#                 if len(carried_area_ids) < 2:
#                     for aid, pkw in get_all_area_ids(p):
#                         if aid not in carried_area_ids:
#                             carry.append(pkw)
#                             carried_area_ids.add(aid)

#                 if not cur_bedrooms:
#                     pb = extract_bedrooms(p_en)
#                     if pb:
#                         carry.append(pb.lower())
#                         cur_bedrooms = pb

#                 if not cur_budget:
#                     pbud = extract_budget(p_en)
#                     if pbud:
#                         # FIX: serialize as "X.XX million aed" — extract_budget's
#                         # own patterns reliably re-match this on re-parse, unlike
#                         # a raw "aed 800000" which fails for budgets under 1M.
#                         carry.append(f"{pbud/1_000_000:.2f} million aed")
#                         cur_budget = pbud

#                 if not cur_role_hit and any(k in p for k in ROLE_KWS):
#                     carry.append(p_en)
#                     cur_role_hit = True

#                 if len(carried_area_ids) >= 2 and cur_bedrooms and cur_budget and cur_role_hit:
#                     break

#             if carry:
#                 detection_message = f"{detection_message} {' '.join(carry)}"
#                 msg_lower = detection_message.lower()
#                 print(f"[ACQAR] follow-up merged: {detection_message}")
#     user_type = detect_user_type(msg_lower)

#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(detection_message)
#     bedrooms               = extract_bedrooms(detection_message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     if is_vague(msg_lower, area_id, is_lifestyle):
#         is_seller = any(k in msg_lower for k in SELLER_KEYWORDS)
#         if is_seller:
#             clar = {
#                 "type": "text",
#                 "is_clarifying": True,
#                 "summary": "Which area is your apartment in? I'll pull real DLD data and give you an exact listing price.",
#                 "reply": (
#                     "To give you accurate selling data, I need one detail:\n\n"
#                     "1. Which area is your apartment in? (e.g. Dubai Marina, JVC, Downtown Dubai, Business Bay)\n\n"
#                     "Once I know the area, I'll pull the real DLD median price, recommended listing price, "
#                     "weekly transaction volume, and tell you exactly whether to sell now or wait — with real numbers."
#                 ),
#                 "charts": [], "insight": "",
#             }
#             if user_lang != "en":
#                 clar = translate_result_texts(clar, user_lang)
#             clar["language"]  = user_lang
#             clar["direction"] = user_dir
#             return clar
#         clar = {
#             "type": "text",
#             "is_clarifying": True,
#             "summary": "Let me get a few details to find the best match for you.",
#             "reply": (
#                 "To give you a data-backed answer, I need a few quick details:\n\n"
#                 "1. What is your budget? (e.g. AED 1M–2M, AED 3M–5M, AED 5M+)\n"
#                 "2. Are you buying to live in, or investing for rental income?\n"
#                 "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
#                 "4. How many bedrooms do you need?\n\n"
#                 "Once I know these, I'll pull real DLD closed-sale data and give you a shortlist with actual numbers — not asking prices."
#             ),
#             "charts": [], "insight": "",
#         }
#         if user_lang != "en":
#             clar = translate_result_texts(clar, user_lang)
#         clar["language"]  = user_lang
#         clar["direction"] = user_dir
#         return clar

#     if budget:
#         context_data["user_budget_aed"]   = budget
#         context_data["user_budget_label"] = f"AED {budget/1_000_000:.2f}M"
#     if bedrooms:
#         context_data["user_bedrooms"] = bedrooms

#     if area_id and not is_comparison:
#         await build_area_context_async(area_id, detected_area, context_data)
#     elif is_comparison and len(all_area_ids) >= 2:
#         sub_tasks = []
#         for aid, kw in all_area_ids[:3]:
#             sub = {}
#             key = f"comparison_{preferred_name(aid, kw).replace(' ','_').lower()}"
#             if key not in context_data: sub_tasks.append((key, aid, kw, sub))
#         await asyncio.gather(*[build_area_context_async(aid, kw, sub) for _, aid, kw, sub in sub_tasks])
#         for key, _, _, sub in sub_tasks: context_data[key] = sub
#     elif is_lifestyle and not area_id:
#         context_data["query_type"]      = "lifestyle"
#         context_data["_lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         lifestyle_ids = get_lifestyle_areas(msg_lower)
#         subs = [{} for _ in lifestyle_ids]
#         await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
#         for lid, sub in zip(lifestyle_ids, subs):
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

#     is_financing_question = any(k in msg_lower for k in NO_DP_KEYWORDS + FINANCING_KEYWORDS)

#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id and not is_financing_question:
#         top = await _run(fetch_top_yield_areas)
#         if top: context_data["top_yield_areas"] = top

#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id and not is_financing_question:
#         top = await _run(fetch_top_areas_intelligence)
#         if top: context_data["top_areas"] = top

#     if budget and not area_id and not is_lifestyle and not is_financing_question:
#         top = await _run(fetch_top_areas_intelligence, 30)
#         if top: context_data["budget_search_areas"] = top

#    # Also check lifestyle sub-contexts
#     _lifestyle_keys   = [k for k in context_data if k.startswith("lifestyle_")]
#     _comparison_keys  = [k for k in context_data if k.startswith("comparison_")]

#     has_area_data = bool(
#     context_data.get("area_intelligence") or
#     context_data.get("transaction_stats") or
#     context_data.get("top_yield_areas") or
#     context_data.get("top_areas") or
#     context_data.get("budget_search_areas") or
#     _lifestyle_keys or
#     _comparison_keys
# )

#     # ── CHANGE 3: If no area data, still fetch top areas for context ──
#     if not has_area_data and not area_id:
#         top = await _run(fetch_top_areas_intelligence, 10)
#         if top:
#             context_data["dubai_market_context"] = top

#     seller_has_price_question = user_type == "seller" and budget and any(
#         k in msg_lower for k in ["is that", "too high", "too low", "fair price", "overpaying", "overpriced", "how can i sell", "sell it"]
#     )
#     if has_area_data and (is_specific_followup(detection_message, req.history) or seller_has_price_question):
#         ans = build_specific_answer(detection_message, context_data, bedrooms)
#         summary = (ans.get("summary") or "").strip()
#         reply_text = (ans.get("reply") or "").strip()
#         if not summary and reply_text:
#             # LLM sometimes leaves summary blank — derive a short one from the reply
#             # so the frontend never falls back to the "thinking" placeholder text.
#             first_sentence = reply_text.split(". ")[0].strip()
#             summary = first_sentence if len(first_sentence) <= 140 else first_sentence[:137] + "..."
#         specific_charts = build_charts(context_data, user_type) if wants_data_visual(detection_message) else []
#         result = {
#             "type":          "structured",
#             "user_type":     user_type,
#             "response_mode": "specific_answer",
#             "summary":       summary,
#             "reply":         reply_text,
#             "charts":        specific_charts,
#             "insight":       ans.get("insight", ""),
#         }
#     elif has_area_data:
#         is_multi_area = bool(_comparison_keys) or bool(_lifestyle_keys) or bool(context_data.get("budget_search_areas")) or \
#                          (user_type == "investor" and bool(context_data.get("top_yield_areas") or context_data.get("top_areas")))

#         if _comparison_keys:                              reply = build_comparison_reply(context_data, bedrooms)
#         elif _lifestyle_keys:                              reply = build_lifestyle_reply(context_data, bedrooms)
#         elif context_data.get("budget_search_areas"):    reply = build_budget_reply(context_data, bedrooms, budget)
#         elif user_type == "buyer":                       reply = build_buyer_reply(context_data, bedrooms)
#         elif user_type == "seller":                      reply = build_seller_reply(context_data, bedrooms)
#         elif user_type == "investor":                    reply = build_investor_reply(context_data, bedrooms)
#         elif user_type == "broker":                      reply = build_broker_reply(context_data, bedrooms)
#         else:                                            reply = build_general_reply(context_data, bedrooms)

#         result = {
#             "type":          "structured",
#             "user_type":     user_type,
#             "response_mode": "multi_area" if is_multi_area else "single_area",
#             "summary":       build_summary(user_type, context_data, bedrooms),
#             "reply":         reply,
#             "charts":        [] if _comparison_keys else build_charts(context_data, user_type),
#             "insight":       build_insight(user_type, context_data, bedrooms),
#         }

#         if _comparison_keys:
#             comparison_data = []
#             for k in _comparison_keys:
#                 sub = context_data[k]
#                 intel = sub.get("area_intelligence", {})
#                 if intel.get("area_name_en"):
#                     comparison_data.append({
#                         "name": intel.get("area_name_en"),
#                         "score": intel.get("investment_score"),
#                         "verdict": intel.get("verdict"),
#                         "yield_pct": intel.get("gross_yield_pct"),
#                         "avg_psm": intel.get("truvalu_psm") or sub.get("transaction_stats", {}).get("avg_price_sqm"),
#                         "price_trend": intel.get("price_trend_pct"),
#                         "bedroom_avg_psm": sub.get("transaction_stats", {}).get("bedroom_avg_psm", {}),
#                         "median_price_by_bedroom": sub.get("transaction_stats", {}).get("median_price_by_bedroom", {}),
#                         "price_history": sub.get("price_history_by_year", {}),
#                     })
#             result["comparison_data"] = comparison_data
#     else:
#         # No area DB match — LLM answers with full expert knowledge + market context
#         db_context = ""
#         wants_area_recommendations = any(w in msg_lower for w in MARKET_KEYWORDS + YIELD_KEYWORDS)
#         if context_data.get("dubai_market_context") and wants_area_recommendations:
#             top_areas = context_data["dubai_market_context"]
#             area_list = ", ".join([
#                 f"{a.get('area_name_en','')} (Score {a.get('investment_score','')}/100, Yield {a.get('gross_yield_pct','')}%)"
#                 for a in top_areas[:5] if a.get("area_name_en")
#             ])
#             db_context = f"\n\nACQAR Dubai Market Context (real DLD data):\nTop areas by score: {area_list}\nUse these real area names and data points where relevant in your answer."

#         if budget:
#             db_context += f"\n\nUser's estimated budget from message: AED {budget:,.0f}"

#         messages = [{"role": "system", "content": FALLBACK_SYSTEM_PROMPT}]
#         for h in (req.history or [])[-4:]:
#             if h.get("role") in ("user","assistant") and h.get("content"):
#                 messages.append({"role": h["role"], "content": str(h["content"])})
#         lang_instr = ""
#         if user_lang != "en":
#             lang_instr = (
#                 f"\n\nIMPORTANT: Write summary, reply, and insight entirely in {LANG_NAMES[user_lang]}. "
#                 f"Translate the section headers too, but ALWAYS keep the emoji as the first character of each header line. "
#                 f"Keep numbers, AED amounts, percentages, area names, developer names, and URLs in Latin script unchanged."
#             )
#         messages.append({
#             "role": "user",
#             "content": f"Question: {message}{db_context}{lang_instr}\n\nAnswer this fully and specifically. Reply with JSON only."
#         })

#         def call_groq(model: str) -> str:
#             resp = groq_client.chat.completions.create(
#                 model=model, messages=messages, temperature=0.2,
#                 max_tokens=1800, response_format={"type": "json_object"},
#             )
#             return resp.choices[0].message.content.strip()

#         try:
#             try:    raw = await _run(call_groq, PRIMARY_MODEL)
#             except: raw = await _run(call_groq, FALLBACK_MODEL)
#             result = extract_json(raw)
#             result["_llm_answered"] = True
#             result["type"] = "structured"; result["user_type"] = user_type
#             result["response_mode"] = "multi_area" if context_data.get("dubai_market_context") else "single_area"
#             result.pop("data_source", None)
#             # NOTE: hero area (score/verdict/yield_pct/area_intelligence) is now promoted
#             # uniformly below via pick_hero_area() — no manual promotion needed here.

#             # Prefer area names the LLM actually mentioned in its own reply — this
#             # correctly links a genuine "top areas" answer and correctly adds NO
#             # links to unrelated FAQ/company questions.
#             top_fallback = (
#                 context_data.get("top_yield_areas") or
#                 context_data.get("top_areas") or
#                 context_data.get("dubai_market_context") or
#                 []
#             )
#             reply_text = result.get("reply", "")
#             extracted_links = []
#             for area_name, area_id_val in AREA_ID_MAP.items():
#                 if area_name in reply_text.lower():
#                     display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
#                     url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
#                     if not any(l["url"] == url for l in extracted_links):
#                         extracted_links.append({"name": display, "url": url})
#                 if len(extracted_links) >= 8:
#                     break
#             if extracted_links:
#                 result["area_links"] = extracted_links
#             elif top_fallback and any(w in msg_lower for w in MARKET_KEYWORDS + YIELD_KEYWORDS):
#                 # Only fall back to generic top-ranked areas when the question
#                 # actually asked for area recommendations.
#                 result["area_links"] = [
#                     {
#                         "name": a.get("area_name_en", ""),
#                         "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
#                     }
#                     for a in top_fallback[:8] if a.get("area_name_en")
#                 ]
#         except Exception as e:
#             print(f"[ACQAR] LLM error: {e}")
#             result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}
    
   

#     is_specific_answer_mode = result.get("response_mode") == "specific_answer"
#     hero  = pick_hero_area(context_data)
#     intel = hero["intel"]

#     # Hero data taken directly from a detected area (context_data["area_intelligence"])
#     # is always trustworthy — the whole report is about that area. But when hero falls
#     # back to a top-ranked area from dubai_market_context/top_areas/top_yield_areas
#     # (i.e. no area was actually detected in the user's message), only attach it if the
#     # reply genuinely mentions that area — otherwise we're stapling unrelated area
#     # stats/badges onto a question that has nothing to do with that area.
#     hero_is_real_detected_area = bool(context_data.get("area_intelligence"))
#     reply_check = (result.get("reply") or "").lower().replace(" ", "")
#     hero_area_check = (intel.get("area_name_en") or "").lower().replace(" ", "").replace("(", "").replace(")", "")
#     hero_area_relevant = hero_is_real_detected_area or (hero_area_check and hero_area_check in reply_check)

#     if intel and intel.get("area_name_en") and hero_area_relevant and not is_specific_answer_mode:
#         result["score"]        = intel.get("investment_score")
#         result["verdict"]      = intel.get("verdict")
#         result["yield_pct"]    = intel.get("gross_yield_pct")
#         result["price_trend"]  = intel.get("price_trend_pct")
#         result["ranking"]      = intel.get("ranking_rank")
#         result["distress_pct"] = intel.get("distress_pct")
#         y = intel.get("gross_yield_pct")
#         if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)
#         result["area_intelligence"]  = intel
#         result["transaction_stats"]  = hero["stats"]
#         result["area_catalysts"]     = hero["cats"]
#         result["price_history"]      = hero["hist"]
#         result["developer_track_records"] = context_data.get("developer_track_records", [])

# # ── Area links — only areas actually in the reply ──
#     reply_text = result.get("reply", "")
#     reply_lower = reply_text.lower().replace(" ", "").replace("(", "").replace(")", "")

#     final_links = []
#     seen_urls   = set()

#   # 1. Comparison + Lifestyle areas — only those mentioned in reply
#     for k in context_data:
#         if k.startswith("lifestyle_") or k.startswith("comparison_"):
#             sub  = context_data[k]
#             if not isinstance(sub, dict): continue
#             name = (sub.get("area_intelligence") or {}).get("area_name_en") or sub.get("detected_area", "")
#             if not name: continue
#             check = name.lower().replace(" ", "").replace("(", "").replace(")", "")
#             if check in reply_lower:
#                 url = f"https://www.acqar.com/areas/{area_to_slug(name)}"
#                 if url not in seen_urls:
#                     final_links.append({"name": name, "url": url})
#                     seen_urls.add(url)

#     # 2. Top yield / top areas — only if mentioned in reply
#     if not final_links:
#         top_yield      = context_data.get("top_yield_areas", [])
#         top_areas_list = context_data.get("top_areas", [])
#         top_data       = top_yield or top_areas_list or context_data.get("dubai_market_context", [])
#         for a in top_data:
#             name = a.get("area_name_en", "")
#             if not name: continue
#             check = name.lower().replace(" ", "").replace("(", "").replace(")", "")
#             if check in reply_lower:
#                 url = f"https://www.acqar.com/areas/{area_to_slug(name)}"
#                 if url not in seen_urls:
#                     final_links.append({"name": name, "url": url})
#                     seen_urls.add(url)

#    # 3. Single detected area fallback — skip for specific answers, since a
#     # narrow Q&A shouldn't be force-tagged with whatever area was last loaded
#     # in context unless the reply text actually mentions that area (tier 4 below
#     # still covers that case).
#     if not final_links and not is_specific_answer_mode:
#         detected = context_data.get("detected_area", "")
#         if detected:
#             url = f"https://www.acqar.com/areas/{area_to_slug(detected)}"
#             final_links.append({"name": detected, "url": url})
#             seen_urls.add(url)

#     # 4. LLM reply fallback — scan reply text for any known area names
#     if not final_links:
#         for area_name in sorted(AREA_ID_MAP, key=len, reverse=True):
#             if area_name in reply_text.lower():
#                 area_id_val = AREA_ID_MAP[area_name]
#                 display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
#                 url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
#                 if url not in seen_urls:
#                     final_links.append({"name": display, "url": url})
#                     seen_urls.add(url)
#             if len(final_links) >= 6: break

#     if final_links:
#         result["area_links"] = final_links[:6]

#     detected = context_data.get("detected_area", "")
#     if detected:
#         result["area_url"] = f"https://www.acqar.com/areas/{area_to_slug(detected)}"

#     print(f"[DEBUG] top_yield count: {len(context_data.get('top_yield_areas', []))}")
#     print(f"[DEBUG] top_areas count: {len(context_data.get('top_areas', []))}")
#     print(f"[DEBUG] dubai_market_context count: {len(context_data.get('dubai_market_context', []))}")
#     print(f"[DEBUG] has_area_data: {has_area_data}")

#     skip_translate = result.pop("_llm_answered", False)
#     if user_lang != "en" and not skip_translate:
#         result = translate_result_texts(result, user_lang)
#     result["language"]  = user_lang
#     result["direction"] = user_dir
#     return result
    
    
















import os
import re
import json
import asyncio
import traceback
from concurrent.futures import ThreadPoolExecutor
from datetime import date

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from supabase import create_client
from collections import defaultdict
from groq import Groq

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
router      = APIRouter()
SUPABASE_URL = os.getenv("SUPABASE_URL_CHAT", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY_CHAT", "")
supabase     = create_client(SUPABASE_URL, SUPABASE_KEY)
PRIMARY_MODEL  = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama3-70b-8192"
BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")
_executor = ThreadPoolExecutor(max_workers=10)

class ChatRequest(BaseModel):
    message: str
    history: list = []

AREA_ID_MAP = {
    "jumeirah village circle": 59, "dubai creek harbour": 1509,
    "dubai hills estate": 53, "arabian ranches 3": 16296,
    "arabian ranches 2": 133, "arabian ranches": 133,
    "jumeirah lake towers": 12, "jumeirah golf estates": 347,
    "dubai sports city": 67, "dubai internet city": 1621,
    "dubai production city": 5036, "dubai media city": 95,
    "dubai harbour": 3512, "barsha heights": 25,
    "discovery gardens": 13, "international city": 368,
    "palm jumeirah": 410, "palm jebel ali": 1519,
    "silicon oasis": 295, "bluewaters island": 1754,
    "business bay": 54, "downtown dubai": 10,
    "damac hills": 279, "damac hills 2": 352,
    "damac lagoons": 75266, "tilal al ghaf": 5173,
    "dubai islands": 5178, "creek harbour": 1509,
    "dubai marina": 330, "dubai hills": 53,
    "jumeirah park": 73, "sports city": 67,
    "town square": 386, "dubai south": 3355,
    "motor city": 268, "al furjan": 41,
    "bluewaters": 1754, "al barsha": 105,
    "al jaddaf": 1509, "al karama": 271,
    "al satwa": 1347, "nad al sheba": 161,
    "oud metha": 388, "expo city": 85082,
    "dubailand": 51, "meydan": 43,
    "downtown": 10, "the greens": 25,
    "jaddaf": 1509, "tecom": 25, "greens": 25,
    "karama": 271, "satwa": 1347, "mirdif": 232,
    "marina": 330, "palm": 410, "difc": 117,
    "impz": 5036, "arjan": 91, "dso": 295,
   "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
    "jbr": 100023, "jumeirah beach residence": 100023,
    "burj khalifa": 390,
    "jumeirah first": 317, "jumeirah second": 375, "jumeirah third": 318,
    "al wasl": 914,
    "pearl jumeirah": 344,
    "green community": 673,
    "dubai festival city": 277,
    "dubai studio city": 81,
    "world islands": 413,
    "palm deira": 432, "palm jabal ali": 411,
    "living legends": 52,
    "al quoz": 293,
    "al safa": 313,
    "dubai design district": 22688, "d3": 22688,
    "dubai maritime city": 2848,
    "culture village": 190, "jaddaf waterfront": 190,
    "dubai land residence complex": 603,
    "trade center": 341,
    "bur dubai": 345,
}

AREA_DISPLAY_NAMES = {
    36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
    10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
    23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
    117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
    3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
    67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills 2 (Akoya by DAMAC)",
    386: "Town Square", 91: "Arjan", 105: "Al Barsha", 295: "Dubai Silicon Oasis (DSO)",
    232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
    25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
    43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
    51: "Dubailand", 85082: "Expo City Dubai",
    330: "Dubai Marina", 390: "Burj Khalifa", 317: "Jumeirah First",
    375: "Jumeirah Second", 318: "Jumeirah Third", 914: "Al Wasl",
    344: "Pearl Jumeirah", 673: "Green Community", 277: "Dubai Festival City",
    81: "Dubai Studio City", 413: "World Islands", 432: "Palm Deira",
    411: "Palm Jabal Ali", 52: "Living Legends", 293: "Al Quoz",
    313: "Al Safa", 22688: "Dubai Design District (D3)",
    2848: "Dubai Maritime City", 190: "Culture Village (Jaddaf Waterfront)",
   603: "Dubai Land Residence Complex", 341: "Trade Center First",
    100023: "Jumeirah Beach Residence (JBR)",

}

BEDROOM_KEYS = {
    "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
    "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
    "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
}

ROOM_LABEL_MAP = {"0": "Studio", "1": "1 BR", "2": "2 BR", "3": "3 BR", "4": "4 BR", "5": "5 BR"}

def _room_label(v):
    if v is None: return None
    try: n = int(float(v))
    except: return None
    return ROOM_LABEL_MAP.get(str(n))

def _clean_area_search_term(name: str) -> str:
    return re.sub(r'\s*\([^)]*\)', '', name or "").strip()

# These actually map to specific areas in LIFESTYLE_AREA_MAP — trigger area search
LIFESTYLE_KEYWORDS = [
    "british", "expat", "family", "school", "villa", "community", "kids",
    "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
    "cheap", "golf", "waterfront", "airbnb", "short term", "holiday home",
    "freehold", "high yield",
]

LIFESTYLE_AREA_MAP = {
    "british": [53, 23, 73], "family": [53, 73, 133, 59],
    "school": [53, 73, 133], "expat": [330, 10, 54, 12],
    "beach": [410, 330, 1754], "beachfront": [410, 1754],
    "luxury": [410, 10, 330, 117], "affordable": [59, 91, 13, 368],
    "cheap": [59, 368, 13], "budget": [59, 13, 368],
    "golf": [347, 352, 53], "waterfront": [330, 410, 12, 1754],
    "metro": [25, 12, 54, 10], "airbnb": [330, 10, 54, 1754],
    "short term": [330, 10, 54], "holiday home": [410, 330, 1754],
    "villa": [73, 133, 352, 53], "freehold": [59, 330, 54, 10],
}

MARKET_KEYWORDS = [
    "best area", "top area", "highest yield", "compare", "market overview",
    "which area", "recommend", "suggest", "vs", "versus",
    "where to buy", "where should", "top 5", "top 3", "best areas",
    "rank", "ranking", "overview", "investment score", "highest score",
    "best investment", "top investment",
]

YIELD_KEYWORDS = [
    "yield", "rental yield", "highest yield", "best yield",
    "top yield", "rental income", "gross yield",
]

VAGUE_PATTERNS = [
    "just landed", "new to dubai", "moving to dubai", "relocating",
    "want to buy", "looking to buy", "thinking of buying",
    "buy property in dubai", "invest in dubai", "where should i buy",
    "help me find", "guide me", "not sure", "any suggestions",
    "what should i buy", "where to start", "i don't know", "i dont know",
]

NO_DP_KEYWORDS = [
    "no downpayment", "no down payment", "without downpayment", "without down payment",
    "zero downpayment", "zero down payment", "0 downpayment", "0 down payment",
    "no dp", "without dp", "downpayment not required", "down payment not required",
    "no money for downpayment", "don't have downpayment", "do not have downpayment",
    "not have sufficient funds", "insufficient funds", "not sufficient funds",
    "no sufficient funds", "way around", "workaround", "post handover",
    "post-handover", "payment plan", "0% downpayment", "emi only",
    "salary and side income", "side income",
]

FINANCING_KEYWORDS = [
    "emi", "mortgage", "home loan", "bank loan", "financing", "finance",
    "monthly payment", "instalment", "installment", "pre-approval",
    "murabaha", "ltv", "down payment", "downpayment", "ready to move",
]


BUYER_KEYWORDS = [
    "buy", "buying", "purchase", "i want to buy", "looking to buy",
    "first time buyer", "end user", "own use", "live in", "to live",
    "move in", "move to", "living in", "reside", "residence",
    "family home", "apartment for myself", "home for", "which area should i",
    "where should i buy", "afford", "for myself", "for my family",
    "to stay", "to reside", "end-user", "for living", "off-plan", "oqood", "spa", "defect", "snagging", "handover",
"cooling off", "escrow", "noc", "form f", "title deed", "freehold",
"leasehold", "service charge", "golden visa", "dewa", "pre-approval",
"ltv", "murabaha", "mortgage", "down payment", "first time",

]
SELLER_KEYWORDS = [
    "sell", "selling", "list", "listing", "put on market", "good time to sell",
    "should i sell", "when to sell", "exit", "offload", "dispose",
    "my property", "my apartment", "my villa", "i own", "i have a property",
    "sale price", "asking price", "how much can i sell", "want to sell",
    "looking to sell", "thinking of selling", "time to sell", "evict", "eviction", "tenancy", "vacant possession", "assignment",
"power of attorney", "poa", "repatriate", "capital gain", "flip",
"listing", "mandate", "valuation", "form a", "form b",
]
INVESTOR_KEYWORDS = [
    "invest", "investment", "roi", "return", "yield", "rental yield",
    "rental income", "passive income", "portfolio", "capital appreciation",
    "cash flow", "gross yield", "net yield", "off plan", "off-plan",
    "hold", "flip", "exit strategy", "capital gain", "rental return",
    "buy to let", "buy-to-let", "multiple units", "diversify",
    "best return", "highest return", "income property", "rent out",
    "tenant", "letting", "rental property","airbnb", "short term rental", "holiday home", "dtcm", "flip",
"assignment", "occupancy rate", "net yield", "service charge",
"token", "reit", "hotel apartment", "co-living", "d33",
]
BROKER_KEYWORDS = [
    "broker", "agent", "realtor", "rera", "client", "my client", "clients",
    "commission", "viewings", "leads", "prospect", "pipeline",
    "market report", "area report", "pitch", "present to client",
    "comparable", "comps", "transaction data", "dld data",
    "i am an agent", "i'm an agent", "i work in real estate",
    "real estate professional", "property consultant", "give me comparables",
    "for my client", "i work as", "rera card", "rera licence", "commission split", "lead generation",
"bayut", "property finder", "off-plan launch", "form a", "form b",
"dual agency", "co-broking", "aml", "ejari", "crm", "mandate",
"exclusive listing", "tyre-kicker", "co-broke",
]
DEVELOPER_QUERY_KEYWORDS = [
    "top developer", "top 10 developer", "best developer", "developers in dubai",
    "developer ranking", "which developer", "list of developers",
]


def detect_sales_period(msg_lower: str):
    m = re.search(r'\bq([1-4])\s*(\d{4})\b', msg_lower) or re.search(r'\b(\d{4})\s*q([1-4])\b', msg_lower)
    if not m: return None
    g = m.groups()
    if len(g[0]) == 4:
        return (int(g[0]), int(g[1]))
    return (int(g[1]), int(g[0]))
def is_developer_query(msg_lower: str) -> bool:
    return any(k in msg_lower for k in DEVELOPER_QUERY_KEYWORDS) or (
        "developer" in msg_lower and any(k in msg_lower for k in ["top", "best", "rank", "list", "who are"])
    )

def detect_user_type(msg_lower: str) -> str:
    if any(k in msg_lower for k in BROKER_KEYWORDS):   return "broker"
    if any(k in msg_lower for k in SELLER_KEYWORDS):   return "seller"
    if any(k in msg_lower for k in INVESTOR_KEYWORDS): return "investor"
    if any(k in msg_lower for k in BUYER_KEYWORDS):    return "buyer"
    return "general"


def detect_language(text: str):
    """Returns (lang_code, direction)"""
    # Arabic script block (covers Arabic + Urdu)
    if re.search(r'[\u0600-\u06FF\u0750-\u077F]', text):
        # Urdu-specific letters: ٹ ڈ ڑ ں ھ ہ ے etc.
        if re.search(r'[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06C2\u06D2]', text):
            return "ur", "rtl"
        return "ar", "rtl"
    if re.search(r'[\u4e00-\u9fff]', text):          # Chinese
        return "zh", "ltr"
    return "en", "ltr"


LANG_NAMES = {"ar": "Arabic", "ur": "Urdu", "zh": "Simplified Chinese"}


def translate_result_texts(result: dict, lang: str) -> dict:
    """Translates summary / reply / insight via Groq. Numbers, URLs, emojis stay intact."""
    target = LANG_NAMES.get(lang)
    if not target:
        return result

    payload = {
        "summary": result.get("summary", ""),
        "reply":   result.get("reply", ""),
        "insight": result.get("insight", ""),
    }
    sys = (
        f"You are a translator. Translate the JSON string values into {target}.\n"
        "STRICT RULES:\n"
        "- Keep ALL numbers, AED amounts, percentages, dates EXACTLY unchanged\n"
        "- Keep area names (e.g. Dubai Marina, JVC), developer names, and URLs unchanged\n"
        "- Keep all emojis, bullet symbols (•), and line breaks (\\n) in the same positions\n"
        "- TRANSLATE section header text (e.g. '📌 INVESTMENT VERDICT' → '📌 قرار الاستثمار') but the emoji must remain the FIRST character of the header line\n"
        "- Return ONLY valid JSON with the same keys: summary, reply, insight"
    )
    messages = [
        {"role": "system", "content": sys},
        {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
    ]

    def call(model):
        resp = groq_client.chat.completions.create(
            model=model, messages=messages, temperature=0,
            max_tokens=2500, response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content.strip()

    try:
        try:    raw = call(PRIMARY_MODEL)
        except: raw = call(FALLBACK_MODEL)
        translated = extract_json(raw)
        for k in ("summary", "reply", "insight"):
            if translated.get(k):
                result[k] = translated[k]
    except Exception as e:
        print(f"[ACQAR] translation error: {e}")  # fail silently → English fallback
    return result



def translate_to_english(text: str) -> str:
    """Translate user query to English so keyword/area detection works. Returns original on failure."""
    try:
        resp = groq_client.chat.completions.create(
            model=PRIMARY_MODEL,
            messages=[
                {"role": "system", "content": (
                    "Translate the user's message to English. Return ONLY the translated text, nothing else. "
                    "Use standard English names for Dubai areas (e.g. واحة دبي للسيليكون → Dubai Silicon Oasis, "
                    "دبي مارينا → Dubai Marina, وسط مدينة دبي → Downtown Dubai, الخليج التجاري → Business Bay, "
                    "نخلة جميرا → Palm Jumeirah). Keep numbers, AED amounts, and percentages unchanged."
                )},
                {"role": "user", "content": text},
            ],
            temperature=0, max_tokens=400,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ACQAR] translate-to-english error: {e}")
        return text

def _fix_unescaped_newlines(s: str) -> str:
    result, in_str, escaped = [], False, False
    for ch in s:
        if escaped: result.append(ch); escaped = False; continue
        if ch == "\\" and in_str: result.append(ch); escaped = True; continue
        if ch == '"': in_str = not in_str; result.append(ch); continue
        if in_str:
            if ch == "\n": result.append("\\n"); continue
            if ch == "\r": result.append("\\r"); continue
            if ch == "\t": result.append("\\t"); continue
        result.append(ch)
    return "".join(result)


def extract_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?", "", raw); raw = re.sub(r"```$", "", raw); raw = raw.strip()
    for attempt in [raw, _fix_unescaped_newlines(raw)]:
        try: return json.loads(attempt)
        except: pass
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        for attempt in [match.group(0), _fix_unescaped_newlines(match.group(0))]:
            try: return json.loads(attempt)
            except: pass
    return {"summary": "", "reply": raw, "charts": [], "insight": ""}


def get_area_id(msg_lower: str):
    for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
        if kw in msg_lower: return AREA_ID_MAP[kw], kw
    return None, None


def get_all_area_ids(msg_lower: str) -> list:
    found, seen = [], set()
    matched_spans = []  # character ranges already claimed by a longer keyword

    for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
        idx = msg_lower.find(kw)
        while idx != -1:
            end = idx + len(kw)
            overlaps = any(idx < s_end and end > s_start for s_start, s_end in matched_spans)
            if not overlaps:
                aid = AREA_ID_MAP[kw]
                if aid not in seen:
                    found.append((aid, kw))
                    seen.add(aid)
                matched_spans.append((idx, end))
                break  # this keyword has claimed its mention, stop looking for more occurrences
            idx = msg_lower.find(kw, idx + 1)

    return found


def get_lifestyle_areas(msg_lower: str) -> list:
    scores = defaultdict(int)
    for kw, aids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
        if kw in msg_lower:
            for rank, aid in enumerate(aids): scores[aid] += (5 - rank)
    return sorted(scores, key=lambda x: -scores[x])[:4]


# ── CHANGE 1: EMI detection added to extract_budget ──────────────
def extract_budget(msg: str):
    mc = msg.lower().replace(",", "").replace("aed", "").strip()

    # Detect monthly EMI/salary → estimate property budget
    emi_match = re.search(r'emi\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
    if not emi_match:
        emi_match = re.search(r'(\d+)\s*/?\s*month', mc)
    if not emi_match:
        emi_match = re.search(r'salary\s+(?:is\s+|of\s+)?(?:aed\s+)?(\d+)', mc)
    if emi_match:
        emi = float(emi_match.group(1).replace(",", ""))
        if 2000 < emi < 150000:  # sanity: monthly figure
            return round(emi * 150)  # ~12yr mortgage estimate

    for pat in [r'(\d+\.?\d*)\s*(?:million|m)\b', r'(\d{7,})', r'(\d+\.?\d*)\s*k\b']:
        m = re.search(pat, mc)
        if m:
            val = float(m.group(1)); tail = mc[m.start():m.end()+2]
            if "k" in tail: return val * 1_000
            if val < 1000:  return val * 1_000_000
            return val
    return None


def extract_bedrooms(msg: str):
    m = msg.lower()
    for pat, label in [
        (r'\bstudio\b',"Studio"),(r'\b1[\s-]*(?:br|bed|bedroom)\b',"1 BR"),
        (r'\b2[\s-]*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3[\s-]*(?:br|bed|bedroom)\b',"3 BR"),
        (r'\b4[\s-]*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
        (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
    ]:
        if re.search(pat, m): return label
    return None


def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
    if area_id or is_lifestyle: return False
    if any(k in msg_lower for k in NO_DP_KEYWORDS): return False
    if any(k in msg_lower for k in FINANCING_KEYWORDS): return False
    # Seller without area → ask which area
    is_seller = any(k in msg_lower for k in SELLER_KEYWORDS)
    has_specific = any(w in msg_lower for w in [
        "yield","price","psm","sqm","trend","compare","vs","score",
        "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
        "commission","fee","broker","agent","process","how to","documents","noc","visa",
    ])
    if is_seller and not has_specific: return True
    has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
    return has_vague and not has_specific and len(msg_lower.split()) < 20


def median_val(values: list):
    if not values: return None
    s = sorted(values); n = len(s); mid = n // 2
    return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


def preferred_name(area_id: int, fallback: str = "") -> str:
    return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))

def pick_hero_area(context_data: dict) -> dict:
    """Returns intel/stats/cats/hist for whichever area should drive the widget cards."""
    if context_data.get("area_intelligence") and context_data["area_intelligence"].get("area_name_en"):
        return {
            "intel": context_data["area_intelligence"],
            "stats": context_data.get("transaction_stats", {}),
            "cats":  context_data.get("area_catalysts", []),
            "hist":  context_data.get("price_history_by_year", {}),
        }

    lifestyle_keys = [k for k in context_data if k.startswith("lifestyle_")]
    if lifestyle_keys:
        best_key = max(
            lifestyle_keys,
            key=lambda k: float((context_data[k].get("area_intelligence") or {}).get("investment_score") or 0)
        )
        sub = context_data[best_key]
        if (sub.get("area_intelligence") or {}).get("area_name_en"):
            return {
                "intel": sub.get("area_intelligence", {}),
                "stats": sub.get("transaction_stats", {}),
                "cats":  sub.get("area_catalysts", []),
                "hist":  sub.get("price_history_by_year", {}),
            }

    if context_data.get("budget_search_areas"):
        areas = context_data["budget_search_areas"]
        if areas and areas[0].get("area_name_en"):
            top = areas[0]
            return {
                "intel": {
                    "area_name_en":     top.get("area_name_en"),
                    "truvalu_psm":      top.get("truvalu_psm"),
                    "gross_yield_pct":  top.get("gross_yield_pct"),
                    "investment_score": top.get("investment_score"),
                    "verdict":          top.get("verdict"),
                    "price_trend_pct":  top.get("price_trend_pct"),
                },
                "stats": {}, "cats": [], "hist": {},
            }

    for key in ("top_yield_areas", "top_areas", "dubai_market_context"):
        data = context_data.get(key)
        if data and data[0].get("area_name_en"):
            top = data[0]
            return {
                "intel": {
                    "area_name_en":     top.get("area_name_en"),
                    "truvalu_psm":      top.get("truvalu_psm"),
                    "gross_yield_pct":  top.get("gross_yield_pct"),
                    "investment_score": top.get("investment_score"),
                    "verdict":          top.get("verdict"),
                    "price_trend_pct":  top.get("price_trend_pct"),
                },
                "stats": {}, "cats": [], "hist": {},
            }

    return {"intel": {}, "stats": {}, "cats": [], "hist": {}}


def fmt_aed(v) -> str:
    if v is None: return ""
    v = float(v)
    if v >= 1_000_000: return f"AED {v/1_000_000:.2f}M"
    if v >= 1_000:     return f"AED {int(v):,}"
    return f"AED {v:.0f}"


def fmt_psm(v) -> str:
    if v is None: return ""
    return f"AED {int(float(v)):,}/sqm"


def area_to_slug(area_name: str) -> str:
    slug = area_name.lower().strip()
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    return slug


# ─────────────────────────────────────────────────────────────────
# SUPABASE FETCHERS
# ─────────────────────────────────────────────────────────────────
def fetch_area_intelligence(area_id: int):
    try:
        res = supabase.table("area_intelligence").select(
            "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, "
            "catalyst_score, absorption_rate_pct, price_trend_pct, ranking_rank, "
            "zone_type, master_developer, completion_rate, residential_units, "
            "parks_info, retail_info, active_project_count, buyer_nationalities, "
            "key_developers, active_project_names, tx_7d, tx_7d_delta_pct, "
            "distress_pct, year_established"
        ).eq("area_id", area_id).limit(1).execute()
        return res.data[0] if res.data else None
    except: return None


def fetch_area_stats(area_id: int) -> list:
    try:
        res = supabase.table("avm").select(
            "price_per_sqm, procedure_area, actual_worth, rooms_en, property_type_en, sale_year, sale_month"
        ).eq("area_id", area_id).not_.is_("sale_year", "null").order(
            "sale_year", desc=True
        ).order("sale_month", desc=True).limit(100).execute()
        return res.data or []
    except: return []


def fetch_price_history(area_id: int) -> list:
    try:
        res = supabase.table("price_history_manual").select(
            "sale_year, sale_month, psf, cnt"
        ).eq("area_id", area_id).order("sale_year", desc=False).order("sale_month", desc=False).limit(36).execute()
        return res.data or []
    except: return []


def fetch_area_catalysts(area_id: int) -> list:
    try:
        today = date.today().isoformat()
        res = supabase.table("area_catalysts").select(
            "catalyst_type, name, description, expected_date, confidence, status"
        ).eq("area_id", area_id).eq("status", "active").gte("expected_date", today).order("expected_date", desc=False).limit(5).execute()
        return res.data or []
    except: return []


def fetch_developer_track_records(developer_names: list) -> list:
    try:
        clean = [d for d in developer_names if d and d != "Various"]
        if not clean: return []
        res = supabase.table("developer_track_records").select(
            "developer_name, on_time_pct, avg_delay_months, total_projects, delivered_units, star_rating, market_segment, notes"
        ).in_("developer_name", clean).execute()
        return res.data or []
    except: return []


def fetch_area_shock_impacts(zone_type: str) -> list:
    try:
        if not zone_type: return []
        res = supabase.table("area_shock_impacts").select(
            "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
        ).eq("zone_type", zone_type).execute()
        return res.data or []
    except: return []


def fetch_top_areas_intelligence(limit: int = 20) -> list:
    try:
        res = supabase.table("area_intelligence").select(
            "area_name_en, truvalu_psm, gross_yield_pct, investment_score, verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
        ).not_.is_("investment_score", "null").order("investment_score", desc=True).limit(limit).execute()
        return res.data or []
    except: return []


def fetch_top_yield_areas() -> list:
    try:
        res = supabase.table("area_intelligence").select(
            "area_name_en, gross_yield_pct, investment_score, verdict, truvalu_psm, price_trend_pct"
        ).not_.is_("gross_yield_pct", "null").order("gross_yield_pct", desc=True).limit(10).execute()
        return res.data or []
    except: return []


def fetch_dld_projects(area_id: int) -> list:
    try:
        res = supabase.table("avm").select("project_name_en").eq("area_id", area_id).not_.is_("project_name_en", "null").limit(100).execute()
        if not res.data: return []
        counts = defaultdict(int)
        for r in res.data:
            if r.get("project_name_en"): counts[r["project_name_en"]] += 1
        return sorted(counts.items(), key=lambda x: -x[1])[:5]
    except: return []

def fetch_top_developers_by_projects(limit: int = 10) -> list:
    try:
        res = supabase.table("dld_projects").select(
            "developer_name, project_value, cnt_unit, project_status"
        ).not_.is_("developer_name", "null").execute()
        rows = res.data or []
        agg = defaultdict(lambda: {"project_value": 0.0, "unit_count": 0, "project_count": 0})
        for r in rows:
            dev = normalize_developer_name(r["developer_name"])
            agg[dev]["project_value"] += float(r.get("project_value") or 0)
            agg[dev]["unit_count"]    += int(r.get("cnt_unit") or 0)
            agg[dev]["project_count"] += 1
        ranked = sorted(agg.items(), key=lambda x: -x[1]["project_value"])[:limit]
        return [{"developer_name": d, **v} for d, v in ranked]
    except:
        return []
def fetch_top_developers_by_sales(year: int, quarter: int, limit: int = 10) -> list:
    """Ranks developers by actual Q-specific sales value, via project_number
    join between avm (transactions) and dld_projects (developer registry)."""
    q_start = {1: 1, 2: 4, 3: 7, 4: 10}[quarter]
    q_end   = q_start + 2
    try:
        proj_res = supabase.table("dld_projects").select(
            "project_number, developer_name"
        ).not_.is_("developer_name", "null").execute()
        proj_to_dev = {p["project_number"]: normalize_developer_name(p["developer_name"])
                       for p in (proj_res.data or [])}
        if not proj_to_dev:
            return []

        tx_res = supabase.table("avm").select(
            "project_number, actual_worth, procedure_area"
        ).eq("sale_year", year).gte("sale_month", q_start).lte("sale_month", q_end) \
         .not_.is_("project_number", "null").not_.is_("actual_worth", "null").execute()
        rows = tx_res.data or []
        if not rows:
            return []

        agg = defaultdict(lambda: {"total_sales": 0.0, "deed_count": 0, "built_up_area": 0.0})
        for r in rows:
            dev = proj_to_dev.get(r["project_number"])
            if not dev:
                continue
            agg[dev]["total_sales"]   += float(r["actual_worth"])
            agg[dev]["deed_count"]    += 1
            agg[dev]["built_up_area"] += float(r.get("procedure_area") or 0)

        for dev in agg:
            agg[dev]["avg_sale_price"] = round(agg[dev]["total_sales"] / agg[dev]["deed_count"], 0)

        ranked = sorted(agg.items(), key=lambda x: -x[1]["total_sales"])[:limit]
        return [{"developer_name": d, **v} for d, v in ranked]
    except Exception as e:
        print(f"[ACQAR] fetch_top_developers_by_sales error: {e}")
        return []
    
DEVELOPER_BRAND_MAP = {
    "EMAAR DEVELOPMENT P.J.S.C.": "Emaar Properties",
    "EMAAR PROPERTIES (P.J.S.C)": "Emaar Properties",
    "DWTC EMAAR L.L.C": "Emaar Properties",
    "EMAAR DUBAI SOUTH DWC LLC": "Emaar Properties",
    "DUBAI CREEK HARBOUR L.L.C": "Emaar Properties (Dubai Creek Harbour JV)",
    "DUBAI HILLS ESTATE L.L.C": "Emaar Properties (Dubai Hills Estate JV)",

    "SOBHA L.L.C": "Sobha Realty",
    "BINGHATTI DEVELOPERS FZE": "Binghatti",
    "DAMAC PRIME DEVELOPMENT L.L.C": "Damac Properties",
    "DAMAC CRESCENT PROPERTIES": "Damac Properties",
    "DANUBE PROPERTIES DEVELOPMENT L.L.C": "Danube Properties",
    "AZIZI DEVELOPMENTS L.L.C": "Azizi Developments",
    "ARADA DEVELOPMENTS L.L.C S.O.C": "Arada",
    "DUBAI SOUTH PROPERTIES DWC LLC": "Dubai South",
    "ELLINGTON PCFC DEVELOPERS L.L.C": "Ellington Properties",
    "ELLINGTON PROPERTIES DEVELOPMENT L.L.C": "Ellington Properties",
    "DEYAAR DEVELOPMENT (P.J.S.C)": "Deyaar",
    "THE PALM - JEBEL ALI CO. (L.L.C)": "Nakheel",
    "LA MER CENTRAL PROPERTY CO. L.L.C": "Meraas (La Mer)",
    "LA MER NORTH PROPERTY CO. L.L.C": "Meraas (La Mer)",
    "CITYWALK RESIDENTIAL 1 L.L.C": "Meraas (City Walk)",
    "MINA RASHID PROPERTIES L.L.C": "Meraas (Mina Rashid)",
    "NSHAMA PROPERTIES OWNED BY NSHMI DEVELOPMENT ONE PERSON COMPANY L.L.C": "Nshama",
    "REPORTAGE PLUS A REAL ESTATE DEVELOPMENT L.L.C": "Reportage Properties",
    "SAMANA LUX REAL ESTATE DEVELOPMENTS L.L.C": "Samana Developers",
    "SAMANA PREMIUM REAL ESTATE DEVELOPMENT L.L.C": "Samana Developers",
    "SAMANA PLATINUM REAL ESTATE DEVELOPMENT L.L.C": "Samana Developers",
    "IMTIAZ LUXURY REAL ESTATE DEVELOPMENT L.L.C": "Imtiaz Developments",
    "IMTIAZ GHD REAL ESTATE DEVELOPMENT L.L.C": "Imtiaz Developments",
    "IMTIAZ COVE REAL ESTATE DEVELOPMENT L.L.C": "Imtiaz Developments",
    "IMTIAZ SOUTH REAL ESTATE DEVELOPMENT L.L.C": "Imtiaz Developments",
}

def normalize_developer_name(raw_name: str) -> str:
    key = raw_name.upper().strip()
    if key in DEVELOPER_BRAND_MAP:
        return DEVELOPER_BRAND_MAP[key]
    return raw_name.title()
def fetch_rental_stats(area_name: str) -> dict:
    try:
        res = supabase.table("rentals").select(
            "ANNUAL_AMOUNT,PROP_TYPE_EN,PROP_SUB_TYPE_EN,ROOMS,USAGE_EN,VERSION_EN,REGISTRATION_DATE"
        ).ilike("AREA_EN", f"%{area_name}%").order("REGISTRATION_DATE", desc=True).limit(500).execute()
        rows = res.data or []
        if not rows: return {}

        rents = [float(r["ANNUAL_AMOUNT"]) for r in rows if r.get("ANNUAL_AMOUNT")]
        by_room = defaultdict(list); by_type = defaultdict(list)
        version_count = defaultdict(int)

        for r in rows:
            amt = r.get("ANNUAL_AMOUNT")
            if not amt: continue
            amt = float(amt)
            label = _room_label(r.get("ROOMS"))
            if label: by_room[label].append(amt)
            ptype = r.get("PROP_SUB_TYPE_EN") or r.get("PROP_TYPE_EN")
            if ptype: by_type[ptype].append(amt)
            if r.get("VERSION_EN"): version_count[r["VERSION_EN"]] += 1

        return {
            "count": len(rows),
            "avg_annual_rent": round(sum(rents)/len(rents), 0) if rents else None,
            "median_annual_rent": median_val(rents),
            "rent_by_bedroom": {
                k: {"avg": round(sum(v)/len(v), 0), "median": median_val(v), "count": len(v)}
                for k, v in by_room.items() if len(v) >= 2
            },
            "rent_by_type": {k: round(sum(v)/len(v), 0) for k, v in by_type.items() if len(v) >= 2},
            "new_vs_renewed": dict(version_count),
        }
    except Exception as e:
        print(f"[ACQAR] fetch_rental_stats error: {e}")
        return {}

def fetch_rental_stats_for_area(name: str, keyword: str) -> dict:
    for cand in filter(None, [_clean_area_search_term(name), keyword]):
        data = fetch_rental_stats(cand)
        if data: return data
    return {}


async def _run(func, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, func, *args)

async def build_area_context_async(area_id: int, detected_keyword: str, context_data: dict):
    name = preferred_name(area_id, detected_keyword)
    context_data["detected_area"] = name
    context_data["area_id"]       = area_id

    intel, area_data, history, catalysts, projects = await asyncio.gather(
        _run(fetch_area_intelligence, area_id),
        _run(fetch_area_stats, area_id),
        _run(fetch_price_history, area_id),
        _run(fetch_area_catalysts, area_id),
        _run(fetch_dld_projects, area_id),
    )

    dld_name = (intel.get("area_name_en") if intel else None) or name
    rental_stats = await _run(fetch_rental_stats_for_area, dld_name, detected_keyword)
    if rental_stats: context_data["rental_stats"] = rental_stats

    dev_records = []; shock_data = []
    if intel:
        devs = intel.get("key_developers") or []; zone = intel.get("zone_type")
        tasks = []
        fd = bool(devs); fs = bool(zone)
        if fd: tasks.append(_run(fetch_developer_track_records, devs))
        if fs: tasks.append(_run(fetch_area_shock_impacts, zone))
        results = await asyncio.gather(*tasks) if tasks else []
        idx = 0
        if fd: dev_records = results[idx] or []; idx += 1
        if fs: shock_data  = results[idx] or []

    if intel:       context_data["area_intelligence"]           = intel
    if dev_records: context_data["developer_track_records"]     = dev_records
    if shock_data:  context_data["historical_shock_resilience"] = shock_data

    if area_data:
        prices = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
        worths = [float(r["actual_worth"])   for r in area_data if r.get("actual_worth")]
        room_psm = defaultdict(list); room_worth = defaultdict(list)
        room_count = defaultdict(int)
        year_map = defaultdict(list)

        for r in area_data:
            label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
            if label:
                room_count[label] += 1
                if r.get("price_per_sqm"): room_psm[label].append(float(r["price_per_sqm"]))
                worth = r.get("actual_worth")
                # Fall back to price_per_sqm × procedure_area when actual_worth is missing
                if not worth and r.get("price_per_sqm") and r.get("procedure_area"):
                    worth = float(r["price_per_sqm"]) * float(r["procedure_area"])
                if worth: room_worth[label].append(float(worth))
            if r.get("sale_year") and r.get("price_per_sqm"):
                year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

        def is_valid_bedroom(br: str) -> bool:
            if room_count.get(br, 0) < 3: return False
            med = median_val(room_worth.get(br, []))
            if med and float(med) > 20_000_000: return False
            return True

        context_data["transaction_stats"] = {
            "count":                   len(area_data),
            "avg_price_sqm":           round(sum(prices)/len(prices), 0) if prices else None,
            "min_price_sqm":           round(min(prices), 0) if prices else None,
            "max_price_sqm":           round(max(prices), 0) if prices else None,
            "avg_worth_aed":           round(sum(worths)/len(worths), 0) if worths else None,
            "bedroom_avg_psm":         {k: round(sum(v)/len(v), 0) for k, v in room_psm.items() if is_valid_bedroom(k)},
            "yearly_avg_psm":          {str(k): round(sum(v)/len(v), 0) for k, v in sorted(year_map.items())},
            "median_price_by_bedroom": {k: median_val(v) for k, v in room_worth.items() if is_valid_bedroom(k)},
        }

    if history:
        year_avg = defaultdict(list)
        for r in history: year_avg[r["sale_year"]].append(r["psf"])
        context_data["price_history_by_year"] = {str(y): round(sum(v)/len(v), 0) for y, v in sorted(year_avg.items())}
    elif context_data.get("transaction_stats", {}).get("yearly_avg_psm"):
        # price_history_manual is empty — fall back to real avm-derived yearly averages
        context_data["price_history_by_year"] = context_data["transaction_stats"]["yearly_avg_psm"]

    # If area_intelligence.price_trend_pct is missing, derive it from real avm-based
    # yearly averages (same-source, consecutive-year comparison — no unit mixing).
    if context_data.get("area_intelligence") and not context_data["area_intelligence"].get("price_trend_pct"):
        yearly = context_data.get("price_history_by_year") or {}
        if len(yearly) >= 2:
            years = sorted(yearly.keys())
            old_v = yearly[years[-2]]
            new_v = yearly[years[-1]]
            if old_v:
                derived_trend = round(((new_v - old_v) / old_v) * 100, 1)
                context_data["area_intelligence"]["price_trend_pct"] = derived_trend
                context_data["price_trend_is_derived"] = True

    if catalysts: context_data["area_catalysts"] = catalysts
    if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# ─────────────────────────────────────────────────────────────────
# REPLY BUILDERS (unchanged from your working version)
# ─────────────────────────────────────────────────────────────────

def build_lifestyle_reply(ctx: dict, bedrooms: str) -> str:
    lines = []
    lifestyle_tags = ctx.get("_lifestyle_tags", [])
    priority_tags = [t for t in lifestyle_tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
    tag_str = " & ".join(t.title() for t in priority_tags[:2]) + " Living" if priority_tags else "Family Living"

    # Collect lifestyle sub-contexts
    areas = []
    for k, v in ctx.items():
        if k.startswith("lifestyle_") and isinstance(v, dict):
            intel = v.get("area_intelligence") or {}
            stats = v.get("transaction_stats") or {}
            cats  = v.get("area_catalysts") or []
            hist  = v.get("price_history_by_year") or {}
            devs  = v.get("developer_track_records") or []
            name  = intel.get("area_name_en") or v.get("detected_area", "")
            if name:
                areas.append({
                    "name": name, "intel": intel, "stats": stats,
                    "cats": cats, "hist": hist, "devs": devs,
                })

    if not areas:
        return build_general_reply(ctx, bedrooms)

    lines.append(f"📌 DIRECT ANSWER")
    lines.append(f"• Here are the top {len(areas)} areas where British families with kids actually live in Dubai — based on real buyer nationality data, school proximity, and DLD closed-sale prices")
    lines.append(f"• All prices are real DLD closed sales — not asking prices, not agent estimates")

    lines.append(f"\n💡 YOUR OPTIONS — {len(areas)} Areas to Consider")

    for i, area in enumerate(areas, 1):
        name  = area["name"]
        intel = area["intel"]
        stats = area["stats"]
        cats  = area["cats"]
        hist  = area["hist"]
        devs  = area["devs"]

        score   = intel.get("investment_score")
        yld     = intel.get("gross_yield_pct")
        verdict = (intel.get("verdict") or "").upper()
        trend   = intel.get("price_trend_pct")
        rank    = intel.get("ranking_rank")
        parks   = intel.get("parks_info") or ""
        retail  = intel.get("retail_info") or ""
        nats    = intel.get("buyer_nationalities") or []
        devlist = intel.get("key_developers") or []
        off_plan= intel.get("active_project_names") or []
        bmed    = stats.get("median_price_by_bedroom") or {}
        bpsm    = stats.get("bedroom_avg_psm") or {}

        lines.append(f"\nOption {i} — {name}")

        # Score + verdict
        if score:
            lines.append(f"• Investment Score: {score}/100" + (f" — Verdict: {verdict}" if verdict else ""))
        

        # Yield
        if yld:
            diff = round(float(yld) - 6.1, 2)
            lines.append(f"• Gross Yield: {yld}% ({'+' if diff>=0 else ''}{diff}% vs Dubai avg 6.1%)")

        # Price trend
        if trend is not None:
            direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
            lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% YoY ({direction})")

        # Community
        if parks:  lines.append(f"• Green spaces: {parks}")
        if retail: lines.append(f"• Amenities: {retail}")

        # Nationalities — show British % prominently
        if nats:
            brit = next((n for n in nats if "british" in n.get("name","").lower() or "uk" in n.get("name","").lower()), None)
            top2 = nats[:2]
            nat_str = " · ".join([f"{n.get('flag','')} {n.get('name','')} {n.get('pct','')}%" for n in top2])
            lines.append(f"• Who buys here: {nat_str}")
            if brit:
                lines.append(f"• British presence: {brit.get('flag','🇬🇧')} {brit.get('pct','')}% of all buyers — strong expat community")

        # Developers
        if devlist:
            lines.append(f"• Key developers: {' · '.join(devlist[:3])}")

        # Off-plan projects
        if off_plan:
            lines.append(f"• Active off-plan projects: {' · '.join(off_plan[:3])}")
        else:
            lines.append(f"• Off-plan: No active launches — secondary market only")

        # Entry prices by bedroom
        target_br = bedrooms or "3 BR"
        if bmed:
            med = bmed.get(target_br) or bmed.get("2 BR") or (list(bmed.values())[0] if bmed else None)
            psm = bpsm.get(target_br) or bpsm.get("2 BR") or (list(bpsm.values())[0] if bpsm else None)
            if med:
                line = f"• {target_br} median price: {fmt_aed(med)} (real DLD closed sale)"
                if psm: line += f" · {fmt_psm(psm)}"
                lines.append(line)
            # Show all bedroom types
            for br in ["2 BR", "3 BR", "4 BR"]:
                if br == target_br or br not in bmed: continue
                lines.append(f"• {br}: {fmt_aed(bmed[br])}" + (f" · {fmt_psm(bpsm[br])}" if br in bpsm else ""))

        # Past → Present → Future
        if hist and len(hist) >= 2:
            years = sorted(hist.keys())
            old_v = hist[years[0]]; new_v = hist[years[-1]]
            chg   = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
            lines.append(f"• Past → Present: {fmt_psm(old_v)} ({years[0]}) → {fmt_psm(new_v)} ({years[-1]}) = {'+' if chg>0 else ''}{chg}%")
            if chg != 0:
                projected = round(float(new_v) * (1 + chg / 100), 0)
                lines.append(f"• Future (projected ~{int(years[-1])+1}): ~{fmt_psm(projected)} at current trend rate")
        elif trend is not None and bpsm:
            avg_psm = list(bpsm.values())[0]
            projected = round(float(avg_psm) * (1 + float(trend) / 100), 0)
            lines.append(f"• Future (projected): ~{fmt_psm(projected)} in 12 months at {'+' if float(trend)>0 else ''}{trend}% trend")

        # Developer track records
        if devs:
            for d in devs[:2]:
                flag = " ⚠️ delay risk" if (d.get("on_time_pct") or 100) < 70 else ""
                lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

        # Top catalyst
        if cats:
            cat = cats[0]
            desc = cat.get("description") or ""
            desc_str = f" — {desc}" if desc else ""
            lines.append(f"• Upcoming: {cat.get('name','')} ({cat.get('expected_date','soon')}){desc_str}")

    # Budget summary from best area
    lines.append(f"\n💰 YOUR REALISTIC NUMBERS")
    best = areas[0]
    bmed = best["stats"].get("median_price_by_bedroom") or {}
    all_meds = sorted([v for v in bmed.values() if v])
    if all_meds:
        lines.append(f"• Estimated property budget: {fmt_aed(min(all_meds))} – {fmt_aed(max(all_meds))}")
    lines.append(f"• Minimum cash needed: AED 100,000+ (DLD 4% transfer fee mandatory regardless of financing)")
    best_names = " · ".join([a["name"] for a in areas[:3]])
    lines.append(f"• Best areas for your profile: {best_names}")

    lines.append(f"\n⚠️ CRITICAL WARNINGS")
    lines.append("• Check school catchment zones BEFORE committing — not all schools accept from all communities")
    lines.append("• Service charges: 10–20 AED/sqft/year — always confirm before signing SPA")

    school_map = {
        "Dubai Hills Estate": "GEMS New Millennium, King's College School Dubai",
        "Jumeirah": "Jumeirah English Speaking School (JESS), Dubai College",
        "Jumeirah Park": "Regent International School, Dubai British School",
        "Arabian Ranches": "JESS Arabian Ranches, Ranches Primary School",
        "Arabian Ranches 2": "JESS Arabian Ranches, Ranches Primary School",
        "Jumeirah Village Circle (JVC)": "JSS International School, Sunmarke School",
        "Palm Jumeirah": "Dubai English Speaking School, GEMS Wellington Primary",
        "Dubai Marina": "Dubai British School, Emirates International School",
    }
    lines.append(f"\n✅ NEXT STEPS — Do These This Week")
    for i, area in enumerate(areas[:3], 1):
        schools = school_map.get(area["name"], "check local British curriculum schools nearby")
        lines.append(f"• Step {i}: Visit {area['name']} — nearest British schools: {schools}")
    lines.append(f"• Step 4: Get a mortgage pre-approval before viewing — UAE banks take 3–5 working days")

    return "\n".join(lines)



def build_comparison_reply(ctx: dict, bedrooms: str) -> str:
    lines = []
    comparison_keys = [k for k in ctx if k.startswith("comparison_")]

    areas = []
    for k in comparison_keys:
        sub = ctx[k]
        if not isinstance(sub, dict): continue
        intel = sub.get("area_intelligence") or {}
        stats = sub.get("transaction_stats") or {}
        cats  = sub.get("area_catalysts") or []
        hist  = sub.get("price_history_by_year") or {}
        name  = intel.get("area_name_en") or sub.get("detected_area", "")
        if name:
            areas.append({"name": name, "intel": intel, "stats": stats, "cats": cats, "hist": hist})

    if len(areas) < 2:
        return build_general_reply(ctx, bedrooms)

    a, b = areas[0], areas[1]
    target_br = bedrooms or "2 BR"

    yld_a = a["intel"].get("gross_yield_pct"); yld_b = b["intel"].get("gross_yield_pct")
    score_a = a["intel"].get("investment_score"); score_b = b["intel"].get("investment_score")
    trend_a = a["intel"].get("price_trend_pct"); trend_b = b["intel"].get("price_trend_pct")

    lines.append("📌 DIRECT ANSWER")
    lines.append(
        f"I pulled real DLD closed-sale data for both {a['name']} and {b['name']} — no asking-price "
        f"guesswork, just what actually sold. Here's how they compare."
    )

    # ── Price history, written as prose, addressing both areas together ──
    hist_sentences = []
    for area in (a, b):
        hist = area.get("hist", {})
        if hist and len(hist) >= 2:
            years = sorted(hist.keys())
            old_v = hist[years[0]]; new_v = hist[years[-1]]
            chg = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
            direction = "climbed" if chg > 0 else "eased back"
            sentence = (
                f"{area['name']} has {direction} from {fmt_psm(old_v)} in {years[0]} to "
                f"{fmt_psm(new_v)} in {years[-1]} — a {'+' if chg>0 else ''}{chg}% move"
            )
            if chg != 0:
                projected = round(float(new_v) * (1 + chg / 100), 0)
                sentence += f", putting it on track for roughly {fmt_psm(projected)} by {int(years[-1])+1} if the trend holds"
            hist_sentences.append(sentence + ".")
        else:
            hist_sentences.append(
                f"{area['name']} doesn't have enough historical DLD records yet to chart a reliable price trend — "
                f"once more transactions land, that'll fill in."
            )

    if hist_sentences:
        lines.append("\n📈 HOW PRICES HAVE MOVED")
        lines.append(" ".join(hist_sentences))

    # ── Analysis, written conversationally ──
    lines.append("\n🔍 WHAT THIS TELLS US")
    analysis_bits = []
    if yld_a and yld_b:
        if float(yld_a) != float(yld_b):
            better_yield = a["name"] if float(yld_a) > float(yld_b) else b["name"]
            worse_yield_val = min(float(yld_a), float(yld_b))
            better_yield_val = max(float(yld_a), float(yld_b))
            analysis_bits.append(
                f"On rental income, {better_yield} is the stronger of the two — {better_yield_val}% "
                f"gross yield versus {worse_yield_val}%, so an investor chasing cash flow would lean that way."
            )
        else:
            analysis_bits.append(f"Both areas post an identical {yld_a}% gross yield, so yield alone won't decide it for you.")

    if score_a and score_b:
        if float(score_a) != float(score_b):
            better_score = a["name"] if float(score_a) > float(score_b) else b["name"]
            analysis_bits.append(
                f"On overall investment fundamentals, {better_score} scores higher "
                f"({max(float(score_a), float(score_b)):.0f}/100 vs {min(float(score_a), float(score_b)):.0f}/100)."
            )
        else:
            analysis_bits.append(
                f"Both areas land at the same {score_a}/100 investment score, so this really comes down to "
                f"yield, price point, and what kind of tenant or buyer you're targeting."
            )

    if analysis_bits:
        lines.append(" ".join(analysis_bits))
    else:
        lines.append(f"Both {a['name']} and {b['name']} are active, well-established Dubai markets — the choice comes down to your budget and what you're optimizing for.")

    # ── Bottom line, written as a direct recommendation ──
    lines.append("\n✅ BOTTOM LINE")
    if score_a and score_b and float(score_a) != float(score_b):
        winner = a if float(score_a) > float(score_b) else b
        lines.append(
            f"If I had to pick one on the numbers today, it's {winner['name']} — the stronger investment "
            f"score at {winner['intel'].get('investment_score')}/100. That said, book a viewing in both: "
            f"see {a['name']} and {b['name']} side by side before you commit, since a good unit in the "
            f"'weaker' area can still outperform a mediocre one in the stronger area."
        )
    elif yld_a and yld_b and float(yld_a) != float(yld_b):
        better_yield_area = a['name'] if float(yld_a) > float(yld_b) else b['name']
        lines.append(
            f"With fundamentals tied, yield breaks the tie — {better_yield_area} edges it out for rental "
            f"income. If capital growth matters more to you than monthly cash flow, it's worth comparing "
            f"specific buildings in both before deciding."
        )
    else:
        lines.append(
            f"Both {a['name']} and {b['name']} hold up well on the data available. Your best move is to "
            f"book viewings in both and compare actual units at the same price point — the headline numbers "
            f"only tell part of the story."
        )

    return "\n".join(lines)


def build_comparison_charts(ctx: dict) -> list:
    comparison_keys = [k for k in ctx if k.startswith("comparison_")]
    areas = []
    for k in comparison_keys:
        sub = ctx[k]
        if not isinstance(sub, dict): continue
        intel = sub.get("area_intelligence") or {}
        stats = sub.get("transaction_stats") or {}
        name = intel.get("area_name_en")
        if name:
            areas.append((name, intel, stats))
    if len(areas) < 2:
        return []
    charts = []
    score_data = [{"label": n, "value": float(i.get("investment_score") or 0)} for n, i, s in areas]
    if any(d["value"] > 0 for d in score_data):
        charts.append({"type": "bar", "title": "Investment Score Comparison", "data": score_data})
    yield_data = [{"label": n, "value": float(i.get("gross_yield_pct") or 0)} for n, i, s in areas]
    if any(d["value"] > 0 for d in yield_data):
        charts.append({"type": "bar", "title": "Gross Yield Comparison (%)", "data": yield_data})
    price_data = [{"label": n, "value": float(i.get("truvalu_psm") or s.get("avg_price_sqm") or 0)} for n, i, s in areas]
    if any(d["value"] > 0 for d in price_data):
        charts.append({"type": "bar", "title": "Avg Price per sqm (AED)", "data": price_data})
    return charts

def build_buyer_reply(ctx: dict, bedrooms: str) -> str:
    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    lines = []

    lines.append("🏠 IS THIS RIGHT FOR YOU?")
    vibe_map = {
        "Dubai Marina": "an upscale waterfront community — high-rises, dining, beach access",
        "Jumeirah Village Circle (JVC)": "a family-friendly suburban community — quiet, gated, well-maintained",
        "Downtown Dubai": "a city-centre luxury district — iconic skyline, walkable, high-energy",
        "Business Bay": "an urban professional hub — canal views, close to DIFC",
        "Palm Jumeirah": "a premium island community — private beaches, villa living",
        "Dubai Hills Estate": "a green master-planned community — parks, schools, golf",
        "Jumeirah Lake Towers (JLT)": "a mixed-use lakeside community — metro access, restaurants, community feel",
    }
    vibe = vibe_map.get(area, "an established Dubai residential community")
    lines.append(f"• {area} is {vibe}")
    target_br = bedrooms or "2 BR"
    median_br = stats.get("median_price_by_bedroom", {}).get(target_br) or stats.get("avg_worth_aed")
    if median_br:
        lines.append(f"• Verdict: GOOD BUY — {target_br} median is {fmt_aed(median_br)}, real DLD closed-sale price")

    lines.append("\n💰 WHAT YOUR MONEY GETS YOU")
    bedroom_psm = stats.get("bedroom_avg_psm", {})
    bedroom_med = stats.get("median_price_by_bedroom", {})
    if target_br in bedroom_psm:
        lines.append(f"• {target_br}: {fmt_psm(bedroom_psm[target_br])} | Median closed sale: {fmt_aed(bedroom_med.get(target_br))}")
    if stats.get("avg_price_sqm"):
        lines.append(f"• Area average: {fmt_psm(stats['avg_price_sqm'])}")
    if bedroom_med:
        all_meds = [v for v in bedroom_med.values() if v]
        if all_meds:
            lines.append(f"• Unit price range: {fmt_aed(min(all_meds))} – {fmt_aed(max(all_meds))}")
    for br, psm in bedroom_psm.items():
        if br == target_br: continue
        med = bedroom_med.get(br)
        line = f"• {br}: {fmt_psm(psm)}"
        if med: line += f" | Median: {fmt_aed(med)}"
        lines.append(line)

    lines.append("\n🏘️ COMMUNITY & LIFESTYLE")
    community_map = {
        "Jumeirah Village Circle (JVC)": ("Family-friendly, quiet, gated — popular with South Asian and European expat families", "20–25 min to Downtown via Al Khail Road"),
        "Dubai Marina":                  ("Urban, vibrant, mixed expat — young professionals and couples", "25 min to Downtown via Sheikh Zayed Road"),
        "Downtown Dubai":                ("City-centre cosmopolitan — tourists, professionals, luxury buyers", "Walking distance to DIFC and Dubai Mall"),
        "Business Bay":                  ("Professional urban community — canal views, close to DIFC", "10 min to Downtown, direct metro access"),
        "Palm Jumeirah":                 ("Premium island — wealthy expats, high-net-worth families", "25–35 min to Downtown via Sheikh Zayed Road"),
        "Dubai Hills Estate":            ("Green, family-oriented — British families, school-age children", "20 min to Downtown via Al Khail Road"),
        "Jumeirah Lake Towers (JLT)":   ("Mixed expat lakeside community — professionals, families", "Metro access, 5 min to Dubai Marina"),
    }
    comm, commute = community_map.get(area, ("Established mixed expat community", "20–30 min to Downtown"))
    lines.append(f"• Who lives here: {comm}")
    if intel.get("parks_info"):   lines.append(f"• Green spaces: {intel['parks_info']}")
    if intel.get("retail_info"):  lines.append(f"• Retail/amenities: {intel['retail_info']}")
    lines.append(f"• Commute to Downtown Dubai: {commute}")

    lines.append("\n📈 IS IT A GOOD TIME TO BUY?")
    trend = intel.get("price_trend_pct")
    hist  = ctx.get("price_history_by_year", {})
    if trend is not None:
        direction = "Rising" if float(trend) > 0 else "Cooling"
        lines.append(f"• Price trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year ({direction})")
        if float(trend) > 0:
            lines.append("• What this means: Market is rising — buying sooner gives you a better entry price")
        else:
            lines.append("• What this means: Prices cooling — you have stronger negotiation power right now")
    elif hist:
        years = sorted(hist.keys())
        if len(years) >= 2:
            old_v = hist[years[0]]; new_v = hist[years[-1]]
            chg = round(((new_v - old_v) / old_v) * 100, 1) if old_v else 0
            lines.append(f"• Price moved {fmt_psm(old_v)} ({years[0]}) → {fmt_psm(new_v)} ({years[-1]}): {'+' if chg>0 else ''}{chg}%")
            lines.append(f"• What this means: {'Rising trend — buy sooner' if chg > 0 else 'Stable — good negotiation window'}")
        else:
            lines.append(f"• Current price: {fmt_psm(list(hist.values())[0])} — stable market, good entry point")
    else:
        lines.append("• Market is active with strong transaction volume — buyer demand is consistent in this area")
        lines.append("• What this means: Competitive market — move quickly on a unit you like")

    devs = ctx.get("developer_track_records", [])
    if devs:
        lines.append("\n🏗️ DEVELOPER TRACK RECORD")
        for d in devs[:3]:
            flag = " ⚠️" if (d.get("on_time_pct") or 100) < 70 else ""
            lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

    lines.append("\n✅ BUYER VERDICT")
    lifestyle_fit = {
        "Jumeirah Village Circle (JVC)": "families and first-time buyers wanting space and community feel under AED 2M",
        "Dubai Marina":                  "professionals wanting waterfront lifestyle with walkable dining and beach",
        "Downtown Dubai":                "buyers wanting iconic address and city-centre access",
        "Business Bay":                  "professionals wanting proximity to DIFC and canal views",
        "Palm Jumeirah":                 "buyers wanting premium island lifestyle and private beach access",
        "Dubai Hills Estate":            "families wanting green spaces, British schools, and a planned community",
        "Jumeirah Lake Towers (JLT)":   "buyers wanting metro access and lakeside community feel",
    }
    lines.append(f"• Right for you if: {lifestyle_fit.get(area, 'you want a well-connected Dubai residential community')}")
    lines.append("• Watch out for: Service charges and parking costs — confirm both before signing")
    if median_br:
        asking_est = round(float(median_br) * 1.10)
        lines.append(f"• Negotiation tip: DLD median is {fmt_aed(median_br)} — asking prices run ~10% higher ({fmt_aed(asking_est)}), push back hard")
    lines.append("• Next step: Book 2–3 viewings this week — compare layouts and floor levels at the same price point")

    lines.extend(build_rental_section(ctx))

    return "\n".join(lines)


def build_seller_reply(ctx: dict, bedrooms: str) -> str:
    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    hist  = ctx.get("price_history_by_year", {})
    cats  = ctx.get("area_catalysts", [])
    user_price = ctx.get("user_budget_aed")   # the price the seller actually listed at
    lines = []

    bedroom_med = stats.get("median_price_by_bedroom", {})
    br_order = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5 BR"]
    available_brs = [br for br in br_order if br in bedroom_med]

    target_br = bedrooms  # None if user didn't say a size
    median_v  = bedroom_med.get(target_br) if target_br else None
    avg_psm   = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
    trend     = intel.get("price_trend_pct")

    lines.append("📌 SELL NOW OR WAIT?")
    if trend is not None and float(trend) > 0:
        lines.append("• Decision: Sell now")
        lines.append(f"• Reason: Prices rising +{trend}% year-on-year — sell into strength before the market peaks")
    elif trend is not None and float(trend) < 0:
        lines.append("• Decision: Price carefully or wait")
        lines.append(f"• Reason: Market cooling {trend}% YoY — buyers have leverage, price at or below median")
    else:
        lines.append("• Decision: Good time to sell")
        lines.append("• Reason: Market is stable with active buyer demand — list now to catch current interest")


    if user_price:
        bedroom_med = stats.get("median_price_by_bedroom", {})
        benchmark = bedroom_med.get(bedrooms) if bedrooms else None
        benchmark_label = f"{bedrooms} median" if benchmark else None
        if not benchmark:
            benchmark = intel.get("truvalu_psm") and stats.get("avg_price_sqm")
            benchmark = stats.get("avg_worth_aed")
            benchmark_label = "area-wide average (all unit types — not bedroom-specific)"

        lines.append("\n💵 IS YOUR ASKING PRICE RIGHT?")
        lines.append(f"• Your listed price: {fmt_aed(user_price)}")
        if benchmark:
            diff_pct = round((float(user_price) - float(benchmark)) / float(benchmark) * 100, 1)
            lines.append(f"• DLD benchmark ({benchmark_label}): {fmt_aed(benchmark)}")
            if diff_pct > 15:
                lines.append(f"• Verdict: {diff_pct}% above benchmark — this is likely why buyers are calling it high. Premium features (view, renovation) can justify some gap, but {diff_pct}% is a large premium to defend without strong comps.")
            elif diff_pct > 5:
                lines.append(f"• Verdict: {diff_pct}% above benchmark — reasonable if the unit has real upgrades, but be ready to justify it to buyers.")
            elif diff_pct < -5:
                lines.append(f"• Verdict: actually {abs(diff_pct)}% BELOW benchmark — you may be underpricing.")
            else:
                lines.append(f"• Verdict: within {abs(diff_pct)}% of benchmark — in line with the market.")
        else:
            lines.append("• Not enough DLD data to benchmark this precisely yet — treat 'too high' feedback as opinion, not data.")

    lines.append("\n📈 PRICE MOMENTUM")
    if avg_psm: lines.append(f"• Current average: {fmt_psm(avg_psm)}")
    if trend is not None:
        direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
        lines.append(f"• Year-on-year trend: {'+' if float(trend)>0 else ''}{trend}% ({direction})")
    if hist:
        years = sorted(hist.keys())
        price_parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-3:]]
        lines.append(f"• Price history: {' → '.join(price_parts)}")
    tx = intel.get("tx_7d"); tx_delta = intel.get("tx_7d_delta_pct")
    if tx:
        delta_str = f" ({'+' if float(tx_delta or 0)>0 else ''}{tx_delta}% WoW)" if tx_delta else ""
        lines.append(f"• Weekly transactions: {tx} deals{delta_str}")

    lines.append("\n💰 YOUR REALISTIC ASKING PRICE")
    if target_br and median_v:
        recommended = round(float(median_v) * 1.06)
        lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
        lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
    elif available_brs:
        lines.append(f"• You didn't mention a unit size, so here's every size we have real DLD closed-sale data for in {area}:")
        for br in available_brs:
            med = bedroom_med[br]
            rec = round(float(med) * 1.06)
            lines.append(f"• {br}: Median {fmt_aed(med)} → Recommended list {fmt_aed(rec)}")
    elif avg_psm:
        recommended_psm = round(float(avg_psm) * 1.06)
        lines.append(
            f"• We don't have enough closed sales broken down by exact bedroom count for {area} right now — "
            f"here's the overall benchmark instead: {fmt_psm(avg_psm)}."
        )
        lines.append(f"• Recommended list rate: AED {recommended_psm:,}/sqm (6% above average — leaves negotiation room)")
    else:
        lines.append(f"• Not enough recent DLD transaction data for {area} yet to give a reliable price estimate.")
    distress = intel.get("distress_pct")
    if distress:
        lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

    if cats:
        lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
        for c in cats[:3]:
            lines.append(f"• {c.get('name') or 'Catalyst'} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'infrastructure uplift expected'}")

    lines.append("\n✅ SELLER ACTION PLAN")
    if target_br and median_v:
        lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
    elif available_brs:
        mid_br = available_brs[len(available_brs) // 2]
        lines.append(f"• Step 1: Tell us your unit size for an exact number — a {mid_br} here typically lists around {fmt_aed(round(float(bedroom_med[mid_br])*1.06))}")
    lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
    lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
    if target_br and median_v:
        lines.append(f"• Bottom line: Expect 3–5 viewings in first 2 weeks at {fmt_aed(round(float(median_v)*1.06))}")

    lines.extend(build_rental_section(ctx))

    return "\n".join(lines)


def build_investor_reply(ctx: dict, bedrooms: str) -> str:
    intel  = ctx.get("area_intelligence", {})
    stats  = ctx.get("transaction_stats", {})
    area   = ctx.get("detected_area", "")
    hist   = ctx.get("price_history_by_year", {})
    cats   = ctx.get("area_catalysts", [])
    shocks = ctx.get("historical_shock_resilience", [])
    devs   = ctx.get("developer_track_records", [])
    top_yield = ctx.get("top_yield_areas", [])
    top_areas = ctx.get("top_areas", [])
    lines = []

    if top_yield or top_areas:
        data = top_yield or top_areas
        lines.append("📌 INVESTMENT VERDICT")
        lines.append("• Signal: BUY — ranked below are Dubai's top-performing areas by real DLD investment data")
        lines.append("• Best play: Buy-to-let Studio or 1BR for immediate rental income above 6.1% Dubai average")
        lines.append("\n📊 TOP AREAS BY ROI — Real DLD Data")
        for i, a in enumerate(data[:8], 1):
            name  = a.get("area_name_en", "")
            score = a.get("investment_score")
            yld   = a.get("gross_yield_pct")
            trend = a.get("price_trend_pct")
            psm   = a.get("truvalu_psm")
            parts = []
            if score: parts.append(f"Score {score}/100")
            if yld:   parts.append(f"Yield {yld}%")
            if trend is not None: parts.append(f"Trend {'+' if float(trend)>0 else ''}{trend}%")
            if psm:   parts.append(f"Avg {fmt_psm(psm)}")
            if parts: lines.append(f"• #{i} {name} — {' · '.join(parts)} → https://www.acqar.com/areas/{area_to_slug(name)}")
        lines.append("\n✅ INVESTOR DECISION")
        if data:
            top = data[0]
            yld_top = top.get("gross_yield_pct", "")
            score_top = top.get("investment_score", "")
            diff = round(float(yld_top) - 6.1, 2) if yld_top else 0
            lines.append(f"• Best entry: {top.get('area_name_en','')} — {yld_top}% gross yield ({'+' if diff>=0 else ''}{diff}% above Dubai avg)")
            if score_top: lines.append(f"• Investment Score: {score_top}/100 — strongest fundamentals in Dubai right now")
        lines.append("• Rule: Only invest in areas beating 6.1% Dubai average yield threshold")
        lines.append("• Best unit type: Studio or 1BR — highest yield-to-price ratio in every top area")
        
        return "\n".join(lines)

    lines.append("📌 INVESTMENT VERDICT")
    score = intel.get("investment_score"); yld = intel.get("gross_yield_pct")
    trend = intel.get("price_trend_pct"); rank = intel.get("ranking_rank")
    signal = "STRONG BUY" if (score and float(score) >= 75) else "BUY" if (score and float(score) >= 60) else "HOLD"
    if yld and float(yld) > 6.1:
        diff = round(float(yld) - 6.1, 2)
        lines.append(f"• Signal: {signal} — {yld}% gross yield is +{diff}% above Dubai average of 6.1%")
    elif score:
        lines.append(f"• Signal: {signal} — Investment Score {score}/100")
    else:
        lines.append(f"• Signal: {signal} — active transaction market in {area}")
    lines.append("• Best play: Buy-to-let for rental income + capital appreciation")

    lines.append("\n📊 INVESTMENT SCORECARD")
    if score: lines.append(f"• Investment Score: {score}/100")
    if yld:
        diff = round(float(yld) - 6.1, 2)
        above = "above" if diff >= 0 else "below"
        lines.append(f"• Gross Yield: {yld}% — Dubai avg 6.1%, this is {abs(diff)}% {above} average")
    if trend is not None: lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year")
    if rank:  lines.append(f"• Dubai Ranking: #{rank} out of all areas")
    distress = intel.get("distress_pct")
    if distress: lines.append(f"• Distress Sales: {distress}% — {'opportunity: motivated sellers' if float(distress)>10 else 'stable market'}")
    abs_rate = intel.get("absorption_rate_pct")
    if abs_rate: lines.append(f"• Absorption Rate: {abs_rate}% — {'fast-moving demand' if float(abs_rate)>50 else 'balanced supply/demand'}")

    lines.append("\n💰 ENTRY PRICES — Real DLD Closed Sales")
    bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
    for br in ["Studio", "1 BR", "2 BR", "3 BR"]:
        if br in bpsm:
            line = f"• {br}: {fmt_psm(bpsm[br])}"
            if br in bmed: line += f" | Median unit: {fmt_aed(bmed[br])}"
            lines.append(line)

    if hist:
        lines.append("\n📈 CAPITAL APPRECIATION")
        years = sorted(hist.keys())
        price_parts = [f"{y}: {fmt_psm(hist[y])}" for y in years]
        lines.append(f"• {' → '.join(price_parts)}")
        if len(years) >= 2:
            old_v = hist[years[0]]; new_v = hist[years[-1]]
            chg = round(((new_v-old_v)/old_v)*100, 1) if old_v else 0
            lines.append(f"• Total: {'+' if chg>0 else ''}{chg}% over {len(years)} year(s)")

    if cats:
        lines.append("\n⚡ CATALYSTS — Price Drivers")
        for c in cats[:3]:
            lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'uplift expected'}")

    if shocks:
        lines.append("\n🛡️ DOWNSIDE RISK")
        for s in shocks[:2]:
            lines.append(f"• {s.get('event_name','')}: dropped {s.get('price_impact_pct','')}%, recovered in {s.get('recovery_months','')} months")

    if devs:
        lines.append("\n🏗️ DEVELOPER RISK")
        for d in devs[:3]:
            flag = " ⚠️ (delay risk)" if (d.get("on_time_pct") or 100) < 70 else ""
            lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★{flag}")

    lines.append("\n✅ INVESTOR DECISION")
    best_br = "Studio" if "Studio" in bmed else ("1 BR" if "1 BR" in bmed else None)
    if best_br and best_br in bmed:
        lines.append(f"• Best entry: {best_br} at {fmt_aed(bmed[best_br])} — highest yield-to-price ratio")
    if yld: lines.append(f"• Expected gross yield: {yld}% annually")
    lines.append(f"• Watch: Monitor new supply launches — oversupply can compress yields")
    if best_br and best_br in bmed:
        lines.append(f"• Bottom line: {fmt_aed(bmed[best_br])} entry on {best_br} in {area} is the strongest risk-adjusted play right now")

    lines.extend(build_rental_section(ctx))

    return "\n".join(lines)


def build_broker_reply(ctx: dict, bedrooms: str) -> str:
    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    hist  = ctx.get("price_history_by_year", {})
    cats  = ctx.get("area_catalysts", [])
    devs  = ctx.get("developer_track_records", [])
    projs = ctx.get("top_projects", [])
    lines = []

    lines.append(f"📋 AREA BRIEFING — {area}")
    score   = intel.get("investment_score"); rank    = intel.get("ranking_rank")
    verdict = intel.get("verdict");          yld     = intel.get("gross_yield_pct")
    trend   = intel.get("price_trend_pct"); avg_psm = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
    tx      = intel.get("tx_7d");           tx_delta= intel.get("tx_7d_delta_pct")
    distress= intel.get("distress_pct")

    if score or rank:
        score_str = f"Investment Score: {score}/100" if score else ""
        rank_str  = f"Ranking: #{rank} in Dubai" if rank else ""
        lines.append(f"• {' · '.join(filter(None, [score_str, rank_str]))}")
    if verdict or yld:
        verdict_str = f"Verdict: {verdict}" if verdict else ""
        yld_str     = f"Gross Yield: {yld}%" if yld else ""
        lines.append(f"• {' · '.join(filter(None, [verdict_str, yld_str]))}")
    if trend is not None or avg_psm:
        trend_str = f"Price Trend: {'+' if trend and float(trend)>0 else ''}{trend}% YoY" if trend is not None else ""
        psm_str   = f"Avg PSM: {fmt_psm(avg_psm)}" if avg_psm else ""
        lines.append(f"• {' · '.join(filter(None, [trend_str, psm_str]))}")
    if tx:
        delta_str = f" ({'+' if float(tx_delta or 0)>0 else ''}{tx_delta}% WoW)" if tx_delta else ""
        lines.append(f"• Weekly DLD Volume: {tx} transactions{delta_str}")
    if distress: lines.append(f"• Distress Sales: {distress}%")

    lines.append("\n💰 DLD TRANSACTION COMPARABLES")
    bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
    for br in ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"]:
        if br in bpsm:
            line = f"• {br}: {fmt_psm(bpsm[br])}"
            if br in bmed: line += f" | Median deal: {fmt_aed(bmed[br])}"
            lines.append(line)

    if hist:
        lines.append("\n📈 PRICE MOMENTUM — Client Talking Points")
        years = sorted(hist.keys())
        parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-3:]]
        lines.append(f"• {' → '.join(parts)}")
        if trend is not None:
            if float(trend) > 0:
                lines.append(f"• Direction: Rising +{trend}% — tell buyers: 'prices are up, this is the entry window'")
            else:
                lines.append(f"• Direction: Cooling {trend}% — tell buyers: 'good value entry, negotiate from DLD median'")

    if cats:
        lines.append("\n⚡ UPCOMING CATALYSTS — For Pitch Decks")
        for c in cats[:4]:
            lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'} — {c.get('description') or 'demand uplift expected'}")

    if devs:
        lines.append("\n🏗️ DEVELOPER DATA — For Off-Plan Pitching")
        for d in devs[:4]:
            flag = " ⚠️ Disclose delay risk to client" if (d.get("on_time_pct") or 100) < 70 else ""
            lines.append(f"• {d['developer_name']}: {d.get('on_time_pct','?')}% on-time · {d.get('star_rating','?')}★ · {d.get('total_projects','?')} projects{flag}")

    if projs:
        lines.append("\n🏙️ TOP PROJECTS BY DLD VOLUME")
        for p in projs[:5]:
            lines.append(f"• {p['name']} — {p['transactions']} DLD transactions")

    lines.append("\n✅ BROKER TALKING POINTS")
    top_med = None
    for br in ["1 BR", "Studio", "2 BR"]:
        if br in bmed: top_med = (br, bmed[br]); break
    if top_med:
        asking_est = round(float(top_med[1]) * 1.10)
        lines.append(f'• For buyer clients: "DLD median {top_med[0]} is {fmt_aed(top_med[1])} — asking prices run ~10% higher ({fmt_aed(asking_est)}), negotiate hard"')
    if trend is not None and bmed:
        direction_word = "rising" if float(trend) > 0 else "cooling"
        first_med = float(list(bmed.values())[0])
        rec_price = round(first_med * 1.06) if float(trend) > 0 else round(first_med * 1.0)
        lines.append(f'• For seller clients: "Market {direction_word} {trend}% — list at {fmt_aed(rec_price)} to attract serious buyers quickly"')
    if yld:
        diff = round(float(yld) - 6.1, 2)
        above = "above" if diff >= 0 else "below"
        lines.append(f'• For investor clients: "{yld}% gross yield — {abs(diff)}% {above} Dubai 6.1% average — strong buy-to-let case"')
    lines.append(f'• Objection "Is {area} overpriced?": DLD median is the real price — asking prices average 8–12% above actual closed sales')

    lines.extend(build_rental_section(ctx))

    return "\n".join(lines)


def build_budget_reply(ctx: dict, bedrooms: str, budget: float) -> str:
    lines = []
    target_br = bedrooms or "2 BR"
    budget_label = fmt_aed(budget)
    areas = ctx.get("budget_search_areas") or ctx.get("top_areas") or []

    lines.append("📌 DIRECT ANSWER")
    lines.append(f"• Searching for {target_br} apartments under {budget_label} — here are the best-value areas from real DLD closed sales")
    lines.append(f"• All prices below are actual DLD closed-sale transactions — not asking prices")

    # Filter and rank areas by whether their median 2BR fits the budget
    matched = []
    for a in areas:
        name  = a.get("area_name_en", "")
        score = a.get("investment_score")
        yld   = a.get("gross_yield_pct")
        psm   = a.get("truvalu_psm")
        trend = a.get("price_trend_pct")
        if name:
            matched.append((name, score, yld, psm, trend))

    lines.append(f"\n💡 BEST AREAS FOR {target_br} UNDER {budget_label}")

    shown = 0
    for name, score, yld, psm, trend in matched[:10]:
        if shown >= 5: break
        lines.append(f"\n• {name}")
        if score: lines.append(f"  — Investment Score: {score}/100" + (f" · Yield: {yld}%" if yld else ""))
        if psm:   lines.append(f"  — Avg price: {fmt_psm(psm)}")
        if trend is not None:
            direction = "Rising ↑" if float(trend) > 0 else "Cooling ↓"
            lines.append(f"  — Price Trend: {'+' if float(trend)>0 else ''}{trend}% YoY ({direction})")
        shown += 1

    lines.append(f"\n💰 YOUR BUDGET BREAKDOWN")
    lines.append(f"• Target: {target_br} under {budget_label}")
    lines.append(f"• DLD transfer fee (mandatory): {fmt_aed(budget * 0.04)} (4% of purchase price)")
    lines.append(f"• Agent fee: ~{fmt_aed(budget * 0.02)} (2% typical)")
    lines.append(f"• Minimum cash needed upfront: {fmt_aed(budget * 0.06)} (fees) + down payment if mortgaging")
    lines.append(f"• If mortgaging: 20% down = {fmt_aed(budget * 0.20)} minimum for expats")

    lines.append(f"\n📊 AREAS WITH MOST {target_br} TRANSACTIONS UNDER {budget_label}")
    lines.append(f"• Jumeirah Village Circle (JVC) — highest volume of 2BR under AED 2M")
    lines.append(f"• Dubai Sports City — affordable 2BR with strong yield")
    lines.append(f"• International City — budget entry point")
    lines.append(f"• Discovery Gardens — established community, low price point")
    lines.append(f"• Al Furjan — growing community, good value")

    lines.append(f"\n⚠️ WATCH OUT FOR")
    lines.append(f"• Service charges vary widely — confirm AED/sqft/year before signing")
    lines.append(f"• Off-plan under {budget_label} may have 5–8% post-handover price jumps — buy ready when possible")

    lines.append(f"\n✅ NEXT STEPS — Do These This Week")
    lines.append(f"• Step 1: Check JVC listings for {target_br} under {budget_label} — highest inventory in this range")
    lines.append(f"• Step 2: Get mortgage pre-approval (if financing) — UAE banks take 3–5 working days")
    lines.append(f"• Step 3: Verify the real market value of any unit you like → https://www.acqar.com/valuation")

    return "\n".join(lines)


def build_developer_ranking_reply(devs: list) -> str:
    lines = ["📌 DIRECT ANSWER"]
    lines.append(f"• Top {len(devs)} Dubai developers ranked by total registered project value — real DLD project registry data")
    lines.append("\n📊 THE DATA BEHIND IT")
    for i, d in enumerate(devs, 1):
        parts = [f"{fmt_aed(d['project_value'])} project value"]
        if d.get("unit_count"):    parts.append(f"{d['unit_count']:,} units")
        if d.get("project_count"): parts.append(f"{d['project_count']} projects")
        lines.append(f"• #{i} {d['developer_name']} — {' · '.join(parts)}")
    lines.append("\n✅ BOTTOM LINE")
    lines.append(f"• {devs[0]['developer_name']} leads by total registered project value in DLD records.")
    lines.append("• Rankings reflect registered project value/unit counts, not live sales revenue — always verify a developer's current standing via RERA/Trakheesi before committing.")
    return "\n".join(lines)



def build_developer_sales_ranking_reply(devs: list, period_label: str) -> str:
    lines = ["📌 DIRECT ANSWER"]
    lines.append(f"• Top {len(devs)} Dubai developers ranked by total sales value — real DLD transaction data, {period_label}")
    lines.append("\n📊 THE DATA BEHIND IT")
    for i, d in enumerate(devs, 1):
        lines.append(
            f"• #{i} {d['developer_name']} — {fmt_aed(d['total_sales'])} sales · "
            f"{d['deed_count']:,} transactions · avg {fmt_aed(d['avg_sale_price'])}/unit"
        )
    lines.append("\n✅ BOTTOM LINE")
    lines.append(f"• {devs[0]['developer_name']} led {period_label} by total sales value.")
    lines.append("• Coverage note: only transactions matched to a registered project in DLD's project registry are counted — some developer volume may be undercounted.")
    return "\n".join(lines)

# Any English question word, wherever it starts the sentence — covers virtually
# any way a follow-up question can be phrased, not just a fixed set of phrases.
FOLLOWUP_QUESTION_WORDS = (
    "what", "how", "can", "is", "are", "does", "do", "will", "should",
    "why", "where", "when", "who", "which", "would", "could", "did",
    "was", "were", "has", "have", "may", "shall",
)

FOLLOWUP_COMMAND_STARTERS = (
    "show me", "show", "give me", "list", "tell me", "compare",
    "break down", "breakdown", "explain", "summarize", "walk me through",
)

def is_specific_followup(message: str, history: list) -> bool:
    """True when this is a narrow follow-up question (or a short data/info
    request like 'show me X') that should get a direct answer instead of the
    full templated area report — regardless of whether it's the first message
    or a later one in the conversation."""
    m = message.strip().lower()
    is_question_mark = m.endswith("?") or m.endswith("؟")
    words = m.split()
    first_word = words[0].strip(".,!?؟") if words else ""
    is_question_word_start = first_word in FOLLOWUP_QUESTION_WORDS
    is_command_start = m.startswith(FOLLOWUP_COMMAND_STARTERS)
    is_short_request = (is_question_mark or is_question_word_start or is_command_start) \
        and len(words) <= 25
    is_fresh_intent = any(k in m for k in [
        "i want to buy", "i want to sell", "i'm looking to",
        "should i buy", "should i sell",
    ])
    return is_short_request and not is_fresh_intent


DATA_VIZ_KEYWORDS = (
    "compare", "comparison", "breakdown", "by bedroom", "each bedroom",
    "price history", "show me", "chart", "graph", "table", "over time",
    "per sqft", "per sqm", "trend", "yield by", "price by",
)

def wants_data_visual(message: str) -> bool:
    m = message.strip().lower()
    return any(k in m for k in DATA_VIZ_KEYWORDS)



SPECIFIC_ANSWER_PROMPT = """You are ACQAR Intelligence. The user already has the full area report —
do NOT repeat it. Answer ONLY the specific question below.

Rules:
- The AREA DATA FACTS JSON has a "transaction_stats" object containing
  "bedroom_avg_psm" (price per sqm, keyed by "Studio"/"1 BR"/"2 BR"/etc.) and
  "median_price_by_bedroom" (median total sale price, same keys). If the
  question asks about price by bedroom/unit size, you MUST read these two
  nested fields and list each bedroom type found there with its number —
  never say the breakdown isn't available if bedroom_avg_psm has entries.
- To convert AED/sqm to AED/sqft, divide by 10.7639.
- The AREA DATA FACTS JSON has a "developer_track_records" list — each entry
  has developer_name, on_time_pct, star_rating, total_projects, market_segment.
  If asked to compare/list developers, use ONLY the developers present in
  that list, with ONLY the numbers given there. NEVER add a developer that
  isn't in developer_track_records, and NEVER invent price ranges, project
  counts, or percentages for any developer — those fields are not provided
  and must not be fabricated. If developer_track_records is empty, say
  developer data isn't available for this area rather than making it up.
- If the question is about something the data doesn't cover (legal rules, visa
  eligibility, financing regulations, process steps, etc.), answer from accurate
  general Dubai real-estate knowledge - do not say "I don't have data," just answer it correctly.
- If the specific number the user asked for is missing from the AREA DATA
  FACTS (rent, price, yield, developer stats, catalyst info, or anything
  else), do NOT say the data isn't available and stop there. Instead, give a
  realistic estimate using general Dubai real-estate market knowledge for
  that area/bedroom type, and clearly label it as a market estimate rather
  than a verified DLD figure — e.g. "DLD doesn't have registered rent
  contracts for this area yet, but based on typical Dubai market rates, a 1BR
  in JVC usually rents for approximately AED X–Y/year." Never invent a fake
  DLD contract count, transaction count, or pretend an estimate is registered
  data — the distinction between "real DLD data" and "market estimate" must
  always be explicit in the wording.
- The AREA DATA FACTS JSON may include "user_stated_price_aed" — a price the
  user themselves listed or was quoted. If present, your answer MUST directly
  compare that price against the most relevant DLD benchmark available
  (bedroom-specific median if present in median_price_by_bedroom, otherwise
  the area-wide average — and clearly say which one you're using), give an
  explicit percentage difference, and a direct verdict (too high / fair /
  underpriced). This comparison is the most important part of the answer —
  don't bury it under general advice.
- Write in plain, everyday language — say "typical price" instead of the
  technical term "median," say "price per square meter/foot" instead of
  "psm/psf" on first use, and avoid jargon a non-expert wouldn't know.
- If you calculate or estimate any price/benchmark range in your answer, your
  final verdict (too high / fair / underpriced) MUST be logically consistent
  with where the user's stated price falls within that range. If the user's
  price falls within or below your calculated range, do NOT call it "too
  high" — say it looks fair or possibly underpriced instead. Double-check this
  before finalizing your answer.
- Keep it short: 2-5 sentences or up to 5 bullets (one bullet per bedroom type
  if listing a breakdown). No section headers, no repeated report.
- "summary" is REQUIRED and must never be empty — always give a one-sentence version of the answer there.
- Output JSON only: {"summary":"","reply":"","insight":""}
"""

def build_specific_answer(question: str, context_data: dict, bedrooms: str) -> dict:
    facts = {
        "area": context_data.get("detected_area"),
        "user_stated_price_aed": context_data.get("user_budget_aed"),
        "area_intelligence": context_data.get("area_intelligence", {}),
        "transaction_stats": context_data.get("transaction_stats", {}),
        "rental_stats": context_data.get("rental_stats", {}),
        "developer_track_records": context_data.get("developer_track_records", []),
        "area_catalysts": context_data.get("area_catalysts", []),
        "requested_bedroom_type": bedrooms,
    }
    messages = [
        {"role": "system", "content": SPECIFIC_ANSWER_PROMPT},
        {"role": "user", "content": f"AREA DATA FACTS:\n{json.dumps(facts, default=str)}\n\nQUESTION: {question}"},
    ]

    def call(model):
        resp = groq_client.chat.completions.create(
            model=model, messages=messages, temperature=0.2,
            max_tokens=500, response_format={"type": "json_object"},
        )
        return resp.choices[0].message.content.strip()

    try:
        try:    raw = call(PRIMARY_MODEL)
        except: raw = call(FALLBACK_MODEL)
        return extract_json(raw)
    except Exception as e:
        print(f"[ACQAR] specific-answer error: {e}")
        return {"summary": "", "reply": "Sorry, I hit an error answering that — could you rephrase?", "insight": ""}


def build_rental_section(ctx: dict) -> list:
    rent = ctx.get("rental_stats")
    if not rent: return []
    lines = ["\n🏠 RENTAL MARKET DATA — Real DLD Ejari Contracts"]
    if rent.get("count"): lines.append(f"• Based on {rent['count']} real rental contracts registered with DLD")
    if rent.get("avg_annual_rent"): lines.append(f"• Average annual rent: {fmt_aed(rent['avg_annual_rent'])}")
    if rent.get("median_annual_rent"): lines.append(f"• Median annual rent: {fmt_aed(rent['median_annual_rent'])}")
    for br in ["Studio", "1 BR", "2 BR", "3 BR", "4 BR", "5 BR"]:
        d = rent.get("rent_by_bedroom", {}).get(br)
        if d: lines.append(f"• {br}: Avg {fmt_aed(d['avg'])}/yr · Median {fmt_aed(d['median'])}/yr ({d['count']} contracts)")
    rtype = rent.get("rent_by_type", {})
    if rtype:
        top = sorted(rtype.items(), key=lambda x: -x[1])[:3]
        lines.append(f"• By property type: {' · '.join(f'{k}: {fmt_aed(v)}/yr' for k, v in top)}")
    vr = rent.get("new_vs_renewed", {})
    if vr: lines.append(f"• Lease mix: {' · '.join(f'{k}: {v}' for k, v in vr.items())}")
    return lines

def build_general_reply(ctx: dict, bedrooms: str) -> str:
    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    hist  = ctx.get("price_history_by_year", {})
    cats  = ctx.get("area_catalysts", [])
    lines = []

    lines.append("📌 QUICK ANSWER")
    verdict = intel.get("verdict", "BUY"); score = intel.get("investment_score")
    lines.append(f"• {area} is an active Dubai residential market with strong transaction volume")
    lines.append(f"• Verdict: {verdict}" + (f" — Investment Score {score}/100" if score else ""))

    yld = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct"); rank = intel.get("ranking_rank")
    distress = intel.get("distress_pct")
    snapshot_lines = []
    if score:   snapshot_lines.append(f"• Investment Score: {score}/100")
    if yld:     snapshot_lines.append(f"• Gross Yield: {yld}%")
    if trend is not None: snapshot_lines.append(f"• Price Trend: {'+' if float(trend)>0 else ''}{trend}% year-on-year")
    if rank:    snapshot_lines.append(f"• Dubai Ranking: #{rank}")
    if distress: snapshot_lines.append(f"• Distress Sales: {distress}%")
    if snapshot_lines:
        lines.append("\n📊 MARKET SNAPSHOT"); lines.extend(snapshot_lines)

    bpsm = stats.get("bedroom_avg_psm", {}); bmed = stats.get("median_price_by_bedroom", {})
    price_lines = []
    if stats.get("avg_price_sqm"): price_lines.append(f"• Average: {fmt_psm(stats['avg_price_sqm'])}")
    for br in ["Studio", "1 BR", "2 BR", "3 BR"]:
        if br in bpsm:
            line = f"• {br}: {fmt_psm(bpsm[br])}"
            if br in bmed: line += f" | Median: {fmt_aed(bmed[br])}"
            price_lines.append(line)
    if price_lines:
        lines.append("\n💰 PRICES"); lines.extend(price_lines)

    if hist:
        years = sorted(hist.keys())
        lines.append("\n📈 PRICE HISTORY")
        parts = [f"{y}: {fmt_psm(hist[y])}" for y in years[-4:]]
        lines.append(f"• {' → '.join(parts)}")

    if cats:
        lines.append("\n⚡ CATALYSTS")
        for c in cats[:3]:
            lines.append(f"• {c.get('name') or ''} — {c.get('expected_date') or 'upcoming'}")

    lines.append("\n✅ VERDICT")
    lines.append("• Best for: Investors and end-users looking for an established Dubai community")
    if bmed:
        best_br = list(bmed.keys())[0]
        lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
    lines.append("• Watch out for: Service charges and new supply pipeline in the area")

    lines.extend(build_rental_section(ctx))

    return "\n".join(lines)


def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
    # ── Lifestyle override ──
    lifestyle_areas = []
    for k, v in ctx.items():
        if k.startswith("lifestyle_") and isinstance(v, dict):
            name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
            if name: lifestyle_areas.append(name)
    if lifestyle_areas:
        tags = ctx.get("_lifestyle_tags", [])
        priority_tags = [t for t in tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
        tag_str = " & ".join(t.title() for t in priority_tags[:2]) if priority_tags else "your profile"
        names = " · ".join(lifestyle_areas[:3])
        return f"Top areas for {tag_str} living in Dubai: {names} — ranked by real DLD data, buyer nationality mix, school proximity, and investment score."

    # ── Budget override ──
    if ctx.get("budget_search_areas"):
        budget = ctx.get("user_budget_aed")
        br = bedrooms or "2 BR"
        budget_label = fmt_aed(budget) if budget else "your budget"
        return f"Searching for {br} apartments under {budget_label} in Dubai — top areas by value, yield, and real DLD transaction volume below."
    
    # ── Comparison override ──
    comparison_areas = []
    for k, v in ctx.items():
        if k.startswith("comparison_") and isinstance(v, dict):
            name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
            if name: comparison_areas.append(name)
    if len(comparison_areas) >= 2:
        return f"Comparing {comparison_areas[0]} vs {comparison_areas[1]} on real DLD closed-sale data — investment scores, yields, and prices side by side below."

    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
    br    = bedrooms
    bedroom_med_all = stats.get("median_price_by_bedroom", {})
    med   = (bedroom_med_all.get(br) if br else None) or stats.get("avg_worth_aed")

    if user_type == "buyer":
        if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
        return f"{area} is a well-established Dubai community suited for home buyers and families."
    elif user_type == "seller":
        if br and med:
            return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
        if bedroom_med_all:
            all_meds = sorted([v for v in bedroom_med_all.values() if v])
            return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell in {area} — DLD closed sales here range {fmt_aed(all_meds[0])} to {fmt_aed(all_meds[-1])} depending on size. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
        return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
    elif user_type == "investor":
        top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
        if top_yield:
            top = top_yield[0]
            return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
        if yld:
            diff = float(yld) - 6.1
            comp = "above" if diff > 0.05 else ("below" if diff < -0.05 else "at")
            return f"{area} offers {yld}% gross yield — {comp} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
        return f"{area} shows active transaction volume — evaluate based on your target yield threshold vs Dubai's 6.1% average."
    elif user_type == "broker":
        avg_psm = intel.get("truvalu_psm") or stats.get("avg_price_sqm")
        if avg_psm and med: return f"{area} market report: avg {fmt_psm(avg_psm)}, {br} median {fmt_aed(med)} on DLD closed sales.{' Price trend ' + str(trend) + '% YoY.' if trend is not None else ''} Use these numbers to anchor client negotiations."
        return f"Full {area} market data from DLD closed sales — use these comparables for client pitches and pricing."
    else:
        score = intel.get("investment_score"); verdict = intel.get("verdict","BUY")
        if score and med: return f"{area} scores {score}/100 for investment — {br} median is {fmt_aed(med)} on real DLD data. Verdict: {verdict}."
        return f"{area} is an active Dubai market — real DLD transaction data and market insights below."


def build_insight(user_type: str, ctx: dict, bedrooms: str) -> str:
    # ── Lifestyle override ──
    lifestyle_areas = []
    for k, v in ctx.items():
        if k.startswith("lifestyle_") and isinstance(v, dict):
            intel_sub = v.get("area_intelligence") or {}
            name  = intel_sub.get("area_name_en") or v.get("detected_area", "")
            score = intel_sub.get("investment_score")
            yld   = intel_sub.get("gross_yield_pct")
            if name and score:
                lifestyle_areas.append((name, score, yld))
    if lifestyle_areas:
        best = sorted(lifestyle_areas, key=lambda x: float(x[1] or 0), reverse=True)[0]
        name, score, yld = best
        yld_str = f" with {yld}% gross yield" if yld else ""
        return f"Start with {name} — Score {score}/100{yld_str} — visit on a weekend to check school zones and community feel before committing."

   # ── Budget override ──
    if ctx.get("budget_search_areas"):
        budget = ctx.get("user_budget_aed")
        br = bedrooms or "2 BR"
        budget_label = fmt_aed(budget) if budget else "your budget"
        return f"JVC has the highest inventory of {br} apartments under {budget_label} — verify the real market value before making any offer at acqar.com/valuation"
    
    # ── Comparison override ──
    comparison_areas = []
    for k, v in ctx.items():
        if k.startswith("comparison_") and isinstance(v, dict):
            intel_sub = v.get("area_intelligence") or {}
            name  = intel_sub.get("area_name_en") or v.get("detected_area", "")
            score = intel_sub.get("investment_score")
            yld   = intel_sub.get("gross_yield_pct")
            if name: comparison_areas.append((name, score, yld))
    if len(comparison_areas) >= 2:
        by_yield = sorted(comparison_areas, key=lambda x: float(x[2] or 0), reverse=True)
        top = by_yield[0]
        return f"{top[0]} has the stronger yield ({top[2]}%) — book a viewing there first if rental income is your priority."

    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    br    = bedrooms
    bedroom_med_all = stats.get("median_price_by_bedroom", {})
    med   = (bedroom_med_all.get(br) if br else None) or stats.get("avg_worth_aed")
    yld   = intel.get("gross_yield_pct")

    if user_type == "buyer" and med:
        asking = round(float(med) * 1.10)
        return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
    elif user_type == "seller":
        if br and med:
            list_price = round(float(med) * 1.06)
            return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
        if bedroom_med_all:
            mid_br = sorted(bedroom_med_all.keys(), key=lambda k: bedroom_med_all[k])[len(bedroom_med_all)//2]
            list_price = round(float(bedroom_med_all[mid_br]) * 1.06)
            return f"Tell us your exact unit size for a precise number — a {mid_br} in {area} would list around {fmt_aed(list_price)}."
    elif user_type == "investor":
        top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
        if top_yield:
            top = top_yield[0]
            yld_top = top.get("gross_yield_pct", 6.1)
            diff = round(float(yld_top) - 6.1, 2)
            return f"#1 pick: {top.get('area_name_en','')} at {yld_top}% yield — {'+' if diff>=0 else ''}{diff}% above Dubai average on real DLD rental data."
        if yld and med:
            annual_rent = round(float(med) * float(yld) / 100)
            return f"{area} {yld}% yield on {fmt_aed(med)} entry = approx {fmt_aed(annual_rent)}/year rental income based on DLD data."
    elif user_type == "broker" and med:
        return f"DLD median for {br} is {fmt_aed(med)} — use this as your negotiation anchor: buyers paying asking price pay ~10% above actual closed-sale market."

    if br and med:
        return f"Real DLD median for {br} in {area} is {fmt_aed(med)} — actual closed-sale price, not the asking price."
    return f"{area} has active DLD transaction volume — use the data above to make a confident, data-backed decision."


def build_charts(ctx: dict, user_type: str) -> list:
    charts = []
    stats = ctx.get("transaction_stats", {})
    hist  = ctx.get("price_history_by_year", {})
    devs  = ctx.get("developer_track_records", [])

    bpsm = stats.get("bedroom_avg_psm", {})
    if bpsm:
        charts.append({"type": "bar", "title": "Price by Bedroom (AED/sqm)",
            "data": [{"label": k, "value": int(v)} for k, v in bpsm.items() if v]})

    if hist:
        charts.append({"type": "line", "title": "Price History (AED/sqm)",
            "data": [{"label": str(y), "value": int(v)} for y, v in sorted(hist.items()) if v]})

    if user_type in ("broker", "investor") and devs:
        dev_data = [{"label": d["developer_name"], "value": int(d["on_time_pct"])} for d in devs if d.get("on_time_pct")]
        if dev_data:
            charts.append({"type": "bar", "title": "Developer On-Time Delivery %", "data": dev_data})

    top_yield = ctx.get("top_yield_areas", []) or ctx.get("top_areas", [])
    if user_type == "investor" and top_yield:
        charts = []
        charts.append({"type": "bar", "title": "Top Areas by Gross Yield (%)",
            "data": [{"label": a.get("area_name_en",""), "value": float(a.get("gross_yield_pct",0))} for a in top_yield[:8] if a.get("gross_yield_pct")]})
        charts.append({"type": "bar", "title": "Investment Score by Area",
            "data": [{"label": a.get("area_name_en",""), "value": int(a.get("investment_score",0))} for a in top_yield[:8] if a.get("investment_score")]})

    return charts


# ── CHANGE 2: Comprehensive fallback system prompt ────────────────
FALLBACK_SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's senior real estate expert with 15+ years of market knowledge.

You answer ANY question about Dubai real estate with the depth and specificity of a top-tier consultant.
When DB data is unavailable, use your expert knowledge — be confident, specific, and actionable.
DO NOT say "I don't have data" or be vague. Give real answers like Gemini or Claude would.

OUTPUT: Valid JSON only → {"summary":"...","reply":"...","charts":[],"insight":"..."}
Use \\n for line breaks. Use • for bullets. Emoji header for every section.

═══════════════════════════════
FORMAT FOR FINANCING / MORTGAGE / DOWN PAYMENT QUERIES
═══════════════════════════════

📋 DIRECT ANSWER
• [One honest sentence answering exactly what they asked]
• Key legal fact: [most important regulation they must know]

💡 YOUR OPTIONS — [X] Ways to Do This

Option 1 — [Name of scheme/approach]
• How it works: [2–3 specific sentences with real details]
• Best for: [who this suits exactly]
• The catch: [one honest downside]

Option 2 — [Name]
• How it works: [specific details]
• Best for: [who]
• The catch: [downside]

Option 3 — [Name] (if applicable)
• [same structure]

💰 YOUR REALISTIC NUMBERS
- Monthly payment capacity: AED [X]
- Estimated property budget: AED [X] – AED [X]
- Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
- Best areas in this budget: [Area 1] · [Area 2] · [Area 3] (ONLY include this
  bullet if the user's question itself asked about affordability/budget/areas —
  omit it entirely for fee, commission, process, or legal questions)

⚠️ CRITICAL WARNINGS
• [Most important legal or financial risk with specific number]
• [Second risk if applicable]

✅ NEXT STEPS — Do These This Week
• Step 1: [Specific action — name the institution/platform/developer]
• Step 2: [Specific action with timeline]
• Step 3: [Specific action]

═══════════════════════════════
FORMAT FOR PROCESS / HOW-TO QUERIES (buying steps, fees, visa, NOC, etc.)
═══════════════════════════════

📋 HOW TO [ACTION] IN DUBAI — Step by Step

Step 1 — [Action name]
• [Specific detail. Timeline or cost if known.]

Step 2 — [Action name]
• [Specific detail.]

(continue all steps, typically 5–8 steps)

💰 COST BREAKDOWN
• [Fee name]: [exact % or amount]
• [Fee name]: [exact % or amount]
• Total upfront on AED 1M property: AED [X]

📄 DOCUMENTS NEEDED
• [Document 1 — who needs it]
• [Document 2]

⚠️ COMMON MISTAKES
• [Mistake 1 people make and how to avoid it]
• [Mistake 2]

✅ KEY TAKEAWAY
• [One actionable bottom line]

═══════════════════════════════
FORMAT FOR LEGAL / OWNERSHIP / VISA QUERIES
═══════════════════════════════

📋 DIRECT ANSWER
• [Specific answer to their exact question]

📜 THE RULES — What UAE Law Says
• [Specific regulation with actual numbers/thresholds]
• [Another specific rule]

✅ WHAT TO DO
• Step 1: [action]
• Step 2: [action]
• Step 3: [action]

⚠️ WATCH OUT FOR
• [Specific risk]

═══════════════════════════════
FORMAT FOR GENERAL MARKET / TREND / OPINION QUERIES
═══════════════════════════════

📌 DIRECT ANSWER
• [Answer the question directly in one sentence]

📊 THE DATA BEHIND IT
• [Specific market fact with number]
• [Another data point]
• [Another data point]

🔍 ANALYSIS
• [What this means for the user]
• [Comparison or context]

✅ BOTTOM LINE
• [Actionable conclusion]
• [Next step if relevant]

═══════════════════════════════
RULES FOR ALL RESPONSES
═══════════════════════════════
0. Pick the template that matches what was actually asked. A question about
   commission, fees, legal process, or a named company is NOT a financing/
   mortgage/area-recommendation question — do not use the FINANCING template's
   "Best areas" bullet, and do not name specific areas (Downtown Dubai, Dubai
   Marina, Palm Jumeirah, etc.) anywhere in the answer unless the user's
   question was actually about choosing or comparing areas. Commission rates,
   RERA rules, and legal fees apply the same Dubai-wide — they have nothing to
   do with any particular neighborhood.
1. Be specific — real numbers, real developer names, real regulations
2b. If the user names a specific real estate company, brokerage, or agent and
   asks about it, do NOT fabricate facts about that specific business — you do
   not have verified, live company records (RERA status, service areas, past
   performance, size). Say plainly that you don't have verified data on that
   specific company, then give general guidance on how anyone can verify a
   Dubai real-estate company (check its RERA/DLD broker registration number,
   look it up on the DLD's Trakheesi system, check reviews). NEVER attach
   unrelated area investment scores/yields to a company-identity question —
   those numbers describe areas, not the company.
2. If budget is mentioned (salary/EMI/monthly), calculate the property budget and show the math
3. Always end with actionable next steps
4. Never write more than 2 lines per bullet
5. Never write paragraphs — always bullet points under emoji headers
6. summary: 2 sentences — direct answer + most useful number
7. insight: 1 sentence — one specific action the user can take TODAY
8. NEVER include URLs or markdown links in your reply text. Do not write [text](url) or https:// links inside reply. Area links are added automatically."""


# ─────────────────────────────────────────────────────────────────
# MAIN ENDPOINT
# ─────────────────────────────────────────────────────────────────

@router.post("/intelligence/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()

        def call_whisper():
            return groq_client.audio.transcriptions.create(
                file=(file.filename or "audio.webm", audio_bytes),
                model="whisper-large-v3",
            )

        result = await _run(call_whisper)
        return {"text": result.text.strip()}
    except Exception as e:
        print(f"[ACQAR] transcribe error: {e}")
        return {"text": "", "error": "Transcription failed"}




@router.post("/intelligence/chat")
async def intelligence_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

    user_lang, user_dir = detect_language(message)
    detection_message = message
    if user_lang != "en":
        detection_message = await _run(translate_to_english, message)
        print(f"[ACQAR] translated query: {detection_message}")
    msg_lower    = detection_message.lower()
    context_data = {}
    raw          = ""

# ── FOLLOW-UP CONTEXT CARRY ──
    if req.history:
        prior_user_msgs = [
            h.get("content", "") for h in req.history
            if h.get("role") == "user" and h.get("content")
        ]
        if prior_user_msgs:
            cur_all_areas    = get_all_area_ids(msg_lower)
            carried_area_ids = {aid for aid, _ in cur_all_areas}
            cur_bedrooms     = extract_bedrooms(detection_message)
            cur_budget       = extract_budget(detection_message)
            ROLE_KWS         = SELLER_KEYWORDS + BUYER_KEYWORDS + INVESTOR_KEYWORDS + BROKER_KEYWORDS
            cur_role_hit     = any(k in msg_lower for k in ROLE_KWS)

            carry = []
            for prev in reversed(prior_user_msgs[-4:]):
                # FIX: translate non-English history turns before scanning —
                # otherwise area/role keyword detection silently fails on them.
                prev_lang, _ = detect_language(prev)
                p_en = await _run(translate_to_english, prev) if prev_lang != "en" else prev
                p = p_en.lower()

                # FIX: use get_all_area_ids (plural) so a prior comparison
                # ("Dubai Marina vs JVC") isn't collapsed down to a single area.
                if len(carried_area_ids) < 2:
                    for aid, pkw in get_all_area_ids(p):
                        if aid not in carried_area_ids:
                            carry.append(pkw)
                            carried_area_ids.add(aid)

                if not cur_bedrooms:
                    pb = extract_bedrooms(p_en)
                    if pb:
                        carry.append(pb.lower())
                        cur_bedrooms = pb

                if not cur_budget:
                    pbud = extract_budget(p_en)
                    if pbud:
                        # FIX: serialize as "X.XX million aed" — extract_budget's
                        # own patterns reliably re-match this on re-parse, unlike
                        # a raw "aed 800000" which fails for budgets under 1M.
                        carry.append(f"{pbud/1_000_000:.2f} million aed")
                        cur_budget = pbud

                if not cur_role_hit and any(k in p for k in ROLE_KWS):
                    carry.append(p_en)
                    cur_role_hit = True

                if len(carried_area_ids) >= 2 and cur_bedrooms and cur_budget and cur_role_hit:
                    break

            if carry:
                detection_message = f"{detection_message} {' '.join(carry)}"
                msg_lower = detection_message.lower()
                print(f"[ACQAR] follow-up merged: {detection_message}")
    user_type = detect_user_type(msg_lower)

    area_id, detected_area = get_area_id(msg_lower)
    all_area_ids           = get_all_area_ids(msg_lower)
    budget                 = extract_budget(detection_message)
    bedrooms               = extract_bedrooms(detection_message)
    is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
    is_comparison          = (
        len(all_area_ids) >= 2 or
        any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
    )

    if is_vague(msg_lower, area_id, is_lifestyle):
        is_seller = any(k in msg_lower for k in SELLER_KEYWORDS)
        if is_seller:
            clar = {
                "type": "text",
                "is_clarifying": True,
                "summary": "Which area is your apartment in? I'll pull real DLD data and give you an exact listing price.",
                "reply": (
                    "To give you accurate selling data, I need one detail:\n\n"
                    "1. Which area is your apartment in? (e.g. Dubai Marina, JVC, Downtown Dubai, Business Bay)\n\n"
                    "Once I know the area, I'll pull the real DLD median price, recommended listing price, "
                    "weekly transaction volume, and tell you exactly whether to sell now or wait — with real numbers."
                ),
                "charts": [], "insight": "",
            }
            if user_lang != "en":
                clar = translate_result_texts(clar, user_lang)
            clar["language"]  = user_lang
            clar["direction"] = user_dir
            return clar
        clar = {
            "type": "text",
            "is_clarifying": True,
            "summary": "Let me get a few details to find the best match for you.",
            "reply": (
                "To give you a data-backed answer, I need a few quick details:\n\n"
                "1. What is your budget? (e.g. AED 1M–2M, AED 3M–5M, AED 5M+)\n"
                "2. Are you buying to live in, or investing for rental income?\n"
                "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
                "4. How many bedrooms do you need?\n\n"
                "Once I know these, I'll pull real DLD closed-sale data and give you a shortlist with actual numbers — not asking prices."
            ),
            "charts": [], "insight": "",
        }
        if user_lang != "en":
            clar = translate_result_texts(clar, user_lang)
        clar["language"]  = user_lang
        clar["direction"] = user_dir
        return clar

    if budget:
        context_data["user_budget_aed"]   = budget
        context_data["user_budget_label"] = f"AED {budget/1_000_000:.2f}M"
    if bedrooms:
        context_data["user_bedrooms"] = bedrooms

    if area_id and not is_comparison:
        await build_area_context_async(area_id, detected_area, context_data)
    elif is_comparison and len(all_area_ids) >= 2:
        sub_tasks = []
        for aid, kw in all_area_ids[:3]:
            sub = {}
            key = f"comparison_{preferred_name(aid, kw).replace(' ','_').lower()}"
            if key not in context_data: sub_tasks.append((key, aid, kw, sub))
        await asyncio.gather(*[build_area_context_async(aid, kw, sub) for _, aid, kw, sub in sub_tasks])
        for key, _, _, sub in sub_tasks: context_data[key] = sub
    elif is_lifestyle and not area_id:
        context_data["query_type"]      = "lifestyle"
        context_data["_lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
        lifestyle_ids = get_lifestyle_areas(msg_lower)
        subs = [{} for _ in lifestyle_ids]
        await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
        for lid, sub in zip(lifestyle_ids, subs):
            name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
            context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

    if is_developer_query(msg_lower) and not area_id and not is_comparison:
        sales_period = detect_sales_period(msg_lower)
        if sales_period:
            year, quarter = sales_period
            top_devs_sales = await _run(fetch_top_developers_by_sales, year, quarter)
            if top_devs_sales:
                context_data["top_developers_sales"] = top_devs_sales
                context_data["sales_period_label"] = f"Q{quarter} {year}"
        if not context_data.get("top_developers_sales"):
            top_devs = await _run(fetch_top_developers_by_projects)
            if top_devs: context_data["top_developers"] = top_devs

    is_financing_question = any(k in msg_lower for k in NO_DP_KEYWORDS + FINANCING_KEYWORDS)

    if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id and not is_financing_question:
        top = await _run(fetch_top_yield_areas)
        if top: context_data["top_yield_areas"] = top

    if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id and not is_financing_question:
        top = await _run(fetch_top_areas_intelligence)
        if top: context_data["top_areas"] = top

    if budget and not area_id and not is_lifestyle and not is_financing_question:
        top = await _run(fetch_top_areas_intelligence, 30)
        if top: context_data["budget_search_areas"] = top

   # Also check lifestyle sub-contexts
    _lifestyle_keys   = [k for k in context_data if k.startswith("lifestyle_")]
    _comparison_keys  = [k for k in context_data if k.startswith("comparison_")]

    has_area_data = bool(
    context_data.get("area_intelligence") or
    context_data.get("transaction_stats") or
    context_data.get("top_yield_areas") or
    context_data.get("top_areas") or
    context_data.get("budget_search_areas") or
    context_data.get("top_developers") or
    context_data.get("top_developers_sales") or
    _lifestyle_keys or
    _comparison_keys
)

    # ── CHANGE 3: If no area data, still fetch top areas for context ──
    if not has_area_data and not area_id:
        top = await _run(fetch_top_areas_intelligence, 10)
        if top:
            context_data["dubai_market_context"] = top

    seller_has_price_question = user_type == "seller" and budget and any(
        k in msg_lower for k in ["is that", "too high", "too low", "fair price", "overpaying", "overpriced", "how can i sell", "sell it"]
    )
    if has_area_data and not context_data.get("top_developers") and (is_specific_followup(detection_message, req.history) or seller_has_price_question):
        ans = build_specific_answer(detection_message, context_data, bedrooms)
        summary = (ans.get("summary") or "").strip()
        reply_text = (ans.get("reply") or "").strip()
        if not summary and reply_text:
            # LLM sometimes leaves summary blank — derive a short one from the reply
            # so the frontend never falls back to the "thinking" placeholder text.
            first_sentence = reply_text.split(". ")[0].strip()
            summary = first_sentence if len(first_sentence) <= 140 else first_sentence[:137] + "..."
        specific_charts = build_charts(context_data, user_type) if wants_data_visual(detection_message) else []
        result = {
            "type":          "structured",
            "user_type":     user_type,
            "response_mode": "specific_answer",
            "summary":       summary,
            "reply":         reply_text,
            "charts":        specific_charts,
            "insight":       ans.get("insight", ""),
        }
    elif has_area_data:
        is_multi_area = bool(_comparison_keys) or bool(_lifestyle_keys) or bool(context_data.get("budget_search_areas")) or \
                         (user_type == "investor" and bool(context_data.get("top_yield_areas") or context_data.get("top_areas")))

        if context_data.get("top_developers_sales"):
            devs = context_data["top_developers_sales"]
            period_label = context_data.get("sales_period_label", "")
            result = {
                "type":          "structured",
                "user_type":     user_type,
                "response_mode": "developer_sales_ranking",
                "summary":       f"Top {len(devs)} Dubai developers by sales value, {period_label}.",
                "reply":         build_developer_sales_ranking_reply(devs, period_label),
                "charts":        [{"type": "bar", "title": f"Total Sales by Developer ({period_label}, AED)",
                                    "data": [{"label": d["developer_name"], "value": d["total_sales"]} for d in devs]}],
                "insight":       f"{devs[0]['developer_name']} led {period_label} by sales value — verify current standing via RERA/Trakheesi.",
            }
        elif context_data.get("top_developers"):
            devs = context_data["top_developers"]
            result = {
                "type":          "structured",
                "user_type":     user_type,
                "response_mode": "developer_ranking",
                "summary":       f"Top {len(devs)} Dubai developers ranked by real DLD project value.",
                "reply":         build_developer_ranking_reply(devs),
                "charts":        [{"type": "bar", "title": "Project Value by Developer (AED)",
                                    "data": [{"label": d["developer_name"], "value": d["project_value"]} for d in devs]}],
                "insight":       f"{devs[0]['developer_name']} has the largest registered project footprint — verify current live launches before buying.",
            }
        else:
            if _comparison_keys:                              reply = build_comparison_reply(context_data, bedrooms)
            elif _lifestyle_keys:                              reply = build_lifestyle_reply(context_data, bedrooms)
            elif context_data.get("budget_search_areas"):    reply = build_budget_reply(context_data, bedrooms, budget)
            elif user_type == "buyer":                       reply = build_buyer_reply(context_data, bedrooms)
            elif user_type == "seller":                      reply = build_seller_reply(context_data, bedrooms)
            elif user_type == "investor":                    reply = build_investor_reply(context_data, bedrooms)
            elif user_type == "broker":                      reply = build_broker_reply(context_data, bedrooms)
            else:                                            reply = build_general_reply(context_data, bedrooms)

            result = {
                "type":          "structured",
                "user_type":     user_type,
                "response_mode": "multi_area" if is_multi_area else "single_area",
                "summary":       build_summary(user_type, context_data, bedrooms),
                "reply":         reply,
                "charts":        [] if _comparison_keys else build_charts(context_data, user_type),
                "insight":       build_insight(user_type, context_data, bedrooms),
            }

        if _comparison_keys:
            comparison_data = []
            for k in _comparison_keys:
                sub = context_data[k]
                intel = sub.get("area_intelligence", {})
                if intel.get("area_name_en"):
                    comparison_data.append({
                        "name": intel.get("area_name_en"),
                        "score": intel.get("investment_score"),
                        "verdict": intel.get("verdict"),
                        "yield_pct": intel.get("gross_yield_pct"),
                        "avg_psm": intel.get("truvalu_psm") or sub.get("transaction_stats", {}).get("avg_price_sqm"),
                        "price_trend": intel.get("price_trend_pct"),
                        "bedroom_avg_psm": sub.get("transaction_stats", {}).get("bedroom_avg_psm", {}),
                        "median_price_by_bedroom": sub.get("transaction_stats", {}).get("median_price_by_bedroom", {}),
                        "price_history": sub.get("price_history_by_year", {}),
                    })
            result["comparison_data"] = comparison_data
    else:
        # No area DB match — LLM answers with full expert knowledge + market context
        db_context = ""
        wants_area_recommendations = any(w in msg_lower for w in MARKET_KEYWORDS + YIELD_KEYWORDS)
        if context_data.get("dubai_market_context") and wants_area_recommendations:
            top_areas = context_data["dubai_market_context"]
            area_list = ", ".join([
                f"{a.get('area_name_en','')} (Score {a.get('investment_score','')}/100, Yield {a.get('gross_yield_pct','')}%)"
                for a in top_areas[:5] if a.get("area_name_en")
            ])
            db_context = f"\n\nACQAR Dubai Market Context (real DLD data):\nTop areas by score: {area_list}\nUse these real area names and data points where relevant in your answer."

        if budget:
            db_context += f"\n\nUser's estimated budget from message: AED {budget:,.0f}"

        messages = [{"role": "system", "content": FALLBACK_SYSTEM_PROMPT}]
        for h in (req.history or [])[-4:]:
            if h.get("role") in ("user","assistant") and h.get("content"):
                messages.append({"role": h["role"], "content": str(h["content"])})
        lang_instr = ""
        if user_lang != "en":
            lang_instr = (
                f"\n\nIMPORTANT: Write summary, reply, and insight entirely in {LANG_NAMES[user_lang]}. "
                f"Translate the section headers too, but ALWAYS keep the emoji as the first character of each header line. "
                f"Keep numbers, AED amounts, percentages, area names, developer names, and URLs in Latin script unchanged."
            )
        messages.append({
            "role": "user",
            "content": f"Question: {message}{db_context}{lang_instr}\n\nAnswer this fully and specifically. Reply with JSON only."
        })

        def call_groq(model: str) -> str:
            resp = groq_client.chat.completions.create(
                model=model, messages=messages, temperature=0.2,
                max_tokens=1800, response_format={"type": "json_object"},
            )
            return resp.choices[0].message.content.strip()

        try:
            try:    raw = await _run(call_groq, PRIMARY_MODEL)
            except: raw = await _run(call_groq, FALLBACK_MODEL)
            result = extract_json(raw)
            result["_llm_answered"] = True
            result["type"] = "structured"; result["user_type"] = user_type
            result["response_mode"] = "multi_area" if context_data.get("dubai_market_context") else "single_area"
            result.pop("data_source", None)
            # NOTE: hero area (score/verdict/yield_pct/area_intelligence) is now promoted
            # uniformly below via pick_hero_area() — no manual promotion needed here.

            # Prefer area names the LLM actually mentioned in its own reply — this
            # correctly links a genuine "top areas" answer and correctly adds NO
            # links to unrelated FAQ/company questions.
            top_fallback = (
                context_data.get("top_yield_areas") or
                context_data.get("top_areas") or
                context_data.get("dubai_market_context") or
                []
            )
            reply_text = result.get("reply", "")
            extracted_links = []
            if not is_developer_query(msg_lower):
                for area_name, area_id_val in AREA_ID_MAP.items():
                    if area_name in reply_text.lower():
                        display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
                        url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
                        if not any(l["url"] == url for l in extracted_links):
                            extracted_links.append({"name": display, "url": url})
                    if len(extracted_links) >= 8:
                        break
            if extracted_links:
                result["area_links"] = extracted_links
            elif top_fallback and any(w in msg_lower for w in MARKET_KEYWORDS + YIELD_KEYWORDS) and not is_developer_query(msg_lower):
                # Only fall back to generic top-ranked areas when the question
                # actually asked for area recommendations.
                result["area_links"] = [
                    {
                        "name": a.get("area_name_en", ""),
                        "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
                    }
                    for a in top_fallback[:8] if a.get("area_name_en")
                ]
        except Exception as e:
            print(f"[ACQAR] LLM error: {e}")
            result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}
    
   

    is_specific_answer_mode = result.get("response_mode") == "specific_answer"
    hero  = pick_hero_area(context_data)
    intel = hero["intel"]

    # Hero data taken directly from a detected area (context_data["area_intelligence"])
    # is always trustworthy — the whole report is about that area. But when hero falls
    # back to a top-ranked area from dubai_market_context/top_areas/top_yield_areas
    # (i.e. no area was actually detected in the user's message), only attach it if the
    # reply genuinely mentions that area — otherwise we're stapling unrelated area
    # stats/badges onto a question that has nothing to do with that area.
    hero_is_real_detected_area = bool(context_data.get("area_intelligence"))
    reply_check = (result.get("reply") or "").lower().replace(" ", "")
    hero_area_check = (intel.get("area_name_en") or "").lower().replace(" ", "").replace("(", "").replace(")", "")
    hero_area_relevant = hero_is_real_detected_area or (hero_area_check and hero_area_check in reply_check)

    if intel and intel.get("area_name_en") and hero_area_relevant and not is_specific_answer_mode:
        result["score"]        = intel.get("investment_score")
        result["verdict"]      = intel.get("verdict")
        result["yield_pct"]    = intel.get("gross_yield_pct")
        result["price_trend"]  = intel.get("price_trend_pct")
        result["ranking"]      = intel.get("ranking_rank")
        result["distress_pct"] = intel.get("distress_pct")
        y = intel.get("gross_yield_pct")
        if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)
        result["area_intelligence"]  = intel
        result["transaction_stats"]  = hero["stats"]
        result["area_catalysts"]     = hero["cats"]
        result["price_history"]      = hero["hist"]
        result["developer_track_records"] = context_data.get("developer_track_records", [])

# ── Area links — only areas actually in the reply ──
    reply_text = result.get("reply", "")
    reply_lower = reply_text.lower().replace(" ", "").replace("(", "").replace(")", "")

    final_links = []
    seen_urls   = set()

    if not is_developer_query(msg_lower):
      # 1. Comparison + Lifestyle areas — only those mentioned in reply
        for k in context_data:
            if k.startswith("lifestyle_") or k.startswith("comparison_"):
                sub  = context_data[k]
                if not isinstance(sub, dict): continue
                name = (sub.get("area_intelligence") or {}).get("area_name_en") or sub.get("detected_area", "")
                if not name: continue
                check = name.lower().replace(" ", "").replace("(", "").replace(")", "")
                if check in reply_lower:
                    url = f"https://www.acqar.com/areas/{area_to_slug(name)}"
                    if url not in seen_urls:
                        final_links.append({"name": name, "url": url})
                        seen_urls.add(url)

        # 2. Top yield / top areas — only if mentioned in reply
        if not final_links:
            top_yield      = context_data.get("top_yield_areas", [])
            top_areas_list = context_data.get("top_areas", [])
            top_data       = top_yield or top_areas_list or context_data.get("dubai_market_context", [])
            for a in top_data:
                name = a.get("area_name_en", "")
                if not name: continue
                check = name.lower().replace(" ", "").replace("(", "").replace(")", "")
                if check in reply_lower:
                    url = f"https://www.acqar.com/areas/{area_to_slug(name)}"
                    if url not in seen_urls:
                        final_links.append({"name": name, "url": url})
                        seen_urls.add(url)

       # 3. Single detected area fallback — skip for specific answers
        if not final_links and not is_specific_answer_mode:
            detected = context_data.get("detected_area", "")
            if detected:
                url = f"https://www.acqar.com/areas/{area_to_slug(detected)}"
                final_links.append({"name": detected, "url": url})
                seen_urls.add(url)

        # 4. LLM reply fallback — scan reply text for any known area names
        if not final_links:
            for area_name in sorted(AREA_ID_MAP, key=len, reverse=True):
                if area_name in reply_text.lower():
                    area_id_val = AREA_ID_MAP[area_name]
                    display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
                    url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
                    if url not in seen_urls:
                        final_links.append({"name": display, "url": url})
                        seen_urls.add(url)
                if len(final_links) >= 6: break

    if final_links:
        result["area_links"] = final_links[:6]
       

    detected = context_data.get("detected_area", "")
    if detected and not is_developer_query(msg_lower):
        result["area_url"] = f"https://www.acqar.com/areas/{area_to_slug(detected)}"

    print(f"[DEBUG] top_yield count: {len(context_data.get('top_yield_areas', []))}")
    print(f"[DEBUG] top_areas count: {len(context_data.get('top_areas', []))}")
    print(f"[DEBUG] dubai_market_context count: {len(context_data.get('dubai_market_context', []))}")
    print(f"[DEBUG] has_area_data: {has_area_data}")

    skip_translate = result.pop("_llm_answered", False)
    if user_lang != "en" and not skip_translate:
        result = translate_result_texts(result, user_lang)
    result["language"]  = user_lang
    result["direction"] = user_dir
    return result
    
    











