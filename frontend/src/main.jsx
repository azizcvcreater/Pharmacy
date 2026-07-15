// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n' // Import i18n configuration

// Set initial language from localStorage or default to English
const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
const rtlLanguages = ['ps', 'fa-AF'];
document.documentElement.dir = rtlLanguages.includes(savedLanguage) ? 'rtl' : 'ltr';
document.documentElement.lang = savedLanguage;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)