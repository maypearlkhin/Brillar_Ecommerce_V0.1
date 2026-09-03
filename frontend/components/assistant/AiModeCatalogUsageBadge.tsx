type AiModeCatalogUsageBadgeProps =
  | { mode: 'text-only' }
  | { mode: 'building' }
  | { mode: 'components'; components: string[] };

export default function AiModeCatalogUsageBadge(props: AiModeCatalogUsageBadgeProps) {
  const label =
    props.mode === 'text-only'
      ? 'No components needed'
      : props.mode === 'building'
        ? 'Catalog components: (generating...)'
        : `Catalog components: ${props.components.join(', ')}`;

  return (
    <div className="ai-mode-catalog-usage-badge" aria-label={label}>
      {label}
    </div>
  );
}
