
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileTypeSelector } from "./ProfileTypeSelector";
import { ProfileSubtypeSelector, ProfileSubtype, PersonalProfileSubtype, BusinessProfileSubtype } from "./ProfileSubtypeSelector";
import { PersonalProfileForm } from "./PersonalProfileForm";
import { BusinessProfileForm } from "./BusinessProfileForm";
import { CompanyProfile } from "@/types/invoice";
import { toast } from "sonner";

type WizardStep = "type" | "subtype" | "details";

interface ProfileWizardProps {
  initialData?: Partial<CompanyProfile>;
  onComplete: (data: CompanyProfile) => void;
  onCancel?: () => void;
}

export function ProfileWizard({ initialData, onComplete, onCancel }: ProfileWizardProps) {
  const [step, setStep] = useState<WizardStep>("type");
  const [profileType, setProfileType] = useState<"personal" | "business">("business");
  const [profileSubtype, setProfileSubtype] = useState<ProfileSubtype>("company");
  
  const handleProfileTypeSelect = (type: "personal" | "business") => {
    setProfileType(type);
    setStep("subtype");
    // Reset subtype when changing profile type
    if (type === "personal") {
      setProfileSubtype("individual");
    } else {
      setProfileSubtype("company");
    }
  };
  
  const handleProfileSubtypeSelect = (subtype: ProfileSubtype) => {
    setProfileSubtype(subtype);
    setStep("details");
  };
  
  const handleBack = () => {
    if (step === "subtype") {
      setStep("type");
    } else if (step === "details") {
      setStep("subtype");
    }
  };
  
  const handleSaveProfile = (data: CompanyProfile) => {
    // Create complete profile data with type information
    const completeData: CompanyProfile = {
      ...data,
      // Add profileType and subtype information
      profileType: profileType,
      profileSubtype: profileSubtype,
    };
    
    onComplete(completeData);
    toast.success("Profil créé avec succès");
  };
  
  const getStepTitle = () => {
    switch (step) {
      case "type":
        return "Étape 1 : Type de profil";
      case "subtype":
        return `Étape 2 : Type de ${profileType === "personal" ? "profession" : "structure"}`;
      case "details":
        return "Étape 3 : Informations détaillées";
      default:
        return "";
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStepTitle()}
        </CardTitle>
        <CardDescription>
          {step === "type" && "Choisissez entre un profil personnel ou entreprise"}
          {step === "subtype" && "Précisez votre activité ou type d'organisation"}
          {step === "details" && "Complétez les informations de votre profil"}
        </CardDescription>
        
        {/* Progress indicator */}
        <div className="w-full mt-4 flex space-x-2">
          <div className={`h-1 flex-1 rounded-full ${step === "type" ? "bg-violet" : "bg-gray-200"}`}></div>
          <div className={`h-1 flex-1 rounded-full ${step === "subtype" ? "bg-violet" : "bg-gray-200"}`}></div>
          <div className={`h-1 flex-1 rounded-full ${step === "details" ? "bg-violet" : "bg-gray-200"}`}></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="min-h-[400px]">
          {step === "type" && (
            <ProfileTypeSelector 
              onSelect={handleProfileTypeSelect} 
              showBackButton={!!onCancel}
              onBack={onCancel}
            />
          )}
          
          {step === "subtype" && (
            <ProfileSubtypeSelector 
              profileType={profileType}
              onSelect={handleProfileSubtypeSelect}
              onBack={handleBack}
            />
          )}
          
          {step === "details" && profileType === "personal" && (
            <PersonalProfileForm 
              subtype={profileSubtype as PersonalProfileSubtype}
              initialData={initialData}
              onSave={handleSaveProfile}
              onBack={handleBack}
            />
          )}
          
          {step === "details" && profileType === "business" && (
            <BusinessProfileForm 
              subtype={profileSubtype as BusinessProfileSubtype}
              initialData={initialData}
              onSave={handleSaveProfile}
              onBack={handleBack}
            />
          )}
        </div>
      </CardContent>
      
      {(step === "type" && !!onCancel) && (
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
