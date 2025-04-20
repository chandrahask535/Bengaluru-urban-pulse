
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string; // add className as an optional prop
}

const DashboardCard = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  children,
  className = "",
}: DashboardCardProps) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {(title || Icon) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle className="text-lg font-bold">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
