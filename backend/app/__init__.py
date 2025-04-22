
"""Karnataka Urban Pulse backend application."""

import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Import modules after environment is loaded
from .database import Base, engine
from . import models
from . import schemas
from . import services

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Log application startup
logger = logging.getLogger(__name__)
logger.info("Karnataka Urban Pulse backend initialized")
