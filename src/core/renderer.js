export default class Renderer {
  constructor(options) {
    this.options = {
      container: "#app",
      animationDuration: 300,
      ...options,
    };
    this.container = null;
    this.renderQueue = [];
    this.isRendering = false;
  }

  render(html, targetContainer) {
    const container = targetContainer || this.getContainer();

    if (!container) {
      console.error(
        `❌ Container "${this.options.container}" não encontrado durante render`
      );
      console.error("DOM readyState:", document.readyState);
      console.error(
        "Container exists?",
        !!document.querySelector(this.options.container)
      );
      throw new Error(`Container "${this.options.container}" não encontrado`);
    }

    this.scheduleRender(() => {
      container.style.opacity = "0";
      container.style.transform = "translateY(10px)";

      setTimeout(() => {
        container.innerHTML = html;

        container.style.transition = `all ${this.options.animationDuration}ms ease`;
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";

        setTimeout(() => {
          container.style.transition = "";
        }, this.options.animationDuration);
      }, this.options.animationDuration / 2);
    });

    return this;
  }

  getContainer() {
    if (!this.container) {
      this.container = document.querySelector(this.options.container);
    }
    return this.container;
  }

  scheduleRender(renderFn) {
    this.renderQueue.push(renderFn);

    if (!this.isRendering) {
      this.isRendering = true;
      requestAnimationFrame(() => {
        const startTime = performance.now();

        while (
          this.renderQueue.length > 0 &&
          performance.now() - startTime < 16
        ) {
          const fn = this.renderQueue.shift();
          fn();
        }

        if (this.renderQueue.length > 0) {
          this.isRendering = false;
          this.scheduleRender(() => {});
        } else {
          this.isRendering = false;
        }
      });
    }
  }

  processQueue() {
    const startTime = performance.now();

    // Processa renders até esgotar o budget de 16ms
    while (this.renderQueue.length > 0 && performance.now() - startTime < 16) {
      const renderFn = this.renderQueue.shift();
      renderFn();
    }

    if (this.renderQueue.length > 0) {
      // Ainda há renders pendentes
      requestAnimationFrame(this.boundProcessQueue);
    } else {
      this.isRendering = false;
    }
  }

  component(name, factory) {
    this.components.set(name, factory);
    return this;
  }

  processComponents(container) {
    // Processa componentes customizados
    this.components.forEach((factory, name) => {
      const elements = container.querySelectorAll(`[data-component="${name}"]`);
      elements.forEach((element) => {
        const props = this.getElementProps(element);
        const componentHtml = factory(props);
        element.innerHTML = componentHtml;
      });
    });
  }

  getElementProps(element) {
    const props = {};

    // Extrai props dos atributos data-*
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-prop-")) {
        const propName = attr.name.replace("data-prop-", "");
        props[propName] = attr.value;
      }
    });

    return props;
  }

  sanitizeHtml(html) {
    // Sanitização básica - para produção, use uma biblioteca dedicada
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Remove scripts maliciosos
    const scripts = temp.querySelectorAll("script");
    scripts.forEach((script) => script.remove());

    return temp.innerHTML;
  }

  renderRoute(route, params) {
    try {
      route.handler(params);
    } catch (error) {
      console.error("Erro ao renderizar rota:", error);
      this.renderError(error);
    }
  }

  renderError(error) {
    const errorHtml = `
            <div class="error-container" style="padding: 20px; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
                <h3 style="color: #c33; margin: 0 0 10px 0;">Erro de Renderização</h3>
                <p style="margin: 0; font-family: monospace; color: #666;">${error.message}</p>
            </div>
        `;

    this.render(errorHtml);
  }

  updateSubscribers(key, value) {
    // Atualiza elementos que dependem do estado
    const elements = document.querySelectorAll(`[data-state="${key}"]`);
    elements.forEach((element) => {
      element.textContent = value;
    });
  }

  init() {
    // Tentar encontrar container, mas não falhar se não existir
    this.container = document.querySelector(this.options.container);

    if (!this.container) {
      console.warn(
        `⚠️ Container "${this.options.container}" não encontrado durante init. Será procurado no primeiro render.`
      );
    } else {
      console.log(
        `✅ Container "${this.options.container}" encontrado durante init`
      );
    }

    return this;
  }

  destroy() {
    this.renderQueue = [];
    this.components.clear();
    this.cache.clear();
    this.subscribers.clear();
    this.isRendering = false;
  }
}
