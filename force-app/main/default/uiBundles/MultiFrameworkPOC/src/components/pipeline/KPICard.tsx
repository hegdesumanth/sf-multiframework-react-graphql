import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  title: string;
  value: string;
  icon: ReactNode;
  loading: boolean;
}

export function KPICard({ title, value, icon, loading }: KPICardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 transition-opacity">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <span className="text-indigo-400" aria-hidden>
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-32 bg-slate-800" />
        ) : (
          <div className="text-2xl font-semibold tracking-tight text-slate-50">
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
