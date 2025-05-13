
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronsUpDown, Plus, Trash, Search } from "lucide-react";
import { cn, formatTaxRate } from "@/lib/utils";
import { CustomTaxConfiguration, COUNTRIES, TAX_TYPES } from "@/types/tax";
import { taxZonesData } from "@/data/taxData";

interface CustomTaxSettingsProps {
  defaultValue: number | string;
  defaultConfig?: CustomTaxConfiguration;
  onChange: (value: number, regionKey?: string, customConfig?: CustomTaxConfiguration) => void;
  showLabel?: boolean;
}

// Fonction qui récupère tous les codes de pays déjà présents dans les zones fiscales prédéfinies
const getExistingCountryCodes = (): string[] => {
  return taxZonesData.flatMap(zone => 
    zone.countries.map(country => country.countryCode)
  );
};

// Organiser les pays par continent
const organizeCountriesByContinent = (countries) => {
  const continents = {
    "Europe": [],
    "Amérique du Nord": [], 
    "Amérique du Sud": [],
    "Asie": [],
    "Afrique": [],
    "Océanie": []
  };

  // Liste des pays européens (codes ISO)
  const europeanCountries = [
    "AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR", 
    "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU", 
    "IS", "IE", "IT", "KZ", "XK", "LV", "LI", "LT", "LU", "MK", 
    "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT", "RO", "RU", 
    "SM", "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA", "GB", "VA"
  ];

  // Liste des pays d'Amérique du Nord
  const northAmericaCountries = [
    "CA", "US", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA",
    "BS", "CU", "JM", "HT", "DO", "PR", "BM", "BB", "AG", "DM",
    "LC", "VC", "GD", "TT", "KN"
  ];

  // Liste des pays d'Amérique du Sud
  const southAmericaCountries = [
    "AR", "BO", "BR", "CL", "CO", "EC", "GY", "PY", "PE", "SR", 
    "UY", "VE"
  ];

  // Liste des pays d'Asie
  const asianCountries = [
    "AF", "SA", "AM", "AZ", "BH", "BD", "BT", "MM", "BN", "KH",
    "CN", "CY", "KP", "KR", "AE", "GE", "IN", "ID", "IR", "IQ",
    "IL", "JP", "JO", "KZ", "KG", "KW", "LA", "LB", "MY", "MV",
    "MN", "NP", "OM", "UZ", "PK", "PS", "PH", "QA", "RU", "SG",
    "LK", "SY", "TJ", "TW", "TH", "TL", "TR", "TM", "VN", "YE"
  ];

  // Liste des pays d'Océanie
  const oceaniaCountries = [
    "AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS",
    "SB", "TO", "TV", "VU"
  ];

  // Tous les autres sont en Afrique par défaut (simplification)
  
  countries.forEach(country => {
    if (europeanCountries.includes(country.code)) {
      continents["Europe"].push(country);
    } else if (northAmericaCountries.includes(country.code)) {
      continents["Amérique du Nord"].push(country);
    } else if (southAmericaCountries.includes(country.code)) {
      continents["Amérique du Sud"].push(country);
    } else if (asianCountries.includes(country.code)) {
      continents["Asie"].push(country);
    } else if (oceaniaCountries.includes(country.code)) {
      continents["Océanie"].push(country);
    } else {
      continents["Afrique"].push(country);
    }
  });

  return continents;
};

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
  
  // État pour la recherche de pays
  const [searchValue, setSearchValue] = useState("");
  
  // État pour le nouveau taux additionnel
  const [newRate, setNewRate] = useState<{name: string, rate: number}>({
    name: "",
    rate: 5
  });

  // Effet pour mettre à jour l'état local quand les props changent
  useEffect(() => {
    if (defaultConfig) {
      setCustomTax({
        ...defaultConfig,
        mainRate: typeof defaultValue === "string" ? parseFloat(defaultValue) || 20 : defaultValue
      });
    }
  }, [defaultConfig, defaultValue]);

  // Codes des pays déjà présents dans les régions fiscales prédéfinies
  const existingCountryCodes = getExistingCountryCodes();

  // Filtrer les pays pour exclure ceux déjà disponibles dans les régions fiscales
  const availableCountries = COUNTRIES.filter(country => 
    !existingCountryCodes.includes(country.code)
  );

  // Filtrer les pays par la recherche
  const filteredCountries = searchValue 
    ? availableCountries.filter(country => 
        country.name.toLowerCase().includes(searchValue.toLowerCase()) || 
        country.code.toLowerCase().includes(searchValue.toLowerCase())
      )
    : availableCountries;

  // Organiser les pays par continent
  const countriesByContinent = organizeCountriesByContinent(filteredCountries);

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
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
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

  return (
    <div className="space-y-6">
      {showLabel && (
        <Label htmlFor="custom-tax" className="text-base font-medium">Configuration de taxe personnalisée</Label>
      )}
      
      <div className="space-y-4">
        {/* Sélection du pays avec barre de recherche */}
        <div className="space-y-2">
          <Label htmlFor="country-select">Pays</Label>
          
          {/* Barre de recherche pour filtrer les pays */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un pays..."
              className="pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          
          {/* Sélecteur de pays */}
          <Select
            value={customTax.country}
            onValueChange={handleCountrySelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un pays..." />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {Object.entries(countriesByContinent).map(([continent, countries]) => 
                countries.length > 0 ? (
                  <SelectGroup key={continent}>
                    <SelectLabel>{continent}</SelectLabel>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null
              )}
              {!Object.values(countriesByContinent).some(group => group.length > 0) && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Aucun pays trouvé pour "{searchValue}"
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
