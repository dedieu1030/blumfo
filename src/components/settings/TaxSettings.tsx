import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Check, Flag, BarChart4, Save } from "lucide-react";
import { TaxConfiguration, TaxRate, TaxType } from "@/types/tax";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getTaxConfigurations,
  createTaxConfiguration,
  updateTaxConfiguration,
  deleteTaxConfiguration,
  setDefaultTaxConfiguration
} from "@/services/taxService";
import { useToast } from "@/hooks/use-toast";

// Liste des pays pour le sélecteur
const countries = [
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "US", name: "États-Unis" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "DE", name: "Allemagne" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
  { code: "GB", name: "Royaume-Uni" },
];

// Régions pour certains pays
const regions: Record<string, { code: string; name: string }[]> = {
  CA: [
    { code: "QC", name: "Québec" },
    { code: "ON", name: "Ontario" },
    { code: "BC", name: "Colombie-Britannique" },
    { code: "AB", name: "Alberta" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "Nouveau-Brunswick" },
    { code: "NL", name: "Terre-Neuve-et-Labrador" },
    { code: "NS", name: "Nouvelle-Écosse" },
    { code: "PE", name: "Île-du-Prince-Édouard" },
    { code: "SK", name: "Saskatchewan" },
    { code: "NT", name: "Territoires du Nord-Ouest" },
    { code: "NU", name: "Nunavut" },
    { code: "YT", name: "Yukon" }
  ],
  US: [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "Californie" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    // Autres états américains...
    { code: "NY", name: "New York" },
    { code: "TX", name: "Texas" }
  ]
};

// Types de taxes
const taxTypes: { value: TaxType; label: string }[] = [
  { value: 'vat', label: 'TVA (Taxe sur la valeur ajoutée)' },
  { value: 'gst', label: 'GST (Taxe sur les produits et services)' },
  { value: 'pst', label: 'PST (Taxe de vente provinciale)' },
  { value: 'hst', label: 'HST (Taxe de vente harmonisée)' },
  { value: 'qst', label: 'QST (Taxe de vente du Québec)' },
  { value: 'sales', label: 'Taxe de vente' },
  { value: 'other', label: 'Autre' }
];

export function TaxSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("configurations");
  const [configurations, setConfigurations] = useState<TaxConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [newConfigDialogOpen, setNewConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaxConfiguration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  
  // État pour le formulaire de configuration fiscale
  const [formData, setFormData] = useState<Partial<TaxConfiguration>>({
    name: "",
    description: "",
    countryCode: "FR",
    regionCode: undefined,
    isDefault: false,
    taxRates: []
  });

  // Charger les configurations fiscales
  const loadConfigurations = async () => {
    setLoading(true);
    const configs = await getTaxConfigurations();
    setConfigurations(configs);
    setLoading(false);
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Gestionnaires d'événements pour le formulaire
  const handleInputChange = (field: keyof TaxConfiguration, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTaxRateChange = (index: number, field: keyof TaxRate, value: any) => {
    setFormData(prev => {
      const updatedRates = [...(prev.taxRates || [])];
      
      // Convert string to number for numeric fields
      if (field === 'rate') {
        updatedRates[index] = { 
          ...updatedRates[index], 
          [field]: typeof value === 'string' ? parseFloat(value) || 0 : value 
        };
      } else {
        updatedRates[index] = { ...updatedRates[index], [field]: value };
      }
      
      return { ...prev, taxRates: updatedRates };
    });
  };

  const addTaxRate = () => {
    setFormData(prev => {
      const displayOrder = prev.taxRates?.length || 0;
      return {
        ...prev,
        taxRates: [
          ...(prev.taxRates || []),
          {
            id: `temp-${Date.now()}`,
            name: "",
            rate: 0,
            taxType: 'vat',
            isCompound: false,
            displayOrder
          }
        ]
      };
    });
  };

  const removeTaxRate = (index: number) => {
    setFormData(prev => {
      const updatedRates = [...(prev.taxRates || [])];
      updatedRates.splice(index, 1);
      // Réorganiser les ordres d'affichage
      updatedRates.forEach((rate, i) => {
        rate.displayOrder = i;
      });
      return { ...prev, taxRates: updatedRates };
    });
  };

  const openNewConfigDialog = () => {
    setFormData({
      name: "",
      description: "",
      countryCode: "FR",
      regionCode: undefined,
      isDefault: false,
      taxRates: []
    });
    setEditingConfig(null);
    setNewConfigDialogOpen(true);
  };

  const openEditDialog = (config: TaxConfiguration) => {
    setFormData({
      id: config.id,
      name: config.name,
      description: config.description,
      countryCode: config.countryCode,
      regionCode: config.regionCode,
      isDefault: config.isDefault,
      taxRates: [...config.taxRates]
    });
    setEditingConfig(config);
    setNewConfigDialogOpen(true);
  };

  const handleSaveConfiguration = async () => {
    if (!formData.name || !formData.countryCode) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    let success = false;

    if (editingConfig) {
      // Mise à jour
      success = await updateTaxConfiguration(formData as TaxConfiguration);
    } else {
      // Création
      const id = await createTaxConfiguration(formData as Omit<TaxConfiguration, 'id'>);
      success = !!id;
    }

    if (success) {
      setNewConfigDialogOpen(false);
      await loadConfigurations();
    }
    
    setLoading(false);
  };

  const confirmDelete = (id: string) => {
    setConfigToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfiguration = async () => {
    if (!configToDelete) return;
    
    setLoading(true);
    const success = await deleteTaxConfiguration(configToDelete);
    
    if (success) {
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
      await loadConfigurations();
    }
    
    setLoading(false);
  };

  const handleSetDefault = async (id: string) => {
    setLoading(true);
    const success = await setDefaultTaxConfiguration(id);
    
    if (success) {
      await loadConfigurations();
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration des taxes</h2>
          <p className="text-muted-foreground">
            Gérez les configurations fiscales pour différentes régions et types de taxes
          </p>
        </div>
        <Button
          onClick={openNewConfigDialog}
          className="bg-violet hover:bg-violet/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle configuration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="configurations">Configurations fiscales</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-6 w-6 border-2 border-violet border-t-transparent rounded-full"></div>
            </div>
          ) : configurations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground text-center mb-4">
                  Aucune configuration fiscale trouvée
                </p>
                <Button onClick={openNewConfigDialog}>
                  Créer une configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {configurations.map((config) => (
                <Card key={config.id} className={config.isDefault ? "border-violet" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{config.name}</CardTitle>
                        <CardDescription>
                          {countries.find(c => c.code === config.countryCode)?.name || config.countryCode}
                          {config.regionCode && regions[config.countryCode] && 
                            ` - ${regions[config.countryCode].find(r => r.code === config.regionCode)?.name || config.regionCode}`
                          }
                        </CardDescription>
                      </div>
                      {config.isDefault && (
                        <Badge className="bg-violet">Par défaut</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Taux de taxes:</h4>
                        <ul className="space-y-1">
                          {config.taxRates.sort((a, b) => a.displayOrder - b.displayOrder).map((rate) => (
                            <li key={rate.id} className="text-sm flex justify-between">
                              <span>{rate.name} ({taxTypes.find(t => t.value === rate.taxType)?.label.split(' ')[0]})</span>
                              <span className="font-medium">{rate.rate}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div>
                      {!config.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(config.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Définir par défaut
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(config)}
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(config.id)}
                        disabled={config.isDefault}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Rapports fiscaux</CardTitle>
              <CardDescription>
                Générez des rapports détaillés sur les taxes perçues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="report-date-from">Date de début</Label>
                  <Input type="date" id="report-date-from" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="report-date-to">Date de fin</Label>
                  <Input type="date" id="report-date-to" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="tax-type-filter">Type de taxe</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {taxTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="country-filter">Pays</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button className="bg-violet hover:bg-violet/90">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Générer le rapport
                </Button>
                <Button variant="outline">
                  <Flag className="mr-2 h-4 w-4" />
                  Exporter les données
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogue de création/modification de configuration fiscale */}
      <Dialog open={newConfigDialogOpen} onOpenChange={setNewConfigDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Modifier la configuration fiscale" : "Nouvelle configuration fiscale"}
            </DialogTitle>
            <DialogDescription>
              {editingConfig 
                ? "Modifiez les détails de la configuration fiscale existante"
                : "Créez une nouvelle configuration fiscale pour une région ou un pays spécifique"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="config-name">Nom de la configuration</Label>
                <Input 
                  id="config-name" 
                  value={formData.name || ''} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="config-country">Pays</Label>
                <Select 
                  value={formData.countryCode} 
                  onValueChange={(value) => {
                    handleInputChange('countryCode', value);
                    handleInputChange('regionCode', undefined);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="config-region">Région (optionnel)</Label>
                <Select 
                  value={formData.regionCode} 
                  onValueChange={(value) => handleInputChange('regionCode', value)}
                  disabled={!regions[formData.countryCode || '']}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les régions</SelectItem>
                    {regions[formData.countryCode || '']?.map((region) => (
                      <SelectItem key={region.code} value={region.code}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="config-description">Description</Label>
                <Textarea 
                  id="config-description" 
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-2">
                <Switch 
                  id="config-default"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                />
                <Label htmlFor="config-default">Configuration par défaut</Label>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold">Taux de taxes</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={addTaxRate}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un taux
                </Button>
              </div>
              
              {(formData.taxRates || []).length === 0 ? (
                <div className="text-center p-4 border rounded-md text-muted-foreground">
                  Aucun taux de taxe défini. Cliquez sur "Ajouter un taux" pour commencer.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.taxRates?.map((rate, index) => (
                    <div key={rate.id} className="grid grid-cols-12 gap-2 items-center border p-3 rounded-md">
                      <div className="col-span-3">
                        <Label className="text-xs">Nom</Label>
                        <Input 
                          value={rate.name} 
                          onChange={(e) => handleTaxRateChange(index, 'name', e.target.value)}
                          size="sm"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs">Taux (%)</Label>
                        <Input 
                          type="number" 
                          value={rate.rate} 
                          onChange={(e) => handleTaxRateChange(index, 'rate', parseFloat(e.target.value))}
                          step="0.01"
                          min="0"
                          max="100"
                        />
                      </div>
                      
                      <div className="col-span-4">
                        <Label className="text-xs">Type</Label>
                        <Select 
                          value={rate.taxType} 
                          onValueChange={(value) => handleTaxRateChange(index, 'taxType', value as TaxType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {taxTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2 mt-4">
                          <Switch 
                            id={`tax-compound-${index}`}
                            checked={rate.isCompound}
                            onCheckedChange={(checked) => handleTaxRateChange(index, 'isCompound', checked)}
                          />
                          <Label htmlFor={`tax-compound-${index}`} className="text-xs">Composé</Label>
                        </div>
                      </div>
                      
                      <div className="col-span-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTaxRate(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewConfigDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-violet hover:bg-violet/90" 
              onClick={handleSaveConfiguration}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Traitement...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingConfig ? "Mettre à jour" : "Enregistrer"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette configuration fiscale ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfiguration}
              disabled={loading}
            >
              {loading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
