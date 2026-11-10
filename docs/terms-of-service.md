# NexusRAG Terms of Service (Draft for User Review)

**Effective Date:** November 10, 2026  
**Status:** Review Draft (Not formal legal advice)  
**Product:** NexusRAG Document Intelligence Assistant  

---

## 1. Acceptance of Terms

By accessing or using NexusRAG ("the Application"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not upload documents or submit research queries.

---

## 2. Permitted Use & Acceptable Conduct

NexusRAG is intended for research, document exploration, and evaluating agentic Retrieval-Augmented Generation workflows.

You agree not to use the Application to:
1. Upload malicious software, corrupted files, viruses, or executables designed to disrupt server operations.
2. Upload proprietary, confidential, or personally identifiable material without proper legal authorization.
3. Conduct automated abuse, denial-of-service attacks, or attempt to circumvent rate limits (60 requests per minute).
4. Probe, scan, or exploit security vulnerabilities or attempt cross-tenant data access.
5. Upload content that promotes unlawful acts, hate speech, harassment, or infringes intellectual property rights.

---

## 3. Calibrated Output Notice & Disclaimer of Advice

### 3.1 Nature of Generative Outputs
NexusRAG uses Retrieval-Augmented Generation to synthesize answers from user-uploaded documents. While NexusRAG implements evidence sufficiency checks and citation validation gates, artificial intelligence models can generate inaccurate, biased, or incomplete statements.

### 3.2 No Professional Advice
The Application does not provide legal, financial, accounting, medical, or clinical advice:
- Any synthesis regarding legal filings, regulatory papers, or contracts must be reviewed by qualified legal counsel.
- Any analysis of financial reports, metrics, or projections is provided for exploratory purposes only and does not constitute investment advice.
- Users are required to verify bracketed citations `[1]`, `[2]` against the original source documents before relying on any output.

---

## 4. Intellectual Property & Document Ownership

- **Your Content:** You retain full ownership and intellectual property rights to all documents, files, and queries you submit to NexusRAG. We claim zero ownership or copyright over your uploaded materials.
- **Application Rights:** All software architecture, user interface design, logos, vector pipeline components, and source code of NexusRAG are the intellectual property of Harsh Chavan and licensed under the MIT License where applicable.

---

## 5. Rate Limits & Quotas

To preserve service stability for all users, NexusRAG enforces:
- Sliding-window rate limit of 60 requests per minute per IP / workspace.
- Daily query limit of 200 queries per workspace.
- Daily upload limit of 50 documents per workspace.
- Maximum individual file size of 25MB ($26,214,400$ bytes).
- Supported file formats: `.pdf`, `.txt`, `.md`.

Attempts to exceed these thresholds will return HTTP `429 Too Many Requests` with a `Retry-After` header.

---

## 6. Limitation of Liability

To the maximum extent permitted by applicable law, NexusRAG and its contributors shall not be liable for any indirect, incidental, consequential, special, or punitive damages, including loss of profits, data, goodwill, or operational disruption resulting from your use of or inability to use the Application.

The Application is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied.

---

## 7. Modifications & Termination

We reserve the right to modify these Terms or suspend workspace access at any time to preserve system integrity or comply with regulatory guidelines.

For questions regarding these Terms:  
**Contact:** Harsh Chavan — [harshchavan1030@gmail.com](mailto:harshchavan1030@gmail.com)  
**Repository:** [https://github.com/harshchavan009/NEXUSRAG-AI.git](https://github.com/harshchavan009/NEXUSRAG-AI.git)

