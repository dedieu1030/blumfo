
import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignatureData } from "@/types/invoice";
import { toast } from "sonner";

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
  
  // Configuration et initialisation de SignaturePad
  useEffect(() => {
    if (canvasRef.current && signatureType === 'drawn') {
      const canvas = canvasRef.current;
      
      // Ajuster la taille du canvas pour qu'il soit responsive
      const parentWidth = canvas.parentElement?.clientWidth || 300;
      canvas.width = parentWidth;
      canvas.height = 200;
      
      // Créer l'instance SignaturePad avec des options améliorées
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 0.5,
        maxWidth: 2.5, // Augmente l'épaisseur maximale du trait
        velocityFilterWeight: 0.7 // Rend le trait plus fluide
      });
      
      // Restaurer la signature existante si disponible
      if (signatureData?.dataUrl && signatureType === 'drawn') {
        try {
          signaturePadRef.current.fromDataURL(signatureData.dataUrl);
          console.log("Signature restaurée avec succès");
        } catch (error) {
          console.error("Erreur lors de la restauration de la signature:", error);
        }
      }

      // Logs pour déboguer
      console.log("Canvas initialisé", {
        width: canvas.width,
        height: canvas.height,
        signatureType,
        isEmpty: signaturePadRef.current?.isEmpty()
      });
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
        
        // Ne restaure les données que si elles existent
        if (data.length > 0) {
          signaturePadRef.current.fromData(data);
        }

        console.log("Canvas redimensionné", { width: canvas.width, height: canvas.height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [signatureType]);
  
  // Fonction pour sauvegarder la signature
  const saveSignature = () => {
    if (signatureType === 'drawn' && signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        toast.error("Veuillez dessiner une signature avant de sauvegarder");
        onSignatureChange(undefined);
        return;
      }
      
      try {
        const dataUrl = signaturePadRef.current.toDataURL('image/png');
        const timestamp = new Date().toISOString();
        
        // Créer l'objet de données de signature
        const newSignatureData = {
          type: 'drawn' as const,
          dataUrl,
          name,
          timestamp
        };
        
        // Enregistrer dans localStorage pour réutilisation future
        const savedSignatures = JSON.parse(localStorage.getItem('savedSignatures') || '[]');
        savedSignatures.push(newSignatureData);
        localStorage.setItem('savedSignatures', JSON.stringify(savedSignatures));
        
        // Notifier le composant parent
        onSignatureChange(newSignatureData);
        toast.success("Signature sauvegardée");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la signature:", error);
        toast.error("Erreur lors de la sauvegarde de la signature");
      }
    } else if (signatureType === 'initials' && initials.trim()) {
      const timestamp = new Date().toISOString();
      
      // Créer l'objet de données pour les initiales
      const newSignatureData = {
        type: 'initials' as const,
        initials: initials.trim(),
        name,
        timestamp
      };
      
      // Enregistrer dans localStorage pour réutilisation future
      const savedSignatures = JSON.parse(localStorage.getItem('savedSignatures') || '[]');
      savedSignatures.push(newSignatureData);
      localStorage.setItem('savedSignatures', JSON.stringify(savedSignatures));
      
      // Notifier le composant parent
      onSignatureChange(newSignatureData);
      toast.success("Initiales sauvegardées");
    } else {
      toast.error("Aucune signature ou initiales à sauvegarder");
      onSignatureChange(undefined);
    }
  };
  
  // Fonction pour effacer la signature
  const clearSignature = () => {
    if (signatureType === 'drawn' && signaturePadRef.current) {
      signaturePadRef.current.clear();
      console.log("Signature effacée");
    } else if (signatureType === 'initials') {
      setInitials('');
    }
    onSignatureChange(undefined);
    toast.info("Signature effacée");
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
  
  // Sauvegarde automatique quand initials ou name changent
  useEffect(() => {
    if (signatureType === 'initials' && initials.trim() && name.trim()) {
      console.log("Sauvegarde automatique des initiales:", initials);
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
              className="w-full touch-action-none" 
              style={{ 
                height: '200px', 
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                cursor: 'crosshair'
              }}
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

      <div className="text-xs text-muted-foreground italic">
        Dessinez votre signature à l'aide de la souris ou du doigt sur l'écran tactile
      </div>
    </div>
  );
}
