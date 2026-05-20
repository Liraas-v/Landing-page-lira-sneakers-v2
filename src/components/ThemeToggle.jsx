import React from "react";
import Icon from "./Icon";
import { useApp } from "../context/AppContext";

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useApp();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? "compact" : ""}`}
      onClick={toggleTheme}
      aria-label={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
      title={isLight ? "Modo escuro" : "Modo claro"}
    >
      <Icon name={isLight ? "moon" : "sun"} size={16} />
      {!compact && <span>{isLight ? "Escuro" : "Claro"}</span>}
    </button>
  );
}
