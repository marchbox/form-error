export class FormError extends HTMLElement {
  #htmlFor = '';
  #pattern = '';

  #inputEl;

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

  get control() {
    return document.getElementById(this.#htmlFor);
  }

  connectedCallback() {
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

  #isHtmlValid() {
    return !!this.#htmlFor && !!this.control &&
        Array.from(this.children).some(ch => ch.nodeName === 'TEMPLATE');
  }
}

if (!customElements.get('form-error')) {
  customElements.define('form-error', FormError);
}

