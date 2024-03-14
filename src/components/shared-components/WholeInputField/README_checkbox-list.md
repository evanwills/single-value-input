# `<CheckboxList>`

* [Introduction](#introduction)
* [Examples](#examples)
* [Attributes](#attributes)
  * Required attributes
    * [`field-id`](#field-id)
    * [`options`](#options)
    * [`tab-index`](#tab-index)
  * Optional attributes
    * [`access-key`](#access-key)
    * [`help-ids`](#help-ids)
    * [`is-disabled`](#is-disabled)
    * [`is-required`](#is-required)
    * [`is-readonly`](#is-readonly)
    * [`last-updated`](#last-updated)
    * [`max-length`](#max-length)
    * [`min-length`](#min-length)

> __Note:__ This info can also be acccessed from the wiki page:
>  "[CheckboxList](https://thesmithfamily.visualstudio.com/DigitalTeam/_wiki/wikis/DigitalTeam.wiki/2647/CheckboxList)"

---

## Introduction

`<CheckboxList>` Handles rendering a list of one or more checkbox
items. The items can have a group label or not.

> __Note:__ `<CheckboxList>` components to not accept a `value`
>           attribute.

This is because a checkbox group represents multiple input states,
which cannot simply be represented by a single value. Instead the
state of each checkbox item is held by the `default` property of
each item in the `options` list.

## Examples


## Attributes

### access-key

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{string}_ | _no default_ | `this.accessKey` |

Keyboard short cut key (using "alt + shift + [accesskey]") to
allow user to go directly to the input field

### field-id

|  Required  |    Type    |   Default    | Variable Name  |
|------------|------------|--------------|----------------|
| _required_ | _{string}_ | _no default_ | `this.fieldId` |

ID of the field being rendered

Used to link the field to its label, error message and help
text

### help-ids

|  Required  |    Type    |  Default   | Variable Name  |
|------------|------------|------------|----------------|
| _optional_ | _{string}_ | "" (empty) | `this.helpIds` |

IDs for error and help text blocks to use as value for
`aria-describedby` attribute

Used to link the field to any error messages and help
text

### is-disabled

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isDisabled` |

Whether or not the field is disabled
(i.e. user is prevented from interacting with the field and the field
is not submitted with a `POST` request)

### is-required

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isRequired` |

Whether or not the field requres one or more checkboxes to be checked

### is-readonly

|  Required  |    Type     | Default |   Variable Name   |
|------------|-------------|---------|-------------------|
| _optional_ | _{boolean}_ | `FALSE` | `this.isReadonly` |

Whether or not the field is readonly
(i.e. user is prevented from interacting with the field)

### last-updated

|  Required  |    Type    |   Default    |   Variable Name    |
|------------|------------|--------------|--------------------|
| _optional_ | _{number}_ | _no default_ | `this.lastUpdated` |

Used to prevent infinite loops when updating the component

* > __Note:__ If `lastUpdated` is not set, this field will not update
* >           the options if changed by the parent.

### max-length

|  Required  |    Type    |   Default    |  Variable Name   |
|------------|------------|--------------|------------------|
| _optional_ | _{number}_ | _no default_ | `this.maxLength` |

Maximum number of options from this list, the user can input check

```html
<script>
const food options = [
  { id: 'cheese',  label: 'Cheese', value: 'cheese', default: false },
  { id: 'chocolate', label: 'Chocolate', value: 'chocolate', default: false },
  { id: 'fish-n-chips', label: 'Fish & chips', value: 'fish-n-chips', default: false },
  { id: 'fruit', label: 'Fruit', value: 'fruit', default: false },
  { id: 'ice-cream', label: 'Ice-cream', value: 'ice-cream', default: false },
  { id: 'nuts', label: 'Nuts', value: 'nuts', default: false },
  { id: 'pasta', label: 'Pasta', value: 'pasta', default: false },
  { id: 'salad', label: 'Salad', value: 'salad', default: false },
];
</script>
<CheckboxList
  field-id="favorite-foods"
  label="Favorite foods"
  max-length="5"
  :tabindex="isVisible"
  v-on:checkboxchange=foodChange($event)" />
```


### min-length

|  Required  |    Type    | Default |  Variable Name   |
|------------|------------|---------|------------------|
| _optional_ | _{number}_ |   `0`   | `this.minLength` |

Minimum number of options the user must check.

__Note:__ If `is-required` is `TRUE`, and `min-length` is not set,
then `min-length` is automatically assumed to be 1.

```html
<script>
const food options = [
  { id: 'cheese',  label: 'Cheese', value: 'cheese', default: false },
  { id: 'chocolate', label: 'Chocolate', value: 'chocolate', default: false },
  { id: 'fish-n-chips', label: 'Fish & chips', value: 'fish-n-chips', default: false },
  { id: 'fruit', label: 'Fruit', value: 'fruit', default: false },
  { id: 'ice-cream', label: 'Ice-cream', value: 'ice-cream', default: false },
  { id: 'nuts', label: 'Nuts', value: 'nuts', default: false },
  { id: 'pasta', label: 'Pasta', value: 'pasta', default: false },
  { id: 'salad', label: 'Salad', value: 'salad', default: false },
];
</script>
<CheckboxList
  field-id="favorite-foods"
  label="Favorite foods"
  min-length="2"
  :tabindex="isVisible"
  v-on:checkboxchange=foodChange($event)" />
```

### options

|  Required  |   Type    |   Default    | Variable Name  |
|------------|-----------|--------------|----------------|
| _required_ | _{array}_ | _no default_ | `this.options` |

List of options available in a `<SELECT>`, `<INPUT type="radio">`
or `<INPUT type="text" role="combobox">` field

> __Note:__ If `type` is "select", "radio" or "combobox" and there
>           are less than two options in the in the `options`
>           property, an error will be thrown

#### Option properties

* __`label`__ `{string}` *[required]* Human readable label for the
                         option.
* __`value`__ `{string|number}` *[required]* Machine value expected
                         by the server.
* __`default`__ `{boolean}` *[optional]* For `<SELECT>`,
                         `<INPUT type="radio">` type fields. if
                         `TRUE`, this option will be checked/selected
                         by default. __NOTE:__ If multiple options
                         have `default` set to true, returned value
                         may be unpredictable.
                         __Note:__ `default` is ignored for `combobox`
                         fields.
* __`id`__ `{string}` *[optional]* The ID for the `<INPUT>` field. If
                         omitted, the ID is generated by merging the
                         [`field-id`](#field-id) and the option's
                         `value` to get a (hopefully) page wide
                         unique ID.
* __`required` `{boolean}` *[optional]* Whether the user is required
                         to check this option in order to proceed.
* __`disabled` `{boolean}` *[optional]* Whether the user is currently
                         prevented from checking this option.

### tab-index

|  Required  |    Type    | Default |  Variable Name  |
|------------|------------|---------|-----------------|
| _optional_ | _{number}_ | `0`     | `this.tabIndex` |

When content is hidden, tabindex must be set to `-1` to
prevent the user using the keyboard to tab into hidden inputs.

> __Note:__ If tabindex is not `-1` it will not be rendered
>           on the field, instead the browser's default
>           tabbing order will be used
