# `<RadioSelectInput>`

* [Introduction](#introduction)
* [Examples](#examples)
* [Attributes](#attributes)
  * Required attributes
    * [field-id](#field-id)
    * [options](#options)
    * [tab-index](#tab-index)
  * Optional attributes
    * [access-key](#access-key)
    * [empty-txt](#empty-txt)
    * [help-ids](#help-ids)
    * [is-disabled](#is-disabled)
    * [is-radio](#is-radio)
    * [is-required](#is-required)
    * [is-readonly](#is-readonly)
    * [min-chars](#min-chars)
    * [no-non-empty](#no-non-empty)
    * [options-getter](#options-getter)
    * [throttle](#throttle)
    * [value](#value)

---

## Introduction

`<RadioSelectInput>` Handles rendering inputs that have a fixed set of options (`<select>`, `<input type="radio">` & `<input type="text" role="combobox">`)

## Examples


## Attributes

### `access-key`

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{string}_ | _no default_ | `this.accessKey` |

Keyboard short cut key (using "alt + shift + [accesskey]") to
allow user to go directly to the input field

### `empty-txt`

|  Required  |    Type    |  Default   |  Variable Name  |
|------------|------------|------------|-----------------|
| _optional_ | _{string}_ | "" (empty) | `this.emptyTxt` |

For select fields where no default is currently set, this
provides an indicator that the user must choose an option

(Is inserted as the first item in a select list)

### `field-id`

|  Required  |    Type    |   Default    | Variable Name  |
|------------|------------|--------------|----------------|
| _required_ | _{string}_ | _no default_ | `this.fieldId` |

ID of the field being rendered

Used to link the field to its label, error message and help
text

### `help-ids`

|  Required  |    Type    |  Default   | Variable Name  |
|------------|------------|------------|----------------|
| _optional_ | _{string}_ | "" (empty) | `this.helpIds` |

IDs for error and help text blocks to use as value for
`aria-describedby` attribute

Used to link the field to its label, error message and help
text

### `is-disabled`

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isDisabled` |

Whether or not the field is disabled
(i.e. user is prevented from interacting with the field)

### `is-radio`

|  Required  |    Type     | Default | Variable Name  |
|------------|-------------|---------|----------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isRadio` |

Whether or not to render the field as a radio group

### `is-required`

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isRequired` |

Whether or not the field requres a non-empty value

### `is-readonly`

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isReadonly` |

Whether or not the field is readonly
(i.e. user is prevented from interacting with the field)

### `min-chars`

|  Required  |    Type    | Default |  Variable Name  |
|------------|------------|---------|-----------------|
| _optional_ | _{number}_ |   `0`   | `this.minChars` |

For `combobox` types, this represents the minimum number of
characters the user needs to enter before
[`options-getter()`](#options-getter) is called.

### `no-non-empty`

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.noNonEmpty` |

Whether or not to show the empty value if the default value
is non-empty

### `options`

|  Required  |   Type    |   Default    | Variable Name  |
|------------|-----------|--------------|----------------|
| _required_ | _{array}_ | _no default_ | `this.options` |

List of options available in a `<SELECT>`, `<INPUT type="radio">`
or `<INPUT type="text" role="combobox">` field

> __Note:__ If `type` is "select", "radio" or "combobox" and there
>           are less than two options in the in the `options`
>           property, an error will be thrown

### `options-getter`

|  Required  |     Type     |   Default    |    Variable Name     |
|------------|--------------|--------------|----------------------|
| _optional_ | _{function}_ | _no default_ | `this.optionsGetter` |

> __Note:__ only used for `combobox` fields.

An async function used to supply options for combo box.

Function must take a single string argument and return an array of
strings which are then used to populate options for input.

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
<RadioSelectInput
  throttle="0.5"
  field-id="country"
  label="Country"
  min-chars="2"
  :tabindex="isVisible"
  type="combobox"
  :option-getters="getFilteredCountry"
  v-on:change=countryChange($event)" />
```

### `tab-index`

|  Required  |    Type    | Default |  Variable Name  |
|------------|------------|---------|-----------------|
| _optional_ | _{number}_ | `0`     | `this.tabIndex` |

When content is hidden, tabindex must be set to `-1` to
prevent the user using the keyboard to tab into hidden inputs.

> __Note:__ If tabindex is not `-1` it will not be rendered
>           on the field, instead the browser's default
>           tabbing order will be used

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

### `value`

|  Required  |       Type        |   Default    | Variable Name |
|------------|-------------------|--------------|---------------|
| _required_ | _{string|number}_ | _no default_ | `this.value`  |

Predefined value for the field.
