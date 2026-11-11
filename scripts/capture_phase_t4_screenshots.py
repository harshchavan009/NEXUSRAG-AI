import os
import time
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    '1440': {'width': 1440, 'height': 900},
    '820': {'width': 820, 'height': 1000},
    '390': {'width': 390, 'height': 844},
}

THEMES = ['light', 'dark']

OUTPUT_DIR = os.path.abspath('docs/screenshots/phase_t4')
os.makedirs(OUTPUT_DIR, exist_ok=True)

PUBLIC_PAGES = [
    ('landing', 'http://localhost:5173/'),
    ('docs', 'http://localhost:5173/docs'),
    ('security', 'http://localhost:5173/security'),
    ('faq', 'http://localhost:5173/faq'),
    ('status', 'http://localhost:5173/status'),
]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Playwright Chromium browser launched.")

        for vp_name, vp_size in VIEWPORTS.items():
            for theme in THEMES:
                context = browser.new_context(
                    viewport=vp_size,
                    color_scheme=theme,
                )
                page = context.new_page()

                for page_key, page_url in PUBLIC_PAGES:
                    page.goto(page_url, wait_until='networkidle')
                    time.sleep(0.8)
                    page.evaluate(f"""
                        localStorage.setItem('nexusrag_theme', '{theme}');
                        if ('{theme}' === 'dark') {{
                            document.documentElement.classList.add('dark');
                        }} else {{
                            document.documentElement.classList.remove('dark');
                        }}
                    """)
                    time.sleep(0.4)

                    shot_path = os.path.join(OUTPUT_DIR, f"public_{page_key}_{vp_name}_{theme}.png")
                    page.screenshot(path=shot_path, full_page=False)
                    print(f"Captured: public_{page_key}_{vp_name}_{theme}.png ({vp_name}px, {theme})")

                context.close()

        browser.close()
        print("All Phase T4 public ecosystem screenshots captured successfully.")

if __name__ == '__main__':
    main()
