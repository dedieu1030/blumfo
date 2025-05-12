
import React from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// Define available icon names from Lucide
export type IconName = keyof typeof LucideIcons;

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color, className, ...props }: IconProps) {
  // Check if the icon exists in the Lucide collection
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    console.error(`Icon "${String(name)}" not found`);
    return null;
  }

  return React.createElement(IconComponent, {
    size,
    color,
    className: cn("shrink-0", className),
    ...props
  });
}
