
import { useLocation } from 'react-router-dom';

export function useIsProfilePage() {
  const location = useLocation();
  return location.pathname.includes('/profile');
}
