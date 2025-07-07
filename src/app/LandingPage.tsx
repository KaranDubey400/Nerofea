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
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src="/neo.png" alt="Nerofea Logo" width={40} height={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nerofea</h1>
        </div>
        <Button 
          type="button"
          onClick={handleStartTakingNotes}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Start Taking Notes
        </Button>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-8">
            <Image src="/neo.png" alt="Nerofea Logo" width={80} height={80} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Start Taking Notes
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Your intelligent companion for learning data structures and algorithms.
          </p>
        </div>
      </section>

      {/* How We Take Notes Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How We Take Notes
            </h2>
            <p className="text-xl text-gray-600">
              A powerful workflow designed specifically for DSA learning
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-xl">📝</span>
                </div>
                <CardTitle className="text-xl">Create Structured Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Write comprehensive DSA notes with our intelligent editor. Organize concepts, algorithms, and problem-solving approaches in a structured format.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-600 text-xl">🔗</span>
                </div>
                <CardTitle className="text-xl">Link Related Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect notes to each other and navigate between subnotes within particular topics. Create a web of interconnected knowledge for better understanding.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-green-600 text-xl">🤖</span>
                </div>
                <CardTitle className="text-xl">Ask AI While Writing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant clarification on concepts, ask doubts, and receive explanations while writing notes. Save AI responses directly to your notes for future reference.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI Features for Note-Taking
            </h2>
            <p className="text-xl text-gray-600">
              Discover how AI enhances your DSA learning experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-indigo-600 text-xl">🧠</span>
                </div>
                <CardTitle className="text-xl">Concept Explanation & Summarization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get detailed explanations of complex algorithms and data structures. Automatically summarize long explanations, extract key points, and create concise notes.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-orange-600 text-xl">🔍</span>
                </div>
                <CardTitle className="text-xl">Research & References</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find relevant resources, practice problems, and real-world applications of algorithms. Enrich your notes with up-to-date information and examples.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-pink-600 text-xl">📊</span>
                </div>
                <CardTitle className="text-xl">Study Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive personalized study suggestions based on your notes and progress. AI identifies gaps in your knowledge and recommends what to study next.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-yellow-600 text-xl">📋</span>
                </div>
                <CardTitle className="text-xl">DSA Sheet & Study Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access a curated DSA sheet with 169 problems. Filter by difficulty and topics, and generate a personalized study plan by setting your preferred days (like 30 or 60) and focus areas. Track your progress and get AI-powered recommendations for the optimal learning path.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/neo.png" alt="Nerofea Logo" width={32} height={32} />
            </div>
            <span className="text-xl font-bold">Nerofea</span>
          </div>
          <p className="text-gray-400">
            Your intelligent companion for learning data structures and algorithms
          </p>
        </div>
      </footer>
    </div>
  );
} 