// app/login/page.js - REX LOGIN PAGE
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';

export default function Login() {
  const { login, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef(null);
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

  // Sistema de partículas de fundo
  const createParticleSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.15 + 0.03,
        pulse: Math.random() * 0.015 + 0.005
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
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity * 0.08})`;
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

      console.log('Executando animações do login - Key:', animationKey);

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
        { selector: '.logo-login', initial: { opacity: 0, translateY: 80, scale: 0.9 } },
        { selector: '.login-portal', initial: { opacity: 0, translateY: 40, scale: 0.95 } },
        { selector: '.form-field', initial: { opacity: 0, translateY: 20 } },
        { selector: '.back-link', initial: { opacity: 0, translateY: 20 } }
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
        const logoEl = document.querySelector('.logo-login');
        const portalEl = document.querySelector('.login-portal');
        const formEls = document.querySelectorAll('.form-field');
        const backEl = document.querySelector('.back-link');

        if (!logoEl || !portalEl || formEls.length === 0 || !backEl) {
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
          targets: '.logo-login',
          translateY: [80, 0],
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 1000,
          easing: 'easeOutBack(1.5)'
        });
        
        // Portal aparece
        tl.add({
          targets: '.login-portal',
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.95, 1],
          duration: 800,
          easing: 'easeOutQuart'
        }, '-=500');
        
        // Campos aparecem em sequência
        tl.add({
          targets: '.form-field',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          delay: window.anime.stagger(100),
          easing: 'easeOutQuart'
        }, '-=400');
        
        // Link de volta aparece
        tl.add({
          targets: '.back-link',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
          easing: 'easeOutQuart'
        }, '-=200');

        // Animação contínua do portal
        setTimeout(() => {
          if (window.anime) {
            window.anime({
              targets: '.login-portal',
              translateY: [-3, 3],
              duration: 4000,
              direction: 'alternate',
              loop: true,
              easing: 'easeInOutSine'
            });
          }
        }, 2000);
      });
    };

    // Executar com delay
    const timer = setTimeout(initAnimations, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [animationKey, mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Credenciais inválidas. Verifique seu email e senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      setError('Erro ao conectar com Google. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
        @keyframes mystical-glow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.2), inset 0 0 20px rgba(251, 191, 36, 0.05);
          }
          50% { 
            box-shadow: 0 0 50px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(251, 191, 36, 0.1);
          }
        }

        @keyframes portal-shimmer {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.6; }
          100% { opacity: 0; transform: translateX(100%); }
        }

        @keyframes field-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
          }
        }
        
        .mystical-glow {
          animation: mystical-glow 6s ease-in-out infinite;
        }

        .portal-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent);
          animation: portal-shimmer 4s ease-in-out infinite;
          border-radius: 1.5rem;
        }

        .field-focus:focus {
          animation: field-glow 2s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stone-texture {
          background: linear-gradient(135deg, 
            rgba(120, 113, 108, 0.4) 0%, 
            rgba(87, 83, 78, 0.5) 25%,
            rgba(68, 64, 60, 0.6) 50%,
            rgba(57, 54, 52, 0.7) 75%,
            rgba(41, 37, 36, 0.8) 100%
          );
        }
      `}</style>
      
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden"
        key={`login-${animationKey}`} // Key para forçar re-render
      >
        {/* Canvas de fundo */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        />
        
        {/* Glow central */}
        <div className="absolute inset-0 bg-radial-gradient from-yellow-500/10 via-transparent to-transparent"></div>
        
        {/* Link de volta */}
        <div className="back-link absolute top-6 left-6 z-20" style={{opacity: 0, transform: 'translateY(20px)'}}>
          <Link 
            href="/" 
            className="group flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-mono text-sm">Voltar ao Reino</span>
          </Link>
        </div>
        
        {/* Container principal */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-4">
          
          {/* Logo REX */}
          <div className="logo-login text-center mb-8" style={{opacity: 0, transform: 'translateY(80px) scale(0.9)'}}>
            <Image
              src="/logorex.png"
              alt="REX - Regions Exchange"
              width={640}
              height={240}
              className="h-40 w-auto sm:h-48 md:h-60 drop-shadow-2xl mx-auto"
              priority
            />
          </div>
          
          {/* Portal de Login */}
          <div className="login-portal relative" style={{opacity: 0, transform: 'translateY(40px) scale(0.95)'}}>
            {/* Container principal do portal */}
            <div className="relative stone-texture backdrop-blur-sm rounded-3xl border-2 border-yellow-500/30 mystical-glow overflow-hidden">
              
              {/* Efeito shimmer */}
              <div className="portal-shimmer absolute inset-0 z-10 pointer-events-none"></div>
              
              {/* Conteúdo do portal */}
              <div className="relative z-20 p-8 sm:p-10">
                
                {/* Título do portal */}
                <div className="text-center mb-8">
                  <h1 className="text-yellow-400 font-mono text-xl sm:text-2xl font-bold tracking-wider mb-2">
                    PORTAL DE ACESSO
                  </h1>
                  <p className="text-gray-400 text-sm font-mono">
                    Adentre o reino com suas credenciais
                  </p>
                </div>
                
                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-6 w-80 sm:w-96">
                  
                  {/* Campo Email */}
                  <div className="form-field" style={{opacity: 0, transform: 'translateY(20px)'}}>
                    <label className="block text-yellow-400 font-mono text-sm font-bold mb-2">
                      EMAIL DO REINO
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field-focus w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white font-mono placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  
                  {/* Campo Senha */}
                  <div className="form-field" style={{opacity: 0, transform: 'translateY(20px)'}}>
                    <label className="block text-yellow-400 font-mono text-sm font-bold mb-2">
                      SENHA SECRETA
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field-focus w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white font-mono placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  {/* Mensagem de erro */}
                  {error && (
                    <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-3">
                      <p className="text-red-400 text-sm font-mono text-center">{error}</p>
                    </div>
                  )}
                  
                  {/* Botão de entrada */}
                  <div className="form-field" style={{opacity: 0, transform: 'translateY(20px)'}}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-mono font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20 disabled:scale-100 disabled:hover:shadow-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          ACESSANDO REINO...
                        </div>
                      ) : (
                        'ENTRAR NO REINO'
                      )}
                    </button>
                  </div>
                  
                  {/* Divisor */}
                  <div className="form-field flex items-center" style={{opacity: 0, transform: 'translateY(20px)'}}>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
                    <span className="px-4 text-gray-400 font-mono text-xs">OU</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
                  </div>
                  
                  {/* Login com Google */}
                  <div className="form-field" style={{opacity: 0, transform: 'translateY(20px)'}}>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-300 text-gray-800 font-mono font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/20 disabled:scale-100 disabled:hover:shadow-none border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                          CONECTANDO...
                        </div>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          ENTRAR COM GOOGLE
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Links adicionais */}
                  <div className="form-field text-center pt-4" style={{opacity: 0, transform: 'translateY(20px)'}}>
                    <p className="text-gray-500 text-xs font-mono mb-3">
                      Não possui acesso ao reino?
                    </p>
                    <div className="space-y-2">
                      <Link 
                        href="/register" 
                        className="block text-yellow-400 hover:text-yellow-300 font-mono text-sm transition-colors duration-300"
                      >
                        Solicitar Acesso ao Reino
                      </Link>
                      <Link 
                        href="/forgot-password" 
                        className="block text-gray-400 hover:text-gray-300 font-mono text-xs transition-colors duration-300"
                      >
                        Esqueci minha senha secreta
                      </Link>
                    </div>
                  </div>
                  
                </form>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Footer discreto */}
        <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-600 font-mono text-xs text-center">
            © 2025 REX • <span className="text-gray-500">O Poder Supremo do Capital</span>
          </p>
        </footer>
      </div>
    </>
  );
}