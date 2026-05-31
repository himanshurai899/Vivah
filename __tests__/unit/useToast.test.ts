import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useToast } from "@/lib/hooks/useToast"

describe("useToast (CRUD-02)", () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it("adds a toast and returns an id", () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.toast({ message: "Saved!", variant: "success" }) })
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe("Saved!")
    expect(result.current.toasts[0].variant).toBe("success")
  })

  it("auto-dismisses after 3000 ms", () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.toast({ message: "Done", variant: "success" }) })
    expect(result.current.toasts).toHaveLength(1)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(result.current.toasts).toHaveLength(0)
  })

  it("dismiss() removes a specific toast immediately", () => {
    const { result } = renderHook(() => useToast())
    let id!: string
    act(() => { id = result.current.toast({ message: "A", variant: "error" }) })
    act(() => { result.current.dismiss(id) })
    expect(result.current.toasts).toHaveLength(0)
  })

  it("supports multiple toasts in queue", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast({ message: "One", variant: "success" })
      result.current.toast({ message: "Two", variant: "error" })
    })
    expect(result.current.toasts).toHaveLength(2)
  })

  it("error toast does not auto-dismiss before 3 s", () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.toast({ message: "Fail", variant: "error" }) })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.toasts).toHaveLength(1)
  })
})
