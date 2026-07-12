import Button from "./Button";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="text-center space-y-4 py-20">
      <p className="text-body-sm text-neutral-500">{message}</p>
      {actionLabel && actionHref && (
        <Button href={actionHref} variant="dark-pill">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
