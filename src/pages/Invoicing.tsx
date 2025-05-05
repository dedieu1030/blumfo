
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MobileNavigation } from "@/components/MobileNavigation";

export default function Invoicing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header 
        title="Créer une facture" 
        description="Préparez et envoyez une nouvelle facture"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations client</CardTitle>
            <CardDescription>Entrez les coordonnées de votre client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nom / Raison sociale</Label>
                <Input id="client-name" placeholder="SCI Legalis" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input id="client-email" type="email" placeholder="contact@sci-legalis.fr" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client-address">Adresse</Label>
                <Textarea id="client-address" placeholder="15 rue du Palais, 75001 Paris" className="min-h-[80px]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Détails de la prestation</CardTitle>
            <CardDescription>Précisez les services rendus et leur prix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service-description">Description de la prestation</Label>
                <Textarea id="service-description" placeholder="Consultation juridique - Droit des sociétés" className="min-h-[80px]" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité / Durée</Label>
                  <Input id="quantity" placeholder="2h" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-price">Prix unitaire (€)</Label>
                  <Input id="unit-price" placeholder="200.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva">TVA (%)</Label>
                  <Input id="tva" placeholder="20" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="w-full md:w-auto">
                  Ajouter une ligne
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conditions de paiement</CardTitle>
            <CardDescription>Définissez les modalités de règlement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payment-delay">Délai de paiement</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="immediate">Paiement immédiat</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Méthode de paiement</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement bancaire</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline">Enregistrer comme brouillon</Button>
          <div className="space-x-3">
            <Button variant="outline">Prévisualiser</Button>
            <Button className="bg-violet hover:bg-violet/90">Générer et envoyer</Button>
          </div>
        </div>
      </div>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
