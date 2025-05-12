
import React from 'react';
import { SignatureData } from "@/types/invoice";

interface SignatureDisplayProps {
  signatureData?: SignatureData;
  className?: string;
  style?: React.CSSProperties;
}

export function SignatureDisplay({ signatureData, className = "", style = {} }: SignatureDisplayProps) {
  if (!signatureData) return null;
  
  if (signatureData.type === 'drawn' && signatureData.dataUrl) {
    return (
      <div className={className} style={style}>
        <img 
          src={signatureData.dataUrl} 
          alt="Signature" 
          style={{ maxHeight: '60px', maxWidth: '200px' }} 
        />
        {signatureData.name && (
          <div className="text-sm text-muted-foreground mt-1">{signatureData.name}</div>
        )}
      </div>
    );
  }
  
  if (signatureData.type === 'initials' && signatureData.initials) {
    return (
      <div className={className} style={style}>
        <div className="font-bold text-2xl font-signature">{signatureData.initials}</div>
        {signatureData.name && (
          <div className="text-sm text-muted-foreground mt-1">{signatureData.name}</div>
        )}
      </div>
    );
  }
  
  return null;
}
