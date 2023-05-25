<template>
  <li class="single-val-input">
    <span v-if="type === 'radio'" :id="fieldId" class="single-val-input__label">
      {{ label }}<!--
      --><span class="single-val-input__required">{{ requiredTxt }}</span>
    </span>
    <label v-else :for="fieldId" class="single-val-input__label">
      {{ label }}<!--
      --><span class="single-val-input__required">{{ requiredTxt }}</span><!--
    --></label>
    <div :class="inputClass">
      <RadioSelectInput v-if="isSelect"
                        :field-id="fieldId"
                        :access-key="accessKeyAttr"
                        :empty-txt="emptyTxt"
                        :help-ids="describedByIDs"
                        :is-radio="isRadio"
                        :is-required="required"
                        :is-readonly="readonly"
                        :is-disabled="disabled"
                        :no-non-empty="noNonEmpty"
                        :options="options"
                        :tab-index="tabindex"
                        :value="currentValue"
                        v-on:invalid="selectInvalid($event)"
                        v-on:change="selectChanged($event)"
                        v-on:blur="selectChanged($event)" />
      <textarea v-else-if="isTextarea"
                class="single-val-input__input"
                :accesskey="accessKeyAttr"
                :aria-describedby="describedByIDs"
                :disabled="disabled"
                :id="fieldId"
                :maxlength="maxLengthAttr"
                :minlength="minLengthAttr"
                :pattern="patternAttr"
                :placeholder="placeholderAttr"
                :readonly="readonly"
                :required="required"
                :rows="rowsAttr"
                :spellcheck="spellCheckAttr"
                :tabindex="tabindex"
                v-model="currentValue"
                v-on:change="hasChanged($event)"
                v-on:blur="hasChanged($event)"></textarea>
      <input  v-else
              class="single-val-input__input"
              :accesskey="accessKeyAttr"
              :disabled="disabled"
              :id="fieldId"
              :max="maxAttr"
              :maxlength="maxLengthAttr"
              :min="minAttr"
              :minlength="minLengthAttr"
              :pattern="patternAttr"
              :placeholder="placeholderAttr"
              :step="stepAttr"
              :tabindex="tabindex"
              :readonly="readonly"
              :required="required"
              :type="this.type"
              v-model="currentValue"
              v-on:change="hasChanged($event)"
              v-on:blur="hasChanged($event)"
              :aria-describedby="describedByIDs" />
      <div v-if="this.hasError === true && showError === true"
            class="single-val-input__error"
            :id="getID('error')" >
        <slot name="error">{{ errorMsg }}</slot>
        <div v-if="extraError !== ''">{{ extraError }}</div>
      </div>
    </div>
    <div v-if="hasHelp === true" class="single-val-input__help" :id="getID('help')">
      <slot name="help">{{ helpTxt }}</slot>
    </div>
  </li>
</template>

<script>
import RadioSelectInput from './RadioSelectInput.vue';

const inputTypes = [
  'color', 'date', 'datetime-local', 'email', 'month', 'number',
  'radio', 'range', 'select', 'tel', 'text', 'textarea', 'time',
  'url', 'week',
];

const inputAttributes = {
  max: 'number',
  maxlength: 'number',
  min: 'number',
  minlength: 'number',
  pattern: 'string',
  placeholder: 'string',
  rows: 'number',
  step: 'number',
  spellcheck: 'boolean',
};

const hasLimit = (type) => {
  const areLimited = ['date', 'datetime-local', 'month', 'number', 'range', 'time', 'week'];

  return (areLimited.indexOf(type) > -1);
};

const hasCharLimit = (type) => {
  const areLimited = ['email', 'tel', 'text', 'textarea', 'url'];

  return (areLimited.indexOf(type) > -1);
};

const temporal = ['date', 'datetime-local', 'time'];

export default {
  name: 'single-value-input',

  emits: ['change', 'isvalid'],

  props: {
    /**
     * Keyboard short cut key (using "alt + shift + [accesskey]") to
     * allow user to go directly to the input field
     *
     * @property {string} accesskey
     */
    accesskey: { type: String, required: false, default: '' },

    /**
     * Standard HTML input/textarea specific attributes to augment
     * the behaviour of the field (usually for validation purposes)
     *
     * Object properties that are used:
     * * max - maximum value for `number`, `date`, `time`,
     *             `datetime-local` & `range` type input fields
     * * maxlength - maximum number of characters for `text` and
     *             `textarea` fields
     * * min   -   minimum value for `number`, `range`, `date`,
     *             `time` & `datetime-local` type input fields
     *             * for `number` & `range` fields this must be a
     *               number
     *             * for `date` fields, this must be an ISO-8601
     *               formatted date string
     *             * for `time` fields, this must be an ISO-8601
     *               formatted time string
     *             * for `datetime-local` fields, this must be an
     *               ISO-8601 formatted datetime string
     * * minlength - minimum number of characters for `text` and
     *        `textarea` fields
     * * pattern - JavaScript RegExp pattern for validating input
     *             string
     * * placeholder - Placeholder text to show when input is empty
     * * rows  -   Number of lines hight to make a `textarea` field
     * * step  -   Amount to increment a 'number' or `range` field
     *             when user click an arrow key,
     * * spellcheck - Whether or not to user the browser's spell
     *             checker
     *
     * @property {Object} attributes
     */
    attributes: { type: Object, required: false },

    /**
     * A function that returns a string error message if input is
     * not valid. Or, an empty string if input is valid.
     *
     * @property {Function} customValidation
     */
    customValidation: { type: Function, required: false, default: null },

    /**
     * Whether or not the field is disabled
     * (i.e. user is prevented from interacting with the field)
     *
     * @property {boolean} disabled
     */
    disabled: { type: Boolean, required: false, default: false },

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
     * Error message to show the user when the value of the field is
     * invalid
     *
     * > __Note:__ If you need to include HTML (e.g. a link) in the
     * >           error message use the "error" slot instead.
     *
     * @property {string} errorMsg
     */
    errorMsg: { type: String, required: false, default: '' },

    /**
     * ID of the field being rendered
     *
     * Used to link the field to its label, error message and help
     * text
     *
     * > __Note:__ If fieldId is undefined or empty, an error will
     *             be thrown
     *
     * @property {string} fieldId
     */
    fieldId: { type: String, required: true },

    /**
     * Help text to show the user to make the purpose or
     * requirements of the field clear
     *
     * > __Note:__ If you need to include HTML (e.g. a link) in the
     * >           error message use the "help" slot instead.
     *
     * @property {string} errorMsg
     */
    helpTxt: { type: String, required: false, default: '' },

    /**
     * Text to label the field
     *
     * This is an accessiblity requirement.
     *
     * > __Note:__ If label is undefined or empty, an error will
     * >           be thrown
     *
     * @property {string} errorMsg
     */
    label: { type: String, required: true },

    /**
     * Whether or not to show the empty value if the default value
     * is non-empty
     *
     * @property {boolean} noNonEmpty
     */
    noNonEmpty: { type: Boolean, required: false, default: false },

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
    options: { type: Array, required: false },

    /**
     * Whether or not the field is readonly
     * (i.e. user is prevented from interacting with the field)
     *
     * @property {boolean} readonly
     */
    readonly: { type: Boolean, required: false, default: false },

    /**
     * Whether or not the field requres a non-empty value
     *
     * @property {boolean} required
     */
    required: { type: Boolean, required: false, default: false },

    /**
     * When content is hidden, tabindex must be set to `-1` to
     * prevent the user using the keyboard to tab into hidden inputs.
     *
     * > __Note:__ If tabindex is not `-1` it will not be rendered
     * >           on the field, instead the browser's default
     * >           tabbing order will be used
     * @property {number} tabindex
     */
    tabindex: { type: Number, required: false, default: 0 },

    /**
     * Type of field to be rendered
     *
     * Allowed types are:
     * * color
     * * date
     * * datetime-local
     * * email
     * * month
     * * number
     * * radio
     * * range
     * * select
     * * tel
     * * text
     * * textarea
     * * time
     * * url
     * * week
     *
     * > __Note:__ If the specified type is not one of the above,
     * >           an error will be thrown
     *
     * @property {string} type
     */
    type: { type: String, required: true },

    /**
     * Predefined value for the field.
     *
     * @property {string|number|undefined} value
     */
    value: { required: false, default: '' },
  },

  components: { RadioSelectInput },

  data() {
    return {
      /**
       * List of known and validated key/value pairs for HTML input
       * field attriubtes
       *
       * @property {Object}
       */
      attrs: {},
      /**
       * The current value of the field
       *
       * @property {string}
       */
      currentValue: '',

      /**
       * Custom min & max values for validating temporal inputs
       *
       * @property {Object}
       */
      custom: {
        min: null,
        max: null,
      },

      /**
       * Extra error message generated by custom validation function
       *
       * @property {string} extraError
       */
      extraError: '',

      /**
       * Whether or not there is error text either as an attribute
       * or a slot
       *
       * @property {boolean}
       */
      hasError: true,
      /**
       * Whether or not there is help text either as an attribute
       * or a slot
       *
       * @property {boolean}
       */
      hasHelp: true,
      /**
       * Whether or not the current value is valid
       *
       * > __Note:__ Fields that are `required` must not be empty,
       * >           otherwise they will show an error after the
       * >           field has had focus
       */
      showError: false,
    };
  },

  computed: {
    /**
     * Keyboard shortcut key for input field.
     *
     * If accesskey is undefined, the `accesskey` attribute won't be
     * rendered on the element
     *
     * @returns {string|undefined}
     */
    accessKeyAttr() {
      return (typeof this.accesskey !== 'undefined' || this.accesskey.trim() === '')
        ? this.accesskey
        : undefined;
    },

    /**
     * IDs to link the input field with help text and error message
     * blocks
     *
     * @returns {string|undefined}
     */
    describedByIDs() {
      let output = '';
      let sep = '';

      if (this.hasHelp !== '') {
        output = this.getID('help');
        sep = ' ';
      }

      if (this.hasError && this.showError === true) {
        output += sep + this.getID('error');
      }

      return (output !== '')
        ? output
        : undefined;
    },

    /**
     * List of class names to add to the input field
     *
     * @returns {string}
     */
    inputClass() {
      const noBorder = ['radio', 'range'];
      const prefix = 'single-val-input__input-wrap';
      let output = prefix;

      if (temporal.indexOf(this.type) > -1) {
        output += ` ${prefix}--auto`;
      }

      if (noBorder.indexOf(this.type) > -1) {
        output += ` ${prefix}--no-border`;
      }

      if (this.showError === true) {
        output += ` ${prefix}--invalid`;
      }

      return output;
    },

    /**
     * Test whether or not the rendered field is a radio input group
     *
     * @returns {boolean} TRUE if type is "radop". FALSE otherwise
     */
    isRadio() {
      return (this.type === 'radio');
    },

    /**
     * Test whether or not the rendered field is a select dropdown
     * field or radio input group.
     *
     * @returns {boolean} TRUE if type is "select" or "radio"
     *                    FALSE otherwise
     */
    isSelect() {
      return (this.type === 'select' || this.type === 'radio');
    },

    /**
     * Test whether or not the rendered field is a textarea field
     *
     * @returns {boolean} TRUE if type is "textarea". FALSE otherwise
     */
    isTextarea() {
      return (this.type === 'textarea');
    },

    /**
     * Maximum numeric/temporal value allowed for valid input
     *
     * @returns {number|undefined}
     */
    maxAttr() {
      return (hasLimit(this.type) && typeof this.attrs.max !== 'undefined')
        ? this.attrs.max
        : undefined;
    },

    /**
     * Maximum number of characters allowed for valid input
     *
     * @returns {number|undefined}
     */
    maxLengthAttr() {
      return (hasCharLimit(this.type) && typeof this.attrs.maxlength !== 'undefined')
        ? this.attrs.maxlength
        : undefined;
    },

    /**
     * Minimum numeric/temporal value allowed for valid input
     *
     * @returns {number|undefined}
     */
    minAttr() {
      return (hasLimit(this.type) && typeof this.attrs.min !== 'undefined')
        ? this.attrs.min
        : undefined;
    },

    /**
     * Minimum number of characters allowed for valid input
     *
     * @returns {number|undefined}
     */
    minLengthAttr() {
      return (hasCharLimit(this.type) && typeof this.attrs.minlength !== 'undefined')
        ? this.attrs.minlength
        : undefined;
    },

    /**
     * Validation pattern for input (JavaScript RegExp pattern)
     *
     * @returns {string|undefined}
     */
    patternAttr() {
      return (typeof this.attrs.pattern !== 'undefined')
        ? this.attrs.pattern
        : undefined;
    },

    /**
     * Help text to render inside an empty input filed
     *
     * @returns {string|undefined}
     */
    placeholderAttr() {
      return (typeof this.attrs.placeholder !== 'undefined')
        ? this.attrs.placeholder
        : undefined;
    },

    requiredTxt() {
      return (this.required === true)
        ? ''
        : ' (optional)';
    },

    /**
     * Number of lines high a textarea field should be.
     *
     * @returns {number|undefined}
     */
    rowsAttr() {
      return (typeof this.attrs.rows !== 'undefined')
        ? this.attrs.rows
        : undefined;
    },

    /**
     * Whether or not to use browser spell checker on user supplied
     * content
     *
     * @returns {boolean|undefined}
     */
    spellCheckAttr() {
      return (typeof this.attrs.spellcheck !== 'undefined')
        ? this.attrs.spellcheck
        : undefined;
    },

    /**
     * The amount to increment a numeric value when the user clicks
     * an arrow key
     *
     * @returns {number|undefined}
     */
    stepAttr() {
      return (typeof this.attrs.step !== 'undefined')
        ? this.attrs.step
        : undefined;
    },
  },

  methods: {
    /**
     * Get the custom ID (or `for` attribute) for a given element
     *
     * @param {string|undefined} suffix Custom suffix for the ID
     *
     * @returns {string} custom ID (or `for` attribute) value
     */
    getID(suffix) {
      return (typeof suffix === 'string' && suffix !== '')
        ? `${this.fieldId}--${suffix}`
        : this.fieldId;
    },

    /**
     * Handle RadioSelectInput 'invalid' event
     *
     * @param {boolean} isInvalid Whether or not the RadioSelectInput
     *                            is currently in an invalid state
     */
    selectInvalid(isInvalid) {
      this.showError = isInvalid;
    },

    /**
     * Handle  of an RadioSelectInput component `change` or `blur`
     * event
     *
     * @param {Event} e An event emitted by <SELECT> or
     *                  <input type="radio"> element within an
     *                  RadioSelectInput component
     */
    selectChanged(e) {
      if (this.showError === false) {
        this.$emit('change', e);
      }
    },

    /**
     * Handle `change` events emitted by <INPUT> or <TEXTAREA>
     * elements
     *
     * @param {Event} e An event emitted by a change event from an
     *                  <INPUT> or <TEXTAREA> element rendered
     *                  directly within this component
     */
    hasChanged(e) {
      this.showError = !e.target.checkValidity();

      this.currentValue = e.target.value;

      if (this.showError === false && typeof this.customValidation === 'function') {
        this.extraError = this.customValidation(this.currentValue);
      }

      if (this.showError === false) {
        this.$emit('change', e);
      }
    },

    /**
     * Handle `blur` events emitted by <INPUT> or <TEXTAREA> elements
     *
     * @param {Event} e An event emitted by a change event from an
     *                  <INPUT> or <TEXTAREA> element rendered
     *                  directly within this component
     */
    hasBlured(e) {
      this.showError = !e.target.checkValidity();
      if (this.showError === false) {
        this.$emit('change', e);
      }
    },

    /**
     * Convert an ISO-8601 time string in the number of seconds
     * after midnight.
     *
     * Used for easy comparison of current value with min/max values
     * when validating time
     *
     * @param {string} input ISO-8601 Times tring
     *
     * @returns {number|false} Time as seconds after midnight, if
     *                         input is valid. FALSE otherwise.
     */
    getTimeAsSeconds(input) {
      const regex = /^([01][0-9]|2[[0-3]):([0-5][0-9])(?::([0-5][0-9]))(\.[0-9]{1,10})?$/;
      const matches = input.match(regex);

      if (matches !== null) {
        let output = (matches[1] * 3600) + (matches[2] * 60);

        if (typeof matches[3] !== 'undefined') {
          output += matches[3];
        }
        if (typeof matches[4] !== 'undefined') {
          output += matches[4];
        }

        return output;
      }

      return false;
    },

    /**
     * Check whether there's some content to render for a given text block
     *
     * @param {string} slotName Name of the slot to be checked
     * @param {string} propName Name of the component property/attribute
     *                          to be checked
     *
     * @returns {boolean}
     */
    notEmpty(slotName, propName) {
      return (!!this.$slots[slotName]
        || (typeof this[propName] === 'string' && this[propName].trim() !== ''));
    },
  },

  beforeMount() {
    if (typeof this.label !== 'string' || this.label.trim() === '') {
      // For accessibility reasons we MUST have a non-empty label
      throw new Error(
        '<single-value-input> component requires label attribute '
        + 'to be set and a non-empty string',
      );
    }

    if (inputTypes.indexOf(this.type) === -1) {
      // There's no point in rendering something that shouldn't be
      // used here
      throw new Error(
        '<single-value-input> component requires type attribute '
        + 'to be a valid (non-button) HTML input "type" value '
        + '(excluding "file" & "checkbox" types)',
      );
    }

    if (this.type === 'select' || this.type === 'radio') {
      // Make sure there's at least two options to render in
      // select/radio input
      if (!Array.isArray(this.options) || this.options.length < 2) {
        throw new Error('Select & radio fields require at least two options');
      }
    }

    // Make sure we have a default current value
    this.currentValue = (typeof this.value !== 'undefined')
      ? this.value
      : '';

    // Do we have an error message to show the user?
    this.hasError = this.notEmpty('error', 'errorMsg');

    // Do we have a help text block to show the user?
    this.hasHelp = this.notEmpty('help', 'helpTxt');

    // Validate user supplied attributes
    if (typeof this.attributes !== 'undefined') {
      /**
       * List of attribute keys user has supplied
       *
       * @var {string[]}
       */
      const tmpUserKeys = Object.keys(this.attributes);

      for (let a = 0; a < tmpUserKeys.length; a += 1) {
        // normalise the keys so they are more likely to match
        const lowerKey = tmpUserKeys[a].toLowerCase();
        const key = tmpUserKeys[a];
        const attrType = typeof this.attributes[key];

        if ((typeof inputAttributes[lowerKey] !== 'undefined' && attrType === inputAttributes[lowerKey])
            || (temporal.indexOf(this.type) > -1 && (lowerKey === 'min' || lowerKey === 'max') && attrType === 'string')
        ) {
          // This something we want. Add it to the list of
          // attributes we can use
          this.attrs[lowerKey] = this.attributes[key];

          if (this.type === 'date' || this.type === 'datetime-local') {
            // Make sure date & datetime min/max are valid
            const tmpDate = new Date(this.attributes[key]);

            if (tmpDate.toString() === 'Invalid Date') {
              console.warn(
                `input#${this.fieldId} type: \`${this.type}\`, `
                + `attribute: \`${key}\` ("${this.attributes[key]}") is invalid!`,
              );
            } else {
              this.custom[lowerKey] = tmpDate;
            }
          } else if (this.type === 'time') {
            // make sure time min/max value is valid
            const tmpTime = this.getTimeAsSeconds(this.attributes[key]);

            if (tmpTime !== false) {
              this.custom[lowerKey] = tmpTime;
            } else {
              console.warn(
                `input#${this.fieldId} type: \`time\`, `
                + `attribute: \`${key}\` ("${this.attributes[key]}") is invalid!`,
              );
            }
          }
        }
      }
    }
  },
};
</script>

<style lang="scss">
@import '../assets/scss/config';

$border-rad: 0.3rem;

.single-val-input {
  margin: 0;
  padding: 0;
  font-family: Poppins, Arial, Helvetica, sans-serif;
  list-style-type: none;
  text-align: left;

  * {
    box-sizing: border-box;
  }

  &:nth-child(n + 2) {
    margin-top: 1rem;
  }

  &__input-wrap {
    border: 0.05rem solid $tsf-field-borders;
    border-radius: $border-rad;
    display: inline-block;
    width: 100%;

    &:focus-within {
      outline: 0.2rem dotted $tsf-bright-blue;
      outline-offset: 0.2rem;
    }

    &--invalid {
      border-color: $tsf-red;

      > ul {
        margin-bottom: 0.5rem !important;
      }
    }

    &--auto {
      width: auto;
    }

    &--no-border {
      border: none;

      .single-val-input {
        &__error {
          border-top-left-radius: $border-rad;
          border-top-right-radius: $border-rad;
        }
      }
    }
  }

  &__label {
    display: block;
    font-weight: bold;
    padding: 0.5rem 0;
    text-align: left;
    text-align: start;
    white-space: normal;

    // &::after {
    //   content: ':';
    // }
  }

  &:first-child {
    .single-val-input {
      &__label {
        padding-top: 0;
      }
    }
  }

  &__error {
    background-color: $tsf-red;
    border: 0.05rem solid $tsf-red;
    border-bottom-left-radius: $border-rad;
    border-bottom-right-radius: $border-rad;
    color: $white;
    display: block;
    text-align: left;
    padding: 0.5rem 0.8rem;

    > :first-child {
      margin-top: 0;
      padding-top: 0;
    }

    > :last-child {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  &__help {
    padding-top: 0.5rem;

    > :first-child {
      margin-top: 0;
      padding-top: 0;
    }

    > :last-child {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  &__input {
    background-color: $white;
    border: none;
    border-radius: $border-rad;
    box-sizing: border-box;
    display: block;
    font-family: 'Courier New', Courier, monospace;
    width: 100%;
    color: $black;
    padding: 0.6rem 0.8rem 0.5rem;
    font-size: 1rem;

    &:focus {
      outline: none;
    }

    &:placeholder-shown {
      color: $black;
    }

    &[type=date], &[type=time], &[type=datetime-local] {
      width: auto;
    }

    &[type=range] {
      padding: 0;
    }
  }

  &__required {
    font-style: italic;
    font-size: 0.875rem;
    font-weight: normal;
  }
}
</style>
