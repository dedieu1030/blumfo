
import React from "react";
import { cn } from "@/lib/utils";
import { plumpLine } from "@streamlinehq/streamlinehq";

export type IconName = keyof typeof plumpLine;

export interface IconProps extends Omit<React.SVGAttributes<SVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  // Vérifier si l'icône existe dans la collection Streamline Plump Line
  const IconComponent = plumpLine[name as keyof typeof plumpLine];

  if (!IconComponent) {
    console.error(`Icône "${String(name)}" non trouvée`);
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
