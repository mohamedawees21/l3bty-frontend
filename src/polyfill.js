// Polyfill for process in browser
if (typeof window !== 'undefined') {
  window.process = {
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };
}