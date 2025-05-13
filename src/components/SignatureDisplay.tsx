
import React from 'react';
import { SignatureData } from '@/types/invoice';

interface SignatureDisplayProps {
  signature: SignatureData;
  className?: string;
  signatureData?: SignatureData; // Support both property names
}

export function SignatureDisplay({ signature, signatureData, className }: SignatureDisplayProps) {
  // Use either signature or signatureData prop, with signature taking precedence
  const signatureToDisplay = signature || signatureData;
  
  if (!signatureToDisplay || !signatureToDisplay.dataUrl) {
    return <p>No signature provided.</p>;
  }

  return (
    <div className={className}>
      {signatureToDisplay.type === 'draw' && (
        <img src={signatureToDisplay.dataUrl} alt="Drawn Signature" style={{ maxHeight: '50px', maxWidth: '200px' }} />
      )}
      {signatureToDisplay.type === 'type' && (
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.2em' }}>
          {signatureToDisplay.name}
        </div>
      )}
      {signatureToDisplay.type === 'initials' && signatureToDisplay.initials && (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2em',
          fontWeight: 'bold'
        }}>
          {signatureToDisplay.initials.toUpperCase()}
        </div>
      )}
    </div>
  );
}
