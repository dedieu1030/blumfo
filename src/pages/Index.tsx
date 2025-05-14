
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the Dashboard page
    navigate('/dashboard');
  }, [navigate]);

  return null; // This won't render as we're redirecting
};

export default Index;
