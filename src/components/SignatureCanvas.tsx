
// Ajoutons ces props manquantes au composant SignatureCanvas
export interface SignatureCanvasProps {
  onSave?: (signature: SignatureData) => void;
  onClose?: () => void;
  signature?: SignatureData;
  userName?: string;
}

// Créons un adaptateur pour la rétrocompatibilité
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
