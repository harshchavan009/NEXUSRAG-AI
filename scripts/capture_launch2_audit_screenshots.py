import os
import time
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    '1440': {'width': 1440, 'height': 900},
    '820': {'width': 820, 'height': 1000},
    '390': {'width': 390, 'height': 844},
}

THEMES = ['light', 'dark']

OUTPUT_DIR = os.path.abspath('docs/screenshots/launch2_audit')
os.makedirs(OUTPUT_DIR, exist_ok=True)

PUBLIC_ROUTES = [
    ('landing', 'http://localhost:5173/'),
    ('docs', 'http://localhost:5173/docs'),
    ('security', 'http://localhost:5173/security'),
    ('faq', 'http://localhost:5173/faq'),
    ('status', 'http://localhost:5173/status'),
    ('about', 'http://localhost:5173/about'),
]

APP_ROUTES = [
    ('dashboard', 'http://localhost:5173/app'),
    ('knowledge', 'http://localhost:5173/app/knowledge'),
    ('research', 'http://localhost:5173/app/research'),
    ('reader', 'http://localhost:5173/app/reader'),
    ('inspector', 'http://localhost:5173/app/inspector'),
    ('settings', 'http://localhost:5173/app/settings'),
]

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

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Playwright launched for Launch 2 Audit screenshots.")

        # First, ensure sample documents are ingested so screens are not empty
        setup_ctx = browser.new_context()
        setup_page = setup_ctx.new_page()
        setup_page.goto('http://localhost:5173/app/knowledge', wait_until='networkidle')
        try:
            sample_btn = setup_page.locator("button:has-text('Load Sample Research Papers')").first
            if sample_btn.is_visible():
                print("Clicking Load Sample Research Papers...")
                sample_btn.click()
                time.sleep(3.0)
        except Exception as e:
            print(f"Sample load note: {e}")
        setup_ctx.close()

        # Capture across viewports and themes
        for vp_name, vp_size in VIEWPORTS.items():
            for theme in THEMES:
                context = browser.new_context(
                    viewport=vp_size,
                    color_scheme=theme,
                )
                page = context.new_page()

                # Public routes
                for name, url in PUBLIC_ROUTES:
                    try:
                        page.goto(url, wait_until='networkidle')
                        apply_theme(page, theme)
                        shot_path = os.path.join(OUTPUT_DIR, f"public_{name}_{vp_name}_{theme}.png")
                        page.screenshot(path=shot_path, full_page=False)
                        print(f"Captured: public_{name}_{vp_name}_{theme}.png")
                    except Exception as e:
                        print(f"Failed {name}: {e}")

                # App routes
                for name, url in APP_ROUTES:
                    try:
                        page.goto(url, wait_until='networkidle')
                        apply_theme(page, theme)
                        shot_path = os.path.join(OUTPUT_DIR, f"app_{name}_{vp_name}_{theme}.png")
                        page.screenshot(path=shot_path, full_page=False)
                        print(f"Captured: app_{name}_{vp_name}_{theme}.png")
                    except Exception as e:
                        print(f"Failed {name}: {e}")

                context.close()

        browser.close()
        print(f"Launch 2 Audit screenshot capture complete in {OUTPUT_DIR}")

if __name__ == '__main__':
    main()

