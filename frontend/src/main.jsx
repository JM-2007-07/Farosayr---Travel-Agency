import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import './styles/tokens.css';
import './styles/global.css';

// App now owns routing internally via createBrowserRouter/RouterProvider,
// so no <BrowserRouter> wrapper here.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
