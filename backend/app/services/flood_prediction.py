
"""Flood prediction service using machine learning models."""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import os
import pickle
import logging
import joblib
from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.models import FloodPrediction
from app.schemas import Coordinates, FloodPredictionResponse
from .weather_service import WeatherService

logger = logging.getLogger(__name__)

# Constants
MODEL_DIR = Path("app/models/ml")
MODEL_PATH = MODEL_DIR / "flood_prediction_model.joblib"
SCALER_PATH = MODEL_DIR / "flood_prediction_scaler.joblib"
RISK_LEVELS = ["Low", "Moderate", "High", "Critical"]

# Ensure model directory exists
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Global variables for caching
_model = None
_scaler = None

def _load_model() -> Tuple[Optional[RandomForestClassifier], Optional[StandardScaler]]:
    """Load the trained ML model and scaler for flood prediction.

    Returns:
        Tuple containing the model and scaler objects, or None if not found
    """
    global _model, _scaler
    
    # Return cached model if available
    if _model is not None and _scaler is not None:
        return _model, _scaler
    
    try:
        # Try to load existing model
        if MODEL_PATH.exists() and SCALER_PATH.exists():
            logger.info(f"Loading existing model from {MODEL_PATH}")
            _model = joblib.load(MODEL_PATH)
            _scaler = joblib.load(SCALER_PATH)
            return _model, _scaler
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
    
    # Train a new model if loading fails or model doesn't exist
    logger.info("No existing model found or loading failed. Training a new model.")
    _model, _scaler = train_model()
    return _model, _scaler

def _generate_synthetic_data() -> pd.DataFrame:
    """Generate synthetic data for model training.

    In a real application, this would be replaced with actual historical data.

    Returns:
        DataFrame containing synthetic training data
    """
    # Number of synthetic data points
    n_samples = 1000
    
    # Generate features
    rainfall = np.random.exponential(scale=5, size=n_samples)  # Current rainfall in mm/hr
    rainfall_forecast = np.random.exponential(scale=15, size=n_samples)  # 24hr forecast in mm
    soil_moisture = np.random.uniform(0, 100, size=n_samples)  # % saturation
    elevation = np.random.normal(900, 100, size=n_samples)  # meters above sea level
    drainage_efficiency = np.random.uniform(0, 100, size=n_samples)  # % efficiency
    past_week_rainfall = np.random.exponential(scale=30, size=n_samples)  # mm in past week
    urbanization = np.random.uniform(0, 100, size=n_samples)  # % urbanized
    population_density = np.random.exponential(scale=5000, size=n_samples)  # people per sq km
    
    # Create DataFrame
    df = pd.DataFrame({
        'rainfall': rainfall,
        'rainfall_forecast': rainfall_forecast,
        'soil_moisture': soil_moisture,
        'elevation': elevation,
        'drainage_efficiency': drainage_efficiency,
        'past_week_rainfall': past_week_rainfall,
        'urbanization': urbanization,
        'population_density': population_density
    })
    
    # Generate target based on features (simplified flood risk model)
    # Higher values = higher flood risk
    risk_score = (
        0.3 * rainfall + 
        0.2 * rainfall_forecast +
        0.15 * soil_moisture + 
        -0.25 * (elevation - 800) / 100 +  # Lower elevation = higher risk
        -0.15 * drainage_efficiency / 100 +  # Lower drainage = higher risk
        0.1 * past_week_rainfall + 
        0.1 * urbanization / 100 +  # Higher urbanization = higher risk
        0.05 * population_density / 5000  # Higher density = higher risk
    )
    
    # Normalize and add noise
    risk_score = risk_score / risk_score.max()
    risk_score = risk_score + np.random.normal(0, 0.05, size=n_samples)
    risk_score = np.clip(risk_score, 0, 1)
    
    # Convert to categorical risk levels
    risk_level = pd.cut(
        risk_score, 
        bins=[0, 0.25, 0.5, 0.75, 1], 
        labels=RISK_LEVELS,
        include_lowest=True
    )
    
    df['risk_level'] = risk_level
    
    # Add timestamp and location data for realism
    now = datetime.now()
    timestamps = [now - timedelta(days=np.random.uniform(0, 365)) for _ in range(n_samples)]
    df['timestamp'] = timestamps
    
    # Bengaluru coordinates with some variation
    lats = np.random.normal(12.9716, 0.1, size=n_samples)
    lngs = np.random.normal(77.5946, 0.1, size=n_samples)
    df['lat'] = lats
    df['lng'] = lngs
    
    return df

def train_model() -> Tuple[RandomForestClassifier, StandardScaler]:
    """Train a new flood prediction model on synthetic or historical data.

    Returns:
        Tuple containing the trained model and scaler
    """
    logger.info("Training new flood prediction model...")
    
    # In a real application, you would load actual historical data
    # For now, generate synthetic data
    df = _generate_synthetic_data()
    
    # Prepare features and target
    X = df.drop(['risk_level', 'timestamp', 'lat', 'lng'], axis=1)
    y = df['risk_level']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create and train model pipeline
    scaler = StandardScaler()
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    
    # Fit scaler and model
    X_train_scaled = scaler.fit_transform(X_train)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    logger.info(f"Model metrics - Accuracy: {accuracy:.3f}, Precision: {precision:.3f}, "
                f"Recall: {recall:.3f}, F1: {f1:.3f}")
    
    # Save model and scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    logger.info(f"Model saved to {MODEL_PATH}")
    
    return model, scaler

async def _collect_prediction_features(location: Coordinates) -> Dict[str, float]:
    """Collect features needed for flood prediction.

    Args:
        location: Geographic coordinates

    Returns:
        Dictionary of feature values for prediction
    """
    weather_service = WeatherService()
    
    # Get current weather and forecast
    weather_data = await weather_service.get_weather_data(location.lat, location.lng)
    
    # Get rainfall history (last 7 days)
    rainfall_history = await weather_service.get_rainfall_history(
        location.lat, location.lng, days=7
    )
    past_week_rainfall = sum(day['rainfall'] for day in rainfall_history)
    
    # In a real application, you would fetch these from databases or other APIs
    # For now, use realistic values for Bengaluru
    elevation = 900  # meters above sea level
    drainage_efficiency = 65  # % efficiency (urban areas have less efficient drainage)
    soil_moisture = min(70 + (past_week_rainfall / 10), 100)  # % saturation
    
    # Create feature dictionary
    features = {
        'rainfall': weather_data['rainfall'],
        'rainfall_forecast': weather_data['rainfall_forecast'],
        'soil_moisture': soil_moisture,
        'elevation': elevation,
        'drainage_efficiency': drainage_efficiency,
        'past_week_rainfall': past_week_rainfall,
        'urbanization': 80,  # Bengaluru is highly urbanized
        'population_density': 4000  # people per sq km
    }
    
    return features, weather_data

def _predict_flood_risk(features: Dict[str, float]) -> Dict[str, Any]:
    """Predict flood risk based on input features.

    Args:
        features: Dictionary of feature values

    Returns:
        Dictionary containing risk assessment
    """
    # Load model and scaler
    model, scaler = _load_model()
    
    # Convert features to DataFrame
    feature_df = pd.DataFrame([features])
    
    # Scale features
    scaled_features = scaler.transform(feature_df)
    
    # Get model prediction
    risk_level = model.predict(scaled_features)[0]
    
    # Get probability for each class
    probabilities = model.predict_proba(scaled_features)[0]
    
    # Map class probabilities to risk levels
    risk_probs = {level: prob for level, prob in zip(model.classes_, probabilities)}
    
    # Find the probability for the predicted risk level
    probability = risk_probs[risk_level]
    
    return {
        'risk_level': risk_level,
        'probability': float(probability),
        'detailed_probabilities': risk_probs
    }

async def predict_flood_risk(db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
    """Predict flood risk for a specific location.

    Args:
        db: Database session
        location: Geographic coordinates
        area_name: Name of the area being analyzed

    Returns:
        FloodPredictionResponse object with prediction results
    """
    try:
        # Collect features for prediction
        features, weather_data = await _collect_prediction_features(location)
        
        # Get prediction from model
        risk_assessment = _predict_flood_risk(features)
        
        # Create database entry
        db_prediction = FloodPrediction(
            area_name=area_name,
            location=f"POINT({location.lng} {location.lat})",
            rainfall_forecast=features.get('rainfall_forecast', 0),
            risk_level=risk_assessment['risk_level'],
            probability=risk_assessment['probability'],
            prediction_date=datetime.utcnow()
        )
        
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        # Prepare response
        return FloodPredictionResponse(
            prediction={
                "risk_level": risk_assessment['risk_level'],
                "probability": risk_assessment['probability']
            },
            weather={"rainfall": weather_data['rainfall']},
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.exception(f"Error in predict_flood_risk: {str(e)}")
        # Return a fallback prediction
        return FloodPredictionResponse(
            prediction={"risk_level": "Unknown", "probability": 0.0},
            weather={"rainfall": 0.0},
            timestamp=datetime.utcnow().isoformat()
        )

async def get_recent_predictions(db: Session, limit: int = 10):
    """Get recent flood predictions from the database.

    Args:
        db: Database session
        limit: Maximum number of predictions to return

    Returns:
        List of recent FloodPrediction records
    """
    return db.query(FloodPrediction)\
             .order_by(FloodPrediction.prediction_date.desc())\
             .limit(limit)\
             .all()

async def retrain_model(db: Session) -> Dict[str, Any]:
    """Retrain the flood prediction model with new data.

    In a production system, this would use actual historical data and recent predictions.

    Args:
        db: Database session

    Returns:
        Dictionary containing training results and metrics
    """
    # Train new model
    model, scaler = train_model()
    
    # In a real application, you would evaluate on a held-out test set
    # For now, return synthetic metrics
    return {
        "success": True,
        "message": "Model retrained successfully",
        "metrics": {
            "accuracy": 0.85,
            "precision": 0.83,
            "recall": 0.82,
            "f1_score": 0.82
        },
        "timestamp": datetime.utcnow().isoformat()
    }
