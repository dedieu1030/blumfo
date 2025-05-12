
import React from "react";
import { cn } from "@/lib/utils";
import * as streamlineIcons from "@streamlinehq/streamlinehq";

// Nous utilisons spécifiquement la collection Plump Line
const PlumpLineIcons = streamlineIcons.plumpLine;

export type IconName = keyof typeof PlumpLineIcons;

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  // Vérifier si l'icône existe dans la collection Streamline Plump Line
  const IconComponent = PlumpLineIcons[name];

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
