const { minify: minifyHTML } = require('html-minifier-terser');
const { minify: minifyJS } = require('terser');
const postcss = require('postcss');
const cssnano = require('cssnano');

class Minifier {
    constructor(config) {
        this.config = config;
    }

    async minifyHTML(html) {
        return await minifyHTML(html, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true
        });
    }

    async minifyJS(code) {
        const result = await minifyJS(code, {
            compress: {
                dead_code: true,
                drop_console: this.config.dropConsole !== false,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info']
            },
            mangle: {
                toplevel: true
            },
            format: {
                comments: false
            }
        });

        return result.code;
    }

    async minifyCSS(css) {
        const result = await postcss([cssnano()]).process(css, { from: undefined });
        return result.css;
    }
}

module.exports = Minifier;