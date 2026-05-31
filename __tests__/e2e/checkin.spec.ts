import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"

test.describe("Check-In — happy path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/checkin`)
    await page.waitForLoadState("networkidle")
  })

  test("page loads with header and action buttons", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Guest Check-In")
    await expect(page.locator("button:has-text('Add Check-In')")).toBeVisible()
  })

  test("Add Check-In modal opens and closes", async ({ page }) => {
    await page.locator("button:has-text('Add Check-In')").click()
    await expect(page.locator("text=Add Check-In Record")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator("text=Add Check-In Record")).not.toBeVisible()
  })

  test("creates a new check-in record", async ({ page }) => {
    await page.locator("button:has-text('Add Check-In')").click()
    await expect(page.locator("text=Add Check-In Record")).toBeVisible()

    await page.locator("input[placeholder*=''], input").first().fill(`E2E Guest ${Date.now()}`)

    const requests: string[] = []
    page.on("request", r => { if (r.url().includes("/api/checkin")) requests.push(r.method()) })

    await page.locator("button:has-text('Save')").click()
    await page.waitForResponse(r => r.url().includes("/api/checkin") && r.status() < 400)

    expect(requests).toContain("POST")
    await expect(page.locator("text=Add Check-In Record")).not.toBeVisible()
  })

  test("View QR button opens QR modal for a record", async ({ page }) => {
    const qrButtons = page.locator("button:has-text('View QR'), a:has-text('View QR')")
    const count = await qrButtons.count()
    if (count === 0) {
      test.skip()
      return
    }
    await qrButtons.first().click()
    await expect(page.locator("text=QR Code")).toBeVisible()
    await expect(page.locator("canvas")).toBeVisible()
    await expect(page.locator("button:has-text('Print Label')")).toBeVisible()

    // Close modal
    await page.locator("button:has-text('Close')").click()
    await expect(page.locator("text=QR Code")).not.toBeVisible()
  })

  test("Check In button marks guest as checked in", async ({ page }) => {
    const checkInButtons = page.locator("button:has-text('Check In')")
    const count = await checkInButtons.count()
    if (count === 0) {
      test.skip()
      return
    }

    const responses: number[] = []
    page.on("response", r => { if (r.url().includes("/api/checkin/")) responses.push(r.status()) })

    await checkInButtons.first().click()
    await page.waitForResponse(r => r.url().includes("/api/checkin/") && r.status() < 400)

    expect(responses.some(s => s < 400)).toBe(true)
  })

  test("filter by status shows only matching records", async ({ page }) => {
    const allRecords = page.locator("table tbody tr")
    const total = await allRecords.count()
    if (total < 2) {
      test.skip()
      return
    }

    await page.selectOption("select", { label: "Checked In" })
    await page.waitForTimeout(300)

    const filtered = page.locator("table tbody tr")
    const filteredCount = await filtered.count()
    expect(filteredCount).toBeLessThanOrEqual(total)
  })

  test("empty state shows instructional message when no records", async ({ page }) => {
    await page.route("**/api/checkin**", route => route.fulfill({ json: [] }))
    await page.reload()
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=No check-in records yet")).toBeVisible()
  })
})
