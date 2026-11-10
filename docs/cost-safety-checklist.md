# AI Provider Key Cost-Safety & Security Checklist

**Document Version:** 1.0.0  
**Phase:** Phase 9 Preparation (Operational Security & Cost Governance)  
**Target Provider:** Google Gemini API (Google Cloud / AI Studio) & OpenAI API  

---

## 1. Executive Summary

Deploying a public-facing Retrieval-Augmented Generation application poses financial and operational risks if API keys are mishandled, exposed in client-side bundles, or left without spending quotas. This checklist outlines the mandatory security controls, budget guards, and rotation procedures required for production operations.

---

## 2. API Key Hygiene & Provisioning

- [ ] **Dedicated Production Key:** Never reuse personal, hackathon, or development keys for the live production deployment. Create an isolated Google Cloud project (`nexusrag-production`) dedicated solely to this deployment.
- [ ] **Zero Client Exposure:** Ensure the API key is never bundled in frontend JavaScript, checked into source control, or logged to console outputs.
  - NexusRAG injects the key only into backend environment variables (`GEMINI_API_KEY`).
  - Confirmed via `detect-secrets scan`: zero API keys detected across repository files and Git history.
- [ ] **API Scope Restrictions (Least Privilege):**
  - In Google Cloud Console $\to$ **APIs & Services $\to$ Credentials $\to$ Edit Key**:
  - Set **API Restrictions** to restrict the key strictly to:
    - *Generative Language API* (Gemini API)
  - Prevent the key from accessing Cloud Storage, Compute Engine, BigQuery, or any other unrelated Google Cloud API.
- [ ] **IP / Ingress Restrictions:** If deploying on a fixed VPS or dedicated IP range, restrict API key usage to the server's outgoing IP address.

---

## 3. Spending Limits & Quota Protections

- [ ] **Set Hard Budget Spending Caps:**
  - In Google Cloud Billing Console $\to$ **Budgets & Alerts**:
  - Create a monthly budget (e.g. **\$15.00 USD / month** or **\$25.00 USD / month**).
  - Configure alert thresholds at **50%**, **75%**, **90%**, and **100%** of budget.
  - Enable email notifications to `harshchavan1030@gmail.com`.
- [ ] **Daily Model Rate Limits:**
  - In Google AI Studio or Cloud Console $\to$ **Quotas**:
  - Cap Requests Per Minute (RPM) and Tokens Per Minute (TPM) to prevent sudden spikes.
  - Recommended baseline: 30 RPM, 60,000 TPM.
- [ ] **Application-Level Rate Limiting (NexusRAG Built-in):**
  - NexusRAG enforces sliding-window limits before requests reach the external model:
    - 60 requests / minute per client IP / workspace.
    - 200 total queries / day per workspace.
    - 50 document uploads / day per workspace.
  - Requests exceeding limits return HTTP `429 RATE_LIMIT_EXCEEDED` without consuming model credits.

---

## 4. Key Rotation Procedures (Zero-Downtime)

When rotating an API key due to routine schedule (e.g. every 90 days) or suspected compromise:

1. **Generate Secondary Key:**
   - In Google Cloud Console, generate a new API key (`GEMINI_API_KEY_SECONDARY`).
   - Apply identical API restrictions (Generative Language API only).
2. **Update Deployment Environment:**
   - On the hosting provider (Render, Railway, or VPS):
     ```bash
     # Update environment variable
     GEMINI_API_KEY="new_key_here..."
     ```
3. **Trigger Seamless Rolling Restart:**
   - Redeploy or trigger rolling container restart.
   - Verify health check: `curl -f https://your-domain/api/v1/health`.
4. **Revoke Old Key:**
   - Once all containers report healthy on the new key, return to Google Cloud Console and disable/delete the old key.
   - Confirm in metrics dashboard that the old key receives 0 requests.

---

## 5. Emergency Incident Response: Suspected Key Leak

If an API key is accidentally printed, committed, or exposed:

1. **Step 1: Immediate Revocation (< 2 minutes)**
   - Immediately delete or disable the key in Google Cloud Console. Do not wait to replace it.
2. **Step 2: Inspect Billing Metrics (< 5 minutes)**
   - Check Google Cloud Billing reports for abnormal request spikes in the preceding 6 hours.
3. **Step 3: Issue New Restricted Key & Redeploy**
   - Provision a fresh restricted key and update `.env` on production host.
4. **Step 4: Clean Git History**
   - Run `detect-secrets scan` and verify that no commit in history references the compromised credential.

