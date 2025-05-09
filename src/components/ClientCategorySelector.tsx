import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Tags, Pencil, PlusCircle, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface ClientCategorySelectorProps {
  selectedCategoryIds: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  isLoading?: boolean;
}

export function ClientCategorySelector({
  selectedCategoryIds,
  onCategoriesChange,
  isLoading = false,
}: ClientCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedCategoryIds);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1"); // Default color (purple)
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Predefined colors for categories
  const colorOptions = [
    { name: "Violet", value: "#6366F1" },
    { name: "Bleu", value: "#3B82F6" },
    { name: "Cyan", value: "#06B6D4" },
    { name: "Vert", value: "#10B981" },
    { name: "Citron", value: "#84CC16" },
    { name: "Jaune", value: "#EAB308" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Rouge", value: "#EF4444" },
    { name: "Rose", value: "#EC4899" },
    { name: "Gris", value: "#6B7280" },
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('client_categories')
          .select('id, name, color')
          .order('name');
        
        if (error) throw error;
        
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle checkbox change
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelected(prev => [...prev, categoryId]);
    } else {
      setSelected(prev => prev.filter(id => id !== categoryId));
    }
  };

  // Apply selected categories
  const handleApplyCategories = () => {
    onCategoriesChange(selected);
    setIsModalOpen(false);
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour la catégorie",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }
      
      const { data, error } = await supabase
        .from('client_categories')
        .insert({
          name: newCategoryName.trim(),
          color: newCategoryColor,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: "Catégorie créée",
          description: `La catégorie "${data.name}" a été créée avec succès`
        });
        
        setCategories(prev => [...prev, data as Category]);
        setSelected(prev => [...prev, data.id]);
        setNewCategoryName("");
        setIsNewCategoryModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading || !isLoaded}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Tags className="h-4 w-4 mr-2" />
        )}
        Gérer les catégories
      </Button>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gérer les catégories</DialogTitle>
          </DialogHeader>
          
          {!isLoaded ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Aucune catégorie créée. Créez votre première catégorie.
              </p>
              <Button onClick={() => setIsNewCategoryModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvelle catégorie
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selected.includes(category.id)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="flex items-center cursor-pointer flex-1"
                    >
                      {category.color && (
                        <span
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></span>
                      )}
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle catégorie
                </Button>
                
                <Button onClick={handleApplyCategories}>
                  <Check className="h-4 w-4 mr-2" />
                  Appliquer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog for creating new category */}
      <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom de la catégorie</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: VIP, PME, Particulier..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`h-6 w-6 rounded-full cursor-pointer ${
                      newCategoryColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-primary' 
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewCategoryColor(color.value)}
                    title={color.name}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewCategoryModalOpen(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
