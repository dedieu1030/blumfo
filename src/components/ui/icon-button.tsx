
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { hasStreamlineEquivalent, getStreamlineIcon } from "@/lib/icon-mapping";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: string; // Lucide icon name
  iconPosition?: "left" | "right";
  useStreamline?: boolean; // Whether to use Streamline icons instead of Lucide
  iconSize?: number;
  iconColor?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon,
      iconPosition = "left",
      useStreamline = true, // Default to Streamline icons
      iconSize,
      iconColor,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Determine if we should use Streamline icon based on preference and availability
    const shouldUseStreamline = useStreamline && icon && hasStreamlineEquivalent(icon);
    
    // Get the Streamline icon ID if applicable
    const streamlineIcon = icon && shouldUseStreamline ? getStreamlineIcon(icon) : undefined;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <Icon 
            name={shouldUseStreamline ? streamlineIcon! : icon}
            isStreamline={shouldUseStreamline}
            size={iconSize || (size === "sm" ? 16 : size === "lg" ? 24 : 20)}
            color={iconColor}
            className="shrink-0"
          />
        )}
        {children}
        {icon && iconPosition === "right" && (
          <Icon 
            name={shouldUseStreamline ? streamlineIcon! : icon}
            isStreamline={shouldUseStreamline}
            size={iconSize || (size === "sm" ? 16 : size === "lg" ? 24 : 20)}
            color={iconColor}
            className="shrink-0"
          />
        )}
      </Comp>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton, buttonVariants };
