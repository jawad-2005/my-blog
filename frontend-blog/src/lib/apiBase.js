// This checks the address bar in your browser
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// If you are on your computer, use localhost.
// If you are on Render, use the relative path "/api"
const API_BASE = isLocalhost ? "http://localhost:3000/api" : "/api";

export default API_BASE;
