import { useState, useEffect, useRef } from "react";
import { safeDateNow } from "../../../utils/time.js";

export function useReadingTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimestampRef = useRef(null);
  const accumulatedSecondsRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      const tick = () => {
        const elapsed = Math.floor((safeDateNow() - startTimestampRef.current) / 1000);
        setSeconds(accumulatedSecondsRef.current + elapsed);
      };

      tick();
      timerRef.current = setInterval(tick, 1000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          tick();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const startTimer = () => {
    accumulatedSecondsRef.current = 0;
    setSeconds(0);
    setIsRunning(true);
    startTimestampRef.current = safeDateNow();
  };

  const pauseTimer = () => {
    if (isRunning) {
      accumulatedSecondsRef.current = seconds;
      setIsRunning(false);
    }
  };

  const resumeTimer = () => {
    if (!isRunning) {
      startTimestampRef.current = safeDateNow();
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    accumulatedSecondsRef.current = 0;
    setSeconds(0);
    setIsRunning(false);
    startTimestampRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    seconds,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer
  };
}
