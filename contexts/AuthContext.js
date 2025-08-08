// contexts/AuthContext.js - VERSÃO CORRIGIDA SEM DUPLICAÇÃO
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========== CONFIGURAÇÃO DO GOOGLE PROVIDER ==========
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account' // Força seleção de conta
  });

  // ========== MONITORAR ESTADO DE AUTENTICAÇÃO ==========
  useEffect(() => {
    console.log('🔐 Iniciando monitoramento de autenticação...');
    let unsubscribeUserData = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Estado de auth mudou:', firebaseUser?.email || 'Não logado');

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          console.log('📊 Configurando listener para dados do usuário...');

          // Configurar listener para dados do usuário em tempo real
          const userDocRef = doc(db, 'users', firebaseUser.uid);

          // Primeiro, verificar se o documento existe
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            console.log('⚠️ Usuário autenticado mas sem dados no Firestore - criando documento básico');

            // Criar documento básico para usuários do Google ou que não têm dados
            const basicUserData = {
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              phone: '',
              balance: 0,
              createdAt: new Date(),
              inventory: {
                GOLD: 0,
                OIL: 0,
                ORE: 0,
                DIA: 0,
                URA: 0,
                CASH: 0
              },
              isGoogleUser: firebaseUser.providerData.some(p => p.providerId === 'google.com')
            };

            await setDoc(userDocRef, basicUserData);
            console.log('✅ Dados básicos criados');
          }

          // Configurar listener em tempo real
          unsubscribeUserData = onSnapshot(
            userDocRef,
            (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                console.log('🔄 Dados do usuário atualizados:', data.name);
                setUserData(data);
              } else {
                console.log('❌ Documento do usuário não encontrado');
                setUserData(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('❌ Erro no listener dos dados do usuário:', error);
              setLoading(false);
            }
          );

        } catch (error) {
          console.error('❌ Erro ao configurar dados do usuário:', error);
          setUser(firebaseUser);
          setUserData(null);
          setLoading(false);
        }
      } else {
        console.log('🚪 Usuário deslogado');
        setUser(null);
        setUserData(null);
        setLoading(false);
        // Limpar listener se o usuário fez logout
        unsubscribeUserData();
      }
    });

    return () => {
      console.log('🔐 Parando monitoramento de autenticação');
      unsubscribe();
      unsubscribeUserData();
    };
  }, []);

  // ========== LOGIN COM EMAIL E SENHA ==========
  const login = async (email, password) => {
    console.log('📧 Tentando login com email:', email);

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login bem-sucedido:', userCredential.user.email);

      toast.success('🏰 Bem-vindo de volta ao Reino!');
      return userCredential;

    } catch (error) {
      console.error('❌ Erro no login:', error);

      let errorMessage = 'Erro ao fazer login';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciais inválidas';
          break;
        default:
          errorMessage = 'Credenciais inválidas';
      }

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== LOGIN COM GOOGLE ==========
  const loginWithGoogle = async () => {
    console.log('🔗 Iniciando login com Google...');

    try {
      setLoading(true);

      // Limpar cache do provider para forçar seleção de conta
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('🔗 Abrindo popup do Google...');
      const result = await signInWithPopup(auth, googleProvider);

      console.log('✅ Popup fechado com sucesso');
      console.log('👤 Usuário Google:', result.user.email);

      const firebaseUser = result.user;

      // Verificar se já existe no Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log('📝 Criando novo usuário Google no Firestore...');

        // Criar novo documento para usuário Google
        const newUserData = {
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          phone: '', // Será preenchido posteriormente
          balance: 0,
          createdAt: new Date(),
          inventory: {
            GOLD: 0,
            OIL: 0,
            ORE: 0,
            DIA: 0,
            URA: 0,
            CASH: 0
          },
          isGoogleUser: true,
          photoURL: firebaseUser.photoURL || null
        };

        await setDoc(userDocRef, newUserData);
        console.log('✅ Usuário Google criado no Firestore');

        toast.success('🎉 Bem-vindo ao Reino REX!');
      } else {
        console.log('✅ Usuário Google já existe no Firestore');
        toast.success('🏰 Bem-vindo de volta!');
      }

      return result;

    } catch (error) {
      console.error('❌ Erro detalhado no login Google:', error);

      let errorMessage = 'Erro ao conectar com Google';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login cancelado pelo usuário';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup bloqueado. Verifique seu navegador';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Aguarde um momento';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Login com Google não habilitado';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Email já cadastrado com outro método';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Popup cancelado';
          break;
        default:
          if (error.message.includes('popup')) {
            errorMessage = 'Erro no popup. Tente novamente';
          } else if (error.message.includes('network')) {
            errorMessage = 'Erro de rede. Verifique sua conexão';
          }
      }

      console.log('📱 Mensagem de erro:', errorMessage);
      throw new Error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  // ========== LOGOUT ==========
  const logout = async () => {
    console.log('🚪 Fazendo logout...');

    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      console.log('✅ Logout realizado');
      toast.success('👋 Até logo!');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      toast.error('Erro ao sair');
    }
  };

  // ========== ATUALIZAR DADOS DO USUÁRIO ==========
  const updateUserData = async (newData) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, newData, { merge: true });

      setUserData(prev => ({ ...prev, ...newData }));
      console.log('✅ Dados do usuário atualizados');

    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      throw error;
    }
  };

  // ========== VERIFICAR SE ESTÁ LOGADO ==========
  const isAuthenticated = () => {
    return !!user && !!userData;
  };

  // ========== VERIFICAR SE É USUÁRIO GOOGLE ==========
  const isGoogleUser = () => {
    return userData?.isGoogleUser || false;
  };

  // ========== VALUE DO CONTEXT ==========
  const value = {
    // Estado
    user,
    userData,
    loading,

    // Funções de autenticação
    login,
    loginWithGoogle,
    logout,

    // Funções utilitárias
    updateUserData,
    isAuthenticated,
    isGoogleUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;