
import React from 'react';
import { Header } from '@/components/Header';
import { UserProfileForm } from '@/components/user/UserProfileForm';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useState } from 'react';

export default function ProfileEdit() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header
        title="Modifier mon profil"
        description="Mettez à jour vos informations personnelles"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <UserProfileForm />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
