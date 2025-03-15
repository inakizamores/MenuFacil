import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  common: {
    welcome: 'Welcome to MenúFácil',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
  },
  landing: {
    hero: {
      title: 'Digital Menus Made Simple',
      subtitle: 'Create beautiful digital menus for your restaurant in minutes',
      cta: 'Get Started',
    },
    features: {
      title: 'Why Choose MenúFácil?',
      feature1: {
        title: 'Multi-Language Support',
        description: 'Offer your menu in multiple languages to cater to all your customers',
      },
      feature2: {
        title: 'Real-Time Updates',
        description: 'Update dish availability in real-time with a single click',
      },
      feature3: {
        title: 'Beautiful Templates',
        description: 'Choose from a variety of professionally designed templates',
      },
    },
    pricing: {
      title: 'Simple Pricing',
      description: 'One flat fee per restaurant. No hidden costs.',
      price: '$20',
      period: 'per restaurant / month',
      cta: 'Start Free Trial',
    },
  },
};

// Spanish translations
const esTranslations = {
  common: {
    welcome: 'Bienvenido a MenúFácil',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: '¿Olvidaste tu Contraseña?',
    resetPassword: 'Restablecer Contraseña',
  },
  landing: {
    hero: {
      title: 'Menús Digitales Simplificados',
      subtitle: 'Crea hermosos menús digitales para tu restaurante en minutos',
      cta: 'Comenzar',
    },
    features: {
      title: '¿Por qué elegir MenúFácil?',
      feature1: {
        title: 'Soporte Multi-Idioma',
        description: 'Ofrece tu menú en varios idiomas para atender a todos tus clientes',
      },
      feature2: {
        title: 'Actualizaciones en Tiempo Real',
        description: 'Actualiza la disponibilidad de platos en tiempo real con un solo clic',
      },
      feature3: {
        title: 'Plantillas Hermosas',
        description: 'Elige entre una variedad de plantillas diseñadas profesionalmente',
      },
    },
    pricing: {
      title: 'Precios Simples',
      description: 'Una tarifa fija por restaurante. Sin costos ocultos.',
      price: '$20',
      period: 'por restaurante / mes',
      cta: 'Comenzar Prueba Gratuita',
    },
  },
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: enTranslations,
    es: esTranslations,
  },
  lng: 'es', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n; 