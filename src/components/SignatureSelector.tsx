
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignatureData } from "@/types/invoice";
import { SignatureDisplay } from "./SignatureDisplay";

interface SignatureSelectorProps {
  onSelect: (signature: SignatureData) => void;
  userId?: string;
}

export function SignatureSelector({ onSelect, userId }: SignatureSelectorProps) {
  const [savedSignatures, setSavedSignatures] = useState<SignatureData[]>([]);
  const [open, setOpen] = useState(false);
  
  // Charger les signatures sauvegardées
  useEffect(() => {
    const loadSavedSignatures = () => {
      // Dans un cas réel, vous récupéreriez les signatures depuis l'API/Supabase
      // Pour cet exemple, nous allons utiliser localStorage
      try {
        const saved = localStorage.getItem('savedSignatures');
        if (saved) {
          const parsedSignatures = JSON.parse(saved) as SignatureData[];
          setSavedSignatures(parsedSignatures);
        }
      } catch (error) {
        console.error('Error loading saved signatures:', error);
      }
    };
    
    if (open) {
      loadSavedSignatures();
    }
  }, [open, userId]);
  
  const handleSelect = (signature: SignatureData) => {
    onSelect(signature);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Utiliser une signature sauvegardée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signatures sauvegardées</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {savedSignatures.length > 0 ? (
            savedSignatures.map((sig, index) => (
              <div 
                key={index} 
                className="border rounded-md p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelect(sig)}
              >
                <SignatureDisplay signatureData={sig} />
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(sig.timestamp || '').toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center p-8 text-muted-foreground">
              Aucune signature sauvegardée trouvée.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
