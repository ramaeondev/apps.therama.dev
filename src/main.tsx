import { createRoot } from 'react-dom/client'
import './index.css'; // global styles + design tokens
import App from './App.tsx';

createRoot(document.getElementById("root")!).render(<App />);