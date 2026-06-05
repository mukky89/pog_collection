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
  gradient,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  gradient: string;
}) {
  return (
    <Card className="animate-pop-in overflow-hidden border-2 pog-shadow-hover">
      <div className={`flex items-center gap-4 p-5 ${gradient}`}>
        <div className="flex h-14 w-14 shrink-0 animate-float items-center justify-center rounded-full bg-white/25 text-white ring-4 ring-white/20">
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0 text-white">
          <p className="text-sm font-semibold text-white/90">{label}</p>
          <p className="truncate text-2xl font-extrabold drop-shadow">{value}</p>
          {hint && <p className="text-xs text-white/80">{hint}</p>}
        </div>
      </div>
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
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Vlastnené kusy"
          value={`${stats.ownedCount}`}
          hint={`z ${stats.totalPogs} celkovo`}
          icon={PackageCheck}
          gradient="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <StatCard
          label="Kompletnosť"
          value={`${stats.completeness}%`}
          hint={`${stats.collectionCount} kolekcií`}
          icon={PieChart}
          gradient="bg-gradient-to-br from-fuchsia-500 to-violet-600"
        />
        <StatCard
          label="Chýbajúce kusy"
          value={`${stats.missingCount}`}
          hint={`hodnota ${formatPrice(stats.missingValue)}`}
          icon={PackageX}
          gradient="bg-gradient-to-br from-orange-500 to-rose-600"
        />
      </div>

      <Card className="border-2">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">Celkový postup zbierky 🏆</span>
            <span className="font-medium text-muted-foreground">
              {stats.ownedCount}/{stats.totalPogs} kusov
            </span>
          </div>
          <Progress value={stats.completeness} className="h-4" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Vlastnené
              </p>
              <p className="text-lg font-extrabold text-emerald-700">
                {formatPrice(stats.totalValue)}
              </p>
            </div>
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Chýbajúce
              </p>
              <p className="text-lg font-extrabold text-orange-700">
                {formatPrice(stats.missingValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
