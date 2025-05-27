"use client";
import * as React from "react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : (prefersDark ? "dark" : "light"));
    }
  }, []);

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (!isMounted) return null;
  return (
    <button
      aria-label="Toggle theme"
      className="rounded px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
