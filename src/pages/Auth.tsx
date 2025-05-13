
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const Auth = () => {
  const { signIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
        
        <div className="space-y-4">
          {/* Add your authentication UI here */}
          <p className="text-center text-gray-600">
            Veuillez vous connecter pour accéder à votre compte
          </p>
          
          <button 
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => signIn?.()}
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
