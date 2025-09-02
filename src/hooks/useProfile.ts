import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface ProfileData {
  id: string
  user_id: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  auth_method: string | null
  avatar_url: string | null
  bio: string | null
  show_email: boolean | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchOrCreateProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchOrCreateProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingProfile) {
        setProfile(existingProfile)
      } else {
        // Create new profile if it doesn't exist
        const newProfile = {
          user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          phone: user.phone || null,
          auth_method: user.phone ? 'phone' : 'email'
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile, {
            onConflict: 'user_id'
          })
          .select()
          .single()

        if (createError) throw createError

        setProfile(createdProfile)
        
        toast({
          title: "Profile created",
          description: "Welcome to Woices! Your profile has been set up."
        })
      }
    } catch (error) {
      console.error('Error managing profile:', error)
      toast({
        title: "Profile Error", 
        description: "There was an issue with your profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Omit<ProfileData, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !profile) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      })

      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchOrCreateProfile
  }
}