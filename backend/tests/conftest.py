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

# Point global settings and database module to test DB for background tasks
settings.ENVIRONMENT = "testing"
settings.DATABASE_URL = TEST_DATABASE_URL
settings.GEMINI_API_KEY = ""
import backend.app.database as db_mod
db_mod.SessionLocal.configure(bind=test_engine)
db_mod.engine = test_engine

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

class MockGenAIResponse:
    def __init__(self, text: str):
        self.text = text

class MockModelsService:
    def generate_content(self, model: str, contents: str):
        content_lower = contents.lower()
        if "standalone query:" in content_lower or "reformulation" in content_lower:
            if "acme corp" in content_lower or "q3" in content_lower:
                return MockGenAIResponse("What is Acme Corp's operating margin for Q3?")
            return MockGenAIResponse("Detailed query reformulation for retrieval")
        if "verification evaluator" in content_lower or "faithful to the provided" in content_lower:
            return MockGenAIResponse('{"groundedness_score": 0.95, "reasoning": "Direct evidence cited in context."}')
        if "profit" in content_lower:
            return MockGenAIResponse("Cloud infrastructure operations generated $120 million in profit [1].")
        elif "solar" in content_lower or "photovoltaic" in content_lower or "efficiency" in content_lower:
            return MockGenAIResponse("Commercial monocrystalline solar modules achieved 22.8% field efficiency in 2024 [1].")
        elif "clean energy" in content_lower or "lfp" in content_lower or "battery" in content_lower:
            return MockGenAIResponse("LFP battery chemistry gained 82% utility market share due to thermal runaway safety, cycle lifetime, and zero cobalt reliance [1].")
        elif "byzantine" in content_lower or "traitor" in content_lower:
            return MockGenAIResponse("To tolerate f Byzantine traitor nodes, a distributed system requires at least 3f + 1 total nodes [1].")
        elif "raft" in content_lower or "election timeout" in content_lower:
            return MockGenAIResponse("Raft followers utilize a randomized election timeout interval of 150ms to 300ms [1].")
        elif "supermajority" in content_lower or "merger" in content_lower:
            return MockGenAIResponse("Material corporate mergers require the affirmative approval of a 75% supermajority of voting shares [1].")
        elif "rto" in content_lower or "rpo" in content_lower or "recovery time" in content_lower:
            return MockGenAIResponse("Disaster recovery protocols establish a maximum RTO of 4 hours and RPO of 15 minutes [1].")
        elif "clawback" in content_lower or "governance" in content_lower:
            return MockGenAIResponse("The Compensation Committee enforces a mandatory clawback policy under SEC Rule 10D-1 [1].")
        return MockGenAIResponse("The indexed documentation indicates key quantitative findings as cited [1].")

    def generate_content_stream(self, model: str, contents: str):
        res = self.generate_content(model, contents)
        return [res]

@pytest.fixture(autouse=True)
def mock_gemini_generation_in_tests(monkeypatch):
    """
    In automated pytest tests without a live external GEMINI_API_KEY,
    mock the external GenAI SDK Client models service so unit tests
    can verify end-to-end graph citation validation and groundedness.
    """
    if not settings.GEMINI_API_KEY:
        try:
            import google.genai
            class PatchedClient:
                def __init__(self, *args, **kwargs):
                    self.models = MockModelsService()
            monkeypatch.setattr(google.genai, "Client", PatchedClient)
        except Exception:
            pass
