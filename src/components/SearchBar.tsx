
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  Command
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Rechercher dans l'application..." }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Ouvrir la boîte de dialogue avec le raccourci clavier Cmd+K ou Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    
    // Navigation en fonction de la sélection
    switch (value) {
      case "dashboard":
        navigate("/");
        break;
      case "invoices":
        navigate("/invoices");
        break;
      case "clients":
        navigate("/clients");
        break;
      case "new-invoice":
        navigate("/invoicing");
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  return (
    <>
      <div 
        onClick={() => setOpen(true)} 
        className="flex items-center w-full max-w-sm h-10 rounded-md border border-input px-3 py-2 bg-background cursor-pointer"
      >
        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{placeholder}</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Que recherchez-vous?" />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          <CommandGroup heading="Pages">
            <CommandItem value="dashboard" onSelect={handleSelect}>
              <Search className="mr-2 h-4 w-4" />
              <span>Tableau de bord</span>
            </CommandItem>
            <CommandItem value="invoices" onSelect={handleSelect}>
              <Search className="mr-2 h-4 w-4" />
              <span>Factures</span>
            </CommandItem>
            <CommandItem value="clients" onSelect={handleSelect}>
              <Search className="mr-2 h-4 w-4" />
              <span>Clients</span>
            </CommandItem>
            <CommandItem value="settings" onSelect={handleSelect}>
              <Search className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="Actions">
            <CommandItem value="new-invoice" onSelect={handleSelect}>
              <Search className="mr-2 h-4 w-4" />
              <span>Créer une nouvelle facture</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
