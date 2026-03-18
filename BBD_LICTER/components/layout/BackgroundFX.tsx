"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function BackgroundFX() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        // Si le moteur échoue, on garde juste le mesh CSS.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: -10 },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 60, density: { enable: true, area: 900 } },
        color: { value: ["#6C3BE4", "#06B6D4", "#A78BFA"] },
        opacity: { value: 0.15 },
        size: { value: { min: 1, max: 3 } },
        move: { enable: true, speed: 0.3, outModes: { default: "out" } },
        links: {
          enable: true,
          distance: 120,
          color: "#6C3BE4",
          opacity: 0.12,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false, mode: [] },
          onClick: { enable: false, mode: [] },
        },
      },
    }),
    [],
  );

  if (!ready) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Particles id="licter-particles" options={options} />
      <WireSpheres />
    </div>
  );
}

function WireSpheres() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute -left-16 top-24 h-56 w-56 animate-[spin_42s_linear_infinite] opacity-30"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="78" stroke="#6C3BE4" strokeWidth="1" />
        <circle cx="100" cy="100" r="52" stroke="#A78BFA" strokeWidth="1" />
        <path
          d="M22 100h156M100 22v156M45 45l110 110M155 45L45 155"
          stroke="#06B6D4"
          strokeWidth="1"
          opacity="0.8"
        />
      </svg>

      <svg
        className="absolute -right-20 top-12 h-72 w-72 animate-[spin_58s_linear_infinite] opacity-25"
        viewBox="0 0 240 240"
        fill="none"
      >
        <circle cx="120" cy="120" r="92" stroke="#06B6D4" strokeWidth="1" />
        <circle cx="120" cy="120" r="64" stroke="#6C3BE4" strokeWidth="1" />
        <path
          d="M40 120h160M120 40v160M64 64l112 112M176 64L64 176"
          stroke="#A78BFA"
          strokeWidth="1"
          opacity="0.75"
        />
      </svg>

      <svg
        className="absolute left-1/2 top-[70%] h-64 w-64 -translate-x-1/2 animate-[spin_66s_linear_infinite] opacity-20"
        viewBox="0 0 220 220"
        fill="none"
      >
        <circle cx="110" cy="110" r="86" stroke="#A78BFA" strokeWidth="1" />
        <circle cx="110" cy="110" r="58" stroke="#06B6D4" strokeWidth="1" />
        <path
          d="M30 110h160M110 30v160M56 56l108 108M164 56L56 164"
          stroke="#6C3BE4"
          strokeWidth="1"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}

