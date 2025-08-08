// app/register/page.js - REX REGISTER PAGE
'use client';

import { useState, useRef, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const canvasRef = useRef(null);
  const router = useRouter();

  // Garantir hidratação
  useEffect(() => {
    setMounted(true);
    setAnimationKey(prev => prev + 1);
  }, []);

  // Effect que monitora mudanças de página/navegação
  useEffect(() => {
    if (mounted) {
      setAnimationKey(prev => prev + 1);
    }
  }, [mounted, router.asPath]);

  // Sistema de partículas de fundo
  const createParticleSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.0 + 0.2,
        opacity: Math.random() * 0.12 + 0.02,
        pulse: Math.random() * 0.012 + 0.004
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
        ctx.arc(particle.x, particle.y, particle.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity * 0.06})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Função principal de animação
  useEffect(() => {
    if (!mounted || animationKey === 0) return;

    const initAnimations = () => {
      if (typeof window === 'undefined' || !window.anime) {
        setTimeout(initAnimations, 100);
        return;
      }

      console.log('Executando animações do registro - Key:', animationKey);

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

      // Resetar elementos
      const elements = [
        { selector: '.logo-register', initial: { opacity: 0, translateY: 60, scale: 0.9 } },
        { selector: '.register-portal', initial: { opacity: 0, translateY: 30, scale: 0.95 } },
        { selector: '.form-row', initial: { opacity: 0, translateY: 15 } },
        { selector: '.back-link', initial: { opacity: 0, translateY: 15 } }
      ];

      elements.forEach(({ selector, initial }) => {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
          el.style.opacity = initial.opacity;
          el.style.transform = `translateY(${initial.translateY}px) ${initial.scale ? `scale(${initial.scale})` : ''}`;
        });
      });

      requestAnimationFrame(() => {
        const logoEl = document.querySelector('.logo-register');
        const portalEl = document.querySelector('.register-portal');
        const formEls = document.querySelectorAll('.form-row');
        const backEl = document.querySelector('.back-link');

        if (!logoEl || !portalEl || formEls.length === 0 || !backEl) {
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

        // Timeline de animações
        const tl = window.anime.timeline({
          autoplay: true
        });
        
        // Logo aparece
        tl.add({
          targets: '.logo-register',
          translateY: [60, 0],
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 900,
          easing: 'easeOutBack(1.5)'
        });
        
        // Portal aparece
        tl.add({
          targets: '.register-portal',
          opacity: [0, 1],
          translateY: [30, 0],
          scale: [0.95, 1],
          duration: 700,
          easing: 'easeOutQuart'
        }, '-=400');
        
        // Campos aparecem em sequência
        tl.add({
          targets: '.form-row',
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 500,
          delay: window.anime.stagger(80),
          easing: 'easeOutQuart'
        }, '-=300');
        
        // Link de volta aparece
        tl.add({
          targets: '.back-link',
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 400,
          easing: 'easeOutQuart'
        }, '-=200');

        // Animação contínua do portal
        setTimeout(() => {
          if (window.anime) {
            window.anime({
              targets: '.register-portal',
              translateY: [-2, 2],
              duration: 5000,
              direction: 'alternate',
              loop: true,
              easing: 'easeInOutSine'
            });
          }
        }, 1800);
      });
    };

    const timer = setTimeout(initAnimations, 250);
    return () => clearTimeout(timer);
  }, [animationKey, mounted]);

  // Função para formatar telefone
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, area, first, second) => {
        if (second) {
          return `(${area}) ${first}-${second}`;
        } else if (first) {
          return `(${area}) ${first}`;
        } else if (area) {
          return `(${area}`;
        }
        return digits;
      });
    } else {
      return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (match, area, first, second) => {
        if (second) {
          return `(${area}) ${first}-${second}`;
        } else if (first) {
          return `(${area}) ${first}`;
        } else if (area) {
          return `(${area}`;
        }
        return digits;
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('🏰 NICKNAME DO REINO É OBRIGATÓRIO!');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('📧 EMAIL DO REINO É OBRIGATÓRIO!');
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast.error('📱 TELEFONE DO REINO É OBRIGATÓRIO!');
      return false;
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error('📱 TELEFONE DEVE TER PELO MENOS 10 DÍGITOS!');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('🔒 SENHA DEVE TER NO MÍNIMO 6 CARACTERES!');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('⚠️ SENHAS NÃO COINCIDEM!');
      return false;
    }
    
    return true;
  };

  const createUserAccount = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      console.log('🔐 Criando conta para:', formData.email);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('✅ Usuário criado no Auth:', userCredential.user.uid);

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        balance: 0,
        createdAt: new Date(),
        inventory: {
          GOLD: 0,
          OIL: 0,
          ORE: 0,
          DIA: 0,
          URA: 0,
          CASH: 0
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      console.log('✅ Dados salvos no Firestore');
      
      toast.success('🏆 BEM-VINDO AO REINO REX!');
      
      router.push('/dashboard');
      
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('⚠️ EMAIL JÁ PERTENCE A OUTRO REINO!');
          break;
        case 'auth/invalid-email':
          toast.error('⚠️ EMAIL INVÁLIDO PARA O REINO!');
          break;
        case 'auth/weak-password':
          toast.error('⚠️ SENHA MUITO FRACA PARA O REINO!');
          break;
        default:
          toast.error('⚠️ ERRO AO FUNDAR REINO!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" 
      />
      
      <style jsx>{`
        @keyframes mystical-glow {
          0%, 100% { 
            box-shadow: 0 0 25px rgba(251, 191, 36, 0.15), inset 0 0 15px rgba(251, 191, 36, 0.03);
          }
          50% { 
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 25px rgba(251, 191, 36, 0.08);
          }
        }

        @media (min-width: 640px) {
          @keyframes mystical-glow {
            0%, 100% { 
              box-shadow: 0 0 30px rgba(251, 191, 36, 0.2), inset 0 0 20px rgba(251, 191, 36, 0.05);
            }
            50% { 
              box-shadow: 0 0 50px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(251, 191, 36, 0.1);
            }
          }
        }

        @keyframes portal-shimmer {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.3; }
          100% { opacity: 0; transform: translateX(100%); }
        }

        @media (min-width: 640px) {
          @keyframes portal-shimmer {
            0% { opacity: 0; transform: translateX(-100%); }
            50% { opacity: 0.5; }
            100% { opacity: 0; transform: translateX(100%); }
          }
        }

        @keyframes field-glow {
          0%, 100% { 
            box-shadow: 0 0 6px rgba(251, 191, 36, 0.06);
          }
          50% { 
            box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
          }
        }

        @media (min-width: 640px) {
          @keyframes field-glow {
            0%, 100% { 
              box-shadow: 0 0 8px rgba(251, 191, 36, 0.08);
            }
            50% { 
              box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
            }
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
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.12), transparent);
          animation: portal-shimmer 5s ease-in-out infinite;
          border-radius: 1rem;
        }

        @media (min-width: 640px) {
          .portal-shimmer::before {
            background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.18), transparent);
            border-radius: 1.5rem;
          }
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
        
        .stone-texture {
          background: linear-gradient(135deg, 
            rgba(120, 113, 108, 0.25) 0%, 
            rgba(87, 83, 78, 0.35) 25%,
            rgba(68, 64, 60, 0.45) 50%,
            rgba(57, 54, 52, 0.55) 75%,
            rgba(41, 37, 36, 0.65) 100%
          );
        }

        @media (min-width: 640px) {
          .stone-texture {
            background: linear-gradient(135deg, 
              rgba(120, 113, 108, 0.3) 0%, 
              rgba(87, 83, 78, 0.4) 25%,
              rgba(68, 64, 60, 0.5) 50%,
              rgba(57, 54, 52, 0.6) 75%,
              rgba(41, 37, 36, 0.7) 100%
            );
          }
        }
      `}</style>
      
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden"
        key={`register-${animationKey}`}
      >
        {/* Canvas de fundo */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-15 sm:opacity-25"
        />
        
        {/* Glow central */}
        <div className="absolute inset-0 bg-radial-gradient from-yellow-500/4 via-transparent to-transparent sm:from-yellow-500/8"></div>
        
        {/* Link de volta */}
        <div className="back-link absolute top-4 left-4 sm:top-6 sm:left-6 z-20" style={{opacity: 0, transform: 'translateY(15px)'}}>
          <Link 
            href="/login" 
            className="group flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-300"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-mono text-xs sm:text-sm">Voltar ao Reino</span>
          </Link>
        </div>
        
        {/* Container principal */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
          
          {/* Logo REX */}
          <div className="logo-register text-center mb-4 sm:mb-6" style={{opacity: 0, transform: 'translateY(60px) scale(0.9)'}}>
            <Image
              src="/logorex.png"
              alt="REX - Regions Exchange"
              width={640}
              height={240}
              className="h-28 w-auto xs:h-32 sm:h-40 md:h-48 lg:h-56 drop-shadow-2xl mx-auto"
              priority
            />
          </div>
          
          {/* Portal de Registro */}
          <div className="register-portal relative w-full max-w-xs xs:max-w-sm sm:max-w-lg" style={{opacity: 0, transform: 'translateY(30px) scale(0.95)'}}>
            {/* Container principal do portal */}
            <div className="relative stone-texture backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 border-yellow-500/30 mystical-glow overflow-hidden">
              
              {/* Efeito shimmer */}
              <div className="portal-shimmer absolute inset-0 z-10 pointer-events-none"></div>
              
              {/* Conteúdo do portal */}
              <div className="relative z-20 p-4 xs:p-5 sm:p-6 md:p-8">
                
                {/* Título do portal */}
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-yellow-400 font-mono text-lg xs:text-xl sm:text-2xl font-bold tracking-wider mb-2">
                    FUNDAR NOVO REINO
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm font-mono">
                    Estabeleça seu domínio no universo REX
                  </p>
                </div>
                
                {/* Formulário */}
                <form onSubmit={createUserAccount} className="space-y-4 sm:space-y-5">
                  
                  {/* Nome */}
                  <div className="form-row" style={{opacity: 0, transform: 'translateY(15px)'}}>
                    <label className="block text-yellow-400 font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                      NOME DO SOBERANO
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="field-focus w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/50 border-2 border-yellow-500/30 rounded-lg sm:rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                      placeholder="Seu nome majestoso"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email e Telefone em linha no desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Email */}
                    <div className="form-row" style={{opacity: 0, transform: 'translateY(15px)'}}>
                      <label className="block text-yellow-400 font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        EMAIL REAL
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="field-focus w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/50 border-2 border-yellow-500/30 rounded-lg sm:rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                        placeholder="seu@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {/* Telefone */}
                    <div className="form-row" style={{opacity: 0, transform: 'translateY(15px)'}}>
                      <label className="block text-yellow-400 font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        TELEFONE REAL
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="field-focus w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/50 border-2 border-yellow-500/30 rounded-lg sm:rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                        placeholder="(11) 99999-9999"
                        required
                        disabled={isLoading}
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* Senha e Confirmar Senha em linha no desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Senha */}
                    <div className="form-row" style={{opacity: 0, transform: 'translateY(15px)'}}>
                      <label className="block text-yellow-400 font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        SENHA SECRETA
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="field-focus w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/50 border-2 border-yellow-500/30 rounded-lg sm:rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                        placeholder="••••••••"
                        minLength={6}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {/* Confirmar Senha */}
                    <div className="form-row" style={{opacity: 0, transform: 'translateY(15px)'}}>
                      <label className="block text-yellow-400 font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2">
                        CONFIRMAR SENHA
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="field-focus w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/50 border-2 border-yellow-500/30 rounded-lg sm:rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:border-yellow-400/70 focus:outline-none transition-all duration-300"
                        placeholder="••••••••"
                        minLength={6}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  {/* Botão de criação */}
                  <div className="form-row pt-2" style={{opacity: 0, transform: 'translateY(15px)'}}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-mono font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20 disabled:scale-100 disabled:hover:shadow-none text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-xs sm:text-sm">FUNDANDO REINO...</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm">FUNDAR REINO REX</span>
                      )}
                    </button>
                  </div>
                  
                  {/* Links adicionais */}
                  <div className="form-row text-center pt-2 sm:pt-4" style={{opacity: 0, transform: 'translateY(15px)'}}>
                    <p className="text-gray-500 text-xs font-mono mb-2 sm:mb-3">
                      Já possui um reino?
                    </p>
                    <div className="space-y-1 sm:space-y-2">
                      <Link 
                        href="/login" 
                        className="block text-yellow-400 hover:text-yellow-300 font-mono text-xs sm:text-sm transition-colors duration-300"
                      >
                        Entrar no Reino Existente
                      </Link>
                    </div>
                  </div>
                  
                </form>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Footer discreto */}
        <footer className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 px-4">
          <p className="text-gray-600 font-mono text-xs text-center">
            © 2025 REX • <span className="text-gray-500">Expansão dos Reinos</span>
          </p>
        </footer>
      </div>
    </>
  );
}