import React from 'react';
import { Card } from './Card';
import { cn } from '@/src/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MetricTile({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  accentColor = "ikm-orange" 
}: any) {
  // Map colors explicitly so tailwind doesn't purge them
  const colors: Record<string, { bg: string, text: string }> = {
    'ikm-orange': { bg: 'bg-ikm-orange-light', text: 'text-ikm-orange-dark' },
    'ikm-green': { bg: 'bg-ikm-green-light', text: 'text-ikm-green' },
    'status-blue': { bg: 'bg-blue-100', text: 'text-status-blue' },
    'status-purple': { bg: 'bg-purple-100', text: 'text-status-purple' },
  };

  const c = colors[accentColor] || colors['ikm-orange'];

  return (
    <Card className="p-4 flex flex-col justify-between shadow-sm border border-ikm-border">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn("text-xs font-semibold flex items-center gap-1", trend > 0 ? "text-status-green" : "text-status-red")}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-ikm-text">{value}</h3>
        <p className="text-xs text-ikm-text-secondary">{title}</p>
      </div>
    </Card>
  );
}
