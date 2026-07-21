import { Link as RouterLink } from "react-router-dom";
import type { LinkProps as RouterLinkProps } from "react-router-dom";

// Visited-state is deliberately not styled — auth links are actions, not
// read content, so "visited purple" would be a misleading signal here.
export function Link({ className = "", children, ...rest }: RouterLinkProps) {
  return (
    <RouterLink
      className={[
        "text-[0.8125rem] font-medium text-signal hover:text-signal-hover",
        "underline-offset-4 hover:underline focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-synapse rounded",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </RouterLink>
  );
}
