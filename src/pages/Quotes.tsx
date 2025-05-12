
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { QuoteList } from "@/components/QuoteList";
import { QuoteDialog } from "@/components/QuoteDialog";

const Quotes = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div>
      <Header
        title="Devis"
        description="Gérez vos devis et suivez leur évolution"
        onOpenMobileMenu={() => {}}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau devis
          </Button>
        }
      />
      
      <QuoteList key={refresh} onRefresh={handleRefresh} />
      
      <QuoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default Quotes;
