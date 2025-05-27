"use client";
import * as React from "react";

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeDropdown() {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      } else if (document.documentElement.classList.contains("light")) {
        setTheme("light");
      } else {
        setTheme("system");
      }
    }
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme, isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as "light" | "dark" | "system");
  };

  if (!isMounted) return null;
  return (
    <select
      aria-label="Select theme"
      className="rounded px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 transition"
      value={theme}
      onChange={handleChange}
    >
      {themes.map((t) => (
        <option key={t.value} value={t.value}>{t.label}</option>
      ))}
    </select>
  );
}

export default ThemeDropdown;
