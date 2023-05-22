# `<SingleValueInput>`

`<SingleValueInput>` makes it simple to add new, nicely styled and 
accessible single value inputs (i.e. not checkboxes, multi select 
fields or file inputs) to a form.

## Attributes

### `access-key`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _optional_ | _{string}_ | _no default_ | `accessKey`   |

Keyboard short cut key (using "alt + shift + [accesskey]") to
allow user to go directly to the input field


### `custom-validation`

|  Required  |     Type      |   Default    |   Variable Name    |
|------------|---------------|--------------|--------------------|
| _optional_ | _{Funcation}_ |    `null`    | `customValidation` |

A function that can be used to provide additional validation when 
testing user input. Function must take a single string or number 
value and return a string. If input is valid output string must be 
empty. If input is invalid, output must be an error message to help 
the user correct the problem.


### `empty-txt`

|  Required  |    Type    |  Default   | Variable Name |
|------------|------------|------------|---------------|
| _optional_ | _{string}_ | "" (empty) | `emptyTxt`    |

Forselect fields where no default is currently set, this
provides an indicator that the usermust choose an option

(Is inserted as the first item in a select list)



### `field-id`

|  Required  |    Type    |   Default    | Variable Name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ | `fieldId`     |

ID of the field being rendered

Used to link the field to its label, error message and help
text



### `help-ids`

|  Required  |    Type    |  Default   | Variable Name |
|------------|------------|------------|---------------|
| _optional_ | _{string}_ | "" (empty) | `helpIds`     |

IDs forerrorand help text blocks to use as value for
`aria-describedby` attribute

Used to link the field to its label, error message and help
text



### `is-disabled`

|  Required  |    Type     | Default | Variable Name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `isDisabled`  |

Whether or not the field is disabled
(i.e. useris prevented from interacting with the field)



### `is-radio`

|  Required  |    Type     | Default | Variable Name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `isRadio`     |

Whether or not to renderthe field as a radio group



### `is-required`

|  Required  |    Type     | Default | Variable Name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `isRequired`  |

Whether or not the field requres a non-empty value



### `is-readonly`

|  Required  |    Type     | Default | Variable Name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `isReadonly`  |

Whether or not the field is readonly
(i.e. useris prevented from interacting with the field)



### `no-non-empty`

|  Required  |    Type     | Default | Variable Name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `noNonEmpty`  |

Whether or not to show the empty value if the default value
is non-empty



### `options`

|  Required  |   Type    |   Default    | Variable Name |
|------------|-----------|--------------|---------------|
| _required_ | _{array}_ | _no default_ | `options`     |

List of options available in a `<SELECT>` or `<INPUT type="radio" />`
field

> __Note:__ If `type` is "select" or"radio" and there are
>           less than two options in the in the `options`
>           property, an errorwill be thrown



### `tab-index`

|  Required  |    Type    | Default | Variable Name |
|------------|------------|---------|---------------|
| _optional_ | _{number}_ | `0`     | `tabIndex`    |

When content is hidden, tabindex must be set to `-1` to
prevent the user using the keyboard to tab into hidden inputs.

> __Note:__ If tabindex is not `-1` it will not be rendered
>           on the field, instead the browser's default
>           tabbing orderwill be used


### `value`

|  Required  | Type |   Default    | Variable Name |
|------------|------|--------------|---------------|
| _required_ | _{}_ | _no default_ | `value`       |

Predefined value forthe field.



See info about [Vite and VueJS](README.vite.md)

