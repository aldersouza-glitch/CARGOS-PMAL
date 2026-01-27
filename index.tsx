
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erro fatal na montagem do React:", error);
    container.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif;">
      <h2>Erro de Inicialização</h2>
      <p>A aplicação não pôde ser carregada. Verifique o console do navegador.</p>
    </div>`;
  }
}
