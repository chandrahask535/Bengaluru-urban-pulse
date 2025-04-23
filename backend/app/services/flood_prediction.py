
"""
Flood prediction service using real datasets and OpenWeather API.
It loads Bangalore rainfall and flood event historical data, trains a ML model,
provides prediction endpoints, and retrieves recent predictions.
"""

from sqlalchemy.orm import Session
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np
import os
import logging
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.models import FloodPrediction
from app.schemas import Coordinates, FloodPredictionResponse
from app.services.weather_service import WeatherService

logger = logging.getLogger(__name__)

# Data paths based on user uploaded data folder
BASE_DATA_DIR = Path("backend/app/data")
FLOOD_DATA_DIR = BASE_DATA_DIR / "flood_prediction"
RAINFALL_DATA_DIR = BASE_DATA_DIR / "rainfall"

# Load files from those folders
BANGALORE_RAINFALL_FILE = RAINFALL_DATA_DIR / "bangalore-rainfall-data-1900-2024-sept.csv"
FLOOD_EVENTS_FILE = FLOOD_DATA_DIR / "bangalore_urban_flood_prediction_AI.csv"

# Model save paths
MODEL_DIR = Path("backend/app/models/ml")
MODEL_PATH = MODEL_DIR / "flood_prediction_model.joblib"
PREPROCESSOR_PATH = MODEL_DIR / "flood_prediction_preprocessor.joblib"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Severity mapping, consistent across the app
SEVERITY_MAPPING = {
    "Low": 0,
    "Moderate": 1,
    "High": 2,
    "Critical": 3
}
SEVERITY_INVERSE = {v: k for k, v in SEVERITY_MAPPING.items()}

# Global cache
_model: Optional[RandomForestClassifier] = None
_preprocessor: Optional[ColumnTransformer] = None
_training_data: Optional[pd.DataFrame] = None


def _load_and_prepare_flood_data() -> pd.DataFrame:
    """Load and preprocess the flood event dataset."""
    if not FLOOD_EVENTS_FILE.exists():
        raise FileNotFoundError(f"Flood events data file not found: {FLOOD_EVENTS_FILE}")

    df = pd.read_csv(FLOOD_EVENTS_FILE)
    # Expected columns: ['date', 'area', 'severity', ... plus extra features]
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date', 'area', 'severity'])

    # Ensure severity is categorical
    df['severity'] = df['severity'].astype(str).map(lambda x: x.strip().capitalize())
    df = df[df['severity'].isin(SEVERITY_MAPPING.keys())]

    # Map severity to numeric target
    df['target'] = df['severity'].map(SEVERITY_MAPPING)

    # We keep and clean relevant columns for model features
    # We'll expect these columns are present in the CSV, else fill defaults
    needed_features = [
        'rainfall_mm',       # Current day rainfall (from rainfall dataset)
        'rainfall_3day_mm',  # 3 day cumulative rainfall
        'drainage_efficiency',
        'urbanization',
        'elevation',
        'population_density',
        'area'
    ]

    for col in needed_features:
        if col not in df.columns:
            logger.warning(f"Column '{col}' missing in flood events data. Filling with default.")
            df[col] = np.nan  # Will fill nans later

    df = df.fillna({
        'rainfall_mm': 10.0,
        'rainfall_3day_mm': 20.0,
        'drainage_efficiency': 50.0,
        'urbanization': 80.0,
        'elevation': 900.0,
        'population_density': 15000.0,
        'area': 'Unknown'
    })

    # Make sure 'area' is string
    df['area'] = df['area'].astype(str)

    # Cache training data globally
    global _training_data
    _training_data = df

    return df


def _load_and_prepare_rainfall_data() -> pd.DataFrame:
    """Load and preprocess the rainfall dataset if needed for features."""
    if not BANGALORE_RAINFALL_FILE.exists():
        raise FileNotFoundError(f"Rainfall data file not found: {BANGALORE_RAINFALL_FILE}")

    df = pd.read_csv(BANGALORE_RAINFALL_FILE)
    # The file is yearly data with columns: Year, Jan ... Dec, Total, etc.
    # We'll melt it into daily or monthly format as needed for feature augmentation

    # We assume monthly. For now, just parse year and month to build a date
    months_map = {
        'Jan':1, 'Feb':2, 'Mar':3, 'Apr':4, 'May':5, 'June':6,
        'July':7, 'Aug':8, 'Sept':9, 'Oct':10, 'Nov':11, 'Dec':12
    }
    month_cols = list(months_map.keys())

    records = []
    for _, row in df.iterrows():
        year = int(row['Year'])
        for month_name in month_cols:
            rainfall_val = row[month_name]
            if pd.isna(rainfall_val):
                rainfall_val = 0.0
            records.append({'year': year, 'month': months_map[month_name], 'rainfall_mm': rainfall_val})

    df_long = pd.DataFrame(records)
    # Add date as the 1st day of month for simplicity
    df_long['date'] = pd.to_datetime(df_long.assign(day=1)[['year','month','day']])

    return df_long


def train_model() -> Tuple[RandomForestClassifier, ColumnTransformer]:
    """Train flood prediction model."""
    logger.info("Loading data and training flood prediction model...")

    df = _load_and_prepare_flood_data()

    # Define features X and target y
    categorical_cols = ['area']
    numerical_cols = [
        'rainfall_mm', 'rainfall_3day_mm', 'drainage_efficiency',
        'urbanization', 'elevation', 'population_density'
    ]

    X = df[categorical_cols + numerical_cols]
    y = df['target']

    # Preprocessing pipelines
    num_transformer = StandardScaler()
    cat_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, numerical_cols),
            ('cat', cat_transformer, categorical_cols)
        ]
    )

    X_processed = preprocessor.fit_transform(X)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y, test_size=0.2, random_state=2025, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=2025
    )

    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted')
    rec = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')

    logger.info(f"Flood prediction model trained: Accuracy={acc:.3f}, Precision={prec:.3f}, Recall={rec:.3f}, F1={f1:.3f}")

    # Save model and preprocessor
    joblib.dump(model, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)

    # Cache globally
    global _model, _preprocessor
    _model = model
    _preprocessor = preprocessor

    return model, preprocessor


def _load_model() -> Tuple[RandomForestClassifier, ColumnTransformer]:
    """Load trained model and preprocessor from disk or train a new one."""
    global _model, _preprocessor

    if _model is not None and _preprocessor is not None:
        return _model, _preprocessor

    try:
        if MODEL_PATH.exists() and PREPROCESSOR_PATH.exists():
            _model = joblib.load(MODEL_PATH)
            _preprocessor = joblib.load(PREPROCESSOR_PATH)
            logger.info("Loaded flood prediction model from disk.")
            return _model, _preprocessor
    except Exception as e:
        logger.error(f"Failed to load model from disk: {str(e)}")

    # Train new model if loading failed
    return train_model()


async def predict_flood_risk(db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
    """Predict flood risk leveraging real data sets and current weather."""

    try:
        model, preprocessor = _load_model()

        # Fetch current weather using service
        weather_service = WeatherService()
        weather_data = await weather_service.get_weather_data(location.lat, location.lng)

        # Use rainfall from weather; fallback to zero if missing key
        current_rainfall = float(weather_data.get('rainfall', 0.0)) if isinstance(weather_data, dict) else 0.0

        # To get rainfall 3-day sum: Use historical rainfall data from provided dataset
        df_rainfall = _load_and_prepare_rainfall_data()
        # Compute cumulative rainfall for last 3 months as a proxy (since daily not available)
        # More accurate would require daily data; here just sum last 3 months rainfall for current year
        year_now = datetime.utcnow().year
        last_three_months = sorted(df_rainfall[(df_rainfall['year'] == year_now) & (df_rainfall['month'] <= datetime.utcnow().month)].tail(3)['rainfall_mm'].tolist())
        rainfall_3day = sum(last_three_months) if last_three_months else current_rainfall * 3

        # Basic defaults if area not known (could be extended to better mapping)
        drainage_efficiency = 50.0
        urbanization = 80.0
        elevation = 900.0
        population_density = 15000.0

        # Try to get area specific from training data
        training_data = _training_data if _training_data is not None else _load_and_prepare_flood_data()
        area_rows = training_data[training_data['area'].str.lower() == area_name.strip().lower()]
        if not area_rows.empty:
            first = area_rows.iloc[0]
            drainage_efficiency = first['drainage_efficiency']
            urbanization = first['urbanization']
            elevation = first['elevation']
            population_density = first['population_density']

        # Prepare features
        features = {
            'rainfall_mm': current_rainfall,
            'rainfall_3day_mm': rainfall_3day,
            'drainage_efficiency': drainage_efficiency,
            'urbanization': urbanization,
            'elevation': elevation,
            'population_density': population_density,
            'area': area_name
        }

        # Prepare for prediction using preprocessor and model
        df_features = pd.DataFrame([features])
        X = preprocessor.transform(df_features)

        pred_numeric = model.predict(X)[0]
        pred_proba = model.predict_proba(X)[0]

        risk_level = SEVERITY_INVERSE.get(pred_numeric, "Low")
        probability = float(np.max(pred_proba))

        # Store prediction in DB
        db_pred = FloodPrediction(
            area_name=area_name,
            location=f"POINT({location.lng} {location.lat})",
            prediction_date=datetime.utcnow(),
            rainfall_forecast=current_rainfall,
            risk_level=risk_level,
            probability=probability
        )
        db.add(db_pred)
        db.commit()
        db.refresh(db_pred)

        return FloodPredictionResponse(
            prediction={"risk_level": risk_level, "probability": probability},
            weather={"rainfall": current_rainfall},
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.error(f"Error during flood risk prediction: {str(e)}")
        return FloodPredictionResponse(
            prediction={"risk_level": "Low", "probability": 0.0},
            weather={"rainfall": 0.0},
            timestamp=datetime.utcnow().isoformat()
        )


async def get_recent_predictions(db: Session, limit: int = 10):
    """Retrieve recent flood predictions from DB."""
    try:
        return db.query(FloodPrediction)\
            .order_by(FloodPrediction.prediction_date.desc())\
            .limit(limit).all()
    except Exception as e:
        logger.error(f"Error fetching recent flood predictions from DB: {str(e)}")
        return []


async def retrain_model(db: Session) -> Dict[str, Any]:
    """Retrain the prediction model on the datasets."""
    try:
        # Important: The retrain will reload data files and retrain models
        model, preprocessor = train_model()
        # Just log training success
        return {
            "success": True,
            "message": "Flood prediction model retrained successfully.",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retraining flood prediction model: {str(e)}")
        return {
            "success": False,
            "message": f"Retraining failed: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

# Initialize the model on import
def _init_service():
    try:
        _load_and_prepare_flood_data()
        _load_model()
        logger.info("Flood prediction service initialized.")
    except Exception as e:
        logger.warning(f"Failed to initialize flood prediction service: {str(e)}")

_init_service()

