# Proposal for declarative validation messages

* Author: Zacky Ma <zacky@marchbox.com>, <zacky.ma@microsoft.com>
* Last updated: 2025-09-01

## Introduction

### Motivation

HTML added [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation) with the intention of easing the validation process and UI for web forms. While this approach doesn’t prevent invalid values from being submitted to the server, e.g. it’s easy for a user to add `novalidate` attribute to the `<form>` element in a browser developer tool to bypass the validation, it makes building a form UI and logic a lot easier, and it improves accessibility for web forms.

However, the current Constraint Validation API has a few shortcomings:

* Unable to customize the styles and content of the built-in validation messages
* No declarative way to add custom validation messages
* ==TODO== Accessibility issues

### Goal

* Provide a declarative way to add validation messages to HTML (both built-in and custom messages for built-in validity states)
* Enable styling of a validation message with CSS
* Support server side rendered error that sets the associated form control to invalid state
* ==TODO== Solve accessibility issues

## Current solution

==TODO==

## Abstract proposal

In order to mark up declarative validation messages, I’m proposing 2 options:

1. Enhancing the existing `<output>` element
2. Add a new `<error>` element

But both options share a similar set of mechanisms. I’ll illustrate the abstract mechanisms first, then detail the pros and cons of each option. We’ll use the term “display element” to represent the element that displays the validation messages, it could either be an `<output>` element or an `<error>` element.

### How it works

* The *display element* has a `for` attribute (and an `htmlFor` property) to declare the association between itself and a form control element
    * When the associated form control element is invalid, browser should add the *display element* to its  `ariaErrorMessageElements` property
* The `validity` attribute
    * Authors can provide a list of space-separated strings as its value, to represent which built-in validities’ validation messages the element should display. The names of the built-in validities are case insensitive, e.g. `valueMissing` can be represented as `valueMissing` or `valuemissing` in the attribute value
    * The attribute is reflected by the `validityList` property, as a `DOMTokenList`
* Supports `:valid` and `:invalid` pseudo classes.
    * The `:invalid` pseudo class is added when the associated form control element has :invalid` added
* If the associated form control element is disabled, add `:disabled` pseudo class to the *display element*
* The element behaves differently depending on the `validity` attribute value and its child content.

| Child content | `validity` attribute has string values? | Form control’s validity needed to display content | Displayed content |
|:-|:-|:-|:-|
| Empty | No | Any invalid  | Built-in validation message |
| Empty | Yes | Matching `validity` attribute | Built-in validation message |
| `<template>` | No | Any invalid  | Built-in validation message (`<template>` is ignored) |
| `<template>` | Yes | Matching `validity` attribute | The `<template>`’s content |
| Text | (Ignored) | Always `customError` | Author’s text content |

If multiple *display elements* associated to the same form control meet the display content condition, all the `<error>` elements will be shown.

### Examples

The `<display-element>` in the example code represents either an `<output>` element or an `<error>` element. When it repreents an `<output>` element, the `validity` attribute should always be present.

Display any built-in validation message:

```html
<label for="email">Email</label>
<input name="email" id="email" placeholder="foo@bar.com">
<display-element for="email" validity></display-element>
```

Display specific built-in validation messages:

```html
<label for="email">Email</label>
<input name="email" id="email" placeholder="foo@bar.com">
<display-element for="email" validity="valuemissing typemismatch"></display-element>
```

Display a custom validation message for any validity:

```html
<label for="email">Email</label>
<input name="email" id="email" placeholder="foo@bar.com">
<display-element for="email">
  <template>Something is wrong</template>
</display-element>
```

Display custom validation messages for specific validities:

```html
<label for="email">Email</label>
<input name="email" id="email" placeholder="foo@bar.com">
<display-element
  for="email"
  validity="valuemissing"
>
  <template>Fill the email to help us contact you.</template>
</display-element>
<display-element
  for="email"
  validity="typemismatch"
>
  <template>Use a valid email.</template>
</display-element>
```

Display a custom server rendered validation message:

```html
<label for="email">Email</label>
<input name="email" id="email" placeholder="foo@bar.com">
<display-element for="email">
  Something wrong from the server-side.
</display-element>
```

Display a built-in server rendered validation message:

```html
<label for="email">Email</label>
<input name="email" id="email" placeholder="foo@bar.com">
<display-element for="email" validity="typemismatch">
  Enter a valid email address.
</display-element>
```

## Proposal 1: Enhancing the `<output>` element

In [HTML spec](https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element), the `<output>` element is defined as “the result of a calculation performed by the application, or the result of a user action”. “The result of a user action“ aligns well with the semantic of validation messages.

Additionally, the `<output>` element has a few existing features that aligns well with the functions of validation messages:

* The `for` attribute and `htmlFor` property for associating with form control elements
* It’s a live region, the content changes will be announced by Assistive Technology softwares
* It accepts phrasing content that can be used for server rendered validation messages

The presence of the `validity` attribute opts in the `<output>` element for displaying validation messages, and gives the element an implicit ARIA role of `alert`. The attribute can be a boolean type or a string type.

### Pending questions

* How does the Constraint Validation API work on an `<output>`, e.g. what does it do by calling `reportValidity()` on a `HTMLOutputElement`? And how does the new additions affect that?
* `HTMLOutputElement` has a `validity` property, is it confusing that it gains `validity` attribute and `validityList` property?
* Should an `<output>` be allowed to associate with multiple form controls when `validity` attribute is present?


## Proposal 2: New `<error>` element

A new HTML element, `<error>`, as the container to display validation messages. It doesn’t come with any existing semantics and functionalities that may be conflict with the new features.

### Pending questions

* Alternative names: `<formerror>`, `<validationmessage>`

## Other pending questions

These questions applies to both proposals:

* Should HTML elements be allowed as children, e.g. `<a>`, `<ul>`?
* For a server rendered validation message, should there be a declarative way to clear the message?
* Should there be a declarative way to define multiple custom errors? For example, using regular expressions in an attribute like `pattern` or `match`?
* Any cross shadow root issues that need to be address? Is the existing `ReferenceTarget` spec good enough?
