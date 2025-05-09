
// Fichier d'aide pour les types et fonctions liées à la base de données
import { Client } from "@/components/ClientSelector";

// Interface de correspondance DB -> Application pour les clients
export interface ClientMapping {
  // Convertit un objet client de la base de données vers le format d'application
  fromDb: (dbClient: any) => Client;
  // Convertit un objet client du format d'application vers le format de base de données
  toDb: (client: Client) => any;
}

// Implémentation de la correspondance
export const clientMapping: ClientMapping = {
  fromDb: (dbClient) => {
    return {
      id: dbClient.id,
      name: dbClient.client_name,
      email: dbClient.email || "",
      phone: dbClient.phone || undefined,
      address: dbClient.address || undefined,
      notes: dbClient.notes || undefined,
      created_at: dbClient.created_at,
      updated_at: dbClient.updated_at,
      user_id: dbClient.company_id || "", // Utilisation de company_id comme user_id
      invoiceCount: 0
    };
  },
  toDb: (client) => {
    return {
      id: client.id,
      client_name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      company_id: client.user_id,
    };
  }
};
