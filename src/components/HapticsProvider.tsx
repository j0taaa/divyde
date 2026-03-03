"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  'button, a, input[type="button"], input[type="submit"], input[type="reset"], [role="button"], [data-haptic]';

export function HapticsProvider() {
  const lastVibrationRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
      return;
    }

    const triggerHaptic = (duration = 10) => {
      const now = Date.now();
      if (now - lastVibrationRef.current < 40) {
        return;
      }

      navigator.vibrate(duration);
      lastVibrationRef.current = now;
    };

    const getInteractiveElement = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        return null;
      }

      return target.closest(INTERACTIVE_SELECTOR);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const element = getInteractiveElement(event.target);
      if (!element || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") {
        return;
      }

      triggerHaptic(8);
    };

    const handleSubmit = () => {
      triggerHaptic(14);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}
