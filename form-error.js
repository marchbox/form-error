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

export default class FormError extends HTMLElement {
	static {
		// biome-ignore lint/complexity/noThisInStatic: simplified regisstration
		customElements.define("form-error", this);
	}

	static observedAttributes = ["for", "validity"];

	/** @type {ShadowRoot} */
	#shadow = this.attachShadow({ mode: "open" });

	/** @type {ElementInternals} */
	#internals = this.attachInternals();

	/** @type {string} */
	#htmlFor = "";

	/** @type {string} */
	#validity = "";

	/** @type {HTMLDivElement} */
	#contentContainer;

	/** @type {AbortController} */
	#connectedControlAbortController = new AbortController();

	/** @return {DocumentFragment} */
	get content() {
		const template = document.createElement("template");
		template.innerHTML = this.#contentContainer?.innerHTML ?? "";
		return template.content.cloneNode(true);
	}

	/** @return {FormControlElement | null} */
	get control() {
		return document.getElementById(this.#htmlFor);
	}

	/** @return {HTMLFormElement | null} */
	get form() {
		return this.control?.form;
	}

	/** @return {string} */
	get htmlFor() {
		return this.#htmlFor ?? "";
	}

	/** @param {string} value */
	set htmlFor(value) {
		if (this.#htmlFor !== value) {
			this.setAttribute("for", value);
		}
	}

	/** @return {string} */
	get validity() {
		return this.#validity ?? "";
	}

	/** @param {string} value */
	set validity(value) {
		if (this.#validity !== value) {
			this.setAttribute("validity", value);
		}
	}

	connectedCallback() {
		this.#setUpProps();

		if (!this.#isHtmlValid()) {
			return;
		}

		this.#internals.role = "alert";
		this.#createShadow();

		if (
			this.control &&
			!this.querySelector("template") &&
			this.innerHTML.trim() !== ""
		) {
			this.control.setCustomValidity(this.textContent.trim());
			this.#show();
			return;
		}

		this.#connectToControl();
	}

	disconnectedCallback() {
		this.#connectedControlAbortController.abort();
	}

	attributeChangedCallback(name) {
		switch (name) {
			case "for":
				this.#htmlFor = this.getAttribute("for");
				this.#clear();
				if (this.control) {
					this.#connectedControlAbortController.abort();
					this.#connectToControl();
				}
				break;
			case "validity":
				this.#validity = this.getAttribute("validity");
				break;
		}
	}

	#show() {
		this.#clear();
		const msg = this.#getMessage();
		if (msg) {
			this.#contentContainer.append(msg);
			this.dispatchEvent(new Event("errorshow", { bubbles: true }));
		}
	}

	#clear() {
		this.#contentContainer.replaceChildren();
		this.dispatchEvent(new Event("errorhide", { bubbles: true }));
	}

	#maybeClear() {
		if (this.control.validity.valid || !this.#hasMatchingValidity()) {
			this.#clear();
		}
	}

	#createShadow() {
		this.#shadow.innerHTML = `
			<div style="display: contents;"></div>
			<div hidden><slot></slot></div>
		`;
		this.#contentContainer = this.#shadow.querySelector("div");
	}

	/** @return {Node | string | null} */
	#getMessage() {
		const isEmpty = this.innerHTML.trim() === "";

		if (
			(!this.#validity && !this.control.validity.valid) ||
			(this.#validity && isEmpty && this.#hasMatchingValidity())
		) {
			if (this.control.validity.patternMismatch && this.control.title) {
				return this.control.title;
			}
			return this.control.validationMessage;
		}

		const tpl = this.querySelector("template");

		if (tpl) {
			return tpl.content.cloneNode(true);
		}

		return isEmpty ? null : this.innerHTML;
	}

	#hasMatchingValidity() {
		if (!this.control) {
			return false;
		}

		switch (this.#validity?.toLowerCase()) {
			case "badinput":
				return this.control.validity.badInput;
			case "customerror":
				return this.control.validity.customError;
			case "patternmismatch":
				return this.control.validity.patternMismatch;
			case "rangeoverflow":
				return this.control.validity.rangeOverflow;
			case "rangeunderflow":
				return this.control.validity.rangeUnderflow;
			case "stepmismatch":
				return this.control.validity.stepMismatch;
			case "toolong":
				return this.control.validity.tooLong;
			case "tooshort":
				return this.control.validity.tooShort;
			case "typemismatch":
				return this.control.validity.typeMismatch;
			case "valuemissing":
				return this.control.validity.valueMissing;
			default:
				return !this.control.validity.valid;
		}
	}

	#setUpProps() {
		const initialHtmlFor = this.getAttribute("for");
		const initialValidity = this.getAttribute("validity");

		if (initialHtmlFor) {
			this.#htmlFor = initialHtmlFor;
		}
		if (initialValidity) {
			this.#validity = initialValidity;
		}
	}

	#isHtmlValid() {
		return (
			!!this.#htmlFor &&
			!!this.control &&
			this.control.matches(VALID_CONTROL_ELEMENT_QUERY)
		);
	}

	#connectToControl() {
		if (!this.control) {
			return;
		}

		const { signal } = this.#connectedControlAbortController;

		// TODO: Handle when the control element is a <fieldset>

		this.control.addEventListener(
			"invalid",
			(evt) => {
				evt.preventDefault();

				if (!this.#hasMatchingValidity()) {
					return;
				}

				// Note: if multiple <form-error> elements associated to the same form
				// control and multiple of them have matching validity, only the last
				// <form-error>’s content will be announced.
				this.control.ariaErrorMessageElements = [this];

				this.#show();
			},
			{ signal },
		);

		this.control.addEventListener(
			"blur",
			() => {
				this.#maybeClear();
			},
			{ signal },
		);

		this.control.addEventListener(
			"keydown",
			(evt) => {
				if (evt.key === "Enter") {
					this.#maybeClear();
				}
			},
			{ signal },
		);

		this.control.form?.addEventListener(
			"reset",
			() => {
				this.#clear();
			},
			{ signal },
		);
	}
}
