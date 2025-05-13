import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { UserProfileForm } from "@/components/user/UserProfileForm";
import { UserProfile } from "@/types/user";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    await updateUserProfile(updatedProfile);
    setIsEditing(false);
    navigate("/settings?tab=profile");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon Profil</CardTitle>
        <CardDescription>
          Gérez les informations de votre profil et vos préférences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <UserProfileForm 
            profile={profile} 
            onSave={handleSaveProfile} 
            editMode={true}
          />
        ) : (
          <div className="space-y-4">
            <p>Nom complet: {profile.full_name}</p>
            <p>Email: {profile.email}</p>
            <Button onClick={() => setIsEditing(true)}>Modifier</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEdit;
