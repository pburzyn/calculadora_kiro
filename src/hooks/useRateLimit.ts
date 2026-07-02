import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createInitialState,
  checkAndIncrement,
  getTimeUntilReset,
  LIMIT,
  type RateLimitState,
} from '../engine/rateLimiter'

interface RateLimitHookResult {
  isLimited: boolean
  remaining: number
  resetIn: number
  recordCalculation: () => boolean
}

export function useRateLimit(): RateLimitHookResult {
  const [rlState, setRlState] = useState<RateLimitState>(createInitialState)
  const [resetIn, setResetIn] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cuando está limitado, actualiza la cuenta regresiva cada segundo
  useEffect(() => {
    const isLimited = rlState.count >= LIMIT

    if (isLimited) {
      intervalRef.current = setInterval(() => {
        const secs = getTimeUntilReset(rlState)
        setResetIn(secs)
        if (secs <= 0) {
          // La ventana expiró — reseteamos
          setRlState(createInitialState())
          clearInterval(intervalRef.current!)
        }
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [rlState])

  const recordCalculation = useCallback((): boolean => {
    let allowed = false
    setRlState(prev => {
      const { result, newState } = checkAndIncrement(prev)
      allowed = result.allowed
      setResetIn(result.resetIn)
      return newState
    })
    return allowed
  }, [])

  const isLimited = rlState.count >= LIMIT
  const remaining = Math.max(0, LIMIT - rlState.count)

  return {
    isLimited,
    remaining,
    resetIn,
    recordCalculation,
  }
}
