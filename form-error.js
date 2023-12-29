import FormErrorRegistry from './registry.js';

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements#value
const VALID_CONTROL_ELEMENT_QUERY = [
  'fieldset',
  'input:not([type="image"])',
  'output',
  'select',
  'textarea',
].join(',');

// kabab-case to cammelCase
function normalizeValidity(value) {
  if (!value.includes('-')) {
    return value;
  }

  return value.toLowerCase().replace(/-(\w)/g, (_, l) => l.toUpperCase());
}

export default class FormError extends HTMLElement {
  #htmlFor = '';
  #pattern = '';
  #validity = '';

  #registry;
  #inputEl;
  #msgNode;

  static {
    customElements.define('form-error', this);
  }

  static observedAttributes = [
    'for',
    'pattern',
    'validity',
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

  constructor() {
    super();

    if (!window['__FORM_ERROR_REGISTRY__']) {
      window['__FORM_ERROR_REGISTRY__'] = new FormErrorRegistry();
    }

    this.#registry = window['__FORM_ERROR_REGISTRY__'];
    this.#registry.register(this);
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

  #validate() {
    if (this.control.validity.valid) {
      this.message = '';
    } else if (this.#validity) {
      if (!this.control.validity[normalizeValidity(this.validity)]) {
        return;
      }

      const template = this.querySelector('template');

      if (!template) {
        this.message = this.control.validationMessage;
        return;
      }

      this.message = template.content.cloneNode(true).textContent;
    } else if (this.#pattern) {
      // TODO
    } else {
      this.message = this.control.validationMessage;
    }
  }

  #setUpProps() {
    const initialHtmlFor = this.getAttribute('for');
    const initialPattern = this.getAttribute('pattern');
    const initialValidity = this.getAttribute('validity');

    if (initialHtmlFor) {
      this.#htmlFor = initialHtmlFor;
    }
    if (initialPattern) {
      this.#pattern = initialPattern;
    }
    if (initialValidity) {
      this.#validity = initialValidity;
    }
  }

  #isHtmlValid() {
    return !!this.#htmlFor && !!this.control &&
        this.control.matches(VALID_CONTROL_ELEMENT_QUERY);
  }
}

