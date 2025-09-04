import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeName, sanitizeBio, validateFileType, validateFileSize } from '@/utils/sanitization';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    display_name: string;
    avatar_url?: string;
    bio?: string;
    show_email?: boolean;
  };
  onProfileUpdate: () => void;
}

export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  currentProfile, 
  onProfileUpdate 
}: ProfileEditModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(currentProfile.display_name || '');
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [showEmail, setShowEmail] = useState(currentProfile.show_email !== false);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Enhanced security validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!validateFileType(file, allowedTypes)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateFileSize(file, maxFileSize)) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive'
      });
      return;
    }

    // Additional MIME type verification for security
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer.slice(0, 4));
    const fileSignature = Array.from(uint8Array).map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Check file signatures to prevent malicious uploads
    const validSignatures = ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8', '89504e47', '52494646'];
    if (!validSignatures.some(sig => fileSignature.startsWith(sig))) {
      toast({
        title: 'Invalid file format',
        description: 'File appears to be corrupted or not a valid image.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

  try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL (no expiry since bucket is public)
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrlData.publicUrl);
      
      toast({
        title: 'Avatar uploaded',
        description: 'Your profile picture has been uploaded successfully.'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validateBioLength = (bioText: string): boolean => {
    if (!bioText.trim()) return true;
    const wordCount = bioText.trim().split(/\s+/).length;
    return wordCount <= 6;
  };

  const handleBioChange = (value: string) => {
    const sanitizedValue = sanitizeBio(value, 6);
    
    if (validateBioLength(sanitizedValue)) {
      setBio(sanitizedValue);
    } else {
      toast({
        title: 'Bio too long',
        description: 'Bio must be 6 words or less.',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!validateBioLength(bio)) {
      toast({
        title: 'Invalid bio',
        description: 'Bio must be 6 words or less.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      // Sanitize all inputs before saving
      const sanitizedDisplayName = sanitizeName(displayName.trim());
      const sanitizedBio = bio.trim() ? sanitizeBio(bio.trim(), 6) : null;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: sanitizedDisplayName,
          bio: sanitizedBio,
          show_email: showEmail,
          avatar_url: avatarUrl || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      });

      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-woices-violet to-woices-mint text-white text-xl">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              Click the camera icon to upload a profile picture
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(sanitizeName(e.target.value))}
              placeholder="Enter your display name"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (6 words max)</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => handleBioChange(e.target.value)}
              placeholder="Describe yourself in 6 words..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {wordCount}/6 words used
            </p>
          </div>

          {/* Email Visibility */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Email Address</Label>
              <p className="text-xs text-muted-foreground">
                Display your email on your profile
              </p>
            </div>
            <Switch
              checked={showEmail}
              onCheckedChange={setShowEmail}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isSaving || isUploading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}