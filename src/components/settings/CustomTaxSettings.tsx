import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronsUpDown, Plus, Search, Trash } from "lucide-react";
import { cn, formatTaxRate } from "@/lib/utils";
import { CustomTaxConfiguration, TAX_TYPES } from "@/types/tax";
import { getFilteredCountries, getContinents, CountryData } from "@/data/countriesByContinent";

interface CustomTaxSettingsProps {
  defaultValue: number | string;
  defaultConfig?: CustomTaxConfiguration;
  onChange: (value: number, regionKey?: string, customConfig?: CustomTaxConfiguration) => void;
  showLabel?: boolean;
}

export function CustomTaxSettings({
  defaultValue = 20,
  defaultConfig,
  onChange,
  showLabel = true
}: CustomTaxSettingsProps) {
  // États principaux
  const [customTax, setCustomTax] = useState<CustomTaxConfiguration>({
    name: defaultConfig?.name || "Custom Tax",
    rate: defaultConfig?.rate || (typeof defaultValue === "string" ? parseFloat(defaultValue) || 20 : defaultValue),
    country: defaultConfig?.country || "",
    countryName: defaultConfig?.countryName || "",
    taxType: defaultConfig?.taxType || "",
    mainRate: typeof defaultValue === "string" ? parseFloat(defaultValue) || 20 : defaultValue,
    additionalRates: defaultConfig?.additionalRates || []
  });
  
  // États pour l'interface utilisateur
  const [step, setStep] = useState<"country" | "taxType" | "taxRate" | "additionalRates">(
    defaultConfig?.country ? (
      defaultConfig?.taxType ? (
        "taxRate"
      ) : "taxType"
    ) : "country"
  );
  
  // État pour la sélection de pays
  const [searchValue, setSearchValue] = useState("");
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [continents, setContinents] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryData[]>([]);
  
  // État pour le nouveau taux additionnel
  const [newRate, setNewRate] = useState<{name: string, rate: number}>({
    name: "",
    rate: 5
  });
  
  // États pour les interactions utilisateur
  const [showAdditionalRateForm, setShowAdditionalRateForm] = useState(false);

  // Chargement initial des pays filtrés
  useEffect(() => {
    const allCountries = getFilteredCountries();
    const allContinents = getContinents();
    
    setCountries(allCountries);
    setContinents(allContinents);
    setFilteredCountries(allCountries);
  }, []);

  // Effet pour mettre à jour l'état local quand les props changent
  useEffect(() => {
    if (defaultConfig) {
      setCustomTax({
        ...defaultConfig,
        mainRate: typeof defaultValue === "string" ? parseFloat(defaultValue) || 20 : defaultValue
      });
      
      // Définir l'étape en fonction des données existantes
      if (defaultConfig.country) {
        if (defaultConfig.taxType) {
          setStep("taxRate");
        } else {
          setStep("taxType");
        }
      }
    }
  }, [defaultConfig, defaultValue]);

  // Filtrer les pays par la recherche
  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredCountries(countries);
      return;
    }

    const filtered = countries.filter(country => 
      country.name.toLowerCase().includes(searchValue.toLowerCase()) || 
      country.code.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredCountries(filtered);
  }, [searchValue, countries]);

  // Mettre à jour le taux principal
  const handleMainRateChange = (value: number[]) => {
    const newRate = value[0];
    const updatedConfig = { 
      ...customTax, 
      mainRate: newRate,
      rate: newRate // Also update the rate property to match mainRate
    };
    setCustomTax(updatedConfig);
    onChange(newRate, undefined, updatedConfig);
  };

  // Mettre à jour le taux principal via l'input
  const handleMainRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    const value = valueStr === '' ? 0 : parseFloat(valueStr);
    
    if (!isNaN(value) && value >= 0 && value <= 100) {
      const updatedConfig = { 
        ...customTax, 
        mainRate: value,
        rate: value // Also update the rate property
      };
      setCustomTax(updatedConfig);
      onChange(value, undefined, updatedConfig);
    }
  };

  // Gérer la sélection du pays
  const handleCountrySelect = (countryCode: string) => {
    const selectedCountry = countries.find(c => c.code === countryCode);
    if (selectedCountry) {
      const updatedConfig = {
        ...customTax,
        country: countryCode,
        countryName: selectedCountry.name
      };
      setCustomTax(updatedConfig);
      onChange(customTax.mainRate, undefined, updatedConfig);
      setStep("taxType"); // Passer à l'étape suivante
    }
  };

  // Gérer le changement de type de taxe
  const handleTaxTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    const updatedConfig = { ...customTax, taxType: value };
    setCustomTax(updatedConfig);
    onChange(customTax.mainRate, undefined, updatedConfig);
  };

  // Valider le type de taxe et passer à l'étape suivante
  const handleTaxTypeConfirm = () => {
    if (customTax.taxType.trim() !== '') {
      setStep("taxRate");
    }
  };

  // Confirmer le taux principal et passer aux taux additionnels
  const handleMainRateConfirm = () => {
    setStep("additionalRates");
  };

  // Ajouter un taux additionnel
  const handleAddRate = () => {
    if (newRate.name.trim() === "") return;
    
    const additionalRates = [
      ...(customTax.additionalRates || []),
      { name: newRate.name, rate: newRate.rate }
    ];
    
    const updatedConfig = { 
      ...customTax, 
      additionalRates,
      // Ensure these required properties are set
      name: customTax.name || customTax.taxType || "Custom Tax",
      rate: customTax.mainRate
    };
    setCustomTax(updatedConfig);
    onChange(customTax.mainRate, undefined, updatedConfig);
    
    // Réinitialiser le formulaire et le masquer
    setNewRate({ name: "", rate: 5 });
    setShowAdditionalRateForm(false);
  };

  // Supprimer un taux additionnel
  const handleDeleteRate = (index: number) => {
    const additionalRates = [...(customTax.additionalRates || [])];
    additionalRates.splice(index, 1);
    
    const updatedConfig = { ...customTax, additionalRates };
    setCustomTax(updatedConfig);
    onChange(customTax.mainRate, undefined, updatedConfig);
  };

  // Mettre à jour le nom du nouveau taux
  const handleNewRateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRate({ ...newRate, name: e.target.value });
  };

  // Mettre à jour la valeur du nouveau taux
  const handleNewRateValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setNewRate({ ...newRate, rate: value });
    }
  };

  // Gérer la recherche des pays
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="space-y-6">
      {showLabel && (
        <Label htmlFor="custom-tax" className="text-base font-medium">Configuration de taxe personnalisée</Label>
      )}
      
      <div className="space-y-4">
        {/* Étape 1: Sélection du pays */}
        <div className="space-y-2">
          <Label htmlFor="country-select">Pays</Label>
          <Select
            value={customTax.country}
            onValueChange={handleCountrySelect}
          >
            <SelectTrigger id="country-select" className="w-full">
              <SelectValue placeholder="Sélectionner un pays..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <div className="sticky top-0 p-2 bg-background z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un pays..."
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="pl-8"
                  />
                </div>
              </div>
              {continents.map((continent) => {
                // Filtrer les pays par continent et par recherche
                const continentCountries = filteredCountries.filter(
                  country => country.continent === continent
                );
                
                // Ne pas afficher le groupe s'il n'y a pas de pays correspondants
                if (continentCountries.length === 0) return null;
                
                return (
                  <SelectGroup key={continent}>
                    <SelectLabel>{continent}</SelectLabel>
                    {continentCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center justify-between w-full">
                          <span>{country.name}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            {country.code}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
              {filteredCountries.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Aucun pays trouvé
                </div>
              )}
            </SelectContent>
          </Select>
          {customTax.countryName && (
            <p className="text-sm text-muted-foreground mt-1">
              Pays sélectionné: <span className="font-medium">{customTax.countryName}</span>
            </p>
          )}
        </div>

        {/* Étape 2: Saisie du type de taxe personnalisé */}
        {step !== "country" && (
          <div className="space-y-2">
            <Label htmlFor="tax-type">Type de taxe</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="tax-type"
                placeholder="Entrez un nom pour ce type de taxe (ex: TVA, GST, etc.)"
                value={customTax.taxType}
                onChange={handleTaxTypeChange}
                className="flex-1"
              />
              {step === "taxType" && (
                <Button 
                  onClick={handleTaxTypeConfirm}
                  disabled={!customTax.taxType.trim()}
                  type="button"
                >
                  Suivant
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Étape 3: Taux principal */}
        {step !== "country" && step !== "taxType" && (
          <div className="space-y-2 pt-4 animate-in fade-in">
            <Label htmlFor="main-tax-rate">Taux principal</Label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Slider
                  id="main-tax-rate-slider"
                  defaultValue={[customTax.mainRate]}
                  value={[customTax.mainRate]}
                  max={50}
                  step={0.1}
                  onValueChange={handleMainRateChange}
                />
              </div>
              <div className="w-20">
                <Input
                  id="main-tax-rate-input"
                  type="number"
                  value={customTax.mainRate}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={handleMainRateInputChange}
                  className="text-right"
                />
              </div>
              <span className="text-sm font-medium">%</span>
              {step === "taxRate" && (
                <Button 
                  onClick={handleMainRateConfirm}
                  type="button"
                >
                  Suivant
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Étape 4: Taux additionnels */}
        {step === "additionalRates" && (
          <div className="space-y-4 pt-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <Label>Taux additionnels</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAdditionalRateForm(!showAdditionalRateForm)}
              >
                {showAdditionalRateForm ? "Annuler" : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> 
                    Ajouter un taux
                  </>
                )}
              </Button>
            </div>
            
            {/* Liste des taux additionnels */}
            {customTax.additionalRates && customTax.additionalRates.length > 0 && (
              <div className="space-y-2">
                {customTax.additionalRates.map((rate, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{rate.name}</p>
                    </div>
                    <Badge variant="outline" className="px-2 min-w-[50px] text-center">
                      {formatTaxRate(rate.rate)}%
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2" 
                      onClick={() => handleDeleteRate(index)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire pour ajouter un taux */}
            {showAdditionalRateForm && (
              <div className="border p-3 rounded-md space-y-3 animate-in fade-in">
                <h4 className="font-medium">Nouveau taux</h4>
                <div className="flex items-end space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-rate-name">Nom du taux</Label>
                    <Input
                      id="new-rate-name"
                      placeholder="Ex: Taux réduit"
                      value={newRate.name}
                      onChange={handleNewRateNameChange}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label htmlFor="new-rate-value">Taux (%)</Label>
                    <Input
                      id="new-rate-value"
                      type="number"
                      value={newRate.rate}
                      min={0}
                      max={100}
                      step={0.1}
                      onChange={handleNewRateValueChange}
                      className="text-right"
                    />
                  </div>
                  <Button 
                    onClick={handleAddRate}
                    disabled={newRate.name.trim() === ""}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
            
            {!showAdditionalRateForm && customTax.additionalRates?.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
                Aucun taux additionnel défini
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomTaxSettings;
