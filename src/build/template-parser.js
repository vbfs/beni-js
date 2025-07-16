const fs = require('fs');
const path = require('path');

class TemplateParser {
    constructor(config) {
        this.config = config;
    }

    async parse(content, filePath) {
        // Parse template with variables, loops, conditions
        const parsed = {
            raw: content,
            variables: this.extractVariables(content),
            components: this.extractComponents(content),
            optimized: this.optimize(content)
        };

        return parsed;
    }

    async parseComponent(content, filePath) {
        // Parse component with props
        const propsRegex = /{{\s*props\.(\w+)\s*}}/g;
        const props = [];
        let match;

        while ((match = propsRegex.exec(content)) !== null) {
            if (!props.includes(match[1])) {
                props.push(match[1]);
            }
        }

        return {
            raw: content,
            props,
            render: this.createComponentRenderer(content)
        };
    }

    extractVariables(content) {
        const regex = /{{\s*(\w+(?:\.\w+)*)\s*}}/g;
        const variables = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (!variables.includes(match[1])) {
                variables.push(match[1]);
            }
        }

        return variables;
    }

    extractComponents(content) {
        const regex = /<(\w+-\w+)([^>]*)>/g;
        const components = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (!components.includes(match[1])) {
                components.push(match[1]);
            }
        }

        return components;
    }

    optimize(content) {
        // Remove comments
        content = content.replace(/<!--[\s\S]*?-->/g, '');

        // Minimize whitespace
        content = content.replace(/\s+/g, ' ').trim();

        // Convert to template function
        return this.createTemplateFunction(content);
    }

    createTemplateFunction(content) {
        // Convert template to function that accepts data
        let func = content;

        // Replace variables {{ variable }}
        func = func.replace(/{{\s*(\w+(?:\.\w+)*)\s*}}/g, '${data.$1 || ""}');

        // Replace loops {{#each items}} ... {{/each}}
        func = func.replace(
            /{{#each\s+(\w+)}}\s*([\s\S]*?)\s*{{\/each}}/g,
            '${(data.$1 || []).map(item => `$2`).join("")}'
        );

        // Replace conditions {{#if condition}} ... {{/if}}
        func = func.replace(
            /{{#if\s+(\w+)}}\s*([\s\S]*?)\s*{{\/if}}/g,
            '${data.$1 ? `$2` : ""}'
        );

        return new Function('data', `return \`${func}\`;`);
    }

    createComponentRenderer(content) {
        let func = content;

        // Replace props {{ props.name }}
        func = func.replace(/{{\s*props\.(\w+)\s*}}/g, '${props.$1 || ""}');

        return new Function('props', `return \`${func}\`;`);
    }
}

module.exports = TemplateParser;
