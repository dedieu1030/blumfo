
import React from "react";
import * as LucideIcons from "lucide-react";
import { Icon } from "@/components/ui/icon";

const IconsExample = () => {
  // Get Lucide icon names
  const iconNames = Object.keys(LucideIcons) as Array<keyof typeof LucideIcons>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Lucide Icons</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {iconNames.slice(0, 60).map((name) => (
          <div 
            key={String(name)} 
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <Icon name={name} size={32} className="mb-2" />
            <span className="text-xs text-center text-gray-600 break-all">{String(name)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconsExample;
