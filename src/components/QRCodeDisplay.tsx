
import React from 'react';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ value, size = 150, className }: QRCodeDisplayProps) {
  return (
    <div className={className}>
      <QRCode 
        value={value}
        size={size}
        renderAs="svg"
        includeMargin={true}
        className="border rounded"
      />
    </div>
  );
}

export default QRCodeDisplay;
