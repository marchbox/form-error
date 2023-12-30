// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements#value
const VALID_CONTROL_ELEMENT_QUERY = [
  'fieldset',
  'input:not([type="image"])',
  'output',
  'select',
  'textarea',
].join(',');

// kabab-case to cammelCase
function k2c(value) {
  if (!value.includes('-')) {
    return value;
  }

  return value.toLowerCase().replace(/-(\w)/g, (_, l) => l.toUpperCase());
}

export default class FormError extends HTMLElement {
  #htmlFor = '';
  #validity = '';

  #msgNode;

  static {
    customElements.define('form-error', this);
  }

  static observedAttributes = [
    'for',
    'validity',
  ];

  get control() {
    return document.getElementById(this.#htmlFor);
  }

  get form() {
    return this.control?.form;
  }

  get htmlFor() {
    return this.#htmlFor;
  }

  set htmlFor(value) {
    if (this.#htmlFor !== value) {
      this.setAttribute('for', value);
    }
  }

  get validity() {
    return this.#validity;
  }

  set validity(value) {
    if (this.#validity !== value) {
      this.setAttribute('validity', value);
    }
  }

  connectedCallback() {
    this.#setUpProps();

    if (!this.#isHtmlValid()) {
      return;
    }

    this.control.addEventListener('invalid', evt => {
      evt.preventDefault();

      if (this.control.validity.patternMismatch && this.control.title) {
        this.#setMessage(this.control.title);
      } else {
        const customMessage = this.querySelector('template')?.content
            .cloneNode(true).textContent;
        this.#setMessage(customMessage ?? this.control.validationMessage);
      }
    });

    this.control.addEventListener('blur', () => {
      if (this.control.validity.valid) {
        this.#setMessage('');
      }
    });

    this.form.addEventListener('submit', () => {
      if (this.control.validity.valid) {
        this.#setMessage('');
      }
    });
  }

  attributeChangedCallback(name) {
    switch (name) {
      case 'for':
        this.#htmlFor = this.getAttribute('for');
        break;
      case 'validity':
        this.#validity = this.getAttribute('validity');
        break;
    }
  }

  #setMessage(value) {
    if (this.#msgNode?.nodeType !== Node.TEXT_NODE) {
      this.#msgNode = document.createTextNode('');
      this.append(this.#msgNode);
    }

    this.#msgNode.textContent = value.toString();
  }

  #setUpProps() {
    const initialHtmlFor = this.getAttribute('for');
    const initialValidity = this.getAttribute('validity');

    if (initialHtmlFor) {
      this.#htmlFor = initialHtmlFor;
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

