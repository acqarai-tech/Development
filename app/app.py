from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

# -------------------------------------------------
# Robust paths: assumes this file is /app/app.py
# -------------------------------------------------
APP_DIR = Path(__file__).resolve().parent          # .../app
BASE_DIR = APP_DIR.parent                          # project root

MODEL_PATH = BASE_DIR / "models" / "avm_xgb_bundle2.joblib"
TRANSACTIONS_PATH = BASE_DIR / "data" / "avm_gold_rics_ready.csv.gz"
CURRENCY = "AED"
SQM_TO_SQFT = 10.763910416709722

app = FastAPI(title="AVM API", version="1.2")

# -------------------------------------------------
# CORS
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://truvalu-backend-1.onrender.com",
        "https://acqar-mvp.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Load model at startup
# -------------------------------------------------
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

bundle = joblib.load(str(MODEL_PATH))

feature_cols: List[str] = bundle["feature_columns"]
LOG_TARGET = bool(bundle.get("log_target", False))
DATE_COL = bundle.get("date_parts_from", "instance_date")  # training used this
num_cols = bundle.get("numeric_columns", [])
cat_cols = bundle.get("categorical_columns", [])

# -------------------------------------------------
# Load transactions for comps/charts (optional)
# -------------------------------------------------
def _load_tx() -> pd.DataFrame:
    if not TRANSACTIONS_PATH.exists():
        return pd.DataFrame()

    df = pd.read_csv(str(TRANSACTIONS_PATH), compression="gzip", low_memory=False)

    if "trans_group_en" in df.columns:
        df = df[df["trans_group_en"] == "Sales"].copy()

    # numeric fields we use
    for c in ["meter_sale_price", "price_per_sqm", "procedure_area", "actual_worth", "rooms_en"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    if "instance_date" in df.columns:
        df["_instance_date"] = pd.to_datetime(df["instance_date"], errors="coerce")
    else:
        df["_instance_date"] = pd.NaT

    # keep minimum essentials for comps
    essentials = []
    if "procedure_area" in df.columns:
        essentials.append("procedure_area")
    # total price preferred, otherwise ppm2 must exist
    if "actual_worth" in df.columns:
        essentials.append("actual_worth")
    elif "price_per_sqm" in df.columns:
        essentials.append("price_per_sqm")
    elif "meter_sale_price" in df.columns:
        essentials.append("meter_sale_price")

    if essentials:
        df = df.dropna(subset=essentials).copy()

    return df

tx = _load_tx()

# ------------ Input Schema ------------
class PropertyInput(BaseModel):
    data: Dict[str, Any]

# ------------ Feature alignment for model ------------
def _add_date_parts_to_row(row: Dict[str, Any], date_col: str) -> Dict[str, Any]:
    if date_col not in row:
        return row

    d = pd.to_datetime(row.get(date_col), errors="coerce")
    row[f"{date_col}_year"] = int(d.year) if pd.notna(d) else None
    row[f"{date_col}_month"] = int(d.month) if pd.notna(d) else None
    row[f"{date_col}_day"] = int(d.day) if pd.notna(d) else None
    row[f"{date_col}_dow"] = int(d.dayofweek) if pd.notna(d) else None

    # training dropped original date column
    row.pop(date_col, None)
    return row

def _build_feature_frame(user_data: Dict[str, Any]) -> pd.DataFrame:
    row = dict(user_data)

    # apply date parts if model expects them
    expects_parts = any(c.startswith(f"{DATE_COL}_") for c in feature_cols)
    if expects_parts:
        row = _add_date_parts_to_row(row, DATE_COL)

    aligned = {c: row.get(c, None) for c in feature_cols}
    X = pd.DataFrame([aligned], columns=feature_cols)

    # numeric coercion same as training
    for c in num_cols:
        if c in X.columns:
            X[c] = pd.to_numeric(X[c], errors="coerce")

    return X

# ------------ Prediction helpers ------------
def predict_price_per_m2(user_data: dict) -> float:
    X = _build_feature_frame(user_data)
    X_enc = bundle["preprocess"].transform(X)
    pred = bundle["model"].predict(X_enc)

    if LOG_TARGET:
        return float(np.expm1(pred)[0])
    return float(pred[0])

def compute_total_value(price_per_m2: float, user_data: dict) -> float:
    area = float(user_data.get("procedure_area", 0) or 0)
    return float(price_per_m2 * area)

# ------------ Comparables (report-ready) ------------
def get_comparables(user_data: dict, top_k: int = 10):
    """
    Returns:
      {
        "comparables": [ ... report-ready rows ... ],
        "comparables_meta": {"used_level": "...", "count": N}
      }
    """
    if tx.empty:
        return {"comparables": [], "comparables_meta": {"used_level": "none", "count": 0}}

    df = tx.copy()

    # subject fields
    area = user_data.get("area_name_en")
    project = user_data.get("project_name_en")
    ptype = user_data.get("property_type_en")
    rooms = user_data.get("rooms_en")
    subj_area_sqm = float(user_data.get("procedure_area", 0) or 0)

    # base filters (type/rooms/size)
    if ptype and "property_type_en" in df.columns:
        df = df[df["property_type_en"] == ptype]

    if rooms is not None and "rooms_en" in df.columns:
        df = df[df["rooms_en"] == rooms]

    if subj_area_sqm > 0 and "procedure_area" in df.columns:
        low, high = subj_area_sqm * 0.8, subj_area_sqm * 1.2
        df = df[(df["procedure_area"] >= low) & (df["procedure_area"] <= high)]

    if df.empty:
        return {"comparables": [], "comparables_meta": {"used_level": "none", "count": 0}}

    # RICS-style fallback
    used_level = "city"

    # Level 1: same project (best)
    if project and "project_name_en" in df.columns:
        df1 = df[df["project_name_en"] == project].copy()
        if len(df1) >= 3:
            df = df1
            used_level = "project"

    # Level 2: master_project cluster (if we can find the master for the project)
    if used_level == "city" and project and "master_project_en" in df.columns and "project_name_en" in tx.columns:
        mp = tx.loc[tx["project_name_en"] == project, "master_project_en"].dropna()
        if len(mp) > 0:
            master_project = mp.iloc[0]
            df2 = df[df["master_project_en"] == master_project].copy()
            if len(df2) >= 3:
                df = df2
                used_level = "master_project"

    # Level 3: district/area
    if used_level == "city" and area and "area_name_en" in df.columns:
        df3 = df[df["area_name_en"] == area].copy()
        if len(df3) >= 3:
            df = df3
            used_level = "area"

    if df.empty:
        return {"comparables": [], "comparables_meta": {"used_level": "none", "count": 0}}

    # similarity score (closest size + recency)
    if subj_area_sqm > 0 and "procedure_area" in df.columns:
        df = df.assign(_size_diff=(df["procedure_area"] - subj_area_sqm).abs())
    else:
        df = df.assign(_size_diff=0.0)

    if "_instance_date" in df.columns:
        df = df.sort_values(["_size_diff", "_instance_date"], ascending=[True, False])
    else:
        df = df.sort_values(["_size_diff"], ascending=True)

    # match %
    denom = max(subj_area_sqm, 1.0)
    df["_match_pct"] = (1.0 - (df["_size_diff"] / denom)).clip(0.0, 1.0) * 100.0

    # choose ppm2 column
    ppm2_col = "price_per_sqm" if "price_per_sqm" in df.columns else "meter_sale_price"
    if ppm2_col in df.columns:
        df[ppm2_col] = pd.to_numeric(df[ppm2_col], errors="coerce")

    # total price (AED)
    if "actual_worth" in df.columns:
        df["actual_worth"] = pd.to_numeric(df["actual_worth"], errors="coerce")
        df["price_aed"] = df["actual_worth"]
    else:
        # fallback estimate
        df["price_aed"] = df[ppm2_col] * df["procedure_area"]

    # report fields
    df["size_sqft"] = df["procedure_area"] * SQM_TO_SQFT
    df["price_per_sqft"] = df[ppm2_col] / SQM_TO_SQFT
    df["sold_date"] = df["instance_date"] if "instance_date" in df.columns else None
    df["match_pct"] = df["_match_pct"].round(0)

    # NOTE: dataset doesn't have building_name_en -> alias for frontend
    if "project_name_en" in df.columns:
        df["building_name_en"] = df["project_name_en"]

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

    return {
        "comparables": comps,
        "comparables_meta": {"used_level": used_level, "count": len(comps)}
    }

# ------------ Optional chart endpoint ------------
def chart_data(user_data: dict):
    if tx.empty:
        return {"distribution": [], "trend": []}

    df = tx.copy()
    area = user_data.get("area_name_en")
    if area and "area_name_en" in df.columns:
        df = df[df["area_name_en"] == area].copy()

    dist = []
    if "meter_sale_price" in df.columns:
        values = df["meter_sale_price"].dropna().astype(float).values
        if len(values) >= 20:
            hist, edges = np.histogram(values, bins=20)
            dist = [{"bin_start": float(edges[i]), "bin_end": float(edges[i + 1]), "count": int(hist[i])}
                    for i in range(len(hist))]

    trend = []
    if "_instance_date" in df.columns and "meter_sale_price" in df.columns:
        df2 = df.dropna(subset=["_instance_date"]).copy()
        if not df2.empty:
            df2["_month"] = df2["_instance_date"].dt.to_period("M").astype(str)
            g = df2.groupby("_month")["meter_sale_price"].median().reset_index()
            trend = [{"month": row["_month"], "median_meter_sale_price": float(row["meter_sale_price"])}
                     for _, row in g.iterrows()]

    return {"distribution": dist, "trend": trend}

# ------------ Endpoints ------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "tx_rows": int(len(tx)),
        "features_expected": int(len(feature_cols)),
    }

@app.post("/predict")
def predict(inp: PropertyInput):
    user_data = inp.data
    ppm2 = predict_price_per_m2(user_data)
    total = compute_total_value(ppm2, user_data)
    return {
        "currency": CURRENCY,
        "predicted_meter_sale_price": ppm2,
        "procedure_area": float(user_data.get("procedure_area", 0) or 0),
        "total_valuation": total,
    }

@app.post("/comparables")
def comparables(inp: PropertyInput):
    res = get_comparables(inp.data, top_k=10)
    return {"currency": CURRENCY, **res}

@app.post("/charts")
def charts(inp: PropertyInput):
    return chart_data(inp.data)

@app.post("/predict_with_comparables")
def predict_with_comparables(inp: PropertyInput):
    user_data = inp.data
    ppm2 = predict_price_per_m2(user_data)
    total = compute_total_value(ppm2, user_data)
    comps = get_comparables(user_data, top_k=10)

    return {
        "currency": CURRENCY,
        "predicted_meter_sale_price": ppm2,
        "procedure_area": float(user_data.get("procedure_area", 0) or 0),
        "total_valuation": total,
        "comparables": comps["comparables"],
        "comparables_meta": comps["comparables_meta"],
    }
