# Contributing to NexusRAG

Thank you for your interest in contributing to NexusRAG! We welcome issues, bug reports, and pull requests that improve the reliability, security, and developer experience of the platform.

---

## 1. Code of Conduct & Expectations

We expect all contributors to adhere to standard professional etiquette:
- Be respectful, constructive, and collaborative.
- Use clear, accurate language and avoid unverified claims.
- Never commit credentials, API keys, personal test documents, or real user data.

---

## 2. Development Setup

### Prerequisites
- **Python:** 3.11 or higher (Python 3.11 - 3.14 supported)
- **Node.js:** 20.x or higher (npm 10+)
- **Git**

### Step-by-Step Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshchavan009/NEXUSRAG-AI.git
   cd NEXUSRAG-AI
   ```

2. **Backend Setup:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r backend/requirements.txt
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   alembic upgrade head
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Run Development Servers:**
   - **Terminal 1 (Backend):**
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - **Terminal 2 (Frontend):**
     ```bash
     npm --prefix frontend run dev
     ```
   - Open `http://localhost:5173` in your browser.

---

## 3. Pull Request Guidelines

1. **Create a topic branch:**
   ```bash
   git checkout -b feat/your-feature-name
   # or: git checkout -b fix/issue-description
   ```

2. **Commit Conventions:**
   Use clear, conventional commit messages:
   - `feat:` New user-facing feature or API capability
   - `fix:` Bug fix or error resolution
   - `docs:` Documentation improvements
   - `test:` New or updated automated tests
   - `refactor:` Code restructuring without functional changes

3. **Strict Constraints:**
   - **Zero Em Dashes:** Never introduce Unicode em dashes (`—`) into code, comments, or docs. Use hyphens (`-`) or colons.
   - **Zero Committed Secrets:** Verify no keys or passwords exist in your branch before pushing.
   - **No Pill Shapes:** Maintain the geometric design system (`rounded-md` or `rounded-lg`, never `rounded-full` for interactive pills or status badges).

---

## 4. Verification & Testing Checklist

Before submitting a Pull Request, verify that all test suites pass locally:

```bash
# 1. Backend tests & coverage (must maintain >= 85% coverage)
pytest backend/tests -v --cov=backend/app

# 2. Frontend unit tests
npm --prefix frontend test -- --run

# 3. Production build compilation
npm --prefix frontend run build

# 4. Dependency security audit
python3 -m pip_audit -r backend/requirements.txt
npm --prefix frontend audit

# 5. Secret detection scan
detect-secrets scan

# 6. Zero em dash verification
grep -rn "—" backend frontend/src docs || echo "Clean"
```

---

## 5. Reporting Security Vulnerabilities

Please **do not** open public GitHub issues for security vulnerabilities.
Review our [Security Policy](SECURITY.md) for private reporting channels and SLA details.

