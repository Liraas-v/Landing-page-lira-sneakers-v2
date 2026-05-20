import React from "react";
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="toast-wrap">
      <div
        className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}
      >
        {toast.msg}
      </div>
    </div>
  );
}
