import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "default", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
};

const PageLoader = ({ text = "Loading page..." }) => {
  return (
    <div className="glass-bg min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardContent className="p-8">
          <LoadingSpinner size="xl" text={text} />
        </CardContent>
      </Card>
    </div>
  );
};

const SkeletonLoader = ({ className = "", ...props }) => {
  return <div className={`loading-skeleton ${className}`} {...props} />;
};

export { LoadingSpinner, PageLoader, SkeletonLoader };
