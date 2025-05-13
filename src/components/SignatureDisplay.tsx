
import React from 'react';
import { SignatureData } from '@/types/invoice';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface SignatureDisplayProps {
  signature: SignatureData;
  className?: string;
  showName?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
}

export function SignatureDisplay({ 
  signature, 
  className,
  showName = true,
  showRemove = false,
  onRemove
}: SignatureDisplayProps) {
  if (!signature) return null;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {signature.type === 'draw' && (
        <div className="flex flex-col">
          <div className="border rounded p-2 bg-white max-w-[300px]">
            <img 
              src={signature.dataUrl} 
              alt={signature.name || "Signature"}
              style={{ maxHeight: "80px" }}
              className="object-contain"
            />
          </div>
          {showName && signature.name && (
            <span className="text-xs text-muted-foreground mt-1 text-center">
              {signature.name}
            </span>
          )}
        </div>
      )}

      {signature.type === 'type' && (
        <div className="flex flex-col">
          <div className="border rounded p-2 bg-white max-w-[300px]">
            <img 
              src={signature.dataUrl} 
              alt={signature.name}
              style={{ maxHeight: "80px" }}
              className="object-contain"
            />
          </div>
          {showName && signature.name && (
            <span className="text-xs text-muted-foreground mt-1 text-center">
              {signature.name}
            </span>
          )}
        </div>
      )}

      {signature.type === 'initials' && (
        <div className="flex flex-col">
          <div className="border rounded p-2 bg-white">
            <img 
              src={signature.dataUrl} 
              alt={signature.initials || "Initials"}
              style={{ maxHeight: "60px", maxWidth: "60px" }}
              className="object-contain"
            />
          </div>
          {showName && signature.name && (
            <span className="text-xs text-muted-foreground mt-1 text-center">
              {signature.name}
            </span>
          )}
        </div>
      )}

      {showRemove && onRemove && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemove} 
          className="mt-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Remove
        </Button>
      )}
    </div>
  );
}
