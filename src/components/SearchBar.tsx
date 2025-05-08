
import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Search results categories with mock data
  // In a real app, these would be filtered based on the query
  const invoices = [
    { id: '1', title: 'Facture INV-001', path: '/invoices' },
    { id: '2', title: 'Facture INV-002', path: '/invoices' },
  ];
  
  const clients = [
    { id: '1', title: 'SCI Legalis', path: '/clients' },
    { id: '2', title: 'Cabinet Lefort', path: '/clients' },
  ];
  
  const settings = [
    { id: '1', title: 'Profil', path: '/settings?tab=profile' },
    { id: '2', title: 'Méthodes de paiement', path: '/settings?tab=payment-methods' },
  ];

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button 
        variant="outline" 
        className="relative h-9 w-full max-w-sm rounded-md bg-background px-4 text-sm text-muted-foreground shadow-none sm:w-64 sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Rechercher dans l'application...</span>
        <span className="inline-flex lg:hidden">Rechercher...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Rechercher..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          <CommandGroup heading="Factures">
            {invoices.map((invoice) => (
              <CommandItem 
                key={invoice.id}
                onSelect={() => handleSelect(invoice.path)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {invoice.title}
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup heading="Clients">
            {clients.map((client) => (
              <CommandItem 
                key={client.id}
                onSelect={() => handleSelect(client.path)}
              >
                <Search className="mr-2 h-4 w-4" />
                {client.title}
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandGroup heading="Paramètres">
            {settings.map((setting) => (
              <CommandItem 
                key={setting.id}
                onSelect={() => handleSelect(setting.path)}
              >
                <Search className="mr-2 h-4 w-4" />
                {setting.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
