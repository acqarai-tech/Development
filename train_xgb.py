import os
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error

from xgboost import XGBRegressor


# --------------------------
# Settings
# --------------------------
TRAIN_PATH = "data/avm_gold_rics_ready_train.csv.gz"
VAL_PATH   = "data/avm_gold_rics_ready_test.csv.gz"

TARGET     = "meter_sale_price"

# Drop weird/invalid target values that break MAPE-like metrics
MIN_TARGET = 100.0     # adjust for your market
MAX_TARGET = None      # optionally set e.g. 200000.0 if needed

# Columns to drop (high-cardinality IDs + constants)
DROP_COLS = [
    "transaction_id",   # very high cardinality (unique per row)
    "run_date_utc",      # constant
    "currency",          # constant (AED)
    "data_version",      # constant
    "basis_of_value",    # constant (mostly)
]


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


def add_date_parts(df: pd.DataFrame, col: str = "instance_date") -> pd.DataFrame:
    """
    Convert a date column into numeric parts and drop original.
    Helps avoid huge one-hot encoding on raw date strings.
    """
    if col not in df.columns:
        return df

    d = pd.to_datetime(df[col], errors="coerce")
    df[f"{col}_year"]  = d.dt.year
    df[f"{col}_month"] = d.dt.month
    df[f"{col}_day"]   = d.dt.day
    df[f"{col}_dow"]   = d.dt.dayofweek
    return df.drop(columns=[col])


def drop_cols_safe(df: pd.DataFrame, cols) -> pd.DataFrame:
    cols_present = [c for c in cols if c in df.columns]
    if cols_present:
        return df.drop(columns=cols_present)
    return df


def main():
    os.makedirs("models", exist_ok=True)

    # 1) Load data (gz)
    train = pd.read_csv(TRAIN_PATH, compression="gzip", low_memory=False)
    val   = pd.read_csv(VAL_PATH,   compression="gzip", low_memory=False)

    # 2) Safety: if trans_group_en exists, keep Sales only
    if "trans_group_en" in train.columns:
        train = train[train["trans_group_en"] == "Sales"].copy()
    if "trans_group_en" in val.columns:
        val = val[val["trans_group_en"] == "Sales"].copy()

    # 3) Clean target column
    if TARGET not in train.columns or TARGET not in val.columns:
        raise ValueError(
            f"Target '{TARGET}' not found. "
            f"Train has: {list(train.columns)[:20]}... | "
            f"Val has: {list(val.columns)[:20]}..."
        )

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
    X_train = train.drop(columns=[TARGET]).copy()
    y_train = train[TARGET].astype(float).copy()

    X_val = val.drop(columns=[TARGET]).copy()
    y_val = val[TARGET].astype(float).copy()

    # 5) Drop high-cardinality IDs + constant columns
    X_train = drop_cols_safe(X_train, DROP_COLS)
    X_val   = drop_cols_safe(X_val,   DROP_COLS)

    # 6) Date handling (convert instance_date to numeric parts)
    X_train = add_date_parts(X_train, "instance_date")
    X_val   = add_date_parts(X_val,   "instance_date")

    # 7) Log-transform target (helps price stability)
    y_train_log = np.log1p(y_train)
    y_val_log   = np.log1p(y_val)

    # 8) Identify categorical vs numeric columns
    # Treat "object" columns as categorical.
    cat_cols = [c for c in X_train.columns if X_train[c].dtype == "object"]

    # Everything else numeric-ish; we will coerce to numeric in preprocessing.
    num_cols = [c for c in X_train.columns if c not in cat_cols]

    # 9) Preprocess:
    # - categorical: impute missing -> one-hot
    # - numeric: coerce -> impute missing
    # Note: coerce happens by pandas before fit_transform to avoid string numerics issues
    for c in num_cols:
        X_train[c] = pd.to_numeric(X_train[c], errors="coerce")
        X_val[c]   = pd.to_numeric(X_val[c],   errors="coerce")

    cat_pipe = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("ohe", OneHotEncoder(handle_unknown="ignore"))
    ])

    num_pipe = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ])

    preprocess = ColumnTransformer(
        transformers=[
            ("cat", cat_pipe, cat_cols),
            ("num", num_pipe, num_cols),
        ],
        remainder="drop",
    )

    # Fit preprocess on train only
    X_train_enc = preprocess.fit_transform(X_train)
    X_val_enc   = preprocess.transform(X_val)

    # 10) Define model (robust baseline)
    xgb = XGBRegressor(
        n_estimators=10000,
        learning_rate=0.03,
        max_depth=8,
        subsample=0.8,
        colsample_bytree=0.8,

        reg_alpha=0.0,
        reg_lambda=1.0,

        # speed + stability on tabular data
        tree_method="hist",

        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,

        # XGBoost 3.x: early stopping must be in constructor
        early_stopping_rounds=200,
        eval_metric="rmse",
    )

    # 11) Train with early stopping
    xgb.fit(
        X_train_enc, y_train_log,
        eval_set=[(X_val_enc, y_val_log)],
        verbose=200
    )

    # 12) Predict and evaluate (convert back from log)
    pred_val_log = xgb.predict(X_val_enc)
    pred_val = np.expm1(pred_val_log)

    mae  = mean_absolute_error(y_val, pred_val)
    rmse = np.sqrt(mean_squared_error(y_val, pred_val))
    s    = smape(y_val, pred_val)

    print("========================================")
    print(f"Rows used -> Train: {len(train)} | Validate: {len(val)}")
    print(f"Features  -> Cat: {len(cat_cols)} | Num: {len(num_cols)}")
    print(f"Validation MAE   : {mae:,.3f}")
    print(f"Validation RMSE  : {rmse:,.3f}")
    print(f"Validation SMAPE : {s:,.2f}%")
    print(f"Best iteration   : {getattr(xgb, 'best_iteration', None)}")
    print("========================================")

    # 13) Save everything needed for the website/API
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
        "dropped_columns": [c for c in DROP_COLS if c in train.columns],
        "date_parts_from": "instance_date",
    }

    out_path = "models/avm_xgb_bundle2.joblib"
    joblib.dump(bundle, out_path)
    print(f"Saved model bundle -> {out_path}")


if __name__ == "__main__":
    main()
