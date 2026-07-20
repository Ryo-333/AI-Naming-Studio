"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ans.theme", next);
    setTheme(next);
  };

  return (
    <button className="btn btn-ghost btn-sm" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
