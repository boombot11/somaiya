import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import Landing from './components/Landing';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import TrialDashboard from './components/TrialDashboard';
import FloatingButton from './components/FloatingButton';
import WebBot from './components/WebBot/Chatbot';
import { LogProvider } from './components/contexts/LogContext';
import { UrlProvider } from './components/contexts/urlContext';
import TaxManager from './components/TaxManager';

function App() {
  return (
    <>
    <UrlProvider>
    <LogProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Doc" element={<TaxManager />} />
        </Routes>

        {/* Render the FloatingButton component on all pages */}
        <FloatingButton />
        <WebBot/>
      </BrowserRouter>
    </LogProvider>
    </UrlProvider>
    </>
  );
}

export default App;
