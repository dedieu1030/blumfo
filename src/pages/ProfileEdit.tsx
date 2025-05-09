
import React from 'react';
import { Header } from '@/components/Header';
import { UserProfileForm } from '@/components/user/UserProfileForm';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useState } from 'react';
import { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = (updatedProfile: UserProfile) => {
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    navigate('/profile');
  };

  return (
    <>
      <Header
        title="Modifier mon profil"
        description="Mettez à jour vos informations personnelles"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <UserProfileForm onSave={handleSave} />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
