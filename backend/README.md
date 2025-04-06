# Karnataka Urban Pulse Backend

Backend implementation for the Karnataka Urban Pulse project, providing APIs for flood prediction, lake monitoring, and urban planning insights.

## Features

- Flood prediction using ML models and real-time weather data
- Lake health monitoring with encroachment detection
- Urban planning insights with zoning analysis
- JWT-based authentication with role-based access control
- PostgreSQL + PostGIS for geospatial data handling

## Tech Stack

- FastAPI
- SQLAlchemy + PostgreSQL
- PostGIS for geospatial operations
- scikit-learn & XGBoost for ML models
- Python Geospatial libraries (Shapely, GeoPy)

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL with PostGIS:
- Install PostgreSQL and PostGIS extension
- Create a database named 'karnataka_urban_pulse'
- Enable PostGIS: `CREATE EXTENSION postgis;`

4. Configure environment variables:
Create a `.env` file with:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/karnataka_urban_pulse
JWT_SECRET_KEY=your-secret-key
OWM_API_KEY=your-openweathermap-api-key
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Start the development server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Main Endpoints

#### Authentication
- POST `/token` - Get access token
- POST `/register` - Register new user

#### Flood Prediction
- POST `/api/flood-prediction` - Get flood risk prediction
- GET `/api/flood-predictions/recent` - Get recent predictions

#### Lake Monitoring
- POST `/api/lake-health` - Get lake health assessment
- GET `/api/lakes` - Get all lakes

#### Urban Planning
- POST `/api/urban-insights` - Get urban planning insights

## Development Guidelines

1. Code Style
- Follow PEP 8 guidelines
- Use type hints
- Write docstrings for functions

2. Database
- Use SQLAlchemy models for database operations
- Handle geospatial data with PostGIS functions
- Implement proper indexing

3. Security
- Validate all input data
- Use role-based access control
- Keep API keys and secrets in environment variables

4. Testing
- Write unit tests for services
- Test API endpoints
- Mock external API calls

## Integration with Frontend

The backend is designed to work seamlessly with the existing React frontend:

1. CORS is configured to allow requests from the frontend
2. API responses match the frontend's data structures
3. Authentication flow supports the existing Supabase setup

## Deployment

1. Build the application:
```bash
pip install -r requirements.txt
```

2. Set production environment variables

3. Run with a production server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit a pull request

## License

MIT License