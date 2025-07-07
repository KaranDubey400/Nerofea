"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const { user, profile, loading, signOut } = useUser();
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Successfully signed in!");
      setForm({ fullName: "", username: "", email: "", password: "" });
      router.push("/dashboard");
    }
    setFormLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");
    
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          username: form.username,
        },
      },
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created successfully! Please check your email to verify your account.");
      setForm({ fullName: "", username: "", email: "", password: "" });
      router.push("/dashboard");
    }
    setFormLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setSuccess("Successfully signed out!");
  };

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Show loading state only for initial load
  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is logged in, render nothing (redirect happens)
  if (user) {
    return null;
  }

  // Show auth form if not logged in
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Nerofea</CardTitle>
          <p className="text-muted-foreground">Your intelligent note-taking companion</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <Button
              variant={isSignIn ? "default" : "outline"}
              className="rounded-r-none"
              onClick={() => setIsSignIn(true)}
            >
              Sign In
            </Button>
            <Button
              variant={!isSignIn ? "default" : "outline"}
              className="rounded-l-none"
              onClick={() => setIsSignIn(false)}
            >
              Sign Up
            </Button>
          </div>
          <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-4">
            {!isSignIn && (
              <>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder={isSignIn ? "Password" : "Password (min 6 characters)"}
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={formLoading}
            >
              {formLoading ? (isSignIn ? "Signing In..." : "Signing Up...") : isSignIn ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          {isSignIn && (
            <div className="text-right mt-2">
              <Button variant="link" className="text-blue-600 p-0 h-auto">
                Forgot your password?
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 