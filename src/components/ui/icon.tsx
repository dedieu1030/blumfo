
import React from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

// Define available icon names from Lucide
export type IconName = keyof typeof LucideIcons;

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color, className, ...props }: IconProps) {
  // Check if the icon exists in the Lucide collection
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideProps>;

  if (!LucideIcon) {
    console.error(`Icon "${String(name)}" not found`);
    return null;
  }

  // Use JSX to render the icon with proper typing
  return (
    <div {...props} className={cn("shrink-0", className)}>
      <LucideIcon size={size} color={color} />
    </div>
  );
}
