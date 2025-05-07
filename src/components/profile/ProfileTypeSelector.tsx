
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileType = "personal" | "business";

interface ProfileTypeSelectorProps {
  onSelect: (type: ProfileType) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ProfileTypeSelector({ onSelect, onBack, showBackButton = false }: ProfileTypeSelectorProps) {
  const [hoveredOption, setHoveredOption] = useState<ProfileType | null>(null);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Choisissez votre type de profil</h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez le type de profil qui correspond à votre activité
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={cn(
            "relative cursor-pointer border-2 transition-all duration-200", 
            hoveredOption === "personal" ? "border-violet shadow-lg" : "border-gray-200"
          )}
          onClick={() => onSelect("personal")}
          onMouseEnter={() => setHoveredOption("personal")}
          onMouseLeave={() => setHoveredOption(null)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                hoveredOption === "personal" ? "bg-violet/10" : "bg-gray-100"
              )}>
                <UsersRound className={cn(
                  "h-10 w-10",
                  hoveredOption === "personal" ? "text-violet" : "text-gray-500"
                )} />
              </div>
              <div>
                <h3 className="font-medium text-lg">Profil Personnel</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Pour les freelances, avocats ou particuliers
                </p>
              </div>
            </div>
            {hoveredOption === "personal" && (
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-5 w-5 text-violet" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "relative cursor-pointer border-2 transition-all duration-200", 
            hoveredOption === "business" ? "border-violet shadow-lg" : "border-gray-200"
          )}
          onClick={() => onSelect("business")}
          onMouseEnter={() => setHoveredOption("business")}
          onMouseLeave={() => setHoveredOption(null)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                hoveredOption === "business" ? "bg-violet/10" : "bg-gray-100"
              )}>
                <Building2 className={cn(
                  "h-10 w-10",
                  hoveredOption === "business" ? "text-violet" : "text-gray-500"
                )} />
              </div>
              <div>
                <h3 className="font-medium text-lg">Profil Entreprise</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Pour les sociétés, organisations et entreprises
                </p>
              </div>
            </div>
            {hoveredOption === "business" && (
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-5 w-5 text-violet" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {showBackButton && (
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
      )}
    </div>
  );
}
