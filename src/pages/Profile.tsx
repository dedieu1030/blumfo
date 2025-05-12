
import React from 'react';
import { Header } from '@/components/Header';
import { UserProfile } from '@/components/user/UserProfile';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useState } from 'react';

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header
        title="Mon Profil"
        description="Consultez et gérez vos informations personnelles"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div>
        <UserProfile />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
