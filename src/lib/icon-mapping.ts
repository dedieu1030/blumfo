/**
 * Maps Lucide icon names to Streamline Plump Line icon IDs
 * Reference: https://home.streamlinehq.com/
 */
export const iconMapping: Record<string, string> = {
  // Navigation & Arrows
  "ChevronDown": "interface-arrows-button-down",
  "ChevronUp": "interface-arrows-button-up",
  "ChevronLeft": "interface-arrows-button-left",
  "ChevronRight": "interface-arrows-button-right",
  "ArrowRight": "interface-arrows-right-1",
  "ArrowLeft": "interface-arrows-left-1",
  "ArrowUp": "interface-arrows-up-1",
  "ArrowDown": "interface-arrows-down-1",
  "ExternalLink": "interface-link-action-external-1",
  
  // Interface
  "Plus": "interface-essential-add",
  "Minus": "interface-essential-remove",
  "Check": "interface-essential-checkmark",
  "X": "interface-essential-cross",
  "Search": "interface-essential-search",
  "Settings": "interface-settings-1",
  "Copy": "interface-essential-copy",
  "Trash": "interface-essential-bin",
  "Edit": "interface-essential-pen",
  "Calendar": "interface-calendar-1",
  "Download": "interface-download-button-2",
  "Upload": "interface-upload-button-2",
  "Menu": "interface-menu-hamburger",
  "Bell": "interface-alert-bell-2",
  "Filter": "interface-sort-filter",
  "Send": "interface-send-email-1",
  
  // Dashboard & Charts
  "BarChart2": "interface-dashboard-layout-2",
  "PieChart": "interface-chart-pie",
  "LineChart": "interface-chart-line",
  
  // Files & Documents
  "FileText": "files-document-file-text-1",
  "File": "files-document-file-1",
  "FilePlus": "files-document-file-add-1",
  "FileX": "files-document-file-remove-1",
  "FileCheck": "files-document-file-checkmark-1",
  
  // Communication
  "Mail": "emails-mail-heart-2",
  "MessageCircle": "chat-message-text-1",
  "MessageSquare": "chat-conversation-alt-1",
  
  // Users & People
  "User": "interface-user-2",
  "Users": "interface-user-multiple",
  "UserPlus": "interface-user-add",
  "UserMinus": "interface-user-remove",
  
  // Business & Finance
  "DollarSign": "finance-currency-dollar-circle",
  "CreditCard": "finance-payment-creditcard-1",
  "ShoppingCart": "ecommerce-online-shop-cart-1",
  "Package": "shipping-box-2",
  
  // Devices & Hardware
  "Smartphone": "tech-devices-phone-1",
  "Laptop": "tech-devices-laptop-1",
  "Printer": "office-printer-1",
  
  // Media
  "Image": "image-picture-1",
  "Play": "media-control-play-1",
  "Pause": "media-control-pause-1",
  "Music": "media-music-note-1",
  
  // Weather & Time
  "Sun": "weather-sun",
  "Moon": "weather-moon-1",
  "Clock": "time-clock-circle-1",
  
  // Others
  "Heart": "interface-favorite-heart",
  "Home": "interface-home-1",
  "Info": "interface-information-circle-1",
  "Alert": "interface-alert-warning-1",
  "Globe": "interface-world-earth",
  "Lock": "interface-lock-closed",
  "Unlock": "interface-lock-open",
  "LayoutTemplate": "interface-layout-template-1",
  "Hash": "interface-text-formatting-hashtag",
  "QrCode": "interface-qr-code",
};

/**
 * Gets the Streamline equivalent for a Lucide icon name
 * @param lucideIconName The name of the Lucide icon
 * @returns The corresponding Streamline icon ID or undefined if no mapping exists
 */
export const getStreamlineIcon = (lucideIconName: string): string | undefined => {
  return iconMapping[lucideIconName];
};

/**
 * Checks if a Lucide icon has a Streamline equivalent
 * @param lucideIconName The name of the Lucide icon
 * @returns True if the icon has a Streamline equivalent, false otherwise
 */
export const hasStreamlineEquivalent = (lucideIconName: string): boolean => {
  return iconMapping.hasOwnProperty(lucideIconName);
};

export default iconMapping;
