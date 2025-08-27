"use client";

import React, { useEffect, useState, useRef } from "react";

// choose text color (black/white) for contrast against the bg
function textColorFor(bgHex: string) {
  const hex = bgHex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  // perceived luminance (wcag-ish)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

// a pastel-ish palette. feel free to tweak
const PALETTE = [
  "#ffd6e7",
  "#ffe7d6",
  "#fff7cc",
  "#e6ffd6",
  "#d6fff6",
  "#d6f0ff",
  "#e1d6ff",
  "#f6d6ff",
  "#d6ffe7",
  "#ffe6f1",
  "#e8f5e9",
  "#e3f2fd",
  "#fff3e0",
  "#f3e5f5",
];

export default function Page() {
  const [text, setText] = useState("");
  const [characterColors, setCharacterColors] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/keypress.mp3");
    audioRef.current.volume = 1; // Adjust volume as needed
  }, []);

  const playKeypressSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start for rapid keypresses
      audioRef.current.play().catch(() => {
        // Handle potential audio play errors silently
      });
    }
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Block common keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        return;
      }

      // Block other modifier combinations
      if (event.altKey && event.key !== "Alt") {
        event.preventDefault();
        return;
      }

      if (event.key === "Backspace") {
        if (text.length > 0) {
          playKeypressSound();
          // Simple backspace logic - just remove the last character
          setText((prev) => prev.slice(0, -1));
          setCharacterColors((prev) => prev.slice(0, -1));
        }
      } else if (event.key === "Escape") {
        setText("");
        setCharacterColors([]);
      } else if (event.key.length === 1) {
        playKeypressSound();
        // only add printable characters
        setText((prev) => prev + event.key);
        // assign a random color for the new character
        const randomColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        setCharacterColors((prev) => [...prev, randomColor]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [text.length]);

  const characters = Array.from(text);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-800">
      {characters.length === 0 ? (
        <p className="text-gray-400 text-xl">start typing</p>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center items-center max-w-6xl">
          {characters.map((char, index) => {
            // spaces are invisible - just return spacing element
            if (char === " ") {
              return <div key={`space-${index}`} className="w-4" />;
            }

            // use the stored color for this character
            const color = characterColors[index];
            const textColor = textColorFor(color);

            return (
              <span
                key={`${char}-${index}`}
                className="inline-block rounded-full px-3 py-2 text-base shadow-sm font-mono min-w-[2.5rem] text-center"
                style={{
                  backgroundColor: color,
                  color: textColor,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
