"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

// Pau Cutz splash shown when the site first opens (a full page load or refresh),
// then fades out. Moving between pages afterwards does not show it again.
export default function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "hide" | "gone">("show");

  useEffect(() => {
    const fade = setTimeout(() => setPhase("hide"), 1500);
    const remove = setTimeout(() => setPhase("gone"), 1950);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`splash${phase === "hide" ? " hide" : ""}`}>
      <LoadingScreen />
    </div>
  );
}
