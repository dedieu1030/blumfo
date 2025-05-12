
import React from "react";
import { plumpLine } from "@streamlinehq/streamlinehq";
import { Icon } from "@/components/ui/icon";

const IconsExample = () => {
  const iconNames = Object.keys(plumpLine);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Streamline Plump Line Icons</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {iconNames.map((name) => (
          <div 
            key={name} 
            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <Icon name={name as any} size={32} className="mb-2" />
            <span className="text-xs text-center text-gray-600 break-all">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconsExample;
