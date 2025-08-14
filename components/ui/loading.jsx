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
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary drop-shadow-sm`}
      />
      <span className="text-foreground/80 font-medium">{text}</span>
    </div>
  );
};

const PageLoader = ({ text = "Loading page..." }) => {
  return (
    <div className="glass-container min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md border-primary/20 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Please wait
          </h3>
          <p className="text-foreground/70 text-sm">{text}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const SkeletonLoader = ({ className = "", ...props }) => {
  return <div className={`loading-skeleton ${className}`} {...props} />;
};

export { LoadingSpinner, PageLoader, SkeletonLoader };
