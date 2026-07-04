import os
import sys
import shutil
import asyncio
import logging

# Set up simple console logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("reset_db")

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import get_settings
from app.storage.database import init_db, engine

async def reset_database():
    settings = get_settings()
    db_url = settings.DATABASE_URL
    
    logger.info(f"Database URL configured: {db_url}")
    
    # 1. Dispose active engine connections
    await engine.dispose()
    logger.info("Disposed database connection engine.")

    # 2. Delete SQLite database files
    if "sqlite" in db_url:
        db_file = db_url.split("///")[-1]
        logger.info(f"Detected SQLite database file: {db_file}")
        
        # Files to clean up
        files_to_delete = [
            db_file,
            f"{db_file}-journal",
            f"{db_file}-wal",
            f"{db_file}-shm"
        ]
        
        for file in files_to_delete:
            if os.path.exists(file):
                try:
                    os.remove(file)
                    logger.info(f"Deleted database file: {file}")
                except Exception as e:
                    logger.error(f"Could not delete {file}: {e}")
            else:
                logger.debug(f"File does not exist: {file}")
    else:
        logger.warning("Configured database is not SQLite. Dropping tables via sync metadata instead.")
        # For non-sqlite, we drop all tables
        async with engine.begin() as conn:
            from app.storage.database import Base
            from app.storage import models as _models # noqa
            logger.info("Dropping all existing database tables...")
            await conn.run_sync(Base.metadata.drop_all)
            logger.info("Tables dropped successfully.")

    # 3. Clear uploads directory
    uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
    if os.path.exists(uploads_dir):
        try:
            shutil.rmtree(uploads_dir)
            logger.info(f"Cleared uploads directory: {uploads_dir}")
        except Exception as e:
            logger.error(f"Failed to clear uploads directory {uploads_dir}: {e}")
            
    # Re-create empty uploads directory
    try:
        os.makedirs(uploads_dir, exist_ok=True)
        logger.info(f"Created fresh empty uploads directory: {uploads_dir}")
    except Exception as e:
        logger.error(f"Failed to create uploads directory: {e}")

    # 4. Initialize fresh database tables
    logger.info("Initializing fresh database tables...")
    try:
        await init_db()
        logger.info("Database initialized successfully with fresh tables!")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Run the async loop
    try:
        asyncio.run(reset_database())
        logger.info("Database reset completed successfully!")
    except KeyboardInterrupt:
        logger.info("Database reset aborted by user.")
    except Exception as exc:
        logger.critical(f"Unhandled error resetting database: {exc}")
        sys.exit(1)
