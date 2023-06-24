<template>
  <ul v-if="renderType === 'radio'" class="radio-group" role="group" :aria-labelledby="fieldId">
    <li v-for="(option, i) of usableOptions" v-bind:key="i">
      <input type="radio" class="visually-hidden"
            :accesskey="accessKeyAttr"
            :aria-describedby="getDescribedbyIDs"
            :checked="isSelected(option)"
            :disabled="disabledAttr"
            :id="option.id"
            :name="radioName"
            :readonly="readonlyAttr"
            :required="requiredAttr"
            :tabindex="tabIndex"
            :value="option.value"
            v-on:change="radioChanged($event)"
            v-on:blur="radioChanged($event)" />
      <label :for="option.id" :class="radioClass">{{ option.label }}</label>
    </li>
  </ul>

  <span v-else-if="renderType === 'combo'" :class="selectClass">
    <input  :accesskey="accessKeyAttr"
            aria-autocomplete="list"
            :aria-describedby="getDescribedbyIDs"
            :disabled="disabledAttr"
            :id="fieldId"
            :list="dataListId"
            :readonly="readonlyAttr"
            :required="requiredAttr"
            role="combobox"
            :tabindex="tabIndex"
            type="text"
            v-on:change="comboChange($event)"
            v-on:blur="comboChange($event)"
            v-on:keyup="filterList($event)" />
    <span class="material-icons">search</span>
    <datalist :id="dataListId">
      <option v-for="(option) of filteredOptions"
              :value="option"
              v-bind:key="option"></option>
    </datalist>
  </span>

  <span v-else :class="selectClass">
    <select :id="fieldId"
            :accesskey="accessKeyAttr"
            :aria-describedby="getDescribedbyIDs"
            :disabled="disabledAttr"
            :readonly="readonlyAttr"
            :required="requiredAttr"
            :tabindex="tabIndex"
            v-on:change="selectChanged($event)"
            v-on:blur="selectChanged($event)">
      <option v-for="(option) of usableOptions"
              :value="option.value"
              :selected="isSelected(option)"
              v-bind:key="option.value">
        {{ option.label }}
      </option>
    </select>
  </span>
</template>

<script>
import { normaliseOptions } from './radioSelect.utils';

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

const getLabels = (option) => option.label;

/**
 * Remove any empty options from select field options
 *
 * (Used when no-non-empty is set to remove the empty option after
 * a non-empty option has been selected)
 *
 * @param {Object[]} option list of options for select field
 */
const removeEmpty = (option) => (option.value.trim() !== '');

export default {
  name: 'accessible-select',

  emits: ['blur', 'change', 'focus', 'invalid', 'keyup'],

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
     * Whether or not to show the empty value if the default value
     * is non-empty
     *
     * @property {boolean} noNonEmpty
     */
    noNonEmpty: { type: Boolean, required: false, default: false },

    /**
     * List of options available in a `<SELECT>`, `<INPUT type="radio">`
     * or `<INPUT type="text" role="combobox">` field
     *
     * > __Note:__ If `type` is "select", "radio" or "combobox" and
     * >           there areless than two options in the in the
     * >           `options` property, an error will be thrown.
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

    type: { type: String, required: false, default: 'select' },

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

      /**
       * List of options filtered by existing string in text input
       *
       * @property {string[]}
       */
      filteredOptions: [],

      /**
       * Whether or not the current user submitted value is valid
       *
       * (i.e. is not empty and is one of the known values provided
       * when the component was mounted)
       *
       * @property {boolean} invlid
       */
      invalid: false,

      /**
       * The mode in which the multi option input is rendered
       *
       * Options are:
       * * "select" (default) - shows standard HTML <SELECT> input
       * * "radio" - group of radio buttons
       * * "combo" - text input with linked <DATALIST>
       *
       * @property {string} renderType
       */
      renderType: 'select',

      /**
       * The name of the attribute used to indicate the preset value
       * for the field
       *
       * * For <SELECT> field the correct attribute is `selected`
       * * For <INPUT type="radio"> the correct attribute is `checked`
       *
       * @property {string} valueAttr
       */
      valueAttr: 'selected',

      /**
       * Whether or not to render the empty option for <SELECT>
       * fields
       *
       * Only ever true if `no-non-empty` is set and the `value`
       * attribute on this component is an empty string
       *
       * @property {boolean} useEmpty
       */
      useEmpty: false,
    };
  },

  computed: {
    /**
     * Provide a value for the accesskey attribute if the client has
     * specified one
     *
     * @returns {string|undefined}
     */
    accessKeyAttr() {
      return (typeof this.accessKey === 'string' && this.accessKey.trim() !== '')
        ? this.accessKey
        : undefined;
    },

    /**
     * Provides the ID for the datalist element
     *
     * @returns {string}
     */
    dataListId() {
      return `${this.fieldId}--data`;
    },

    /**
     * Sets the disabled attribute on field
     *
     * @returns {true|undefined}
     */
    disabledAttr() {
      return (this.isDisabled === true)
        ? true
        : undefined;
    },

    /**
     * Get the ID for the error element
     *
     * @returns {string}
     */
    errorID() {
      return `${this.fieldId}--error`;
    },

    /**
     * Get the help IDs (as provided by the client) to render in the
     * `aria-describedby` attribute
     *
     * @returns {string|undefined}
     */
    getDescribedbyIDs() {
      return (typeof this.helpIds === 'string' && this.helpIds.trim() !== '')
        ? this.helpIds
        : undefined;
    },

    /**
     * Get the class to use on the wrapper for the select field
     *
     * @returns {string}
     */
    radioClass() {
      const base = 'radio-group__label';

      return (this.currentValue === '')
        ? `${base} ${base}--empty`
        : base;
    },

    /**
     * Get the value of the `name` attribute for all radio inputs
     * in the group
     *
     * @returns {string}
     */
    radioName() {
      return `${this.fieldId}-radio`;
    },

    /**
     * Sets the readonly attribute on field
     *
     * @returns {true|undefined}
     */
    readonlyAttr() {
      return (this.isReadonly === true)
        ? true
        : undefined;
    },

    /**
     * Sets the required attribute on field
     *
     * @returns {true|undefined}
     */
    requiredAttr() {
      return (this.isRequired === true)
        ? true
        : undefined;
    },

    /**
     * Get the class to use on the label for the select field
     *
     * @returns {string}
     */
    selectClass() {
      const base = 'tsf-select';

      let output = (this.required === true)
        ? `${base} ${base}--required`
        : base;

      if (this.renderType === 'combo') {
        output += ` ${base}--combo`;
      }

      return (this.invalid === true)
        ? `${output} ${base}--error`
        : output;
    },
  },

  methods: {
    /**
     * Handle when input for combo box changes
     *
     * @param {Event} e
     */
    comboChange(e) {
      let newVal = e.target.value.toLowerCase();
      let ok = false;

      if (newVal.trim() !== '') {
        for (let a = 0; a < this.usableOptions.length; a += 1) {
          const option = this.usableOptions[a];

          if ((option.label.toLowerCase().includes(newVal) || option.value.toLowerCase().includes(newVal))) {
            newVal = option.label;
            ok = true;
            break;
          }
        }
      }

      newVal = (ok === true)
        ? newVal
        : false;

      this.handleChangeShared(e, newVal);
    },

    /**
     * Handle updating state and emitting events from both `blur`
     * and `change` events for both <SELECT> and <INPUT type=radio>
     * elements.
     *
     * 1. Set current value (if it's valid)
     * 2. Set invalid state
     * 3. Emit an invalid event
     * 4. 1. value has changed emit a "change" event
     *    2. If value has not "change" but event was "blur" reemit
     *       the "blur" event
     *
     * @param {Event} e `blur` or `change` Event emitted by either
     *                  <SELECT> and <INPUT type=radio> elements.
     * @param {string|boolean} newVal New (value after validation).
     *
     * @emits invalid with a boolean value.
     *                TRUE if new value is invalid.
     *                FALSE otherwise
     * @emits change  If new value is valid and different from
     *                previous value
     * @emits blur    If new value is the same as previous value
     *                and the triggering event was a `blur` Event.
     */
    handleChangeShared(e, newVal) {
      const oldVal = this.currentValue;

      if (typeof newVal === 'string') {
        this.currentValue = newVal;
      }

      this.invalid = ((this.isRequired === true && this.currentValue === '') || newVal === false);

      this.$emit('invalid', this.invalid);

      if (oldVal !== this.currentValue) {
        this.$emit('change', e);
      } else if (e.type === 'blur') {
        this.$emit('blur', e);
      }
    },

    /**
     * determine if an option has been chosen
     *
     * @param {{key: string|number, value: string}} option single select/radio
     */
    isSelected(option) {
      const valueAttr = (this.isRadio === true)
        ? 'checked'
        : 'selected';

      return (option.value == this.value) // eslint-disable-line
        ? valueAttr
        : undefined;
    },

    /**
     * Handle keyup events from text input
     *
     * @param {Event} e
     */
    filterList(e) {
      const newVal = e.target.value.toLowerCase();

      this.filteredOptions = this.usableOptions.filter(
        (option) => (option.label.toLowerCase().includes(newVal) || option.value.toLowerCase().includes(newVal)),
      ).map(getLabels);

      const len = this.filteredOptions.length;

      if (len === 0) {
        // there are no options do error handling.
        this.$emit('invalid', this.invalid);
      }

      if (newVal.trim() === '') {
        this.filteredOptions = this.usableOptions.map(getLabels);
      }
    },

    /**
     * Handle changes to radio or select input fields
     *
     * @param {Event} e
     */
    radioChanged(e) {
      const newVal = (e.target.checked === true)
        ? this.validateValue(e.target.value)
        : true;

      this.handleChangeShared(e, newVal);
    },

    /**
     * Handle changes to <SELECT> fields
     *
     * @param {Event} e
     */
    selectChanged(e) {
      this.handleChangeShared(e, this.validateValue(e.target.value));

      if (this.currentValue.trim() !== '' && this.noNonEmpty === true) {
        this.usableOptions = this.usableOptions.filter(removeEmpty);
      }
    },

    /**
     * Set the current/default value
     * (i.e. the value that's come from the server)
     */
    validateCurrentValue() {
      // Make sure initial value is one of the allowed options
      if (this.currentValue !== '') {
        let ok = false;

        for (let a = 0; a < this.usableOptions.length; a += 1) {
          if (this.usableOptions[a].value === this.currentValue) {
            // All good! We found a match
            ok = true;
            break;
          }
        }

        if (ok === false) {
          // Lets check whether the initial value matches a label
          // string instead of the value
          for (let a = 0; a < this.usableOptions.length; a += 1) {
            if (this.usableOptions[a].label === this.currentValue) {
              // All good! We found a match
              this.currentValue = this.usableOptions[a].value;
              ok = true;
              break;
            }
          }
        }

        if (ok === false) {
          // Could not find a valid match so make current value
          // empty.
          this.currentValue = '';
        }
      }
    },

    /**
     * Make option list usable for <SELECT> and/or <INPUT type="radio" />
     *
     * Normalise key/value pairs
     */
    setUsableOptions() {
      // Make sure options are useable
      let options = normaliseOptions(this.options, this.currentValue);

      options = (this.useEmpty === true)
        ? [{ value: '', label: this.emptyTxt }, ...options]
        : options;

      // Give each radio option a unique ID
      this.usableOptions = (this.renderType === 'radio')
        ? options.map(setOptionIDs(this.fieldId))
        : options;

      if (this.renderType === 'combo') {
        // show all the options available until user starts typing
        this.filteredOptions = this.usableOptions.map(getLabels);
      }
    },

    /**
     * Validate new value from last user interaction
     *
     * @returns {string|false} String if new value is valid,
     *                         FALSE otherwise.
     */
    validateValue(val) {
      for (let a = 0; a < this.usableOptions.length; a += 1) {
        if (this.usableOptions[a].value === val) {
          // make sure there's no funny business going on and that
          // the selected value is valid
          return val;
        }
      }

      return false;
    },
  },

  beforeMount() {
    // Get the data type of the supplied default value
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

    if (typeof this.type === 'string') {
      const type = this.type.replace(/[^a-z]+/ig, '').toLowerCase();

      if (type === 'radio' || type === 'select') {
        this.renderType = type;
      } else if (type.includes('type') || type.includes('search') || type.includes('combo')) {
        this.renderType = 'combo';
      }
    }

    this.useEmpty = (this.renderType === 'select' && (isBoolTrue(this.noNonEmpty) === false || this.currentValue === ''));

    // Get the string value for the selected item.
    this.valueAttr = (this.renderType === 'radio')
      ? 'checked'
      : 'selected';

    this.setUsableOptions();
    this.validateCurrentValue();
  },

  mounted() {
    // this.$emit('input', this.selected);
    if (this.validateValue(this.currentValue) === false) {
      this.$emit('invalid', this.invalid);
    }
  },

  // updated() {
  //   console.log('RadioSelectInput.updated()');
  //   if (doUpdate === false) {
  //     console.log('RadioSelectInput.updated() - do actual work');
  //     doUpdate = true;

  //     this.updateBools();
  //     this.setUsableOptions();

  //     setTimeout(() => { doUpdate = false; }, 100);
  //     console.log('RadioSelectInput.updated() - work done');
  //   }
  // },
};
</script>

<style lang="scss" scoped>
@import '../assets/scss/config';

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

  &--combo {
    > input {
      appearance: none;
      background-color: transparent;
      border: none;
      color: $dark-grey;
      cursor: text;
      display: block;
      font-size: 1.1rem;
      line-height: 1.5rem;
      outline: none;
      padding: 0.6rem 0.8rem 0.5rem;
      width: 100%;

      &::-ms-expand {
        display: none;
      }
    }

    > .material-icons {
      color: $light-grey-para;
      font-size: 1.7rem;
      position: absolute;
      top: 50%;
      right: -0.35rem;
      transform: translate(-50%, -50%);
    }

    &::after {
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

datalist {
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
    // font-weight: bold;
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
      font-weight: bold;

      &:after {
        opacity: 1;
      }
    }
  }
}
</style>
