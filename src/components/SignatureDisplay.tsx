
import React from 'react';
import { SignatureData } from '@/types/invoice';

export interface SignatureDisplayProps {
  signature: SignatureData;
  className?: string;
}

export function SignatureDisplay({ signature, className = "" }: SignatureDisplayProps) {
  if (!signature) {
    return <div className={`text-center text-muted-foreground ${className}`}>Signature non disponible</div>;
  }

  if (signature.type === "draw") {
    return (
      <div className={`flex justify-center ${className}`}>
        <img 
          src={signature.dataUrl} 
          alt="Signature manuscrite" 
          className="max-h-20 max-w-full"
        />
      </div>
    );
  }

  if (signature.type === "type") {
    return (
      <div className={`flex justify-center ${className}`}>
        <div style={{ 
          fontFamily: signature.fontFamily || 'Dancing Script', 
          fontSize: "28px", 
          color: "blue"
        }}>
          {signature.name}
        </div>
      </div>
    );
  }

  if (signature.type === "initials") {
    return (
      <div className={`flex justify-center ${className}`}>
        <div style={{ 
          fontFamily: signature.fontFamily || 'Arial', 
          fontSize: "36px", 
          fontWeight: "bold", 
          color: "blue"
        }}>
          {signature.initials}
        </div>
      </div>
    );
  }

  return null;
}
