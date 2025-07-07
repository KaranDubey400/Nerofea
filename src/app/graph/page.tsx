"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Target } from "lucide-react";
import { FaRobot } from "react-icons/fa";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import GraphView from '@/components/GraphView';
import { useTopics } from '@/hooks/useTopics';
import { useNotes } from '@/hooks/useNotes';

export default function GraphPage() {
  const { user, profile, signOut } = useUser();
  useAuthGuard();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Image src="/neo.png" alt="Nerofea Logo" width={32} height={32} />
            <span className="text-xl font-bold text-gray-900">Knowledge Graph</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/ai-features")}
            className="flex items-center gap-2"
          >
            <FaRobot className="w-4 h-4" />
            AI Features
          </Button>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-blue-400 text-white hover:from-indigo-600 hover:to-blue-500 flex items-center gap-2"
            onClick={() => router.push("/grind")}
          >
            <Target className="w-4 h-4" />
            Grind
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{profile?.username}</span>
            <Image
              src={profile?.avatar_url || "/neo.png"}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full border"
            />
          </div>
          <Button variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </header>

      {/* Graph Content */}
      <main className="h-[calc(100vh-80px)] w-full">
        <div className="h-full w-full bg-white" onClick={e => e.stopPropagation()}>
          <div className="bg-white border-b border-gray-200 p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Knowledge Graph</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Interactive visualization of your topics and notes. Click on nodes to explore!
                </p>
              </div>
            </div>
          </div>
          <div className="h-[calc(100%-80px)] w-full" onClick={e => e.stopPropagation()}>
            <GraphView />
          </div>
        </div>
      </main>
    </div>
  );
}
