from pathlib import Path
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "screenshots"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1536, "height": 960}, device_scale_factor=1)
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:5173", wait_until="networkidle")

    page.locator("canvas").first.wait_for(state="visible")
    assert page.get_by_text("Crosspoint", exact=True).first.is_visible()
    assert page.get_by_text("Paper trading only", exact=True).is_visible()

    page.get_by_label("Expand drawing tools").click()
    page.get_by_title("Trend line").click()
    chart = page.locator(".drawing-layer")
    bounds = chart.bounding_box()
    assert bounds is not None
    page.mouse.move(bounds["x"] + 260, bounds["y"] + 220)
    page.mouse.down()
    page.mouse.move(bounds["x"] + 540, bounds["y"] + 120, steps=8)
    page.mouse.up()
    assert page.locator("[data-drawing-id]").count() >= 1

    page.get_by_label("Market symbol").select_option("AAPL")
    page.get_by_title("Trade").click()
    page.get_by_role("button", name="Paper Buy AAPL").click()
    page.get_by_text("BUY paper order filled.", exact=True).wait_for(state="visible")

    page.screenshot(path=str(SCREENSHOTS / "terminal-desktop.png"), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto("http://127.0.0.1:5173", wait_until="networkidle")
    mobile.locator("canvas").first.wait_for(state="visible")
    assert mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    mobile.screenshot(path=str(SCREENSHOTS / "terminal-mobile.png"), full_page=True)
    mobile.close()

    browser.close()
    if errors:
        raise AssertionError("Browser console errors:\n" + "\n".join(errors))

    print("Smoke test passed: chart, drawing, symbol switch, paper order, desktop, and mobile.")
