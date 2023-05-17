<template>
  <ul class="radio-group" v-if="isRadio === true" role="group" :aria-labelledby="fieldId">
    <li v-for="(option, i) of usableOptions" v-bind:key="i">
      <input type="radio" class="visually-hidden"
            :accesskey="accessKeyAttr"
            :aria-describedby="getDescribedbyIDs"
            :checked="isSelected(option)"
            :disabled="disabled"
            :id="option.id"
            :name="radioName"
            :readonly="readonly"
            :required="required"
            :tabindex="tabIndexAttr"
            :value="option.value"
            v-on:change="hasChanged($event)"
            v-on:blur="hasChanged($event)" />
      <label :for="option.id" :class="radioClass">{{ option.label }}</label>
    </li>
  </ul>

  <span v-else :class="selectClass">
    <select :id="fieldId"
            :accesskey="accessKeyAttr"
            :aria-describedby="getDescribedbyIDs"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            :tabindex="tabIndexAttr"
            v-on:change="hasChanged($event)"
            v-on:blur="hasChanged($event)">
      <option v-for="(option, i) of usableOptions"
              :value="option.value"
              :selected="isSelected(option)"
              v-bind:key="i">
        {{ option.label }}
      </option>
    </select>
  </span>
</template>

<script>
/**
 * Normalise option objects so they have expected properties
 *
 * @param {<string|number|Object>[]} options List of options
 *
 * @returns {Object[]}
 */
const normaliseOptions = (options) => options.map((item) => {
  const t = typeof item;
  let _val = '';
  let _label = '';
  let vProp = '';
  let lProp = '';

  if (t === 'string' || t === 'number') {
    _val = item;
    _label = _val;
  } else {
    if (typeof item.key !== 'undefined') {
      vProp = 'key';

      if (typeof item.value !== 'undefined') {
        lProp = 'value';
      }
    } else if (typeof item.Value !== 'undefined') {
      vProp = 'Value';

      if (typeof item.Key !== 'undefined') {
        lProp = 'Key';
      }
    } else if (typeof item.label !== 'undefined') {
      lProp = 'label';

      if (typeof item.value !== 'undefined') {
        vProp = 'value';
      }
    }

    if (vProp === '' || lProp === '') {
      throw new Error(
        'Could not determine either the `value` or `label` '
        + `property of option: "${item.toString()}"`,
      );
    }

    _val = item[vProp];
    _label = item[lProp];
  }

  if (typeof _val !== 'string') {
    _val = _val.toString();
  }

  if (typeof _label !== 'string') {
    _val = _label.toString();
  }

  return { value: _val, label: _label };
});

/**
 * Add an ID string for each item in the array.
 *
 * @param {string} fieldID ID for the label for the whole radio group
 *
 * @returns {Function} A function that can be passed to Array.map()
 */
const setOptionIDs = (fieldID) => (item, index) => ({ ...item, id: `${fieldID}--${index}` });

/**
 * Check whether a value is boolean and TRUE
 *
 * @param {any} input A value to be tested
 *
 * @returns {boolean} TRUE if the value is boolean and TRUE.
 *                    FALSE otherwise.
 */
const isBoolTrue = (input) => (typeof input === 'boolean' && input === true);

export default {
  name: 'accessible-select',

  props: {
    /**
     * Keyboard short cut key (using "alt + shift + [accesskey]") to
     * allow user to go directly to the input field
     *
     * @property {string} accessKey
     */
    accessKey: { type: String, required: false },

    /**
     * For select fields where no default is currently set, this
     * provides an indicator that the user must choose an option
     *
     * (Is inserted as the first item in a select list)
     *
     * @property {string} emptyTxt
     */
    emptyTxt: { type: String, required: false, default: '' },

    /**
     * ID of the field being rendered
     *
     * Used to link the field to its label, error message and help
     * text
     *
     * @property {string} errorMsg
     */
    fieldId: { type: String, required: true },

    /**
     * IDs for error and help text blocks to use as value for
     * `aria-describedby` attribute
     *
     * Used to link the field to its label, error message and help
     * text
     *
     * @property {string} errorMsg
     */
    helpIds: { type: String, required: false, default: '' },

    /**
     * Whether or not the field is disabled
     * (i.e. user is prevented from interacting with the field)
     *
     * @property {boolean} disabled
     */
    isDisabled: { type: Boolean, required: false, default: false },

    /**
     * Whether or not to render the field as a radio group
     *
     * @property {boolean} isRadio
     */
    isRadio: { type: Boolean, required: false, default: false },

    /**
     * Whether or not the field requres a non-empty value
     *
     * @property {boolean} isRequired
     */
    isRequired: { type: Boolean, required: false, default: false },

    /**
     * Whether or not the field is readonly
     * (i.e. user is prevented from interacting with the field)
     *
     * @property {boolean} isReadonly
     */
    isReadonly: { type: Boolean, required: false, default: false },

    /**
     * List of options available in a <SELECT> or <INPUT type="radio">
     * field
     *
     * > __Note:__ If `type` is "select" or "radio" and there are
     * >           less than two options in the in the `options`
     * >           property, an error will be thrown
     *
     * @property {<{key: string, value: string}>[]} options
     */
    options: { type: Array, required: true },

    /**
     * When content is hidden, tabindex must be set to `-1` to
     * prevent the user using the keyboard to tab into hidden inputs.
     *
     * > __Note:__ If tabindex is not `-1` it will not be rendered
     * >           on the field, instead the browser's default
     * >           tabbing order will be used
     * @property {number} tabIndex
     */
    tabIndex: { type: Number, required: false, default: 0 },

    /**
     * Predefined value for the field.
     *
     * @property {string|number|undefined} value
     */
    value: { required: true },
  },

  data() {
    return {
      /**
       * Current value of the field
       *
       * @property {string} currentValue
       */
      currentValue: '',
      /**
       * List of options to be rendered
       *
       * Each option object has the following properties
       *
       * @property {Object[]}
       */
      usableOptions: [],
      invalid: false,
      valueMode: 'selected',
      required: false,
      disabled: false,
      readonly: false,
    };
  },

  computed: {
    accessKeyAttr() {
      return (typeof this.accessKey === 'string' && this.accessKey.trim() !== '')
        ? this.accessKey
        : undefined;
    },

    radioName() {
      return `${this.fieldId}-radio`;
    },

    selectClass() {
      const base = 'tsf-select';

      const output = (this.required === true)
        ? `${base} ${base}--required`
        : base;

      return (this.invalid === true)
        ? `${output} ${base}--error`
        : output;
    },

    radioClass() {
      const base = 'radio-group__label';

      return (this.currentValue === '')
        ? `${base} ${base}--empty`
        : base;
    },

    tabIndexAttr() {
      return (this.tabindex === -1)
        ? -1
        : undefined;
    },

    errorID() {
      return `${this.fieldId}--error`;
    },

    getDescribedbyIDs() {
      return (typeof this.helpIds === 'string' && this.helpIds.trim() !== '')
        ? this.helpIds
        : undefined;
    },
  },

  methods: {
    /**
     * determine if an option has been chosen
     *
     * @param {{key: string|number, value: string}} option single select/radio
     */
    isSelected(option) {
      return (option.key == this.value) // eslint-disable-line
        ? this.valueMode
        : undefined;
    },

    /**
     * Handle changes to radio or select input fields
     *
     * @param {Event} e
     */
    hasChanged(e) {
      const field = e.target;
      let ok = false;

      const val = (this.isRadio === false || field.checked === true)
        ? field.value
        : '';

      for (let a = 0; a < this.usableOptions.length; a += 1) {
        if (this.usableOptions[a].value === field.value) {
          // make sure there's no funny business going on and that
          // the selected value is valid
          ok = true;
          this.currentValue = val;
        }
      }

      this.invalid = ((this.required === true && this.currentValue === '') || ok === false);

      this.$emit('invalid', this.invalid);
      this.$emit('change', e);
    },

    /**
     * Make sure all the boolean attributes match current state
     */
    updateBools() {
      this.disabled = isBoolTrue(this.isDisabled);
      this.readonly = isBoolTrue(this.isReadonly);
      this.required = isBoolTrue(this.isRequired);
    },
  },

  beforeMount() {
    // console.group('AccessibleSelect.beforeMount()');

    // Make sure options are useable
    let options = normaliseOptions(this.options);

    // Add empty option if text for one has been specified
    options = (typeof this.emptyTxt !== 'undefined' && this.emptyTxt !== '')
      ? [{ value: '', label: this.emptyTxt }, ...options]
      : options;

    // Give each radio option a unique ID
    this.usableOptions = (this.isRadio === true)
      ? options.map(setOptionIDs(this.fieldId))
      : options;

    // Get the data type of the supplied "selected" value
    switch (typeof this.value) {
      case 'string':
        this.currentValue = this.value;
        break;
      case 'number':
        this.currentValue = this.value.toString();
        break;
      default:
        this.currentValue = '';
    }

    // Get the string value for the selected item.
    this.valueMode = (typeof this.radio === 'boolean' && this.radio === true)
      ? 'checked'
      : 'selected';

    this.updateBools();
    // console.groupEnd();
  },

  // mounted() {
  //   // this.$emit('input', this.selected);
  // },

  updated() {
    this.updateBools();
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/scss/_config.scss';

.tsf-select {
  align-items: center;
  background-color: $white;
  border: none;
  border-radius: 0.3125rem;
  cursor: pointer;
  display: block;
  min-width: 10rem;
  padding: 0;
  position: relative;
  width: 100%;

  &--error {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &--required {
    border-color: $tsf-red;
  }

  &::before {
    content: "";
    height: 0.5em;
    outline: none;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 3rem;
    height: 100%;
    border-left: 0.05rem solid $regular-grey;
  }

  &::after {
    background-color: $black;
    clip-path: polygon(100% 0%, 0 0%, 50% 100%);
    content: "";
    height: 0.5em;
    outline: none;
    position: absolute;
    top: 50%;
    right: 1.1rem;
    transform: translateY(-50%) rotate(0deg);
    transition: transform ease-in-out 0.3s;
    width: 0.7em;
  }

  &:focus-within {
    outline: 0.1rem solid $utility-blue;
    outline-offset: 0.1rem;

    &::after {
      transform: translateY(-50%) rotate(180deg);
      transition: transform ease-in-out 0.3s;
    }
  }

  > select {
    appearance: none;
    background-color: transparent;
    border: none;
    color: $dark-grey;
    cursor: inherit;
    display: block;
    font-size: 1.1rem;
    line-height: 1.5rem;
    outline: none;
    padding: 1rem 4rem 1rem 1rem;
    width: 100%;

    &::-ms-expand {
      display: none;
    }
  }

  option {
    background-color: $white;
    font-weight: normal;
    font-size: 1rem;
    padding: 0.5rem;
  }
}

ul.radio-group {
  // padding-top: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;

  > li {
    text-align: left;

  }

  > li:nth-child(1n) {
    margin-top: 0;
  }

  > li:nth-child(n + 2) {
    margin-top: .25rem;
  }

  input:focus + .radio-group__label {
    &--empty {
      outline: 0.1rem solid $tsf-bright-blue;
      outline-offset: 0.1rem;
    }
  }

  & .radio-group__label {
    display: block;
    font-weight: bold;
    padding: 0.5rem 0 0.5rem 3rem;
    position: relative;
    width: 100%;

    &:hover {
      cursor: pointer;

      &:before {
        border-color: $tsf-bright-blue;
      }
    }

    &::before, &::after {
      content: '';
      left: 0.75rem;
      position: absolute;
      top: 1.25rem;
      transform: translate(-50%, -50%);
    }

    &::before {
      background-color: $white;
      border: 0.125rem solid $tsf-field-borders;
      border-radius: 10rem;
      box-sizing: border-box;
      content: '';
      display: inline-block;
      height: 1.5rem;
      width: 1.5rem;
    }

    &::after {
      background-color: $tsf-bright-blue;
      border-radius: 10rem;
      display: inline-block;
      height: 0.75rem;
      opacity: 0;
      transition: opacity ease-in-out 0.3s;
      width: 0.75rem;
    }
  }

  input {
    &:focus {
      &:before {
        border-color: $tsf-bright-blue;
      }
    }

    &:checked + .radio-group__label {
      &:after {
        opacity: 1;
      }
    }
  }
}
</style>
