
import { useState, useEffect, useRef } from "react";
import { Search, FileText, Users, Settings, Plus, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
}

// Données factices pour la démonstration
const mockInvoices = [
  { id: "inv-001", number: "INV-001", clientName: "SCI Legalis", amount: "1,200.00 €" },
  { id: "inv-002", number: "INV-002", clientName: "Cabinet Lefort", amount: "850.00 €" },
  { id: "inv-003", number: "INV-003", clientName: "Me. Dubois", amount: "1,400.00 €" },
];

const mockClients = [
  { id: "client-001", name: "SCI Legalis", email: "contact@sci-legalis.fr" },
  { id: "client-002", name: "Cabinet Lefort", email: "info@cabinet-lefort.fr" },
  { id: "client-003", name: "Me. Dubois", email: "dubois@avocat.fr" },
  { id: "client-004", name: "Me. Martin", email: "martin@avocat.fr" },
];

export function SearchBar({ placeholder = "Rechercher dans l'application..." }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Ensure we're safely filtering with null checks
  const filteredInvoices = searchTerm && Array.isArray(mockInvoices) 
    ? mockInvoices.filter(invoice => 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];
  
  const filteredClients = searchTerm && Array.isArray(mockClients)
    ? mockClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Suggestions de filtres à afficher quand la recherche est vide
  const searchFilters = [
    { label: "is:", example: "is:customer", description: "type d'objet" },
    { label: "last4:", example: "last4:2326", description: "last four digits of the card or account" },
    { label: "date:", example: "date:yesterday", description: "date ou période de création de l'objet" },
    { label: "email:", example: "email:jenny@example.com", description: "adresse e-mail" },
    { label: "status:", example: "status:canceled", description: "état d'un objet" }
  ];
  
  // Ouvrir la recherche avec le raccourci clavier Cmd+K ou Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        if (!open && inputRef.current) {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const handleSelect = (value: string) => {
    setOpen(false);
    setSearchTerm("");
    
    // Navigation en fonction de la sélection
    if (value.startsWith("invoice-")) {
      const invoiceId = value.replace("invoice-", "");
      navigate(`/invoices?id=${invoiceId}`);
    } else if (value.startsWith("client-")) {
      const clientId = value.replace("client-", "");
      navigate(`/clients?id=${clientId}`);
    } else {
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
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Safety check to prevent rendering if Command components aren't ready
  const canRenderCommand = typeof Command !== 'undefined';

  return (
    <div className="w-full max-w-md relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center w-full h-10 rounded-md border border-input bg-background px-3 py-2 cursor-text">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              className="h-full border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => setOpen(true)}
            />
            {searchTerm ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  inputRef.current?.focus();
                }}
                className="h-4 w-4 flex items-center justify-center"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            ) : (
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>
        </PopoverTrigger>
        {canRenderCommand && (
          <PopoverContent 
            className="p-0 w-[500px] border shadow-md bg-popover" 
            align="start" 
            side="bottom" 
            sideOffset={5}
          >
            <Command className="rounded-lg border shadow-md">
              <CommandInput 
                placeholder="Que recherchez-vous?"
                value={searchTerm}
                onValueChange={handleSearchChange}
                className="border-none focus:ring-0"
              />
              
              <div className="max-h-[400px] overflow-auto p-2">
                {!searchTerm ? (
                  <>
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      FILTRES SUGGÉRÉS
                    </div>
                    <div className="space-y-2">
                      {Array.isArray(searchFilters) && searchFilters.map((filter) => (
                        <div 
                          key={filter.label} 
                          className="flex items-center justify-between px-2 py-1.5 text-sm hover:bg-muted/50 rounded-md cursor-pointer"
                          onClick={() => handleSearchChange(filter.example)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium w-14">{filter.label}</span>
                            <span className="text-muted-foreground">{filter.example.replace(`${filter.label}`, "")}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{filter.description}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-4 pt-2">
                      <CommandGroup heading="Pages">
                        <CommandItem value="dashboard" onSelect={handleSelect}>
                          <Search className="mr-2 h-4 w-4" />
                          <span>Tableau de bord</span>
                        </CommandItem>
                        <CommandItem value="invoices" onSelect={handleSelect}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Factures</span>
                        </CommandItem>
                        <CommandItem value="clients" onSelect={handleSelect}>
                          <Users className="mr-2 h-4 w-4" />
                          <span>Clients</span>
                        </CommandItem>
                        <CommandItem value="settings" onSelect={handleSelect}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Paramètres</span>
                        </CommandItem>
                      </CommandGroup>
                      
                      <CommandGroup heading="Actions">
                        <CommandItem value="new-invoice" onSelect={handleSelect}>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Créer une nouvelle facture</span>
                        </CommandItem>
                      </CommandGroup>
                    </div>
                  </>
                ) : (
                  <>
                    <CommandEmpty>Aucun résultat trouvé pour "{searchTerm}".</CommandEmpty>
                    
                    {Array.isArray(filteredInvoices) && filteredInvoices.length > 0 && (
                      <CommandGroup heading="Factures">
                        {filteredInvoices.map((invoice) => (
                          <CommandItem 
                            key={invoice.id} 
                            value={`invoice-${invoice.id}`} 
                            onSelect={handleSelect}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            <div className="flex-1">
                              <span>{invoice.number}</span>
                              <span className="ml-2 text-muted-foreground">- {invoice.clientName}</span>
                            </div>
                            <span className="text-muted-foreground">{invoice.amount}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    
                    {Array.isArray(filteredClients) && filteredClients.length > 0 && (
                      <CommandGroup heading="Clients">
                        {filteredClients.map((client) => (
                          <CommandItem 
                            key={client.id} 
                            value={`client-${client.id}`} 
                            onSelect={handleSelect}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <div className="flex-1">
                              <span>{client.name}</span>
                              <span className="ml-2 text-muted-foreground">- {client.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
                
                {!searchTerm && (
                  <div className="border-t mt-2 pt-2 px-2 text-xs text-muted-foreground flex items-center">
                    <span className="mr-1">🔍</span>
                    Conseils de recherche
                  </div>
                )}
              </div>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
