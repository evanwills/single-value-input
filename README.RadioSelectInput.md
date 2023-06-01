# `<RadioSelectInput>`

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

### `tab-index`

|  Required  |    Type    | Default |  Variable Name  |
|------------|------------|---------|-----------------|
| _optional_ | _{number}_ | `0`     | `this.tabIndex` |

When content is hidden, tabindex must be set to `-1` to
prevent the user using the keyboard to tab into hidden inputs.

> __Note:__ If tabindex is not `-1` it will not be rendered
>           on the field, instead the browser's default
>           tabbing order will be used

### `value`

|  Required  |       Type        |   Default    | Variable Name |
|------------|-------------------|--------------|---------------|
| _required_ | _{string|number}_ | _no default_ | `this.value`  |

Predefined value for the field.
