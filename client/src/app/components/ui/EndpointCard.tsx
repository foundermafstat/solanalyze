"use client";
import React from "react";

interface EndpointCardProps {
  title: string;
  status: "Ready" | "In Progress";
  description?: string;
}

export function EndpointCard({ title, status, description }: EndpointCardProps) {
  return (
    <div
      className={
        [
          "rounded-xl border shadow-sm p-4 flex flex-col gap-2 transition-colors",
          "bg-white dark:bg-gray-900",
          "border-gray-200 dark:border-gray-800",
          "min-w-[180px] min-h-[80px]",
        ].join(" ")
      }
    >
      <div className="flex items-center gap-2 justify-between">
        <span className="font-semibold text-gray-800 dark:text-gray-100 text-base">
          {title}
        </span>
        <span
          className={
            status === "Ready"
              ? "text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
          }
        >
          {status === "Ready" ? "Ready" : "In Progress"}
        </span>
      </div>
      {description && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
      )}
    </div>
  );
}

export default EndpointCard;
