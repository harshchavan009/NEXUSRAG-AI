import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.config import settings
from backend.app.core.security import generate_session_token, generate_csrf_token

# Configure isolated test database
TEST_DB_PATH = settings.STORAGE_DIR / "test_runner.db"
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Point global settings to test DB for background tasks
settings.DATABASE_URL = TEST_DATABASE_URL

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
        except OSError:
            pass

@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    yield session
    session.close()
    # Clean table data between test functions
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def workspace_a_auth():
    token = generate_session_token()
    csrf = generate_csrf_token(token)
    return {"token": token, "csrf": csrf}

@pytest.fixture
def workspace_b_auth():
    token = generate_session_token()
    csrf = generate_csrf_token(token)
    return {"token": token, "csrf": csrf}
