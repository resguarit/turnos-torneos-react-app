import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${className}`}
      style={{ display: "inline-block" }}
    />
  );
}