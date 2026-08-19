import { useState, useEffect, useRef } from "react";
import { safeDateNow } from "../../../utils/time.js";

export function useReadingTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimestampRef = useRef(null);
  const accumulatedSecondsRef = useRef(0);

  // The elapsed figure used to be pure wall clock: start timestamp subtracted
  // from now. Lock the phone or switch tabs for half an hour and all of it was
  // banked as "time spent reading", which is the number the session
  // verification and the streak are built on. Time only accumulates while the
  // page is actually visible now.
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return undefined;
    }

    const tick = () => {
      if (document.visibilityState !== "visible" || startTimestampRef.current == null) return;
      const elapsed = Math.floor((safeDateNow() - startTimestampRef.current) / 1000);
      setSeconds(accumulatedSecondsRef.current + elapsed);
    };

    const bankElapsed = () => {
      if (startTimestampRef.current == null) return;
      const elapsed = Math.floor((safeDateNow() - startTimestampRef.current) / 1000);
      accumulatedSecondsRef.current += Math.max(0, elapsed);
      setSeconds(accumulatedSecondsRef.current);
      startTimestampRef.current = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Resume from now, so the hidden stretch is never counted.
        startTimestampRef.current = safeDateNow();
        tick();
      } else {
        bankElapsed();
      }
    };

    if (document.visibilityState === "visible" && startTimestampRef.current == null) {
      startTimestampRef.current = safeDateNow();
    }
    tick();
    timerRef.current = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
      // Bank from the timestamp rather than from `seconds`, which is a render
      // value and can be up to a second behind.
      if (startTimestampRef.current != null) {
        accumulatedSecondsRef.current += Math.max(0, Math.floor((safeDateNow() - startTimestampRef.current) / 1000));
        startTimestampRef.current = null;
      }
      setSeconds(accumulatedSecondsRef.current);
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
