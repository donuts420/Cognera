import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { PatientProvider } from './context/PatientContext.jsx';
import { LocaleProvider } from './context/LocaleContext.jsx';
import { ConnectivityProvider } from './context/ConnectivityContext.jsx';
import { PlayerProvider } from './context/PlayerContext.jsx';
import './theme.css';
import './styles.css';
import './styles/player.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PatientProvider>
          <LocaleProvider>
            <ConnectivityProvider>
              <PlayerProvider>
                <App />
              </PlayerProvider>
            </ConnectivityProvider>
          </LocaleProvider>
        </PatientProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
