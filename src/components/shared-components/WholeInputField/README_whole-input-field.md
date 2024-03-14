# `<WholeInputField>`

* [Introduction](#introduction)
* [Examples](#examples)
  * [Basic usage](#basic-usage)
  * [Full usage](#full-usage-text-input)
* [Attributes](#attributes)
  * Required attributes
    * [`field-id`](#field-id)
    * [`label`](#label)
    * [`type`](#type)
  * Optional attributes
    * [`accesskey`](#accesskey) _(standard HTML)_
    * [`custom-validation`](#custom-validation)
    * [`disabled`](#disabled) _(standard HTML)_
    * [`empty-txt`](#empty-txt)
    * [`error-msg`](#error-msg)
    * [`external-invalid`](#external-invalid)
    * [`extra-desc-by-ids`](#extra-desc-by-ids)
    * [`help-first`](#help-first)
    * [`help-txt`](#help-txt)
    * [`max-length`](#max-length) _(`maxlength` standard HTML)_
    * [`max-val`](#max-val) _(`max` standard HTML)_
    * [`min-length`](#min-length) _(`minlength` standard HTML)_
    * [`min-val`](#min-val) _(`min` standard HTML)_
    * [`no-non-empty`](#no-non-empty)
    * [`no-toggle`](#no-toggle)
    * [`options`](#options)
    * [`options-getter`](#options-getter)
    * [`other-txt`](#other-txt)
    * [`pattern`](#pattern) _(standard HTML)_
    * [`placeholder`](#placeholder) _(standard HTML)_
    * [`prefix-icon`](#prefix-icon)
    * [`readonly`](#readonly) _(standard HTML)_
    * [`required`](#required) _(standard HTML)_
    * [`required-ref`](#required-rev)
    * [`rows`](#rows) _(standard HTML)_
    * [`same-as-value`](#same-as-value)
    * [`spell-check`](#spell-check) _(`spellcheck` standard HTML)_
    * [`step`](#step) _(standard HTML)_
    * [`suffix-icon`](#suffix-icon)
    * [`tabindex`](#tabindex) _(standard HTML)_
    * [`throttle`](#throttle)
    * [`type`](#type)
    * [`validation-type`](#validation-type)
    * [`value`](#value)
* [Slots](#slots)
  * [help](#help)
  * [error](#error)
* [Events](#events)
* [`RadioSelectInput`](README.RadioSelectInput.md)

---
## Introduction

`<WholeInputField>` is a Vue component that makes it simple to add
nicely styled and accessible single value inputs (i.e. not
checkboxes, multi select fields or file inputs) to a form.

It renders the field's label, the field itself, error message
(if appropriate) and help text (if supplied).

`<WholeInputField>` exposes all the features of standard HTML inputs
via attributes along with some extra goodies like extra validation on
top of native input validation (see
[`custom-validation`](#custom-validation) for more info).

All these elements are wrapped within an `<LI>` element.

## Examples

### Basic usage

```html
<!--
 ! (Not required, no validation, no tabindex control)
 ! This should only be used for fields that are never hidden.
 ! -->
<WholeInputField
  field-id="middle-name"
  label="Middle name"
  type="text"
  value="Gabriel"
  v-on:change="firstNameChange($event)" />
```

### Full usage (text input)

```html
<!--
 ! Tabindex control is required when a field hidden some of the time
 !
 ! NOTE: `tabIndexVal` must be 0 when the field is visible and -1
 !       when the field is hidden. This prevents keyboard navigation
 !       users from getting lost in hidden inputs
 ! -->
<WholeInputField
  error-msg="First name must be no longer than 100 characters and only contain letters, commas, hyphens, spaces and/or appostrophies."
  field-id="first-name"
  help-txt="We only use your first name when sending you emails"
  label="First name"
  max-length="100"
  min-length="2"
  pattern="^[a-zA-Z][a-zA-Z ,'-]+$"
  placeholder="e.g. Charlie"
  required
  :tabindex="tabIndexVal"
  type="text"
  value="Gabriel"
  v-on:change="firstNameChange($event)" />
```

## Attributes

### `accesskey`

|  Required  |    Type    |  Default   |  Variable Name   |
|------------|------------|------------|------------------|
| _optional_ | _{string}_ | "" (empty) | `this.accesskey` |

Keyboard short cut key (using "alt + shift + [accesskey]") to
allow userto go directly to the input field

> __Note:__ `accesskey` should only be used when a field is always
>           present and visible on a page and is likely to be
>           frequently used. Like login fields.

```html
<WholeInputField
  accesskey="n"
  field-id="username"
  label="Username"
  type="text"
  pattern="^[a-zA-Z0-9]{5,30}$"
  v-on:change="usernameChange($event)" />
```

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/accesskey)
for more info)

### `custom-validation`

|  Required  |     Type     | Default |      Variable Name      |
|------------|--------------|---------|-------------------------|
| _optional_ | _{function}_ | null    | `this.customValidation` |

A function that returns a string error message if input is
not valid. Anything other than a non-empty string will be interpreted
as input is valid.

> __Note:__ In many cases custom valiation is probably over-kill.
>           Using simple pattern matching in the browser to catch
>           accidental mistakes, coupled with complex validation
>           server-side to eliminate deliberately invalid values is
>           enough. If this is true for your use-case, use the
>           [`pattern`](#pattern) attribute instead

This could be useful for:
* When you'd like to have a maximum word count on your textarea input.<br />
  Or
* more complex validation of user email addresses.<br />
  Or
* If you wish to check for expletives or malicious content.

```html
<script>
/**
 * Check if the input has the right number of words and that none of
 * those words are inappropriate
 *
 * @param {string} input
 */
const badInput = (input) => {
  // Make sure words are all lowercase so we don't miss any that
  // might be capitalised
  const tmp = input.trim().toLowerCase();
  // Find all the words
  const words = tmp.match(/\w+\W*/g);
  if (words === null || words.length < 5) {
    // Not enough words
    return 'You must enter at least 5 words';
  } else if (words.length > 100) {
    // Too many words
    return 'Please limit your word count to 100 words';
  }
  const expletives = ['badword', 'rudeword', 'inappropriate phrase']
  for (let a = 0; a < expletives.length; a += 1) {
    if (tmp.includes(expletives[a])) {
      // found Naughty words
      return 'Please do not use offensive or inapproptiate language';
    }
  }
  return '';
};
/**
 * Strip invalid and excess characters from input value then truncate
 * it if it's over 500 characters long
 *
 * @param {Event} event keyup event from `<input>` or `<textarea>`
 *                field
 * @returns {void}
 */
const sanitiseMsg = (event) => {
  const regex = /[^a-z0-9\r\n .,:;?!$%@()'/+=-]+/ig;
  event.target.value = event.target.value.replace(regex, '').substring(0, 500);
};
</script>
<WholeInputField
  :custom-validation="badInput"
  field-id="message-txt"
  label="Message"
  type="textarea"
  pattern="^[a-zA-Z0-9\r\n .,:;?!$%@()'/+=-]{15,500}$"
  :tabindex="isVisible"
  v-on:change="messageChange($event)"
  v-on:keyup="sanitiseMsg($event)" />
```

> __Note:__ It's possible for this validation to be bypassed in the
>           browser so all validation __*must*__ be duplicated on the
>           server to ensure the user doesn't submit bad data.

### `disabled`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.disabled` |

Whether or not the field is disabled
(i.e. user is prevented from interacting with the field)

A field should only be disabled when it is useful for the user to
see that the field is there but they cannot enter anything until
something changes.

e.g. if you have primary and secondary email
fields you would disable the secondary field until the primary
fields is populated and validate

`disabled` is most useful for buttons but is included here because
it's easy to implement and helps ensure versatility of this component.

> __Warning:__ By default, fields with the `disabled` attribute
>           set, are not submitted with when a form is submitted
>           via POST or GET. However, this may not be relevant if a
>           form is submitted using javascript to handle server
>           interactions.

```html
<WholeInputField
  field-id="email2"
  label="Secondary email"
  type="email"
  :disabled="invalidEmail1"
  v-on:change="email2Change($event)" />
```

(see [MDN `disabled`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled),
[MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#disabled),
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


```html
<script>
const colorOptions = [
  { value: 'blue', label: 'Bright blue' },
  { value: 'red', label: 'Hot red' },
  { value: 'pink', label: 'Bubblegum pink' },
  { value: 'brown', label: 'Fecal brown' },
  { value: 'black', label: 'Cool black' },
  { value: 'beige', label: 'Party beige' },
]
</script>

<WholeInputField
  empty-txt="-- please select a colour --"
  field-id="colour"
  label="Favourite colour"
  type="select"
  :options="colorOptions"
  v-on:change="colourChange($event)" />
```

> __Note:__ If [`no-non-empty`](#no-non-empty) is also set and the
>           default [`value`](#value) is not empty this will be
>           ignored.

### `error-msg`

|  Required  |    Type    |  Default   |  Variable Name  |
|------------|------------|------------|-----------------|
| _optional_ | _{string}_ | "" (empty) | `this.errorMsg` |

Error message to show the user when the value of the field is
invalid

> __Note:__ If the field is marked as `required` an empty value will
>           also cause the error message to show.

```html
<WholeInputField
  error-msg="Names must be between 2 and 100 charachters can only include alphabetical characters, spaces, fullstops, hyphens and apostrophes"
  field-id="first-name"
  label="First name"
  max-length="100"
  min-length="2"
  pattern="^[a-zA-Z .'-]$"
  required
  :tabindex="isVisible"
  type="text"
  v-on:change="firstnameChange($event)" />
```

> __Note:__ If you need to include HTML (e.g. a link or bullet
>           points) in the error message use the
>           ["error" slot](#error) instead.

> __Note also:__ If both `error-msg` and [`error` slot](#error) are
>           specified, the [`error` slot](#error) slot will be
>           rendered and `error-msg` will be ignored.

### `external-invalid`

|  Required  |    Type     | Default |     Variable Name      |
|------------|-------------|---------|------------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.externalInvalid` |

Whether or not this field has been marked as invalid due to
(addional) external rules

e.g. User must enter either a mobile phone number or a land
line number.
If both are empty or invalid, then both fields must be marked as
invalid.

```html
<WholeInputField
  error-msg="Please enter a valid Australian mobile phone number"
  external-invalid
  field-id="mobile"
  label="Mobile phone number"
  pattern="^04[0-9]{8}$"
  :tabindex="isVisible"
  type="tel"
  v-on:change=mobileChange($event)" />
```

### `extra-desc-by-ids`

|  Required  |    Type    |  Default   |     Variable Name     |
|------------|------------|------------|-----------------------|
| _optional_ | _{string}_ | "" (empty) | `this.extraDescByIds` |

Space seperated list of IDs for blocks of content that help give
more information about this field.

If the field needs to be associated with any extra blocks of
text, this provides the IDs for those other blocks of text

If `externalInvalid` is TRUE, this provides a way to link the
field with the information about why the field has been marked
as invalid.

```html
<WholeInputField
  error-msg="Please enter a valid Australian mobile phone number"
  extra-desc-by-ids="no-phone-error"
  external-invalid
  field-id="mobile"
  label="Mobile phone number"
  pattern="^04[0-9]{8}$"
  :tabindex="isVisible"
  type="tel"
  v-on:change=mobileChange($event)" />

<p class="error-msg" id="no-phone-error">
  You must supply one or more of the following: Mobile phone number,
  Home phone number or work phone number
</p>
```

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) & [WAI ARIA](https://w3c.github.io/aria/#aria-describedby) for more info)

### `field-id`

|  Required  |    Type    |   Default    | Variable Name  |
|------------|------------|--------------|----------------|
| _required_ | _{string}_ | _no default_ | `this.fieldId` |

ID of the field being rendered

Used to link the field to its label, error message and help
text

```html
<WholeInputField
  field-id="mobile"
  label="Mobile phone number"
  pattern="^04[0-9]{8}$"
  :tabindex="isVisible"
  type="tel"
  v-on:change=mobileChange($event)" />
```

> __Note:__ If `field-id` is undefined or empty, an error will
be thrown

### `help-first`

|  Required  |    Type     | Default |  Variable Name   |
|------------|-------------|---------|------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.helpFirst` |

Whether or not to render help text before or after input field

By default help text is rendered after the input. This overrides
the default to render the help text before the input

```html
<WholeInputField
  field-id="mobile"
  help-first
  help-text="Only valid Australian mobile phone numbers will be accepted"
  label="Mobile phone number"
  pattern="^04[0-9]{8}$"
  :tabindex="isVisible"
  type="tel"
  v-on:change=mobileChange($event)" />
```

### `help-txt`

|  Required  |    Type    |  Default   | Variable Name  |
|------------|------------|------------|----------------|
| _optional_ | _{string}_ | "" (empty) | `this.helpTxt` |

Help text to show the user to make the purpose or
requirements of the field clear.

The help text is linked to the input using the `aria-describedby`
attribute to ensure people using screen readers are also aware of
the editional information. (If there is also an error, the error
will be referenced first.)

> __Note:__ If you need to include HTML (e.g. a link) in the
>           help text use the ["help" slot](#help) instead.

> __Note also:__ If both `help-txt` and ["help" slot](#help) are
>           specified, the ["help" slot](#help) slot will be
>           rendered and `help-txt` will be ignored.

```html
<WholeInputField
  field-id="mobile"
  help-text="Only valid Australian mobile phone numbers will be accepted"
  label="Mobile phone number"
  pattern="^04[0-9]{8}$"
  :tabindex="isVisible"
  type="tel"
  v-on:change=mobileChange($event)" />
```

### `label`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ | `this.label`  |

Text to label the field

This is an accessiblity requirement.

> __Note:__ If label is undefined or empty, an error will be thrown

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

(See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) for more info)

### `max-length`

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{number}_ | _no default_ | `this.maxLength` |

Maximum number of characters user can input into this field

Used for email, number, text & url type input fields as well
as textarea fields

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  max-length="100"
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

(see [MDN `maxlength`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/maxlength),
[MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#maxlength) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#maxlength)
for more info)

### `max-val`

|  Required  |               Type                |   Default    | Variable Name |
|------------|-----------------------------------|--------------|---------------|
| _optional_ | _{number\|date\|date/time\|time}_ | _no default_ | `this.maxVal` |

Maximum value allowed

If user input is over `max-val`, field will show as being in error.

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  max-val="100"
  :tabindex="isVisible"
  type="number"
  v-on:change=fullNameChange($event)" />

<WholeInputField
  field-id="start-datetime"
  label="Date and time to start"
  max-val="2023-07-01T08:30:00+1000"
  :tabindex="isVisible"
  type="datetime-local"
  v-on:change=fullNameChange($event)" />

<WholeInputField
  field-id="start-date"
  label="Start date"
  max-val="2024-01-20"
  :tabindex="isVisible"
  type="date"
  v-on:change=fullNameChange($event)" />

<WholeInputField
  field-id="start-time"
  label="Start time"
  max-val="17:30:00"
  :tabindex="isVisible"
  type="time"
  v-on:change=fullNameChange($event)" />
```

(used for
[date](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#max),
[datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#max),
[month](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month#max),
[number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#max),
[range](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#max),
[time](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#max) &
[week](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week#max)
type input fields)

(See  [MDN `max`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/max),
[MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#max) for more info)

### `min-length`

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{number}_ | _no default_ | `this.minLength` |

Minimum number of characters user can input into this field

Used for `combobox`, `email`, `number`, `text` & `url` type input
fields as well as `textarea` fields

When used with `combobox`, (and a function is passed via the
[`options-getter`](#options-getter) attribute) it indicates the
minimum number of characters required before the option getter
is called.

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  min-length="2"
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

```html
<script type="text/javascript">
const async getFilteredCountry = (inputs) => {
  const output = [];
  ...
  return output;
}

</script>
<WholeInputField
  throttle="0.5"
  field-id="country"
  label="Country"
  min-length="2"
  :tabindex="isVisible"
  type="combobox"
  :option-getters="getFilteredCountry"
  v-on:change=countryChange($event)" />
```


(see [MDN `minlength`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/minlength),
[MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#minlength) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#minlength)
for more info)

### `min-val`

|  Required  |               Type                |   Default    | Variable Name |
|------------|-----------------------------------|--------------|---------------|
| _optional_ | _{number\|date\|date/time\|time}_ | _no default_ | `this.minVal` |

Minimum value allowed

If user input is less than `min-val`, field will show as being in
error.

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  min-val="100"
  :tabindex="isVisible"
  type="number"
  v-on:change=fullNameChange($event)" />

<WholeInputField
  field-id="start-datetime"
  label="Date and time to start"
  min-val="2023-07-01T08:30:00+1000"
  :tabindex="isVisible"
  type="datetime-local"
  v-on:change=fullNameChange($event)" />

<WholeInputField
  field-id="start-date"
  label="Start date"
  min-val="2024-01-20"
  :tabindex="isVisible"
  type="date"
  v-on:change=fullNameChange($event)" />

<WholeInputField
  field-id="start-time"
  label="Start time"
  min-val="17:30:00"
  :tabindex="isVisible"
  type="time"
  v-on:change=fullNameChange($event)" />
```

(used for
[date](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#min),
[datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#min),
[month](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month#min),
[number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#min),
[range](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#min),
[time](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#min) &
[week](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week#min)
type input fields)

(See
[MDN `min`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/min),
[MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#min)
for more info)

### `no-non-empty`

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.noNonEmpty` |

Whether or not to show the [`empty`](#empty-txt) option in a
`<select>` field if the default value is non-empty.

By default, the first option in a select field is automatically
selected if nothing is selected when rendering. To prevent the user
from submitting a value that may not be relevant, it's common
practice to have an [`empty`](#empty-txt) option as the first item
in the select list.

By including the attribute `no-non-empty` you can prevent the empty
option from being rendered if there's already a non-empty default.

For users entering new details, this shows that they need to choose
something but for people with existing details it prevents them from
choosing nothing.

```html
<script>
const pets = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabit', label: 'Rabit' },
  { value: 'guinea pig', label: 'Guinea pig' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'budgie', label: 'Budgie' },
  { value: 'rat', label: 'Rat' }
];
</script>
<WholeInputField
  field-id="pet"
  label="Type of pet"
  empty-txt="-- please choose pet type --"
  no-non-empty
  :options="pets"
  :tabindex="isVisible"
  type="select"
  value="guinea pig"
  v-on:change=fullNameChange($event)" />
```

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

```html
<WholeInputField
  field-id="password"
  label="New password"
  no-toggle
  :tabindex="isVisible"
  type="password"
  v-on:change=fullNameChange($event)" />
```

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
  the label/text that's wrapped within the `<option></option>` elements.<br />
   e.g. `{ '001': 'First option', '002': 'Option two', '003': 'Number three' }`

```html
<script>
const pets = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabit', label: 'Rabit' },
  { value: 'guinea pig', label: 'Guinea pig' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'budgie', label: 'Budgie' },
  { value: 'rat', label: 'Rat' }
];
</script>
<WholeInputField
  field-id="pet"
  label="Type of pet"
  :options="pets"
  :tabindex="isVisible"
  type="select"
  value="guinea pig"
  v-on:change=fullNameChange($event)" />
```

(See [MDN `<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option), [MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select), [MDN `<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) for more info)

### `options-getter`

|  Required  |     Type     | Default |    Variable Name     |
|------------|--------------|---------|----------------------|
| _optional_ | _{function}_ |  null   | `this.optionsGetter` |

`options-getter` is an async function that's called on keyup event
from text input.

Calls to `optionsGetter()` are rate limited to once per second unless
[`throttle`](#throttle) is set.

If [`min-length`](#min-length) is set, then `optionsGetter()` will
not be called until the minimum number of characters has been
entered.

It is assumed that `optionsGetter()` calls out to an external API
but doesn't have to, so long as it's defined as async.

`optionsGetter()` functions must have the form:

```typescript
type optionsGetter = async (string) : string[];
```

```html
<script type="text/javascript">
const async getFilteredCountry = (inputs) => {
  const cleanIn = inputs.replace(/[^a-z0-9 ]+/g, '').substring(0, 16);
  const request = `https://api.example.com/get-country?input=${cleanIn}`;

  try {
    const response = await fetch(`https://api.example.com/get-country?input=${cleanIn}`);

    if (!response.ok) {
      console.error(`"${request}" failed`);
      return [];
    }

    // assumes JSON response is an array of string
    return response.json();
  } catch (error) {
    console.error(`There was an error with "${request}":`, error);
    return [];
  }
}
</script>
<!--
 ! For this implementation, optionGetters() will be called a maximum
 ! of once every half second when there are two or more characters
 ! in the input field
 ! -->
<WholeInputField
  throttle="0.5"
  field-id="country"
  label="Country"
  min-length="2"
  :tabindex="isVisible"
  type="combobox"
  :option-getters="getFilteredCountry"
  v-on:change=countryChange($event)" />
```

### `other-txt`

|  Required  |    Type    |   Default    |  Variable Name  |
|------------|------------|--------------|-----------------|
| _optional_ | _{string}_ | _no default_ | `this.otherTxt` |

Used by [`RadioSelectInput`](README.RadioSelectInput.md#other-txt) to
append an an additional option (or radio button) to the provided list
to indicate that none of the provide options are applicable. If this
option is selected a `showother` event is emitted so that the client
component can do something (like show an "Other please specify" text
input box).

```html
<script>
const pets = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabit', label: 'Rabit' },
  { value: 'guinea pig', label: 'Guinea pig' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'budgie', label: 'Budgie' },
  { value: 'rat', label: 'Rat' }
];
</script>
<WholeInputField
  field-id="pet-type"
  label="Type of pet"
  :options="pets"
  other-txt="Other (my pet is not listed here)"
  :tabindex="isVisible"
  type="select"
  v-on:change="petTypeChange($event)"
  v-on:showother="showOther($event)" />
<WholeInputField v-if="otherPet === true"
  field-id="pet-type-other"
  label="Other type of pet"
  :tabindex="isVisible"
  placeholder="e.g. turkey"
  type="text"
  validation-type="name" />
```

### `pattern`

|  Required  |    Type    |   Default    | Variable Name  |
|------------|------------|--------------|----------------|
| _optional_ | _{string}_ | _no default_ | `this.pattern` |

JavaScript regular expression for validating string input

> __Note:__ `pattern` is great for basic validation but is not always
>           enough. In cases when you need more complex validation,
>           pass a validation function to the field using
>           [`custom-validation`](#custom-validation).

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  pattern="^[a-zA-Z][a-zA-Z0-9. -]{1,50}$"
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#pattern) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#pattern)
for more info)

### `placeholder`

|  Required  |    Type    |   Default    |   Variable Name    |
|------------|------------|--------------|--------------------|
| _optional_ | _{string}_ | _no default_ | `this.placeholder` |

Helper text to show inside input field when value is empty.

> __Note:__ Place holder text disappears as soon as anything is
>           entered into the input box. Thus should not be used for
>           essential information about the field.

> __Note also:__ Only some field types display `placeholder`s so it
>           may be redundant in your use case.<br />
>           Only the following fileds _do_ render the `placeholder` attribute:
>           [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/),
>           [email](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email),
>           [number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number),
>           [password](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password),
>           [tel](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel),
>           [text](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text),
>           [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) &
>           [url](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/url)

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  placeholder="e.g. Gabriel Smith"
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#placeholder) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#placeholder)
for more info)

### `prefix-icon`

|  Required  |    Type    |   Default    |   Variable Name   |
|------------|------------|--------------|-------------------|
| _optional_ | _{string}_ | _no default_ | `this.prefixIcon` |

Material Icon name or single chracter to be rendered at the start
of a text type input field. E.g if you have a money input field you
could use "$" as the prefix icon and it would appear inside the
input field box.

> __Note:__ For the [standard validation types](#validation-type),
>           this is unnecessary because they come with predefined
>           properties including `prefix-icon`.
>           However, if you wish to override the prefix icon
>           associated with the standard validation type you can
>           specify it with the `prefix-icon` like so.

```html
<WholeInputField
  field-id="amount"
  label="How much money do you want"
  placeholder="50"
  prefix-icon="euro"
  :tabindex="isVisible"
  type="number"
  validation-type="money"
  v-on:change=amountChange($event)" />
```
> See also: [`suffix-icon`](#suffix-icon)

### `readonly`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.readonly` |

Whether or not the field is readonly
(i.e. user is prevented from interacting with the field)

> "The difference between disabled and readonly is that read-only
> controls can still function and are still focusable, whereas
> disabled controls can not receive focus and are not submitted
> with the form and generally do not function as controls until
> they are enabled.
>
> Because a read-only field cannot have its value changed by a user
> interaction, required does not have any effect on inputs with the
> readonly attribute also specified."
> [MDN `readonly`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly#attribute_interactions)

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  readonly
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#readonly) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#readonly)
for more info)

### `required`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.required` |

Whether or not the field requres a non-empty value

> __Note:__ Fields marked as required are assumed to be invalid if
>           empty after focus has been removed. They will show a red
>           error outline and an error message (if one is set using
>           [`error-msg` attribute](#error-msg) or the
>           [`error` slot](#error))

> __Note:__ If a field is marked as [`disabled`](#disabled), required
>           has no effect.

```html
<WholeInputField
  field-id="full-name"
  label="Full name"
  required
  :tabindex="isVisible"
  type="text"
  v-on:change=fullNameChange($event)" />
```

(see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#required),
[MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#required) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#required)
for more info)

### `required-rev`

|  Required  |    Type     | Default |  Variable Name  |
|------------|-------------|---------|-----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.requiredRev` |

Whether or not to render "(optional)" when the field is optional and
blank when it is required, instead of the conventional approach which
is to render blank when input is optional and "(required)" when it's
required.

> __Note:__ This is a __VERY BAD__ pattern, however, my current
>           use-case requires it until we can have it reversed.


### `rows`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _optional_ | _{number}_ | _no default_ | `this.rows`   |

Number of lines in a textarea input.

> __Note:__ `rows` is not relevant to any other input type

```html
<WholeInputField
  field-id="description"
  label="Long description"
  rows="10"
  :tabindex="isVisible"
  type="textarea"
  v-on:change=descriptionChange($event)" />
```

(see [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#rows) for more info)

### `same-as-value`
|  Required  |       Type       |   Default    |   Variable Name    |
|------------|------------------|--------------|--------------------|
| _optional_ | _{string\|null}_ |    `null`    | `this.sameAsValue` |

Sometimes you need a user to enter the same value into two different
field to ensure they've got it right (e.g. phone number, password,
or email). You use this attribute to provide the value that must be
compared.

If `same-as-value` is not null and is different to the current value,
then the current value will be deemed invalid.

```html
<WholeInputField
  error-msg="New password must match confirm password"
  field-id="new-password"
  label="New password"
  :same-as-value="confirmPasswordVal"
  :tabindex="isVisible"
  type="password"
  v-on:change="evenChange($event)" />
<WholeInputField
  error-msg="Confirm password must match new password"
  field-id="confirm-password"
  label="Confirm password"
  :same-as-value="newPasswordVal"
  :tabindex="isVisible"
  type="password"
  v-on:change="evenChange($event)" />
```

### `spell-check`

|  Required  |    Type     |   Default    |   Variable Name   |
|------------|-------------|--------------|-------------------|
| _optional_ | _{boolean}_ | _no default_ | `this.spellCheck` |

Whether or not to use built in browser/system spell check
functionality

> __Note:__ `spell-check` is only relevant to `text` and `textarea`
>           type fields

```html
<WholeInputField
  field-id="description"
  label="Long description"
  spell-check
  :tabindex="isVisible"
  type="textarea"
  v-on:change=descriptionChange($event)" />
```

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

```html
<WholeInputField
  field-id="even-numbers"
  label="Favourite even number"
  step="2"
  :tabindex="isVisible"
  type="number"
  v-on:change="evenChange($event)" />
```

> __Note:__ `step` is only avalid for numeric types:
> [date](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date),
> [datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local),
> [month](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month),
> [number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number),
> [range](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range),
> [time](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time) &
> [week](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week) types.

(See [MDN `step`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step) & [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#step) for more info)

### `suffix-icon`

|  Required  |    Type    |   Default    |   Variable Name   |
|------------|------------|--------------|-------------------|
| _optional_ | _{string}_ | _no default_ | `this.suffixIcon` |

Material Icon name or single chracter to be rendered at the end of
a text type input field. E.g if you have a percentage input field
you could use "%" as the prefix icon and it would appear inside the
input field box.

> __Note:__ For the [standard validation types](#validation-type),
>           this is unnecessary because they come with predefined
>           properties including `prefix-icon`.
>           However, if you wish to override the suffix icon
>           associated with the standard validation type you can
>           specify it with the `suffix-icon` like so.

```html
<WholeInputField
  field-id="percent"
  label="Percent"
  placeholder="50"
  suffix-icon="%"
  :tabindex="isVisible"
  type="number"
  validation-type="percent"
  v-on:change=fullNameChange($event)" />
```
> See also: [`prefix-icon`](#prefix-icon)

### `tabindex`

|  Required  |    Type    | Default |  Variable Name  |
|------------|------------|---------|-----------------|
| _optional_ | _{number}_ | `0`     | `this.tabindex` |

When content is hidden, tabindex must be set to `-1` to
prevent the user using the keyboard to tab into hidden inputs.

> __Note:__ If tabindex is not `-1` it will not be rendered
>           on the field, instead the browser's default
>           tabbing order will be used

> __Note also:__ In all the examples in this documentation, I use
>           the dynamic `computed` property `isVisible` because I
>           need `tabindex` attribute to be programatically
>           controlled based on the visibility of the field.
>           Fields, buttons (and links) that are not visible, should
>           not receive focus otherwise, sighted, keyboard
>           navigation users may (will probably) get lost in the page.

```html
<WholeInputField
  field-id="even-numbers"
  label="Favourite even number"
  :tabindex="isVisible"
  type="number"
  v-on:change="evenChange($event)" />
```

(see [MDN `tabindex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex),
[MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#tabindex),
[MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#tabindex) &
[MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#tabindex)
for more info)

### `throttle`

|  Required  |    Type    | Default | Minimum | Maximum |  Variable Name  |
|------------|------------|---------|---------|---------|-----------------|
| _optional_ | _{number}_ |   `1`   |  0.05   |    5    | `this.throttle` |

Only used by `combobox` input types.

The number of seconds between calls to [`optionsGetter()`](#options-getter). Used to
throttle calls to `optionsGetter()` on keyup events to minimise
network requests.

Minimum is 0.05 (1/20 of a second). The equivalent of typing at 180
words per minute.
Maximum is 5 (5 seconds). If requests need to be throttled to less
than once every five seconds it may be time to reconsider the API.

### `type`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ | `this.type`   |

Type of field to be rendered

Allowed types are:
* [color](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color)
* [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
  (Text field with fixed set of options. Useful for very long option
  lists - e.g. country list)
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


```html
<WholeInputField
  field-id="even-numbers"
  label="Favourite even number"
  :tabindex="isVisible"
  type="text"
  v-on:change="evenChange($event)" />
```

> __Note:__ If the specified type is not one of the above,
>           an error will be thrown

### `validation-type`

|  Required  |   Type     |   Default   |     Variable Name      |
|------------|------------|-------------|------------------------|
| _optional_ | _{string}_ | `undefined` | `this.validationType`  |

Predefined validation settings for common input types:

* fixedphone (Australia)
* mobilephone (Australia)
* anyphone (Australia)
* intphone (International phone number)
* email (prevents malicious email being used)
* pobox (PO box postcode)
* street (Street address postcode)
* postcode (PO Box or Street address postcode)
* name (People's - names very restricted character set)
* url
* money (number with zero or two decimal places)
* percent (Up to three whole numbers followed by up to three decimal
  places)

Automatically sets input [pattern](#pattern) attribute, [placeholder](#placeholder) text, [error message](#error-msg), [custom validation](#custom-validation) function and sanitisation function (triggered on `keyup` event)

```html
<WholeInputField
  field-id="mobile-number"
  label="Mobile"
  :tabindex="isVisible"
  type="text"
  validation-type="mobilephone"
  v-on:change="evenChange($event)" />
```

### `value`

|  Required  |       Type         |   Default   | Variable Name |
|------------|--------------------|-------------|---------------|
| _optional_ | _{string\|number}_ | `undefined` | `this.value`  |

Predefined value for the field.

```html
<WholeInputField
  field-id="even-numbers"
  label="Favourite even number"
  :tabindex="isVisible"
  type="text"
  value="128"
  v-on:change="evenChange($event)" />
```

---
## Slots

### `help`

Text to show user to help them understand the purpose or requirements
of the input field.

This should only be used when your help content needs to contain
HTML (e.g. links or bullet points).

```html
<WholeInputField
  field-id="prime-numbers"
  label="Favourite prime number"
  :tabindex="isVisible"
  type="number"
  v-on:change="evenChange($event)">
  <p>
    Prime numbers are only visible by one and themselves.
    For more info see
    <a href="https://en.wikipedia.org/wiki/Prime_number">
      Wikipedia Prime Number
    </a>
  </p>
</WholeInputField>
```

If plain text is all you need for your help text, use the
[`help-txt` attribute](#help-txt) instead.

> __Note:__ If both [`help-txt`](#help-txt) and `help` slot are
>           specified, the `help` slot will be rendered and
>           [`help-txt`](#help-txt) will be ignored.

### `error`

Error HTML to show user if their input is invalid (or empty).

This should only be used when your error message needs to contain
HTML (e.g. links or bullet points).

If plain text is all you need for your error message, use the
[`error-msg` attribute](#error-msg) instead.

> __Note:__ If both [`error-msg`](#error-msg) and `error` slot are
>           specified, the `error` slot will be rendered and
>           [`error-msg`](#error-msg) will be ignored.

---
## Events

The only event that WholeInputField deliberately emits is `change`
to indicate that there is a valid input that the user has
entered/selected.

`WholeInputField` will re-emit all other standard DOM events an
`<INPUT>`, `<SELECT>` or `<TEXTAREA>` field emits along with the
Event object that was initially emitted by the original element.
This is so the client code can watch for any events it is interested
in and then apply any additional logic based on a standard event.

---

See info about [Vite and VueJS](README.vite.md)

