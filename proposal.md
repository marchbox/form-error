# Proposal for HTML `<error>` element

## Motivation

HTML added [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation) with the intention of easing the validation process and UI for web forms. While this approach doesn’t prevent invalid values from being submitted to the server, e.g. it’s easy for a user to add `novalidate` attribute to the `<form>` element in a browser developer tool to bypass the validation, it makes building a form UI and logic a lot easier, and it improves accessibility for web forms.

However, the current Constraint Validation API has a few shortcomings:

* Unable to customize the look-and-feel of the built-in validation message display
* Unable to customize the wording of built-in validation message
* While the `pattern` attribute can be powerful, it’s tied to a single validity state (`ValidityState.patternMismatch`), hence it’s limited to a single validation message (either the built-in message or a custom message with `title` attribute) without JavaScript
* No declarative way to add custom validation messages
* A validation message is limited to pure text, but sometimes it can be helpful to have richer content like a link to details of the error message
* Accessibility issues ==TODO: check the details==

## Goal

* Provide a declarative way to add validation messages to HTML (both built-in and custom messages for built-in validity states)
* Enable styling of a validation message with CSS
* Provide a declarative way to add custom validity messages based on user inputs and allows richer content other than pure text
* Compliant with WCAG 2.3

## The `<error>` element

The container of the validation message for its associated form control. The element can only contain pure text content or a `<template>` element, any other HTML elements would be ignored.

When an `<error>` element is associated to an form control element (through the `for` attribute), author is opted in to use the `<error>` element to display validation messages instead of the pop up UI. When `setCustomValidity()` is called, the message will be displayed in the `<error>` element as well.

The element behaves differently depending on its content:

| Author content | `validity` has value? | Form control validity | Display content |
|:--|:--|:--|:--|
| Empty or `<template>` | No | When any invalid | Built-in validation message |
| Empty | Yes | When matching | Built-in validation message |
| Text | (Ignored) | Forced to be `customError` | Author’s text content |
| `<template>` | Yes | When matching | The `<template>`’s content |

Note: in the first case (empty or `<template>`, and no `validity` attribute value), the `<template>` is ignored.

### Accessibility

* The element has an implicit ARIA Role: ==TODO: Check ARIA spec on which role is appropriate==
* When the element is associated with a form control element by the `for` attribute, e.g. `<error for="my-input">…</error>`, the element is automatically added to the form element’s `ariaDescribedByElements` array
* The element has an implicit `aria-live` value as `assertive`, this can be overridden by author by explicitly adding an `aria-live` attribute

### Attributes

* Global attributes
* `for`: value is `IDREF`, referencing the associated form control element
* `validity`: a DOMTokenList of built-in validities
	* when defined, the `<error>` element will only display its content when the associated form control element has the matching validity
	* when absent, the `<error>` element will display the built-in validation messages when the associated form control is invalid

### DOM Interface

```
interface HTMLErrorElement {
  readonly control: HTMLElement;
  readonly form: HTMLFormElement | null;
  htmlFor: IDREF;
  validity: DOMTokenList;
  validator: element: HTMLErrorElement => booean;
}
```

==TODO: add details==

### DOM events

==TODO==

### CSS Pseudo classes

==TODO==

## New `errors` property on form control elements

A new property on `HTMLInputElement`, `HTMLSelectElement`, `HTMLButtonElement`, `HTMLFieldSetElement`, `HTMLObjectElement`, `HTMLOutputElement`, `HTMLTextAreaElement`, and `ElementInterals`, `errors`, as an array of references to the associated `<error>` elements (similar to the `labels` property).

## Use cases

### As an error container

If an `<error>` element has no `validity` attribute or any content, it behaves as a placeholder element to display validation messages when needed, e.g. its connected `<input>` has an `invalid` state.

```html
<label for="email">Email</label>
<input name="email" id="email" type="email">
<error for="email"></error>
```

When `<input>` becomes invalid, browser adds the built-in validation message to the `<error>` element and sets its `display` to `block`.

### Override built-in validation messages

If an `<error>` element’s `validity` attribute’s value is a built-in validity state, when its connected `<input>` element has the matching validity as `true`, browser displays this `<error>` element.

```html
<label for="email">Email</label>
<input name="email" id="email" type="email">
<error for="email" validity="typemismatch">
  <template>Enter a valid email</template>
</error>
```

```html
<fieldset>
  <legend>Pet type</legend>
  <label><input type="radio" id="dog" value="dog" name="type" required>Dog</label>
  <label><input type="radio" id="cat" value="cat" name="type">Cat</label>
  <label><input type="radio" id="fish" value="fish" name="type">Fish</label>

  <error for="dog" validity="valuemissing">
    <template>Choose a pet type</template>
  </error>
</fieldset>
```

### Multiple validation messages

Authors can connect multiple `<error>` elements to the same `<input>` element.

```html
<label for="email">Email</label>
<input name="email" id="email" type="email" pattern=".*@example\.com$" required>

<!-- Customize built-in error -->
<error for="email" validity="typemismatch">
  <template>Enter a valid email</template>
</error>

<!-- Custom error -->
<error for="email">
  <template>Must use an @example.com email</template>
</error>

<!-- Container for all other errors, in this case, the built-in `valueMissing`'s validation message will be displayed here -->
<error for="email"></error>
```

### Display custom validation message

When a form control is server-side rendered with an invalid state, put the validation message directly in the `<error>` element.

```html
<input type="email" id="email" name="email" value="foo@example.com">
<error for="email">Must use an @sample.com email address</error>
```
