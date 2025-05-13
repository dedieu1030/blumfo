
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { SignatureCanvas } from "./SignatureCanvas";
import { SignatureDisplay } from "./SignatureDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { SignatureData } from '@/types/invoice';
import { NoSymbolIcon, PlusCircleIcon } from "lucide-react";

interface SignatureSelectorProps {
  onSelect: (signature: SignatureData | null) => void;
  selectedSignature?: SignatureData | null;
}

export function SignatureSelector({ onSelect, selectedSignature }: SignatureSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [editingSignature, setEditingSignature] = useState<SignatureData | null>(null);
  
  // Load saved signatures from localStorage
  useEffect(() => {
    const savedSignatures = localStorage.getItem('savedSignatures');
    if (savedSignatures) {
      try {
        const parsed = JSON.parse(savedSignatures);
        if (Array.isArray(parsed)) {
          // Sort by newest first
          const sorted = parsed.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          setSignatures(sorted);
        }
      } catch (error) {
        console.error('Error parsing saved signatures:', error);
      }
    }
  }, []);

  // Save signatures to localStorage when they change
  useEffect(() => {
    if (signatures.length > 0) {
      localStorage.setItem('savedSignatures', JSON.stringify(signatures));
    }
  }, [signatures]);

  const handleOpenDialog = () => {
    setIsOpen(true);
    setEditingSignature(null);
  };

  const handleEditSignature = (signature: SignatureData) => {
    setEditingSignature(signature);
    setIsOpen(true);
  };

  const handleSaveSignature = (signature: SignatureData) => {
    if (editingSignature) {
      // Update existing signature
      setSignatures(signatures.map(sig => 
        sig.timestamp === editingSignature.timestamp ? signature : sig
      ));
    } else {
      // Add new signature
      setSignatures([signature, ...signatures]);
    }
    
    // Automatically select this signature
    onSelect(signature);
    setIsOpen(false);
  };

  const handleRemoveSignature = (signatureToRemove: SignatureData) => {
    setSignatures(signatures.filter(sig => sig.timestamp !== signatureToRemove.timestamp));
    
    // If the removed signature was selected, deselect it
    if (selectedSignature && selectedSignature.timestamp === signatureToRemove.timestamp) {
      onSelect(null);
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingSignature(null);
  };

  const handleSelectSignature = (signature: SignatureData) => {
    onSelect(signature);
  };

  const handleClearSelection = () => {
    onSelect(null);
  };

  return (
    <div className="space-y-4">
      {/* Selected signature display */}
      {selectedSignature ? (
        <div className="flex items-start space-x-4">
          <SignatureDisplay signature={selectedSignature} />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearSelection}
            className="text-destructive hover:bg-destructive/10"
          >
            <NoSymbolIcon className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={handleOpenDialog} className="w-full">
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Add Signature
        </Button>
      )}

      {/* Dialog for drawing or selecting signature */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSignature ? 'Edit Signature' : 'Add Signature'}
            </DialogTitle>
          </DialogHeader>
          
          {isOpen && (
            <div className="space-y-6">
              {/* Signature Drawing Canvas */}
              <SignatureCanvas 
                onSave={handleSaveSignature}
                onClose={handleCloseDialog}
                initialData={editingSignature || undefined}
              />
              
              {/* Saved Signatures Gallery */}
              {signatures.length > 0 && !editingSignature && (
                <div className="mt-8 border-t pt-4">
                  <h4 className="text-sm font-medium mb-4">Saved Signatures</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {signatures.map((sig) => (
                      <Card key={sig.timestamp} className="overflow-hidden">
                        <CardContent className="p-4 flex flex-col items-center justify-between h-full">
                          <SignatureDisplay signature={sig} />
                          
                          <div className="flex mt-4 space-x-2 w-full justify-center">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleSelectSignature(sig)}
                            >
                              Use
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditSignature(sig)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveSignature(sig)}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
