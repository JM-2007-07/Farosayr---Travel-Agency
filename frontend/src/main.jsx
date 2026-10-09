import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { i18nReady } from './i18n';
import './styles/tokens.css';
import './styles/global.css';

// App owns routing internally via createBrowserRouter/RouterProvider.
// The first render waits for the visitor's language (instant for Russian,
// one small chunk for Tajik/English) so text never flashes in another
// language.
i18nReady.finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
