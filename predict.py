import joblib
import numpy as np
import pandas as pd

MODEL_PATH = "models/avm_xgb_bundle1.joblib"

def load_model():
    bundle = joblib.load(MODEL_PATH)
    return bundle

def predict_one(bundle, user_input: dict):
    # Build dataframe with the exact feature columns used during training
    cols = bundle["feature_columns"]
    X = pd.DataFrame([{c: user_input.get(c, None) for c in cols}], columns=cols)

    # Preprocess + predict
    X_enc = bundle["preprocess"].transform(X)
    pred_log = bundle["model"].predict(X_enc)

    # Convert back if log_target was used
    if bundle.get("log_target", False):
        pred = np.expm1(pred_log)[0]
    else:
        pred = float(pred_log[0])

    # Total valuation = price/m² * procedure_area
    procedure_area = float(user_input.get("procedure_area", 0) or 0)
    total_value = pred * procedure_area

    return {
        "predicted_meter_sale_price": float(pred),
        "procedure_area": procedure_area,
        "total_valuation": float(total_value),
    }

if __name__ == "__main__":
    bundle = load_model()

    # Example input (EDIT these values to match your website form)
    sample = {
        "property_type_en": "Unit",
        "property_sub_type_en": "Flat",
        "property_usage_en": "Residential",
        "reg_type_en": "Free Hold",
        "area_name_en": "Business Bay",
        "building_name_en": "UNKNOWN",
        "project_name_en": "UNKNOWN",
        "master_project_en": "UNKNOWN",
        "nearest_metro_en": "UNKNOWN",
        "nearest_mall_en": "UNKNOWN",
        "nearest_landmark_en": "UNKNOWN",
        "rooms_en": "2 B/R",
        "has_parking": 1,
        "procedure_area": 110,
        "procedure_area_clipped": 110,
        "instance_year": 2025,
        "instance_month": 1,
        "instance_day": 1,
    }

    out = predict_one(bundle, sample)
    print(out)
