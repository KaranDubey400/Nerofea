"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/supabaseClient";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  useAuthGuard();
  const { user, profile, refetchProfile } = useUser();
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "/neo.png");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(profile?.bio || "");
  // Theme toggle state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // On mount, check localStorage for theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Always use the latest profile?.avatar_url if available
  console.log('Profile avatar_url:', profile?.avatar_url);
  const displayAvatarUrl = (profile?.avatar_url ? profile.avatar_url + '?t=' + Date.now() : avatarUrl);

  // Profile picture upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError("");
    setSuccess("");
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError("Failed to upload avatar.");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    // Force cache busting
    setAvatarUrl(data.publicUrl + '?t=' + Date.now());
    // Update profile
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
    setSuccess("Profile picture updated!");
    setUploading(false);
    refetchProfile();
  };

  // Username update handler
  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    // Update in profiles table
    const { error: updateError } = await supabase.from('profiles').update({ username }).eq('id', user.id);
    // Update in Auth user metadata
    const { error: authError } = await supabase.auth.updateUser({ data: { username } });
    if (updateError || authError) {
      setError("Failed to update username.");
    } else {
      setSuccess("Username updated!");
      refetchProfile();
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newPassword = formData.get('newPassword') as string;
    setError("");
    setSuccess("");
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    if (pwError) {
      setError("Failed to change password.");
    } else {
      setSuccess("Password changed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-2 py-8 relative">
      {/* Dashboard Button - Top Left */}
      <div className="absolute top-4 left-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            ← Dashboard
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-md p-6 flex flex-col gap-8 shadow-md">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center gap-3">
          <Label className="text-lg font-semibold mb-1">Profile Picture</Label>
          <Image src={displayAvatarUrl} alt="Profile" width={96} height={96} className="rounded-full border shadow" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline">
            {uploading ? "Uploading..." : "Change Profile Picture"}
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Bio / About Me Section */}
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!user) return;
          setError("");
          setSuccess("");
          const { error: updateError } = await supabase.from('profiles').update({ bio }).eq('id', user.id);
          if (updateError) {
            setError("Failed to update bio.");
          } else {
            setSuccess("Bio updated!");
            refetchProfile();
          }
        }} className="space-y-2">
          <Label className="text-lg font-semibold">Bio / About Me</Label>
          <Textarea
            className="w-full min-h-[60px]"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            maxLength={300}
          />
          <Button type="submit" className="w-full">Update Bio</Button>
        </form>

        {/* Account Created Date Section */}
        {profile?.created_at && (
          <div className="flex flex-col gap-1">
            <Label className="text-lg font-semibold">Account Created</Label>
            <div className="text-gray-700 bg-gray-100 rounded px-3 py-2">
              {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}

        {/* Password Change Section */}
        <form onSubmit={handlePasswordChange} className="space-y-2">
          <Label className="text-lg font-semibold">Change Password</Label>
          <Input type="password" name="newPassword" minLength={6} required placeholder="New Password" />
          <Button type="submit" className="w-full">Change Password</Button>
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="mt-8 border-t pt-6">
          <Label className="text-lg font-semibold text-red-600 mb-2">Danger Zone</Label>
          <Button
            type="button"
            variant="destructive"
            className="w-full mt-2"
            onClick={async () => {
              if (!user) return;
              const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
              if (!confirmed) return;
              setError("");
              setSuccess("");
              // Delete user from Supabase Auth
              const { error } = await supabase.auth.admin.deleteUser(user.id);
              if (error) {
                setError('Failed to delete account: ' + error.message);
              } else {
                setSuccess('Account deleted. Redirecting...');
                setTimeout(() => { window.location.href = "/"; }, 1500);
              }
            }}
          >
            Delete Account
          </Button>
        </div>

        {/* Success/Error Messages */}
        <div>
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center mb-2">{success}</div>}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center mb-2">{error}</div>}
        </div>
      </Card>
    </div>
  );
} 