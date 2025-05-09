
import { useLocation } from "react-router-dom";

/**
 * Hook to check if the current route is at the top level
 * Returns true if the route is /, /invoices, /clients, etc.
 */
export const useIsToplevel = (): boolean => {
  const location = useLocation();
  const path = location.pathname;
  
  // Split the path by '/' and filter out empty strings
  const segments = path.split('/').filter(segment => segment !== '');
  
  // If there is only one segment or none, it's considered top level
  return segments.length <= 1;
};
