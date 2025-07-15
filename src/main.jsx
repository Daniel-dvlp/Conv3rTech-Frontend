import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '/src/index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';   
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from 'react-toastify';


function MainApp() {
  return (
    <>
      <App />
      <ToastContainer />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
