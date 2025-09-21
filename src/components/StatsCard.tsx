import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "danger" | "success" | "warning";
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatsCardProps) {
  const gradientClasses = {
    default: "bg-gradient-primary",
    danger: "bg-gradient-danger",
    success: "bg-gradient-success",
    warning: "bg-gradient-to-br from-warning to-warning/80"
  };

  return (
    <Card className={cn("relative overflow-hidden shadow-elevated hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl text-white", gradientClasses[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}