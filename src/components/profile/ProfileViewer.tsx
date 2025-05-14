
import { CompanyProfile } from "@/types/invoice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Building2, UsersRound, UserIcon, Scale, Briefcase, Building, CircleDot } from "lucide-react";

interface ProfileViewerProps {
  profile: CompanyProfile;
  onEdit: () => void;
}

export function ProfileViewer({ profile, onEdit }: ProfileViewerProps) {
  // Détermine l'icône à afficher en fonction du type de profil
  const getProfileIcon = () => {
    const type = profile.profileType || (profile.businessType === "company" ? "business" : "personal");
    const subtype = profile.profileSubtype || profile.businessType;
    
    if (type === "personal") {
      switch (subtype) {
        case "lawyer":
          return <Scale className="h-6 w-6 text-violet" />;
        case "freelancer":
          return <Briefcase className="h-6 w-6 text-violet" />;
        case "individual":
          return <UserIcon className="h-6 w-6 text-violet" />;
        default:
          return <UsersRound className="h-6 w-6 text-violet" />;
      }
    } else {
      switch (subtype) {
        case "company":
          return <Building2 className="h-6 w-6 text-violet" />;
        case "startup":
          return <Building className="h-6 w-6 text-violet" />;
        default:
          return <Building2 className="h-6 w-6 text-violet" />;
      }
    }
  };
  
  // Détermine le titre du profil en fonction du type
  const getProfileTitle = () => {
    const type = profile.profileType || (profile.businessType === "company" ? "business" : "personal");
    const subtype = profile.profileSubtype || profile.businessType;
    const customType = profile.businessTypeCustom;
    
    if (type === "personal") {
      switch (subtype) {
        case "lawyer":
          return "Profil d'avocat";
        case "freelancer":
          return "Profil de freelance";
        case "individual":
          return "Profil personnel";
        case "other":
          return customType ? `Profil ${customType}` : "Profil personnel";
        default:
          return "Profil personnel";
      }
    } else {
      switch (subtype) {
        case "company":
          return "Profil d'entreprise";
        case "startup":
          return "Profil de startup";
        case "nonprofit":
          return "Profil d'association";
        case "other":
          return customType ? `Profil ${customType}` : "Profil d'organisation";
        default:
          return "Profil d'entreprise";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-violet/10 rounded-full">
              {getProfileIcon()}
            </div>
            <div>
              <CardTitle>{getProfileTitle()}</CardTitle>
              <CardDescription>{profile.name}</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="flex items-center"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Coordonnées</h3>
            <div className="space-y-2">
              <div>
                <div className="font-medium">{profile.name}</div>
                <div className="text-sm text-muted-foreground">{profile.accountHolder}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm">{profile.email}</div>
                <div className="text-sm">{profile.phone}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Adresse</h3>
            <div className="whitespace-pre-line">{profile.address}</div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Coordonnées bancaires</h3>
            <div className="space-y-1">
              <div className="text-sm font-medium">{profile.bankName}</div>
              <div className="text-sm">{profile.bankAccount}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Paramètres de facturation</h3>
            <div className="space-y-1">
              <div className="text-sm">TVA: {profile.taxRate}%</div>
              <div className="text-sm">Devise: {profile.defaultCurrency}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Conditions de paiement</h3>
          <div className="text-sm bg-gray-50 p-3 rounded">
            {profile.termsAndConditions}
          </div>
        </div>
        
        {profile.thankYouMessage && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Message de remerciement</h3>
            <div className="text-sm bg-gray-50 p-3 rounded">
              {profile.thankYouMessage}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
