import React from 'react';
import { SignatureData } from '@/types/invoice';

interface SignatureDisplayProps {
  signature: SignatureData;
  className?: string;
}

export function SignatureDisplay({ signature, className }: SignatureDisplayProps) {
  if (!signature || !signature.dataUrl) {
    return <p>No signature provided.</p>;
  }

  return (
    <div className={className}>
      {signature.type === 'draw' && (
        <img src={signature.dataUrl} alt="Drawn Signature" style={{ maxHeight: '50px', maxWidth: '200px' }} />
      )}
      {signature.type === 'type' && (
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.2em' }}>
          {signature.name}
        </div>
      )}
      {signature.type === 'initials' && signature.initials && (
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
          {signature.initials.toUpperCase()}
        </div>
      )}
    </div>
  );
}
