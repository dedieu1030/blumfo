
import React from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// Define available icon names from Lucide
export type IconName = keyof typeof LucideIcons;

export interface IconProps extends Omit<React.SVGAttributes<SVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  // Check if the icon exists in the Lucide collection
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons];

  if (!IconComponent) {
    console.error(`Icon "${String(name)}" not found`);
    return null;
  }

  return (
    <IconComponent 
      width={size} 
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
