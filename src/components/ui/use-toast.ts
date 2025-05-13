
import { useToast, toast } from "@/hooks/use-toast";

// Ajouter les méthodes d'aide pour faciliter l'utilisation
toast.success = (message: string) => {
  console.log("Toast success:", message);
  return toast({ 
    title: "Succès", 
    description: message,
    variant: "success" 
  });
};

toast.error = (message: string) => {
  console.error("Toast error:", message);
  return toast({ 
    title: "Erreur", 
    description: message,
    variant: "destructive" 
  });
};

toast.info = (message: string) => {
  console.log("Toast info:", message);
  return toast({ 
    title: "Information", 
    description: message
  });
};

export { useToast, toast };
