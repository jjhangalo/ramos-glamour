"use client";

import { useAudio } from "@/components/providers/AudioProvider";
import { useCallback } from "react";

export const useUIFeedback = () => {
  const { playSound } = useAudio();

  const playClick = useCallback(() => playSound("click"), [playSound]);
  const playSuccess = useCallback(() => playSound("success"), [playSound]);
  const playError = useCallback(() => playSound("error"), [playSound]);
  const playTransition = useCallback(() => playSound("transition"), [playSound]);

  return {
    playClick,
    playSuccess,
    playError,
    playTransition,
  };
};
