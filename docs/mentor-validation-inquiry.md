# ShadowFox Submission Structure Inquiry & Mentor Clarification Draft

**Document Version:** 1.0.0  
**Date:** November 13, 2026  
**Internship Track:** ShadowFox AI Engineer Internship (Advanced Level)  
**Project:** NexusRAG - Reference-Driven, Citation-Grounded RAG Assistant  
**Candidate Name:** Harsh Chavan  
**Contact Email:** harshchavan1030@gmail.com  
**Mentor Query Address:** `g2doubts@shadowfox.in`  
**Specification Reference:** ShadowFox AI Engineer Task List (Requirement S1)  

---

## 1. Context & Purpose of Inquiry

In the official ShadowFox AI Engineer Internship Task List document, the submission instructions under **Task Submission Requirements** state:
> *"Submit the GitHub repository containing all the tasks, along with the video presentation link (Google Drive with public view access) via the official submission portal."*

For interns completing the **Advanced-Level Track**, NexusRAG is a full-scale, enterprise-grade application with a decoupled React 18 SPA frontend, FastAPI backend, 9-node LangGraph state machine, FAISS vector index, PostgreSQL 16 persistence, and a Docker containerization suite.

This inquiry is drafted for submission to the official mentor doubt email (`g2doubts@shadowfox.in`) or the official ShadowFox WhatsApp coordination channel to verify repository structuring expectations before final submission.

---

## 2. Formal Mentor Inquiry Email Draft

```text
To: g2doubts@shadowfox.in
Subject: Clarification on Repository Structure for Advanced-Level AI Engineer Submission - Harsh Chavan

Dear ShadowFox Mentors and Evaluation Team,

I hope this message finds you well.

I am an intern in the ShadowFox AI Engineer Internship program (Advanced-Level Track). My primary capstone project is NexusRAG, an auditable, citation-grounded Retrieval-Augmented Generation assistant built with FastAPI, LangGraph, FAISS, and a React 18 single-page application.

I am writing to request a brief clarification regarding the submission requirement stated in the task document:
"Submit the GitHub repository containing all the tasks, along with the video presentation link."

Could you please confirm the preferred repository layout for the final evaluation?

Option A (Dedicated Advanced Repository - Recommended for full-stack deployments):
The GitHub repository root directly hosts the complete NexusRAG production workspace (backend/, frontend/, docs/, scripts/, docker-compose.yml, and automated test suites). This allows automated CI/CD pipelines, Docker container builds, and live cloud deployments (Railway/Render) to run seamlessly from repository root.

Option B (Monorepo Directory Structure):
The repository contains top-level folders categorizing tasks across levels:
- tasks/beginner/ (Exploratory Data Analysis / Basic ML tasks)
- tasks/intermediate/ (NLP / Classification tasks)
- tasks/advanced/ (NexusRAG Full Application Suite)

Both options are fully prepared on my end. If Option A is acceptable for Advanced-Track candidates, I will submit the dedicated NexusRAG repository. If Option B is mandatory for the evaluation rubric, I will organize the repository into the monorepo structure accordingly.

Submission Package Readiness Checklist:
1. GitHub Repository: Clean Git commit history, 116 automated test scenarios passing (52 backend pytest + 28 frontend vitest + 28 route smoke + 8 E2E journeys), zero secrets, zero CVEs, full documentation suite.
2. Demonstration Video: 4-minute 15-second self-recorded video walk-through hosted on Google Drive with public view access enabled.
3. Traceability Matrix: Comprehensive mapping of all PDF requirements (R1 through R14, W1, W2, Q1, O1, E1, S1) with verified proof.

Thank you very much for your time, guidance, and support throughout the internship.

Warm regards,

Harsh Chavan
AI Engineer Intern, ShadowFox
Email: harshchavan1030@gmail.com
GitHub: https://github.com/harshchavan009/NEXUSRAG-AI
```

---

## 3. WhatsApp Coordination Channel Draft (Short-Form Alternative)

For quick communication via the official ShadowFox WhatsApp doubt group:

```text
Hi Mentors! Quick question regarding the Advanced-Level AI Engineer task submission:

The task PDF mentions submitting "the GitHub repository containing all the tasks". Since the Advanced Track project (NexusRAG) is a full-stack production application (FastAPI + React 18 + LangGraph + Docker Compose), should the GitHub repository directly host the NexusRAG application at root (Option A), or should we submit a monorepo with tasks/beginner, tasks/intermediate, and tasks/advanced (Option B)?

Both are ready on my end. Please let me know the preferred structure for the evaluation rubric. Thank you!
```

---

## 4. Repository Structuring Action Plan

Depending on mentor guidance received:
- **If Option A is confirmed (Standard for Advanced Track capstones):** Maintain the existing clean repository structure where root directly builds the backend, frontend, and Docker images.
- **If Option B is requested:** Structure the repository so that `tasks/beginner` and `tasks/intermediate` contain the respective codebooks/scripts, while `tasks/advanced/NexusRAG` contains the complete application, updating the root README.md with direct paths.

