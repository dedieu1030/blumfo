
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profile) {
        // Convert to the proper UserProfile type
        const notificationSettings = typeof profile.notification_settings === 'object' 
          ? profile.notification_settings 
          : { email: true, push: true, sms: false };
          
        const typedProfile: UserProfile = {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          email: profile.email,
          phone: profile.phone,
          language: profile.language || 'fr',
          timezone: profile.timezone || 'Europe/Paris',
          notification_settings: notificationSettings as any,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };
        
        setUserProfile(typedProfile);
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Prepare notification settings for database
      const dbUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.notification_settings) {
        dbUpdates.notification_settings = updates.notification_settings;
      }

      // Mise à jour du profil
      const { error: updateError } = await supabase
        .from("profiles")
        .update(dbUpdates as any)
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setError(updateError.message);
        return;
      }

      // Récupérer le profil mis à jour
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
        setError(fetchError.message);
        return;
      }

      if (updatedProfile) {
        // Convert to the proper UserProfile type
        const notificationSettings = typeof updatedProfile.notification_settings === 'object' 
          ? updatedProfile.notification_settings 
          : { email: true, push: true, sms: false };
          
        const typedProfile: UserProfile = {
          id: updatedProfile.id,
          username: updatedProfile.username,
          full_name: updatedProfile.full_name,
          avatar_url: updatedProfile.avatar_url,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          language: updatedProfile.language || 'fr',
          timezone: updatedProfile.timezone || 'Europe/Paris',
          notification_settings: notificationSettings as any,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at
        };
        
        setUserProfile(typedProfile);
      }
    } catch (err) {
      console.error("Error in updateUserProfile:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    userProfile,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile
  };
}
