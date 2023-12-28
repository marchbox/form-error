export default class FormError extends HTMLElement {
  #htmlFor = '';
  #pattern = '';

  #inputEl;
  #msgNode;

  static {
    customElements.define('form-error', this);
  }

  static observedAttributes = [
    'for',
    'pattern',
  ];

  get htmlFor() {
    return this.#htmlFor;
  }

  set htmlFor(value) {
    if (this.#htmlFor !== value) {
      this.setAttribute('for', value);
    }
  }

  get pattern() {
    return this.#pattern;
  }

  set pattern(value) {
    if (this.#pattern !== value) {
      this.setAttribute('pattern', value);
    }
  }

  get patternAsRegExp() {
    try {
      return new RegExp(this.#pattern);
    } catch {}

    return null;
  }

  set patternAsRegExp(value) {
    this.pattern = value instanceof RegExp ? value.source : value.toString();
  }

  get control() {
    return document.getElementById(this.#htmlFor);
  }

  get message() {
    return this.#msgNode?.textContent || '';
  }

  set message(value) {
    if (this.#msgNode?.nodeType !== Node.TEXT_NODE) {
      this.#msgNode = document.createTextNode('');
      this.append(this.#msgNode);
    }

    this.#msgNode.textContent = value.toString();
  }

  connectedCallback() {
    this.#setUpProps();

    if (!this.#isHtmlValid()) {
      return;
    }
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'for':
        this.#htmlFor = this.getAttribute('for');
        break;
      case 'pattern':
        this.#pattern = this.getAttribute('pattern');
        break;
    }
  }

  #setUpProps() {
    const initialHtmlFor = this.getAttribute('for');
    const initialPattern = this.getAttribute('pattern');

    if (initialHtmlFor) {
      this.#htmlFor = initialHtmlFor;
    }
    if (initialPattern) {
      this.#pattern = initialPattern;
    }
  }

  #isHtmlValid() {
    return !!this.#htmlFor && !!this.control &&
        Array.from(this.children).some(ch => ch.nodeName === 'TEMPLATE');
  }
}

