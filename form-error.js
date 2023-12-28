// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements#value
const VALID_CONTROL_ELEMENT_QUERY = [
  'fieldset',
  'input:not([type="image"])',
  'output',
  'select',
  'textarea',
].join(',');

export default class FormError extends HTMLElement {
  #htmlFor = '';
  #pattern = '';
  #validity = '';

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

  get validity() {
    return this.#validity;
  }

  set validity(value) {
    if (this.#validity !== value) {
      this.setAttribute('validity', value);
    }
  }

  get control() {
    return document.getElementById(this.#htmlFor);
  }

  get form() {
    return this.control?.form;
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

    this.control.addEventListener('invalid', evt => {
      evt.preventDefault();
      this.#validate();
    });
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'for':
        this.#htmlFor = this.getAttribute('for');
        break;
      case 'pattern':
        this.#pattern = this.getAttribute('pattern');
        break;
      case 'validity':
        this.#validity = this.getAttribute('validity');
        break;
    }
  }

  // TODO
  #validate() {
    if (this.validity) {
    } else if (this.pattern) {
    } else {
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
        this.control.matches(VALID_CONTROL_ELEMENT_QUERY) &&
        Array.from(this.children).some(ch => ch.nodeName === 'TEMPLATE');
  }
}

