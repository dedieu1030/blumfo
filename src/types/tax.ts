export interface TaxZone {
  id: string;
  name: string;
  countryCode?: string;
  countries: TaxCountry[];
}

export interface TaxCountry {
  id: string;
  name: string;
  countryCode: string;
  regions: TaxRegionData[];
}

export interface TaxRegionData {
  id: string;
  name: string;
  code: string;
  taxType: "gst" | "gst-pst" | "gst-qst" | "hst" | "sales-tax" | "no-tax" | 
           "iva-standard" | "iva-reduced" | "iva-zero" | "iva-exempt" | "iva-special" |
           "vat-standard" | "vat-reduced" | "vat-super-reduced" | "vat-parking" | "vat-exempt";
  gstRate?: number;
  pstRate?: number;
  qstRate?: number;
  hstRate?: number;
  stateTaxRate?: number;  // Pour les taxes d'État américaines
  localTaxRate?: number;  // Pour les taxes locales américaines
  ivaRate?: number;       // Pour l'IVA mexicaine
  vatStandardRate?: number;        // Pour la TVA standard européenne
  vatReducedRates?: number[];      // Pour les taux réduits européens
  vatSuperReducedRate?: number;    // Pour le taux super-réduit européen
  vatParkingRate?: number;         // Pour le taux parking européen
  totalRate: number;               // Le taux principal utilisé par défaut
  notes?: string;
}

// Pour la rétrocompatibilité avec le code existant
export interface TaxRegion extends TaxCountry {}

// Structure pour stocker la configuration fiscale dans le profil de l'entreprise
export interface TaxConfiguration {
  country: string;
  region?: string;
  defaultTaxRate: string;
  customTax?: CustomTaxConfiguration; // Nouvelle propriété pour la taxe personnalisée
}

// Interface pour la configuration de taxe personnalisée
export interface CustomTaxConfiguration {
  country: string;      // Code du pays (ex: "NO") 
  countryName: string;  // Nom du pays (ex: "Norvège")
  taxType: string;      // Type de taxe personnalisé saisi par l'utilisateur
  mainRate: number;     // Taux principal
  additionalRates?: Array<{  // Taux additionnels optionnels
    name: string;  // Nom du taux (ex: "Réduit", "Super-réduit")
    rate: number;  // Valeur du taux
  }>;
}

// Liste des types de taxes disponibles pour la sélection
export const TAX_TYPES = [
  { id: "vat", name: "TVA (Value Added Tax)", countries: ["EU", "UK", "NO", "CH"] },
  { id: "gst", name: "GST (Goods and Services Tax)", countries: ["AU", "NZ", "CA"] },
  { id: "hst", name: "HST (Harmonized Sales Tax)", countries: ["CA"] },
  { id: "pst", name: "PST (Provincial Sales Tax)", countries: ["CA"] },
  { id: "qst", name: "QST (Quebec Sales Tax)", countries: ["CA"] },
  { id: "sales-tax", name: "Sales Tax", countries: ["US"] },
  { id: "iva", name: "IVA (Impuesto al Valor Agregado)", countries: ["MX", "ES"] },
  { id: "consumption-tax", name: "Consumption Tax", countries: ["JP"] },
  { id: "other", name: "Autre type de taxe", countries: ["*"] }
];

// Liste des pays pour l'autocomplétion
export const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albanie" },
  { code: "DZ", name: "Algérie" },
  { code: "AS", name: "Samoa Américaines" },
  { code: "AD", name: "Andorre" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AG", name: "Antigua-et-Barbuda" },
  { code: "AR", name: "Argentine" },
  { code: "AM", name: "Arménie" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australie" },
  { code: "AT", name: "Autriche" },
  { code: "AZ", name: "Azerbaïdjan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahreïn" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbade" },
  { code: "BY", name: "Biélorussie" },
  { code: "BE", name: "Belgique" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Bénin" },
  { code: "BM", name: "Bermudes" },
  { code: "BT", name: "Bhoutan" },
  { code: "BO", name: "Bolivie" },
  { code: "BA", name: "Bosnie-Herzégovine" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brésil" },
  { code: "BN", name: "Brunéi Darussalam" },
  { code: "BG", name: "Bulgarie" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodge" },
  { code: "CM", name: "Cameroun" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cap-Vert" },
  { code: "KY", name: "Îles Caïmans" },
  { code: "CF", name: "République centrafricaine" },
  { code: "TD", name: "Tchad" },
  { code: "CL", name: "Chili" },
  { code: "CN", name: "Chine" },
  { code: "CO", name: "Colombie" },
  { code: "KM", name: "Comores" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "République démocratique du Congo" },
  { code: "CK", name: "Îles Cook" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatie" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Chypre" },
  { code: "CZ", name: "République tchèque" },
  { code: "DK", name: "Danemark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominique" },
  { code: "DO", name: "République dominicaine" },
  { code: "EC", name: "Équateur" },
  { code: "EG", name: "Égypte" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Guinée équatoriale" },
  { code: "ER", name: "Érythrée" },
  { code: "EE", name: "Estonie" },
  { code: "ET", name: "Éthiopie" },
  { code: "FK", name: "Îles Falkland" },
  { code: "FO", name: "Îles Féroé" },
  { code: "FJ", name: "Fidji" },
  { code: "FI", name: "Finlande" },
  { code: "FR", name: "France" },
  { code: "GF", name: "Guyane française" },
  { code: "PF", name: "Polynésie française" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambie" },
  { code: "GE", name: "Géorgie" },
  { code: "DE", name: "Allemagne" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Grèce" },
  { code: "GL", name: "Groenland" },
  { code: "GD", name: "Grenade" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinée" },
  { code: "GW", name: "Guinée-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haïti" },
  { code: "VA", name: "Saint-Siège (Vatican)" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hongrie" },
  { code: "IS", name: "Islande" },
  { code: "IN", name: "Inde" },
  { code: "ID", name: "Indonésie" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Irlande" },
  { code: "IL", name: "Israël" },
  { code: "IT", name: "Italie" },
  { code: "JM", name: "Jamaïque" },
  { code: "JP", name: "Japon" },
  { code: "JO", name: "Jordanie" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Corée du Nord" },
  { code: "KR", name: "Corée du Sud" },
  { code: "KW", name: "Koweït" },
  { code: "KG", name: "Kirghizistan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Lettonie" },
  { code: "LB", name: "Liban" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Libéria" },
  { code: "LY", name: "Libye" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lituanie" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MK", name: "Macédoine du Nord" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaisie" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malte" },
  { code: "MH", name: "Îles Marshall" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritanie" },
  { code: "MU", name: "Maurice" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexique" },
  { code: "FM", name: "Micronésie" },
  { code: "MD", name: "Moldavie" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolie" },
  { code: "ME", name: "Monténégro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Maroc" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibie" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Népal" },
  { code: "NL", name: "Pays-Bas" },
  { code: "NC", name: "Nouvelle-Calédonie" },
  { code: "NZ", name: "Nouvelle-Zélande" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigéria" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Île Norfolk" },
  { code: "MP", name: "Îles Mariannes du Nord" },
  { code: "NO", name: "Norvège" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palaos" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papouasie-Nouvelle-Guinée" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Pérou" },
  { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Pologne" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Porto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Roumanie" },
  { code: "RU", name: "Russie" },
  { code: "RW", name: "Rwanda" },
  { code: "BL", name: "Saint-Barthélemy" },
  { code: "SH", name: "Sainte-Hélène" },
  { code: "KN", name: "Saint-Kitts-et-Nevis" },
  { code: "LC", name: "Sainte-Lucie" },
  { code: "MF", name: "Saint-Martin (partie française)" },
  { code: "PM", name: "Saint-Pierre-et-Miquelon" },
  { code: "VC", name: "Saint-Vincent-et-les-Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "Saint-Marin" },
  { code: "ST", name: "Sao Tomé-et-Principe" },
  { code: "SA", name: "Arabie saoudite" },
  { code: "SN", name: "Sénégal" },
  { code: "RS", name: "Serbie" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapour" },
  { code: "SX", name: "Saint-Martin (partie néerlandaise)" },
  { code: "SK", name: "Slovaquie" },
  { code: "SI", name: "Slovénie" },
  { code: "SB", name: "Îles Salomon" },
  { code: "SO", name: "Somalie" },
  { code: "ZA", name: "Afrique du Sud" },
  { code: "SS", name: "Soudan du Sud" },
  { code: "ES", name: "Espagne" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Soudan" },
  { code: "SR", name: "Suriname" },
  { code: "SJ", name: "Svalbard et Jan Mayen" },
  { code: "SZ", name: "Eswatini" },
  { code: "SE", name: "Suède" },
  { code: "CH", name: "Suisse" },
  { code: "SY", name: "Syrie" },
  { code: "TW", name: "Taïwan" },
  { code: "TJ", name: "Tadjikistan" },
  { code: "TZ", name: "Tanzanie" },
  { code: "TH", name: "Thaïlande" },
  { code: "TL", name: "Timor oriental" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinité-et-Tobago" },
  { code: "TN", name: "Tunisie" },
  { code: "TR", name: "Turquie" },
  { code: "TM", name: "Turkménistan" },
  { code: "TC", name: "Îles Turques-et-Caïques" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Ouganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "Émirats arabes unis" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "US", name: "États-Unis" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Ouzbékistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Viêt Nam" },
  { code: "VG", name: "Îles Vierges britanniques" },
  { code: "VI", name: "Îles Vierges américaines" },
  { code: "WF", name: "Wallis-et-Futuna" },
  { code: "EH", name: "Sahara occidental" },
  { code: "YE", name: "Yémen" },
  { code: "ZM", name: "Zambie" },
  { code: "ZW", name: "Zimbabwe" }
];
