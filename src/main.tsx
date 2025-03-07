import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';
import { MessageProvider } from './context/MessageContext';
import { QuizProvider } from './context/QuizContext';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MessageProvider>
          <MatchProvider>
            <QuizProvider>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </QuizProvider>
          </MatchProvider>
        </MessageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);