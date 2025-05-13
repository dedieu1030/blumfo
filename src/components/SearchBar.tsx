
import { useState, useEffect, useRef } from "react";
import { Search, FileText, Users, Settings, Plus, X } from "lucide-react";
import { 
  Command,
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Filtrer les données en fonction du terme de recherche
  const filteredInvoices = searchTerm 
    ? mockInvoices.filter(invoice => 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];
  
  const filteredClients = searchTerm 
    ? mockClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Ouvrir la boîte de dialogue avec le raccourci clavier Cmd+K ou Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    
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

  // Gérer l'ouverture du popover sans perdre le focus
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  // Capter le clic sur l'input et maintenir le popover ouvert
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!open) {
      setOpen(true);
    }
    // Ne pas changer le focus, laisser l'input actif
  };

  // Détermine le texte du placeholder en fonction de la taille de l'écran
  const responsivePlaceholder = isMobile ? "Rechercher..." : placeholder;

  // Classes personnalisées pour le PopoverContent selon le device
  const popoverContentClasses = isMobile 
    ? "p-0 w-[95vw] max-w-[95vw] bg-popover border shadow-lg fixed-position data-[state=closed]:animate-none data-[state=open]:animate-none"
    : "p-0 w-[330px] bg-popover border shadow-lg";

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div 
            className={`flex items-center w-full h-10 rounded-md border border-input bg-background px-3 py-2 cursor-pointer`}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
              setOpen(true);
            }}
          >
            <Search className="h-4 w-4 mr-1.5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground text-sm overflow-hidden text-ellipsis min-w-0"
              placeholder={responsivePlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={handleInputClick}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              inputMode="search"
              type="search"
              style={{ fontSize: "16px" }}  // Taille minimale pour éviter le zoom sur iOS
            />
            {searchTerm && (
              <button 
                className="flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {/* Affiche le raccourci clavier de façon compacte sur mobile */}
            <kbd className={`ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ${isMobile ? 'opacity-70 px-1' : 'opacity-100'}`}>
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className={popoverContentClasses}
          align={isMobile ? "center" : "start"}
          sideOffset={isMobile ? 8 : 5}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false} className="CommandWrapper">
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé pour "{searchTerm}".</CommandEmpty>
              
              {searchTerm ? (
                <>
                  {filteredInvoices.length > 0 && (
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
                  
                  {filteredClients.length > 0 && (
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

                  {filteredInvoices.length === 0 && filteredClients.length === 0 && (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      Aucun résultat trouvé pour "{searchTerm}"
                    </div>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
