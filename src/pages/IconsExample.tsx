
import React from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import iconMapping from "@/lib/icon-mapping";

export default function IconsExample() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Create array from icon mapping object
  const iconEntries = Object.entries(iconMapping).sort((a, b) => a[0].localeCompare(b[0]));
  
  return (
    <>
      <Header 
        title="Icônes" 
        description="Exemples des icônes disponibles dans l'application"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <Tabs defaultValue="streamline">
        <TabsList>
          <TabsTrigger value="streamline">Streamline</TabsTrigger>
          <TabsTrigger value="lucide">Lucide</TabsTrigger>
          <TabsTrigger value="buttons">Boutons avec icônes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="streamline" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Icônes Streamline</CardTitle>
              <CardDescription>
                Les nouvelles icônes Streamline Plump Line utilisées dans l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {iconEntries.map(([lucideName, streamlineName]) => (
                  <div key={streamlineName} className="flex flex-col items-center justify-center p-4 border rounded-md gap-2">
                    <Icon name={streamlineName} isStreamline={true} size={32} />
                    <div className="text-xs text-center mt-2 text-muted-foreground truncate w-full">
                      {streamlineName}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lucide" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Icônes Lucide</CardTitle>
              <CardDescription>
                Les icônes Lucide originales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {iconEntries.map(([lucideName]) => (
                  <div key={lucideName} className="flex flex-col items-center justify-center p-4 border rounded-md gap-2">
                    <Icon name={lucideName} isStreamline={false} size={32} />
                    <div className="text-xs text-center mt-2 text-muted-foreground truncate w-full">
                      {lucideName}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="buttons" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Boutons avec icônes</CardTitle>
              <CardDescription>
                Exemples de boutons utilisant les icônes Streamline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <IconButton icon="Plus" variant="default">
                  Ajouter
                </IconButton>
                <IconButton icon="Trash" variant="destructive">
                  Supprimer
                </IconButton>
                <IconButton icon="Check" variant="outline">
                  Confirmer
                </IconButton>
                <IconButton icon="X" variant="secondary">
                  Annuler
                </IconButton>
                <IconButton icon="ArrowRight" iconPosition="right" variant="ghost">
                  Continuer
                </IconButton>
                <IconButton icon="Download" variant="link">
                  Télécharger
                </IconButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
