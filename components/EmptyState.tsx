import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {actionLabel && actionHref && (
          <Link href={actionHref} className={buttonVariants()}>
            {actionLabel}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function DbErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="space-y-2 p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">
          Databáza nie je dostupná
        </h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">
          Skontroluj premennú <code>MONGODB_URI</code> v <code>.env.local</code>.
        </p>
      </CardContent>
    </Card>
  );
}
