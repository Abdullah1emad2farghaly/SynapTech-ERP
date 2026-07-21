interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  if (!label) return <hr className="border-hairline" />;
  return (
    <div className="flex items-center gap-3 text-ink-tertiary text-xs" role="separator">
      <hr className="flex-1 border-hairline" />
      <span>{label}</span>
      <hr className="flex-1 border-hairline" />
    </div>
  );
}
