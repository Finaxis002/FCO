import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css'; // Ensure global styles are imported
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is included globally


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>,
);
