
import React from "react";
import { SignatureData } from "@/types/invoice";

export interface SignatureDisplayProps {
  signature: SignatureData;
  className?: string;
}

export const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signature,
  className = "",
}) => {
  if (!signature) return null;

  if (signature.type === "draw" || signature.type === "type" || signature.type === "initials") {
    return (
      <div className={`signature-display ${className}`}>
        <img
          src={signature.dataUrl}
          alt={`Signature de ${signature.name}`}
          className="max-w-full h-auto"
        />
        <div className="signature-name text-sm mt-1 text-gray-700">
          {signature.name}
        </div>
      </div>
    );
  }

  return null;
};

// Ajout d'un adaptateur pour la rétrocompatibilité
export const SignatureDisplayAdapter: React.FC<{signatureData: SignatureData, className?: string}> = ({
  signatureData,
  className
}) => {
  return <SignatureDisplay signature={signatureData} className={className} />;
};
