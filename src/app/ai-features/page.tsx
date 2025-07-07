"use client";
import React from "react";
import { AIFeatures } from "@/components/AIFeatures";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';

export default function AIFeaturesPage() {
  useAuthGuard();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      <button
        className="m-4 text-blue-600 hover:underline text-base font-medium self-start"
        onClick={() => router.push('/dashboard')}
      >
        &larr; Home
      </button>
      <main className="flex-1 flex flex-col md:flex-row gap-0 md:gap-8 max-w-7xl mx-auto w-full py-8 px-2 md:px-8">
        {/* Sidebar: AI Features Cards */}
        <aside className="w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-indigo-600 text-lg">🧠</span>
              </div>
              <div className="font-semibold text-base mb-1 text-center">Concept Explanation & Summarization</div>
              <div className="text-gray-600 text-xs text-center">
                Get detailed explanations of complex algorithms and data structures. Automatically summarize long explanations, extract key points, and create concise notes.
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-0">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-orange-600 text-lg">🔍</span>
              </div>
              <div className="font-semibold text-base mb-1 text-center">Research & References</div>
              <div className="text-gray-600 text-xs text-center">
                Find relevant resources, practice problems, and real-world applications of algorithms. Enrich your notes with up-to-date information and examples.
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-0">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-pink-600 text-lg">📊</span>
              </div>
              <div className="font-semibold text-base mb-1 text-center">Study Recommendations</div>
              <div className="text-gray-600 text-xs text-center">
                Receive personalized study suggestions based on your notes and progress. AI identifies gaps in your knowledge and recommends what to study next.
              </div>
            </div>
          </div>
        </aside>
        {/* Main Content: Nerofea Assistant */}
        <section className="flex-1 flex items-start justify-center">
          <AIFeatures />
        </section>
      </main>
    </div>
  );
} 