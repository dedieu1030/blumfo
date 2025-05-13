
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserProfileForm } from "./UserProfileForm";
import { Button } from "@/components/ui/button";
import { UserProfile as UserProfileType } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserProfile() {
  const { userProfile, updateUserProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  const handleSave = async (updatedProfile: Partial<UserProfileType>) => {
    await updateUserProfile(updatedProfile);
    setEditMode(false);
  };
  
  if (!userProfile) {
    return <div>Chargement du profil...</div>;
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profil d'utilisateur</CardTitle>
        <Button onClick={toggleEditMode}>
          {editMode ? "Annuler" : "Éditer"}
        </Button>
      </CardHeader>
      <CardContent>
        <UserProfileForm 
          profile={userProfile} 
          onSave={handleSave}
          editMode={editMode}
        />
      </CardContent>
    </Card>
  );
}
