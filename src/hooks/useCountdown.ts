import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'crypto-wallet-shutdown-timer';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  closureDate: Date;
}

export function useCountdown(): CountdownState {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    closureDate: new Date(Date.now() + THREE_DAYS_MS),
  });

  const getTargetTime = useCallback((): number => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // Strictly validate the stored value. A tampered/corrupted record
      // (NaN, negative, absurdly far in the future) could otherwise lock
      // the user into a permanent "expired" or "never expires" state.
      const parsed = Number(saved);
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const max = Date.now() + 10 * oneYearMs;
      if (Number.isFinite(parsed) && parsed > 0 && parsed < max) {
        return parsed;
      }
      // Drop the corrupt value before falling through to recreate one.
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
    // If no saved time, create new target time (3 days from now)
    const target = Date.now() + THREE_DAYS_MS;
    localStorage.setItem(STORAGE_KEY, target.toString());
    return target;
  }, []);

  useEffect(() => {
    const targetTime = getTargetTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          closureDate: new Date(targetTime),
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
        closureDate: new Date(targetTime),
      };
    };

    // Initial calculation
    setCountdown(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [getTargetTime]);

  return countdown;
}

// Hook for 30-minute countdown (for fee payment) - starts fresh each time
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function useFeeCountdown(): CountdownState {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 30,
    seconds: 0,
    isExpired: false,
    closureDate: new Date(Date.now() + THIRTY_MINUTES_MS),
  });

  useEffect(() => {
    // Always start fresh when component mounts
    const targetTime = Date.now() + THIRTY_MINUTES_MS;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          closureDate: new Date(targetTime),
        };
      }

      return {
        days: 0,
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
        closureDate: new Date(targetTime),
      };
    };

    setCountdown(calculateTimeLeft());

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array - starts fresh on each mount

  return countdown;
}
