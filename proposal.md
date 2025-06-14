# Proposal for HTML `<error>` element

## Motivation

HTML added [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation) with the intention of easing the validation process and UI for web forms. While this approach doesn’t prevent invalid values from being submitted to the server, e.g. it’s easy for a user to add `novalidate` attribute to the `<form>` element in a browser developer tool to bypass the validation, it makes building a form UI and logic a lot easier, and it improves accessibility for web forms.

However, the current Constraint Validation API has a few shortcomings:

* Unable to customize the look-and-feel of the built-in validation message display
* Unable to customize the wording of built-in validation message
* No declarative way to add custom validation messages
* Accessibility issues ==TODO: check the details==

## Goal

* Provide a declarative way to add validation messages to HTML (both built-in and custom messages for built-in validity states)
* Enable styling of a validation message with CSS
* Support server side rendered error that also sets the associated form control to invalid state
* Compliant with WCAG 2.2

## The `<error>` element

The container of the validation message for its associated form control. The element can only contain pure text content or a `<template>` element, any other HTML elements would be ignored.

### Attributes

* Global attributes
* `for`: an IDREF string referencing the associated form control element
* `validity`: a DOMTokenList of built-in validities

### Behaviors

When an `<error>` element is associated to an form control element (through the `for` attribute), author is opted in to use the `<error>` element to display validation messages instead of the pop up UI. When `setCustomValidity()` is called, the message will be displayed in the `<error>` element as well.

The element behaves differently depending on its content:

| Author content | `validity` attribute has value? | Form control’s validity needed to display content | Display content |
|:-|:-|:-|:-|
| Empty | No | Any invalid  | Built-in validation message |
| Empty | Yes | Matching `validity` attribute | Built-in validation message |
| `<template>` | No | Any invalid  | Built-in validation message (`<template>` is ignored) |
| `<template>` | Yes | Matching `validity` attribute | The `<template>`’s content |
| Text | (Ignored) | Always `customError` | Author’s text content |

If multiple `<error>` elements associated to the same form control meet the display content condition, the last `<error>` element will be shown.

If the associated form control is disabled, the `<error>` element becomes hidden.

### Accessibility

* The element has an implicit ARIA role of `alert` (which makes it a live region)
* The element is added to the form element’s `ariaErrorMessageElements`

### DOM interface

```ts
interface HTMLErrorElement {
  readonly control: HTMLElement;
  readonly form: HTMLFormElement | null;
  readonly content: DocumentFragment;
  htmlFor: IDREF;
  validity: DOMTokenList;
}
```

### The `toggle` event

A `ToggleEvent` dispatches when the `<error>` element’s visibility changed.

### The CSS `:error-show` pseudo class

When the `<error>` is shown, this pseudo class is selected.

## New `errors` property on form control elements

A new property, `errors`, on `HTMLInputElement`, `HTMLSelectElement`, `HTMLButtonElement`, `HTMLFieldSetElement`, `HTMLObjectElement`, `HTMLOutputElement`, `HTMLTextAreaElement`, and `ElementInterals`, as an array of references to the associated `<error>` elements (similar to the `labels` property).

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
<error for="email" validity="customerror">
  <template>Must use an @example.com email</template>
</error>

<!-- Container for all other errors, in this case, the built-in `valueMissing`'s validation message will be displayed here -->
<error for="email"></error>
```

### Use the same message for multiple validities

Authors can provide multiple validities for an `<error>` element.

```html
<label for="email">Email</label>
<input name="email" id="email" type="email" required>
<error for="email" validity="valuemissing typemismatch">
  <template>Required to enter a valid email</template>
</error>
```

### Display custom validation message

When a form control is server-side rendered with an invalid state, put the validation message directly in the `<error>` element.

```html
<input type="email" id="email" name="email" value="foo@example.com">
<error for="email">Must use an @sample.com email address</error>
```

## Pending questions

* Alternative names: `<formerror>`, `<validationmessage>`
* Should HTML elements be allowed as children, e.g. `<a>`, `<ul>`, etc.?
* For a server side rendered error (`<error>` with text content), should there be a declarative way to clear the error?
* Should there be a declarative way to define multiple custom errors? For example, using regular expressions in an attribute like `pattern` or `match`?
* Should the closing tag, `</error>`, be optional? Like `<output>`?
