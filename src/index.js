import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 
import { CurrencyProvider } from './contexts/CurrencyContext';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <CurrencyProvider>  
      <App />
    </CurrencyProvider>
    </BrowserRouter>
  </React.StrictMode>
);
