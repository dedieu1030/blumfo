import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignatureData } from "@/types/invoice";

interface SignatureCanvasProps {
  onSignatureChange: (signatureData: SignatureData | undefined) => void;
  signatureData?: SignatureData;
  userName?: string;
}

export function SignatureCanvas({ onSignatureChange, signatureData, userName = "" }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [signatureType, setSignatureType] = useState<'drawn' | 'initials'>(signatureData?.type || 'drawn');
  const [initials, setInitials] = useState(signatureData?.initials || '');
  const [name, setName] = useState(signatureData?.name || userName);
  
  // Initialiser SignaturePad lorsque le canvas est chargé
  useEffect(() => {
    if (canvasRef.current && signatureType === 'drawn') {
      const canvas = canvasRef.current;
      
      // Ajuster la taille du canvas pour qu'il soit responsive
      const parentWidth = canvas.parentElement?.clientWidth || 300;
      canvas.width = parentWidth;
      canvas.height = 200;
      
      // Créer l'instance SignaturePad
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
      
      // Restaurer la signature existante si disponible
      if (signatureData?.dataUrl && signatureType === 'drawn') {
        signaturePadRef.current.fromDataURL(signatureData.dataUrl);
      }
    }
    
    return () => {
      // Nettoyer
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
    };
  }, [canvasRef, signatureType, signatureData]);
  
  // Fonction pour redimensionner le canvas si la fenêtre change de taille
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && signaturePadRef.current && signatureType === 'drawn') {
        const canvas = canvasRef.current;
        const data = signaturePadRef.current.toData();
        
        const parentWidth = canvas.parentElement?.clientWidth || 300;
        canvas.width = parentWidth;
        canvas.height = 200;
        
        signaturePadRef.current.clear();
        signaturePadRef.current.fromData(data);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [signatureType]);
  
  // Fonction pour sauvegarder la signature
  const saveSignature = () => {
    if (signatureType === 'drawn' && signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        onSignatureChange(undefined);
        return;
      }
      
      const dataUrl = signaturePadRef.current.toDataURL('image/png');
      const timestamp = new Date().toISOString();
      
      onSignatureChange({
        type: 'drawn',
        dataUrl,
        name,
        timestamp
      });
    } else if (signatureType === 'initials' && initials.trim()) {
      const timestamp = new Date().toISOString();
      
      onSignatureChange({
        type: 'initials',
        initials: initials.trim(),
        name,
        timestamp
      });
    } else {
      onSignatureChange(undefined);
    }
  };
  
  // Fonction pour effacer la signature
  const clearSignature = () => {
    if (signatureType === 'drawn' && signaturePadRef.current) {
      signaturePadRef.current.clear();
    } else if (signatureType === 'initials') {
      setInitials('');
    }
    onSignatureChange(undefined);
  };
  
  // Fonction pour gérer le changement de type de signature
  const handleTypeChange = (value: string) => {
    const newType = value as 'drawn' | 'initials';
    setSignatureType(newType);
    
    // Réinitialiser la signature actuelle
    onSignatureChange(undefined);
    
    // Si on passe aux initiales, on efface la signature dessinée
    if (newType === 'initials' && signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };
  
  useEffect(() => {
    // Sauvegarde automatique quand initials ou name changent
    if (signatureType === 'initials' && initials.trim()) {
      saveSignature();
    }
  }, [initials, name]);
  
  return (
    <div className="space-y-4">
      <Tabs value={signatureType} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drawn">Signature dessinée</TabsTrigger>
          <TabsTrigger value="initials">Initiales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drawn" className="space-y-4">
          <div className="border rounded-md bg-white">
            <canvas 
              ref={canvasRef} 
              className="w-full touch-none" 
              style={{ height: '200px' }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signature-name">Nom</Label>
            <Input 
              id="signature-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet" 
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="button" onClick={clearSignature} variant="outline">Effacer</Button>
            <Button type="button" onClick={saveSignature}>Sauvegarder la signature</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="initials" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initials-input">Vos initiales</Label>
            <Input 
              id="initials-input" 
              value={initials} 
              onChange={(e) => setInitials(e.target.value)}
              placeholder="Entrez vos initiales (ex: JD)"
              maxLength={5}
              className="text-lg font-bold"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initials-name">Nom complet</Label>
            <Input 
              id="initials-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet" 
            />
          </div>
          
          {initials && (
            <div className="border p-4 rounded-md bg-gray-50 text-center">
              <div className="text-3xl font-bold font-signature my-4">{initials}</div>
              {name && <div className="text-sm text-muted-foreground">{name}</div>}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {signatureData && (
        <div className="text-sm text-muted-foreground mt-2">
          Signature {signatureData.type === 'drawn' ? 'dessinée' : 'par initiales'} 
          {signatureData.timestamp && ` le ${new Date(signatureData.timestamp).toLocaleString()}`}
        </div>
      )}
    </div>
  );
}
