/**
 * Didulis Coffee - Server Entry Point
 * Created: 2026-02-28
 */

const app = require('./app');

const PORT = process.env.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    🚀 Server is running!
    📡 URL: http://localhost:${PORT}
    🛠️  Environment: ${process.env.NODE_ENV || 'development'}
    -------------------------------------------
    `);
});

// Handle graceful shutdowns (Ctrl + C)
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});