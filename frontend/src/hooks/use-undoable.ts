"use client"

import { useCallback, useState } from "react"

export function useUndoable<T>(initialValue: T, maxHistory = 50) {
  const [state, setState] = useState<T>(initialValue)
  const [past, setPast] = useState<T[]>([])
  const [future, setFuture] = useState<T[]>([])

  const commit = useCallback((next: T) => {
    setPast(prev => {
      const updated = [...prev, state]
      return updated.length > maxHistory
        ? updated.slice(1)
        : updated
    })
    setState(next)
    setFuture([])
  }, [state, maxHistory])

  const undo = useCallback(() => {
    setPast(prev => {
      if (prev.length === 0) return prev

      const previous = prev[prev.length - 1]
      setFuture(f => [state, ...f])
      setState(previous)

      return prev.slice(0, -1)
    })
  }, [state])

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev

      const next = prev[0]
      setPast(p => [...p, state])
      setState(next)

      return prev.slice(1)
    })
  }, [state])

  const reset = useCallback((value: T) => {
    setState(value)
    setPast([])
    setFuture([])
  }, [])

  return {
    state,
    commit,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
