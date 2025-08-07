// app/page.js - REX HOME PAGE
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Garantir hidratação
  useEffect(() => {
    setMounted(true);
    // Forçar novo ciclo de animação
    setAnimationKey(prev => prev + 1);
  }, []);

  // Effect que monitora mudanças de página/navegação
  useEffect(() => {
    if (mounted) {
      // Gerar nova key para forçar re-execução
      setAnimationKey(prev => prev + 1);
    }
  }, [mounted, router.asPath]);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Sistema de partículas elegante
  const createParticleSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Criar partículas sutis
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.2 + 0.05,
        pulse: Math.random() * 0.02 + 0.01
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        const pulse = Math.sin(frame * particle.pulse) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;
        
        // Rebote suave
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
        ctx.fill();
        
        // Glow sutil
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity * 0.1})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Função principal de animação - será chamada toda vez que animationKey mudar
  useEffect(() => {
    if (!mounted || animationKey === 0) return;

    const initAnimations = () => {
      // Aguardar disponibilidade do anime.js
      if (typeof window === 'undefined' || !window.anime) {
        setTimeout(initAnimations, 100);
        return;
      }

      console.log('Executando animações - Key:', animationKey);

      // Setup do canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);
        
        createParticleSystem();
      }

      // Resetar todos os elementos para estado inicial
      const elements = [
        { selector: '.logo-rex', initial: { opacity: 0, translateY: 100, scale: 0.8 } },
        { selector: '.cascade-element', initial: { opacity: 0, translateY: 50, scale: 0.9 } },
        { selector: '.carousel-container', initial: { opacity: 0, translateY: 30 } }
      ];

      elements.forEach(({ selector, initial }) => {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
          el.style.opacity = initial.opacity;
          el.style.transform = `translateY(${initial.translateY}px) ${initial.scale ? `scale(${initial.scale})` : ''}`;
        });
      });

      // Aguardar próximo frame para executar animações
      requestAnimationFrame(() => {
        // Verificar se elementos existem
        const logoEl = document.querySelector('.logo-rex');
        const cascadeEls = document.querySelectorAll('.cascade-element');
        const carouselEl = document.querySelector('.carousel-container');

        if (!logoEl || cascadeEls.length === 0 || !carouselEl) {
          console.log('Elementos não encontrados, reexecutando...');
          setTimeout(initAnimations, 200);
          return;
        }

        // Parar animações anteriores
        try {
          if (window.anime.running) {
            window.anime.running.forEach(anim => {
              if (anim && typeof anim.pause === 'function') {
                anim.pause();
              }
            });
          }
        } catch (e) {
          console.log('Erro ao parar animações:', e);
        }

        // Criar timeline de animações
        const tl = window.anime.timeline({
          autoplay: true
        });
        
        // Logo aparece
        tl.add({
          targets: '.logo-rex',
          translateY: [100, 0],
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 1200,
          easing: 'easeOutBack(2)'
        });
        
        // Elementos cascata
        tl.add({
          targets: '.cascade-element',
          opacity: [0, 1],
          translateY: [50, 0],
          scale: [0.9, 1],
          duration: 800,
          delay: window.anime.stagger(150),
          easing: 'easeOutQuart'
        }, '-=500');
        
        // Carrossel
        tl.add({
          targets: '.carousel-container',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutQuad'
        }, '-=400');
        
        // Animações contínuas
        setTimeout(() => {
          if (window.anime) {
            window.anime({
              targets: '.rex-glow',
              opacity: [0.3, 0.6, 0.3],
              scale: [0.9, 1.1, 0.9],
              duration: 6000,
              loop: true,
              easing: 'easeInOutSine'
            });

            window.anime({
              targets: '.castle-portal',
              translateY: [-5, 5],
              duration: 3000,
              direction: 'alternate',
              loop: true,
              easing: 'easeInOutSine'
            });
          }
        }, 2500);
      });
    };

    // Executar com delay
    const timer = setTimeout(initAnimations, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [animationKey, mounted]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Evitar flash antes da hidratação
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <Image
              src="/loading.png"
              alt="Carregando REX..."
              width={128}
              height={128}
              className="animate-spin drop-shadow-2xl"
              priority
            />
          </div>
          <p className="text-yellow-400 font-mono text-lg font-bold tracking-wider animate-pulse">
            CARREGANDO REINO...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" 
      />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
            transform: scale(1.02);
          }
        }
        
        @keyframes scroll-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes mystical-glow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1);
          }
          50% { 
            box-shadow: 0 0 60px rgba(251, 191, 36, 0.6), inset 0 0 30px rgba(251, 191, 36, 0.2);
          }
        }

        @keyframes portal-shimmer {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(100%); }
        }
        
        .scroll-carousel {
          animation: scroll-infinite 25s linear infinite;
        }
        
        .scroll-carousel:hover {
          animation-play-state: paused;
        }

        .mystical-glow {
          animation: mystical-glow 4s ease-in-out infinite;
        }

        .portal-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent);
          animation: portal-shimmer 3s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden relative"
        onMouseMove={handleMouseMove}
        key={`home-${animationKey}`} // Key para forçar re-render
      >
        {/* Canvas de fundo */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        />
        
        {/* Gradiente de foco central */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-gray-900/50"></div>
        
        {/* Container principal centralizado */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
          
          {/* Glow de fundo */}
          <div className="rex-glow absolute w-[600px] h-[600px] bg-gradient-radial from-yellow-500/20 via-yellow-400/10 to-transparent rounded-full blur-3xl"></div>
          
          {/* Logo REX */}
          <div className="rex-container text-center mb-2 relative z-10">
            <div className="flex justify-center items-center mb-2">
              <Image
                src="/logorex.png"
                alt="REX - Regions Exchange"
                width={640}
                height={240}
                className="logo-rex drop-shadow-2xl h-40 w-auto sm:h-48 md:h-60"
                priority
                style={{ opacity: 0, transform: 'translateY(100px) scale(0.8)' }}
              />
            </div>
          </div>
          
          {/* Slogan */}
          <div className="cascade-element text-center mb-8 sm:mb-12 max-w-2xl px-4" style={{opacity: 0, transform: 'translateY(50px) scale(0.9)'}}>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-mono font-bold mb-4 sm:mb-6 leading-tight">
              A NOVA <span className="gradient-text">POTÊNCIA</span><br/>
              DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">RIVAL REGIONS</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              A corretora que domina o universo Rival Regions.
              <span className="block text-yellow-400 font-bold mt-2 text-sm sm:text-base">
                Poder supremo. Recursos infinitos.
              </span>
            </p>
          </div>
          
          {/* Portal das Portas do Castelo */}
          <div className="cascade-element flex flex-col items-center mb-8 sm:mb-12" style={{opacity: 0, transform: 'translateY(50px) scale(0.9)'}}>
            <Link href="/login" className="group relative">
              {/* Efeitos mágicos de fundo */}
              <div className="absolute -inset-16 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent rounded-full blur-2xl group-hover:from-yellow-400/20 transition-all duration-1000"></div>
              
              {/* Container principal da porta */}
              <div className="castle-portal relative bg-gradient-to-b from-stone-800/60 to-stone-900/80 backdrop-blur-sm rounded-3xl border-2 border-yellow-500/30 group-hover:border-yellow-400/70 transition-all duration-700 overflow-hidden mystical-glow">
                
                {/* Efeito shimmer */}
                <div className="portal-shimmer absolute inset-0 z-10"></div>
                
                {/* Imagem da porta */}
                <div className="relative p-8 group-hover:p-6 transition-all duration-500">
                  <Image
                    src="/porta.png"
                    alt="Portas do Reino REX"
                    width={180}
                    height={220}
                    className="drop-shadow-2xl group-hover:drop-shadow-[0_0_50px_rgba(251,191,36,0.8)] transition-all duration-700 group-hover:scale-110"
                    priority
                  />
                </div>
                
                {/* Texto místico na parte inferior */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/50">
                    <p className="text-yellow-400 font-mono text-xs font-bold text-center">
                      ADENTRE O REINO
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Texto de convite abaixo */}
              <div className="text-center mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-gray-400 text-xs font-mono">
                  As portas do império se abrem
                </p>
              </div>
            </Link>
          </div>
          
          {/* Carrossel de Recursos */}
          <div className="carousel-container w-full max-w-4xl px-4" style={{opacity: 0, transform: 'translateY(30px)'}}>
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-yellow-400 font-mono text-sm sm:text-base md:text-lg font-bold tracking-wider mb-2">
                ⚡ RECURSOS DISPONÍVEIS ⚡
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Negocie com poder total no marketplace
              </p>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl glass-effect p-3 sm:p-4 opacity-60 hover:opacity-80 transition-opacity duration-500">
              <div className="scroll-carousel flex space-x-3 sm:space-x-4">
                {[
                  {emoji: '🏆', name: 'STATE GOLD', desc: 'Ouro Estatal', colors: 'from-yellow-500 to-yellow-600'},
                  {emoji: '🛢️', name: 'OIL', desc: 'Petróleo Bruto', colors: 'from-gray-600 to-gray-700'},
                  {emoji: '⛏️', name: 'ORE', desc: 'Minério Ferro', colors: 'from-orange-500 to-orange-600'},
                  {emoji: '💎', name: 'DIAMOND', desc: 'Diamantes', colors: 'from-blue-500 to-blue-600'},
                  {emoji: '☢️', name: 'URANIUM', desc: 'Urânio Puro', colors: 'from-green-500 to-green-600'},
                  {emoji: '💵', name: 'STATE CASH', desc: 'Moeda Estatal', colors: 'from-emerald-500 to-emerald-600'},
                  {emoji: '💰', name: 'PLAYER CASH', desc: 'Dinheiro Player', colors: 'from-purple-500 to-purple-600'},
                  {emoji: '🔋', name: 'ENERGY', desc: 'Energia Limpa', colors: 'from-cyan-500 to-cyan-600'}
                ].concat([
                  {emoji: '🏆', name: 'STATE GOLD', desc: 'Ouro Estatal', colors: 'from-yellow-500 to-yellow-600'},
                  {emoji: '🛢️', name: 'OIL', desc: 'Petróleo Bruto', colors: 'from-gray-600 to-gray-700'},
                  {emoji: '⛏️', name: 'ORE', desc: 'Minério Ferro', colors: 'from-orange-500 to-orange-600'},
                  {emoji: '💎', name: 'DIAMOND', desc: 'Diamantes', colors: 'from-blue-500 to-blue-600'},
                  {emoji: '☢️', name: 'URANIUM', desc: 'Urânio Puro', colors: 'from-green-500 to-green-600'},
                  {emoji: '💵', name: 'STATE CASH', desc: 'Moeda Estatal', colors: 'from-emerald-500 to-emerald-600'},
                  {emoji: '💰', name: 'PLAYER CASH', desc: 'Dinheiro Player', colors: 'from-purple-500 to-purple-600'},
                  {emoji: '🔋', name: 'ENERGY', desc: 'Energia Limpa', colors: 'from-cyan-500 to-cyan-600'}
                ]).map((resource, i) => (
                  <div 
                    key={`${resource.name}-${i}`}
                    className={`flex-shrink-0 w-24 sm:w-28 md:w-32 h-32 sm:h-36 md:h-40 bg-gradient-to-br ${resource.colors} rounded-lg shadow-md border border-white/10 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-300 cursor-pointer group relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                        {resource.emoji}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-white font-bold px-1 leading-tight mb-1">
                        {resource.name}
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-white/70 px-1">
                        {resource.desc}
                      </div>
                      <div className="w-6 sm:w-8 h-0.5 bg-white/20 mt-1 sm:mt-2 mx-auto group-hover:bg-white/40 transition-colors duration-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Fade gradients */}
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-800/80 to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-800/80 to-transparent pointer-events-none z-10"></div>
            </div>
            
            {/* Admin Info - Ultra discreto */}
            <div className="text-center mt-8 opacity-50">
              <p className="text-gray-600 font-mono text-xs">
                Administrado por <span className="text-gray-500">@GirokaRR</span> • 
                <a 
                  href="https://t.me/GirokaRR" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-400 ml-1 transition-colors duration-300"
                >
                  Telegram
                </a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer minimalista */}
        <footer className="relative bg-black/60 backdrop-blur-sm border-t border-gray-700/50 py-6 sm:py-8">
          <div className="text-center px-4">
            <div className="mb-3 sm:mb-4">
              <p className="text-yellow-400 font-mono text-sm sm:text-base md:text-lg font-bold tracking-wider mb-2">
                "O PODER SUPREMO DO CAPITAL"
              </p>
            </div>
            
            <div className="text-xs sm:text-sm space-y-2 sm:space-y-3">
              <p className="text-gray-400 font-mono">
                Desenvolvido por <span className="text-gray-200 font-bold">Alison Schatz</span>
              </p>
              <div className="flex justify-center space-x-4 sm:space-x-6">
                <a 
                  href="https://github.com/alisonschatz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 font-mono text-xs sm:text-sm flex items-center"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a 
                  href="https://www.linkedin.com/in/alison-schatz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 font-mono text-xs sm:text-sm flex items-center"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
              <p className="text-gray-500 font-mono text-[10px] sm:text-xs">
                © 2025 REX • React • Next.js • Firebase
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}