"""Test script to verify COTB Tournament fixes"""
from playwright.sync_api import sync_playwright

def test_cotb_site():
    results = {"console_errors": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        def handle_console(msg):
            if msg.type == "error":
                results["console_errors"].append(msg.text)

        page.on("console", handle_console)

        print("=" * 60)
        print("COTB TOURNAMENT - FIX VERIFICATION TEST")
        print("=" * 60)

        # Test public page
        print("\n[1] Loading COTB public page...")
        try:
            page.goto("https://cotb25.netlify.app", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=15000)
            print("    [PASS] Page loaded successfully")
        except Exception as e:
            print(f"    [WARN] Timeout but continuing: {e}")

        # Take screenshot
        page.screenshot(path="C:/Users/jange/Desktop/Projects/Barbarian Tournament_2026/test-screenshot.png", full_page=True)

        # Check for key elements
        print("\n[2] Checking page content...")
        try:
            title = page.title()
            print(f"    Title: {title}")

            # Check ticker
            ticker = page.locator(".ticker-content")
            if ticker.is_visible():
                ticker_text = ticker.text_content() or ""
                if "undefined" in ticker_text.lower():
                    print("    [FAIL] Ticker contains 'undefined'")
                else:
                    print("    [PASS] Ticker content OK")
            else:
                print("    [INFO] Ticker not visible")

            # Check schedule
            schedule_items = page.locator(".game-card, .schedule-item, .game-item").count()
            print(f"    [INFO] Found {schedule_items} game items")

        except Exception as e:
            print(f"    [WARN] Error checking content: {e}")

        # Check console errors
        print("\n[3] Checking console errors...")
        permission_errors = [e for e in results["console_errors"] if "permission" in e.lower()]
        if permission_errors:
            print(f"    [FAIL] Found {len(permission_errors)} permission errors:")
            for err in permission_errors[:3]:
                print(f"        - {err[:80]}...")
        else:
            print(f"    [PASS] No permission errors (Total: {len(results['console_errors'])})")

        browser.close()

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    test_cotb_site()
