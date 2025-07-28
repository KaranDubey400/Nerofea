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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image src="/neo.png" alt="Nerofea Logo" width={40} height={40} className="rounded-lg" />
              <span className="text-2xl font-bold text-gray-900">Nerofea</span>
            </div>
            <Button 
              type="button"
              onClick={handleStartTakingNotes}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Get started →
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Supercharge Your Notes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The most intelligent, beautiful, and interactive note-taking app for DSA learners. Experience next-level productivity and learning.
          </p>
          <Button 
            type="button"
            onClick={handleStartTakingNotes}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
          >
            Start Taking Notes
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to supercharge your DSA learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Smart Note-Taking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Rich editor to organize notes, link concepts, and write in your own words.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">AI-Powered Help</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Get concept explanations, clear doubts, and access research & summarization – all powered by AI.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Personalized Study Plans</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Create customized DSA study plans that fit your schedule, with AI-generated tailor-made routines.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧩</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">DSA Questions Bank</h3>
              <p className="text-gray-600 text-sm leading-relaxed">169+ curated questions with topic/difficulty filters for smart and efficient practice.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📎</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">File Attachments</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Attach images and files to your notes, keeping everything organized in one place.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Progress Tracking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Track your study plan and question-solving progress, and monitor your learning growth.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔎</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Instant Search</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Instantly search through notes and questions, saving you time and effort.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Beautiful UI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Modern, distraction-free, and responsive design for the best user experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with Nerofea in four simple steps and transform your learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <div className="mb-2">
                <span className="inline-block w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold flex items-center justify-center mb-3">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Create & Organize Notes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Create notes using our rich editor, organize them by topics, and link related concepts together.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="mb-2">
                <span className="inline-block w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-semibold flex items-center justify-center mb-3">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Use AI for Help</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Understand concepts with AI assistance, clear your doubts, and get research summaries without wasting time.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <div className="mb-2">
                <span className="inline-block w-8 h-8 bg-green-600 text-white rounded-full text-sm font-semibold flex items-center justify-center mb-3">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Generate Study Plan</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Create personalized DSA study plans with AI, tailored to fit your schedule and learning pace.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧩</span>
              </div>
              <div className="mb-2">
                <span className="inline-block w-8 h-8 bg-orange-600 text-white rounded-full text-sm font-semibold flex items-center justify-center mb-3">4</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Practice & Track Progress</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Solve DSA questions, track your progress, and monitor your learning growth over time.</p>
            </div>
          </div>
        </div>
      </section>
      {/* How to Use Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How to Use?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to get the most out of Nerofea and accelerate your DSA learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Login or Signup</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">First, create your account or log in.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Add a Topic</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Click on "Add Topic" in the sidebar and enter your topic name.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Write Notes</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Click on any topic, then press the "Add Note" button to write your note. You can save and edit your notes anytime.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Use AI Features</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">While writing notes, get help from AI – understand concepts, get summaries, or clear any doubts.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-600 font-semibold text-sm">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Create a Study Plan</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Go to the "Study Plan" section, generate a personalized plan, and follow it.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-600 font-semibold text-sm">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Practice Questions</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">In the "Questions" section, solve DSA questions, use filters, and track your progress.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-teal-600 font-semibold text-sm">7</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Attach Files</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">You can attach images or files to your notes for better understanding.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-pink-600 font-semibold text-sm">8</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Track Progress</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Monitor your progress in study plans and questions, and see your growth over time.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <p className="text-blue-800 font-medium text-lg">
                If you have any doubts, just ask the AI! 🚀
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Image src="/neo.png" alt="Nerofea Logo" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900">Nerofea</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                © 2024 Nerofea. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Supercharge your DSA learning with AI-powered notes.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
