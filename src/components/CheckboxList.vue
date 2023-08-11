<template>
  <ul class="checkable-group"
      role="group"
      :aria-labelledby="fieldId">
    <li v-for="(option, i) of usableOptions" v-bind:key="i">
      <input  :accesskey="accessKeyAttr"
              :aria-describedby="getDescribedbyIDs"
              :checked="option.default"
              class="visually-hidden"
              :disabled="option.disabled || isDisabled"
              :id="option.id"
              :readonly="isReadonly"
              :required="requiredAttr"
              :tabindex="tabIndex"
              type="checkbox"
              :value="option.value"
              v-on:change="checkboxChange($event)"
              v-on:blur="checkboxChange($event)" />
      <label :for="option.id" :class="checkboxClass">{{ option.label }}</label>
    </li>
  </ul>
</template>

<script>
import { normaliseOptions, setOptionIDs } from './radioSelect.utils';
import { getEpre } from '../../../utils/general-utils';

/**
 * Timestamp for when data was last received from the server
 *
 * @var {number}
 */
let localLastUpdated = 0;

export default {
  name: 'checkbox-list',

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
     * Whether or not to remove duplicate options from options list.
     *
     * @property {boolean} dedupe
     */
    dedupe: { type: Boolean, required: false, default: false },

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
     * Maximum number of items in the list user check
     *
     * @property {number} maxLength
     */
    maxLength: { required: false },

    /**
     * Minimum number of items in the list user check
     *
     * @property {number} minLength
     */
    minLength: { required: false },

    /**
     * List of checkbox fields to be rendered
     *
     * @property {<{value: string, label: string, default: boolean, disabled: boolean}>[]} options
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
  },

  data() {
    return {
      /**
       * Current value of the field
       *
       * @property {string} current
       */
      current: {},

      /**
       * A function that returns the start of an error message
       * (or console.group name) string for a given method
       *
       * @param {string} method Name of method that might throw an error
       *
       * @returns {string}
       */
      ePre: null,

      /**
       * The minimum number of options the user must check
       *
       * > __Note:__ If the group is required, the minimum number
       * >           will be forced to 1 if it's not already higher.
       *
       * @property {number}
       */
      minChecked: 0,

      /**
       * The minimum number of options the user must check
       *
       * > __Note:__ If the group is required, the minimum number
       * >           will be forced to 1 if it's not already higher.
       *
       * @property {number}
       */
      maxChecked: -1,

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
       * List of options to be rendered
       *
       * Each option object has the following properties
       *
       * @property {Object[]}
       */
      usableOptions: [],
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
    checkboxClass() {
      const base = 'checkable-group__label';
      const output = `${base} ${base}--checkbox`;

      return (this.current === '')
        ? `${output} ${base}--empty`
        : output;
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
  },

  methods: {
    /**
     * Handle changes to radio or select input fields
     *
     * @param {Event} e
     */
    checkboxChange(e) {
      const key = e.target.value;

      if (typeof this.current[key] !== 'boolean') {
        throw new Error(
          `${this.ePre('checkboxChange')} cannot set current value for "${key}"`,
        );
      }

      this.current[key] = (e.target.checked === true);

      const keys = Object.keys(this.current);
      let c = 0;

      for (let a = 0; a < keys.length; a += 1) {
        if (this.current[keys[a]] === true) {
          c += 1;
        }
      }

      this.invalid = (c < this.minChecked || (this.maxChecked > -1 && c > this.maxChecked));
      this.$emit('invalid', this.invalid);
      this.$emit('checkedchange', this.current);
      this.$emit(e.type, e);
    },

    /**
     * Make option list usable for <SELECT> and/or <INPUT type="radio" />
     *
     * Normalise key/value pairs
     */
    setUsableOptions() {
      // Make sure options are useable
      const options = normaliseOptions(
        this.options, 'XXXX', this.dedupe,
      );

      // Give each radio option a unique ID
      this.usableOptions = options.map(setOptionIDs(this.fieldId));
      for (let a = 0; a < this.usableOptions.length; a += 1) {
        this.current[this.usableOptions[a].value] = this.usableOptions[a].default;
      }
    },
  },

  beforeMount() {
    if (localLastUpdated === 0) {
      localLastUpdated = this.lastUpdated;
    }

    this.ePre = getEpre(this.fieldId);
    const tmp = this.ePre('beforeMount');

    if (typeof this.minLength !== 'undefined') {
      this.minChecked = parseInt(this.minLength, 10);

      if (Number.isNaN(this.minChecked) || this.minChecked < 0) {
        console.error(
          `${tmp} expects attribute \`min-length\` to be a positive integer`,
        );
      }
    }

    if (typeof this.maxLength !== 'undefined') {
      this.maxChecked = parseInt(this.maxLength, 10);

      if (Number.isNaN(this.maxChecked) || this.maxChecked < 0) {
        console.error(
          `${tmp} expects attribute \`max-length\` to be a positive integer`,
        );
      }
    }

    if (this.isRequired === true && this.minChecked === 0) {
      this.minChecked = 1;
    }

    this.setUsableOptions();

    if (this.usableOptions.length < 1) {
      console.error(
        `${tmp} expects at least one checkbox item. No options provided`,
      );
    }

    if (this.maxChecked >= this.usableOptions.length) {
      console.warn(
        `${tmp} maximum number of checked options matched or `
        + 'exceeded available options so maximum is now unlimited',
      );
      this.maxChecked = -1;
    } else if (this.maxChecked > -1 && this.maxChecked < this.minChecked) {
      console.error(
        `${tmp} Invalid value for max-length or min-length. `
        + `max-length (${this.maxChecked}) must be greater than `
        + `min-length (${this.minChecked})`,
      );
    }
  },

  // mounted() {
  // },

  updated() {
    if (localLastUpdated < this.lastUpdated) {
      localLastUpdated = this.lastUpdated;

      this.setUsableOptions();
      this.validateOptions();
    }
  },
};
</script>
