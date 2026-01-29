import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env")  # ✅ load env first

import joblib
import numpy as np
import pandas as pd
import requests
import math

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# -------------------------------------------------
# Env
# -------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

TX_TABLE = os.getenv("TX_TABLE", "avm")
TX_BATCH = int(os.getenv("TX_BATCH", "5000"))
TX_MAX_ROWS = int(os.getenv("TX_MAX_ROWS", "200000"))
TX_MIN_DATE = os.getenv("TX_MIN_DATE", "2020-01-01")

MODEL_BUCKET = os.getenv("MODEL_BUCKET", "models")
MODEL_OBJECT = os.getenv("MODEL_OBJECT", "avm_xgb_bundle2.joblib")
MODEL_PUBLIC = os.getenv("MODEL_PUBLIC", "false").lower() in ("1", "true", "yes", "y")

CACHE_DIR = Path(os.getenv("CACHE_DIR", "/tmp"))
CACHE_DIR.mkdir(parents=True, exist_ok=True)
MODEL_CACHE_PATH = CACHE_DIR / "model_bundle.joblib"

CURRENCY = os.getenv("CURRENCY", "AED")
SQM_TO_SQFT = 10.763910416709722

# -------------------------------------------------
# App
# -------------------------------------------------
app = FastAPI(title="AVM API", version="2.0-supabase")

# -------------------------------------------------
# CORS
# -------------------------------------------------
cors_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_env:
    allow_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
else:
    allow_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "https://acqar.vercel.app",   # ✅ removed trailing slash
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Globals loaded on startup
# -------------------------------------------------
bundle: Optional[dict] = None
feature_cols: List[str] = []
LOG_TARGET: bool = False
DATE_COL: str = "instance_date"
num_cols: List[str] = []
cat_cols: List[str] = []
tx: pd.DataFrame = pd.DataFrame()
STARTUP_WARNINGS: List[str] = []

# -------------------------------------------------
# Request schema
# -------------------------------------------------
class PropertyData(BaseModel):
    property_type_en: Optional[str] = None
    area_name_en: Optional[str] = None
    project_name_en: Optional[str] = None
    master_project_en: Optional[str] = None
    rooms_en: Optional[Any] = None
    procedure_area: float = Field(default=0.0, ge=0.0)
    instance_date: Optional[str] = None

    model_config = {"extra": "allow"}

class PropertyInput(BaseModel):
    data: PropertyData

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _auth_headers() -> Dict[str, str]:
    key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    return {"apikey": key, "Authorization": f"Bearer {key}"}

def _norm_text(x: Any) -> str:
    if x is None:
        return ""
    return str(x).strip()

def _to_int_rooms(x: Any) -> Optional[int]:
    if x is None:
        return None
    s = str(x).strip().lower()
    digits = "".join([ch for ch in s if ch.isdigit()])
    if digits:
        try:
            return int(digits)
        except:
            return None
    try:
        return int(float(x))
    except:
        return None

def _add_date_parts_to_row(row: Dict[str, Any], date_col: str) -> Dict[str, Any]:
    if date_col not in row or row.get(date_col) in (None, "", "null"):
        return row

    d = pd.to_datetime(row.get(date_col), errors="coerce")
    row[f"{date_col}_year"] = int(d.year) if pd.notna(d) else None
    row[f"{date_col}_month"] = int(d.month) if pd.notna(d) else None
    row[f"{date_col}_day"] = int(d.day) if pd.notna(d) else None
    row[f"{date_col}_dow"] = int(d.dayofweek) if pd.notna(d) else None
    row.pop(date_col, None)
    return row

def _build_feature_frame(user_data: Dict[str, Any]) -> pd.DataFrame:
    if bundle is None:
        raise RuntimeError("Model bundle not loaded")

    row = dict(user_data)

    expects_parts = any(c.startswith(f"{DATE_COL}_") for c in feature_cols)
    if expects_parts:
        row = _add_date_parts_to_row(row, DATE_COL)

    aligned = {c: row.get(c, None) for c in feature_cols}
    X = pd.DataFrame([aligned], columns=feature_cols)

    for c in num_cols:
        if c in X.columns:
            X[c] = pd.to_numeric(X[c], errors="coerce")

    return X

def predict_price_per_m2(user_data: Dict[str, Any]) -> float:
    if bundle is None:
        raise RuntimeError("Model bundle not loaded")

    X = _build_feature_frame(user_data)
    X_enc = bundle["preprocess"].transform(X)
    pred = bundle["model"].predict(X_enc)

    if LOG_TARGET:
        return float(np.expm1(pred)[0])
    return float(pred[0])

def compute_total_value(price_per_m2: float, user_data: Dict[str, Any]) -> float:
    area = float(user_data.get("procedure_area", 0) or 0)
    return float(price_per_m2 * area)

# ✅ JSON-safe cleaning (NaN/Inf -> None)
def clean_json(x):
    if isinstance(x, (np.floating, np.integer)):
        x = x.item()

    if x is pd.NA:
        return None

    if isinstance(x, float):
        if math.isnan(x) or math.isinf(x):
            return None
        return x

    if isinstance(x, pd.Timestamp):
        return None if pd.isna(x) else x.isoformat()

    if isinstance(x, dict):
        return {k: clean_json(v) for k, v in x.items()}

    if isinstance(x, list):
        return [clean_json(v) for v in x]

    return x

# -------------------------------------------------
# Supabase Storage: download model bundle
# -------------------------------------------------
def _storage_public_url(bucket: str, obj_path: str) -> str:
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{obj_path}"

def _storage_signed_url(bucket: str, obj_path: str, expires_in: int = 3600) -> str:
    endpoint = f"{SUPABASE_URL}/storage/v1/object/sign/{bucket}/{obj_path}"
    r = requests.post(endpoint, headers=_auth_headers(), json={"expiresIn": expires_in}, timeout=60)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"Signed URL failed: {r.status_code} {r.text[:200]}")
    data = r.json()
    signed = data.get("signedURL") or data.get("signedUrl") or data.get("signed_url")
    if not signed:
        raise RuntimeError(f"Signed URL missing in response: {data}")
    if signed.startswith("http"):
        return signed
    return f"{SUPABASE_URL}{signed}"

def _download_model_from_storage() -> Path:
    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL missing")

    if MODEL_CACHE_PATH.exists() and MODEL_CACHE_PATH.stat().st_size > 1024:
        return MODEL_CACHE_PATH

    if MODEL_PUBLIC:
        url = _storage_public_url(MODEL_BUCKET, MODEL_OBJECT)
        r = requests.get(url, timeout=120)
        if r.status_code != 200:
            raise RuntimeError(f"Public model download failed: {r.status_code} {r.text[:200]}")
    else:
        if not (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY):
            raise RuntimeError("No Supabase key available to download model (need SERVICE_ROLE or ANON + permissions)")
        signed_url = _storage_signed_url(MODEL_BUCKET, MODEL_OBJECT, expires_in=3600)
        r = requests.get(signed_url, timeout=120)
        if r.status_code != 200:
            raise RuntimeError(f"Signed model download failed: {r.status_code} {r.text[:200]}")

    MODEL_CACHE_PATH.write_bytes(r.content)
    return MODEL_CACHE_PATH

# -------------------------------------------------
# Supabase DB: load transactions
# -------------------------------------------------
def _load_tx_from_supabase() -> pd.DataFrame:
    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL missing")
    if not (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY):
        raise RuntimeError("Supabase key missing (SUPABASE_SERVICE_ROLE_KEY recommended)")

    endpoint = f"{SUPABASE_URL}/rest/v1/{TX_TABLE}"
    headers = _auth_headers()

    select_cols = [
        "instance_date",
        "area_name_en",
        "project_name_en",
        "master_project_en",
        "property_type_en",
        "property_sub_type_en",
        "rooms_en",
        "procedure_area",
        "price_per_sqm",
        "meter_sale_price",
        "actual_worth",
        "property_usage_en",
        "transaction_id",
    ]

    all_rows: List[dict] = []
    offset = 0

    while True:
        if offset >= TX_MAX_ROWS:
            STARTUP_WARNINGS.append(f"TX_MAX_ROWS cap reached ({TX_MAX_ROWS}). Loaded partial dataset from Supabase.")
            break

        params = {
            "select": ",".join(select_cols),
            "instance_date": f"gte.{TX_MIN_DATE}",
            "limit": str(TX_BATCH),
            "offset": str(offset),
            "order": "instance_date.desc",
        }

        r = requests.get(endpoint, headers=headers, params=params, timeout=120)
        if r.status_code != 200:
            raise RuntimeError(f"Supabase fetch failed: {r.status_code} {r.text[:200]}")

        batch = r.json()
        if not batch:
            break

        all_rows.extend(batch)
        offset += len(batch)

        if len(batch) < TX_BATCH:
            break

    df = pd.DataFrame(all_rows)
    if df.empty:
        return df

    for c in ["meter_sale_price", "price_per_sqm", "procedure_area", "actual_worth"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    if "rooms_en" in df.columns:
        df["rooms_en"] = df["rooms_en"].astype(str)

    if "instance_date" in df.columns:
        df["_instance_date"] = pd.to_datetime(df["instance_date"], errors="coerce")
    else:
        df["_instance_date"] = pd.NaT

    if "price_per_sqm" not in df.columns or df["price_per_sqm"].isna().all():
        if "meter_sale_price" in df.columns:
            df["price_per_sqm"] = pd.to_numeric(df["meter_sale_price"], errors="coerce")

    essentials = [c for c in ["procedure_area", "price_per_sqm"] if c in df.columns]
    if essentials:
        df = df.dropna(subset=essentials).copy()

    return df

# -------------------------------------------------
# Startup
# -------------------------------------------------
@app.on_event("startup")
def _startup():
    global bundle, feature_cols, LOG_TARGET, DATE_COL, num_cols, cat_cols, tx

    STARTUP_WARNINGS.clear()

    # 1) Load model
    try:
        model_path = _download_model_from_storage()
        bundle = joblib.load(str(model_path))
        feature_cols = list(bundle.get("feature_columns", []))
        LOG_TARGET = bool(bundle.get("log_target", False))
        DATE_COL = bundle.get("date_parts_from", "instance_date")
        num_cols = list(bundle.get("numeric_columns", []))
        cat_cols = list(bundle.get("categorical_columns", []))
    except Exception as e:
        STARTUP_WARNINGS.append(f"Failed to load model from Supabase Storage: {e}")
        bundle = None

    # 2) Load transactions
    try:
        tx = _load_tx_from_supabase()
        if tx.empty:
            STARTUP_WARNINGS.append("Supabase returned 0 rows for transactions (table avm).")
    except Exception as e:
        STARTUP_WARNINGS.append(f"Failed to load transactions from Supabase table '{TX_TABLE}': {e}")
        tx = pd.DataFrame()

# -------------------------------------------------
# Comparables (✅ FIXED: cleans NaN before returning)
# -------------------------------------------------
def get_comparables(user_data: Dict[str, Any], top_k: int = 10):
    if tx.empty:
        return {"comparables": [], "comparables_meta": {"used_level": "none", "count": 0}}

    df = tx.copy()

    area = _norm_text(user_data.get("area_name_en"))
    project = _norm_text(user_data.get("project_name_en"))
    ptype = _norm_text(user_data.get("property_type_en"))
    rooms = _to_int_rooms(user_data.get("rooms_en"))
    subj_area_sqm = float(user_data.get("procedure_area", 0) or 0)

    ptype_norm = ptype.lower()
    if "property_sub_type_en" in df.columns:
        if ptype_norm == "apartment":
            df = df[df["property_sub_type_en"].astype(str).str.contains("flat", case=False, na=False)]
        elif ptype_norm == "villa":
            df = df[df["property_sub_type_en"].astype(str).str.contains("villa", case=False, na=False)]
        elif ptype_norm == "townhouse":
            df = df[df["property_sub_type_en"].astype(str).str.contains("townhouse", case=False, na=False)]

    if rooms is not None and "rooms_en" in df.columns:
        rcol = pd.to_numeric(df["rooms_en"].astype(str).str.extract(r"(\d+)")[0], errors="coerce")
        df = df[rcol == rooms]

    if subj_area_sqm > 0 and "procedure_area" in df.columns:
        low, high = subj_area_sqm * 0.8, subj_area_sqm * 1.2
        df = df[(df["procedure_area"] >= low) & (df["procedure_area"] <= high)]

    used_level = "city"
    if df.empty:
        df = tx.copy()
        used_level = "area_loose"
        if area and "area_name_en" in df.columns:
            df = df[df["area_name_en"].astype(str).str.contains(area, case=False, na=False)].copy()

    if df.empty:
        return {"comparables": [], "comparables_meta": {"used_level": "none", "count": 0}}

    if project and "project_name_en" in df.columns:
        df1 = df[df["project_name_en"].astype(str).str.contains(project, case=False, na=False)].copy()
        if len(df1) >= 3:
            df = df1
            used_level = "project"

    if used_level in ("city", "area_loose") and project and "master_project_en" in df.columns and "project_name_en" in df.columns:
        if "project_name_en" in tx.columns and "master_project_en" in tx.columns:
            mp = tx.loc[
                tx["project_name_en"].astype(str).str.contains(project, case=False, na=False),
                "master_project_en"
            ].dropna()
            if len(mp) > 0:
                master_project = str(mp.iloc[0])
                df2 = df[df["master_project_en"].astype(str).str.contains(master_project, case=False, na=False)].copy()
                if len(df2) >= 3:
                    df = df2
                    used_level = "master_project"

    if used_level in ("city", "area_loose") and area and "area_name_en" in df.columns:
        df3 = df[df["area_name_en"].astype(str).str.contains(area, case=False, na=False)].copy()
        if len(df3) >= 3:
            df = df3
            used_level = "area"

    if df.empty:
        return {"comparables": [], "comparables_meta": {"used_level": "none", "count": 0}}

    if subj_area_sqm > 0 and "procedure_area" in df.columns:
        df = df.assign(_size_diff=(df["procedure_area"] - subj_area_sqm).abs())
    else:
        df = df.assign(_size_diff=0.0)

    if "_instance_date" in df.columns:
        df = df.sort_values(["_size_diff", "_instance_date"], ascending=[True, False])
    else:
        df = df.sort_values(["_size_diff"], ascending=True)

    denom = max(subj_area_sqm, 1.0)
    df["_match_pct"] = (1.0 - (df["_size_diff"] / denom)).clip(0.0, 1.0) * 100.0

    ppm2_col = "price_per_sqm" if "price_per_sqm" in df.columns else "meter_sale_price"
    df[ppm2_col] = pd.to_numeric(df[ppm2_col], errors="coerce")

    if "actual_worth" in df.columns and df["actual_worth"].notna().any():
        df["price_aed"] = pd.to_numeric(df["actual_worth"], errors="coerce")
    else:
        df["price_aed"] = df[ppm2_col] * df["procedure_area"]

    df["size_sqft"] = df["procedure_area"] * SQM_TO_SQFT
    df["price_per_sqft"] = (df[ppm2_col] / SQM_TO_SQFT)
    df["sold_date"] = df["instance_date"] if "instance_date" in df.columns else None
    df["match_pct"] = df["_match_pct"].round(0)

    if "project_name_en" in df.columns:
        df["building_name_en"] = df["project_name_en"]

    dedupe_keys = [c for c in ["sold_date", "price_aed", "procedure_area", "project_name_en"] if c in df.columns]
    if dedupe_keys:
        df = df.drop_duplicates(subset=dedupe_keys, keep="first")

    cols_to_return = [c for c in [
        "area_name_en",
        "project_name_en",
        "master_project_en",
        "building_name_en",
        "property_type_en",
        "property_sub_type_en",
        "rooms_en",
        "procedure_area",
        "size_sqft",
        "price_aed",
        "price_per_sqft",
        "sold_date",
        "match_pct",
    ] if c in df.columns]

    comps = df.head(top_k)[cols_to_return].to_dict(orient="records")
    comps = clean_json(comps)  # ✅ CRITICAL FIX

    return {
        "comparables": comps,
        "comparables_meta": {"used_level": used_level, "count": len(comps)},
    }

# -------------------------------------------------
# Charts (✅ FIXED: clean_json on return)
# -------------------------------------------------
def chart_data(user_data: Dict[str, Any]):
    if tx.empty:
        return {"distribution": [], "trend": []}

    df = tx.copy()

    area = _norm_text(user_data.get("area_name_en"))
    if area and "area_name_en" in df.columns:
        df = df[df["area_name_en"].astype(str).str.contains(area, case=False, na=False)].copy()

    price_col = "price_per_sqm" if "price_per_sqm" in df.columns else (
        "meter_sale_price" if "meter_sale_price" in df.columns else None
    )
    if not price_col:
        return {"distribution": [], "trend": []}

    values = pd.to_numeric(df[price_col], errors="coerce").dropna().astype(float).values
    dist = []
    if len(values) >= 20:
        hist, edges = np.histogram(values, bins=20)
        dist = [{"bin_start": float(edges[i]), "bin_end": float(edges[i + 1]), "count": int(hist[i])}
                for i in range(len(hist))]

    trend = []
    if "_instance_date" in df.columns:
        df2 = df.dropna(subset=["_instance_date"]).copy()
        if not df2.empty:
            cutoff = pd.Timestamp.today() - pd.DateOffset(months=60)
            df2 = df2[df2["_instance_date"] >= cutoff].copy()

            df2["_month"] = df2["_instance_date"].dt.to_period("M").astype(str)
            df2[price_col] = pd.to_numeric(df2[price_col], errors="coerce")
            g = df2.groupby("_month")[price_col].median().reset_index()

            for _, row in g.iterrows():
                v = row[price_col]
                if pd.isna(v) or not np.isfinite(v):
                    continue
                trend.append({"month": row["_month"], "median_price_per_sqm": float(v)})

    return clean_json({"distribution": dist, "trend": trend})

# -------------------------------------------------
# Debug / Lookup
# -------------------------------------------------
@app.get("/debug/columns")
def debug_columns():
    return clean_json({
        "tx_rows": int(len(tx)),
        "columns_count": int(len(tx.columns)),
        "has_area_name_en": "area_name_en" in tx.columns,
        "has_project_name_en": "project_name_en" in tx.columns,
        "has_rooms_en": "rooms_en" in tx.columns,
        "has_property_type_en": "property_type_en" in tx.columns,
        "has_meter_sale_price": "meter_sale_price" in tx.columns,
        "has_price_per_sqm": "price_per_sqm" in tx.columns,
        "has_instance_date": "instance_date" in tx.columns,
        "sample_columns": list(tx.columns)[:80],
        "warnings": STARTUP_WARNINGS,
    })

@app.get("/lookup/areas")
def lookup_areas(limit: int = 5000):
    if tx.empty or "area_name_en" not in tx.columns:
        return []
    vals = tx["area_name_en"].dropna().astype(str).str.strip()
    vals = vals[vals != ""].unique().tolist()
    vals.sort()
    return vals[: max(1, min(int(limit), 20000))]

@app.get("/lookup/projects")
def lookup_projects(area: str = Query(default=""), limit: int = 5000):
    if tx.empty or "project_name_en" not in tx.columns:
        return []
    df = tx
    a = area.strip()
    if a and "area_name_en" in df.columns:
        df = df[df["area_name_en"].astype(str).str.contains(a, case=False, na=False)]
    vals = df["project_name_en"].dropna().astype(str).str.strip()
    vals = vals[vals != ""].unique().tolist()
    vals.sort()
    return vals[: max(1, min(int(limit), 20000))]

# -------------------------------------------------
# Main endpoints
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "service": "AVM API", "version": app.version}

@app.get("/health")
def health():
    return clean_json({
        "status": "ok" if bundle is not None else "degraded",
        "model_loaded": bundle is not None,
        "model_source": "supabase_storage",
        "model_bucket": MODEL_BUCKET,
        "model_object": MODEL_OBJECT,
        "tx_loaded": not tx.empty,
        "tx_source": f"supabase_table:{TX_TABLE}",
        "tx_rows": int(len(tx)),
        "features_expected": int(len(feature_cols)),
        "log_target": LOG_TARGET,
        "date_parts_from": DATE_COL,
        "warnings": STARTUP_WARNINGS,
    })

@app.post("/predict")
def predict(inp: PropertyInput):
    if bundle is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Check /health")

    user_data = inp.data.model_dump()
    ppm2 = predict_price_per_m2(user_data)
    total = compute_total_value(ppm2, user_data)

    return clean_json({
        "currency": CURRENCY,
        "predicted_meter_sale_price": ppm2,
        "procedure_area": float(user_data.get("procedure_area", 0) or 0),
        "total_valuation": total,
    })

@app.post("/comparables")
def comparables(inp: PropertyInput):
    user_data = inp.data.model_dump()
    res = get_comparables(user_data, top_k=10)
    return clean_json({"currency": CURRENCY, **res})

@app.post("/charts")
def charts(inp: PropertyInput):
    user_data = inp.data.model_dump()
    return clean_json(chart_data(user_data))

@app.post("/predict_with_comparables")
def predict_with_comparables(inp: PropertyInput):
    if bundle is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Check /health")

    user_data = inp.data.model_dump()
    ppm2 = predict_price_per_m2(user_data)
    total = compute_total_value(ppm2, user_data)
    comps = get_comparables(user_data, top_k=10)
    ch = chart_data(user_data)

    return clean_json({
        "currency": CURRENCY,
        "predicted_meter_sale_price": ppm2,
        "procedure_area": float(user_data.get("procedure_area", 0) or 0),
        "total_valuation": total,
        "comparables": comps["comparables"],
        "comparables_meta": comps["comparables_meta"],
        "charts": ch,
    })
