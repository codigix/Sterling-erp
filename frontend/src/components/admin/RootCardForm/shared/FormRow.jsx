import React from "react";

export default function FormRow({ children, cols = 2 }) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
  }[cols] || "grid-cols-1 md:grid-cols-2";

  return <div className={`grid ${colClass} gap-3`}>{children}</div>;
}
