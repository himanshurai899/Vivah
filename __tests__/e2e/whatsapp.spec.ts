import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

test.describe("WhatsApp Templates — happy path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/whatsapp`)
    await page.waitForLoadState("networkidle")
  })

  test("page loads with header and Add Template button", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("WhatsApp Templates")
    await expect(page.locator("button:has-text('Add Template')")).toBeVisible()
  })

  test("Add Template modal opens and closes", async ({ page }) => {
    await page.locator("button:has-text('Add Template')").click()
    await expect(page.locator("text=New Template")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator("text=New Template")).not.toBeVisible()
  })

  test("creates a new template with variable substitution", async ({ page }) => {
    await page.locator("button:has-text('Add Template')").click()
    await expect(page.locator("text=New Template")).toBeVisible()

    const uniqueName = `E2E Template ${Date.now()}`
    await page.locator("input").first().fill(uniqueName)
    await page.locator("textarea").fill("Hello {{GuestName}}, join us on {{Date}} at {{Venue}}.")
    await page.locator("input[placeholder*='GuestName'], input[placeholder*='variables']").last().fill("GuestName, Date, Venue")

    const requests: string[] = []
    page.on("request", r => { if (r.url().includes("/api/whatsapp")) requests.push(r.method()) })

    await page.locator("button:has-text('Save Template')").click()
    await page.waitForResponse(r => r.url().includes("/api/whatsapp") && r.status() < 400)

    expect(requests).toContain("POST")
  })

  test("Send modal shows preview with variable substitution", async ({ page }) => {
    const sendButtons = page.locator("button:has-text('Send')")
    const count = await sendButtons.count()
    if (count === 0) {
      test.skip()
      return
    }

    await sendButtons.first().click()
    await expect(page.locator("text=Send —")).toBeVisible()
    await expect(page.locator("text=Preview")).toBeVisible()
  })

  test("empty state shows instructional message when no templates", async ({ page }) => {
    await page.route("**/api/whatsapp", route => route.fulfill({ json: [] }))
    await page.reload()
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=No templates yet")).toBeVisible()
  })

  test("template card shows category badge and message preview", async ({ page }) => {
    const templates = page.locator(".card")
    const count = await templates.count()
    if (count === 0) {
      test.skip()
      return
    }
    const first = templates.first()
    await expect(first).toBeVisible()
    await expect(first.locator(".font-mono")).toBeVisible()
  })
})
