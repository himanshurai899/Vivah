import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCrud } from "@/lib/hooks/useCrud"

// ── helpers ──────────────────────────────────────────────────────────────────
const makeRecord = (overrides = {}) => ({ id: "rec-1", name: "Test", status: "PENDING", ...overrides })

describe("useCrud — stale editId bug (CRUD-01)", () => {
  it("editId is null after closeForm() even if it was set by openEdit()", () => {
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>())

    act(() => result.current.openEdit(makeRecord()))
    expect(result.current.editId).toBe("rec-1")

    act(() => result.current.closeForm())
    expect(result.current.editId).toBeNull()
    expect(result.current.showForm).toBe(false)
  })

  it("openAdd resets form and editId regardless of previous edit", () => {
    const empty = { name: "" }
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>(empty))

    act(() => result.current.openEdit(makeRecord({ name: "Old Name" })))
    expect(result.current.editId).toBe("rec-1")

    act(() => result.current.openAdd())
    expect(result.current.editId).toBeNull()
    expect(result.current.form.name).toBe("")
  })

  it("save() sends POST when editId is null (new record)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "new-1" }) })
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>({ name: "" }))

    act(() => result.current.openAdd())
    act(() => result.current.setForm({ name: "New Record" }))

    await act(async () => {
      await result.current.save("/api/guests", mockFetch as unknown as typeof fetch)
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/guests", expect.objectContaining({ method: "POST" }))
  })

  it("save() sends PUT when editId is set (edit record)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "rec-1" }) })
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>({ name: "" }))

    act(() => result.current.openEdit(makeRecord()))
    act(() => result.current.setForm({ name: "Updated" }))

    await act(async () => {
      await result.current.save("/api/guests", mockFetch as unknown as typeof fetch)
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/guests/rec-1", expect.objectContaining({ method: "PUT" }))
  })

  it("save() throws when response.ok is false (server error)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Validation failed" }),
    })
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>({ name: "" }))

    act(() => result.current.openAdd())

    await act(async () => {
      await expect(
        result.current.save("/api/guests", mockFetch as unknown as typeof fetch)
      ).rejects.toThrow("Validation failed")
    })

    // Modal must stay open so user can fix the error
    expect(result.current.showForm).toBe(true)
    expect(result.current.saving).toBe(false)
  })

  it("save() re-enables button on network error and keeps modal open", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network offline"))
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>({ name: "" }))

    act(() => result.current.openAdd())

    await act(async () => {
      await expect(
        result.current.save("/api/guests", mockFetch as unknown as typeof fetch)
      ).rejects.toThrow("Network offline")
    })

    expect(result.current.showForm).toBe(true)
    expect(result.current.saving).toBe(false)
  })

  it("saving is true during the fetch and false after", async () => {
    let resolveFetch!: () => void
    const mockFetch = vi.fn(() =>
      new Promise<{ ok: boolean; json: () => Promise<unknown> }>(resolve => {
        resolveFetch = () => resolve({ ok: true, json: async () => ({}) })
      })
    )
    const { result } = renderHook(() => useCrud<Partial<{ id: string; name: string }>>({ name: "" }))
    act(() => result.current.openAdd())

    let savePromise: Promise<unknown>
    act(() => { savePromise = result.current.save("/api/guests", mockFetch as unknown as typeof fetch) })

    expect(result.current.saving).toBe(true)
    await act(async () => { resolveFetch(); await savePromise })
    expect(result.current.saving).toBe(false)
  })
})
