import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPrice } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import {
  Wallet,
  PackageCheck,
  PackageX,
  PieChart,
  type LucideIcon,
} from "lucide-react";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-bold">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsPanel({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Hodnota zbierky"
          value={formatPrice(stats.totalValue)}
          hint={`z ${formatPrice(stats.catalogValue)} katalógu`}
          icon={Wallet}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Vlastnené kusy"
          value={`${stats.ownedCount}`}
          hint={`z ${stats.totalPogs} celkovo`}
          icon={PackageCheck}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Kompletnosť"
          value={`${stats.completeness}%`}
          hint={`${stats.collectionCount} kolekcií`}
          icon={PieChart}
          accent="bg-purple-100 text-purple-700"
        />
        <StatCard
          label="Chýbajúce kusy"
          value={`${stats.missingCount}`}
          hint={`hodnota ${formatPrice(stats.missingValue)}`}
          icon={PackageX}
          accent="bg-orange-100 text-orange-700"
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Celkový postup zbierky</span>
            <span className="text-muted-foreground">
              {stats.ownedCount}/{stats.totalPogs} kusov
            </span>
          </div>
          <Progress value={stats.completeness} className="h-3" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs text-muted-foreground">Vlastnené</p>
              <p className="text-lg font-semibold text-emerald-700">
                {formatPrice(stats.totalValue)}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <p className="text-xs text-muted-foreground">Chýbajúce</p>
              <p className="text-lg font-semibold text-orange-700">
                {formatPrice(stats.missingValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
