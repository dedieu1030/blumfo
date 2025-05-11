
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Fonction pour détecter si l'écran est de taille mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Premier check lors du montage
    checkIfMobile()

    // Configurer l'event listener pour le redimensionnement
    window.addEventListener("resize", checkIfMobile)
    
    // Nettoyer l'event listener lors du démontage
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return !!isMobile
}
