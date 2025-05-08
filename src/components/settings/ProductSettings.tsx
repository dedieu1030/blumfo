
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCatalog } from "../products/ProductCatalog";
import { CategoryManager } from "../products/CategoryManager";
import { SubscriptionsList } from "../subscriptions/SubscriptionsList";

export function ProductSettings() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Produits et services</h2>
        <p className="text-muted-foreground">
          Gérez votre catalogue de produits et services, créez des catégories et configurez vos abonnements récurrents.
        </p>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Produits/Services
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Catégories
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Abonnements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductCatalog />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
