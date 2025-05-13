
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QuoteList } from "@/components/QuoteList";
import { QuoteDialog } from "@/components/QuoteDialog";
import { Icon } from "@/components/ui/icon";

const Quotes = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    // Si on ferme le dialogue
    if (!open) {
      // Petit délai pour éviter les problèmes de focus
      setTimeout(() => {
        setDialogOpen(false);
      }, 0);
    } else {
      setDialogOpen(true);
    }
  };

  const handleRefresh = () => {
    // Léger délai pour s'assurer que les données sont bien mises à jour
    setTimeout(() => {
      setRefresh(prev => prev + 1);
    }, 50);
  };

  return (
    <div>
      <Header
        title="Devis"
        description="Gérez vos devis et suivez leur évolution"
        onOpenMobileMenu={() => {}}
        actions={
          <Button onClick={handleOpenDialog}>
            <Icon name="Plus" className="mr-2 h-4 w-4" /> Nouveau devis
          </Button>
        }
      />
      
      <QuoteList key={refresh} onRefresh={handleRefresh} />
      
      <QuoteDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default Quotes;
