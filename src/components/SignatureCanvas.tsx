import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignatureData } from '@/types/invoice';

interface SignatureCanvasProps {
  onSave: (signatureData: SignatureData) => void;
  onClose: () => void;
  initialData?: SignatureData;
}

export function SignatureCanvas({ onSave, onClose, initialData }: SignatureCanvasProps) {
  const [activeTab, setActiveTab] = useState<string>(initialData?.type || 'draw');
  const [name, setName] = useState<string>(initialData?.name || '');
  const [initials, setInitials] = useState<string>(initialData?.initials || '');
  const [fontFamily, setFontFamily] = useState<string>('Sacramento');
  const [isValid, setIsValid] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  
  const canvasDimensions = {
    width: 600,
    height: 200
  };
  
  const fonts = [
    { name: 'Sacramento', value: 'Sacramento' },
    { name: 'Dancing Script', value: 'Dancing Script' },
    { name: 'Pacifico', value: 'Pacifico' },
    { name: 'Satisfy', value: 'Satisfy' },
    { name: 'Caveat', value: 'Caveat' },
    { name: 'Kalam', value: 'Kalam' },
    { name: 'Allura', value: 'Allura' },
    { name: 'Great Vibes', value: 'Great Vibes' },
    { name: 'Tangerine', value: 'Tangerine' },
    { name: 'Alex Brush', value: 'Alex Brush' }
  ];

  // Initialize signature pad when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const devicePixelRatio = Math.max(window.devicePixelRatio || 1, 1);

      // Set canvas dimensions with device pixel ratio for better quality
      canvas.width = canvasDimensions.width * devicePixelRatio;
      canvas.height = canvasDimensions.height * devicePixelRatio;
      
      // Scale canvas CSS width and height
      canvas.style.width = `${canvasDimensions.width}px`;
      canvas.style.height = `${canvasDimensions.height}px`;

      // Scale canvas context
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(devicePixelRatio, devicePixelRatio);
      }

      // Initialize signature pad
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'blue',
        minWidth: 0.5,
        maxWidth: 2.5,
      });

      // If we have initial data and it's a signature, render it
      if (initialData && initialData.type === 'draw' && initialData.dataUrl) {
        signaturePadRef.current.fromDataURL(initialData.dataUrl);
      }
    }

    return () => {
      // Clean up signature pad
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
    };
  }, [initialData]);

  // Check if signature is valid
  useEffect(() => {
    if (activeTab === 'draw') {
      setIsValid(signaturePadRef.current ? !signaturePadRef.current.isEmpty() : false);
    } else if (activeTab === 'type') {
      setIsValid(name.trim().length > 0);
    } else if (activeTab === 'initials') {
      setIsValid(initials.trim().length > 0);
    }
  }, [activeTab, name, initials]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'draw' && signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  // Handle clear button click
  const handleClear = () => {
    if (activeTab === 'draw' && signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsValid(false);
    } else if (activeTab === 'type') {
      setName('');
      setIsValid(false);
    } else if (activeTab === 'initials') {
      setInitials('');
      setIsValid(false);
    }
  };

  // Handle save button click
  const handleSave = () => {
    if (activeTab === 'draw' && signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      
      onSave({
        type: 'draw',
        dataUrl,
        name: name || 'Signature',
        timestamp: new Date().toISOString()
      });
    } else if (activeTab === 'type' && name.trim()) {
      // Create a canvas to render the typed signature
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = canvasDimensions.width;
      canvas.height = canvasDimensions.height;
      
      if (context) {
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = `48px ${fontFamily}`;
        context.fillStyle = 'blue';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name, canvas.width / 2, canvas.height / 2);
        
        const dataUrl = canvas.toDataURL('image/png');
        
        onSave({
          type: 'type',
          dataUrl,
          name,
          timestamp: new Date().toISOString()
        });
      }
    } else if (activeTab === 'initials' && initials.trim()) {
      // Create a canvas to render the initials
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = 200;
      canvas.height = 200;
      
      if (context) {
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = `72px ${fontFamily}`;
        context.fillStyle = 'blue';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(initials, canvas.width / 2, canvas.height / 2);
        
        const dataUrl = canvas.toDataURL('image/png');
        
        onSave({
          type: 'initials',
          dataUrl,
          name,
          initials,
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  const renderTypedSignature = () => {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="signature-name">Your Name</Label>
            <Input 
              id="signature-name"
              placeholder="Type your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="font-family">Font</Label>
            <Select 
              value={fontFamily} 
              onValueChange={setFontFamily}
            >
              <SelectTrigger id="font-family" className="w-[180px]">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div 
          className="border rounded-md p-4 flex items-center justify-center min-h-[120px] bg-white"
          style={{ 
            fontFamily: fontFamily,
            fontSize: '48px',
            color: 'blue' 
          }}
        >
          {name || 'Preview Signature'}
        </div>
      </div>
    );
  };

  const renderInitials = () => {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="initials-input">Your Initials</Label>
            <Input 
              id="initials-input"
              placeholder="Type your initials (e.g., JD)"
              value={initials}
              onChange={(e) => setInitials(e.target.value.slice(0, 3))}
              maxLength={3}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="initials-name">Your Name</Label>
            <Input 
              id="initials-name"
              placeholder="Type your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="font-family-initials">Font</Label>
            <Select 
              value={fontFamily} 
              onValueChange={setFontFamily}
            >
              <SelectTrigger id="font-family-initials" className="w-[180px]">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div 
          className="border rounded-md p-4 flex items-center justify-center min-h-[120px] bg-white"
          style={{ 
            fontFamily: fontFamily,
            fontSize: '72px',
            color: 'blue' 
          }}
        >
          {initials || 'JD'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-[650px]">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="draw">Draw Signature</TabsTrigger>
          <TabsTrigger value="type">Type Signature</TabsTrigger>
          <TabsTrigger value="initials">Initials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="draw" className="space-y-4">
          <div>
            <Label htmlFor="signature-canvas">Draw your signature below</Label>
            <div className="border rounded-md bg-white">
              <canvas 
                ref={canvasRef} 
                id="signature-canvas"
                className="touch-none w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Use your mouse or finger to sign above
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="type">
          {renderTypedSignature()}
        </TabsContent>
        
        <TabsContent value="initials">
          {renderInitials()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <div>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
