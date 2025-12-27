import { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ title, value, change, changeType, icon: Icon, iconColor = "bg-blue-500" }: StatsCardProps) {
  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50/50">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 text-sm ${changeType === "increase" ? "text-green-600" : "text-red-600"}`}>
                {changeType === "increase" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
                <span>{change}</span>
              </div>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${iconColor} flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </Card>
  );
}