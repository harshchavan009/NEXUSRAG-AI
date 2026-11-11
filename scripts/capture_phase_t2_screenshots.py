import os
import time
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    '1440': {'width': 1440, 'height': 900},
    '820': {'width': 820, 'height': 1000},
    '390': {'width': 390, 'height': 844},
}

THEMES = ['light', 'dark']

OUTPUT_DIR = os.path.abspath('docs/screenshots/phase_t2')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Playwright Chromium browser launched.")

        # Ensure sample documents are loaded in backend for rich screenshot data
        for vp_name, vp_size in VIEWPORTS.items():
            for theme in THEMES:
                context = browser.new_context(
                    viewport=vp_size,
                    color_scheme=theme,
                )
                page = context.new_page()

                # 1. Public Landing Page at /
                page.goto('http://localhost:5173/', wait_until='networkidle')
                time.sleep(1)
                page.evaluate(f"""
                    localStorage.setItem('nexusrag_theme', '{theme}');
                    if ('{theme}' === 'dark') {{
                        document.documentElement.classList.add('dark');
                    }} else {{
                        document.documentElement.classList.remove('dark');
                    }}
                """)
                time.sleep(0.5)

                landing_shot = os.path.join(OUTPUT_DIR, f"public_landing_{vp_name}_{theme}.png")
                page.screenshot(path=landing_shot, full_page=False)
                print(f"Captured: public_landing_{vp_name}_{theme}.png ({vp_name}px, {theme})")

                # 2. Authenticated Dashboard at /app/dashboard
                page.goto('http://localhost:5173/app/dashboard', wait_until='networkidle')
                time.sleep(1.5)
                page.evaluate(f"""
                    localStorage.setItem('nexusrag_theme', '{theme}');
                    if ('{theme}' === 'dark') {{
                        document.documentElement.classList.add('dark');
                    }} else {{
                        document.documentElement.classList.remove('dark');
                    }}
                """)
                time.sleep(0.5)

                dash_shot = os.path.join(OUTPUT_DIR, f"app_dashboard_{vp_name}_{theme}.png")
                page.screenshot(path=dash_shot, full_page=False)
                print(f"Captured: app_dashboard_{vp_name}_{theme}.png ({vp_name}px, {theme})")

                # 3. Knowledge Bases at /app/knowledge
                page.goto('http://localhost:5173/app/knowledge', wait_until='networkidle')
                time.sleep(1)
                page.evaluate(f"""
                    localStorage.setItem('nexusrag_theme', '{theme}');
                    if ('{theme}' === 'dark') {{
                        document.documentElement.classList.add('dark');
                    }} else {{
                        document.documentElement.classList.remove('dark');
                    }}
                """)
                time.sleep(0.5)

                kb_shot = os.path.join(OUTPUT_DIR, f"app_knowledge_{vp_name}_{theme}.png")
                page.screenshot(path=kb_shot, full_page=False)
                print(f"Captured: app_knowledge_{vp_name}_{theme}.png ({vp_name}px, {theme})")

                # 4. Expanded Rail (at 1440px desktop)
                if vp_name == '1440':
                    try:
                        expand_btn = page.locator('button[aria-label="Expand sidebar"]')
                        if expand_btn.count() > 0:
                            expand_btn.click()
                            time.sleep(0.5)
                            expanded_shot = os.path.join(OUTPUT_DIR, f"app_rail_expanded_{theme}.png")
                            page.screenshot(path=expanded_shot, full_page=False)
                            print(f"Captured: app_rail_expanded_{theme}.png (1440px, {theme})")
                    except Exception as e:
                        print(f"Could not toggle expand rail: {e}")

                context.close()

        browser.close()
        print("All Phase T2 multi-viewport screenshots captured successfully.")

if __name__ == '__main__':
    main()

