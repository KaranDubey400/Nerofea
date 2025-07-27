"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { AIFeatures } from "@/components/AIFeatures";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleStartTakingNotes = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative text-center py-28 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-center mx-auto mb-8 gap-4 drop-shadow-xl">
            <Image src="/neo.png" alt="Nerofea Logo" width={96} height={96} />
            <span className="text-3xl font-bold text-gray-900">Nerofea</span>
          </div>
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-lg">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Supercharge Your Notes</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-12 max-w-2xl mx-auto">
            The most intelligent, beautiful, and interactive note-taking app for DSA learners. Experience next-level productivity and learning.
          </p>
          <div className="flex justify-center">
            <Button 
              type="button"
              onClick={handleStartTakingNotes}
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl rounded-full transition-transform transform hover:scale-105"
            >
              Start Taking Notes
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">📝</span>
              <h3 className="font-bold text-lg mb-2 text-center">Smart Note-Taking</h3>
              <p className="text-gray-600 text-center text-sm">Rich editor, organize notes, link concepts, aur apne shabdon mein likho.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">🤖</span>
              <h3 className="font-bold text-lg mb-2 text-center">AI-Powered Help</h3>
              <p className="text-gray-600 text-center text-sm">Concepts explain, doubts clear, research & summarization – sab kuch AI se.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">📅</span>
              <h3 className="font-bold text-lg mb-2 text-center">Personalized Study Plans</h3>
              <p className="text-gray-600 text-center text-sm">Apne hisaab se DSA study plan banao, AI se tailor-made routine pao.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">🧩</span>
              <h3 className="font-bold text-lg mb-2 text-center">DSA Questions Bank</h3>
              <p className="text-gray-600 text-center text-sm">169+ curated questions, filter by topic/difficulty, practice karo smartly.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">📎</span>
              <h3 className="font-bold text-lg mb-2 text-center">File Attachments</h3>
              <p className="text-gray-600 text-center text-sm">Notes ke saath images/files attach karo, sab kuch ek jagah.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">📈</span>
              <h3 className="font-bold text-lg mb-2 text-center">Progress Tracking</h3>
              <p className="text-gray-600 text-center text-sm">Study plan aur questions ka progress track karo, apni growth dekho.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">🔎</span>
              <h3 className="font-bold text-lg mb-2 text-center">Instant Search</h3>
              <p className="text-gray-600 text-center text-sm">Notes/questions ko instantly search karo, time bachao.</p>
            </div>
            <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">✨</span>
              <h3 className="font-bold text-lg mb-2 text-center">Beautiful UI</h3>
              <p className="text-gray-600 text-center text-sm">Modern, distraction-free, aur responsive design – best experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Flow Section */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 md:gap-4 items-center justify-between">
            <div className="flex flex-col items-center text-center flex-1">
              <span className="text-4xl mb-2">📝</span>
              <h3 className="font-bold text-lg mb-1">Create & Organize Notes</h3>
              <p className="text-gray-600 text-sm">Rich editor mein notes banao, topics ke hisaab se organize karo, aur concepts ko link karo.</p>
            </div>
            <div className="hidden md:block text-3xl text-gray-400">→</div>
            <div className="flex flex-col items-center text-center flex-1">
              <span className="text-4xl mb-2">🤖</span>
              <h3 className="font-bold text-lg mb-1">Use AI for Help</h3>
              <p className="text-gray-600 text-sm">AI se concepts samjho, doubts clear karo, aur research/summaries pao bina time waste kiye.</p>
            </div>
            <div className="hidden md:block text-3xl text-gray-400">→</div>
            <div className="flex flex-col items-center text-center flex-1">
              <span className="text-4xl mb-2">📅</span>
              <h3 className="font-bold text-lg mb-1">Generate Study Plan</h3>
              <p className="text-gray-600 text-sm">AI se personalized DSA study plan banao, apne routine ke hisaab se.</p>
            </div>
            <div className="hidden md:block text-3xl text-gray-400">→</div>
            <div className="flex flex-col items-center text-center flex-1">
              <span className="text-4xl mb-2">🧩</span>
              <h3 className="font-bold text-lg mb-1">Practice & Track Progress</h3>
              <p className="text-gray-600 text-sm">DSA questions solve karo, progress track karo, aur apni growth dekho.</p>
            </div>
          </div>
        </div>
      </section>
      {/* How to Use Section (moved to bottom) */}
      <section className="py-8 px-4 bg-white/80 border-t border-gray-200 mt-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-blue-700">How to Use?</h2>
          <ol className="list-decimal list-inside text-lg text-gray-800 space-y-2">
            <li><b>Login or Signup:</b> First, create your account or log in.</li>
            <li><b>Add a Topic:</b> Click on "Add Topic" in the sidebar and enter your topic name.</li>
            <li><b>Write Notes:</b> Click on any topic, then press the "Add Note" button to write your note. You can save and edit your notes anytime.</li>
            <li><b>Use AI Features:</b> While writing notes, get help from AI – understand concepts, get summaries, or clear any doubts.</li>
            <li><b>Create a Study Plan:</b> Go to the "Study Plan" section, generate a personalized plan, and follow it.</li>
            <li><b>Practice Questions:</b> In the "Questions" section, solve DSA questions, use filters, and track your progress.</li>
            <li><b>Attach Files:</b> You can attach images or files to your notes for better understanding.</li>
            <li><b>Track Progress:</b> Monitor your progress in study plans and questions, and see your growth over time.</li>
          </ol>
          <p className="mt-4 text-center text-blue-600 font-medium">If you have any doubts, just ask the AI! 🚀</p>
        </div>
      </section>
    </div>
  );
} 