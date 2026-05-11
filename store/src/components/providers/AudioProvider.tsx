"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type SoundType = "click" | "success" | "error" | "transition";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (type: SoundType) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true); // Default to muted for auto-play policy compliance
  const [audioCache, setAudioCache] = useState<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Load preference from localStorage
    const savedMute = localStorage.getItem("audio_muted");
    if (savedMute !== null) {
      setIsMuted(savedMute === "true");
    }

    // Pre-load sounds
    const sounds: SoundType[] = ["click", "success", "error", "transition"];
    const cache: Record<string, HTMLAudioElement> = {};
    
    sounds.forEach((sound) => {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.load();
      cache[sound] = audio;
    });

    setAudioCache(cache);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      localStorage.setItem("audio_muted", String(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;

      const audio = audioCache[type];
      if (audio) {
        // Clone for overlapping sounds
        const playInstance = audio.cloneNode() as HTMLAudioElement;
        playInstance.volume = 0.3; // Default low volume for luxury feel
        playInstance.play().catch((err) => console.warn("Audio play blocked:", err));
      }
    },
    [isMuted, audioCache]
  );

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
