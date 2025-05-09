
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  color?: string; // Optional for compatibility
}

interface ClientCategorySelectorProps {
  onCategorySelect: (category: Category | null) => void;
  selectedId?: string;
}

export function ClientCategorySelector({ onCategorySelect, selectedId }: ClientCategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const { toast } = useToast();

  // Fetch client groups (using them as categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('client_groups').select('*');
        
        if (error) {
          console.error('Error fetching client groups:', error);
          return;
        }
        
        // Map client_groups to Category interface
        const mappedCategories: Category[] = data.map(group => ({
          id: group.id,
          name: group.name,
          color: 'gray' // Default color since client_groups doesn't have color
        }));
        
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Find the selected category name
  const selectedCategory = categories.find(category => category.id === selectedId);

  // Handle adding or editing a category
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour ce groupe",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing && currentCategory) {
        // Update existing group
        const { error } = await supabase
          .from('client_groups')
          .update({ name: categoryName })
          .eq('id', currentCategory.id);
          
        if (error) throw error;
        
        // Update local state
        setCategories(categories.map(cat => 
          cat.id === currentCategory.id ? { ...cat, name: categoryName } : cat
        ));
        
        toast({
          title: "Groupe modifié",
          description: `Le groupe ${categoryName} a été mis à jour`
        });
      } else {
        // Create new group
        const { data, error } = await supabase
          .from('client_groups')
          .insert({ name: categoryName })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Add to local state
          const newCategory: Category = {
            id: data[0].id,
            name: data[0].name,
            color: 'gray'
          };
          
          setCategories([...categories, newCategory]);
          
          toast({
            title: "Groupe créé",
            description: `Le groupe ${categoryName} a été créé`
          });
        }
      }
      
      // Reset and close dialog
      setIsDialogOpen(false);
      setCategoryName("");
      setIsEditing(false);
      setCurrentCategory(null);
      
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde du groupe",
        variant: "destructive"
      });
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_groups')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setCategories(categories.filter(cat => cat.id !== id));
      
      // If deleted category was selected, clear selection
      if (selectedId === id) {
        onCategorySelect(null);
      }
      
      toast({
        title: "Groupe supprimé",
        description: "Le groupe a été supprimé avec succès"
      });
      
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du groupe",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedCategory?.name || "Sélectionner un groupe"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Rechercher un groupe..." />
            <CommandList>
              <CommandEmpty>Aucun groupe trouvé.</CommandEmpty>
              <CommandGroup heading="Groupes">
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onCategorySelect(category);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{category.name}</span>
                    <div className="ml-auto flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                          setCurrentCategory(category);
                          setCategoryName(category.name);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setIsEditing(false);
                    setCategoryName("");
                    setIsDialogOpen(true);
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un nouveau groupe
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier le groupe" : "Créer un groupe"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSaveCategory}>
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
