
import React from "react";
import { cn } from "@/lib/utils";
import * as PlumpLine from "@streamlinehq/streamlinehq/plump-line";

export type IconName = keyof typeof PlumpLine;

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  // Vérifier si l'icône existe dans la collection Streamline Plump Line
  const IconComponent = PlumpLine[name];

  if (!IconComponent) {
    console.error(`Icône "${name}" non trouvée`);
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
