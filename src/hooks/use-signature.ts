
import { useState } from "react";
import { SignatureData } from "@/types/invoice";

export const useSignature = (initialData?: SignatureData) => {
  const [signature, setSignature] = useState<SignatureData | undefined>(initialData);

  const handleSignatureChange = (sig: SignatureData) => {
    setSignature(sig);
  };

  const handleSignatureSave = () => {
    // La signature est déjà enregistrée via le state, donc on renvoie juste la valeur actuelle
    return signature;
  };

  const handleSignatureCancel = () => {
    setSignature(undefined);
  };

  return {
    signature,
    handleSignatureChange,
    handleSignatureSave,
    handleSignatureCancel
  };
};
