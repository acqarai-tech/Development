# ==========================
# train_xgb.py  (XGBoost 3.1.3)
# Target: meter_sale_price
# Input:  data/avm_train_prepared.csv
#         data/avm_validate_prepared.csv
# Output: models/avm_xgb_bundle.joblib
# ==========================

import os
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor


# --------------------------
# Settings (edit if needed)
# --------------------------
TRAIN_PATH = "data/avm_train_prepared.csv"
VAL_PATH   = "data/avm_validate_prepared.csv"
TARGET     = "meter_sale_price"

# Drop weird/invalid target values that break MAPE-like metrics
MIN_TARGET = 100.0     # recommended (adjust for your market)
MAX_TARGET = None      # optionally set e.g. 200000.0 if needed


# --------------------------
# Helper metric
# --------------------------
def smape(y_true, y_pred, eps=1e-6):
    """
    Symmetric Mean Absolute Percentage Error (%)
    Safe when y_true is small.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    return np.mean(
        2.0 * np.abs(y_true - y_pred) / (np.abs(y_true) + np.abs(y_pred) + eps)
    ) * 100.0


def main():
    os.makedirs("models", exist_ok=True)

    # 1) Load data
    train = pd.read_csv(TRAIN_PATH, low_memory=False)
    val   = pd.read_csv(VAL_PATH, low_memory=False)

    # 2) Safety: if trans_group_en exists, keep Sales only
    if "trans_group_en" in train.columns:
        train = train[train["trans_group_en"] == "Sales"].copy()
    if "trans_group_en" in val.columns:
        val = val[val["trans_group_en"] == "Sales"].copy()

    # 3) Clean target column
    train[TARGET] = pd.to_numeric(train[TARGET], errors="coerce")
    val[TARGET]   = pd.to_numeric(val[TARGET], errors="coerce")

    train = train.dropna(subset=[TARGET]).copy()
    val   = val.dropna(subset=[TARGET]).copy()

    train = train[train[TARGET] >= MIN_TARGET].copy()
    val   = val[val[TARGET] >= MIN_TARGET].copy()

    if MAX_TARGET is not None:
        train = train[train[TARGET] <= MAX_TARGET].copy()
        val   = val[val[TARGET] <= MAX_TARGET].copy()

    if len(train) < 200 or len(val) < 50:
        raise ValueError(
            f"Too few rows after filtering. Train={len(train)} Val={len(val)}. "
            f"Lower MIN_TARGET or check your data."
        )

    # 4) Split features/target
    X_train = train.drop(columns=[TARGET])
    y_train = train[TARGET].astype(float)

    X_val = val.drop(columns=[TARGET])
    y_val = val[TARGET].astype(float)

    # 5) Log-transform target (helps price stability)
    y_train_log = np.log1p(y_train)
    y_val_log   = np.log1p(y_val)

    # 6) Identify categorical vs numeric columns
    cat_cols = [c for c in X_train.columns if X_train[c].dtype == "object"]
    num_cols = [c for c in X_train.columns if c not in cat_cols]

    # 7) Preprocess: OneHotEncode categoricals, passthrough numerics
    preprocess = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", "passthrough", num_cols),
        ],
        remainder="drop",
    )

    # Fit preprocess on train only
    X_train_enc = preprocess.fit_transform(X_train)
    X_val_enc   = preprocess.transform(X_val)

    # 8) Define model (baseline)
    xgb = XGBRegressor(
        n_estimators=10000,
        learning_rate=0.03,
        max_depth=8,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.0,
        reg_lambda=1.0,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,

        # XGBoost 3.x: early stopping must be in constructor
        early_stopping_rounds=200,
        eval_metric="rmse",
    )

    # 9) Train with early stopping
    xgb.fit(
        X_train_enc, y_train_log,
        eval_set=[(X_val_enc, y_val_log)],
        verbose=200
    )

    # 10) Predict and evaluate (convert back from log)
    pred_val_log = xgb.predict(X_val_enc)
    pred_val = np.expm1(pred_val_log)

    mae  = mean_absolute_error(y_val, pred_val)
    rmse = np.sqrt(mean_squared_error(y_val, pred_val))
    s    = smape(y_val, pred_val)

    print("========================================")
    print(f"Rows used -> Train: {len(train)} | Validate: {len(val)}")
    print(f"Validation MAE   : {mae:,.3f}")
    print(f"Validation RMSE  : {rmse:,.3f}")
    print(f"Validation SMAPE : {s:,.2f}%")
    print(f"Best iteration   : {getattr(xgb, 'best_iteration', None)}")
    print("========================================")

    # 11) Save everything needed for the website
    bundle = {
        "preprocess": preprocess,
        "model": xgb,
        "feature_columns": list(X_train.columns),
        "target": TARGET,
        "log_target": True,
        "min_target": MIN_TARGET,
        "max_target": MAX_TARGET,
        "categorical_columns": cat_cols,
        "numeric_columns": num_cols,
    }

    out_path = "models/avm_xgb_bundle1.joblib"
    joblib.dump(bundle, out_path)
    print(f"Saved model bundle -> {out_path}")


if __name__ == "__main__":
    main()
