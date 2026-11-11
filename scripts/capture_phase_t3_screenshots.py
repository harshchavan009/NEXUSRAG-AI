import os
import time
from playwright.sync_api import sync_playwright

VIEWPORTS = {
    '1440': {'width': 1440, 'height': 900},
    '820': {'width': 820, 'height': 1000},
    '390': {'width': 390, 'height': 844},
}

THEMES = ['light', 'dark']

OUTPUT_DIR = os.path.abspath('docs/screenshots/phase_t3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

                # 1. Settings Page at /app/settings
                page.goto('http://localhost:5173/app/settings', wait_until='networkidle')
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

                settings_shot = os.path.join(OUTPUT_DIR, f"app_settings_{vp_name}_{theme}.png")
                page.screenshot(path=settings_shot, full_page=False)
                print(f"Captured: app_settings_{vp_name}_{theme}.png ({vp_name}px, {theme})")

                # 2. Knowledge Bases at /app/knowledge
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

                # 3. Command Palette at 1440px
                if vp_name == '1440':
                    try:
                        page.keyboard.press('Meta+k')
                        time.sleep(0.5)
                        cmd_shot = os.path.join(OUTPUT_DIR, f"command_palette_{theme}.png")
                        page.screenshot(path=cmd_shot, full_page=False)
                        print(f"Captured: command_palette_{theme}.png (1440px, {theme})")
                    except Exception as e:
                        print(f"Could not open command palette: {e}")

                context.close()

        browser.close()
        print("All Phase T3 multi-viewport screenshots captured successfully.")

if __name__ == '__main__':
    main()

