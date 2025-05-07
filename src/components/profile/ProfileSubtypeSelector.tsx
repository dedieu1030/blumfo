
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, UserIcon, Scale, Briefcase, Building, Building2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export type PersonalProfileSubtype = "individual" | "lawyer" | "freelancer" | "other";
export type BusinessProfileSubtype = "company" | "startup" | "nonprofit" | "other";
export type ProfileSubtype = PersonalProfileSubtype | BusinessProfileSubtype;

interface Option {
  id: ProfileSubtype;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ProfileSubtypeSelectorProps {
  profileType: "personal" | "business";
  onSelect: (subtype: ProfileSubtype) => void;
  onBack: () => void;
}

export function ProfileSubtypeSelector({ profileType, onSelect, onBack }: ProfileSubtypeSelectorProps) {
  const [hoveredOption, setHoveredOption] = useState<ProfileSubtype | null>(null);
  
  const personalOptions: Option[] = [
    {
      id: "individual",
      name: "Particulier",
      description: "Pour les facturations personnelles",
      icon: <UserIcon className={cn("h-8 w-8", hoveredOption === "individual" ? "text-violet" : "text-gray-500")} />
    },
    {
      id: "lawyer",
      name: "Avocat / Cabinet juridique",
      description: "Pour les professions juridiques",
      icon: <Scale className={cn("h-8 w-8", hoveredOption === "lawyer" ? "text-violet" : "text-gray-500")} />
    },
    {
      id: "freelancer",
      name: "Freelance / Auto-entrepreneur",
      description: "Pour les indépendants et consultants",
      icon: <Briefcase className={cn("h-8 w-8", hoveredOption === "freelancer" ? "text-violet" : "text-gray-500")} />
    },
    {
      id: "other",
      name: "Autre profession",
      description: "Personnalisez votre profil",
      icon: <CircleDot className={cn("h-8 w-8", hoveredOption === "other" ? "text-violet" : "text-gray-500")} />
    }
  ];

  const businessOptions: Option[] = [
    {
      id: "company",
      name: "Entreprise",
      description: "Pour les sociétés établies",
      icon: <Building2 className={cn("h-8 w-8", hoveredOption === "company" ? "text-violet" : "text-gray-500")} />
    },
    {
      id: "startup",
      name: "Startup",
      description: "Pour les entreprises en croissance",
      icon: <Building className={cn("h-8 w-8", hoveredOption === "startup" ? "text-violet" : "text-gray-500")} />
    },
    {
      id: "nonprofit",
      name: "Association / ONG",
      description: "Pour les organisations à but non lucratif",
      icon: <UserIcon className={cn("h-8 w-8", hoveredOption === "nonprofit" ? "text-violet" : "text-gray-500")} />
    },
    {
      id: "other",
      name: "Autre structure",
      description: "Personnalisez votre profil",
      icon: <CircleDot className={cn("h-8 w-8", hoveredOption === "other" ? "text-violet" : "text-gray-500")} />
    }
  ];
  
  const options = profileType === "personal" ? personalOptions : businessOptions;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">
          {profileType === "personal" ? "Choisissez votre type d'activité" : "Choisissez votre type d'entreprise"}
        </h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez l'option qui correspond le mieux à votre situation
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <Card 
            key={option.id}
            className={cn(
              "relative cursor-pointer border-2 transition-all duration-200", 
              hoveredOption === option.id ? "border-violet shadow-md" : "border-gray-200"
            )}
            onClick={() => onSelect(option.id)}
            onMouseEnter={() => setHoveredOption(option.id)}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={cn(
                  "p-3 rounded-full mr-4 transition-colors",
                  hoveredOption === option.id ? "bg-violet/10" : "bg-gray-100"
                )}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-muted-foreground text-sm">{option.description}</p>
                </div>
                {hoveredOption === option.id && (
                  <div className="ml-auto">
                    <ArrowRight className="h-5 w-5 text-violet" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>
  );
}
