export class FormError extends HTMLElement {
  #htmlFor = null;
  #pattern = null;

  static observedAttributes = [
    'for',
    'pattern',
  ];

  get htmlFor() {
    return this.#htmlFor;
  }

  set htmlFor(value) {
    this.setAttribute('for', value);
  }

  get pattern() {
    return this.#pattern;
  }

  set pattern(value) {
    this.setAttribute('pattern', value);
  }

  get control() {
    return document.getElementById(this.htmlFor);
  }

  connectedCallback() {
    if (!this.#isHtmlValid()) {
      return;
    }
  }

  attributeChangedCallback(name, _, value) {
    switch (name) {
      case 'for':
        this.#htmlFor = this.getAttribute('for');
        break;
      case 'pattern':
        this.#pattern = this.getAttribute('pattern');
        break;
    }
  }

  #isHtmlValid() {
    return this.htmlFor && this.control &&
        Array.from(this.children).some(ch => ch.nodeName === 'TEMPLATE');
  }
}

if (!customElements.get('form-error')) {
  customElements.define('form-error', FormError);
}

