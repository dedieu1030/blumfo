
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
  // État principal pour la configuration de taxe personnalisée
  const [customTax, setCustomTax] = useState<CustomTaxConfiguration>({
    country: defaultConfig?.country || "",
    countryName: defaultConfig?.countryName || "",
    taxType: defaultConfig?.taxType || "vat",
    mainRate: typeof defaultValue === "string" ? parseFloat(defaultValue) || 20 : defaultValue,
    additionalRates: defaultConfig?.additionalRates || []
  });
  
  // État pour la sélection de pays
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [continents, setContinents] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryData[]>([]);
  
  // État pour le nouveau taux additionnel
  const [newRate, setNewRate] = useState<{name: string, rate: number}>({
    name: "",
    rate: 5
  });

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
    const updatedConfig = { ...customTax, mainRate: newRate };
    setCustomTax(updatedConfig);
    onChange(newRate, undefined, updatedConfig);
  };

  // Mettre à jour le taux principal via l'input
  const handleMainRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    const value = valueStr === '' ? 0 : parseFloat(valueStr);
    
    if (!isNaN(value) && value >= 0 && value <= 100) {
      const updatedConfig = { ...customTax, mainRate: value };
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
    }
  };

  // Gérer le changement de type de taxe
  const handleTaxTypeChange = (value: string) => {
    const updatedConfig = { ...customTax, taxType: value };
    setCustomTax(updatedConfig);
    onChange(customTax.mainRate, undefined, updatedConfig);
  };

  // Ajouter un taux additionnel
  const handleAddRate = () => {
    if (newRate.name.trim() === "") return;
    
    const additionalRates = [
      ...(customTax.additionalRates || []),
      { name: newRate.name, rate: newRate.rate }
    ];
    
    const updatedConfig = { ...customTax, additionalRates };
    setCustomTax(updatedConfig);
    onChange(customTax.mainRate, undefined, updatedConfig);
    
    // Réinitialiser le formulaire
    setNewRate({ name: "", rate: 5 });
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
        {/* Sélection du pays */}
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
        </div>

        {/* Sélection du type de taxe */}
        <div className="space-y-2">
          <Label htmlFor="tax-type">Type de taxe</Label>
          <Select
            value={customTax.taxType}
            onValueChange={handleTaxTypeChange}
          >
            <SelectTrigger id="tax-type" className="w-full">
              <SelectValue placeholder="Sélectionner un type de taxe" />
            </SelectTrigger>
            <SelectContent>
              {TAX_TYPES.map(taxType => (
                <SelectItem key={taxType.id} value={taxType.id}>
                  {taxType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Taux principal */}
        <div className="space-y-2 pt-4">
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
          </div>
        </div>

        {/* Taux additionnels */}
        <div className="space-y-4 pt-4">
          <Label>Taux additionnels</Label>
          
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
              variant="outline" 
              size="icon"
              onClick={handleAddRate}
              disabled={newRate.name.trim() === ""}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomTaxSettings;
