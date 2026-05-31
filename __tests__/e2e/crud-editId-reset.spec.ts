import { test, expect } from "@playwright/test"

// Covers CRUD-01: stale editId corrupting create-after-edit flows
test.describe("CRUD — editId reset on modal close", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/functions")
    await page.waitForLoadState("networkidle")
  })

  test("closing Edit modal with X then clicking Add creates a NEW function, not edit", async ({ page }) => {
    // Need at least one function to edit — seed should have pre-wedding events
    const editButtons = page.locator("button:has-text('Edit'), a:has-text('Edit')")
    const count = await editButtons.count()
    if (count === 0) test.skip()

    // Capture initial function count
    const cards = page.locator(".rounded-xl.border.border-gray-100.shadow-sm.p-4")
    const initialCount = await cards.count()

    // Open edit modal
    await editButtons.first().click()
    await expect(page.locator("text=Edit Function")).toBeVisible()

    // Close with X (not Save/Cancel)
    await page.locator('[aria-label="Close"], button:has(svg)').first().click()
    await expect(page.locator("text=Edit Function")).not.toBeVisible()

    // Now click Add — should open a fresh empty form
    await page.locator("button:has-text('Add Function')").click()
    await expect(page.locator("text=Add Function")).toBeVisible()

    // Fill a unique name
    const uniqueName = `Test Function ${Date.now()}`
    await page.locator("input[placeholder*=''], input").first().fill(uniqueName)

    // Track outgoing requests
    const requests: { method: string; url: string }[] = []
    page.on("request", req => {
      if (req.url().includes("/api/events")) {
        requests.push({ method: req.method(), url: req.url() })
      }
    })

    // Save
    await page.locator("button:has-text('Save Function')").click()
    await page.waitForResponse(r => r.url().includes("/api/events") && r.status() < 400)

    // Must be POST (new), not PUT (edit)
    const mutatingReq = requests.find(r => ["POST", "PUT"].includes(r.method))
    expect(mutatingReq?.method).toBe("POST")

    // Card count should increase by 1
    await page.waitForTimeout(500)
    const newCount = await cards.count()
    expect(newCount).toBe(initialCount + 1)
  })

  test("closing Edit modal with Escape then clicking Add starts fresh", async ({ page }) => {
    const editButtons = page.locator("button:has-text('Edit')")
    if (await editButtons.count() === 0) test.skip()

    await editButtons.first().click()
    await expect(page.locator("text=Edit Function")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator("text=Edit Function")).not.toBeVisible()

    await page.locator("button:has-text('Add Function')").click()
    await expect(page.locator("text=Add Function")).toBeVisible()

    // Title input must be empty
    const titleInput = page.locator("input").first()
    await expect(titleInput).toHaveValue("")
  })

  test("Save shows spinner on button during fetch", async ({ page }) => {
    await page.locator("button:has-text('Add Function')").click()
    await expect(page.locator("text=Add Function")).toBeVisible()

    await page.locator("input").first().fill("Loading Test Function")

    // Intercept to slow down the response
    await page.route("**/api/events", async route => {
      await new Promise(r => setTimeout(r, 600))
      await route.continue()
    })

    await page.locator("button:has-text('Save Function')").click()

    // Button should be disabled while saving
    const saveBtn = page.locator("button:has-text('Save Function'), button:has-text('Saving')")
    await expect(saveBtn).toBeDisabled()
  })

  test("toast appears after successful save", async ({ page }) => {
    await page.locator("button:has-text('Add Function')").click()
    await page.locator("input").first().fill(`Toast Test ${Date.now()}`)
    await page.locator("button:has-text('Save Function')").click()
    await page.waitForResponse(r => r.url().includes("/api/events"))

    // Toast should appear
    await expect(page.locator("[role='status'], [data-toast]").first()).toBeVisible({ timeout: 3000 })
  })
})

test.describe("CRUD — feedback on Guests page", () => {
  test("delete confirm button shows spinner during delete", async ({ page }) => {
    await page.goto("http://localhost:3000/guests")
    await page.waitForLoadState("networkidle")

    const delButtons = page.locator("button:has-text('Del')")
    if (await delButtons.count() === 0) test.skip()

    await page.route("**/api/guests/**", async route => {
      if (route.request().method() === "DELETE") {
        await new Promise(r => setTimeout(r, 600))
        await route.continue()
      } else {
        await route.continue()
      }
    })

    await delButtons.first().click()
    await expect(page.locator("text=Are you sure")).toBeVisible()

    await page.locator("button:has-text('Delete'), button:has-text('Confirm')").last().click()
    // Confirm button should be disabled while deleting
    const confirmBtn = page.locator("button:has-text('Delete'), button:has-text('Confirm')").last()
    await expect(confirmBtn).toBeDisabled()
  })
})
