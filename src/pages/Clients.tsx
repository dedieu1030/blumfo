
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Building, FileText, PlusCircle } from "lucide-react";
import { MobileNavigation } from "@/components/MobileNavigation";

// Mock data for demonstration
const clients = [
  {
    id: "1",
    name: "SCI Legalis",
    email: "contact@scilegalis.fr",
    phone: "01 23 45 67 89",
    address: "15 rue du Palais, 75001 Paris",
    invoiceCount: 3,
  },
  {
    id: "2",
    name: "Cabinet Lefort",
    email: "contact@cabinet-lefort.fr",
    phone: "01 23 45 67 90",
    address: "24 avenue des Avocats, 75008 Paris",
    invoiceCount: 1,
  },
  {
    id: "3",
    name: "Me. Dubois",
    email: "dubois@avocat.fr",
    phone: "01 23 45 67 91",
    address: "5 place de la Justice, 75016 Paris",
    invoiceCount: 2,
  }
];

export default function Clients() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header 
        title="Clients" 
        description="Gérez vos clients récurrents"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un client..." 
              className="pl-10 bg-background" 
            />
          </div>
          <Button className="bg-violet hover:bg-violet/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-2">{client.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <Building className="h-4 w-4 mr-2 mt-0.5" />
                      <span>{client.address}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{client.invoiceCount} facture{client.invoiceCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t flex">
                  <Button variant="ghost" className="flex-1 rounded-none h-12">
                    Modifier
                  </Button>
                  <div className="border-l h-12" />
                  <Button variant="ghost" className="flex-1 rounded-none h-12">
                    Facturer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
