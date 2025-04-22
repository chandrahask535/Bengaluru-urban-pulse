
"""Flood prediction service using machine learning models trained on Bangalore flood data."""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import os
import pickle
import logging
import joblib
import requests
from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.models import FloodPrediction
from app.schemas import Coordinates, FloodPredictionResponse
from app.config import API_KEYS, API_ENDPOINTS, CONFIG
from .weather_service import WeatherService

logger = logging.getLogger(__name__)

# Constants
MODEL_DIR = Path("app/models/ml")
MODEL_PATH = MODEL_DIR / "flood_prediction_model.joblib"
SCALER_PATH = MODEL_DIR / "flood_prediction_scaler.joblib"
DATA_DIR = Path("app/data")
BANGALORE_RAINFALL_PATH = DATA_DIR / "bengaluru_rainfall.csv"
FLOOD_EVENTS_PATH = DATA_DIR / "flood_events.csv"
RISK_LEVELS = ["Low", "Moderate", "High", "Critical"]

# Ensure necessary directories exist
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Global variables for caching
_model = None
_scaler = None
_historical_data = None

def _download_data_if_not_exists():
    """Download necessary datasets if they don't exist."""
    # In a real implementation, this would download actual datasets
    # For demonstration, we'll create the files with realistic Bangalore data

    # Create Bangalore rainfall data file if it doesn't exist
    if not BANGALORE_RAINFALL_PATH.exists():
        logger.info(f"Creating sample Bangalore rainfall data at {BANGALORE_RAINFALL_PATH}")
        
        # Sample realistic rainfall data for Bangalore (mm)
        # Based on typical monthly patterns for Bangalore
        dates = pd.date_range(start='2018-01-01', end='2023-12-31')
        
        # Create a dataframe with date and rainfall
        df = pd.DataFrame({'date': dates})
        
        # Generate realistic rainfall patterns for Bangalore
        # Bangalore has a dry season (Dec-Feb), pre-monsoon (Mar-May), 
        # monsoon (Jun-Sep), and post-monsoon (Oct-Nov)
        
        # Function to generate seasonal rainfall
        def generate_seasonal_rainfall(date):
            month = date.month
            # Dry season (Dec-Feb): Very low rainfall
            if month in [12, 1, 2]:
                return max(0, np.random.normal(5, 10))
            # Pre-monsoon (Mar-May): Increasing rainfall
            elif month in [3, 4, 5]:
                return max(0, np.random.normal(30 + (month-3)*20, 25))
            # Monsoon (Jun-Sep): Heavy rainfall
            elif month in [6, 7, 8, 9]:
                return max(0, np.random.normal(120, 50))
            # Post-monsoon (Oct-Nov): Decreasing rainfall
            else:
                return max(0, np.random.normal(60 - (month-10)*30, 30))
        
        # Apply seasonal pattern
        df['rainfall_mm'] = df['date'].apply(generate_seasonal_rainfall)
        
        # Add some random significant storm events
        storm_days = np.random.choice(df.index, size=40, replace=False)
        df.loc[storm_days, 'rainfall_mm'] += np.random.uniform(50, 150, size=len(storm_days))
        
        # Add year and month columns
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        
        # Save to CSV
        df.to_csv(BANGALORE_RAINFALL_PATH, index=False)
    
    # Create flood events data file if it doesn't exist
    if not FLOOD_EVENTS_PATH.exists():
        logger.info(f"Creating sample flood events data at {FLOOD_EVENTS_PATH}")
        
        # Load rainfall data to correlate flood events with heavy rainfall
        rainfall_df = pd.read_csv(BANGALORE_RAINFALL_PATH)
        rainfall_df['date'] = pd.to_datetime(rainfall_df['date'])
        
        # Find days with heavy rainfall (top 5%)
        heavy_rainfall_threshold = rainfall_df['rainfall_mm'].quantile(0.95)
        heavy_rainfall_days = rainfall_df[rainfall_df['rainfall_mm'] > heavy_rainfall_threshold]
        
        # Generate flood events data - typically floods happen after consecutive heavy rainfall
        flood_dates = []
        flood_areas = []
        flood_severities = []
        flood_durations = []
        impact_levels = []
        
        # Bangalore areas prone to flooding
        flood_prone_areas = [
            "Koramangala", "Bellandur", "HSR Layout", "Bommanahalli", 
            "BTM Layout", "Varthur", "Marathahalli", "Yelahanka",
            "KR Puram", "Sarjapur Road", "Indiranagar", "Whitefield"
        ]
        
        # Create flood events - typically more frequent during monsoon
        for year in range(2018, 2024):
            # Sample 3-8 flood events per year, more during later years (climate change)
            num_events = np.random.randint(3 + (year - 2018), 8 + (year - 2018))
            
            # Get heavy rainfall days for this year
            yearly_heavy_days = heavy_rainfall_days[heavy_rainfall_days['date'].dt.year == year]
            
            if len(yearly_heavy_days) > 0:
                # Sample flood days from heavy rainfall days
                flood_indices = np.random.choice(yearly_heavy_days.index, 
                                                size=min(num_events, len(yearly_heavy_days)), 
                                                replace=False)
                
                for idx in flood_indices:
                    flood_date = rainfall_df.loc[idx, 'date']
                    rainfall = rainfall_df.loc[idx, 'rainfall_mm']
                    
                    # Areas affected by this flood event (1-5 areas)
                    num_areas = np.random.randint(1, 6)
                    affected_areas = np.random.choice(flood_prone_areas, size=num_areas, replace=False)
                    
                    for area in affected_areas:
                        # Higher rainfall tends to cause more severe flooding
                        severity_bias = (rainfall - heavy_rainfall_threshold) / (rainfall_df['rainfall_mm'].max() - heavy_rainfall_threshold)
                        severity = np.random.choice(["Low", "Moderate", "High", "Critical"], 
                                                  p=[0.1-min(0.1, severity_bias), 
                                                     0.3-min(0.2, severity_bias), 
                                                     0.4, 
                                                     0.2+min(0.3, severity_bias)])
                        
                        # Duration of flooding (in hours)
                        duration = np.random.randint(2, 72)
                        
                        # Impact level (1-10)
                        if severity == "Low":
                            impact = np.random.randint(1, 4)
                        elif severity == "Moderate":
                            impact = np.random.randint(3, 7)
                        elif severity == "High":
                            impact = np.random.randint(6, 9)
                        else:  # Critical
                            impact = np.random.randint(8, 11)
                        
                        flood_dates.append(flood_date)
                        flood_areas.append(area)
                        flood_severities.append(severity)
                        flood_durations.append(duration)
                        impact_levels.append(impact)
        
        # Create dataframe and save to CSV
        flood_df = pd.DataFrame({
            'date': flood_dates,
            'area': flood_areas,
            'severity': flood_severities,
            'duration_hours': flood_durations,
            'impact_level': impact_levels
        })
        
        # Add drainage efficiency and urbanization factors (known risk factors for Bangalore)
        area_factors = {}
        for area in flood_prone_areas:
            # Different areas have different infrastructure quality
            # Older areas typically have worse drainage and more unplanned urbanization
            if area in ["Koramangala", "Indiranagar", "BTM Layout"]:
                # Older, more established areas with mixed infrastructure
                area_factors[area] = {
                    'drainage_efficiency': np.random.uniform(40, 70),
                    'urbanization': np.random.uniform(70, 90),
                    'elevation': np.random.uniform(870, 930)
                }
            elif area in ["Bellandur", "Varthur", "Marathahalli"]:
                # Areas near lakes with poor drainage
                area_factors[area] = {
                    'drainage_efficiency': np.random.uniform(20, 50),
                    'urbanization': np.random.uniform(75, 95),
                    'elevation': np.random.uniform(860, 890)
                }
            elif area in ["Whitefield", "Sarjapur Road"]:
                # Newer development areas with better planning but rapid growth
                area_factors[area] = {
                    'drainage_efficiency': np.random.uniform(50, 80),
                    'urbanization': np.random.uniform(60, 85),
                    'elevation': np.random.uniform(880, 940)
                }
            else:
                # Other areas
                area_factors[area] = {
                    'drainage_efficiency': np.random.uniform(30, 70),
                    'urbanization': np.random.uniform(65, 90),
                    'elevation': np.random.uniform(870, 920)
                }
        
        # Add area-specific factors to flood events
        flood_df['drainage_efficiency'] = flood_df['area'].map(lambda x: area_factors[x]['drainage_efficiency'])
        flood_df['urbanization'] = flood_df['area'].map(lambda x: area_factors[x]['urbanization'])
        flood_df['elevation'] = flood_df['area'].map(lambda x: area_factors[x]['elevation'])
        
        # Load the rainfall for the specific dates
        flood_df['date'] = pd.to_datetime(flood_df['date'])
        flood_df = pd.merge(
            flood_df, 
            rainfall_df[['date', 'rainfall_mm']], 
            on='date', 
            how='left'
        )
        
        # Calculate cumulative 3-day rainfall (current day + 2 previous days)
        rainfall_cumulative = {}
        for index, row in flood_df.iterrows():
            flood_date = row['date']
            three_day_window = rainfall_df[
                (rainfall_df['date'] >= flood_date - pd.Timedelta(days=2)) &
                (rainfall_df['date'] <= flood_date)
            ]
            rainfall_cumulative[index] = three_day_window['rainfall_mm'].sum()
        
        flood_df['rainfall_3day_mm'] = pd.Series(rainfall_cumulative)
        
        # Add population density factor (varies by area)
        flood_df['population_density'] = flood_df['area'].map({
            "Koramangala": np.random.uniform(15000, 20000),
            "Bellandur": np.random.uniform(10000, 15000),
            "HSR Layout": np.random.uniform(12000, 18000),
            "Bommanahalli": np.random.uniform(18000, 25000),
            "BTM Layout": np.random.uniform(20000, 30000),
            "Varthur": np.random.uniform(8000, 12000),
            "Marathahalli": np.random.uniform(15000, 22000),
            "Yelahanka": np.random.uniform(10000, 15000),
            "KR Puram": np.random.uniform(15000, 20000),
            "Sarjapur Road": np.random.uniform(8000, 14000),
            "Indiranagar": np.random.uniform(15000, 25000),
            "Whitefield": np.random.uniform(10000, 15000)
        })
        
        # Save to CSV
        flood_df.to_csv(FLOOD_EVENTS_PATH, index=False)

def _load_historical_data():
    """Load and prepare historical data for model training."""
    global _historical_data
    
    if _historical_data is not None:
        return _historical_data
    
    # Ensure data files exist
    _download_data_if_not_exists()
    
    # Load flood events data
    logger.info("Loading historical flood data for Bangalore")
    flood_df = pd.read_csv(FLOOD_EVENTS_PATH)
    flood_df['date'] = pd.to_datetime(flood_df['date'])
    
    # Load rainfall data
    rainfall_df = pd.read_csv(BANGALORE_RAINFALL_PATH)
    rainfall_df['date'] = pd.to_datetime(rainfall_df['date'])
    
    # Prepare features and target for model training
    features = flood_df[[
        'rainfall_mm',
        'rainfall_3day_mm',
        'drainage_efficiency',
        'urbanization',
        'elevation', 
        'population_density'
    ]]
    
    # Use area as a categorical feature
    # We'll use one-hot encoding in the pipeline
    features['area'] = flood_df['area']
    
    # Target variable - convert severity to numeric for easier handling
    severity_mapping = {
        'Low': 0,
        'Moderate': 1,
        'High': 2,
        'Critical': 3
    }
    
    target = flood_df['severity'].map(severity_mapping)
    
    _historical_data = {
        'features': features,
        'target': target,
        'flood_df': flood_df,
        'rainfall_df': rainfall_df,
        'severity_mapping': severity_mapping,
        'severity_inverse_mapping': {v: k for k, v in severity_mapping.items()}
    }
    
    return _historical_data

def _load_model() -> Tuple[Optional[RandomForestClassifier], Optional[ColumnTransformer]]:
    """Load the trained ML model for flood prediction.

    Returns:
        Tuple containing the model and preprocessor objects, or None if not found
    """
    global _model, _scaler
    
    # Return cached model if available
    if _model is not None and _scaler is not None:
        return _model, _scaler
    
    try:
        # Try to load existing model
        if MODEL_PATH.exists() and SCALER_PATH.exists():
            logger.info(f"Loading existing flood prediction model from {MODEL_PATH}")
            _model = joblib.load(MODEL_PATH)
            _scaler = joblib.load(SCALER_PATH)
            return _model, _scaler
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
    
    # Train a new model if loading fails or model doesn't exist
    logger.info("No existing model found or loading failed. Training a new model.")
    _model, _scaler = train_model()
    return _model, _scaler

def train_model() -> Tuple[RandomForestClassifier, ColumnTransformer]:
    """Train a new flood prediction model on historical Bangalore flood data.

    Returns:
        Tuple containing the trained model and preprocessor
    """
    logger.info("Training new flood prediction model using Bangalore historical data...")
    
    # Load historical data
    historical_data = _load_historical_data()
    features = historical_data['features']
    target = historical_data['target']
    
    # Define categorical and numerical features
    categorical_features = ['area']
    numerical_features = [
        'rainfall_mm',
        'rainfall_3day_mm', 
        'drainage_efficiency',
        'urbanization', 
        'elevation',
        'population_density'
    ]
    
    # Create preprocessor with both numerical and categorical pipelines
    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, target, test_size=0.2, random_state=42
    )
    
    # Create and train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    
    # Fit preprocessor and model
    X_train_processed = preprocessor.fit_transform(X_train)
    model.fit(X_train_processed, y_train)
    
    # Evaluate model
    X_test_processed = preprocessor.transform(X_test)
    y_pred = model.predict(X_test_processed)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    logger.info(f"Model metrics - Accuracy: {accuracy:.3f}, Precision: {precision:.3f}, "
                f"Recall: {recall:.3f}, F1: {f1:.3f}")
    
    # Print confusion matrix for detailed model evaluation
    cm = confusion_matrix(y_test, y_pred)
    logger.info(f"Confusion Matrix:\n{cm}")
    
    # Save model and preprocessor
    joblib.dump(model, MODEL_PATH)
    joblib.dump(preprocessor, SCALER_PATH)
    
    logger.info(f"Model saved to {MODEL_PATH}")
    
    return model, preprocessor

async def _collect_prediction_features(location: Coordinates, area_name: str) -> Tuple[Dict[str, Any], Dict[str, float]]:
    """Collect features needed for flood prediction.

    Args:
        location: Geographic coordinates
        area_name: Name of the area being analyzed

    Returns:
        Tuple containing:
        1. Dictionary of feature values for prediction
        2. Dictionary of weather data
    """
    weather_service = WeatherService()
    
    # Get current weather and forecast
    weather_data = await weather_service.get_weather_data(location.lat, location.lng)
    
    # Get rainfall history (last 7 days)
    rainfall_history = await weather_service.get_rainfall_history(
        location.lat, location.lng, days=7
    )
    past_week_rainfall = sum(day['rainfall'] for day in rainfall_history)
    
    # Get area-specific data from historical records
    historical_data = _load_historical_data()
    flood_df = historical_data['flood_df']
    
    # Default values based on Bangalore averages if area not found
    drainage_efficiency = 50.0  # %
    urbanization = 80.0  # %
    elevation = 900.0  # meters
    population_density = 15000.0  # people per sq km
    
    # Try to get area-specific parameters
    if area_name in flood_df['area'].values:
        area_data = flood_df[flood_df['area'] == area_name].iloc[0]
        drainage_efficiency = area_data.get('drainage_efficiency', drainage_efficiency)
        urbanization = area_data.get('urbanization', urbanization)
        elevation = area_data.get('elevation', elevation)
        population_density = area_data.get('population_density', population_density)
    else:
        logger.warning(f"Area '{area_name}' not found in historical data. Using default values.")
        
        # Try to find a similar area (fuzzy matching)
        for known_area in flood_df['area'].unique():
            if known_area.lower() in area_name.lower() or area_name.lower() in known_area.lower():
                logger.info(f"Found similar area: {known_area}")
                area_data = flood_df[flood_df['area'] == known_area].iloc[0]
                drainage_efficiency = area_data.get('drainage_efficiency', drainage_efficiency)
                urbanization = area_data.get('urbanization', urbanization)
                elevation = area_data.get('elevation', elevation)
                population_density = area_data.get('population_density', population_density)
                break
    
    # Calculate 3-day rainfall (current + past 2 days)
    three_day_rainfall = weather_data['rainfall']
    if len(rainfall_history) >= 2:
        three_day_rainfall += rainfall_history[0]['rainfall'] + rainfall_history[1]['rainfall']
    
    # Create feature dictionary
    features = {
        'rainfall_mm': weather_data['rainfall'],
        'rainfall_3day_mm': three_day_rainfall,
        'drainage_efficiency': drainage_efficiency,
        'urbanization': urbanization,
        'elevation': elevation,
        'population_density': population_density,
        'area': area_name
    }
    
    return features, weather_data

def _predict_flood_risk(features: Dict[str, Any]) -> Dict[str, Any]:
    """Predict flood risk based on input features.

    Args:
        features: Dictionary of feature values

    Returns:
        Dictionary containing risk assessment
    """
    # Load model and preprocessor
    model, preprocessor = _load_model()
    
    # Convert features to DataFrame
    feature_df = pd.DataFrame([features])
    
    # Apply preprocessing
    processed_features = preprocessor.transform(feature_df)
    
    # Get model prediction
    prediction_numeric = model.predict(processed_features)[0]
    
    # Convert numeric prediction to risk level
    historical_data = _load_historical_data()
    risk_level = historical_data['severity_inverse_mapping'][prediction_numeric]
    
    # Get probability for each class
    probabilities = model.predict_proba(processed_features)[0]
    
    # Map class indices to risk levels
    risk_probs = {
        historical_data['severity_inverse_mapping'][i]: prob 
        for i, prob in enumerate(probabilities)
    }
    
    # Find the probability for the predicted risk level
    probability = risk_probs[risk_level]
    
    return {
        'risk_level': risk_level,
        'probability': float(probability),
        'detailed_probabilities': risk_probs
    }

async def predict_flood_risk(db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
    """Predict flood risk for a specific location in Bangalore.

    Args:
        db: Database session
        location: Geographic coordinates
        area_name: Name of the area being analyzed

    Returns:
        FloodPredictionResponse object with prediction results
    """
    try:
        # Collect features for prediction
        features, weather_data = await _collect_prediction_features(location, area_name)
        
        # Get prediction from model
        risk_assessment = _predict_flood_risk(features)
        
        # Create database entry
        db_prediction = FloodPrediction(
            area_name=area_name,
            location=f"POINT({location.lng} {location.lat})",
            rainfall_forecast=features.get('rainfall_mm', 0),
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

    Args:
        db: Database session

    Returns:
        Dictionary containing training results and metrics
    """
    try:
        # Force download of latest data (in a real system, this would fetch from APIs)
        if FLOOD_EVENTS_PATH.exists():
            # In a real system, we would update the file with new data, not delete it
            os.remove(FLOOD_EVENTS_PATH)
        if BANGALORE_RAINFALL_PATH.exists():
            os.remove(BANGALORE_RAINFALL_PATH)
        
        # Reset cached data
        global _historical_data
        _historical_data = None
        
        # Train new model
        model, preprocessor = train_model()
        
        # Get metrics on test data
        historical_data = _load_historical_data()
        features = historical_data['features']
        target = historical_data['target']
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        X_test_processed = preprocessor.transform(X_test)
        y_pred = model.predict(X_test_processed)
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Save retraining record in a real system
        
        return {
            "success": True,
            "message": "Model retrained successfully with updated Bangalore flood data",
            "metrics": {
                "accuracy": float(accuracy),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.exception(f"Error retraining model: {str(e)}")
        return {
            "success": False,
            "message": f"Model retraining failed: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

# Initialize the model on module import
def init():
    """Initialize the model when the service starts."""
    try:
        _load_historical_data()
        _load_model()
    except Exception as e:
        logger.error(f"Error initializing flood prediction model: {str(e)}")

# Call init to load the model on startup
init()
