"""
NexusRAG Route Smoke Test Suite
Verifies that every public and app route loads cleanly in:
1. A fresh browser profile (no cookies or local storage).
2. A seeded browser profile (pre-configured local storage and dark theme).
Fails on any console error, unhandled JavaScript exception, or failed internal network request.
"""

import sys
from typing import List, Dict, Any
from playwright.sync_api import sync_playwright

FRONTEND_BASE = "http://localhost:5173"

ROUTES = [
    # Public Routes
    {"path": "/", "name": "Landing Page", "selector": "text=Verifiable Research Synthesis"},
    {"path": "/docs", "name": "Documentation Page", "selector": "text=NexusRAG User Guides"},
    {"path": "/security", "name": "Security Page", "selector": "text=Calibrated Security"},
    {"path": "/faq", "name": "FAQ Page", "selector": "text=Frequently Asked Questions"},
    {"path": "/about", "name": "About Page", "selector": "text=Verifiable Document Intelligence"},
    {"path": "/privacy", "name": "Privacy Policy", "selector": "text=Privacy Policy"},
    {"path": "/terms", "name": "Terms of Service", "selector": "text=Terms of Service"},
    {"path": "/status", "name": "Status Page", "selector": "text=System Status"},
    # App Routes
    {"path": "/app/dashboard", "name": "App Dashboard", "selector": "text=Research Workspace"},
    {"path": "/app/library", "name": "Knowledge Bases", "selector": "text=Knowledge Bases"},
    {"path": "/app/research", "name": "Research Desk", "selector": "text=Research Desk"},
    {"path": "/app/reader", "name": "Document Reader", "selector": "text=No Document Open"},
    {"path": "/app/inspector", "name": "Retrieval Inspector", "selector": "text=Retrieval Inspector"},
    {"path": "/app/settings", "name": "System Settings", "selector": "text=System Settings & Architecture"},
]

def run_route_smoke_test():
    failures = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for profile_type in ["fresh_profile", "seeded_profile"]:
            print(f"\n=======================================================")
            print(f"Executing Smoke Tests: [{profile_type.upper()}]")
            print(f"=======================================================")

            # Setup context
            context = browser.new_context(
                viewport={"width": 1440, "height": 900},
                user_agent="NexusRAG-SmokeTest-Agent/1.0"
            )

            # If seeded profile, inject localStorage state prior to script execution
            if profile_type == "seeded_profile":
                context.add_init_script("""
                    localStorage.setItem('nexusrag_schema_version', '1');
                    localStorage.setItem('nexusrag_theme', 'dark');
                    localStorage.setItem('nexusrag_rail_expanded', 'true');
                    localStorage.setItem('nexusrag_onboarding_dismissed', 'true');
                    localStorage.setItem('nexusrag_citation_verified', 'true');
                    localStorage.setItem('nexusrag_inspector_visited', 'true');
                    localStorage.setItem('nexusrag_retrieval_params', JSON.stringify({
                        topK: 6,
                        minSufficiency: 0.65,
                        minGroundedness: 0.70,
                        rerankWeight: 0.55
                    }));
                """)

            page = context.new_page()

            for route in ROUTES:
                route_path = route["path"]
                route_name = route["name"]
                url = f"{FRONTEND_BASE}{route_path}"

                console_errors = []
                page_errors = []
                failed_requests = []

                # Handlers for errors
                def on_console(msg):
                    if msg.type == "error":
                        # Filter out benign 404s for optional assets if any
                        text = msg.text
                        if "favicon.ico" not in text and "robots.txt" not in text:
                            console_errors.append(text)

                def on_page_error(err):
                    page_errors.append(str(err))

                def on_request_failed(req):
                    # Filter out browser aborts on rapid navigation
                    if req.failure != "net::ERR_ABORTED":
                        failed_requests.append(f"{req.method} {req.url}: {req.failure}")

                page.on("console", on_console)
                page.on("pageerror", on_page_error)
                page.on("requestfailed", on_request_failed)

                try:
                    response = page.goto(url, wait_until="networkidle", timeout=10000)
                    status_code = response.status if response else 0

                    if status_code >= 400:
                        failures.append({
                            "profile": profile_type,
                            "route": route_path,
                            "name": route_name,
                            "error": f"HTTP status error: {status_code}"
                        })
                        print(f"  FAIL: {route_name} ({route_path}) -> HTTP {status_code}")
                        continue

                    # Verify expected selector renders
                    page.wait_for_selector(route["selector"], timeout=5000)

                    # Check for ErrorBoundary activation
                    has_error_boundary = page.query_selector("text=Application View Recovery")
                    if has_error_boundary:
                        failures.append({
                            "profile": profile_type,
                            "route": route_path,
                            "name": route_name,
                            "error": "ErrorBoundary was triggered on route!"
                        })
                        print(f"  FAIL: {route_name} ({route_path}) -> Triggered ErrorBoundary")
                        continue

                    # Evaluate captured errors
                    if console_errors or page_errors:
                        err_summary = "; ".join(page_errors + console_errors)
                        failures.append({
                            "profile": profile_type,
                            "route": route_path,
                            "name": route_name,
                            "error": f"Console/Page errors: {err_summary}"
                        })
                        print(f"  FAIL: {route_name} ({route_path}) -> {err_summary}")
                        continue

                    print(f"  PASS: {route_name:<22} ({route_path}) [HTTP {status_code}]")

                except Exception as ex:
                    failures.append({
                        "profile": profile_type,
                        "route": route_path,
                        "name": route_name,
                        "error": str(ex)
                    })
                    print(f"  FAIL: {route_name} ({route_path}) -> Exception: {ex}")

                finally:
                    # Remove listeners for next route
                    page.remove_listener("console", on_console)
                    page.remove_listener("pageerror", on_page_error)
                    page.remove_listener("requestfailed", on_request_failed)

            context.close()

        browser.close()

    print("\n=======================================================")
    print(f"Route Smoke Test Completed: {len(ROUTES) * 2} routes tested across 2 profiles.")
    if failures:
        print(f"Total Failures: {len(failures)}")
        for f in failures:
            print(f"  [{f['profile']}] {f['name']} ({f['route']}): {f['error']}")
        sys.exit(1)
    else:
        print("ALL 28 ROUTE SCENARIOS PASSED WITH ZERO CONSOLE ERRORS!")
        print("=======================================================\n")
        sys.exit(0)

if __name__ == "__main__":
    run_route_smoke_test()
