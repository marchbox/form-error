// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements#value
const VALID_CONTROL_ELEMENT_QUERY = [
	"fieldset",
	'input:not([type="image"])',
	"select",
	"textarea",
].join(",");

/**
 * @typedef {(
 *   HTMLInputElement |
 *   HTMLFieldSetElement |
 *   HTMLSelectElement |
 *   HTMLTextAreaElement
 * )} FormControlElement
 */

class ValidityOutput extends HTMLOutputElement {
  static get observedAttributes() {
    return [
      "for",
      "validity",
    ];
  }

  #disconnectedAbortSignal = new AbortController();

  connectedCallback() {
  }

  attributeChangedCallback(name) {
    console.log(name);
  }

  disconnectedCallback() {
    this.#disconnectedAbortSignal.abort();
  }
}

customElements.define('validity-output', ValidityOutput, {
  extends: 'output',
});
