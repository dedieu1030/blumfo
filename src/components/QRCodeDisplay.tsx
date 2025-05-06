
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ value, size = 150, className }: QRCodeDisplayProps) {
  return (
    <div className={className}>
      <QRCodeCanvas 
        value={value}
        size={size}
        includeMargin={true}
        className="border rounded"
      />
    </div>
  );
}

export default QRCodeDisplay;
