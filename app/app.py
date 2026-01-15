from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

# -------------------------------------------------
# Robust paths: assumes this file is /app/app.py
# -------------------------------------------------
APP_DIR = Path(__file__).resolve().parent          # .../app
BASE_DIR = APP_DIR.parent                          # project root

MODEL_PATH = BASE_DIR / "models" / "avm_xgb_bundle1.joblib"
TRANSACTIONS_PATH = BASE_DIR / "data" / "transactions_avm_ready_complete.csv"
CURRENCY = "AED"

app = FastAPI(title="AVM API", version="1.0")

# -------------------------------------------------
# CORS
# If your React runs on localhost:3000, this is fine.
# If React runs via ngrok, add your ngrok frontend URL here.
# For quick testing you can use allow_origins=["*"]
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://enviously-unfrilly-vesta.ngrok-free.dev"
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
feature_cols = bundle["feature_columns"]

# -------------------------------------------------
# Load transactions for comps/charts (optional)
# -------------------------------------------------
if TRANSACTIONS_PATH.exists():
    tx = pd.read_csv(str(TRANSACTIONS_PATH), low_memory=False)

    if "trans_group_en" in tx.columns:
        tx = tx[tx["trans_group_en"] == "Sales"].copy()

    if "meter_sale_price" in tx.columns:
        tx["meter_sale_price"] = pd.to_numeric(tx["meter_sale_price"], errors="coerce")
        tx = tx.dropna(subset=["meter_sale_price"]).copy()
else:
    tx = pd.DataFrame()

# ------------ Input Schema ------------
class PropertyInput(BaseModel):
    data: Dict[str, Any]

# ------------ Helpers ------------
def predict_price_per_m2(user_data: dict) -> float:
    X = pd.DataFrame([{c: user_data.get(c, None) for c in feature_cols}], columns=feature_cols)
    X_enc = bundle["preprocess"].transform(X)
    pred_log = bundle["model"].predict(X_enc)

    if bundle.get("log_target", False):
        return float(np.expm1(pred_log)[0])
    return float(pred_log[0])

def compute_total_value(price_per_m2: float, user_data: dict) -> float:
    area = float(user_data.get("procedure_area", 0) or 0)
    return float(price_per_m2 * area)

def get_comparables(user_data: dict, top_k: int = 10):
    if tx.empty:
        return []

    df = tx

    area = user_data.get("area_name_en")
    if area and "area_name_en" in df.columns:
        df = df[df["area_name_en"] == area]

    ptype = user_data.get("property_type_en")
    if ptype and "property_type_en" in df.columns:
        df = df[df["property_type_en"] == ptype]

    rooms = user_data.get("rooms_en")
    if rooms and "rooms_en" in df.columns:
        df = df[df["rooms_en"] == rooms]

    subj_area = float(user_data.get("procedure_area", 0) or 0)
    if subj_area > 0 and "procedure_area" in df.columns:
        low, high = subj_area * 0.8, subj_area * 1.2
        df = df[(df["procedure_area"] >= low) & (df["procedure_area"] <= high)]

    if df.empty:
        return []

    if "procedure_area" in df.columns and subj_area > 0:
        df = df.assign(sim_score=(df["procedure_area"] - subj_area).abs())
        df = df.sort_values("sim_score", ascending=True)

    cols_to_return = [c for c in [
        "instance_date","area_name_en","building_name_en","project_name_en",
        "property_type_en","rooms_en","procedure_area","meter_sale_price"
    ] if c in df.columns]

    return df.head(top_k)[cols_to_return].to_dict(orient="records")

def chart_data(user_data: dict):
    if tx.empty:
        return {"distribution": [], "trend": []}

    df = tx
    area = user_data.get("area_name_en")
    if area and "area_name_en" in df.columns:
        df = df[df["area_name_en"] == area].copy()

    dist = []
    if "meter_sale_price" in df.columns:
        values = df["meter_sale_price"].dropna().astype(float).values
        if len(values) >= 20:
            hist, edges = np.histogram(values, bins=20)
            dist = [{"bin_start": float(edges[i]), "bin_end": float(edges[i+1]), "count": int(hist[i])}
                    for i in range(len(hist))]

    trend = []
    if "instance_date" in df.columns:
        d = pd.to_datetime(df["instance_date"], errors="coerce")
        df = df.assign(_date=d).dropna(subset=["_date"])
        if not df.empty:
            df["_month"] = df["_date"].dt.to_period("M").astype(str)
            g = df.groupby("_month")["meter_sale_price"].median().reset_index()
            trend = [{"month": row["_month"], "median_meter_sale_price": float(row["meter_sale_price"])}
                     for _, row in g.iterrows()]

    return {"distribution": dist, "trend": trend}

# ------------ Endpoints ------------
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
    return {"currency": CURRENCY, "comparables": get_comparables(inp.data, top_k=10)}

@app.post("/charts")
def charts(inp: PropertyInput):
    return chart_data(inp.data)

