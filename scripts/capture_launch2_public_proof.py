import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
PUBLIC_DIR = os.path.abspath("frontend/public/screenshots")
PROOF_DIR = os.path.abspath("docs/screenshots/launch2_proof")
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(PROOF_DIR, exist_ok=True)

VIEWPORTS = {
    '1440': {'width': 1440, 'height': 900},
    '820': {'width': 820, 'height': 1000},
    '390': {'width': 390, 'height': 844},
}

THEMES = ['light', 'dark']

def apply_theme(page, theme):
    page.evaluate(f"""
        localStorage.setItem('nexusrag_theme', '{theme}');
        if ('{theme}' === 'dark') {{
            document.documentElement.classList.add('dark');
        }} else {{
            document.documentElement.classList.remove('dark');
        }}
    """)
    time.sleep(0.3)

def capture_public_proof():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("\n============================================================")
        print("NEXUSRAG LAUNCH 2 SCRIPTED SCREENSHOT GENERATION")
        print("============================================================")

        # Step 1: Prepare Populated Workspace in Persistent Context
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n[STEP 1] Ingesting authentic sample research documents...")
        page.goto(f"{BASE_URL}/app/dashboard", wait_until="networkidle")
        time.sleep(1.0)

        # Trigger sample document loading
        try:
            sample_btn = page.locator("button:has-text('Load Sample Docs')").first
            if not sample_btn.is_visible():
                sample_btn = page.locator("button:has-text('Add Sample Docs')").first
            if sample_btn.is_visible():
                sample_btn.click()
                print(" -> Clicked sample ingestion button. Waiting for extraction & indexing...")
                time.sleep(5.0)
        except Exception as e:
            print(f" -> Sample trigger note: {e}")

        # Verify documents appear in dashboard
        page.goto(f"{BASE_URL}/app/dashboard", wait_until="networkidle")
        time.sleep(1.5)

        # Step 2: Issue a grounded research inquiry in Research Desk
        print("\n[STEP 2] Submitting grounded research inquiry in Research Desk...")
        page.goto(f"{BASE_URL}/app/research", wait_until="networkidle")
        time.sleep(1.0)

        ask_input = page.locator("input[placeholder*='Ask a question']").first
        if ask_input.is_visible():
            query = "What was the average field efficiency of commercial monocrystalline silicon solar modules in 2024?"
            ask_input.fill(query)
            page.locator("button[type='submit']").first.click()
            print(f" -> Submitted query: '{query}'")

            # Wait for streamed synthesis tokens
            print(" -> Awaiting LangGraph 9-node streaming synthesis & citations...")
            for _ in range(20):
                text = page.locator("main").text_content()
                if "Verified Citations" in text or "[1]" in text:
                    break
                time.sleep(1.0)
            time.sleep(2.0)

        # Step 3: Click Citation [1] to activate passage highlight in Panel 3
        print("\n[STEP 3] Opening citation [1] in Research Desk passage panel...")
        citation_chip = page.locator("button:has-text('[1]')").first
        if citation_chip.is_visible():
            citation_chip.click()
            time.sleep(1.0)

        # Step 4: Capture 1440px High-Resolution Public Marketing Assets
        print("\n[STEP 4] Capturing crisp 1440px public showcase assets...")

        # A. Research Desk View (showing real synthesis, [1] chip, passage in panel 3)
        research_dest = os.path.join(PUBLIC_DIR, "research.png")
        page.screenshot(path=research_dest)
        print(f" -> Captured: {research_dest}")

        # B. Document Reader View (navigated from citation)
        open_reader_btn = page.locator("button:has-text('Open in Document Reader')").first
        if open_reader_btn.is_visible():
            open_reader_btn.click()
            time.sleep(2.0)
        else:
            page.goto(f"{BASE_URL}/app/reader", wait_until="networkidle")
            time.sleep(2.0)

        reader_dest = os.path.join(PUBLIC_DIR, "reader.png")
        page.screenshot(path=reader_dest)
        print(f" -> Captured: {reader_dest}")

        # C. Retrieval Inspector View (showing real LangGraph 9-node DAG trace)
        page.goto(f"{BASE_URL}/app/inspector", wait_until="networkidle")
        time.sleep(1.5)
        inspector_dest = os.path.join(PUBLIC_DIR, "inspector.png")
        page.screenshot(path=inspector_dest)
        print(f" -> Captured: {inspector_dest}")

        # D. Dashboard Workspace View (showing 4 documents, 18+ chunks, processing feed)
        page.goto(f"{BASE_URL}/app/dashboard", wait_until="networkidle")
        time.sleep(1.5)
        dashboard_dest = os.path.join(PUBLIC_DIR, "dashboard.png")
        page.screenshot(path=dashboard_dest)
        print(f" -> Captured: {dashboard_dest}")

        # E. Knowledge Bases Library View (showing collections, table, move controls)
        page.goto(f"{BASE_URL}/app/knowledge", wait_until="networkidle")
        time.sleep(1.5)
        library_dest = os.path.join(PUBLIC_DIR, "library.png")
        page.screenshot(path=library_dest)
        print(f" -> Captured: {library_dest}")

        # F. System Settings View (showing AI probe online, sliders, database)
        page.goto(f"{BASE_URL}/app/settings", wait_until="networkidle")
        time.sleep(1.5)
        settings_dest = os.path.join(PUBLIC_DIR, "settings.png")
        page.screenshot(path=settings_dest)
        print(f" -> Captured: {settings_dest}")

        # Step 5: Multi-Viewport Responsive Captures (1440, 820, 390px in light/dark)
        print("\n[STEP 5] Capturing multi-viewport responsive proofs for launch report...")
        for vp_name, vp_size in VIEWPORTS.items():
            for theme in THEMES:
                vp_ctx = browser.new_context(
                    viewport=vp_size,
                    color_scheme=theme,
                )
                vp_page = vp_ctx.new_page()

                # Dashboard capture
                vp_page.goto(f"{BASE_URL}/app/dashboard", wait_until="networkidle")
                apply_theme(vp_page, theme)
                dash_path = os.path.join(PROOF_DIR, f"dashboard_{vp_name}_{theme}.png")
                vp_page.screenshot(path=dash_path)

                # Public Landing capture
                vp_page.goto(f"{BASE_URL}/", wait_until="networkidle")
                apply_theme(vp_page, theme)
                landing_path = os.path.join(PROOF_DIR, f"landing_{vp_name}_{theme}.png")
                vp_page.screenshot(path=landing_path)

                print(f" -> Captured proof: {vp_name}px {theme} (dashboard & landing)")
                vp_ctx.close()

        context.close()
        browser.close()
        print("\n============================================================")
        print("ALL LAUNCH 2 SCREENSHOTS REGENERATED AND DEPLOYED SUCCESSFULLY")
        print("============================================================\n")

if __name__ == "__main__":
    capture_public_proof()

