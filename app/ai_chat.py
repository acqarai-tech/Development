# import os
# import re
# import json
# import traceback
# import requests

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict

# from groq import Groq
# client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# router = APIRouter()

# SUPABASE_URL      = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY      = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# SIGNALS_API       = os.getenv("SIGNALS_API_URL", "")
# SUPABASE_CHAT_URL = os.getenv("SUPABASE_CHAT_URL", "")
# SUPABASE_CHAT_KEY = os.getenv("SUPABASE_CHAT_KEY", "")

# supabase      = create_client(SUPABASE_URL, SUPABASE_KEY)
# supabase_chat = create_client(SUPABASE_CHAT_URL, SUPABASE_CHAT_KEY) if SUPABASE_CHAT_URL else supabase

# # ─────────────────────────────────────────────────────────────────
# # MODEL CONFIG
# # Primary:  moonshotai/kimi-k2-instruct
# # Fallback: llama-3.3-70b-versatile
# # ─────────────────────────────────────────────────────────────────
# PRIMARY_MODEL  = "moonshotai/kimi-k2-instruct"
# FALLBACK_MODEL = "llama-3.3-70b-versatile"


# class ChatRequest(BaseModel):
#     message: str
#     history: list = []


# # ─────────────────────────────────────────────────────────────────
# # AREA ID MAP
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
# # FIX: PREFERRED AREA NAMES
# # Prevents "Al Khail" showing instead of "Dubai Hills Estate"
# # when multiple keywords map to same area_id
# # ─────────────────────────────────────────────────────────────────
# AREA_PREFERRED_NAMES = {
#     53:   "Dubai Hills Estate",
#     36:   "Dubai Marina",
#     59:   "Jumeirah Village Circle",
#     10:   "Downtown Dubai",
#     54:   "Business Bay",
#     12:   "Jumeirah Lake Towers",
#     133:  "Arabian Ranches",
#     410:  "Palm Jumeirah",
#     41:   "Al Furjan",
#     73:   "Jumeirah Park",
#     23:   "Jumeirah",
#     105:  "Al Barsha",
#     347:  "Jumeirah Golf Estates",
#     1509: "Dubai Creek Harbour",
#     5173: "Tilal Al Ghaf",
#     117:  "DIFC",
#     1754: "Bluewaters Island",
#     386:  "Town Square",
#     232:  "Mirdif",
#     43:   "Meydan",
#     3512: "Dubai Harbour",
#     25:   "Barsha Heights",
#     91:   "Silicon Oasis",
#     67:   "Dubai Sports City",
#     352:  "DAMAC Hills",
#     545:  "Deira",
#     345:  "Bur Dubai",
#     13:   "Discovery Gardens",
#     368:  "International City",
#     51:   "Dubailand",
#     75266:"DAMAC Lagoons",
#     16296:"Arabian Ranches 3",
#     3355: "Dubai South",
#     5178: "Dubai Islands",
#     85082:"Expo City",
#     22688:"Dubai Design District",
#     277:  "Dubai Festival City",
# }

# # ─────────────────────────────────────────────────────────────────
# # SCHOOLS DATA
# # ─────────────────────────────────────────────────────────────────
# SCHOOLS_BY_AREA = {
#     53: [
#         {"name": "GEMS Wellington Academy – Al Khail", "curriculum": "British", "rating": "Outstanding", "drive_min": 5,  "fees_range": "AED 55K–75K/yr"},
#         {"name": "Kings' School Al Barsha",             "curriculum": "British", "rating": "Outstanding", "drive_min": 8,  "fees_range": "AED 60K–85K/yr"},
#         {"name": "Dubai British School Jumeirah Park",  "curriculum": "British", "rating": "Good",        "drive_min": 15, "fees_range": "AED 45K–65K/yr"},
#         {"name": "GEMS World Academy",                  "curriculum": "IB",      "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 70K–95K/yr"},
#     ],
#     23: [
#         {"name": "Jumeirah English Speaking School (JESS)", "curriculum": "British", "rating": "Outstanding", "drive_min": 5,  "fees_range": "AED 50K–70K/yr"},
#         {"name": "Dubai College",                           "curriculum": "British", "rating": "Outstanding", "drive_min": 8,  "fees_range": "AED 65K–90K/yr"},
#         {"name": "The English College",                     "curriculum": "British", "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 55K–75K/yr"},
#     ],
#     73: [
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 3, "fees_range": "AED 45K–65K/yr"},
#         {"name": "Regent International School",        "curriculum": "British", "rating": "Good", "drive_min": 8, "fees_range": "AED 40K–55K/yr"},
#     ],
#     36: [
#         {"name": "Dubai British School Jumeirah Park",      "curriculum": "British",  "rating": "Good",        "drive_min": 12, "fees_range": "AED 45K–65K/yr"},
#         {"name": "American School of Dubai",                "curriculum": "American", "rating": "Outstanding", "drive_min": 15, "fees_range": "AED 60K–80K/yr"},
#         {"name": "Emirates International School – Meadows", "curriculum": "IB",      "rating": "Good",        "drive_min": 10, "fees_range": "AED 50K–70K/yr"},
#     ],
#     12: [
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British",    "rating": "Good",        "drive_min": 10, "fees_range": "AED 45K–65K/yr"},
#         {"name": "Regent International School",        "curriculum": "British",    "rating": "Good",        "drive_min": 6,  "fees_range": "AED 40K–55K/yr"},
#         {"name": "Nord Anglia International School",   "curriculum": "British/IB", "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 65K–90K/yr"},
#     ],
#     105: [
#         {"name": "Kings' School Al Barsha",   "curriculum": "British",  "rating": "Outstanding", "drive_min": 3, "fees_range": "AED 60K–85K/yr"},
#         {"name": "GEMS World Academy",        "curriculum": "IB",       "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 70K–95K/yr"},
#         {"name": "Dubai American Academy",    "curriculum": "American", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 55K–75K/yr"},
#     ],
#     59: [
#         {"name": "JSS International School", "curriculum": "IB/Indian", "rating": "Good", "drive_min": 5,  "fees_range": "AED 30K–50K/yr"},
#         {"name": "Sunmarke School",           "curriculum": "British",   "rating": "Good", "drive_min": 8,  "fees_range": "AED 38K–55K/yr"},
#         {"name": "Arcadia School",            "curriculum": "British",   "rating": "Good", "drive_min": 10, "fees_range": "AED 35K–48K/yr"},
#     ],
#     133: [
#         {"name": "Ranches Primary School",          "curriculum": "British", "rating": "Good",        "drive_min": 3,  "fees_range": "AED 38K–52K/yr"},
#         {"name": "GEMS Winchester School",          "curriculum": "British", "rating": "Good",        "drive_min": 8,  "fees_range": "AED 42K–58K/yr"},
#         {"name": "Fairgreen International School",  "curriculum": "IB",     "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 55K–75K/yr"},
#     ],
#     41: [
#         {"name": "The Arbor School",       "curriculum": "British/IB", "rating": "Outstanding", "drive_min": 5, "fees_range": "AED 48K–65K/yr"},
#         {"name": "GEMS Founders School",   "curriculum": "British",    "rating": "Good",        "drive_min": 8, "fees_range": "AED 38K–52K/yr"},
#     ],
#     54: [
#         {"name": "Hartland International School", "curriculum": "IB/British", "rating": "Good",        "drive_min": 10, "fees_range": "AED 55K–80K/yr"},
#         {"name": "GEMS Wellington Primary",       "curriculum": "British",    "rating": "Outstanding", "drive_min": 12, "fees_range": "AED 50K–70K/yr"},
#     ],
#     10: [
#         {"name": "Hartland International School",          "curriculum": "IB/British", "rating": "Good",        "drive_min": 12, "fees_range": "AED 55K–80K/yr"},
#         {"name": "Swiss International Scientific School",  "curriculum": "IB",         "rating": "Outstanding", "drive_min": 15, "fees_range": "AED 70K–95K/yr"},
#     ],
#     347: [
#         {"name": "Dubai British School Jumeirah Park", "curriculum": "British", "rating": "Good", "drive_min": 8,  "fees_range": "AED 45K–65K/yr"},
#         {"name": "Regent International School",        "curriculum": "British", "rating": "Good", "drive_min": 10, "fees_range": "AED 40K–55K/yr"},
#     ],
#     5173: [
#         {"name": "Fairgreen International School", "curriculum": "IB",     "rating": "Outstanding", "drive_min": 10, "fees_range": "AED 55K–75K/yr"},
#         {"name": "GEMS Winchester School",         "curriculum": "British", "rating": "Good",        "drive_min": 12, "fees_range": "AED 42K–58K/yr"},
#     ],
# }

# # ─────────────────────────────────────────────────────────────────
# # COMMUNITY PROFILES
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
#     "seller":      ["sell", "selling", "want to sell", "thinking of selling", "should i sell",
#                     "list my", "list the unit", "exit strategy", "offload", "divest",
#                     "right time to sell", "good time to sell", "when to sell", "my unit",
#                     "exit my", "cash out", "liquidate"],
#     "investor":    ["yield", "roi", "return", "invest", "rental income", "capital",
#                     "appreciation", "off plan", "off-plan", "portfolio", "buy to let",
#                     "cash flow", "passive income", "gross yield", "net yield"],
#     "buyer":       ["buy", "purchase", "apartment", "villa", "townhouse", "flat", "home",
#                     "live", "move", "relocat", "freehold", "mortgage", "own",
#                     "2br", "3br", "1br", "studio", "bedroom"],
#     "renter":      ["rent", "lease", "monthly", "annually", "per year", "per month",
#                     "furnished", "unfurnished", "short term", "long term", "tenancy"],
#     "family":      ["family", "kids", "children", "school", "british school",
#                     "british community", "safe", "quiet", "playground", "nursery",
#                     "expat community"],
#     "luxury":      ["luxury", "ultra luxury", "penthouse", "5 star", "five star",
#                     "premium", "exclusive", "high end", "palm", "difc", "downtown"],
#     "comparison":  ["compare", "vs", "versus", "difference", "better", "which is", "between"],
#     "market":      ["market", "overview", "trend", "best area", "top area", "where to",
#                     "which area", "rank", "ranking", "2024", "2025", "2026"],
#     "developer":   ["developer", "emaar", "damac", "nakheel", "meraas", "aldar",
#                     "sobha", "ellington", "tiger", "azizi", "binghatti"],
#     "price":       ["price", "cost", "how much", "psm", "per sqm", "sqft", "per sqft",
#                     "median", "average price", "transaction", "going up", "going down",
#                     "price trend", "prices up", "prices down"],
#     "visa":        ["visa", "golden visa", "residency", "uae visa", "property visa"],
#     "process":     ["how to buy", "process", "steps", "guide", "procedure", "dld",
#                     "registration", "transfer", "oqood", "noc", "foreigner", "as a foreigner"],
#     "signal":      ["signal", "alert", "news", "launch", "regulation", "rera", "law"],
# }

# def detect_intent(msg_lower: str) -> list:
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

# def get_all_area_ids(msg_lower: str) -> list:
#     """Return all area_ids mentioned in message (for comparison queries)."""
#     found = []
#     seen  = set()
#     for keyword, area_id in sorted(AREA_ID_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower and area_id not in seen:
#             found.append((area_id, keyword))
#             seen.add(area_id)
#     return found

# def get_lifestyle_areas(msg_lower: str) -> list:
#     area_scores = defaultdict(int)
#     for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             for rank, aid in enumerate(area_ids):
#                 area_scores[aid] += (5 - rank)
#     return sorted(area_scores.keys(), key=lambda x: -area_scores[x])[:3]

# def extract_budget(msg: str) -> float | None:
#     msg_clean = msg.lower().replace(",", "").replace("aed", "")
#     patterns  = [
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
#     msg_lower = msg.lower()
#     patterns  = [
#         (r'\bstudio\b',              "Studio"),
#         (r'\b1\s*(?:br|bed|bedroom)\b', "1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b', "2 BR"),
#         (r'\b3\s*(?:br|bed|bedroom)\b', "3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b', "4 BR"),
#         (r'\bone\s*bedroom\b',       "1 BR"),
#         (r'\btwo\s*bedroom\b',       "2 BR"),
#         (r'\bthree\s*bedroom\b',     "3 BR"),
#     ]
#     for pat, label in patterns:
#         if re.search(pat, msg_lower):
#             return label
#     return None

# def extract_building_name(msg: str) -> str | None:
#     patterns = [
#         r'(?:in|at|building|tower|residence|residences|place)\s+([A-Z][A-Za-z0-9\s\-]+?)(?:\s*,|\s*\.|$)',
#         r'([A-Z][A-Za-z0-9\s\-]+(?:Tower|Towers|Residence|Residences|Heights|Place|Park|View|Bay|Marina|Court|House|Building))',
#     ]
#     for pat in patterns:
#         m = re.search(pat, msg)
#         if m:
#             candidate = m.group(1).strip()
#             if len(candidate) > 3:
#                 return candidate
#     return None

# def preferred_name(area_id: int, fallback: str = "") -> str:
#     """Return the canonical display name for an area_id."""
#     return AREA_PREFERRED_NAMES.get(area_id, fallback or str(area_id))


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

# BEDROOM_OUTLIER_FILTERS = {
#     "Studio": (3_000_000,  80,  150_000),
#     "1 BR":   (6_000_000, 120,  250_000),
#     "2 BR":   (12_000_000, 200, 400_000),
#     "3 BR":   (25_000_000, 350, 600_000),
#     "4 BR":   (50_000_000, 600, 800_000),
# }

# def is_outlier(label: str, worth: float, area_sqm: float) -> bool:
#     if label not in BEDROOM_OUTLIER_FILTERS:
#         return False
#     max_worth, max_sqm, min_worth = BEDROOM_OUTLIER_FILTERS[label]
#     if worth < min_worth or worth > max_worth:
#         return True
#     if area_sqm and area_sqm > max_sqm:
#         return True
#     return False

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
#             "rooms_en, property_type_en, sale_year, sale_month, instance_date, "
#             "project_name_en, "
#             "comp3m_area_median_ppsqm, comp6m_area_median_ppsqm, comp12m_area_median_ppsqm, "
#             "comp3m_project_median_ppsqm, comp6m_project_median_ppsqm, comp12m_project_median_ppsqm"
#         ).eq("area_id", area_id).order("instance_date", desc=True).limit(500).execute()
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

# def fetch_building_comps(area_id: int, building_name: str):
#     try:
#         res = supabase_chat.table("avm").select(
#             "project_name_en, price_per_sqm, actual_worth, procedure_area, "
#             "rooms_en, instance_date, sale_year, sale_month"
#         ).eq("area_id", area_id).ilike(
#             "project_name_en", f"%{building_name}%"
#         ).order("instance_date", desc=True).limit(50).execute()
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
# # PRICE MOMENTUM
# # ─────────────────────────────────────────────────────────────────
# def compute_price_momentum(history: list) -> dict:
#     if not history:
#         return {}

#     result = {}
#     valid  = [r for r in history if r.get("psf")]

#     recent_18 = history[-18:]
#     result["monthly_last_18"] = [
#         {"period": f"{r['sale_year']}-{str(r['sale_month']).zfill(2)}", "psf": r["psf"], "transactions": r.get("cnt", 0)}
#         for r in recent_18 if r.get("psf")
#     ]

#     if len(valid) >= 6:
#         recent_3   = [r["psf"] for r in valid[-3:]]
#         prior_3    = [r["psf"] for r in valid[-6:-3]]
#         recent_avg = sum(recent_3) / len(recent_3)
#         prior_avg  = sum(prior_3)  / len(prior_3)
#         change     = recent_avg - prior_avg
#         pct_change = round((change / prior_avg) * 100, 1) if prior_avg else 0

#         if pct_change > 1.5:
#             direction     = "rising"
#             interpretation = (
#                 f"Prices have risen {pct_change}% in the last 3 months "
#                 f"(AED {round(prior_avg):,} to AED {round(recent_avg):,}/sqft) — "
#                 "seller has momentum, listing now captures the upswing."
#             )
#         elif pct_change < -1.5:
#             direction     = "cooling"
#             interpretation = (
#                 f"Prices have softened {abs(pct_change)}% from recent highs "
#                 f"(AED {round(prior_avg):,} to AED {round(recent_avg):,}/sqft) — "
#                 "sellers should list in the next 60 days before further cooling."
#             )
#         else:
#             direction     = "flat"
#             interpretation = (
#                 f"Prices are holding steady at AED {round(recent_avg):,}/sqft "
#                 f"(change of {pct_change}% over 3 months) — "
#                 "list now to capture current pricing; no catalyst expected to push significantly higher near-term."
#             )

#         result["momentum_signal"] = {
#             "direction":         direction,
#             "recent_3m_avg_psf": round(recent_avg, 0),
#             "prior_3m_avg_psf":  round(prior_avg, 0),
#             "change_psf":        round(change, 0),
#             "change_pct":        pct_change,
#             "interpretation":    interpretation,
#         }

#     if valid:
#         peak          = max(valid, key=lambda x: x["psf"])
#         latest_psf    = valid[-1]["psf"]
#         pct_from_peak = round(((latest_psf - peak["psf"]) / peak["psf"]) * 100, 1)
#         peak_period   = f"{peak['sale_year']}-{str(peak['sale_month']).zfill(2)}"

#         result["peak_data"] = {
#             "period":         peak_period,
#             "psf":            peak["psf"],
#             "pct_from_peak":  pct_from_peak,
#             "interpretation": (
#                 "At or within 3% of the all-time peak — strong seller position."
#                 if pct_from_peak >= -3
#                 else f"Currently {abs(pct_from_peak)}% below the peak of AED {peak['psf']:,}/sqft in {peak_period}."
#             ),
#         }

#     if len(valid) >= 15:
#         yoy_recent = [r["psf"] for r in valid[-3:]]
#         yoy_prior  = [r["psf"] for r in valid[-15:-12]]
#         if yoy_recent and yoy_prior:
#             yoy_r   = sum(yoy_recent) / len(yoy_recent)
#             yoy_p   = sum(yoy_prior)  / len(yoy_prior)
#             yoy_pct = round(((yoy_r - yoy_p) / yoy_p) * 100, 1)
#             result["yoy_change_pct"]         = yoy_pct
#             result["yoy_recent_3m_avg_psf"]  = round(yoy_r, 0)
#             result["yoy_prior_year_avg_psf"] = round(yoy_p, 0)

#     monthly = result.get("monthly_last_18", [])
#     if len(monthly) >= 4:
#         recent_vols    = [m["transactions"] for m in monthly[-3:] if m.get("transactions")]
#         peak_vol_month = max(monthly, key=lambda x: x.get("transactions") or 0)
#         peak_vol       = peak_vol_month.get("transactions", 0)
#         if recent_vols and peak_vol:
#             recent_avg_vol = round(sum(recent_vols) / len(recent_vols))
#             if recent_avg_vol < peak_vol * 0.4:
#                 sig = (
#                     f"Transaction volume has thinned significantly — peak was {peak_vol} sales "
#                     f"in {peak_vol_month['period']}, recently averaging ~{recent_avg_vol}/month. "
#                     "Buyers have more choice; expect negotiation."
#                 )
#             elif recent_avg_vol >= peak_vol * 0.7:
#                 sig = (
#                     f"Transaction volume is healthy at ~{recent_avg_vol} sales/month "
#                     f"(peak: {peak_vol} in {peak_vol_month['period']}). Active buyer demand."
#                 )
#             else:
#                 sig = (
#                     f"Moderate activity at ~{recent_avg_vol} sales/month "
#                     f"(peak was {peak_vol} in {peak_vol_month['period']}). Standard negotiation expected."
#                 )
#             result["volume_signal"] = {
#                 "recent_avg_monthly": recent_avg_vol,
#                 "peak_month":         peak_vol_month["period"],
#                 "peak_transactions":  peak_vol,
#                 "signal":             sig,
#             }

#     return result


# # ─────────────────────────────────────────────────────────────────
# # COMP TREND
# # ─────────────────────────────────────────────────────────────────
# def compute_comp_trend(area_data: list) -> dict:
#     recent = [
#         r for r in area_data
#         if r.get("comp3m_area_median_ppsqm")
#         and r.get("comp6m_area_median_ppsqm")
#         and r.get("comp12m_area_median_ppsqm")
#     ][:50]
#     if not recent:
#         return {}

#     def safe_avg(lst, key):
#         vals = [float(r[key]) for r in lst if r.get(key)]
#         return round(sum(vals) / len(vals), 0) if vals else None

#     psm_3m  = safe_avg(recent, "comp3m_area_median_ppsqm")
#     psm_6m  = safe_avg(recent, "comp6m_area_median_ppsqm")
#     psm_12m = safe_avg(recent, "comp12m_area_median_ppsqm")
#     result  = {"psm_3m_median": psm_3m, "psm_6m_median": psm_6m, "psm_12m_median": psm_12m}

#     if psm_3m and psm_12m:
#         pct = round(((psm_3m - psm_12m) / psm_12m) * 100, 1)
#         result["3m_vs_12m_pct"]   = pct
#         result["trend_direction"] = "up" if pct > 1 else "down" if pct < -1 else "flat"
#     if psm_3m and psm_6m:
#         result["3m_vs_6m_pct"] = round(((psm_3m - psm_6m) / psm_6m) * 100, 1)

#     return result


# # ─────────────────────────────────────────────────────────────────
# # BUILD AREA DETAIL
# # ─────────────────────────────────────────────────────────────────
# def build_area_detail(area_id: int, area_name: str, intel: dict = None) -> dict:
#     # Always use preferred name
#     display_name = (intel.get("area_name_en") if intel else None) or preferred_name(area_id, area_name)
#     stats     = fetch_area_stats(area_id)
#     catalysts = fetch_area_catalysts(area_id)
#     history   = fetch_price_history(area_id)

#     detail = {"area_name": display_name, "area_id": area_id}

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
#             label    = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             worth    = float(r["actual_worth"])   if r.get("actual_worth")   else 0
#             area_sqm = float(r["procedure_area"]) if r.get("procedure_area") else 0
#             if label and not is_outlier(label, worth, area_sqm):
#                 if r.get("price_per_sqm"):
#                     room_map[label].append(float(r["price_per_sqm"]))
#                 if worth:
#                     worth_map[label].append(worth)

#         detail["avg_psm"]                      = round(sum(prices) / len(prices), 0) if prices else None
#         detail["bedroom_avg_psm"]              = {k: round(sum(v) / len(v), 0) for k, v in room_map.items()}
#         detail["median_total_price_by_bedroom"] = {k: median_millions(v) for k, v in worth_map.items()}
#         detail["transaction_count"]            = len(stats)

#         comp = compute_comp_trend(stats)
#         if comp:
#             detail["comp_trend"] = comp

#     if history:
#         momentum = compute_price_momentum(history)
#         if momentum:
#             detail["price_momentum"] = momentum

#     if catalysts:
#         detail["catalysts"] = [
#             {"name": c["name"], "type": c.get("catalyst_type"),
#              "confidence": c.get("confidence"), "date": c.get("expected_date")}
#             for c in catalysts[:3]
#         ]

#     if area_id in COMMUNITY_PROFILES:
#         detail["community_profile"] = COMMUNITY_PROFILES[area_id]
#     if area_id in SCHOOLS_BY_AREA:
#         detail["nearby_schools"] = SCHOOLS_BY_AREA[area_id]

#     return detail


# # ─────────────────────────────────────────────────────────────────
# # CLARIFYING QUESTIONS
# # ─────────────────────────────────────────────────────────────────
# CLARIFYING_QUESTIONS = {
#     "type":          "clarify",
#     "is_clarifying": True,
#     "charts":        [],
#     "insight":       "",
#     "reply": (
#         "Happy to help you find the right property in Dubai! A few quick questions:\n\n"
#         "1. What is your budget? (e.g. AED 1M–2M, AED 2M–5M, AED 5M+)\n"
#         "2. Are you buying to live in, or investing for rental income?\n"
#         "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
#         "4. How many bedrooms do you need?\n\n"
#         "Once I have these, I'll search our 365,000+ real DLD closed-sale transactions and give you a data-backed shortlist."
#     ),
# }

# def is_vague_query(msg_lower: str, area_id, is_lifestyle: bool, intents: list) -> bool:
#     if area_id or is_lifestyle:
#         return False
#     if any(i in intents for i in ["seller", "investor", "renter", "family", "luxury",
#                                    "comparison", "market", "developer", "price",
#                                    "visa", "process", "signal"]):
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
# # SYSTEM PROMPT  v4
# # Fixes applied:
# #   1. RULE 6 — NO markdown syntax (##, **, *, _)
# #   2. RULE 7 — No Emirates ID error in process
# #   3. Comparison: mandates ✅ WINNER, forbids dual "Buy" verdict
# #   4. Process: full 8-step buying guide hardcoded
# #   5. Price/trend: community section suppressed via user_intent flag
# #   6. Area name always from area_name in context (not keyword)
# # ─────────────────────────────────────────────────────────────────
# SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's most data-driven real estate AI.
# You have exclusive access to 365,000+ real DLD closed-sale transactions (not asking prices), monthly price history, investment scores, developer track records, catalyst timelines, community profiles, and school data.

# ══════════════════════════════════════════════════
# OUTPUT RULES — READ ALL BEFORE WRITING
# ══════════════════════════════════════════════════

# RULE 1 — NEVER output square bracket text.
# Text like [rising/cooling/flat] or [show data here] are private notes. Never copy them into output.

# RULE 2 — NO MARKDOWN SYNTAX.
# Never use ##, **, *, or _ for formatting. No bullet points using * or -.
# Use emoji headers only: 📈 PRICE MOMENTUM, 💰 WHAT YOUR UNIT IS LIKELY WORTH, etc.
# Bullet points use • only. Section titles have no ## prefix — just the emoji and title.

# RULE 3 — INTENT FIRST.
# Read user_intent in context_data. Then select the matching format below.
# SELLER   → timing, momentum, price range, volume. No schools. No community.
# BUYER    → budget match, areas, DLD prices by bedroom.
# INVESTOR → yield, score, trend, developer risk, ROI.
# FAMILY   → schools first, community second, prices third.
# RENTER   → rental ranges, supply, stock levels.
# PRICE/TREND → direction clearly stated, monthly trend, YoY, peak. No community section.
# COMPARISON → table + mandatory ✅ WINNER line with specific numbers.
# PROCESS/VISA → full numbered steps, exact fees, no hedging.

# RULE 4 — DATA ONLY.
# Only use numbers from context_data. Never invent figures.
# For trend: use price_momentum.momentum_signal.direction and interpretation — pre-computed from real monthly data.
# Do NOT compute trend from area_intelligence.price_trend_pct alone.
# If momentum is "cooling" but yoy positive: report both facts.

# RULE 5 — DLD EDGE ONCE.
# Write "These are real DLD closed-sale prices, not asking prices." exactly once per response.

# RULE 6 — BE DECISIVE. NO HEDGE LANGUAGE.
# Timing verdict: choose one — Sell now / List in next 60 days / Wait X months.
# Comparison winner: one area wins. Never mark both as "Buy" in the Verdict row.
# Never use "could", "might", "may" in a verdict sentence.

# RULE 7 — PROCESS ACCURACY.
# For overseas/non-resident buyers: passport only required. No Emirates ID.
# Emirates ID is only needed if the buyer is already a UAE resident.

# RESPOND with valid JSON only. No text outside JSON. No markdown fences.
# {
#   "summary": "2-3 sentences. Direct answer first. Never start with Based on / I found / Sure / According to.",
#   "reply": "Structured using emoji headers. No ## prefix. No markdown. Bullet points use • only.",
#   "charts": [],
#   "insight": "One sentence with a specific number, actionable today."
# }

# ══════════════════════════════════════════════════
# RESPONSE FORMATS
# ══════════════════════════════════════════════════

# ━━ SELLER QUERY ━━
# One direct sentence first. Example:
# Business Bay prices are up 5% year-on-year but have softened 3% from the January 2026 peak — listing in the next 60 days captures near-peak pricing.

# 📈 PRICE MOMENTUM
# Copy price_momentum.momentum_signal.interpretation verbatim.
# Year-on-year: state yoy_change_pct% vs same period last year.
# Peak: state peak_data.period, peak_data.psf AED/sqft, peak_data.interpretation.

# 💰 WHAT YOUR UNIT IS LIKELY WORTH
# Use transaction_stats.median_total_price_by_bedroom and bedroom_avg_psm. Real DLD closed-sale prices.
# Example:
# • 1 BR: AED 2.1M median · AED 25,500/sqm
# • 2 BR: AED 3.2M median · AED 24,100/sqm
# If comp_trend available, add: Comparable sales trend: AED X,XXX/sqm (3m) vs AED X,XXX/sqm (6m) vs AED X,XXX/sqm (12m).

# 📊 MARKET VOLUME
# Copy price_momentum.volume_signal.signal verbatim.

# ⏱️ TIMING VERDICT
# State: Sell now / List in the next 60 days / Wait X months for [specific reason].
# One specific number-backed reason. No hedge language.

# 💡 GET YOUR EXACT UNIT VALUATION
# Tell me your building name, size in sqft, bedrooms, and floor/view — I will pull actual DLD comparable sales for your specific building.

# ━━ PRICE / TREND QUERY ━━
# One direct sentence first. Example:
# Downtown Dubai is up 3.2% year-on-year; prices have been flat for the past 3 months at AED 43,600/sqm.
# Note: For PRICE/TREND queries, skip community and schools entirely.

# 📈 PRICE TREND
# State yoy_change_pct and momentum_signal.direction from price_momentum.
# Highlight 2-3 key turning points from monthly_last_18. State peak period and distance.

# 📊 TRANSACTION SNAPSHOT
# Avg PSM, range, bedroom medians from transaction_stats. Volume from volume_signal.

# ✅ WHAT THIS MEANS
# One line: buyer negotiating leverage / seller timing / investor entry signal.

# ━━ SPECIFIC AREA REPORT ━━
# 1-2 sentence opener on what makes this area distinctive right now.

# 📊 INVESTMENT SNAPSHOT
# Score: XX/100 · Verdict: BUY/HOLD/WATCH · Yield: X.X% · Trend: +X.X% · Rank: #X · Distress: X%

# 💰 TRANSACTION PRICES (Real DLD Closed Sales)
# Avg PSM: AED X,XXX · Range: AED X,XXX–X,XXX
# Studio: AED X.XM · 1 BR: AED X.XM · 2 BR: AED X.XM · 3 BR: AED X.XM

# 📈 PRICE TREND
# Use momentum_signal and peak_data. Show 2-3 key data points. State YoY and direction.

# 🏗️ DEVELOPERS
# Name · on-time X% · X★ · avg delay X months
# Add ⚠️ DELAY RISK if on_time_pct < 70.

# ⚡ WHAT'S COMING
# Catalysts with date, confidence, expected impact.

# 🛡️ RESILIENCE
# Past shocks and recovery from historical_shock_resilience.

# 🏡 COMMUNITY
# Use community_profile.vibe, dominant_expats, amenities. Never invent.

# 🏫 SCHOOLS NEARBY
# From nearby_schools only. Format: Name · curriculum · rating · X min · fees.

# ✅ VERDICT
# BUY/HOLD/WATCH + 2-3 number-backed reasons.

# ━━ LIFESTYLE / FAMILY ━━
# 🏆 TOP PICK: [use area_name from context_data, not the search keyword]
# 2 sentences on why #1.
# Schools from nearby_schools: Name · rating · X min drive · fees.
# Community from community_profile: vibe, dominant_expats, key amenities.

# 💰 Real Transaction Prices (DLD Closed Sales)
# Bedroom · Median Price · Price/sqm

# 🏙️ OTHER STRONG OPTIONS
# Area 2 — 1 line why + key price
# Area 3 — 1 line why + key price

# Quick comparison: Area | Community | Schools | Downtown drive | Median price

# 💡 ACQAR DATA EDGE
# One specific DLD insight.

# ━━ COMPARISON ━━
# One sentence on what fundamentally separates the two areas.

# 📊 HEAD TO HEAD: [Area A] vs [Area B]
# Use this exact table layout (no ## prefix, no markdown):
# Metric | [Area A] | [Area B]
# Investment Score | XX/100 | XX/100
# Gross Yield | X.X% | X.X%
# Avg PSM | AED X,XXX | AED X,XXX
# Price Trend | +X.X% | +X.X%
# Momentum | rising/flat/cooling | rising/flat/cooling
# Community Fit | [type] | [type]
# Verdict | [one word] | [one word]

# MANDATORY — always end with this line after the table:
# ✅ WINNER: [Area Name] — [one specific reason with a number]. Example: ✅ WINNER: Business Bay — AED 5,110/sqm cheaper entry point and 0.3% higher yield, making it the stronger buy for ROI-focused investors.
# Never mark both areas as "Buy" in the Verdict row. One must be Buy, the other Hold or Watch.

# ━━ INVESTOR / YIELD ━━
# Market context opener.

# 🏆 TOP AREAS BY YIELD
# Area — X.X% yield · Score XX/100 · 1 line reason
# (ranked top 5)

# 📊 Yield comparison: Area | Yield | Score | Trend | Verdict

# ✅ BEST BET: Area — reason with numbers.

# ━━ BUDGET / BEDROOM SEARCH ━━
# Opener: what AED X buys in Dubai based on DLD data.

# 🏙️ AREA NAME — fits budget / above budget
# Key selling point. Bedroom median. Yield. Score.
# Add ⚠️ ABOVE BUDGET if median > user budget.
# (Repeat for 3 areas)

# 📊 Side by side: Area | Median | vs Budget | Yield | Score

# ━━ PROCESS / HOW-TO (BUYING) ━━
# Answer with all 8 steps. Exact fees. No hedging. No Emirates ID as universal requirement.

# 1. Agree price and sign MOU (Memorandum of Understanding / Form F). Buyer pays 10% deposit cheque held by agent.
# 2. Buyer applies for NOC (No Objection Certificate) from the developer. Cost: AED 500–5,000. Timeline: 5–7 working days.
# 3. If buying with a mortgage: bank valuation required first. Add 2–3 weeks. Expats need 20–25% down payment; UAE nationals 15%.
# 4. Both buyer and seller visit a DLD Trustee Office on the agreed transfer date.
# 5. Buyer pays DLD registration fee: 4% of purchase price + AED 4,000 admin fee.
# 6. Buyer pays agency commission: 2% of purchase price to the agent.
# 7. Title deed issued same day at the trustee office in the buyer's name.
# 8. Visa: AED 750K+ investment = 2-year property residency visa. AED 2M+ = 10-year Golden Visa.

# Documents required:
# • Passport copy (all buyers — resident or non-resident)
# • Emirates ID (UAE residents only — not required for overseas buyers)
# • Proof of funds or mortgage pre-approval

# End with: Ask me which areas match your budget and goals and I will pull the DLD data.

# ━━ PROCESS / VISA ━━
# Explain the Golden Visa property route fully:
# AED 750K minimum investment → 2-year property visa
# AED 2M minimum investment (must be ready property, not off-plan) → 10-year Golden Visa
# Steps: purchase → title deed → apply at ICP (Federal Authority for Identity and Citizenship) → biometrics → visa issued within 30 days.
# No income tax on rental income in Dubai. No capital gains tax.

# ━━ DEVELOPER QUERY ━━
# Use developer_track_records if in context.
# Show: on_time_pct, avg_delay_months, star_rating, total_projects.
# If not in DB: answer from knowledge, note as market knowledge not ACQAR-verified.

# ━━ GENERAL MARKET / NEWS ━━
# Answer directly with available data and live_signals if present.
# End with a relevant follow-up offer.

# ══════════════════════════════════════════════════
# CHART RULES
# ══════════════════════════════════════════════════
# Only real numbers from context_data. No invented values.
# monthly_last_18 from price_momentum → line chart "Monthly Price Trend (AED/sqft)"
# bedroom_avg_psm from transaction_stats → bar chart "Price by Bedroom (AED/sqm)"
# comp_trend psm values → bar chart "Price Momentum (3m / 6m / 12m median AED/sqm)"
# developer on_time_pct → bar chart "Developer On-Time Delivery %"
# No real data → remove chart from array entirely.

# ══════════════════════════════════════════════════
# LENGTH RULES
# ══════════════════════════════════════════════════
# Seller/price queries: momentum and timing only. No schools or community.
# Family queries: schools and community first. Investment secondary.
# Never pad. Max 900 words in reply.
# insight: one sentence, specific number, actionable today.
# """


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────
# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower     = message.lower()
#     context_data  = {}
#     raw           = ""

#     # ── Step 1: Detect area(s), intent, lifestyle, budget, bedrooms, building ──
#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)   # for comparison
#     intents                = detect_intent(msg_lower)
#     budget                 = extract_budget(message)
#     bedrooms               = extract_bedrooms(message)
#     building_name          = extract_building_name(message)

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

#     # ── Step 2: Vague check ──
#     if is_vague_query(msg_lower, area_id, is_lifestyle_query, intents):
#         return CLARIFYING_QUESTIONS

#     # ── Step 3: Core intent flags ──
#     if budget:
#         context_data["user_budget_aed"]   = budget
#         context_data["user_budget_label"] = f"AED {budget/1_000_000:.1f}M"
#     if bedrooms:
#         context_data["user_bedrooms"] = bedrooms
#     if intents:
#         context_data["detected_intents"] = intents[:3]

#     is_seller     = "seller"     in intents
#     is_comparison = "comparison" in intents or len(all_area_ids) >= 2
#     is_price_only = (
#         "price" in intents
#         and not is_seller
#         and not is_lifestyle_query
#         and not is_comparison
#     )
#     is_process    = "process" in intents or "visa" in intents

#     # Set user_intent so LLM picks the right format
#     if is_seller:
#         context_data["user_intent"] = (
#             "SELLER — user wants to sell their unit. "
#             "Focus on: price momentum, timing verdict, realistic price range, volume trend. "
#             "Do NOT include schools, community profile, or off-plan developer details."
#         )
#     elif is_price_only:
#         context_data["user_intent"] = (
#             "PRICE/TREND — user wants to know if prices are up or down. "
#             "Show direction, YoY, momentum, transaction snapshot. "
#             "Do NOT include community profile, schools, or developer sections."
#         )
#     elif is_comparison:
#         context_data["user_intent"] = (
#             "COMPARISON — user wants to compare two areas. "
#             "Use HEAD TO HEAD table format. "
#             "End with a mandatory ✅ WINNER line. Never mark both as Buy."
#         )
#     elif is_process:
#         context_data["user_intent"] = (
#             "PROCESS/VISA — user wants to know how to buy or about visas. "
#             "Use the full 8-step buying guide. Include exact fees. "
#             "Emirates ID is only required for UAE residents, not overseas buyers."
#         )

#     # ── Step 4: Single named area — full deep report ──
#     if area_id:
#         # Use preferred display name
#         display_name = preferred_name(area_id, detected_area)
#         context_data["detected_area"]        = display_name
#         context_data["detected_area_id"]     = area_id

#         intel = fetch_area_intelligence(area_id)
#         if intel:
#             # Override with DB name if available
#             if intel.get("area_name_en"):
#                 context_data["detected_area"] = intel["area_name_en"]
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
#             worths    = [float(r["actual_worth"])   for r in area_data if r.get("actual_worth")]
#             room_map  = defaultdict(list)
#             worth_map = defaultdict(list)

#             for r in area_data:
#                 label    = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#                 worth    = float(r["actual_worth"])   if r.get("actual_worth")   else 0
#                 area_sqm = float(r["procedure_area"]) if r.get("procedure_area") else 0
#                 if label and not is_outlier(label, worth, area_sqm):
#                     if r.get("price_per_sqm"):
#                         room_map[label].append(float(r["price_per_sqm"]))
#                     if worth:
#                         worth_map[label].append(worth)

#             context_data["transaction_stats"] = {
#                 "count":                         len(area_data),
#                 "avg_price_sqm":                 round(sum(prices) / len(prices), 0) if prices else None,
#                 "min_price_sqm":                 round(min(prices), 0) if prices else None,
#                 "max_price_sqm":                 round(max(prices), 0) if prices else None,
#                 "avg_worth_aed":                 round(sum(worths) / len(worths), 0) if worths else None,
#                 "bedroom_avg_psm":               {k: round(sum(v) / len(v), 0) for k, v in room_map.items()},
#                 "median_total_price_by_bedroom": {k: median_millions(v) for k, v in worth_map.items()},
#             }

#             comp_trend = compute_comp_trend(area_data)
#             if comp_trend:
#                 context_data["comp_trend"] = comp_trend

#         history = fetch_price_history(area_id)
#         if history:
#             momentum = compute_price_momentum(history)
#             if momentum:
#                 context_data["price_momentum"] = momentum

#         catalysts = fetch_area_catalysts(area_id)
#         if catalysts:
#             context_data["area_catalysts"] = catalysts

#         projects = fetch_dld_projects(area_id)
#         if projects:
#             context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]

#         if area_id in COMMUNITY_PROFILES:
#             context_data["community_profile"] = COMMUNITY_PROFILES[area_id]
#         if area_id in SCHOOLS_BY_AREA:
#             context_data["nearby_schools"] = SCHOOLS_BY_AREA[area_id]

#         # Building comps for sellers
#         if is_seller and building_name:
#             building_comps = fetch_building_comps(area_id, building_name)
#             if building_comps:
#                 b_prices = [float(r["price_per_sqm"]) for r in building_comps if r.get("price_per_sqm")]
#                 b_worths = [float(r["actual_worth"])   for r in building_comps if r.get("actual_worth")]
#                 context_data["building_comps"] = {
#                     "building_name":     building_name,
#                     "transaction_count": len(building_comps),
#                     "avg_psm":           round(sum(b_prices) / len(b_prices), 0) if b_prices else None,
#                     "median_worth_aed":  median_millions(b_worths),
#                     "recent_sales":      building_comps[:5],
#                 }
#             else:
#                 context_data["building_not_found_note"] = (
#                     f"No exact DLD match for '{building_name}'. "
#                     "Ask user for the exact building name as on the title deed."
#                 )

#     # ── Step 5: Comparison — fetch BOTH named areas explicitly ──
#     if is_comparison and len(all_area_ids) >= 2:
#         for aid, kw in all_area_ids[:3]:
#             name  = preferred_name(aid, kw)
#             intel = fetch_area_intelligence(aid)
#             if intel and intel.get("area_name_en"):
#                 name = intel["area_name_en"]
#             key   = f"comparison_area_{name.replace(' ', '_').lower()}"
#             if key not in context_data:
#                 context_data[key] = build_area_detail(aid, name, intel)

#     # ── Step 6: Lifestyle query ──
#     if is_lifestyle_query and not area_id:
#         lifestyle_area_ids = get_lifestyle_areas(msg_lower)
#         context_data["query_type"]         = "lifestyle"
#         context_data["lifestyle_keywords"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         for lid in lifestyle_area_ids:
#             intel = fetch_area_intelligence(lid)
#             name  = (intel.get("area_name_en") if intel else None) or preferred_name(lid)
#             key   = f"lifestyle_area_{name.replace(' ', '_').lower()}"
#             context_data[key] = build_area_detail(lid, name, intel)

#     # ── Step 7: Yield query ──
#     if any(w in msg_lower for w in ["yield", "rental yield", "highest yield", "best yield", "top yield", "rental income"]) and not area_id:
#         top_yield = fetch_top_yield_areas()
#         if top_yield:
#             context_data["top_yield_areas"] = top_yield

#     # ── Step 8: Market overview / best areas ──
#     MARKET_KEYWORDS = [
#         "best area", "top area", "highest yield", "compare", "market", "overview",
#         "which area", "rank", "best", "which", "recommend", "suggest", "vs", "versus",
#         "where to buy", "where should", "top 5", "top 3",
#     ]
#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle_query and not is_comparison:
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top
#             for area in top[:3]:
#                 aname      = area.get("area_name_en", "")
#                 matched_id = None
#                 for kw, aid in AREA_ID_MAP.items():
#                     if kw in aname.lower() or aname.lower() in kw:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = f"area_detail_{aname.replace(' ', '_').lower()}"
#                     context_data[key] = build_area_detail(matched_id, aname, area)

#     # ── Step 9: Budget search ──
#     if budget and not area_id:
#         top = fetch_top_areas_intelligence(30)
#         if top:
#             context_data["budget_search_areas"] = top
#             for area in top[:5]:
#                 aname      = area.get("area_name_en", "")
#                 matched_id = None
#                 for kw, aid in AREA_ID_MAP.items():
#                     if kw in aname.lower() or aname.lower() in kw:
#                         matched_id = aid
#                         break
#                 if matched_id:
#                     key = f"area_detail_{aname.replace(' ', '_').lower()}"
#                     if key not in context_data:
#                         context_data[key] = build_area_detail(matched_id, aname, area)

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

#     # ── Step 11: Signals ──
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

#     # ── Build LLM messages ──
#     messages = [{"role": "system", "content": SYSTEM_PROMPT}]

#     if req.history:
#         for h in req.history[-4:]:
#             messages.append({"role": h["role"], "content": h["content"]})

#     db_label   = "ACQAR Database — use ONLY these numbers, never invent:" if has_db_data else "No specific DB data matched this query."
#     db_content = json.dumps(context_data, indent=2, default=str) if has_db_data else "{}"
#     no_db_note = "" if has_db_data else "\nAnswer from expert Dubai real estate knowledge. Flag all figures as market estimates not ACQAR transaction data."

#     user_prompt = f"""User question: {message}

# {db_label}{no_db_note}
# {db_content}

# Respond with valid JSON only. No markdown. No text outside the JSON."""

#     messages.append({"role": "user", "content": user_prompt})

#     # ── Call LLM ──
#     def call_llm(model: str) -> str:
#         response = client.chat.completions.create(
#             model=model,
#             messages=messages,
#             temperature=0.15,
#             max_tokens=3000,
#             response_format={"type": "json_object"},
#         )
#         return response.choices[0].message.content.strip()

#     try:
#         try:
#             raw = call_llm(PRIMARY_MODEL)
#         except Exception as primary_err:
#             print(f"Primary model ({PRIMARY_MODEL}) failed: {primary_err}. Falling back.")
#             raw = call_llm(FALLBACK_MODEL)

#         result = extract_json(raw)
#         result["type"] = "structured"
#         result.pop("data_source", None)

#         # Hero metrics
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

#         # Momentum badges for frontend
#         momentum = context_data.get("price_momentum", {})
#         if momentum:
#             ms = momentum.get("momentum_signal", {})
#             result["momentum_direction"]  = ms.get("direction")
#             result["momentum_change_pct"] = ms.get("change_pct")
#             result["yoy_change_pct"]      = momentum.get("yoy_change_pct")
#             peak = momentum.get("peak_data", {})
#             if peak:
#                 result["peak_period"]   = peak.get("period")
#                 result["peak_psf"]      = peak.get("psf")
#                 result["pct_from_peak"] = peak.get("pct_from_peak")
#             vol = momentum.get("volume_signal", {})
#             if vol:
#                 result["volume_recent_avg"] = vol.get("recent_avg_monthly")
#                 result["volume_peak"]       = vol.get("peak_transactions")

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
#             "type":    "text",
#             "reply":   "I hit an error processing that query. Please try again.",
#             "charts":  [],
#             "insight": "",
#         }











# import os
# import re
# import json
# import traceback

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict
# from groq import Groq

# # ─────────────────────────────────────────────────────────────────
# # CLIENTS
# # ─────────────────────────────────────────────────────────────────
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# router      = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# supabase     = create_client(SUPABASE_URL, SUPABASE_KEY)

# PRIMARY_MODEL  = "llama-3.3-70b-versatile"
# FALLBACK_MODEL = "llama3-70b-8192"

# BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")


# # ─────────────────────────────────────────────────────────────────
# # REQUEST SCHEMA
# # ─────────────────────────────────────────────────────────────────
# class ChatRequest(BaseModel):
#     message: str
#     history: list = []


# # ─────────────────────────────────────────────────────────────────
# # AREA ID MAP  — keyword (lowercase) → area_id in Supabase
# # Sorted longest-first at runtime so "dubai marina" beats "marina"
# # ─────────────────────────────────────────────────────────────────
# AREA_ID_MAP = {
#     "jumeirah village circle": 59,
#     "dubai creek harbour":     1509,
#     "dubai hills estate":      53,
#     "arabian ranches 3":       16296,
#     "arabian ranches 2":       133,
#     "arabian ranches":         133,
#     "jumeirah lake towers":    12,
#     "jumeirah golf estates":   347,
#     "dubai sports city":       67,
#     "dubai internet city":     1621,
#     "dubai production city":   5036,
#     "dubai media city":        95,
#     "dubai harbour":           3512,
#     "barsha heights":          25,
#     "discovery gardens":       13,
#     "international city":      368,
#     "palm jumeirah":           410,
#     "palm jebel ali":          1519,
#     "silicon oasis":           91,
#     "bluewaters island":       1754,
#     "business bay":            54,
#     "downtown dubai":          10,
#     "damac hills 2":           352,
#     "damac hills":             352,
#     "damac lagoons":           75266,
#     "tilal al ghaf":           5173,
#     "dubai islands":           5178,
#     "creek harbour":           1509,
#     "dubai marina":            36,
#     "dubai hills":             53,
#     "jumeirah park":           73,
#     "sports city":             67,
#     "town square":             386,
#     "dubai south":             3355,
#     "motor city":              268,
#     "al furjan":               41,
#     "bluewaters":              1754,
#     "al barsha":               105,
#     "al jaddaf":               1509,
#     "al karama":               271,
#     "al satwa":                1347,
#     "nad al sheba":            161,
#     "oud metha":               388,
#     "expo city":               85082,
#     "dubailand":               51,
#     "meydan":                  43,
#     "downtown":                10,
#     "the greens":              25,
#     "jaddaf":                  1509,
#     "tecom":                   25,
#     "greens":                  25,
#     "karama":                  271,
#     "satwa":                   1347,
#     "mirdif":                  232,
#     "marina":                  36,
#     "palm":                    410,
#     "difc":                    117,
#     "impz":                    5036,
#     "arjan":                   91,
#     "dso":                     91,
#     "jvc":                     59,
#     "jlt":                     12,
#     "jumeirah":                23,
#     "deira":                   545,
# }

# AREA_DISPLAY_NAMES = {
#     36:    "Dubai Marina",
#     59:    "Jumeirah Village Circle (JVC)",
#     10:    "Downtown Dubai",
#     54:    "Business Bay",
#     410:   "Palm Jumeirah",
#     23:    "Jumeirah",
#     53:    "Dubai Hills Estate",
#     12:    "Jumeirah Lake Towers (JLT)",
#     117:   "DIFC",
#     1509:  "Dubai Creek Harbour",
#     1754:  "Bluewaters Island",
#     3355:  "Dubai South",
#     41:    "Al Furjan",
#     268:   "Motor City",
#     67:    "Dubai Sports City",
#     133:   "Arabian Ranches",
#     352:   "DAMAC Hills",
#     386:   "Town Square",
#     91:    "Silicon Oasis",
#     105:   "Al Barsha",
#     232:   "Mirdif",
#     13:    "Discovery Gardens",
#     368:   "International City",
#     25:    "Barsha Heights / TECOM",
#     545:   "Deira",
#     345:   "Bur Dubai",
#     43:    "Meydan",
#     73:    "Jumeirah Park",
#     347:   "Jumeirah Golf Estates",
#     51:    "Dubailand",
#     85082: "Expo City Dubai",
# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio",
#     "1": "1 BR",   "1.0": "1 BR",
#     "2": "2 BR",   "2.0": "2 BR",
#     "3": "3 BR",   "3.0": "3 BR",
#     "4": "4 BR",   "4.0": "4 BR",
#     "5": "5 BR",   "5.0": "5 BR",
# }

# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "budget", "metro", "golf", "waterfront", "off plan", "off-plan",
#     "apartment", "studio", "townhouse", "pool", "gym", "furnished",
#     "short term", "airbnb", "holiday home", "foreigner", "freehold",
#     "first time", "relocat", "new to dubai", "rental income", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british":      [53, 23, 73],
#     "family":       [53, 73, 133, 59],
#     "school":       [53, 73, 133],
#     "expat":        [36, 10, 54, 12],
#     "beach":        [410, 36, 1754],
#     "beachfront":   [410, 1754],
#     "luxury":       [410, 10, 36, 117],
#     "affordable":   [59, 91, 13, 368],
#     "cheap":        [59, 368, 13],
#     "budget":       [59, 13, 368],
#     "golf":         [347, 352, 53],
#     "waterfront":   [36, 410, 12, 1754],
#     "metro":        [25, 12, 54, 10],
#     "airbnb":       [36, 10, 54, 1754],
#     "short term":   [36, 10, 54],
#     "holiday home": [410, 36, 1754],
#     "villa":        [73, 133, 352, 53],
#     "freehold":     [59, 36, 54, 10],
# }

# MARKET_KEYWORDS = [
#     "best area", "top area", "highest yield", "compare", "market overview",
#     "which area", "recommend", "suggest", "vs", "versus",
#     "where to buy", "where should", "top 5", "top 3", "best areas",
#     "rank", "ranking", "overview",
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


# # ─────────────────────────────────────────────────────────────────
# # UTILITIES
# # ─────────────────────────────────────────────────────────────────

# def _fix_unescaped_newlines(s: str) -> str:
#     """Replace literal newlines/tabs inside JSON string values with escaped versions."""
#     result  = []
#     in_str  = False
#     escaped = False
#     for ch in s:
#         if escaped:
#             result.append(ch)
#             escaped = False
#             continue
#         if ch == "\\" and in_str:
#             result.append(ch)
#             escaped = True
#             continue
#         if ch == '"':
#             in_str = not in_str
#             result.append(ch)
#             continue
#         if in_str:
#             if ch == "\n":
#                 result.append("\\n")
#                 continue
#             if ch == "\r":
#                 result.append("\\r")
#                 continue
#             if ch == "\t":
#                 result.append("\\t")
#                 continue
#         result.append(ch)
#     return "".join(result)


# def extract_json(raw: str) -> dict:
#     raw = raw.strip()
#     # Strip markdown fences
#     if raw.startswith("```"):
#         raw = re.sub(r"^```(?:json)?", "", raw)
#         raw = re.sub(r"```$", "", raw)
#         raw = raw.strip()
#     # Attempt 1: direct parse
#     try:
#         return json.loads(raw)
#     except Exception:
#         pass
#     # Attempt 2: fix unescaped newlines inside string values (common Groq issue)
#     try:
#         return json.loads(_fix_unescaped_newlines(raw))
#     except Exception:
#         pass
#     # Attempt 3: find first {...} block and try again
#     match = re.search(r'\{.*\}', raw, re.DOTALL)
#     if match:
#         block = match.group(0)
#         try:
#             return json.loads(block)
#         except Exception:
#             pass
#         try:
#             return json.loads(_fix_unescaped_newlines(block))
#         except Exception:
#             pass
#     return {"summary": "", "reply": raw, "charts": [], "insight": ""}


# def get_area_id(msg_lower: str):
#     for keyword in sorted(AREA_ID_MAP.keys(), key=len, reverse=True):
#         if keyword in msg_lower:
#             return AREA_ID_MAP[keyword], keyword
#     return None, None


# def get_all_area_ids(msg_lower: str) -> list:
#     found, seen = [], set()
#     for keyword in sorted(AREA_ID_MAP.keys(), key=len, reverse=True):
#         if keyword in msg_lower:
#             aid = AREA_ID_MAP[keyword]
#             if aid not in seen:
#                 found.append((aid, keyword))
#                 seen.add(aid)
#     return found


# def get_lifestyle_areas(msg_lower: str) -> list:
#     scores = defaultdict(int)
#     for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             for rank, aid in enumerate(area_ids):
#                 scores[aid] += (5 - rank)
#     return sorted(scores.keys(), key=lambda x: -scores[x])[:4]


# def extract_budget(msg: str):
#     msg_clean = msg.lower().replace(",", "").replace("aed", "").strip()
#     for pat in [r'(\d+\.?\d*)\s*(?:million|m)\b', r'(\d{7,})', r'(\d+\.?\d*)\s*k\b']:
#         match = re.search(pat, msg_clean)
#         if match:
#             val  = float(match.group(1))
#             tail = msg_clean[match.start():match.end() + 2]
#             if "k" in tail:
#                 return val * 1_000
#             if val < 1000:
#                 return val * 1_000_000
#             return val
#     return None


# def extract_bedrooms(msg: str):
#     m = msg.lower()
#     for pat, label in [
#         (r'\bstudio\b', "Studio"),
#         (r'\b1\s*(?:br|bed|bedroom)\b', "1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b', "2 BR"),
#         (r'\b3\s*(?:br|bed|bedroom)\b', "3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b', "4 BR"),
#         (r'\bone\s*bed(?:room)?\b', "1 BR"),
#         (r'\btwo\s*bed(?:room)?\b', "2 BR"),
#         (r'\bthree\s*bed(?:room)?\b', "3 BR"),
#     ]:
#         if re.search(pat, m):
#             return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle:
#         return False
#     has_vague    = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield", "price", "psm", "sqm", "trend", "compare", "vs", "score",
#         "invest", "return", "roi", "catalyst", "developer", "aed", "bedroom",
#         "studio", "villa", "apartment",
#     ])
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values:
#         return None
#     s = sorted(values)
#     n = len(s)
#     mid = n // 2
#     return round((s[mid - 1] + s[mid]) / 2 if n % 2 == 0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))


# # ─────────────────────────────────────────────────────────────────
# # SUPABASE FETCHERS  — all return [] / None on failure, never raise
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
#     except Exception:
#         return None


# def fetch_area_stats(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select(
#             "price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month"
#         ).eq("area_id", area_id).limit(1000).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_price_history(area_id: int) -> list:
#     try:
#         res = supabase.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id) \
#          .order("sale_year", desc=False) \
#          .order("sale_month", desc=False).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_area_catalysts(area_id: int) -> list:
#     try:
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active") \
#          .order("expected_date", desc=False).limit(8).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_developer_track_records(developer_names: list) -> list:
#     try:
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_area_shock_impacts(zone_type: str) -> list:
#     try:
#         if not zone_type:
#             return []
#         res = supabase.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_top_areas_intelligence(limit: int = 20) -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null") \
#          .order("investment_score", desc=True).limit(limit).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_top_yield_areas() -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, gross_yield_pct, investment_score, verdict, "
#             "truvalu_psm, price_trend_pct"
#         ).not_.is_("gross_yield_pct", "null") \
#          .order("gross_yield_pct", desc=True).limit(10).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_dld_projects(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select("project_name_en") \
#             .eq("area_id", area_id) \
#             .not_.is_("project_name_en", "null").limit(300).execute()
#         if not res.data:
#             return []
#         counts = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 counts[r["project_name_en"]] += 1
#         return sorted(counts.items(), key=lambda x: -x[1])[:10]
#     except Exception:
#         return []


# # ─────────────────────────────────────────────────────────────────
# # CONTEXT BUILDER — assembles ALL Supabase data for one area
# # ─────────────────────────────────────────────────────────────────

# def build_area_context(area_id: int, detected_keyword: str, context_data: dict):
#     name = preferred_name(area_id, detected_keyword)
#     context_data["detected_area"] = name
#     context_data["area_id"]       = area_id

#     # 1. Area intelligence (scores, yield, verdict)
#     intel = fetch_area_intelligence(area_id)
#     if intel:
#         context_data["area_intelligence"] = intel
#         # 2. Developer track records
#         devs = intel.get("key_developers") or []
#         if devs:
#             records = fetch_developer_track_records(devs)
#             if records:
#                 context_data["developer_track_records"] = records
#         # 3. Historical shock resilience
#         zone = intel.get("zone_type")
#         if zone:
#             shocks = fetch_area_shock_impacts(zone)
#             if shocks:
#                 context_data["historical_shock_resilience"] = shocks

#     # 4. Raw DLD transactions → computed stats
#     area_data = fetch_area_stats(area_id)
#     if area_data:
#         prices    = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#         worths    = [float(r["actual_worth"])   for r in area_data if r.get("actual_worth")]
#         room_psm  = defaultdict(list)
#         room_worth = defaultdict(list)
#         year_map  = defaultdict(list)

#         for r in area_data:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 if r.get("price_per_sqm"):
#                     room_psm[label].append(float(r["price_per_sqm"]))
#                 if r.get("actual_worth"):
#                     room_worth[label].append(float(r["actual_worth"]))
#             if r.get("sale_year") and r.get("price_per_sqm"):
#                 year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#         context_data["transaction_stats"] = {
#             "count":            len(area_data),
#             "avg_price_sqm":    round(sum(prices) / len(prices), 0) if prices else None,
#             "min_price_sqm":    round(min(prices), 0) if prices else None,
#             "max_price_sqm":    round(max(prices), 0) if prices else None,
#             "avg_worth_aed":    round(sum(worths) / len(worths), 0) if worths else None,
#             "bedroom_avg_psm":  {k: round(sum(v) / len(v), 0) for k, v in room_psm.items()},
#             "yearly_avg_psm":   {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
#             "median_price_by_bedroom": {k: median_val(v) for k, v in room_worth.items()},
#         }

#     # 5. Price history for line chart
#     history = fetch_price_history(area_id)
#     if history:
#         year_avg = defaultdict(list)
#         for r in history:
#             year_avg[r["sale_year"]].append(r["psf"])
#         context_data["price_history_by_year"] = {
#             str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
#         }

#     # 6. Infrastructure catalysts
#     catalysts = fetch_area_catalysts(area_id)
#     if catalysts:
#         context_data["area_catalysts"] = catalysts

#     # 7. Top projects by transaction volume
#     projects = fetch_dld_projects(area_id)
#     if projects:
#         context_data["top_projects"] = [
#             {"name": p[0], "transactions": p[1]} for p in projects
#         ]


# # ─────────────────────────────────────────────────────────────────
# # SYSTEM PROMPT — Groq narrates only; all numbers from Supabase
# # ─────────────────────────────────────────────────────────────────

# SYSTEM_PROMPT = """You are ACQAR Intelligence — the sharpest real estate analyst in Dubai.
# You have 365,000+ real DLD closed-sale transactions, area investment scores, price history,
# developer track records, catalyst timelines, and shock resilience data at your fingertips.

# GOLDEN RULE: Every number you write MUST come from the ACQAR Database provided.
# If a specific metric is not in the database, skip it entirely — do NOT write placeholders,
# "N/A", or "(market estimate)" labels. Only write what you actually have data for.
# Exception: if there is ZERO database data for any field, then you may answer from expert
# Dubai real estate knowledge and note once at the top: "Note: figures are expert estimates."

# RESPOND ONLY with valid JSON. No text before or after. No markdown fences.

# JSON shape:
# {
#   "summary": "...",
#   "reply": "...",
#   "charts": [],
#   "insight": "..."
# }

# ═══════════════════════════════════════════════════════
# TONE & STYLE — READ THIS FIRST
# ═══════════════════════════════════════════════════════
# Write like a senior Dubai real estate analyst talking directly to a client over WhatsApp.
# Confident. Specific. Conversational. Not a report. Not a bullet checklist.

# BAD (what you must NOT do):
#   "• Investment Score: (market estimate — not ACQAR transaction data)
#    • Verdict: BUY
#    • Gross Yield: (market estimate — not ACQAR transaction data)"

# GOOD (what you MUST do):
#   "Dubai Marina is on a clear upward run — prices climbed from AED 21,906/sqm in 2024 to
#    AED 26,862/sqm in 2026, a 22% jump in two years. Studios are the hottest segment at
#    AED 44,195/sqm, but the real value play is 2BR at AED 23,969/sqm with a median
#    closed-sale of AED 2.85M."

# NEVER output a bullet that just names a field with no real value.
# NEVER output placeholder text like "(market estimate — not ACQAR transaction data)".
# If you don't have the data for something, simply don't mention it.

# ═══════════════════════════════════════════════════════
# REPLY FIELD STRUCTURE
# ═══════════════════════════════════════════════════════
# Use \n for line breaks inside the JSON string. Separate sections with \n\n.
# Each section starts with one emoji header line, then 2-4 sentences of conversational prose.
# Use numbers from the database naturally inside sentences — not as labeled bullets.

# SECTIONS (use only those with real data, write each as prose not bullets):

# 📊 MARKET OVERVIEW
# Open with the investment verdict and why in one punchy sentence. Then 1-2 sentences on
# yield, price trend, and ranking if available. Example:
# "Marina is a BUY — prices are up 22% over two years and the market is still absorbing
# supply. With a 6.2% gross yield and a #4 ranking in Dubai, the fundamentals are solid."

# 💰 PRICING
# Talk through pricing conversationally. Mention the avg PSM, the range, and avg transaction.
# Then naturally describe the bedroom breakdown — which is cheap, which is expensive, which
# is the best value. Mention median closed-sale prices so the reader knows what to budget.
# Do NOT list every bedroom as a labeled bullet. Weave it into 3-4 sentences.

# 📈 PRICE HISTORY
# Tell the story of the price movement. Use the year→year data to explain what happened
# and what it means for buyers now. 2-3 sentences with specific numbers.
# Example: "Prices dipped to AED 21,906/sqm in 2024 after the 2022 peak of AED 30,589,
# but recovered strongly to AED 26,862 by 2026 — a clear V-shaped recovery that signals
# the bottom is in."

# 🏗️ DEVELOPERS & PROJECTS
# If developer track records exist: name the key developers and their delivery record in
# one sentence each. If on_time_pct < 70, flag it with ⚠️.
# Mention the top projects by transaction volume naturally.

# ⚡ CATALYSTS
# If catalysts exist: describe each upcoming infrastructure project and its expected impact
# in 1-2 sentences. Be specific about dates and what the catalyst means for prices.

# 🛡️ RESILIENCE
# If shock data exists: one paragraph on how this area has handled past market shocks.
# Specific numbers on price drops and recovery time.

# ✅ VERDICT
# 3-4 sentences. Be direct. Who should buy here and why. What the entry play is.
# What to watch out for. Close with a specific number that anchors the recommendation.

# ═══════════════════════════════════════════════════════
# CHART RULES
# ═══════════════════════════════════════════════════════
# Only populate charts with real data. Remove any chart with no real values.
# - bedroom_avg_psm → {"type":"bar","title":"Price by Bedroom (AED/sqm)","data":[{"label":"Studio","value":44534},{"label":"1 BR","value":24708},...]}
# - price_history_by_year → {"type":"line","title":"Price History (AED/sqm)","data":[{"label":"2023","value":25029},...]}
# - developer on_time_pct → {"type":"bar","title":"Developer On-Time Delivery %","data":[{"label":"Emaar","value":92},...]}
# - investment score comparison → {"type":"bar","title":"Investment Score Comparison","data":[{"label":"JVC","value":84},...]}

# ═══════════════════════════════════════════════════════
# SUMMARY & INSIGHT RULES
# ═══════════════════════════════════════════════════════
# summary: 2 sentences. The verdict + the single most compelling number. Conversational opener.
# Never start with "Based on" or the area name followed by "has/is/was".
# Start with what the data MEANS, not what the data IS.
# Good: "Dubai Marina is the clear buy in 2026 — a 22% price rise over two years with 2BR
# still available at median AED 2.85M puts it firmly in value territory."
# Bad: "Dubai Marina's average price per sqm is AED 26,706 with 1,000 transactions."

# insight: One sentence. Specific number. Something a buyer can act on today.
# Good: "2BR median is AED 2.85M — 11% below current asking prices on Bayut, so you have
# real negotiation room right now."

# NEVER invent numbers. NEVER write placeholder labels. NEVER use bullet checklists."""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower    = message.lower()
#     context_data = {}
#     raw          = ""

#     # ── 1. Parse intent ───────────────────────────────────────────
#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(message)
#     bedrooms               = extract_bedrooms(message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     # ── 2. Vague query → ask clarifying questions ─────────────────
#     if is_vague(msg_lower, area_id, is_lifestyle):
#         return {
#             "type":    "text",
#             "summary": "Let me get a few details to find the best match for you.",
#             "reply": (
#                 "To give you a data-backed answer, I need a few quick details:\n\n"
#                 "1. What is your budget? (e.g. AED 1M–2M, AED 3M–5M, AED 5M+)\n"
#                 "2. Are you buying to live in, or investing for rental income?\n"
#                 "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
#                 "4. How many bedrooms do you need?\n\n"
#                 "Once I know these, I'll pull real DLD closed-sale data and give you a "
#                 "shortlist with actual numbers — not asking prices."
#             ),
#             "charts":  [],
#             "insight": "",
#         }

#     # ── 3. Attach budget & bedrooms ───────────────────────────────
#     if budget:
#         context_data["user_budget_aed"]   = budget
#         context_data["user_budget_label"] = f"AED {budget / 1_000_000:.1f}M"
#     if bedrooms:
#         context_data["user_bedrooms"] = bedrooms

#     # ── 4. Single area — full deep report ────────────────────────
#     if area_id and not is_comparison:
#         build_area_context(area_id, detected_area, context_data)

#     # ── 5. Comparison — fetch both/all named areas ────────────────
#     if is_comparison and len(all_area_ids) >= 2:
#         for aid, kw in all_area_ids[:3]:
#             intel = fetch_area_intelligence(aid)
#             name  = (intel.get("area_name_en") if intel else None) or preferred_name(aid, kw)
#             key   = f"comparison_{name.replace(' ', '_').lower()}"
#             if key not in context_data:
#                 sub = {}
#                 build_area_context(aid, kw, sub)
#                 context_data[key] = sub

#     # ── 6. Lifestyle areas ────────────────────────────────────────
#     if is_lifestyle and not area_id and not is_comparison:
#         context_data["query_type"]     = "lifestyle"
#         context_data["lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         for lid in get_lifestyle_areas(msg_lower):
#             sub  = {}
#             build_area_context(lid, "", sub)
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ', '_').lower()}"] = sub

#     # ── 7. Yield query ────────────────────────────────────────────
#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id:
#         top = fetch_top_yield_areas()
#         if top:
#             context_data["top_yield_areas"] = top

#     # ── 8. Market overview ────────────────────────────────────────
#     if (any(w in msg_lower for w in MARKET_KEYWORDS)
#             and not is_lifestyle and not is_comparison and not area_id):
#         top = fetch_top_areas_intelligence()
#         if top:
#             context_data["top_areas"] = top

#     # ── 9. Budget search ──────────────────────────────────────────
#     if budget and not area_id and not is_lifestyle:
#         top = fetch_top_areas_intelligence(30)
#         if top:
#             context_data["budget_search_areas"] = top

#     # ── 10. Build prompt ──────────────────────────────────────────
#     has_db = bool(context_data)
#     db_block = (
#         "ACQAR Database — use ONLY these numbers, never invent:\n"
#         + json.dumps(context_data, indent=2, default=str)
#         if has_db else
#         "No specific DB data matched this query. Answer from expert Dubai real estate "
#         "knowledge. Mark every figure with '(market estimate — not ACQAR transaction data)'."
#     )

#     messages = [{"role": "system", "content": SYSTEM_PROMPT}]
#     for h in (req.history or [])[-6:]:
#         if h.get("role") in ("user", "assistant") and h.get("content"):
#             messages.append({"role": h["role"], "content": str(h["content"])})
#     messages.append({
#         "role":    "user",
#         "content": f"User question: {message}\n\n{db_block}\n\nRespond with JSON only.",
#     })

#     # ── 11. Call Groq — primary model with fallback ───────────────
#     def call_groq(model: str) -> str:
#         # response_format json_object forces Groq to always return valid JSON
#         # so the reply field will have properly escaped \n, never raw newlines
#         resp = groq_client.chat.completions.create(
#             model=model,
#             messages=messages,
#             temperature=0.15,
#             max_tokens=3000,
#             response_format={"type": "json_object"},
#         )
#         return resp.choices[0].message.content.strip()

#     try:
#         try:
#             raw = call_groq(PRIMARY_MODEL)
#         except Exception as primary_err:
#             print(f"[ACQAR Chat] Primary ({PRIMARY_MODEL}) failed: {primary_err}. Falling back.")
#             raw = call_groq(FALLBACK_MODEL)

#         result = extract_json(raw)
#         result["type"] = "structured"
#         result.pop("data_source", None)

#         # ── 12. Inject hero metrics from DB (NEVER from LLM) ─────
#         intel = context_data.get("area_intelligence", {})
#         if not intel:
#             for v in context_data.values():
#                 if isinstance(v, dict) and "area_intelligence" in v:
#                     intel = v["area_intelligence"]
#                     break

#         if intel:
#             result["score"]        = intel.get("investment_score")
#             result["verdict"]      = intel.get("verdict")
#             result["yield_pct"]    = intel.get("gross_yield_pct")
#             result["price_trend"]  = intel.get("price_trend_pct")
#             result["ranking"]      = intel.get("ranking_rank")
#             result["distress_pct"] = intel.get("distress_pct")
#             y = intel.get("gross_yield_pct")
#             if y:
#                 result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)

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
#             "type":    "text",
#             "summary": "",
#             "reply":   (
#                 "I hit an error processing that query. Please try rephrasing — "
#                 "for example: 'Tell me about JVC' or 'Best areas for rental yield above 7%'."
#             ),
#             "charts":  [],
#             "insight": "",
#         }







# import os
# import re
# import json
# import asyncio
# import traceback
# from concurrent.futures import ThreadPoolExecutor

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict
# from groq import Groq

# # ─────────────────────────────────────────────────────────────────
# # CLIENTS
# # ─────────────────────────────────────────────────────────────────
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# router      = APIRouter()

# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
# supabase     = create_client(SUPABASE_URL, SUPABASE_KEY)

# PRIMARY_MODEL  = "llama-3.3-70b-versatile"
# FALLBACK_MODEL = "llama3-70b-8192"

# BACKEND = os.getenv("BACKEND_URL", "https://development-production-2ad3.up.railway.app")

# # Thread pool for parallel DB calls
# _executor = ThreadPoolExecutor(max_workers=10)


# # ─────────────────────────────────────────────────────────────────
# # REQUEST SCHEMA
# # ─────────────────────────────────────────────────────────────────
# class ChatRequest(BaseModel):
#     message: str
#     history: list = []


# # ─────────────────────────────────────────────────────────────────
# # AREA ID MAP
# # ─────────────────────────────────────────────────────────────────
# AREA_ID_MAP = {
#     "jumeirah village circle": 59,
#     "dubai creek harbour":     1509,
#     "dubai hills estate":      53,
#     "arabian ranches 3":       16296,
#     "arabian ranches 2":       133,
#     "arabian ranches":         133,
#     "jumeirah lake towers":    12,
#     "jumeirah golf estates":   347,
#     "dubai sports city":       67,
#     "dubai internet city":     1621,
#     "dubai production city":   5036,
#     "dubai media city":        95,
#     "dubai harbour":           3512,
#     "barsha heights":          25,
#     "discovery gardens":       13,
#     "international city":      368,
#     "palm jumeirah":           410,
#     "palm jebel ali":          1519,
#     "silicon oasis":           91,
#     "bluewaters island":       1754,
#     "business bay":            54,
#     "downtown dubai":          10,
#     "damac hills 2":           352,
#     "damac hills":             352,
#     "damac lagoons":           75266,
#     "tilal al ghaf":           5173,
#     "dubai islands":           5178,
#     "creek harbour":           1509,
#     "dubai marina":            36,
#     "dubai hills":             53,
#     "jumeirah park":           73,
#     "sports city":             67,
#     "town square":             386,
#     "dubai south":             3355,
#     "motor city":              268,
#     "al furjan":               41,
#     "bluewaters":              1754,
#     "al barsha":               105,
#     "al jaddaf":               1509,
#     "al karama":               271,
#     "al satwa":                1347,
#     "nad al sheba":            161,
#     "oud metha":               388,
#     "expo city":               85082,
#     "dubailand":               51,
#     "meydan":                  43,
#     "downtown":                10,
#     "the greens":              25,
#     "jaddaf":                  1509,
#     "tecom":                   25,
#     "greens":                  25,
#     "karama":                  271,
#     "satwa":                   1347,
#     "mirdif":                  232,
#     "marina":                  36,
#     "palm":                    410,
#     "difc":                    117,
#     "impz":                    5036,
#     "arjan":                   91,
#     "dso":                     91,
#     "jvc":                     59,
#     "jlt":                     12,
#     "jumeirah":                23,
#     "deira":                   545,
# }

# AREA_DISPLAY_NAMES = {
#     36:    "Dubai Marina",
#     59:    "Jumeirah Village Circle (JVC)",
#     10:    "Downtown Dubai",
#     54:    "Business Bay",
#     410:   "Palm Jumeirah",
#     23:    "Jumeirah",
#     53:    "Dubai Hills Estate",
#     12:    "Jumeirah Lake Towers (JLT)",
#     117:   "DIFC",
#     1509:  "Dubai Creek Harbour",
#     1754:  "Bluewaters Island",
#     3355:  "Dubai South",
#     41:    "Al Furjan",
#     268:   "Motor City",
#     67:    "Dubai Sports City",
#     133:   "Arabian Ranches",
#     352:   "DAMAC Hills",
#     386:   "Town Square",
#     91:    "Silicon Oasis",
#     105:   "Al Barsha",
#     232:   "Mirdif",
#     13:    "Discovery Gardens",
#     368:   "International City",
#     25:    "Barsha Heights / TECOM",
#     545:   "Deira",
#     345:   "Bur Dubai",
#     43:    "Meydan",
#     73:    "Jumeirah Park",
#     347:   "Jumeirah Golf Estates",
#     51:    "Dubailand",
#     85082: "Expo City Dubai",
# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio",
#     "1": "1 BR",   "1.0": "1 BR",
#     "2": "2 BR",   "2.0": "2 BR",
#     "3": "3 BR",   "3.0": "3 BR",
#     "4": "4 BR",   "4.0": "4 BR",
#     "5": "5 BR",   "5.0": "5 BR",
# }

# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "budget", "metro", "golf", "waterfront", "off plan", "off-plan",
#     "apartment", "studio", "townhouse", "pool", "gym", "furnished",
#     "short term", "airbnb", "holiday home", "foreigner", "freehold",
#     "first time", "relocat", "new to dubai", "rental income", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british":      [53, 23, 73],
#     "family":       [53, 73, 133, 59],
#     "school":       [53, 73, 133],
#     "expat":        [36, 10, 54, 12],
#     "beach":        [410, 36, 1754],
#     "beachfront":   [410, 1754],
#     "luxury":       [410, 10, 36, 117],
#     "affordable":   [59, 91, 13, 368],
#     "cheap":        [59, 368, 13],
#     "budget":       [59, 13, 368],
#     "golf":         [347, 352, 53],
#     "waterfront":   [36, 410, 12, 1754],
#     "metro":        [25, 12, 54, 10],
#     "airbnb":       [36, 10, 54, 1754],
#     "short term":   [36, 10, 54],
#     "holiday home": [410, 36, 1754],
#     "villa":        [73, 133, 352, 53],
#     "freehold":     [59, 36, 54, 10],
# }

# MARKET_KEYWORDS = [
#     "best area", "top area", "highest yield", "compare", "market overview",
#     "which area", "recommend", "suggest", "vs", "versus",
#     "where to buy", "where should", "top 5", "top 3", "best areas",
#     "rank", "ranking", "overview",
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


# # ─────────────────────────────────────────────────────────────────
# # UTILITIES
# # ─────────────────────────────────────────────────────────────────

# def _fix_unescaped_newlines(s: str) -> str:
#     result  = []
#     in_str  = False
#     escaped = False
#     for ch in s:
#         if escaped:
#             result.append(ch)
#             escaped = False
#             continue
#         if ch == "\\" and in_str:
#             result.append(ch)
#             escaped = True
#             continue
#         if ch == '"':
#             in_str = not in_str
#             result.append(ch)
#             continue
#         if in_str:
#             if ch == "\n":
#                 result.append("\\n")
#                 continue
#             if ch == "\r":
#                 result.append("\\r")
#                 continue
#             if ch == "\t":
#                 result.append("\\t")
#                 continue
#         result.append(ch)
#     return "".join(result)


# def extract_json(raw: str) -> dict:
#     raw = raw.strip()
#     if raw.startswith("```"):
#         raw = re.sub(r"^```(?:json)?", "", raw)
#         raw = re.sub(r"```$", "", raw)
#         raw = raw.strip()
#     try:
#         return json.loads(raw)
#     except Exception:
#         pass
#     try:
#         return json.loads(_fix_unescaped_newlines(raw))
#     except Exception:
#         pass
#     match = re.search(r'\{.*\}', raw, re.DOTALL)
#     if match:
#         block = match.group(0)
#         try:
#             return json.loads(block)
#         except Exception:
#             pass
#         try:
#             return json.loads(_fix_unescaped_newlines(block))
#         except Exception:
#             pass
#     return {"summary": "", "reply": raw, "charts": [], "insight": ""}


# def get_area_id(msg_lower: str):
#     for keyword in sorted(AREA_ID_MAP.keys(), key=len, reverse=True):
#         if keyword in msg_lower:
#             return AREA_ID_MAP[keyword], keyword
#     return None, None


# def get_all_area_ids(msg_lower: str) -> list:
#     found, seen = [], set()
#     for keyword in sorted(AREA_ID_MAP.keys(), key=len, reverse=True):
#         if keyword in msg_lower:
#             aid = AREA_ID_MAP[keyword]
#             if aid not in seen:
#                 found.append((aid, keyword))
#                 seen.add(aid)
#     return found


# def get_lifestyle_areas(msg_lower: str) -> list:
#     scores = defaultdict(int)
#     for keyword, area_ids in sorted(LIFESTYLE_AREA_MAP.items(), key=lambda x: -len(x[0])):
#         if keyword in msg_lower:
#             for rank, aid in enumerate(area_ids):
#                 scores[aid] += (5 - rank)
#     return sorted(scores.keys(), key=lambda x: -scores[x])[:4]


# def extract_budget(msg: str):
#     msg_clean = msg.lower().replace(",", "").replace("aed", "").strip()
#     for pat in [r'(\d+\.?\d*)\s*(?:million|m)\b', r'(\d{7,})', r'(\d+\.?\d*)\s*k\b']:
#         match = re.search(pat, msg_clean)
#         if match:
#             val  = float(match.group(1))
#             tail = msg_clean[match.start():match.end() + 2]
#             if "k" in tail:
#                 return val * 1_000
#             if val < 1000:
#                 return val * 1_000_000
#             return val
#     return None


# def extract_bedrooms(msg: str):
#     m = msg.lower()
#     for pat, label in [
#         (r'\bstudio\b', "Studio"),
#         (r'\b1\s*(?:br|bed|bedroom)\b', "1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b', "2 BR"),
#         (r'\b3\s*(?:br|bed|bedroom)\b', "3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b', "4 BR"),
#         (r'\bone\s*bed(?:room)?\b', "1 BR"),
#         (r'\btwo\s*bed(?:room)?\b', "2 BR"),
#         (r'\bthree\s*bed(?:room)?\b', "3 BR"),
#     ]:
#         if re.search(pat, m):
#             return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle:
#         return False
#     has_vague    = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield", "price", "psm", "sqm", "trend", "compare", "vs", "score",
#         "invest", "return", "roi", "catalyst", "developer", "aed", "bedroom",
#         "studio", "villa", "apartment",
#     ])
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values:
#         return None
#     s = sorted(values)
#     n = len(s)
#     mid = n // 2
#     return round((s[mid - 1] + s[mid]) / 2 if n % 2 == 0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))


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
#     except Exception:
#         return None


# def fetch_area_stats(area_id: int) -> list:
#     # 100 rows is enough for bedroom breakdown
#     # area_intelligence already has the pre-computed summary stats
#     try:
#         res = supabase.table("avm").select(
#             "price_per_sqm, procedure_area, actual_worth, "
#             "rooms_en, property_type_en, sale_year, sale_month"
#         ).eq("area_id", area_id).order("sale_year", desc=True).order("sale_month", desc=True).limit(100).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_price_history(area_id: int) -> list:
#     # FIX: limit(36) = 3 years of monthly data, was fetching ALL rows
#     try:
#         res = supabase.table("price_history_manual").select(
#             "sale_year, sale_month, psf, cnt"
#         ).eq("area_id", area_id) \
#          .order("sale_year", desc=False) \
#          .order("sale_month", desc=False) \
#          .limit(36).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_area_catalysts(area_id: int) -> list:
#     try:
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active") \
#          .order("expected_date", desc=False).limit(5).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_developer_track_records(developer_names: list) -> list:
#     try:
#         clean = [d for d in developer_names if d and d != "Various"]
#         if not clean:
#             return []
#         res = supabase.table("developer_track_records").select(
#             "developer_name, on_time_pct, avg_delay_months, total_projects, "
#             "delivered_units, star_rating, market_segment, notes"
#         ).in_("developer_name", clean).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_area_shock_impacts(zone_type: str) -> list:
#     try:
#         if not zone_type:
#             return []
#         res = supabase.table("area_shock_impacts").select(
#             "event_name, event_period, price_impact_pct, recovery_months, recovery_driver, notes"
#         ).eq("zone_type", zone_type).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_top_areas_intelligence(limit: int = 20) -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, truvalu_psm, gross_yield_pct, investment_score, "
#             "verdict, ranking_rank, price_trend_pct, catalyst_score, zone_type"
#         ).not_.is_("investment_score", "null") \
#          .order("investment_score", desc=True).limit(limit).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_top_yield_areas() -> list:
#     try:
#         res = supabase.table("area_intelligence").select(
#             "area_name_en, gross_yield_pct, investment_score, verdict, "
#             "truvalu_psm, price_trend_pct"
#         ).not_.is_("gross_yield_pct", "null") \
#          .order("gross_yield_pct", desc=True).limit(10).execute()
#         return res.data or []
#     except Exception:
#         return []


# def fetch_dld_projects(area_id: int) -> list:
#     try:
#         res = supabase.table("avm").select("project_name_en") \
#             .eq("area_id", area_id) \
#             .not_.is_("project_name_en", "null").limit(100).execute()
#         if not res.data:
#             return []
#         counts = defaultdict(int)
#         for r in res.data:
#             if r.get("project_name_en"):
#                 counts[r["project_name_en"]] += 1
#         return sorted(counts.items(), key=lambda x: -x[1])[:5]
#     except Exception:
#         return []


# # ─────────────────────────────────────────────────────────────────
# # ASYNC HELPER
# # ─────────────────────────────────────────────────────────────────

# async def _run(func, *args):
#     """Run a blocking DB call in the thread pool without blocking the event loop."""
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(_executor, func, *args)


# # ─────────────────────────────────────────────────────────────────
# # PARALLEL CONTEXT BUILDER
# # FIX: All 5 DB calls fire concurrently in one gather — ~400ms total
# # instead of 5 sequential calls ~2000ms
# # ─────────────────────────────────────────────────────────────────

# async def build_area_context_async(area_id: int, detected_keyword: str, context_data: dict):
#     name = preferred_name(area_id, detected_keyword)
#     context_data["detected_area"] = name
#     context_data["area_id"]       = area_id

#     # FIX: All 5 independent DB calls fire at the same time
#     intel, area_data, history, catalysts, projects = await asyncio.gather(
#         _run(fetch_area_intelligence, area_id),
#         _run(fetch_area_stats, area_id),
#         _run(fetch_price_history, area_id),
#         _run(fetch_area_catalysts, area_id),
#         _run(fetch_dld_projects, area_id),
#     )

#     # Developer records + shock data depend on intel (need key_developers + zone_type)
#     # Fire these in a second parallel batch
#     dev_records = []
#     shock_data  = []
#     if intel:
#         devs = intel.get("key_developers") or []
#         zone = intel.get("zone_type")
#         tasks = []
#         fetch_devs  = bool(devs)
#         fetch_shock = bool(zone)
#         if fetch_devs:
#             tasks.append(_run(fetch_developer_track_records, devs))
#         if fetch_shock:
#             tasks.append(_run(fetch_area_shock_impacts, zone))
#         results = await asyncio.gather(*tasks) if tasks else []
#         idx = 0
#         if fetch_devs:
#             dev_records = results[idx] or []
#             idx += 1
#         if fetch_shock:
#             shock_data = results[idx] or []

#     # ── Populate context ──────────────────────────────────────────
#     if intel:
#         context_data["area_intelligence"] = intel
#     if dev_records:
#         context_data["developer_track_records"] = dev_records
#     if shock_data:
#         context_data["historical_shock_resilience"] = shock_data

#     # Pre-compute transaction stats in Python — send only clean numbers to LLM
#     if area_data:
#         prices     = [float(r["price_per_sqm"]) for r in area_data if r.get("price_per_sqm")]
#         worths     = [float(r["actual_worth"])   for r in area_data if r.get("actual_worth")]
#         room_psm   = defaultdict(list)
#         room_worth = defaultdict(list)
#         year_map   = defaultdict(list)

#         for r in area_data:
#             label = BEDROOM_KEYS.get(str(r.get("rooms_en", "")))
#             if label:
#                 if r.get("price_per_sqm"):
#                     room_psm[label].append(float(r["price_per_sqm"]))
#                 if r.get("actual_worth"):
#                     room_worth[label].append(float(r["actual_worth"]))
#             if r.get("sale_year") and r.get("price_per_sqm"):
#                 year_map[int(r["sale_year"])].append(float(r["price_per_sqm"]))

#         context_data["transaction_stats"] = {
#             "count":                   len(area_data),
#             "avg_price_sqm":           round(sum(prices) / len(prices), 0) if prices else None,
#             "min_price_sqm":           round(min(prices), 0) if prices else None,
#             "max_price_sqm":           round(max(prices), 0) if prices else None,
#             "avg_worth_aed":           round(sum(worths) / len(worths), 0) if worths else None,
#             "bedroom_avg_psm":         {k: round(sum(v) / len(v), 0) for k, v in room_psm.items()},
#             "yearly_avg_psm":          {str(k): round(sum(v) / len(v), 0) for k, v in sorted(year_map.items())},
#             "median_price_by_bedroom": {k: median_val(v) for k, v in room_worth.items()},
#         }

#     if history:
#         year_avg = defaultdict(list)
#         for r in history:
#             year_avg[r["sale_year"]].append(r["psf"])
#         context_data["price_history_by_year"] = {
#             str(y): round(sum(v) / len(v), 0) for y, v in sorted(year_avg.items())
#         }

#     if catalysts:
#         context_data["area_catalysts"] = catalysts

#     if projects:
#         context_data["top_projects"] = [{"name": p[0], "transactions": p[1]} for p in projects]


# # ─────────────────────────────────────────────────────────────────
# # SYSTEM PROMPT
# # ─────────────────────────────────────────────────────────────────

# SYSTEM_PROMPT = """You are ACQAR Intelligence — Dubai's sharpest real estate analyst.
# You have 365,000+ real DLD closed-sale transactions, investment scores, price history,
# developer track records, catalyst timelines, and shock resilience data.

# GOLDEN RULE: Every number you write MUST come from the ACQAR Database provided.
# Never invent figures. If a metric is missing from the data, skip that line entirely.
# Exception: if there is zero DB data, answer from expert knowledge and note once:
# "Note: figures are expert estimates — no ACQAR transaction data matched this query."

# RESPOND ONLY with valid JSON. No text before or after. No markdown fences.

# JSON shape:
# {
#   "summary": "...",
#   "reply": "...",
#   "charts": [],
#   "insight": "..."
# }

# ═══════════════════════════════════════════════════════
# RESPONSE FORMAT — STEP BY STEP (like ChatGPT)
# ═══════════════════════════════════════════════════════

# Write the reply field in clearly separated sections.
# Each section must have an emoji header, then SHORT bullet points under it.
# Use • for bullets. Never write long paragraphs — break everything into scannable lines.
# Use \\n for line breaks inside the JSON string.

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMAT FOR BUY QUERY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 📌 QUICK ANSWER
# • [One sentence: what this area/budget gets you — direct and specific]
# • Verdict: [BUY / HOLD / WATCH] — [one-line reason with a number]

# 📊 MARKET SNAPSHOT
# • Investment Score: [X]/100
# • Gross Yield: [X.X]%
# • Price Trend: [+/-X.X]% year-on-year
# • Dubai Ranking: #[X]
# • Distress Sales: [X]%

# 💰 PRICES (Real DLD Closed Sales — not asking prices)
# • Average: AED [X,XXX]/sqm
# • Range: AED [X,XXX] – [X,XXX]/sqm
# • Studio: AED [X,XXX]/sqm | Median unit: AED [X.XXM]
# • 1BR: AED [X,XXX]/sqm | Median unit: AED [X.XXM]
# • 2BR: AED [X,XXX]/sqm | Median unit: AED [X.XXM]
# • 3BR: AED [X,XXX]/sqm | Median unit: AED [X.XXM]
# (Only list bedrooms that have real data)

# 📈 PRICE TREND
# • [Year]: AED [X,XXX]/sqm → [Year]: AED [X,XXX]/sqm → [Year]: AED [X,XXX]/sqm
# • Direction: [Rising / Cooling / Flat]
# • Change: [+/-X]% over [X] years

# 🏗️ KEY DEVELOPERS
# • [Developer name] — [X]% on-time · [X]★ rating
# • [Developer name] — [X]% on-time · [X]★ rating ⚠️ (if on_time_pct < 70)

# ⚡ UPCOMING CATALYSTS
# • [Project name] — [date] — Expected impact: [+X% / high demand]
# • [Project name] — [date]

# 🛡️ MARKET RESILIENCE
# • [Shock event]: prices dropped [X]%, recovered in [X] months

# ✅ VERDICT
# • Best for: [who this area suits — investor / family / end-user]
# • Entry play: [specific bedroom type and price point]
# • Watch out for: [one risk]
# • Bottom line: [one sentence with a specific number]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMAT FOR SELL QUERY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 📌 TIMING VERDICT
# • [Sell now / List in next 60 days / Wait X months] — [reason with number]

# 📈 PRICE MOMENTUM
# • Current trend: [Rising / Cooling / Flat]
# • Year-on-year: [+/-X]%
# • Peak: [Month Year] at AED [X,XXX]/sqm
# • Now: AED [X,XXX]/sqm ([X]% from peak)

# 💰 YOUR REALISTIC PRICE RANGE
# • [Bedroom type] in [area]: AED [X.XXM] – [X.XXM]
# • Median DLD closed sale: AED [X.XXM]

# ⚡ WHAT COULD MOVE PRICES
# • [Catalyst 1] — [date]
# • [Catalyst 2] — [date]

# ✅ ACTION PLAN
# • Step 1: [specific action]
# • Step 2: [specific action]
# • Bottom line: [one sentence]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMAT FOR COMPARISON QUERY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 📌 QUICK VERDICT
# • Winner for investment: [Area] — [reason with number]
# • Winner for lifestyle: [Area] — [reason]

# 📊 SIDE BY SIDE
# • Investment Score | [Area 1]: [X]/100  | [Area 2]: [X]/100
# • Gross Yield      | [Area 1]: [X.X]%   | [Area 2]: [X.X]%
# • Avg Price/sqm    | [Area 1]: AED [X]  | [Area 2]: AED [X]
# • Price Trend      | [Area 1]: [+/-X]%  | [Area 2]: [+/-X]%
# • Verdict          | [Area 1]: [BUY]    | [Area 2]: [HOLD]

# 💰 PRICE BREAKDOWN
# [Area 1]: Studio AED [X]/sqm | 1BR AED [X]/sqm | 2BR AED [X]/sqm
# [Area 2]: Studio AED [X]/sqm | 1BR AED [X]/sqm | 2BR AED [X]/sqm

# ✅ RECOMMENDATION
# • Choose [Area 1] if: [specific use case]
# • Choose [Area 2] if: [specific use case]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMAT FOR LIFESTYLE / FAMILY QUERY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 📌 TOP RECOMMENDATION
# • [Area name] — [why it fits their need in one line]

# 🏡 WHY THIS AREA
# • Community: [expat mix, vibe, safety]
# • Schools: [names, curriculum, KHDA rating if available]
# • Commute: [X mins to Downtown / road name]
# • Amenities: [parks, malls, beach if relevant]

# 💰 PRICES
# • [Bedroom]: AED [X.XXM] median | AED [X,XXX]/sqm

# 🏙️ OTHER OPTIONS
# • [Area 2]: [one-line reason + key price]
# • [Area 3]: [one-line reason + key price]

# ✅ BOTTOM LINE
# • Best pick: [Area] for [specific reason]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FORMAT FOR PROCESS / HOW-TO QUERY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 📋 HOW TO [BUY / SELL / RENT] IN DUBAI

# Step 1 — [Action name]
# • [What to do. One or two lines max.]

# Step 2 — [Action name]
# • [What to do. Include exact fee or timeline if known.]

# Step 3 — [Action name]
# • [Continue through all steps]

# 💰 TOTAL COST ESTIMATE
# • Property price: AED [X]
# • DLD transfer fee (4%): AED [X]
# • Agency fee (2%): AED [X]
# • Total upfront: AED [X]

# 📄 DOCUMENTS NEEDED
# • Passport (non-residents) — no Emirates ID required
# • [Other docs if applicable]

# ✅ KEY TAKEAWAY
# • [One sentence — e.g. "Budget 7–8% above purchase price for all fees."]

# ═══════════════════════════════════════════════════════
# CHART RULES
# ═══════════════════════════════════════════════════════
# Only populate charts with real numbers. Remove any chart that has no real values.
# - bedroom_avg_psm → {"type":"bar","title":"Price by Bedroom (AED/sqm)","data":[{"label":"Studio","value":44534},...]}
# - price_history_by_year → {"type":"line","title":"Price History (AED/sqm)","data":[{"label":"2023","value":25029},...]}
# - developer on_time_pct → {"type":"bar","title":"Developer On-Time Delivery %","data":[{"label":"Emaar","value":92},...]}
# - investment score comparison → {"type":"bar","title":"Investment Score Comparison","data":[{"label":"JVC","value":84},...]}

# ═══════════════════════════════════════════════════════
# SUMMARY & INSIGHT
# ═══════════════════════════════════════════════════════
# summary: 2 sentences max. The verdict + the most useful number. Start with the answer.
# Good: "JVC is the top buy for yield-focused investors — 8.2% gross yield with 2BR median at AED 1.1M."
# Bad: "JVC has an average price of AED 12,000/sqm with 500 transactions."

# insight: One sentence. One specific number. Something the user can act on today.
# Good: "2BR median is AED 1.1M — book a viewing this week before the Q3 price revision."

# NEVER invent numbers. NEVER write placeholder labels. NEVER use long paragraphs."""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower    = message.lower()
#     context_data = {}
#     raw          = ""

#     # ── 1. Parse intent ───────────────────────────────────────────
#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(message)
#     bedrooms               = extract_bedrooms(message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     # ── 2. Vague query → clarifying questions ─────────────────────
#     if is_vague(msg_lower, area_id, is_lifestyle):
#         return {
#             "type":    "text",
#             "summary": "Let me get a few details to find the best match for you.",
#             "reply": (
#                 "To give you a data-backed answer, I need a few quick details:\n\n"
#                 "1. What is your budget? (e.g. AED 1M–2M, AED 3M–5M, AED 5M+)\n"
#                 "2. Are you buying to live in, or investing for rental income?\n"
#                 "3. Any lifestyle preferences? (beach, city centre, family community, schools, golf)\n"
#                 "4. How many bedrooms do you need?\n\n"
#                 "Once I know these, I'll pull real DLD closed-sale data and give you a "
#                 "shortlist with actual numbers — not asking prices."
#             ),
#             "charts":  [],
#             "insight": "",
#         }

#     # ── 3. Attach budget & bedrooms ───────────────────────────────
#     if budget:
#         context_data["user_budget_aed"]   = budget
#         context_data["user_budget_label"] = f"AED {budget / 1_000_000:.1f}M"
#     if bedrooms:
#         context_data["user_bedrooms"] = bedrooms

#     # ── 4. Build DB context (all parallel) ───────────────────────

#     if area_id and not is_comparison:
#         # Single area — all 5+2 DB calls run concurrently
#         await build_area_context_async(area_id, detected_area, context_data)

#     elif is_comparison and len(all_area_ids) >= 2:
#         # FIX: Removed sequential intel pre-fetch — use preferred_name directly
#         # This eliminates 3 extra sequential DB calls before the parallel batch
#         sub_tasks = []
#         for aid, kw in all_area_ids[:3]:
#             sub = {}
#             key = f"comparison_{preferred_name(aid, kw).replace(' ', '_').lower()}"
#             if key not in context_data:
#                 sub_tasks.append((key, aid, kw, sub))

#         # All comparison areas fetch in parallel
#         await asyncio.gather(*[
#             build_area_context_async(aid, kw, sub)
#             for _, aid, kw, sub in sub_tasks
#         ])
#         for key, _, _, sub in sub_tasks:
#             context_data[key] = sub

#     elif is_lifestyle and not area_id:
#         # Lifestyle — all matching areas fetch in parallel
#         context_data["query_type"]     = "lifestyle"
#         context_data["lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         lifestyle_ids = get_lifestyle_areas(msg_lower)
#         subs = [{} for _ in lifestyle_ids]
#         await asyncio.gather(*[
#             build_area_context_async(lid, "", sub)
#             for lid, sub in zip(lifestyle_ids, subs)
#         ])
#         for lid, sub in zip(lifestyle_ids, subs):
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ', '_').lower()}"] = sub

#     # ── 5. Market / yield queries ─────────────────────────────────
#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id:
#         top = await _run(fetch_top_yield_areas)
#         if top:
#             context_data["top_yield_areas"] = top

#     if (any(w in msg_lower for w in MARKET_KEYWORDS)
#             and not is_lifestyle and not is_comparison and not area_id):
#         top = await _run(fetch_top_areas_intelligence)
#         if top:
#             context_data["top_areas"] = top

#     if budget and not area_id and not is_lifestyle:
#         top = await _run(fetch_top_areas_intelligence, 30)
#         if top:
#             context_data["budget_search_areas"] = top

#     # ── 6. Build prompt ───────────────────────────────────────────
#     has_db = bool(context_data)
#     db_block = (
#         "ACQAR Database — use ONLY these numbers, never invent:\n"
#         + json.dumps(context_data, indent=2, default=str)
#         if has_db else
#         "No specific DB data matched this query. Answer from expert Dubai real estate "
#         "knowledge. Mark every figure with '(expert estimate)'."
#     )

#     messages = [{"role": "system", "content": SYSTEM_PROMPT}]
#     for h in (req.history or [])[-6:]:
#         if h.get("role") in ("user", "assistant") and h.get("content"):
#             messages.append({"role": h["role"], "content": str(h["content"])})
#     messages.append({
#         "role":    "user",
#         "content": f"User question: {message}\n\n{db_block}\n\nRespond with JSON only.",
#     })

#     # ── 7. Call Groq ─────────────────────────────────────────────
#     def call_groq(model: str) -> str:
#         resp = groq_client.chat.completions.create(
#             model=model,
#             messages=messages,
#             temperature=0.15,
#             max_tokens=1200,          # enough for full step-by-step answer
#             response_format={"type": "json_object"},
#         )
#         return resp.choices[0].message.content.strip()

#     try:
#         try:
#             raw = await _run(call_groq, PRIMARY_MODEL)
#         except Exception as primary_err:
#             print(f"[ACQAR Chat] Primary ({PRIMARY_MODEL}) failed: {primary_err}. Falling back.")
#             raw = await _run(call_groq, FALLBACK_MODEL)

#         result = extract_json(raw)
#         result["type"] = "structured"
#         result.pop("data_source", None)

#         # ── 8. Inject hero metrics directly from DB (never from LLM) ─
#         intel = context_data.get("area_intelligence", {})
#         if not intel:
#             for v in context_data.values():
#                 if isinstance(v, dict) and "area_intelligence" in v:
#                     intel = v["area_intelligence"]
#                     break

#         if intel:
#             result["score"]        = intel.get("investment_score")
#             result["verdict"]      = intel.get("verdict")
#             result["yield_pct"]    = intel.get("gross_yield_pct")
#             result["price_trend"]  = intel.get("price_trend_pct")
#             result["ranking"]      = intel.get("ranking_rank")
#             result["distress_pct"] = intel.get("distress_pct")
#             y = intel.get("gross_yield_pct")
#             if y:
#                 result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)

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
#             "type":    "text",
#             "summary": "",
#             "reply":   (
#                 "I hit an error processing that query. Please try rephrasing — "
#                 "for example: 'Tell me about JVC' or 'Best areas for rental yield above 7%'."
#             ),
#             "charts":  [],
#             "insight": "",
#         }















# import os
# import re
# import json
# import asyncio
# import traceback
# from concurrent.futures import ThreadPoolExecutor

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict
# from groq import Groq

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# router      = APIRouter()
# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
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
#     "silicon oasis": 91, "bluewaters island": 1754,
#     "business bay": 54, "downtown dubai": 10,
#     "damac hills 2": 352, "damac hills": 352,
#     "damac lagoons": 75266, "tilal al ghaf": 5173,
#     "dubai islands": 5178, "creek harbour": 1509,
#     "dubai marina": 36, "dubai hills": 53,
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
#     "marina": 36, "palm": 410, "difc": 117,
#     "impz": 5036, "arjan": 91, "dso": 91,
#     "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
# }

# AREA_DISPLAY_NAMES = {
#     36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
#     10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
#     23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
#     117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
#     3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
#     67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills",
#     386: "Town Square", 91: "Silicon Oasis", 105: "Al Barsha",
#     232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
#     25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
#     43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
#     51: "Dubailand", 85082: "Expo City Dubai",
# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
#     "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
#     "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
# }

# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "budget", "metro", "golf", "waterfront", "off plan", "off-plan",
#     "apartment", "studio", "townhouse", "pool", "gym", "furnished",
#     "short term", "airbnb", "holiday home", "foreigner", "freehold",
#     "first time", "relocat", "new to dubai", "rental income", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 73], "family": [53, 73, 133, 59],
#     "school": [53, 73, 133], "expat": [36, 10, 54, 12],
#     "beach": [410, 36, 1754], "beachfront": [410, 1754],
#     "luxury": [410, 10, 36, 117], "affordable": [59, 91, 13, 368],
#     "cheap": [59, 368, 13], "budget": [59, 13, 368],
#     "golf": [347, 352, 53], "waterfront": [36, 410, 12, 1754],
#     "metro": [25, 12, 54, 10], "airbnb": [36, 10, 54, 1754],
#     "short term": [36, 10, 54], "holiday home": [410, 36, 1754],
#     "villa": [73, 133, 352, 53], "freehold": [59, 36, 54, 10],
# }

# MARKET_KEYWORDS = [
#     "best area", "top area", "highest yield", "compare", "market overview",
#     "which area", "recommend", "suggest", "vs", "versus",
#     "where to buy", "where should", "top 5", "top 3", "best areas",
#     "rank", "ranking", "overview",
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
#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         if kw in msg_lower:
#             aid = AREA_ID_MAP[kw]
#             if aid not in seen: found.append((aid, kw)); seen.add(aid)
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
#         emi_match = re.search(r'salary\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
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
#         (r'\bstudio\b',"Studio"),(r'\b1\s*(?:br|bed|bedroom)\b',"1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3\s*(?:br|bed|bedroom)\b',"3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
#         (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
#     ]:
#         if re.search(pat, m): return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle: return False
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield","price","psm","sqm","trend","compare","vs","score",
#         "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
#     ])
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values: return None
#     s = sorted(values); n = len(s); mid = n // 2
#     return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))


# def fmt_aed(v) -> str:
#     if v is None: return ""
#     v = float(v)
#     if v >= 1_000_000: return f"AED {v/1_000_000:.2f}M"
#     if v >= 1_000:     return f"AED {int(v):,}"
#     return f"AED {v:.0f}"


# def fmt_psm(v) -> str:
#     if v is None: return ""
#     return f"AED {int(float(v)):,}/sqm"


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
#         ).eq("area_id", area_id).order("sale_year", desc=True).order("sale_month", desc=True).limit(100).execute()
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
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(5).execute()
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
#                 if r.get("actual_worth"):  room_worth[label].append(float(r["actual_worth"]))
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

#     if catalysts: context_data["area_catalysts"] = catalysts
#     if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# # ─────────────────────────────────────────────────────────────────
# # REPLY BUILDERS (unchanged from your working version)
# # ─────────────────────────────────────────────────────────────────

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

#     target_br = bedrooms or "2 BR"
#     median_v  = stats.get("median_price_by_bedroom", {}).get(target_br)
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
#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     if median_v:
#         recommended = round(float(median_v) * 1.06)
#         all_meds = sorted([v for v in bedroom_med.values() if v])
#         if len(all_meds) >= 2:
#             lines.append(f"• {target_br} unit price range: {fmt_aed(all_meds[0])} – {fmt_aed(all_meds[-1])} (DLD closed sales)")
#         lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
#         lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
#     distress = intel.get("distress_pct")
#     if distress:
#         lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

#     if cats:
#         lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name','Catalyst')} — {c.get('expected_date','upcoming')} — {c.get('description','infrastructure uplift expected')}")

#     lines.append("\n✅ SELLER ACTION PLAN")
#     if median_v:
#         lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
#     lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
#     lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
#     if median_v:
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
#             if parts: lines.append(f"• #{i} {name} — {' · '.join(parts)}")
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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','uplift expected')}")

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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','demand uplift expected')}")

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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')}")

#     lines.append("\n✅ VERDICT")
#     lines.append("• Best for: Investors and end-users looking for an established Dubai community")
#     if bmed:
#         best_br = list(bmed.keys())[0]
#         lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
#     lines.append("• Watch out for: Service charges and new supply pipeline in the area")

#     return "\n".join(lines)


# def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
#     br    = bedrooms or "2 BR"
#     med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")

#     if user_type == "buyer":
#         if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
#         return f"{area} is a well-established Dubai community suited for home buyers and families."
#     elif user_type == "seller":
#         if med: return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
#         if yld: return f"{area} offers {yld}% gross yield — {'above' if float(yld)>6.1 else 'at'} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
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
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     br    = bedrooms or "2 BR"
#     med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")
#     yld   = intel.get("gross_yield_pct")

#     if user_type == "buyer" and med:
#         asking = round(float(med) * 1.10)
#         return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
#     elif user_type == "seller" and med:
#         list_price = round(float(med) * 1.06)
#         return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", [])
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

#     if med:
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

#     top_yield = ctx.get("top_yield_areas", [])
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
# • Monthly payment capacity: AED [X]
# • Estimated property budget: AED [X] – AED [X]
# • Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
# • Best areas in this budget: [Area 1] · [Area 2] · [Area 3]

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
# 1. Be specific — real numbers, real developer names, real regulations
# 2. If budget is mentioned (salary/EMI/monthly), calculate the property budget and show the math
# 3. Always end with actionable next steps
# 4. Never write more than 2 lines per bullet
# 5. Never write paragraphs — always bullet points under emoji headers
# 6. summary: 2 sentences — direct answer + most useful number
# 7. insight: 1 sentence — one specific action the user can take TODAY"""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower    = message.lower()
#     context_data = {}
#     raw          = ""

#     user_type = detect_user_type(msg_lower)

#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(message)
#     bedrooms               = extract_bedrooms(message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     if is_vague(msg_lower, area_id, is_lifestyle):
#         return {
#             "type": "text",
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
#         context_data["query_type"]     = "lifestyle"
#         context_data["lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         lifestyle_ids = get_lifestyle_areas(msg_lower)
#         subs = [{} for _ in lifestyle_ids]
#         await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
#         for lid, sub in zip(lifestyle_ids, subs):
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id:
#         top = await _run(fetch_top_yield_areas)
#         if top: context_data["top_yield_areas"] = top

#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id:
#         top = await _run(fetch_top_areas_intelligence)
#         if top: context_data["top_areas"] = top

#     if budget and not area_id and not is_lifestyle:
#         top = await _run(fetch_top_areas_intelligence, 30)
#         if top: context_data["budget_search_areas"] = top

#     has_area_data = bool(
#         context_data.get("area_intelligence") or
#         context_data.get("transaction_stats") or
#         context_data.get("top_yield_areas") or
#         context_data.get("top_areas")
#     )

#     # ── CHANGE 3: If no area data, still fetch top areas for context ──
#     if not has_area_data and not area_id:
#         top = await _run(fetch_top_areas_intelligence, 10)
#         if top:
#             context_data["dubai_market_context"] = top

#     if has_area_data:
#         if user_type == "buyer":      reply = build_buyer_reply(context_data, bedrooms)
#         elif user_type == "seller":   reply = build_seller_reply(context_data, bedrooms)
#         elif user_type == "investor": reply = build_investor_reply(context_data, bedrooms)
#         elif user_type == "broker":   reply = build_broker_reply(context_data, bedrooms)
#         else:                         reply = build_general_reply(context_data, bedrooms)

#         result = {
#             "type":      "structured",
#             "user_type": user_type,
#             "summary":   build_summary(user_type, context_data, bedrooms),
#             "reply":     reply,
#             "charts":    build_charts(context_data, user_type),
#             "insight":   build_insight(user_type, context_data, bedrooms),
#         }
#     else:
#         # No area DB match — LLM answers with full expert knowledge + market context
#         db_context = ""
#         if context_data.get("dubai_market_context"):
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
#         messages.append({
#             "role": "user",
#             "content": f"Question: {message}{db_context}\n\nAnswer this fully and specifically. Reply with JSON only."
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
#             result["type"] = "structured"; result["user_type"] = user_type
#             result.pop("data_source", None)
#         except Exception as e:
#             print(f"[ACQAR] LLM error: {e}")
#             result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}

#     intel = context_data.get("area_intelligence", {})
#     if not intel:
#         for v in context_data.values():
#             if isinstance(v, dict) and "area_intelligence" in v:
#                 intel = v["area_intelligence"]; break

#     if intel:
#         result["score"]        = intel.get("investment_score")
#         result["verdict"]      = intel.get("verdict")
#         result["yield_pct"]    = intel.get("gross_yield_pct")
#         result["price_trend"]  = intel.get("price_trend_pct")
#         result["ranking"]      = intel.get("ranking_rank")
#         result["distress_pct"] = intel.get("distress_pct")
#         y = intel.get("gross_yield_pct")
#         if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)

#     return result










# import os
# import re
# import json
# import asyncio
# import traceback
# from concurrent.futures import ThreadPoolExecutor

# from fastapi import APIRouter
# from pydantic import BaseModel
# from supabase import create_client
# from collections import defaultdict
# from groq import Groq

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# router      = APIRouter()
# SUPABASE_URL = os.getenv("SUPABASE_URL", "")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
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
#     "silicon oasis": 91, "bluewaters island": 1754,
#     "business bay": 54, "downtown dubai": 10,
#     "damac hills 2": 352, "damac hills": 352,
#     "damac lagoons": 75266, "tilal al ghaf": 5173,
#     "dubai islands": 5178, "creek harbour": 1509,
#     "dubai marina": 36, "dubai hills": 53,
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
#     "marina": 36, "palm": 410, "difc": 117,
#     "impz": 5036, "arjan": 91, "dso": 91,
#     "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
# }

# AREA_DISPLAY_NAMES = {
#     36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
#     10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
#     23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
#     117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
#     3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
#     67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills",
#     386: "Town Square", 91: "Silicon Oasis", 105: "Al Barsha",
#     232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
#     25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
#     43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
#     51: "Dubailand", 85082: "Expo City Dubai",
# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
#     "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
#     "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
# }

# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "budget", "metro", "golf", "waterfront", "off plan", "off-plan",
#     "apartment", "studio", "townhouse", "pool", "gym", "furnished",
#     "short term", "airbnb", "holiday home", "foreigner", "freehold",
#     "first time", "relocat", "new to dubai", "rental income", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 73], "family": [53, 73, 133, 59],
#     "school": [53, 73, 133], "expat": [36, 10, 54, 12],
#     "beach": [410, 36, 1754], "beachfront": [410, 1754],
#     "luxury": [410, 10, 36, 117], "affordable": [59, 91, 13, 368],
#     "cheap": [59, 368, 13], "budget": [59, 13, 368],
#     "golf": [347, 352, 53], "waterfront": [36, 410, 12, 1754],
#     "metro": [25, 12, 54, 10], "airbnb": [36, 10, 54, 1754],
#     "short term": [36, 10, 54], "holiday home": [410, 36, 1754],
#     "villa": [73, 133, 352, 53], "freehold": [59, 36, 54, 10],
# }

# MARKET_KEYWORDS = [
#     "best area", "top area", "highest yield", "compare", "market overview",
#     "which area", "recommend", "suggest", "vs", "versus",
#     "where to buy", "where should", "top 5", "top 3", "best areas",
#     "rank", "ranking", "overview",
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
#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         if kw in msg_lower:
#             aid = AREA_ID_MAP[kw]
#             if aid not in seen: found.append((aid, kw)); seen.add(aid)
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
#         emi_match = re.search(r'salary\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
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
#         (r'\bstudio\b',"Studio"),(r'\b1\s*(?:br|bed|bedroom)\b',"1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3\s*(?:br|bed|bedroom)\b',"3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
#         (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
#     ]:
#         if re.search(pat, m): return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle: return False
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield","price","psm","sqm","trend","compare","vs","score",
#         "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
#     ])
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values: return None
#     s = sorted(values); n = len(s); mid = n // 2
#     return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))


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
#         ).eq("area_id", area_id).order("sale_year", desc=True).order("sale_month", desc=True).limit(100).execute()
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
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(5).execute()
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
#                 if r.get("actual_worth"):  room_worth[label].append(float(r["actual_worth"]))
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

#     if catalysts: context_data["area_catalysts"] = catalysts
#     if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# # ─────────────────────────────────────────────────────────────────
# # REPLY BUILDERS (unchanged from your working version)
# # ─────────────────────────────────────────────────────────────────

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

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

#     return "\n".join(lines)


# def build_seller_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     lines = []

#     target_br = bedrooms or "2 BR"
#     median_v  = stats.get("median_price_by_bedroom", {}).get(target_br)
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
#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     if median_v:
#         recommended = round(float(median_v) * 1.06)
#         all_meds = sorted([v for v in bedroom_med.values() if v])
#         if len(all_meds) >= 2:
#             lines.append(f"• {target_br} unit price range: {fmt_aed(all_meds[0])} – {fmt_aed(all_meds[-1])} (DLD closed sales)")
#         lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
#         lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
#     distress = intel.get("distress_pct")
#     if distress:
#         lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

#     if cats:
#         lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name','Catalyst')} — {c.get('expected_date','upcoming')} — {c.get('description','infrastructure uplift expected')}")

#     lines.append("\n✅ SELLER ACTION PLAN")
#     if median_v:
#         lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
#     lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
#     lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
#     if median_v:
#         lines.append(f"• Bottom line: Expect 3–5 viewings in first 2 weeks at {fmt_aed(round(float(median_v)*1.06))}")

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','uplift expected')}")

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

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','demand uplift expected')}")

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

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

#     return "\n".join(lines)


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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')}")

#     lines.append("\n✅ VERDICT")
#     lines.append("• Best for: Investors and end-users looking for an established Dubai community")
#     if bmed:
#         best_br = list(bmed.keys())[0]
#         lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
#     lines.append("• Watch out for: Service charges and new supply pipeline in the area")

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

#     return "\n".join(lines)


# def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
#     br    = bedrooms or "2 BR"
#     med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")

#     if user_type == "buyer":
#         if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
#         return f"{area} is a well-established Dubai community suited for home buyers and families."
#     elif user_type == "seller":
#         if med: return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
#         if yld: return f"{area} offers {yld}% gross yield — {'above' if float(yld)>6.1 else 'at'} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
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
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     br    = bedrooms or "2 BR"
#     med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")
#     yld   = intel.get("gross_yield_pct")

#     if user_type == "buyer" and med:
#         asking = round(float(med) * 1.10)
#         return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
#     elif user_type == "seller" and med:
#         list_price = round(float(med) * 1.06)
#         return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", [])
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

#     if med:
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

#     top_yield = ctx.get("top_yield_areas", [])
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
# • Monthly payment capacity: AED [X]
# • Estimated property budget: AED [X] – AED [X]
# • Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
# • Best areas in this budget: [Area 1] · [Area 2] · [Area 3]

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
# 1. Be specific — real numbers, real developer names, real regulations
# 2. If budget is mentioned (salary/EMI/monthly), calculate the property budget and show the math
# 3. Always end with actionable next steps
# 4. Never write more than 2 lines per bullet
# 5. Never write paragraphs — always bullet points under emoji headers
# 6. summary: 2 sentences — direct answer + most useful number
# 7. insight: 1 sentence — one specific action the user can take TODAY"""


# # ─────────────────────────────────────────────────────────────────
# # MAIN ENDPOINT
# # ─────────────────────────────────────────────────────────────────

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower    = message.lower()
#     context_data = {}
#     raw          = ""

#     user_type = detect_user_type(msg_lower)

#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(message)
#     bedrooms               = extract_bedrooms(message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     if is_vague(msg_lower, area_id, is_lifestyle):
#         return {
#             "type": "text",
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
#         context_data["query_type"]     = "lifestyle"
#         context_data["lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         lifestyle_ids = get_lifestyle_areas(msg_lower)
#         subs = [{} for _ in lifestyle_ids]
#         await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
#         for lid, sub in zip(lifestyle_ids, subs):
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id:
#         top = await _run(fetch_top_yield_areas)
#         if top: context_data["top_yield_areas"] = top

#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id:
#         top = await _run(fetch_top_areas_intelligence)
#         if top: context_data["top_areas"] = top

#     if budget and not area_id and not is_lifestyle:
#         top = await _run(fetch_top_areas_intelligence, 30)
#         if top: context_data["budget_search_areas"] = top

#     has_area_data = bool(
#         context_data.get("area_intelligence") or
#         context_data.get("transaction_stats") or
#         context_data.get("top_yield_areas") or
#         context_data.get("top_areas")
#     )

#     # ── CHANGE 3: If no area data, still fetch top areas for context ──
#     if not has_area_data and not area_id:
#         top = await _run(fetch_top_areas_intelligence, 10)
#         if top:
#             context_data["dubai_market_context"] = top

#     if has_area_data:
#         if user_type == "buyer":      reply = build_buyer_reply(context_data, bedrooms)
#         elif user_type == "seller":   reply = build_seller_reply(context_data, bedrooms)
#         elif user_type == "investor": reply = build_investor_reply(context_data, bedrooms)
#         elif user_type == "broker":   reply = build_broker_reply(context_data, bedrooms)
#         else:                         reply = build_general_reply(context_data, bedrooms)

#         result = {
#             "type":      "structured",
#             "user_type": user_type,
#             "summary":   build_summary(user_type, context_data, bedrooms),
#             "reply":     reply,
#             "charts":    build_charts(context_data, user_type),
#             "insight":   build_insight(user_type, context_data, bedrooms),
#         }
#     else:
#         # No area DB match — LLM answers with full expert knowledge + market context
#         db_context = ""
#         if context_data.get("dubai_market_context"):
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
#         messages.append({
#             "role": "user",
#             "content": f"Question: {message}{db_context}\n\nAnswer this fully and specifically. Reply with JSON only."
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
#             result["type"] = "structured"; result["user_type"] = user_type
#             result.pop("data_source", None)
           
            
#         except Exception as e:
#             print(f"[ACQAR] LLM error: {e}")
#             result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}

#     intel = context_data.get("area_intelligence", {})
#     if not intel:
#         for v in context_data.values():
#             if isinstance(v, dict) and "area_intelligence" in v:
#                 intel = v["area_intelligence"]; break

#     if intel:
#         result["score"]        = intel.get("investment_score")
#         result["verdict"]      = intel.get("verdict")
#         result["yield_pct"]    = intel.get("gross_yield_pct")
#         result["price_trend"]  = intel.get("price_trend_pct")
#         result["ranking"]      = intel.get("ranking_rank")
#         result["distress_pct"] = intel.get("distress_pct")
#         y = intel.get("gross_yield_pct")
#         if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)

#     # Build area links for top areas lists
#     top_yield = context_data.get("top_yield_areas", [])
#     top_areas_list = context_data.get("top_areas", [])
#     top_data = top_yield or top_areas_list
#     if top_data:
#         result["area_links"] = [
#             {
#                 "name": a.get("area_name_en", ""),
#                 "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
#             }
#             for a in top_data[:8] if a.get("area_name_en")
#         ]

#     # Single area link
#     detected = context_data.get("detected_area", "")
#     if detected:
#         result["area_url"] = f"https://www.acqar.com/areas/{area_to_slug(detected)}"

#     return result

    









# import os
# import re
# import json
# import asyncio
# import traceback
# from concurrent.futures import ThreadPoolExecutor

# from fastapi import APIRouter
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
#     "silicon oasis": 91, "bluewaters island": 1754,
#     "business bay": 54, "downtown dubai": 10,
#     "damac hills 2": 352, "damac hills": 352,
#     "damac lagoons": 75266, "tilal al ghaf": 5173,
#     "dubai islands": 5178, "creek harbour": 1509,
#     "dubai marina": 36, "dubai hills": 53,
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
#     "marina": 36, "palm": 410, "difc": 117,
#     "impz": 5036, "arjan": 91, "dso": 91,
#     "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
# }

# AREA_DISPLAY_NAMES = {
#     36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
#     10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
#     23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
#     117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
#     3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
#     67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills",
#     386: "Town Square", 91: "Silicon Oasis", 105: "Al Barsha",
#     232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
#     25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
#     43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
#     51: "Dubailand", 85082: "Expo City Dubai",
# }

# BEDROOM_KEYS = {
#     "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
#     "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
#     "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
# }

# LIFESTYLE_KEYWORDS = [
#     "british", "expat", "family", "school", "villa", "community", "kids",
#     "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
#     "cheap", "budget", "metro", "golf", "waterfront", "off plan", "off-plan",
#     "apartment", "studio", "townhouse", "pool", "gym", "furnished",
#     "short term", "airbnb", "holiday home", "foreigner", "freehold",
#     "first time", "relocat", "new to dubai", "rental income", "high yield",
# ]

# LIFESTYLE_AREA_MAP = {
#     "british": [53, 23, 73], "family": [53, 73, 133, 59],
#     "school": [53, 73, 133], "expat": [36, 10, 54, 12],
#     "beach": [410, 36, 1754], "beachfront": [410, 1754],
#     "luxury": [410, 10, 36, 117], "affordable": [59, 91, 13, 368],
#     "cheap": [59, 368, 13], "budget": [59, 13, 368],
#     "golf": [347, 352, 53], "waterfront": [36, 410, 12, 1754],
#     "metro": [25, 12, 54, 10], "airbnb": [36, 10, 54, 1754],
#     "short term": [36, 10, 54], "holiday home": [410, 36, 1754],
#     "villa": [73, 133, 352, 53], "freehold": [59, 36, 54, 10],
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
#     for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
#         if kw in msg_lower:
#             aid = AREA_ID_MAP[kw]
#             if aid not in seen: found.append((aid, kw)); seen.add(aid)
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
#         emi_match = re.search(r'salary\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
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
#         (r'\bstudio\b',"Studio"),(r'\b1\s*(?:br|bed|bedroom)\b',"1 BR"),
#         (r'\b2\s*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3\s*(?:br|bed|bedroom)\b',"3 BR"),
#         (r'\b4\s*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
#         (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
#     ]:
#         if re.search(pat, m): return label
#     return None


# def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
#     if area_id or is_lifestyle: return False
#     has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
#     has_specific = any(w in msg_lower for w in [
#         "yield","price","psm","sqm","trend","compare","vs","score",
#         "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
#     ])
#     return has_vague and not has_specific and len(msg_lower.split()) < 20


# def median_val(values: list):
#     if not values: return None
#     s = sorted(values); n = len(s); mid = n // 2
#     return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


# def preferred_name(area_id: int, fallback: str = "") -> str:
#     return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))


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
#         ).eq("area_id", area_id).order("sale_year", desc=True).order("sale_month", desc=True).limit(100).execute()
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
#         res = supabase.table("area_catalysts").select(
#             "catalyst_type, name, description, expected_date, confidence, status"
#         ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(5).execute()
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
#                 if r.get("actual_worth"):  room_worth[label].append(float(r["actual_worth"]))
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

#     if catalysts: context_data["area_catalysts"] = catalysts
#     if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# # ─────────────────────────────────────────────────────────────────
# # REPLY BUILDERS (unchanged from your working version)
# # ─────────────────────────────────────────────────────────────────

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

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

#     return "\n".join(lines)


# def build_seller_reply(ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     hist  = ctx.get("price_history_by_year", {})
#     cats  = ctx.get("area_catalysts", [])
#     lines = []

#     target_br = bedrooms or "2 BR"
#     median_v  = stats.get("median_price_by_bedroom", {}).get(target_br)
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
#     bedroom_med = stats.get("median_price_by_bedroom", {})
#     if median_v:
#         recommended = round(float(median_v) * 1.06)
#         all_meds = sorted([v for v in bedroom_med.values() if v])
#         if len(all_meds) >= 2:
#             lines.append(f"• {target_br} unit price range: {fmt_aed(all_meds[0])} – {fmt_aed(all_meds[-1])} (DLD closed sales)")
#         lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
#         lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
#     distress = intel.get("distress_pct")
#     if distress:
#         lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

#     if cats:
#         lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
#         for c in cats[:3]:
#             lines.append(f"• {c.get('name','Catalyst')} — {c.get('expected_date','upcoming')} — {c.get('description','infrastructure uplift expected')}")

#     lines.append("\n✅ SELLER ACTION PLAN")
#     if median_v:
#         lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
#     lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
#     lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
#     if median_v:
#         lines.append(f"• Bottom line: Expect 3–5 viewings in first 2 weeks at {fmt_aed(round(float(median_v)*1.06))}")

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','uplift expected')}")

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

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','demand uplift expected')}")

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

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

#     return "\n".join(lines)


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
#             lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')}")

#     lines.append("\n✅ VERDICT")
#     lines.append("• Best for: Investors and end-users looking for an established Dubai community")
#     if bmed:
#         best_br = list(bmed.keys())[0]
#         lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
#     lines.append("• Watch out for: Service charges and new supply pipeline in the area")

#     lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

#     return "\n".join(lines)


# def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
#     br    = bedrooms or "2 BR"
#     med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")

#     if user_type == "buyer":
#         if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
#         return f"{area} is a well-established Dubai community suited for home buyers and families."
#     elif user_type == "seller":
#         if med: return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
#         return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", [])
#         if top_yield:
#             top = top_yield[0]
#             return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
#         if yld: return f"{area} offers {yld}% gross yield — {'above' if float(yld)>6.1 else 'at'} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
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
#     intel = ctx.get("area_intelligence", {})
#     stats = ctx.get("transaction_stats", {})
#     area  = ctx.get("detected_area", "this area")
#     br    = bedrooms or "2 BR"
#     med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")
#     yld   = intel.get("gross_yield_pct")

#     if user_type == "buyer" and med:
#         asking = round(float(med) * 1.10)
#         return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
#     elif user_type == "seller" and med:
#         list_price = round(float(med) * 1.06)
#         return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
#     elif user_type == "investor":
#         top_yield = ctx.get("top_yield_areas", [])
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

#     if med:
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

#     top_yield = ctx.get("top_yield_areas", [])
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
# • Monthly payment capacity: AED [X]
# • Estimated property budget: AED [X] – AED [X]
# • Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
# • Best areas in this budget: [Area 1] · [Area 2] · [Area 3]

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
# 1. Be specific — real numbers, real developer names, real regulations
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

# @router.post("/intelligence/chat")
# async def intelligence_chat(req: ChatRequest):
#     message = req.message.strip()
#     if not message:
#         return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

#     msg_lower    = message.lower()
#     context_data = {}
#     raw          = ""

#     user_type = detect_user_type(msg_lower)

#     area_id, detected_area = get_area_id(msg_lower)
#     all_area_ids           = get_all_area_ids(msg_lower)
#     budget                 = extract_budget(message)
#     bedrooms               = extract_bedrooms(message)
#     is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
#     is_comparison          = (
#         len(all_area_ids) >= 2 or
#         any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
#     )

#     if is_vague(msg_lower, area_id, is_lifestyle):
#         return {
#             "type": "text",
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
#         context_data["query_type"]     = "lifestyle"
#         context_data["lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
#         lifestyle_ids = get_lifestyle_areas(msg_lower)
#         subs = [{} for _ in lifestyle_ids]
#         await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
#         for lid, sub in zip(lifestyle_ids, subs):
#             name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
#             context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

#     if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id:
#         top = await _run(fetch_top_yield_areas)
#         if top: context_data["top_yield_areas"] = top

#     if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id:
#         top = await _run(fetch_top_areas_intelligence)
#         if top: context_data["top_areas"] = top

#     if budget and not area_id and not is_lifestyle:
#         top = await _run(fetch_top_areas_intelligence, 30)
#         if top: context_data["budget_search_areas"] = top

#     has_area_data = bool(
#         context_data.get("area_intelligence") or
#         context_data.get("transaction_stats") or
#         context_data.get("top_yield_areas") or
#         context_data.get("top_areas")
#     )

#     # ── CHANGE 3: If no area data, still fetch top areas for context ──
#     if not has_area_data and not area_id:
#         top = await _run(fetch_top_areas_intelligence, 10)
#         if top:
#             context_data["dubai_market_context"] = top

#     if has_area_data:
#         if user_type == "buyer":      reply = build_buyer_reply(context_data, bedrooms)
#         elif user_type == "seller":   reply = build_seller_reply(context_data, bedrooms)
#         elif user_type == "investor": reply = build_investor_reply(context_data, bedrooms)
#         elif user_type == "broker":   reply = build_broker_reply(context_data, bedrooms)
#         else:                         reply = build_general_reply(context_data, bedrooms)

#         result = {
#             "type":      "structured",
#             "user_type": user_type,
#             "summary":   build_summary(user_type, context_data, bedrooms),
#             "reply":     reply,
#             "charts":    build_charts(context_data, user_type),
#             "insight":   build_insight(user_type, context_data, bedrooms),
#         }
#     else:
#         # No area DB match — LLM answers with full expert knowledge + market context
#         db_context = ""
#         if context_data.get("dubai_market_context"):
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
#         messages.append({
#             "role": "user",
#             "content": f"Question: {message}{db_context}\n\nAnswer this fully and specifically. Reply with JSON only."
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
#             result["type"] = "structured"; result["user_type"] = user_type
#             result.pop("data_source", None)

#             # Try DB data first
#             top_fallback = (
#                 context_data.get("top_yield_areas") or
#                 context_data.get("top_areas") or
#                 context_data.get("dubai_market_context") or
#                 []
#             )
#             if top_fallback:
#                 result["area_links"] = [
#                     {
#                         "name": a.get("area_name_en", ""),
#                         "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
#                     }
#                     for a in top_fallback[:8] if a.get("area_name_en")
#                 ]
#             else:
#                 # Extract area names from LLM reply text and build links
#                 reply_text = result.get("reply", "")
#                 extracted_links = []
#                 for area_name, area_id_val in AREA_ID_MAP.items():
#                     if area_name in reply_text.lower():
#                         display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
#                         url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
#                         if not any(l["url"] == url for l in extracted_links):
#                             extracted_links.append({"name": display, "url": url})
#                     if len(extracted_links) >= 8:
#                         break
#                 if extracted_links:
#                     result["area_links"] = extracted_links
#         except Exception as e:
#             print(f"[ACQAR] LLM error: {e}")
#             result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}
#     intel = context_data.get("area_intelligence", {})
#     if not intel:
#         for v in context_data.values():
#             if isinstance(v, dict) and "area_intelligence" in v:
#                 intel = v["area_intelligence"]; break

#     if intel:
#         result["score"]        = intel.get("investment_score")
#         result["verdict"]      = intel.get("verdict")
#         result["yield_pct"]    = intel.get("gross_yield_pct")
#         result["price_trend"]  = intel.get("price_trend_pct")
#         result["ranking"]      = intel.get("ranking_rank")
#         result["distress_pct"] = intel.get("distress_pct")
#         y = intel.get("gross_yield_pct")
#         if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)

# # Build area links for top areas lists
#     top_yield = context_data.get("top_yield_areas", [])
#     top_areas_list = context_data.get("top_areas", [])
#     top_data = top_yield or top_areas_list or context_data.get("dubai_market_context", [])
#     if top_data:
#         result["area_links"] = [
#             {
#                 "name": a.get("area_name_en", ""),
#                 "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
#             }
#             for a in top_data[:8] if a.get("area_name_en")
#         ]
#     if not result.get("area_links"):
#         # No DB data — extract area names from reply text
#         reply_text = result.get("reply", "")
#         extracted_links = []
#         seen_urls = set()
#         for area_name in sorted(AREA_ID_MAP, key=len, reverse=True):
#             if area_name in reply_text.lower():
#                 area_id_val = AREA_ID_MAP[area_name]
#                 display = AREA_DISPLAY_NAMES.get(area_id_val, area_name.title())
#                 url = f"https://www.acqar.com/areas/{area_to_slug(display)}"
#                 if url not in seen_urls:
#                     extracted_links.append({"name": display, "url": url})
#                     seen_urls.add(url)
#             if len(extracted_links) >= 8:
#                 break
#         if extracted_links:
#             result["area_links"] = extracted_links
#     # Single area link
#     detected = context_data.get("detected_area", "")
#     if detected:
#         result["area_url"] = f"https://www.acqar.com/areas/{area_to_slug(detected)}"

#     print(f"[DEBUG] top_yield count: {len(context_data.get('top_yield_areas', []))}")
#     print(f"[DEBUG] top_areas count: {len(context_data.get('top_areas', []))}")
#     print(f"[DEBUG] dubai_market_context count: {len(context_data.get('dubai_market_context', []))}")
#     print(f"[DEBUG] has_area_data: {has_area_data}")
#     return result
    












import os
import re
import json
import asyncio
import traceback
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter
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
    "silicon oasis": 91, "bluewaters island": 1754,
    "business bay": 54, "downtown dubai": 10,
    "damac hills 2": 352, "damac hills": 352,
    "damac lagoons": 75266, "tilal al ghaf": 5173,
    "dubai islands": 5178, "creek harbour": 1509,
    "dubai marina": 36, "dubai hills": 53,
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
    "marina": 36, "palm": 410, "difc": 117,
    "impz": 5036, "arjan": 91, "dso": 91,
    "jvc": 59, "jlt": 12, "jumeirah": 23, "deira": 545,
}

AREA_DISPLAY_NAMES = {
    36: "Dubai Marina", 59: "Jumeirah Village Circle (JVC)",
    10: "Downtown Dubai", 54: "Business Bay", 410: "Palm Jumeirah",
    23: "Jumeirah", 53: "Dubai Hills Estate", 12: "Jumeirah Lake Towers (JLT)",
    117: "DIFC", 1509: "Dubai Creek Harbour", 1754: "Bluewaters Island",
    3355: "Dubai South", 41: "Al Furjan", 268: "Motor City",
    67: "Dubai Sports City", 133: "Arabian Ranches", 352: "DAMAC Hills",
    386: "Town Square", 91: "Silicon Oasis", 105: "Al Barsha",
    232: "Mirdif", 13: "Discovery Gardens", 368: "International City",
    25: "Barsha Heights / TECOM", 545: "Deira", 345: "Bur Dubai",
    43: "Meydan", 73: "Jumeirah Park", 347: "Jumeirah Golf Estates",
    51: "Dubailand", 85082: "Expo City Dubai",
}

BEDROOM_KEYS = {
    "0": "Studio", "0.0": "Studio", "1": "1 BR", "1.0": "1 BR",
    "2": "2 BR", "2.0": "2 BR", "3": "3 BR", "3.0": "3 BR",
    "4": "4 BR", "4.0": "4 BR", "5": "5 BR", "5.0": "5 BR",
}

LIFESTYLE_KEYWORDS = [
    "british", "expat", "family", "school", "villa", "community", "kids",
    "children", "safe", "quiet", "beach", "beachfront", "luxury", "affordable",
    "cheap", "budget", "metro", "golf", "waterfront", "off plan", "off-plan",
    "apartment", "studio", "townhouse", "pool", "gym", "furnished",
    "short term", "airbnb", "holiday home", "foreigner", "freehold",
    "first time", "relocat", "new to dubai", "rental income", "high yield",
]

LIFESTYLE_AREA_MAP = {
    "british": [53, 23, 73], "family": [53, 73, 133, 59],
    "school": [53, 73, 133], "expat": [36, 10, 54, 12],
    "beach": [410, 36, 1754], "beachfront": [410, 1754],
    "luxury": [410, 10, 36, 117], "affordable": [59, 91, 13, 368],
    "cheap": [59, 368, 13], "budget": [59, 13, 368],
    "golf": [347, 352, 53], "waterfront": [36, 410, 12, 1754],
    "metro": [25, 12, 54, 10], "airbnb": [36, 10, 54, 1754],
    "short term": [36, 10, 54], "holiday home": [410, 36, 1754],
    "villa": [73, 133, 352, 53], "freehold": [59, 36, 54, 10],
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


def detect_user_type(msg_lower: str) -> str:
    if any(k in msg_lower for k in BROKER_KEYWORDS):   return "broker"
    if any(k in msg_lower for k in SELLER_KEYWORDS):   return "seller"
    if any(k in msg_lower for k in INVESTOR_KEYWORDS): return "investor"
    if any(k in msg_lower for k in BUYER_KEYWORDS):    return "buyer"
    return "general"


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
    for kw in sorted(AREA_ID_MAP, key=len, reverse=True):
        if kw in msg_lower:
            aid = AREA_ID_MAP[kw]
            if aid not in seen: found.append((aid, kw)); seen.add(aid)
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
        emi_match = re.search(r'salary\s+(?:of\s+)?(?:aed\s+)?(\d+)', mc)
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
        (r'\bstudio\b',"Studio"),(r'\b1\s*(?:br|bed|bedroom)\b',"1 BR"),
        (r'\b2\s*(?:br|bed|bedroom)\b',"2 BR"),(r'\b3\s*(?:br|bed|bedroom)\b',"3 BR"),
        (r'\b4\s*(?:br|bed|bedroom)\b',"4 BR"),(r'\bone\s*bed(?:room)?\b',"1 BR"),
        (r'\btwo\s*bed(?:room)?\b',"2 BR"),(r'\bthree\s*bed(?:room)?\b',"3 BR"),
    ]:
        if re.search(pat, m): return label
    return None


def is_vague(msg_lower: str, area_id, is_lifestyle: bool) -> bool:
    if area_id or is_lifestyle: return False
    has_vague = any(p in msg_lower for p in VAGUE_PATTERNS)
    has_specific = any(w in msg_lower for w in [
        "yield","price","psm","sqm","trend","compare","vs","score",
        "invest","return","roi","catalyst","developer","aed","bedroom","studio","villa","apartment",
    ])
    return has_vague and not has_specific and len(msg_lower.split()) < 20


def median_val(values: list):
    if not values: return None
    s = sorted(values); n = len(s); mid = n // 2
    return round((s[mid-1]+s[mid])/2 if n%2==0 else s[mid], 0)


def preferred_name(area_id: int, fallback: str = "") -> str:
    return AREA_DISPLAY_NAMES.get(area_id, fallback.title() if fallback else str(area_id))


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
        ).eq("area_id", area_id).order("sale_year", desc=True).order("sale_month", desc=True).limit(100).execute()
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
        res = supabase.table("area_catalysts").select(
            "catalyst_type, name, description, expected_date, confidence, status"
        ).eq("area_id", area_id).eq("status", "active").order("expected_date", desc=False).limit(5).execute()
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
                if r.get("actual_worth"):  room_worth[label].append(float(r["actual_worth"]))
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

    if catalysts: context_data["area_catalysts"] = catalysts
    if projects:  context_data["top_projects"]   = [{"name": p[0], "transactions": p[1]} for p in projects]


# ─────────────────────────────────────────────────────────────────
# REPLY BUILDERS (unchanged from your working version)
# ─────────────────────────────────────────────────────────────────

def build_lifestyle_reply(ctx: dict, bedrooms: str) -> str:
    lines = []
    lifestyle_tags = ctx.get("lifestyle_tags", [])
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
        if rank:
            lines.append(f"• Dubai Ranking: #{rank} out of all areas")

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

    lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

    return "\n".join(lines)


def build_seller_reply(ctx: dict, bedrooms: str) -> str:
    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    hist  = ctx.get("price_history_by_year", {})
    cats  = ctx.get("area_catalysts", [])
    lines = []

    target_br = bedrooms or "2 BR"
    median_v  = stats.get("median_price_by_bedroom", {}).get(target_br)
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
    bedroom_med = stats.get("median_price_by_bedroom", {})
    if median_v:
        recommended = round(float(median_v) * 1.06)
        all_meds = sorted([v for v in bedroom_med.values() if v])
        if len(all_meds) >= 2:
            lines.append(f"• {target_br} unit price range: {fmt_aed(all_meds[0])} – {fmt_aed(all_meds[-1])} (DLD closed sales)")
        lines.append(f"• Median DLD closed sale for {target_br}: {fmt_aed(median_v)}")
        lines.append(f"• Recommended list price: {fmt_aed(recommended)} (6% above median — leaves negotiation room)")
    distress = intel.get("distress_pct")
    if distress:
        lines.append(f"• Distress sales in area: {distress}% — {'high, price competitively' if float(distress) > 10 else 'low — healthy market for sellers'}")

    if cats:
        lines.append("\n⚡ WHAT COULD HELP YOUR SALE")
        for c in cats[:3]:
            lines.append(f"• {c.get('name','Catalyst')} — {c.get('expected_date','upcoming')} — {c.get('description','infrastructure uplift expected')}")

    lines.append("\n✅ SELLER ACTION PLAN")
    if median_v:
        lines.append(f"• Step 1: List at {fmt_aed(round(float(median_v)*1.06))} — anchored to real DLD data")
    lines.append(f"• Step 2: {'List immediately — rising market rewards early movers' if trend and float(trend)>0 else 'List now — stable demand, avoid waiting for an uncertain uptick'}")
    lines.append("• Step 3: RERA-registered agent — get NOC ready before listing to avoid delays")
    if median_v:
        lines.append(f"• Bottom line: Expect 3–5 viewings in first 2 weeks at {fmt_aed(round(float(median_v)*1.06))}")

    lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

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
            lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','uplift expected')}")

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

    lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

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
            lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')} — {c.get('description','demand uplift expected')}")

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

    lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

    return "\n".join(lines)


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
            lines.append(f"• {c.get('name','')} — {c.get('expected_date','upcoming')}")

    lines.append("\n✅ VERDICT")
    lines.append("• Best for: Investors and end-users looking for an established Dubai community")
    if bmed:
        best_br = list(bmed.keys())[0]
        lines.append(f"• Entry play: {best_br} at {fmt_aed(bmed[best_br])}")
    lines.append("• Watch out for: Service charges and new supply pipeline in the area")

    lines.append(f"\n🔍 Full {area} area profile → https://www.acqar.com/areas/{area_to_slug(area)}")
    

    return "\n".join(lines)


def build_summary(user_type: str, ctx: dict, bedrooms: str) -> str:
    # ── Lifestyle override ──
    lifestyle_areas = []
    for k, v in ctx.items():
        if k.startswith("lifestyle_") and isinstance(v, dict):
            name = (v.get("area_intelligence") or {}).get("area_name_en") or v.get("detected_area", "")
            if name: lifestyle_areas.append(name)
    if lifestyle_areas:
        tags = ctx.get("lifestyle_tags", [])
        priority_tags = [t for t in tags if t in ("british", "family", "school", "kids", "children", "expat", "luxury", "beach", "golf")]
        tag_str = " & ".join(t.title() for t in priority_tags[:2]) if priority_tags else "your profile"
        names = " · ".join(lifestyle_areas[:3])
        return f"Top areas for {tag_str} living in Dubai: {names} — ranked by real DLD data, buyer nationality mix, school proximity, and investment score."

    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    yld   = intel.get("gross_yield_pct"); trend = intel.get("price_trend_pct")
    br    = bedrooms or "2 BR"
    med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")

    if user_type == "buyer":
        if med: return f"{area} is a good choice for home buyers — {br} median is {fmt_aed(med)} on real DLD closed sales. {('Prices rising +' + str(trend) + '% — buy sooner.') if trend and float(trend)>0 else ('Market stable — good time to negotiate hard.' if trend is not None else 'Stable community with strong owner-occupier demand.')}"
        return f"{area} is a well-established Dubai community suited for home buyers and families."
    elif user_type == "seller":
        if med: return f"It's {'a good' if trend is None or float(trend or 0)>=0 else 'a cautious'} time to sell your {br} in {area} — median DLD closed sale is {fmt_aed(med)}. {'Market trending up — sell into strength.' if trend and float(trend)>0 else 'Stable market with active buyer demand.'}"
        return f"Current market conditions in {area} support a sale — list at or above the DLD median to attract serious buyers."
    elif user_type == "investor":
        top_yield = ctx.get("top_yield_areas", [])
        if top_yield:
            top = top_yield[0]
            return f"Dubai's top ROI areas are led by {top.get('area_name_en','')} at {top.get('gross_yield_pct','')}% gross yield — well above the 6.1% Dubai average. These are the strongest buy-to-let plays right now based on real DLD data."
        if yld: return f"{area} offers {yld}% gross yield — {'above' if float(yld)>6.1 else 'at'} the Dubai average of 6.1%. {'Strong BUY for rental income.' if float(yld)>6.5 else 'Solid for capital appreciation.'}"
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

    intel = ctx.get("area_intelligence", {})
    stats = ctx.get("transaction_stats", {})
    area  = ctx.get("detected_area", "this area")
    br    = bedrooms or "2 BR"
    med   = stats.get("median_price_by_bedroom", {}).get(br) or stats.get("avg_worth_aed")
    yld   = intel.get("gross_yield_pct")

    if user_type == "buyer" and med:
        asking = round(float(med) * 1.10)
        return f"{br} DLD median is {fmt_aed(med)} — asking prices typically reach {fmt_aed(asking)}, giving you {fmt_aed(round(float(med)*0.10))} of negotiation room."
    elif user_type == "seller" and med:
        list_price = round(float(med) * 1.06)
        return f"List your {br} at {fmt_aed(list_price)} — 6% above the DLD median of {fmt_aed(med)} — and expect 3–5 viewings in the first 2 weeks."
    elif user_type == "investor":
        top_yield = ctx.get("top_yield_areas", [])
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

    if med:
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

    top_yield = ctx.get("top_yield_areas", [])
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
• Monthly payment capacity: AED [X]
• Estimated property budget: AED [X] – AED [X]
• Minimum cash you MUST have: AED [X] (DLD 4% is mandatory regardless)
• Best areas in this budget: [Area 1] · [Area 2] · [Area 3]

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
1. Be specific — real numbers, real developer names, real regulations
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

@router.post("/intelligence/chat")
async def intelligence_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        return {"type": "text", "reply": "Please ask a question about Dubai real estate."}

    msg_lower    = message.lower()
    context_data = {}
    raw          = ""

    user_type = detect_user_type(msg_lower)

    area_id, detected_area = get_area_id(msg_lower)
    all_area_ids           = get_all_area_ids(msg_lower)
    budget                 = extract_budget(message)
    bedrooms               = extract_bedrooms(message)
    is_lifestyle           = any(w in msg_lower for w in LIFESTYLE_KEYWORDS)
    is_comparison          = (
        len(all_area_ids) >= 2 or
        any(w in msg_lower for w in ["vs", "versus", "compare", "compared to"])
    )

    if is_vague(msg_lower, area_id, is_lifestyle):
        return {
            "type": "text",
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
        context_data["query_type"]     = "lifestyle"
        context_data["lifestyle_tags"] = [w for w in LIFESTYLE_KEYWORDS if w in msg_lower]
        lifestyle_ids = get_lifestyle_areas(msg_lower)
        subs = [{} for _ in lifestyle_ids]
        await asyncio.gather(*[build_area_context_async(lid, "", sub) for lid, sub in zip(lifestyle_ids, subs)])
        for lid, sub in zip(lifestyle_ids, subs):
            name = sub.get("area_intelligence", {}).get("area_name_en") or preferred_name(lid)
            context_data[f"lifestyle_{name.replace(' ','_').lower()}"] = sub

    if any(w in msg_lower for w in YIELD_KEYWORDS) and not area_id:
        top = await _run(fetch_top_yield_areas)
        if top: context_data["top_yield_areas"] = top

    if any(w in msg_lower for w in MARKET_KEYWORDS) and not is_lifestyle and not is_comparison and not area_id:
        top = await _run(fetch_top_areas_intelligence)
        if top: context_data["top_areas"] = top

    if budget and not area_id and not is_lifestyle:
        top = await _run(fetch_top_areas_intelligence, 30)
        if top: context_data["budget_search_areas"] = top

   # Also check lifestyle sub-contexts
    _lifestyle_keys = [k for k in context_data if k.startswith("lifestyle_")]

    has_area_data = bool(
    context_data.get("area_intelligence") or
    context_data.get("transaction_stats") or
    context_data.get("top_yield_areas") or
    context_data.get("top_areas") or
    _lifestyle_keys  # ← catches British/family/school lifestyle queries
)

    # ── CHANGE 3: If no area data, still fetch top areas for context ──
    if not has_area_data and not area_id:
        top = await _run(fetch_top_areas_intelligence, 10)
        if top:
            context_data["dubai_market_context"] = top

    if has_area_data:
        if _lifestyle_keys:           reply = build_lifestyle_reply(context_data, bedrooms)
        elif user_type == "buyer":    reply = build_buyer_reply(context_data, bedrooms)
        elif user_type == "seller":   reply = build_seller_reply(context_data, bedrooms)
        elif user_type == "investor": reply = build_investor_reply(context_data, bedrooms)
        elif user_type == "broker":   reply = build_broker_reply(context_data, bedrooms)
        else:                         reply = build_general_reply(context_data, bedrooms)

        result = {
            "type":      "structured",
            "user_type": user_type,
            "summary":   build_summary(user_type, context_data, bedrooms),
            "reply":     reply,
            "charts":    build_charts(context_data, user_type),
            "insight":   build_insight(user_type, context_data, bedrooms),
        }
    else:
        # No area DB match — LLM answers with full expert knowledge + market context
        db_context = ""
        if context_data.get("dubai_market_context"):
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
        messages.append({
            "role": "user",
            "content": f"Question: {message}{db_context}\n\nAnswer this fully and specifically. Reply with JSON only."
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
            result["type"] = "structured"; result["user_type"] = user_type
            result.pop("data_source", None)

            # Try DB data first
            top_fallback = (
                context_data.get("top_yield_areas") or
                context_data.get("top_areas") or
                context_data.get("dubai_market_context") or
                []
            )
            if top_fallback:
                result["area_links"] = [
                    {
                        "name": a.get("area_name_en", ""),
                        "url": f"https://www.acqar.com/areas/{area_to_slug(a.get('area_name_en', ''))}"
                    }
                    for a in top_fallback[:8] if a.get("area_name_en")
                ]
            else:
                # Extract area names from LLM reply text and build links
                reply_text = result.get("reply", "")
                extracted_links = []
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
        except Exception as e:
            print(f"[ACQAR] LLM error: {e}")
            result = {"type":"text","summary":"","reply":"I hit an error. Please try rephrasing your question.","charts":[],"insight":""}
    intel = context_data.get("area_intelligence", {})
    if not intel:
        for v in context_data.values():
            if isinstance(v, dict) and "area_intelligence" in v:
                intel = v["area_intelligence"]; break

    if intel:
        result["score"]        = intel.get("investment_score")
        result["verdict"]      = intel.get("verdict")
        result["yield_pct"]    = intel.get("gross_yield_pct")
        result["price_trend"]  = intel.get("price_trend_pct")
        result["ranking"]      = intel.get("ranking_rank")
        result["distress_pct"] = intel.get("distress_pct")
        y = intel.get("gross_yield_pct")
        if y: result["yield_vs_dubai_avg"] = round(float(y) - 6.1, 2)

# ── Area links — only areas actually in the reply ──
    reply_text = result.get("reply", "")
    reply_lower = reply_text.lower().replace(" ", "").replace("(", "").replace(")", "")

    final_links = []
    seen_urls   = set()

   # 1. Lifestyle areas — only those mentioned in reply
    for k in context_data:
        if k.startswith("lifestyle_"):
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

    # 3. Single detected area fallback
    if not final_links:
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
    if detected:
        result["area_url"] = f"https://www.acqar.com/areas/{area_to_slug(detected)}"

    print(f"[DEBUG] top_yield count: {len(context_data.get('top_yield_areas', []))}")
    print(f"[DEBUG] top_areas count: {len(context_data.get('top_areas', []))}")
    print(f"[DEBUG] dubai_market_context count: {len(context_data.get('dubai_market_context', []))}")
    print(f"[DEBUG] has_area_data: {has_area_data}")
    return result
    










