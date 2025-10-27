import { createRoot } from 'react-dom/client'
import App from './App.tsx';
import "@fontsource/roboto/400.css";
import "@fontsource/poppins/400.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { initClarity } from "./helpers/ms-clarity.tsx";
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';

initClarity();

// if (window.location.hostname === 'localhost') {
//   (function (c: any, l: any, a: any, r: any, i: any, t?: HTMLScriptElement, y?: Node) {
//     c[a] = c[a] || function () {
//       (c[a].q = c[a].q || []).push(arguments);
//     };
//     t = l.createElement(r) as HTMLScriptElement;
//     t.async = true;
//     t.src = 'https://www.clarity.ms/tag/' + i;
//     y = l.getElementsByTagName(r)[0];
//     y?.parentNode?.insertBefore(t, y);
//   })(window, document, 'clarity', 'script', 'qs1p34z4yw');
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
