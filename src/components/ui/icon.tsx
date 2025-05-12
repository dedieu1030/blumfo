
import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// Import Streamline icons (dynamically)
// Streamline icons will be imported as: streamlineIcons["interface-essential-181"]
const streamlineIconsBasePath = "plump/plump-line";

/**
 * Props for the Icon component
 */
interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Name of the icon to use */
  name: string;
  /** Size of the icon in pixels */
  size?: number;
  /** Color of the icon */
  color?: string;
  /** Whether the icon is from Streamline or Lucide */
  isStreamline?: boolean;
  /** Stroke width for the icon (Lucide only) */
  strokeWidth?: number;
}

/**
 * Icon component that can render either Lucide or Streamline icons
 * 
 * @example
 * // Lucide icon (default)
 * <Icon name="Home" />
 * 
 * @example
 * // Streamline icon
 * <Icon name="interface-essential-181" isStreamline />
 */
export const Icon = ({
  name,
  size = 24,
  color,
  isStreamline = false,
  strokeWidth = 2,
  className,
  ...props
}: IconProps) => {
  // This is for transitional period - if the icon is a Lucide icon
  if (!isStreamline) {
    // @ts-ignore - LucideIcons has dynamic keys
    const LucideIcon = LucideIcons[name];
    if (!LucideIcon) {
      console.warn(`Lucide icon "${name}" not found.`);
      return null;
    }

    return (
      <div className={cn("inline-flex", className)} {...props}>
        <LucideIcon
          size={size}
          color={color}
          strokeWidth={strokeWidth}
        />
      </div>
    );
  }

  // This is for Streamline icons
  const streamlineIconPath = `${streamlineIconsBasePath}/${name}`;
  
  try {
    // Dynamically import the Streamline icon
    return (
      <div 
        className={cn("inline-flex items-center justify-center", className)} 
        style={{ width: size, height: size }} 
        {...props}
      >
        <img
          src={`https://cdn.streamlinehq.com/${streamlineIconPath}.svg`}
          alt={name}
          width={size}
          height={size}
          style={{ color: color }}
        />
      </div>
    );
  } catch (error) {
    console.error(`Error loading Streamline icon "${name}":`, error);
    return null;
  }
};

export default Icon;
