/**
 * Creates a debounced function that delays invoking the provided function
 * until after `wait` milliseconds have elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to invoke the function on the leading edge instead of the trailing edge
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: unknown, ...args: Parameters<T>): void {
    // Using arrow functions to preserve the 'this' context
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

/**
 * Creates a throttled function that only invokes the provided function at most
 * once per every `wait` milliseconds.
 * 
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(this: unknown, ...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastCall >= wait) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

/**
 * Debounces form validation to improve performance when handling input events
 * 
 * @param validationFn The validation function to debounce
 * @returns A debounced validation function
 */
export function debouncedValidation<T>(
  validationFn: (value: T) => string | null,
  wait: number = 300
): (value: T) => Promise<string | null> {
  let scheduled = false;
  let lastValue: T;
  let resolver: ((result: string | null) => void) | null = null;
  
  const tick = debounce(() => {
    if (resolver) {
      const result = validationFn(lastValue);
      resolver(result);
      resolver = null;
    }
    scheduled = false;
  }, wait);
  
  return (value: T): Promise<string | null> => {
    lastValue = value;
    
    if (!scheduled) {
      scheduled = true;
      return new Promise(resolve => {
        resolver = resolve;
        tick();
      });
    } else {
      tick();
      return new Promise(resolve => {
        resolver = resolve;
      });
    }
  };
} 