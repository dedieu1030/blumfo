
import React, { useEffect, useState } from 'react';

interface InvoicePreviewProps {
  htmlContent: string;
}

export function InvoicePreview({ htmlContent }: InvoicePreviewProps) {
  const [iframeHeight, setIframeHeight] = useState(600);
  
  // Setup a message listener for iframe resizing if needed
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize-iframe') {
        setIframeHeight(event.data.height);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Add script to get the right height of the content
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        // Send message to parent window with document height
        window.onload = function() {
          const height = document.body.scrollHeight;
          window.parent.postMessage({ type: 'resize-iframe', height }, '*');
        };
      </script>
    </body>
    </html>
  `;

  return (
    <iframe
      srcDoc={wrappedHtml}
      className="w-full border-0"
      style={{ height: `${iframeHeight}px` }}
      title="Aperçu de la facture"
    />
  );
}

export default InvoicePreview;
