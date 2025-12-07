"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, Video, Shield, Zap, Globe } from "lucide-react";

export default function App() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/channels");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CollabSpace</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Where Teams
          <span className="text-blue-500"> Connect</span> and
          <span className="text-blue-500"> Collaborate</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Real-time messaging, video calls, and seamless collaboration for modern teams.
          All in one place, built for productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Everything Your Team Needs
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Real-time Messaging
            </h3>
            <p className="text-gray-400">
              Instant messaging with channels and direct messages. Stay connected with your team in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Voice & Video Calls
            </h3>
            <p className="text-gray-400">
              High-quality video and voice calls powered by WebRTC. Connect face-to-face with your team.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Team Channels
            </h3>
            <p className="text-gray-400">
              Organize conversations by topic, project, or team. Share invite links and collaborate seamlessly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-400">
              Your data is protected with industry-standard encryption. Read receipts and privacy controls included.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-400">
              Built with modern technology for instant responses. Typing indicators and real-time updates.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Access Anywhere
            </h3>
            <p className="text-gray-400">
              Web-based platform accessible from any device. No installation required, just sign in and collaborate.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already collaborating on CollabSpace
          </p>
          <Link
            href="/signup"
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-400">© 2025 CollabSpace. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-gray-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}