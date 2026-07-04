import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Redux Imports
import { Provider } from "react-redux";
import { store } from "./store/store";

import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/theme-provider";

import axios from "axios";
axios.defaults.withCredentials = true; // Essential for cookies

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider defaultTheme='white' storageKey='vite-ui-theme'>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
