"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  MessageSquare, 
  Users, 
  Video, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  Terminal,
  Cpu,
  Activity
} from "lucide-react";

export default function App() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/channels");
    } else {
      setIsChecking(false);
    }

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-white text-2xl tracking-tighter animate-pulse">INITIALIZING_SYSTEM...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden">
      
      {/* Grid Background Effect */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Cursor Follower */}
      <div 
        className="fixed w-96 h-96 bg-[#ccff00] rounded-full blur-[150px] opacity-5 pointer-events-none z-0 mix-blend-screen transition-transform duration-75 ease-out"
        style={{ 
          left: mousePosition.x - 192, 
          top: mousePosition.y - 192 
        }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-xl border-2 border-transparent group-hover:border-[#ccff00] group-hover:bg-black group-hover:text-[#ccff00] transition-all duration-300">
              C
            </div> */}
            <img src="/logo.png" alt="Collab Space Logo" className="w-10 h-10 object-contain"/>
            <span className="text-xl font-bold tracking-tight group-hover:text-[#ccff00] transition-colors">COLLAB SPACE</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-mono text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
              [Login]
            </Link>
            <Link
              href="/signup"
              className="bg-[#ccff00] text-black px-2 sm:px-6 py-2 font-bold text-sm uppercase tracking-wider hover:bg-white hover:scale-105 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]"
            >
              Initialize
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="border-l-2 border-white/20 pl-8 md:pl-16 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#ccff00] text-[#ccff00] text-xs font-mono mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#ccff00] animate-pulse"></span>
            System Online v2.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
            WORK <br />
            <span className="text-transparent stroke-text hover:text-white transition-colors duration-500 cursor-default" style={{ WebkitTextStroke: '2px white' }}>TOGETHER</span> <br />
            <span className="text-[#ccff00]">ANYWHERE.</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mb-12 font-mono leading-relaxed">
            // The communication protocol for high-performance teams. 
            <br/>
            // Zero latency. Maximum security. Total control.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/signup"
              className="group relative px-8 py-4 bg-white text-black font-bold text-lg uppercase tracking-wider overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                Start Protocol <ArrowRight className="w-5 h-5" />
              </span>
              <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
            </Link>
            
            <Link
              href="/login"
              className="px-8 py-4 border border-white/30 text-white font-bold text-lg uppercase tracking-wider hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              Access Terminal
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="w-full bg-[#ccff00] text-black py-4 overflow-hidden border-y-4 border-black transform -rotate-1 z-20 relative">
        <div className="whitespace-nowrap animate-marquee font-black text-2xl uppercase tracking-widest flex gap-8">
          <span>Real-time Sync</span> • <span>WebRTC Video</span> • <span>Encrypted Channels</span> • <span>Zero Latency</span> • <span>Global CDN</span> • 
          <span>Real-time Sync</span> • <span>WebRTC Video</span> • <span>Encrypted Channels</span> • <span>Zero Latency</span> • <span>Global CDN</span> •
        </div>
      </div>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="flex items-end justify-between mb-20 border-b border-white/20 pb-8">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            System <span className="text-gray-600">Modules</span>
          </h2>
          <div className="hidden md:block font-mono text-[#ccff00]">
            06 MODULES LOADED
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-white/20">
          {/* Feature 1 */}
          <div className="group border-r border-b border-white/20 p-10 hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">01</div>
            <MessageSquare className="w-12 h-12 text-white mb-6 group-hover:text-[#ccff00] transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Neural Chat</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Direct neural link for your team. Instant message propagation across all nodes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group border-r border-b border-white/20 p-10 hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">02</div>
            <Video className="w-12 h-12 text-white mb-6 group-hover:text-[#ccff00] transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Visual Uplink</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              High-fidelity visual data transfer. WebRTC powered peer-to-peer communication.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group border-r border-b border-white/20 p-10 hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">03</div>
            <Terminal className="w-12 h-12 text-white mb-6 group-hover:text-[#ccff00] transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Command Channels</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Segregated communication streams for specific project directives.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group border-r border-b border-white/20 p-10 hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">04</div>
            <Shield className="w-12 h-12 text-white mb-6 group-hover:text-[#ccff00] transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Ironclad Security</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              End-to-end encryption protocols active. Data integrity guaranteed.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group border-r border-b border-white/20 p-10 hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">05</div>
            <Cpu className="w-12 h-12 text-white mb-6 group-hover:text-[#ccff00] transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Hyper Processing</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Optimized for maximum throughput. Zero lag architecture.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group border-r border-b border-white/20 p-10 hover:bg-white/5 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">06</div>
            <Activity className="w-12 h-12 text-white mb-6 group-hover:text-[#ccff00] transition-colors duration-300" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Live Telemetry</h3>
            <p className="text-gray-400 font-mono text-sm leading-relaxed">
              Real-time status updates and typing indicators across the network.
            </p>
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="py-32 px-6 border-t border-white/20 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ccff00] transform translate-y-full hover:translate-y-0 transition-transform duration-700 ease-in-out z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10 group">
          <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-12 mix-blend-difference text-white">
            Deploy <br/> Now
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <p className="text-xl font-mono text-gray-400 max-w-xl mix-blend-difference">
              // Join the network. <br/>
              // Establish your secure communication node today.
            </p>
            <Link
              href="/signup"
              className="bg-white text-black px-12 py-6 font-black text-xl uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300 shadow-[8px_8px_0px_0px_#333]"
            >
              Initiate Sequence
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ccff00]"></div>
            <span className="font-mono text-sm text-gray-500">SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <div className="font-mono text-xs text-gray-600">
            COLLAB_SPACE © 2025 // ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .stroke-text {
          -webkit-text-stroke: 1px white;
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}