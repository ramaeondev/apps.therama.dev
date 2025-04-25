import { createRoot } from 'react-dom/client'
import './styles/ag-theme-alpine.css'; // Only import what exists
import './styles/ag-theme-alpine-dark.css'; // <-- This line imports your dark theme
import './index.css'; // your global styles
import App from './App.tsx';

createRoot(document.getElementById("root")!).render(<App />);