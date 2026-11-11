import os
import time
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    '1440': {'width': 1440, 'height': 900},
    '820': {'width': 820, 'height': 1000},
    '390': {'width': 390, 'height': 844},
}

VIEWS = [
    ('landing', 'Overview'),
    ('dashboard', 'Ask-First Desk'),
    ('library', 'Knowledge Bases'),
    ('research', 'Research Sessions'),
    ('reader', 'Document Reader'),
    ('inspector', 'Retrieval Inspector'),
    ('settings', 'System Settings'),
]

THEMES = ['light', 'dark']

OUTPUT_DIR = os.path.abspath('docs/screenshots/audit')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        print("Browser launched.")
        
        for vp_name, vp_size in VIEWPORTS.items():
            for theme in THEMES:
                context = browser.new_context(
                    viewport=vp_size,
                    color_scheme=theme,
                )
                page = context.new_page()
                page.goto('http://localhost:5173', wait_until='networkidle')
                time.sleep(1)

                # Set theme via localStorage and DOM class
                page.evaluate(f"""
                    localStorage.setItem('nexusrag_theme', '{theme}');
                    if ('{theme}' === 'dark') {{
                        document.documentElement.classList.add('dark');
                    }} else {{
                        document.documentElement.classList.remove('dark');
                    }}
                """)
                time.sleep(0.5)

                for view_key, nav_label in VIEWS:
                    # Click nav button by aria-label or title
                    try:
                        btn = page.locator(f'button[aria-label="{nav_label}"]')
                        if btn.count() > 0:
                            btn.first.click()
                        else:
                            page.locator(f'button[title="{nav_label}"]').first.click()
                        time.sleep(0.8)
                    except Exception as e:
                        print(f"Error navigating to {nav_label}: {e}")

                    screenshot_path = os.path.join(OUTPUT_DIR, f"{view_key}_{vp_name}_{theme}.png")
                    page.screenshot(path=screenshot_path, full_page=False)
                    print(f"Captured: {view_key}_{vp_name}_{theme}.png ({vp_name}px, {theme})")

                context.close()
        browser.close()
        print("All audit screenshots captured successfully.")

if __name__ == '__main__':
    main()
