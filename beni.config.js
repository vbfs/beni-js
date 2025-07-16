module.exports = {
    // Build configuration
    srcDir: 'src',
    distDir: 'dist',
    templatesDir: 'src/templates',
    publicDir: 'public',

    // Optimization
    minify: true,
    optimize: true,
    dropConsole: true,

    // App configuration
    title: 'My Beni.js App',
    css: [
        'https://cdn.tailwindcss.com'
    ],

    // Development server
    devServer: {
        port: 3000,
        host: 'localhost',
        hotReload: true
    },

    // Template engine options
    templateEngine: {
        delimiters: ['{{', '}}'],
        components: {
            prefix: 'beni-'
        }
    }
};
