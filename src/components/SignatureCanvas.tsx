
import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from '@/types/invoice';

// Define component props
export interface SignatureCanvasProps {
  onSave?: (signature: SignatureData) => void;
  onClose?: () => void;
  signature?: SignatureData;
  userName?: string;
}

// Create the main SignatureCanvas component
export const SignatureCanvas = ({ onSave, onClose, signature, userName }: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "initials">("draw");
  const [typedName, setTypedName] = useState(userName || '');
  const [fontFamily, setFontFamily] = useState("Dancing Script");
  const [initials, setInitials] = useState('');
  const [initialsFont, setInitialsFont] = useState("Arial");

  // Initialize signature pad
  useEffect(() => {
    if (canvasRef.current && !signaturePad) {
      const canvas = canvasRef.current;
      
      // Set canvas size to match container width with appropriate height
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = Math.max(200, container.clientHeight * 0.6);
      }
      
      // Initialize the signature pad
      const pad = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0)'
      });
      
      setSignaturePad(pad);

      // Load existing signature if provided
      if (signature && signature.type === "draw" && signature.dataUrl) {
        pad.fromDataURL(signature.dataUrl);
      }
    }
    
    // If initial signature was provided and it's not draw type, set appropriate values
    if (signature) {
      if (signature.type === "type") {
        setSignatureType("type");
        setTypedName(signature.name || '');
        setFontFamily(signature.fontFamily || 'Dancing Script');
      } else if (signature.type === "initials") {
        setSignatureType("initials");
        setInitials(signature.initials || '');
        setInitialsFont(signature.fontFamily || 'Arial');
      }
    }
    
    // Initial value for typed name from props
    if (userName && !typedName) {
      setTypedName(userName);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && signaturePad) {
        // Save current data
        const data = signaturePad.toDataURL();
        
        // Resize canvas
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = Math.max(200, container.clientHeight * 0.6);
        }
        
        // Restore data
        signaturePad.clear();
        signaturePad.fromDataURL(data);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [signaturePad]);

  // Clear the signature pad
  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  // Generate signature based on type
  const generateSignature = (): SignatureData | undefined => {
    if (signatureType === "draw" && signaturePad) {
      if (signaturePad.isEmpty()) return undefined;
      
      const dataUrl = signaturePad.toDataURL();
      const signatureData: SignatureData = {
        type: "draw",
        dataUrl: dataUrl,
        name: typedName || '',
        timestamp: new Date().toISOString()
      };
      
      if (onSave) {
        onSave(signatureData);
      }
      
      return signatureData;
      
    } else if (signatureType === "type" && typedName) {
      // For typed signature
      // We'd render this to canvas in a real implementation
      const signatureData: SignatureData = {
        type: "type",
        dataUrl: "", // In a real implementation, we would render the text to a canvas and get dataURL
        name: typedName,
        fontFamily: fontFamily,
        timestamp: new Date().toISOString()
      };
      
      if (onSave) {
        onSave(signatureData);
      }
      
      return signatureData;
      
    } else if (signatureType === "initials" && initials) {
      // For initials
      const signatureData: SignatureData = {
        type: "initials",
        dataUrl: "", // In a real implementation, we would render the initials to a canvas and get dataURL
        name: typedName || '',
        initials: initials,
        fontFamily: initialsFont,
        timestamp: new Date().toISOString()
      };
      
      if (onSave) {
        onSave(signatureData);
      }
      
      return signatureData;
    }
    
    return undefined;
  };

  const handleSave = () => {
    generateSignature();
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button
          type="button"
          variant={signatureType === "draw" ? "default" : "outline"}
          onClick={() => setSignatureType("draw")}
        >
          Dessiner
        </Button>
        <Button
          type="button"
          variant={signatureType === "type" ? "default" : "outline"}
          onClick={() => setSignatureType("type")}
        >
          Taper
        </Button>
        <Button
          type="button"
          variant={signatureType === "initials" ? "default" : "outline"}
          onClick={() => setSignatureType("initials")}
        >
          Initiales
        </Button>
      </div>

      {signatureType === "draw" && (
        <div className="border rounded-md bg-white p-2">
          <div className="signature-container relative">
            <canvas 
              ref={canvasRef} 
              className="w-full border border-gray-200 rounded"
            />
          </div>
          <div className="flex justify-end mt-2 space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={clearSignature}
              size="sm"
            >
              Effacer
            </Button>
          </div>
        </div>
      )}

      {signatureType === "type" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="typed-name">Votre nom</Label>
            <Input 
              id="typed-name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">Police d'écriture</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une police" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dancing Script">Manuscrite</SelectItem>
                <SelectItem value="Arial">Standard</SelectItem>
                <SelectItem value="Times New Roman">Formelle</SelectItem>
                <SelectItem value="Comic Sans MS">Décontractée</SelectItem>
                <SelectItem value="Courier New">Machine à écrire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md bg-white p-4 min-h-[100px] flex items-center justify-center">
            <div style={{ 
              fontFamily: fontFamily, 
              fontSize: "28px", 
              color: "blue" 
            }}>
              {typedName || "Votre signature"}
            </div>
          </div>
        </div>
      )}

      {signatureType === "initials" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initials">Vos initiales</Label>
            <Input 
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().substring(0, 3))}
              placeholder="JD"
              maxLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initials-font">Police d'écriture</Label>
            <Select value={initialsFont} onValueChange={setInitialsFont}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une police" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Standard</SelectItem>
                <SelectItem value="Times New Roman">Formelle</SelectItem>
                <SelectItem value="Courier New">Machine à écrire</SelectItem>
                <SelectItem value="Impact">Audacieuse</SelectItem>
                <SelectItem value="Georgia">Élégante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md bg-white p-4 h-[100px] flex items-center justify-center">
            <div style={{ 
              fontFamily: initialsFont, 
              fontSize: "36px", 
              fontWeight: "bold", 
              color: "blue" 
            }}>
              {initials || "??"}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        {onClose && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Annuler
          </Button>
        )}
        <Button 
          type="button"
          onClick={handleSave}
          disabled={
            (signatureType === "draw" && signaturePad?.isEmpty()) || 
            (signatureType === "type" && !typedName) || 
            (signatureType === "initials" && !initials)
          }
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

// Adapter for SignatureCanvas for backward compatibility
export const SignatureCanvasAdapter: React.FC<{
  onSignatureChange: (sig: SignatureData) => void;
  signatureData?: SignatureData;
  userName?: string;
}> = ({ onSignatureChange, signatureData, userName }) => {
  const handleSave = (sig: SignatureData) => {
    onSignatureChange(sig);
  };
  
  return <SignatureCanvas onSave={handleSave} signature={signatureData} userName={userName} />;
};
