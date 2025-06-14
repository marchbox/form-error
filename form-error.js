// https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements#value
const VALID_CONTROL_ELEMENT_QUERY = [
	"fieldset",
	'input:not([type="image"])',
	"select",
	"textarea",
].join(",");

// kabab-case to cammelCase
function k2c(value) {
	if (!value.includes("-")) {
		return value;
	}

	return value.toLowerCase().replace(/-(\w)/g, (_, l) => l.toUpperCase());
}

export default class FormError extends HTMLElement {
	#htmlFor = "";
	#validity = "";

	#msgNode;
	#disconnectedAbortController = new AbortController();
	#connectedControlAbortController = new AbortController();

	static {
		// biome-ignore lint/complexity/noThisInStatic: simplified regisstration
		customElements.define("form-error", this);
	}

	static observedAttributes = ["for", "validity"];

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
			this.setAttribute("for", value);
		}
	}

	get validity() {
		return this.#validity;
	}

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

		this.#connectToControl();
	}

	disconnectedCallback() {
		this.#disconnectedAbortController.abort();
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

	#show(value) {
		if (this.#msgNode?.nodeType !== Node.TEXT_NODE) {
			this.#msgNode = document.createTextNode("");
			this.append(this.#msgNode);
		}

		this.#msgNode.textContent = value.toString();

		if (value !== "") {
			this.dispatchEvent(new CustomEvent("errorshow", { bubbles: true }));
		}
	}

	#clear() {
		this.#show("");

		this.dispatchEvent(new CustomEvent("errorclear", { bubbles: true }));
	}

	#maybeClear() {
		if (this.control.validity.valid || !this.#hasMatchingValidity()) {
			this.#clear();
		}
	}

	#hasMatchingValidity() {
		return (
			!this.#validity ||
			(this.#validity && this.control.validity[k2c(this.#validity)])
		);
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
		const { signal } = this.#connectedControlAbortController;

		// TODO: Handle when the control element is a <fieldset>

		this.control?.addEventListener(
			"invalid",
			(evt) => {
				evt.preventDefault();

				if (!this.#hasMatchingValidity()) {
					return;
				}

				if (
					this.control.validity.patternMismatch &&
					this.control.title &&
					!this.querySelector("template")
				) {
					this.#show(this.control.title);
				} else {
					const customMessage =
						this.querySelector("template")?.content.cloneNode(true).textContent;
					this.#show(customMessage ?? this.control.validationMessage);
				}
			},
			{ signal },
		);

		this.control?.addEventListener(
			"blur",
			() => {
				this.#maybeClear();
			},
			{ signal },
		);

		this.control?.addEventListener(
			"keydown",
			(evt) => {
				if (evt.key === "Enter") {
					this.#maybeClear();
				}
			},
			{ signal },
		);

		this.control?.form?.addEventListener(
			"reset",
			() => {
				this.#clear();
			},
			{ signal },
		);
	}
}
