<template>
  <li class="single-val-input">
    <span v-if="type === 'radio'" :id="fieldId" class="single-val-input__label">
      {{ label }}
      <span class="single-val-input__required">{{ requiredTxt }}</span>
      <span :class="errorIconClass">priority_high</span>
    </span>
    <label v-else :for="fieldId" class="single-val-input__label">
      {{ label }}
      <span class="single-val-input__required">{{ requiredTxt }}</span>
      <span :class="errorIconClass">priority_high</span>
    </label>
    <div v-if="(hasHelp === true && helpFirst === true)" :class="helpClass" :id="getID('help')">
      <slot name="help"><p>{{ helpTxt }}</p></slot>
    </div>
    <div :class="inputClass">
      <RadioSelectInput v-if="isSelect"
                        :field-id="fieldId"
                        :access-key="accessKeyAttr"
                        :empty-txt="emptyTxt"
                        :help-ids="describedByIDs"
                        :is-required="required"
                        :is-readonly="readonly"
                        :is-disabled="disabled"
                        :no-non-empty="noNonEmpty"
                        :options="options"
                        :tab-index="tabindex"
                        :type="typeAttr"
                        :value="currentValue"
                        v-on:blur="selectChanged($event)"
                        v-on:change="selectChanged($event)"
                        v-on:focus="genericHandler($event)"
                        v-on:invalid="selectInvalid($event)" />
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
                v-on:blur="hasChanged($event)"
                v-on:change="hasChanged($event)"
                v-on:focus="genericHandler($event)"
                v-on:keydown="genericHandler($event)"
                v-on:keypress="genericHandler($event)"
                v-on:keyup="genericHandler($event)"></textarea>
      <input  v-else
              :class="inputFieldClass"
              :accesskey="accessKeyAttr"
              :aria-describedby="describedByIDs"
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
              :type="typeAttr"
              v-model="currentValue"
              v-on:blur="hasChanged($event)"
              v-on:change="hasChanged($event)"
              v-on:focus="genericHandler($event)"
              v-on:keydown="genericHandler($event)"
              v-on:keypress="genericHandler($event)"
              v-on:keyup="genericHandler($event)" />
      <button v-if="type === 'password' && noToggle === false && showPassword === false"
              class="password-toggle"
              v-on:click="togglePassword($event)">
        <span class="material-icons">visibility</span>
        <span class="visually-hidden">Show password</span>
      </button>
      <button v-if="type === 'password' && showPassword === true"
              class="password-toggle"
              v-on:click="togglePassword($event)">
        <span class="material-icons">visibility_off</span>
        <span class="visually-hidden">Hide password</span>
      </button>
      <div v-if="this.hasError === true && showError === true"
            class="single-val-input__error"
            :id="getID('error')" >
        <slot name="error">{{ errorMsg }}</slot>
        <div v-if="extraError !== ''">{{ extraError }}</div>
      </div>
    </div>
    <div v-if="(hasHelp === true && helpFirst === false)" :class="helpClass" :id="getID('help')">
      <slot name="help"><p>{{ helpTxt }}</p></slot>
    </div>
  </li>
</template>

<script>
import RadioSelectInput from './RadioSelectInput.vue';

const inputTypes = [
  'color', 'combo', 'date', 'datetime-local', 'email', 'month',
  'number', 'password', 'radio', 'range', 'select', 'tel', 'text',
  'textarea', 'time', 'url', 'week',
];

const hasLimit = (type) => {
  const areLimited = ['date', 'datetime-local', 'month', 'number', 'range', 'time', 'week'];

  return (areLimited.indexOf(type) > -1);
};

const hasCharLimit = (type) => {
  const areLimited = ['email', 'password', 'tel', 'text', 'textarea', 'url'];

  return (areLimited.indexOf(type) > -1);
};

const temporal = ['date', 'datetime-local', 'time'];

export default {
  name: 'single-value-input',

  emits: ['blur', 'change', 'focus', 'invalid', 'keydown', 'keypress', 'keyup'],

  props: {
    /**
     * Keyboard short cut key (using "alt + shift + [accesskey]") to
     * allow user to go directly to the input field
     *
     * @property {string} accesskey
     */
    accesskey: { type: String, required: false, default: '' },

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
     * Whether or not this field has been marked as invalid due to
     * (addional) external rules
     *
     * e.g. User must enter either a mobile phone number or a land
     *      line number.
     *      If both are empty then both fields must be marked as
     *      invalid.
     *
     * @property {boolean} externalInvalid
     */
    externalInvalid: { type: Boolean, required: false, default: false },

    /**
     * If the field needs to be associated with any extra blocks of
     * text, this provides the IDs for those other blocks of text
     *
     * If `externalInvalid` is TRUE, this provides a way to link the
     * field with the information about why the field has been marked
     * as invalid.
     *
     * @property {string} extraDescByIds
     */
    extraDescByIds: { type: String, required: false, default: '' },

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
     * Whether or not to render help text before or after input field
     *
     * @property {boolean} helpFirst
     */
    helpFirst: { type: Boolean, required: false, default: false },

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
     * Maximum number of characters user can input into this field
     *
     * Used for email, number, text & url type input fields as well
     * as textarea fields
     *
     * @property {number} maxLength
     */
    maxLength: { required: false },

    /**
     * Maximum value allowed
     *
     * (used for date, datetime-local, number, range & time type input fields )
     *
     * @property {number|string} maxVal
     */
    maxVal: { required: false },

    /**
     * Minimum number of characters user can input into this field
     *
     * Used for email, number, text & url type input fields as well
     * as textarea fields
     *
     * @property {number} minLength
     */
    minLength: { required: false },

    /**
     * Minimum value allowed
     *
     * (used for date, datetime-local, number, range & time type
     * input fields)
     *
     * @property {number|string} maxVal
     */
    minVal: { required: false },

    /**
     * Whether or not to show the empty value if the default value
     * is non-empty
     *
     * @property {boolean} noNonEmpty
     */
    noNonEmpty: { type: Boolean, required: false, default: false },

    /**
     * Whether or not to allow user to toggle password visibility
     * for password inputs
     *
     * @property {boolean} noNonEmpty
     */
    noToggle: { type: Boolean, required: false, default: false },

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
     * JavaScript regular expression for validating string input
     *
     * @property {string} pattern
     */
    pattern: { type: String, required: false },

    /**
     * Helper text to show inside input field when value is empty
     *
     * @property {string} placeholder
     */
    placeholder: { type: String, required: false },

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
     * Number of lines in a textarea input
     *
     * @property {number} rows
     */
    rows: { required: false },

    /**
     * Whether or not to use built in browser/system spell check
     * functionality
     *
     * @property { type: Boolean, required: false },
     */
    spellCheck: { type: Boolean, required: false },

    /**
     * Increment when using buttons to decrease/increase value
     *
     * Used for date, datetime-local, number, range & time type
     * input fields.
     *
     * @property {number|string} maxVal
     */
    step: { type: Number, required: false },

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
     * * password
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
       *
       * @property {boolean}
       */
      showError: false,

      /**
       * Whether or not to make password input a text field so
       * password can be seen
       *
       * @property {boolean}
       */
      showPassword: false,
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
        sep = ' ';
      }

      if (typeof this.extraDescByIds === 'string' && this.extraDescByIds.trim() !== '') {
        output += sep + this.extraDescByIds;
      }

      return (output !== '')
        ? output
        : undefined;
    },

    errorIconClass() {
      const tmp = 'single-val-input__error-icon';

      const output = ((this.hasError === true && this.showError === true) || this.externalInvalid === true)
        ? `${tmp} ${tmp}--show`
        : tmp;

      return `material-icons ${output}`;
    },

    helpClass() {
      const tmp = 'single-val-input__help';
      const tail = (this.helpFirst === true)
        ? 'before'
        : 'after';

      return `${tmp} ${tmp}--${tail}`;
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

      if (this.showError === true || this.externalInvalid === true) {
        output += ` ${prefix}--invalid`;
      }

      return output;
    },

    /**
     * List of class names to add to the input field
     *
     * @returns {string}
     */
    inputFieldClass() {
      const tmp = 'single-val-input__input';

      return (this.type !== 'password' || this.noToggle === true)
        ? tmp
        : `${tmp} ${tmp}--password`;
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
     * @returns {boolean} TRUE if type is "select", "radio" or "combo"
     *                    FALSE otherwise
     */
    isSelect() {
      return (this.type === 'select' || this.type === 'radio' || this.type === 'combo');
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
      return (hasLimit(this.type) && typeof this.maxVal !== 'undefined')
        ? this.maxVal
        : undefined;
    },

    /**
     * Maximum number of characters allowed for valid input
     *
     * @returns {number|undefined}
     */
    maxLengthAttr() {
      return (hasCharLimit(this.type) && typeof this.maxLength !== 'undefined')
        ? this.maxLength
        : undefined;
    },

    /**
     * Minimum numeric/temporal value allowed for valid input
     *
     * @returns {number|undefined}
     */
    minAttr() {
      return (hasLimit(this.type) && typeof this.minVal !== 'undefined')
        ? this.minVal
        : undefined;
    },

    /**
     * Minimum number of characters allowed for valid input
     *
     * @returns {number|undefined}
     */
    minLengthAttr() {
      return (hasCharLimit(this.type) && typeof this.minLength !== 'undefined')
        ? this.minLength
        : undefined;
    },

    typeAttr() {
      if (this.type !== 'password') {
        return this.type;
      }

      return (this.showPassword === true)
        ? 'text'
        : 'password';
    },

    /**
     * Validation pattern for input (JavaScript RegExp pattern)
     *
     * @returns {string|undefined}
     */
    patternAttr() {
      return (typeof this.pattern === 'string' && this.pattern.trim() !== '')
        ? this.pattern
        : undefined;
    },

    /**
     * Help text to render inside an empty input filed
     *
     * @returns {string|undefined}
     */
    placeholderAttr() {
      return (typeof this.placeholder === 'string' && this.placeholder.trim() !== '')
        ? this.placeholder
        : undefined;
    },

    requiredTxt() {
      return (this.required === true)
        ? ' (required)'
        : '';
    },

    /**
     * Number of lines high a textarea field should be.
     *
     * @returns {number|undefined}
     */
    rowsAttr() {
      return (typeof this.rows !== 'undefined')
        ? this.rows
        : undefined;
    },

    /**
     * Whether or not to use browser spell checker on user supplied
     * content
     *
     * @returns {boolean|undefined}
     */
    spellCheckAttr() {
      return (typeof this.spellCheck !== 'undefined')
        ? this.spellCheck
        : undefined;
    },

    /**
     * The amount to increment a numeric value when the user clicks
     * an arrow key
     *
     * @returns {number|undefined}
     */
    stepAttr() {
      return (typeof this.step !== 'undefined')
        ? this.step
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
        this.showError = (typeof this.extraError === 'string' && this.extraError.trim() !== '');
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
     * Re-emit a focus, keyup, keydown or keypress event.
     *
     * @param {Event} event
     */
    genericHandler(event) {
      this.$emit(event.type, event);
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

    /**
     * Toggle the visibility of the password in the password field.
     *
     * @param {Event} e
     */
    togglePassword(e) {
      e.preventDefault();

      this.showPassword = !this.showPassword;
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
  },
};
</script>

<style lang="scss">
@import '../assets/scss/config';
@import '../assets/scss/base';

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
    position: relative;
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
    box-sizing: border-box;
    display: block;
    font-weight: bold;
    padding: 0.5rem 2rem 0.5rem 0;
    position: relative;
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

      &__error {
        &-icon {
          top: 37.5%;
        }
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

    * {
      color: $white;

      a {
        color: $tsf-bright-blue;
      }
    }

    > :last-child {
      margin-bottom: 0;
      padding-bottom: 0;
    }

    &-icon {
      background: $tsf-red;
      border-radius: 50rem;
      color: $white;
      display: inline-block;
      font-size: 0.75rem;
      line-height: 0.77rem;
      opacity: 0;
      padding: 0.275rem;
      position: absolute;
      // left: 0.5rem;
      right: -0.5rem;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: opacity ease-in-out 0.3s;
      width: 1.25rem;
      height: 1.25rem;
      text-align: center;

      &--show {
        opacity: 1;
      }
    }
  }

  &__help {
    padding-top: 0.5rem;
    font-size: 0.875rem;

    > :first-child {
      margin-top: 0;
      padding-top: 0;
    }

    &--after {
      > :last-child {
        margin-bottom: 0;
        padding-bottom: 0;
      }
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

    &--password {
      padding-right: 2.6rem;
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

.password-toggle {
  background-color: transparent;
  color: $light-grey-para;
  border-radius: 0.2rem;
  display: inline-block;
  line-height: 0.65rem;
  padding: 0.325rem 0.5rem;
  position: absolute;
  right: -0.1rem;
  top: 0;
}
</style>
