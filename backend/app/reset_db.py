from app.database import Base, engine

# Drop all tables (wipe the DB)
Base.metadata.drop_all(bind=engine)

# Recreate all tables
Base.metadata.create_all(bind=engine)

print("Database has been reset.")
