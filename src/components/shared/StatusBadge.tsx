import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariantClasses = () => {
    switch (variant || status.toLowerCase()) {
      case "success":
      case "approved":
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm";
      case "returned":
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200 shadow-sm";
      case "warning":
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200 shadow-sm";
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200 shadow-sm";
      case "danger":
      case "rejected":
      case "unpaid":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200 shadow-sm";
      case "info":
      case "borrowed":
      case "processing":
        return "bg-cyan-100 text-cyan-700 border-cyan-200 shadow-sm";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 shadow-sm";
    }
  };

  return (
    <Badge className={`${getVariantClasses()} border font-medium px-2.5 py-0.5`}>
      {status}
    </Badge>
  );
}