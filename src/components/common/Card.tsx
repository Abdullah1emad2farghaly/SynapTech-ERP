import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = true, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg bg-panel",
        elevated ? "shadow-elevation1" : "border border-hairline",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
