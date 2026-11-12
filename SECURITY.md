# NexusRAG Security Policy

## 1. Supported Versions

Security updates and vulnerability remediation are actively maintained for the following versions:

| Version | Status | Supported Until |
|---|---|---|
| `1.0.x` | Supported | Active Support |
| `< 1.0.0` | End of Life | Not Supported |

---

## 2. Reporting a Vulnerability

The NexusRAG maintainers take security and data isolation seriously. If you discover a security vulnerability in this project, please report it through private, coordinated disclosure.

### Preferred Reporting Channels
1. **GitHub Private Vulnerability Advisory:**  
   Submit a confidential report at [GitHub Security Advisories](https://github.com/harshchavan009/NEXUSRAG-AI/security/advisories/new).
2. **Security Contact Email:**  
   Email details to `security@nexusrag.internal` with the subject tag `[SECURITY VULNERABILITY] NexusRAG`.

### Information to Include in Your Report
To help us triage and remediate the issue quickly, please provide:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
- Affected endpoints, parameters, or architectural components.
- Your assessment of severity (CVSS score or qualitative impact).

### Response SLA & Disclosure Timeline
- **Initial Acknowledgment:** Within 48 hours of receipt.
- **Triage and Impact Assessment:** Within 5 business days.
- **Remediation & Patch Deployment:** Target resolution within 14 days for high-severity issues.
- **Public Disclosure:** Coordinated with the reporter following release of the fix.

---

## 3. In-Scope Components

The following architectural surfaces are in scope for security evaluations:
- **Tenant Isolation Middleware:** HttpOnly, Secure, SameSite=Lax session cookies (`nexus_session`) and double-submit CSRF token validation (`X-CSRF-Token`).
- **Data Scoping:** SQL queries and vector store operations strictly scoped to `workspace_id`.
- **Upload Pipeline:** Magic bytes validation, file size limits (25MB cap), path traversal sanitization, and SHA-256 deduplication.
- **RAG Execution Engine:** Prompt injection resistance, evidence gate thresholds, and citation faithfulness filtering.
- **API Endpoints:** Rate limiting, security headers (CSP, HSTS, X-Content-Type-Options, Frame Options, Referrer Policy).

---

## 4. Out of Scope

The following items are outside the project's security scope:
- Upstream third-party model availability, pricing, or rate limits on Google AI Studio endpoints.
- Self-XSS requiring physical access or user console injection.
- Denial of Service attacks originating from volumetric infrastructure saturation beyond standard rate limiters.
- Social engineering against project maintainers.

---

## 5. Security Architecture Highlights

- **Zero Third-Party Tracking:** NexusRAG transmits no telemetry, analytics, or behavioral cookies to third parties.
- **Encapsulated Vector Store:** FAISS vectors are partitioned per workspace in separate physical files (`/storage/faiss/{workspace_id}/index.faiss`).
- **Calibrated Honesty:** Structural evidence checks reduce hallucination risk through algorithmic abstention without claiming complete elimination.

