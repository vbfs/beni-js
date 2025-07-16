const fs = require('fs');
const path = require('path');
const TemplateParser = require('./template-parser.js');
const Minifier = require('./minifier.js');
const Optimizer = require('./optimizer.js');

class Builder {
    constructor(config = {}) {
        this.config = {
            srcDir: 'src',
            distDir: 'dist',
            templatesDir: 'src/templates',
            publicDir: 'public',
            minify: true,
            optimize: true,
            ...this.loadConfig(),
            ...config
        };

        this.templateParser = new TemplateParser(this.config);
        this.minifier = new Minifier(this.config);
        this.optimizer = new Optimizer(this.config);

        this.templates = new Map();
        this.components = new Map();
        this.assets = new Map();
    }

    loadConfig() {
        const configPath = path.join(process.cwd(), 'beni.config.js');
        if (fs.existsSync(configPath)) {
            return require(configPath);
        }
        return {};
    }

    async build() {
        console.log('🔥 Building Beni.js project...');

        try {
            // 1. Clean dist directory
            await this.clean();

            // 2. Parse templates and components
            await this.parseTemplates();

            // 3. Process application code
            await this.processApp();

            // 4. Copy and optimize assets
            await this.processAssets();

            // 5. Generate optimized runtime
            await this.generateRuntime();

            // 6. Create index.html
            await this.generateIndex();

            console.log('✅ Build completed successfully!');
            this.printStats();

        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    async clean() {
        if (fs.existsSync(this.config.distDir)) {
            fs.rmSync(this.config.distDir, { recursive: true });
        }
        fs.mkdirSync(this.config.distDir, { recursive: true });
    }

    async parseTemplates() {
        console.log('📄 Parsing templates...');

        const templatesDir = this.config.templatesDir;
        if (!fs.existsSync(templatesDir)) {
            throw new Error(`Templates directory not found: ${templatesDir}`);
        }

        // Parse regular templates
        const templateFiles = this.getFiles(templatesDir, '.html');
        for (const file of templateFiles) {
            if (!file.includes('/components/')) {
                const name = path.relative(templatesDir, file).replace('.html', '');
                const content = fs.readFileSync(file, 'utf8');
                const parsed = await this.templateParser.parse(content, file);
                this.templates.set(name, parsed);
            }
        }

        // Parse components
        const componentsDir = path.join(templatesDir, 'components');
        if (fs.existsSync(componentsDir)) {
            const componentFiles = this.getFiles(componentsDir, '.html');
            for (const file of componentFiles) {
                const name = path.basename(file, '.html');
                const content = fs.readFileSync(file, 'utf8');
                const parsed = await this.templateParser.parseComponent(content, file);
                this.components.set(name, parsed);
            }
        }

        console.log(`✅ Parsed ${this.templates.size} templates and ${this.components.size} components`);
    }

    async processApp() {
        console.log('⚙️  Processing application code...');

        const appFile = path.join(this.config.srcDir, 'app.js');
        if (!fs.existsSync(appFile)) {
            throw new Error('app.js not found in src directory');
        }

        let appCode = fs.readFileSync(appFile, 'utf8');

        // Replace template imports with optimized versions
        appCode = this.replaceTemplateImports(appCode);

        // Minify if enabled
        if (this.config.minify) {
            appCode = await this.minifier.minifyJS(appCode);
        }

        fs.writeFileSync(path.join(this.config.distDir, 'app.js'), appCode);
    }

    replaceTemplateImports(code) {
        // Replace template() calls with pre-compiled templates
        return code.replace(
            /template\(['"`]([^'"`]+)['"`]\)/g,
            (match, templateName) => {
                const template = this.templates.get(templateName);
                if (template) {
                    return `(() => ${JSON.stringify(template.optimized)})()`;
                }
                console.warn(`⚠️  Template not found: ${templateName}`);
                return match;
            }
        );
    }

    async processAssets() {
        console.log('🎨 Processing assets...');

        // Copy public directory
        if (fs.existsSync(this.config.publicDir)) {
            this.copyDir(this.config.publicDir, this.config.distDir);
        }

        // Process styles
        const stylesDir = path.join(this.config.srcDir, 'styles');
        if (fs.existsSync(stylesDir)) {
            const cssFiles = this.getFiles(stylesDir, '.css');
            let combinedCSS = '';

            for (const file of cssFiles) {
                let css = fs.readFileSync(file, 'utf8');
                if (this.config.minify) {
                    css = await this.minifier.minifyCSS(css);
                }
                combinedCSS += css + '\n';
            }

            fs.writeFileSync(path.join(this.config.distDir, 'styles.css'), combinedCSS);
        }

        // Copy assets
        const assetsDir = path.join(this.config.srcDir, 'assets');
        if (fs.existsSync(assetsDir)) {
            const targetAssetsDir = path.join(this.config.distDir, 'assets');
            fs.mkdirSync(targetAssetsDir, { recursive: true });
            this.copyDir(assetsDir, targetAssetsDir);
        }
    }

    async generateRuntime() {
        console.log('🔧 Generating optimized runtime...');

        // Generate template registry
        const templateRegistry = {
            templates: Object.fromEntries(this.templates),
            components: Object.fromEntries(this.components)
        };

        // Core Beni.js runtime with pre-compiled templates
        const runtime = `
// Beni.js Runtime - Production Build
(function() {
    'use strict';

    // Pre-compiled templates
    window.BENI_TEMPLATES = ${JSON.stringify(templateRegistry)};

    ${fs.readFileSync(path.join(__dirname, '../src/core/index.js'), 'utf8')}
    ${fs.readFileSync(path.join(__dirname, '../src/core/router.js'), 'utf8')}
    ${fs.readFileSync(path.join(__dirname, '../src/core/state.js'), 'utf8')}
    ${fs.readFileSync(path.join(__dirname, '../src/core/renderer.js'), 'utf8')}
    ${fs.readFileSync(path.join(__dirname, '../src/core/template-engine.js'), 'utf8')}

    // Template helper for production
    window.template = function(name) {
        const tmpl = window.BENI_TEMPLATES.templates[name];
        if (!tmpl) {
            console.error('Template not found:', name);
            return '';
        }
        return tmpl.optimized;
    };

    // Component helper for production
    window.component = function(name, props = {}) {
        const comp = window.BENI_TEMPLATES.components[name];
        if (!comp) {
            console.error('Component not found:', name);
            return '';
        }
        return comp.render(props);
    };

})();
        `;

        let finalRuntime = runtime;
        if (this.config.minify) {
            finalRuntime = await this.minifier.minifyJS(finalRuntime);
        }

        fs.writeFileSync(path.join(this.config.distDir, 'beni.js'), finalRuntime);
    }

    async generateIndex() {
        const indexTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title || 'Beni.js App'}</title>
    ${fs.existsSync(path.join(this.config.distDir, 'styles.css')) ?
        '<link rel="stylesheet" href="styles.css">' : ''}
    ${this.config.css ? this.config.css.map(css => `<link rel="stylesheet" href="${css}">`).join('\n    ') : ''}
</head>
<body>
    <div id="app">
        <div class="loading">Loading...</div>
    </div>

    <script src="beni.js"></script>
    <script src="app.js"></script>
</body>
</html>
        `.trim();

        let finalIndex = indexTemplate;
        if (this.config.minify) {
            finalIndex = await this.minifier.minifyHTML(finalIndex);
        }

        fs.writeFileSync(path.join(this.config.distDir, 'index.html'), finalIndex);
    }

    getFiles(dir, ext) {
        const files = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.getFiles(fullPath, ext));
            } else if (path.extname(item) === ext) {
                files.push(fullPath);
            }
        }

        return files;
    }

    copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const items = fs.readdirSync(src);
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            const stat = fs.statSync(srcPath);

            if (stat.isDirectory()) {
                this.copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    printStats() {
        const distSize = this.getDirSize(this.config.distDir);
        console.log(`\n📊 Build Stats:`);
        console.log(`   Templates: ${this.templates.size}`);
        console.log(`   Components: ${this.components.size}`);
        console.log(`   Total size: ${(distSize / 1024).toFixed(2)} KB`);
    }

    getDirSize(dirPath) {
        let size = 0;
        const files = this.getFiles(dirPath, '');
        files.forEach(file => {
            size += fs.statSync(file).size;
        });
        return size;
    }
}

module.exports = Builder;