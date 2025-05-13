
// Stockage des pays par continent pour la sélection dans la TVA personnalisée

// Fonction utilitaire pour extraire les codes pays déjà définis dans les zones fiscales
import { taxZonesData } from "./taxData";

// Extraction des codes de pays déjà définis dans les zones fiscales
const extractExistingCountryCodes = (): string[] => {
  const existingCodes: string[] = [];
  taxZonesData.forEach(zone => {
    zone.countries.forEach(country => {
      existingCodes.push(country.countryCode);
    });
  });
  return existingCodes;
};

const existingCountryCodes = extractExistingCountryCodes();

// Définition de l'interface pour les pays
export interface CountryData {
  code: string;
  name: string;
  continent: string;
}

// Données des pays par continent
const countriesByContinent: { [continent: string]: CountryData[] } = {
  "Europe": [
    { code: "AL", name: "Albanie", continent: "Europe" },
    { code: "AD", name: "Andorre", continent: "Europe" },
    { code: "AM", name: "Arménie", continent: "Europe" },
    { code: "AT", name: "Autriche", continent: "Europe" },
    { code: "AZ", name: "Azerbaïdjan", continent: "Europe" },
    { code: "BY", name: "Biélorussie", continent: "Europe" },
    { code: "BA", name: "Bosnie-Herzégovine", continent: "Europe" },
    { code: "BG", name: "Bulgarie", continent: "Europe" },
    { code: "CY", name: "Chypre", continent: "Europe" },
    { code: "HR", name: "Croatie", continent: "Europe" },
    { code: "DK", name: "Danemark", continent: "Europe" },
    { code: "EE", name: "Estonie", continent: "Europe" },
    { code: "FI", name: "Finlande", continent: "Europe" },
    { code: "GE", name: "Géorgie", continent: "Europe" },
    { code: "GR", name: "Grèce", continent: "Europe" },
    { code: "HU", name: "Hongrie", continent: "Europe" },
    { code: "IE", name: "Irlande", continent: "Europe" },
    { code: "IS", name: "Islande", continent: "Europe" },
    { code: "KZ", name: "Kazakhstan", continent: "Europe" },
    { code: "XK", name: "Kosovo", continent: "Europe" },
    { code: "LV", name: "Lettonie", continent: "Europe" },
    { code: "LI", name: "Liechtenstein", continent: "Europe" },
    { code: "LT", name: "Lituanie", continent: "Europe" },
    { code: "LU", name: "Luxembourg", continent: "Europe" },
    { code: "MK", name: "Macédoine du Nord", continent: "Europe" },
    { code: "MT", name: "Malte", continent: "Europe" },
    { code: "MD", name: "Moldavie", continent: "Europe" },
    { code: "MC", name: "Monaco", continent: "Europe" },
    { code: "ME", name: "Monténégro", continent: "Europe" },
    { code: "PL", name: "Pologne", continent: "Europe" },
    { code: "PT", name: "Portugal", continent: "Europe" },
    { code: "CZ", name: "République tchèque", continent: "Europe" },
    { code: "RO", name: "Roumanie", continent: "Europe" },
    { code: "RU", name: "Russie", continent: "Europe" },
    { code: "SM", name: "Saint-Marin", continent: "Europe" },
    { code: "RS", name: "Serbie", continent: "Europe" },
    { code: "SK", name: "Slovaquie", continent: "Europe" },
    { code: "SI", name: "Slovénie", continent: "Europe" },
    { code: "SE", name: "Suède", continent: "Europe" }
  ],
  "Asie": [
    { code: "AF", name: "Afghanistan", continent: "Asie" },
    { code: "SA", name: "Arabie Saoudite", continent: "Asie" },
    { code: "BH", name: "Bahreïn", continent: "Asie" },
    { code: "BD", name: "Bangladesh", continent: "Asie" },
    { code: "BT", name: "Bhoutan", continent: "Asie" },
    { code: "MM", name: "Birmanie (Myanmar)", continent: "Asie" },
    { code: "BN", name: "Brunei", continent: "Asie" },
    { code: "KH", name: "Cambodge", continent: "Asie" },
    { code: "CN", name: "Chine", continent: "Asie" },
    { code: "KP", name: "Corée du Nord", continent: "Asie" },
    { code: "KR", name: "Corée du Sud", continent: "Asie" },
    { code: "AE", name: "Émirats arabes unis", continent: "Asie" },
    { code: "IN", name: "Inde", continent: "Asie" },
    { code: "ID", name: "Indonésie", continent: "Asie" },
    { code: "IR", name: "Iran", continent: "Asie" },
    { code: "IQ", name: "Irak", continent: "Asie" },
    { code: "IL", name: "Israël", continent: "Asie" },
    { code: "JP", name: "Japon", continent: "Asie" },
    { code: "JO", name: "Jordanie", continent: "Asie" },
    { code: "KG", name: "Kirghizistan", continent: "Asie" },
    { code: "KW", name: "Koweït", continent: "Asie" },
    { code: "LA", name: "Laos", continent: "Asie" },
    { code: "LB", name: "Liban", continent: "Asie" },
    { code: "MY", name: "Malaisie", continent: "Asie" },
    { code: "MV", name: "Maldives", continent: "Asie" },
    { code: "MN", name: "Mongolie", continent: "Asie" },
    { code: "NP", name: "Népal", continent: "Asie" },
    { code: "OM", name: "Oman", continent: "Asie" },
    { code: "UZ", name: "Ouzbékistan", continent: "Asie" },
    { code: "PK", name: "Pakistan", continent: "Asie" },
    { code: "PS", name: "Palestine", continent: "Asie" },
    { code: "PH", name: "Philippines", continent: "Asie" },
    { code: "QA", name: "Qatar", continent: "Asie" },
    { code: "SG", name: "Singapour", continent: "Asie" },
    { code: "LK", name: "Sri Lanka", continent: "Asie" },
    { code: "SY", name: "Syrie", continent: "Asie" },
    { code: "TJ", name: "Tadjikistan", continent: "Asie" },
    { code: "TW", name: "Taïwan", continent: "Asie" },
    { code: "TH", name: "Thaïlande", continent: "Asie" },
    { code: "TL", name: "Timor oriental", continent: "Asie" },
    { code: "TR", name: "Turquie", continent: "Asie" },
    { code: "TM", name: "Turkménistan", continent: "Asie" },
    { code: "VN", name: "Viêt Nam", continent: "Asie" },
    { code: "YE", name: "Yémen", continent: "Asie" }
  ],
  "Afrique": [
    { code: "ZA", name: "Afrique du Sud", continent: "Afrique" },
    { code: "DZ", name: "Algérie", continent: "Afrique" },
    { code: "AO", name: "Angola", continent: "Afrique" },
    { code: "BJ", name: "Bénin", continent: "Afrique" },
    { code: "BW", name: "Botswana", continent: "Afrique" },
    { code: "BF", name: "Burkina Faso", continent: "Afrique" },
    { code: "BI", name: "Burundi", continent: "Afrique" },
    { code: "CV", name: "Cap-Vert", continent: "Afrique" },
    { code: "CM", name: "Cameroun", continent: "Afrique" },
    { code: "CF", name: "République centrafricaine", continent: "Afrique" },
    { code: "KM", name: "Comores", continent: "Afrique" },
    { code: "CG", name: "République du Congo", continent: "Afrique" },
    { code: "CD", name: "République démocratique du Congo", continent: "Afrique" },
    { code: "CI", name: "Côte d'Ivoire", continent: "Afrique" },
    { code: "DJ", name: "Djibouti", continent: "Afrique" },
    { code: "EG", name: "Égypte", continent: "Afrique" },
    { code: "GQ", name: "Guinée équatoriale", continent: "Afrique" },
    { code: "ER", name: "Érythrée", continent: "Afrique" },
    { code: "SZ", name: "Eswatini", continent: "Afrique" },
    { code: "ET", name: "Éthiopie", continent: "Afrique" },
    { code: "GA", name: "Gabon", continent: "Afrique" },
    { code: "GM", name: "Gambie", continent: "Afrique" },
    { code: "GH", name: "Ghana", continent: "Afrique" },
    { code: "GN", name: "Guinée", continent: "Afrique" },
    { code: "GW", name: "Guinée-Bissau", continent: "Afrique" },
    { code: "KE", name: "Kenya", continent: "Afrique" },
    { code: "LS", name: "Lesotho", continent: "Afrique" },
    { code: "LR", name: "Liberia", continent: "Afrique" },
    { code: "LY", name: "Libye", continent: "Afrique" },
    { code: "MG", name: "Madagascar", continent: "Afrique" },
    { code: "MW", name: "Malawi", continent: "Afrique" },
    { code: "ML", name: "Mali", continent: "Afrique" },
    { code: "MA", name: "Maroc", continent: "Afrique" },
    { code: "MR", name: "Mauritanie", continent: "Afrique" },
    { code: "MU", name: "Maurice", continent: "Afrique" },
    { code: "MZ", name: "Mozambique", continent: "Afrique" },
    { code: "NA", name: "Namibie", continent: "Afrique" },
    { code: "NE", name: "Niger", continent: "Afrique" },
    { code: "NG", name: "Nigeria", continent: "Afrique" },
    { code: "RW", name: "Rwanda", continent: "Afrique" },
    { code: "ST", name: "Sao Tomé-et-Principe", continent: "Afrique" },
    { code: "SN", name: "Sénégal", continent: "Afrique" },
    { code: "SC", name: "Seychelles", continent: "Afrique" },
    { code: "SL", name: "Sierra Leone", continent: "Afrique" },
    { code: "SO", name: "Somalie", continent: "Afrique" },
    { code: "SD", name: "Soudan", continent: "Afrique" },
    { code: "SS", name: "Soudan du Sud", continent: "Afrique" },
    { code: "TZ", name: "Tanzanie", continent: "Afrique" },
    { code: "TD", name: "Tchad", continent: "Afrique" },
    { code: "TG", name: "Togo", continent: "Afrique" },
    { code: "TN", name: "Tunisie", continent: "Afrique" },
    { code: "UG", name: "Ouganda", continent: "Afrique" },
    { code: "ZM", name: "Zambie", continent: "Afrique" },
    { code: "ZW", name: "Zimbabwe", continent: "Afrique" }
  ],
  "Amérique du Sud": [
    { code: "AR", name: "Argentine", continent: "Amérique du Sud" },
    { code: "BO", name: "Bolivie", continent: "Amérique du Sud" },
    { code: "BR", name: "Brésil", continent: "Amérique du Sud" },
    { code: "CL", name: "Chili", continent: "Amérique du Sud" },
    { code: "CO", name: "Colombie", continent: "Amérique du Sud" },
    { code: "EC", name: "Équateur", continent: "Amérique du Sud" },
    { code: "GY", name: "Guyana", continent: "Amérique du Sud" },
    { code: "PY", name: "Paraguay", continent: "Amérique du Sud" },
    { code: "PE", name: "Pérou", continent: "Amérique du Sud" },
    { code: "SR", name: "Suriname", continent: "Amérique du Sud" },
    { code: "UY", name: "Uruguay", continent: "Amérique du Sud" },
    { code: "VE", name: "Venezuela", continent: "Amérique du Sud" }
  ],
  "Océanie": [
    { code: "AU", name: "Australie", continent: "Océanie" },
    { code: "FJ", name: "Fidji", continent: "Océanie" },
    { code: "KI", name: "Kiribati", continent: "Océanie" },
    { code: "MH", name: "Îles Marshall", continent: "Océanie" },
    { code: "FM", name: "États fédérés de Micronésie", continent: "Océanie" },
    { code: "NR", name: "Nauru", continent: "Océanie" },
    { code: "NZ", name: "Nouvelle-Zélande", continent: "Océanie" },
    { code: "PW", name: "Palaos", continent: "Océanie" },
    { code: "PG", name: "Papouasie-Nouvelle-Guinée", continent: "Océanie" },
    { code: "WS", name: "Samoa", continent: "Océanie" },
    { code: "SB", name: "Îles Salomon", continent: "Océanie" },
    { code: "TO", name: "Tonga", continent: "Océanie" },
    { code: "TV", name: "Tuvalu", continent: "Océanie" },
    { code: "VU", name: "Vanuatu", continent: "Océanie" }
  ],
  "Amérique du Nord": [
    { code: "AG", name: "Antigua-et-Barbuda", continent: "Amérique du Nord" },
    { code: "BS", name: "Bahamas", continent: "Amérique du Nord" },
    { code: "BB", name: "Barbade", continent: "Amérique du Nord" },
    { code: "BZ", name: "Belize", continent: "Amérique du Nord" },
    { code: "CR", name: "Costa Rica", continent: "Amérique du Nord" },
    { code: "CU", name: "Cuba", continent: "Amérique du Nord" },
    { code: "DM", name: "Dominique", continent: "Amérique du Nord" },
    { code: "SV", name: "El Salvador", continent: "Amérique du Nord" },
    { code: "GD", name: "Grenade", continent: "Amérique du Nord" },
    { code: "GT", name: "Guatemala", continent: "Amérique du Nord" },
    { code: "HT", name: "Haïti", continent: "Amérique du Nord" },
    { code: "HN", name: "Honduras", continent: "Amérique du Nord" },
    { code: "JM", name: "Jamaïque", continent: "Amérique du Nord" },
    { code: "NI", name: "Nicaragua", continent: "Amérique du Nord" },
    { code: "PA", name: "Panama", continent: "Amérique du Nord" },
    { code: "KN", name: "Saint-Kitts-et-Nevis", continent: "Amérique du Nord" },
    { code: "LC", name: "Sainte-Lucie", continent: "Amérique du Nord" },
    { code: "VC", name: "Saint-Vincent-et-les-Grenadines", continent: "Amérique du Nord" },
    { code: "TT", name: "Trinité-et-Tobago", continent: "Amérique du Nord" }
  ]
};

// Fonction pour obtenir tous les pays (tous continents confondus)
export const getAllCountries = (): CountryData[] => {
  return Object.values(countriesByContinent).flat();
};

// Fonction pour obtenir les pays filtrés (sans ceux déjà dans les zones fiscales)
export const getFilteredCountries = (): CountryData[] => {
  return getAllCountries().filter(country => 
    !existingCountryCodes.includes(country.code)
  );
};

// Fonction pour obtenir les continents
export const getContinents = (): string[] => {
  return Object.keys(countriesByContinent);
};

// Export des données des pays par continent
export default countriesByContinent;
