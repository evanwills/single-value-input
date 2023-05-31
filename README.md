# `<SingleValueInput>`

* [Introduction](#introduction)
* [Basic usage](#basic-usage)
* [Attributes](#attributes)
* [Slots](#slots)
  * [help](#help)
  * [error](#error)
* [Events](#events)

---
## Introduction

`<SingleValueInput>` makes it simple to add new, nicely styled and
accessible single value inputs (i.e. not checkboxes, multi select
fields or file inputs) to a form.

It renders the field's label, the field itself, error message
(if appropriate) and help text (if supplied).

`<SingleValueInput>` exposes all the features of standard HTML inputs 
via attributes along with some extra goodies like extra validation on 
top of native input validation (see 
[`custom-validation`](#custom-validation) for more info).

All these elements are wrapped within an `<LI>` element.

## Basic usage

```html
<SingleValueInput
  error-msg="Please enter a first name"
  field-id="first-name"
  max-length="100"
  pattern="^[^\w \-.\']+$"
  placeholder="e.g. Jo"
  required
  :tabindex="tabIndex"
  type="text"
  label="First name"
  value="Gabriel"
  v-on:change="firstNameChange($event)"
  v-on:keyup="sanitiseName($event)"></SingleValueInput>
```

## Attributes

### `accesskey`

|  Required  |    Type    |  Default   |  Variable Name   |
|------------|------------|------------|------------------|
| _optional_ | _{string}_ | "" (empty) | `this.accesskey` |

Keyboard short cut key (using "alt + shift + [accesskey]") to
allow userto go directly to the input field

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/accesskey)
for more info)

### `custom-validation`

|  Required  |     Type     | Default |      Variable Name      |
|------------|--------------|---------|-------------------------|
| _optional_ | _{function}_ | null    | `this.customValidation` |

A function that returns a string error message if input is
not valid. Or, an empty string if input is valid.

This could be useful for when you'd like to have a maximum word count
on your textarea input. Or more complex validation of user email
addresses.

```typescript
(input : string|number) : string|boolean;
```

### `disabled`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.disabled` |

Whether or not the field is disabled
(i.e. user is prevented from interacting with the field)

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#disabled),
[MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#disabled) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#disabled)
for more info)

### `empty-txt`

|  Required  |    Type    |  Default   |  Variable Name  |
|------------|------------|------------|-----------------|
| _optional_ | _{string}_ | "" (empty) | `this.emptyTxt` |

For select fields where no default is currently set, this
provides an indicator that the user must choose an option

(This text is inserted as the first item in a select list)

Without user interaction in a `<select>` input, the first option in
a select field is the default. To prevent the user from submitting a
value that may not be relevant, it's common practice to have an
[`empty`](#empty-txt) option as the first item in the select list.

> __Note:__ if [`no-non-empty`](#no-non-empty) is also set and the
>           default [`value`](#value) is not empty this will be
>           ignored.

### `error-msg`

|  Required  |    Type    |  Default   |  Variable Name  |
|------------|------------|------------|-----------------|
| _optional_ | _{string}_ | "" (empty) | `this.errorMsg` |

Error message to show the user when the value of the field is
invalid

> __Note:__ If you need to include HTML (e.g. a link or bullet points) in the
>           error message use the ["error" slot](#error) instead.

### `external-invalid`

|  Required  |    Type     | Default |     Variable Name      |
|------------|-------------|---------|------------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.externalInvalid` |

Whether or not this field has been marked as invalid due to
(addional) external rules

e.g. User must enter either a mobile phone number or a land
line number.
If both are empty then both fields must be marked as
invalid.

### `extra-desc-by-ids`

|  Required  |    Type    |  Default   |     Variable Name     |
|------------|------------|------------|-----------------------|
| _optional_ | _{string}_ | "" (empty) | `this.extraDescByIds` |

If the field needs to be associated with any extra blocks of
text, this provides the IDs for those other blocks of text

If `externalInvalid` is TRUE, this provides a way to link the
field with the information about why the field has been marked
as invalid.

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) & [WAI ARIA](https://w3c.github.io/aria/#aria-describedby) for more info)

### `field-id`

|  Required  |    Type    |   Default    | Variable Name  |
|------------|------------|--------------|----------------|
| _required_ | _{string}_ | _no default_ | `this.fieldId` |

ID of the field being rendered

Used to link the field to its label, error message and help
text

> __Note:__ If fieldId is undefined or empty, an error will
be thrown

### `help-first`

|  Required  |    Type     | Default |  Variable Name   |
|------------|-------------|---------|------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.helpFirst` |

Whether or not to render help text before or after input field

### `help-txt`

|  Required  |    Type    |  Default   | Variable Name  |
|------------|------------|------------|----------------|
| _optional_ | _{string}_ | "" (empty) | `this.helpTxt` |

Help text to show the user to make the purpose or
requirements of the field clear

> __Note:__ If you need to include HTML (e.g. a link) in the
>           error message use the "help" slot instead.

### `label`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ | `this.label`  |

Text to label the field

This is an accessiblity requirement.

> __Note:__ If label is undefined or empty, an error will
>           be thrown

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) for more info)

### `max-length`

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{number}_ | _no default_ | `this.maxLength` |

Maximum number of characters user can input into this field

Used for email, number, text & url type input fields as well
as textarea fields

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#maxlength) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#maxlength)
for more info)

### `max-val`

|  Required  |               Type                |   Default    | Variable Name |
|------------|-----------------------------------|--------------|---------------|
| _optional_ | _{number\|date\|date/time\|time}_ | _no default_ | `this.maxVal` |

Maximum value allowed

(used for date, datetime-local, number, range & time type input fields)

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#max) for more info)

### `min-length`

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{number}_ | _no default_ | `this.minLength` |

Minimum number of characters user can input into this field

Used for email, number, text & url type input fields as well
as textarea fields

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#minlength) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#minlength)
for more info)

### `min-val`

|  Required  |               Type                |   Default    | Variable Name |
|------------|-----------------------------------|--------------|---------------|
| _optional_ | _{number\|date\|date/time\|time}_ | _no default_ | `this.minVal` |

Minimum value allowed

(used for date, datetime-local, number, range & time type
input fields)

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#min) for more info)

### `no-non-empty`

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.noNonEmpty` |

Whether or not to show the [`empty`](#empty-txt) option in a
`<select>` field if the default value is non-empty.

By default, the first option in a select field is the default.
To prevent the user from submitting a value that may not be relevant.
It's common practice to have an [`empty`](#empty-txt) option as the
first item in the select list. This prevents the empty option from
being rendered if there's already a non-empty default.

### `no-toggle`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.noToggle` |

Whether or not to allow user to toggle password visibility
for password inputs.

If you want the user to enter a password and you expect their
password to be good, it's likely that (if it is actually good) the
password will be hard to enter. Thus, the user is likely to make
mistakes while typing. This allows the user toggle whether or not
their password is visible or obfuscated.

### `options`

|  Required  |   Type    |   Default    | Variable Name  |
|------------|-----------|--------------|----------------|
| _optional_ | _{array}_ | _no default_ | `this.options` |

List of options available in a `<SELECT>` or `<INPUT type="radio">`
or `<INPUT type="text" role="combobox">` field

> __Note:__ If `type` is "select" or "radio" and there are
>           less than two options in the in the `options`
>           property, an error will be thrown

Options can have the following structures

* Array of objects where the first property in the object represents
  what will go in the option's value attribute `<option value="">`
  and the second property will be the label/text that's wrapped
  within the `<option></option>` elements
  * either `{ value: {string|number}, label: {string} }`
  * or `{ key: {string|number}, value: {string} }`
  * or `{ Value: {string|number}, Key: {string} }`
* An array of strings (useful when the option value is the same as
  the option label/text)
* An object where the property name is used as the option's value
  attribute `<option value="">` and the property's value us use as
  the label/text that's wrapped within the `<option></option>` elements

(See [MDN `<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option), [MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), [MDN `<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) for more info)

### `pattern`

|  Required  |    Type    |   Default    | Variable Name  |
|------------|------------|--------------|----------------|
| _optional_ | _{string}_ | _no default_ | `this.pattern` |

JavaScript regular expression for validating string input

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#pattern) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#pattern)
for more info)

### `placeholder`

|  Required  |    Type    |   Default    |   Variable Name    |
|------------|------------|--------------|--------------------|
| _optional_ | _{string}_ | _no default_ | `this.placeholder` |

Helper text to show inside input field when value is empty

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#placeholder) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#placeholder)
for more info)

### `readonly`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.readonly` |

Whether or not the field is readonly
(i.e. user is prevented from interacting with the field)

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#readonly) & [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#readonly) for more info)

### `required`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.required` |

Whether or not the field requres a non-empty value

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#required),
[MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#required) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#required)
for more info)

### `rows`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _optional_ | _{number}_ | _no default_ | `this.rows`   |

Number of lines in a textarea input

(see [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#rows) for more info)

### `spell-check`

|  Required  |    Type     |   Default    |   Variable Name   |
|------------|-------------|--------------|-------------------|
| _optional_ | _{boolean}_ | _no default_ | `this.spellCheck` |

Whether or not to use built in browser/system spell check
functionality

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#spellcheck) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#spellcheck)
for more info)

### `step`
|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _optional_ | _{number}_ | _no default_ | `this.step`   |

Increment when using buttons to decrease/increase value

Used for date, datetime-local, number, range & time type
input fields.

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#step) for more info)

### `tabindex`

|  Required  |    Type    | Default |  Variable Name  |
|------------|------------|---------|-----------------|
| _optional_ | _{number}_ | `0`     | `this.tabindex` |

When content is hidden, tabindex must be set to `-1` to
prevent the user using the keyboard to tab into hidden inputs.

> __Note:__ If tabindex is not `-1` it will not be rendered
>           on the field, instead the browser's default
>           tabbing order will be used

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#tabindex),
[MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#tabindex) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#tabindex)
for more info)

### `type`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ | `this.type`   |

Type of field to be rendered

Allowed types are:
* [color](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color)
* [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (Text field with fixed set of options. Useful for very long option lists - e.g. country list)
* [date](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date)
* [datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local)
* [email](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email)
* [month](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month)
* [number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)
* [password](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password)
* [radio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio)
* [range](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range)
* [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select)
* [tel](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel)
* [text](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text)
* [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)
* [time](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time)
* [url](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/url)
* [week](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week)

> __Note:__ If the specified type is not one of the above,
>           an error will be thrown

### `value`

|  Required  |       Type         |   Default   | Variable Name |
|------------|--------------------|-------------|---------------|
| _optional_ | _{string\|number}_ | `undefined` | `this.value`  |

Predefined value for the field.

## Slots

### `help`

Text to show user to help them understand the purpose or requirements
of the input field.

This should only be used when your help content needs to contain
HTML (e.g. links or bullet points).

If plain text is all you need for your help text, use the 
[`help-txt` attribute](#help-txt) instead.

### `error`

Error HTML to show user if their input is invalid (or empty).

This should only be used when your error message needs to contain
HTML (e.g. links or bullet points).

If plain text is all you need for your error message, use the 
[`error-msg` attribute](#error-msg) instead.

## Events

The only event that SingleValueInput deliberately emits is `change`
to indicate that there is a valid input that the user has
entered/selected.

`SingleValueInput` will re-emit all other standard DOM events an
`<INPUT>`, `<SELECT>` or `<TEXTAREA>` field emits along with the
Event object that was initially emitted by the original element.
This is so the client code can apply any additional logic based on a
standard event.

See info about [Vite and VueJS](README.vite.md)

