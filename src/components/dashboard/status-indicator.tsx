
import type { CaseStatus, ServiceStatus } from "@/types/franchise";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface StatusIndicatorProps {
  status: CaseStatus | ServiceStatus;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function StatusIndicator({ status, size = "md", showText = false, className }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status as ServiceStatus] || STATUS_CONFIG["Pending"];

  const { Icon } = config;

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };
  
  const iconSizeClasses = { // For icons when text is shown
    sm: "h-3 w-3", // default for text
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const textIconSize = size === "lg" ? iconSizeClasses.lg : size === "sm" ? iconSizeClasses.sm : iconSizeClasses.md;


  if (showText) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", // Adjusted padding
          className
        )}
        style={{ backgroundColor: config.lightColor, color: config.color }}
      >
        <Icon className={cn(textIconSize, "shrink-0")} style={{ color: config.color }}/>
        {status}
      </span>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>
           <span className={cn("inline-block rounded-full", sizeClasses[size], className)} style={{ backgroundColor: config.color }} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
