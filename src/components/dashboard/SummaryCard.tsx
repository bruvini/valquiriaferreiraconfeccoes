import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'gold' | 'copper' | 'neutral';
  subtitle?: string;
}

export function SummaryCard({ title, value, icon: Icon, variant, subtitle }: SummaryCardProps) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 animate-fade-in",
        variant === 'gold' && "bg-gradient-gold shadow-gold",
        variant === 'copper' && "bg-gradient-copper shadow-copper",
        variant === 'neutral' && "bg-card border-2 border-border shadow-card"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium mb-1",
            variant === 'neutral' ? "text-muted-foreground" : "text-primary-foreground/80"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold font-serif tracking-tight",
            variant === 'neutral' ? "text-foreground" : "text-primary-foreground"
          )}>
            {formattedValue}
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs mt-1",
              variant === 'neutral' ? "text-muted-foreground" : "text-primary-foreground/70"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          variant === 'neutral' 
            ? "bg-accent" 
            : "bg-primary-foreground/20"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === 'neutral' ? "text-copper" : "text-primary-foreground"
          )} />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className={cn(
        "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10",
        variant === 'neutral' ? "bg-copper" : "bg-primary-foreground"
      )} />
    </div>
  );
}
