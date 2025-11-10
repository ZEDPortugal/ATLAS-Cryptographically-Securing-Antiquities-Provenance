"use client";

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to animate number changes with a flash effect
 * @param {number|string} value - The current value to display
 * @param {number} duration - Animation duration in ms (default: 300)
 * @returns {[any, boolean]} - Returns [displayValue, hasChanged]
 */
export function useAnimatedNumber(value, duration = 300) {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasChanged, setHasChanged] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value && value !== '—' && value !== '...') {
      setHasChanged(true);
      setDisplayValue(value);
      
      const timer = setTimeout(() => {
        setHasChanged(false);
      }, duration);

      prevValueRef.current = value;
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, duration]);

  return [displayValue, hasChanged];
}
