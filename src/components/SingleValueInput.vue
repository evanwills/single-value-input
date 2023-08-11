<template>
  <li class="single-val-input">
    <label v-if="!isCheckable" :for="fieldId" :class="labelClass" data-tmp>
      {{ label }}
      <span class="single-val-input__required">{{ requiredStr }}</span>
    </label>
    <span v-else-if="showLabel" :id="fieldId" :class="labelClass">
      {{ label }}
      <span class="single-val-input__required">{{ requiredStr }}</span>
      <span :class="errorIconClass">priority_high</span>
    </span>
    <div v-if="(hasHelp === true && helpFirst === true)" :class="helpClass" :id="getID('help')">
      <slot name="help"><p>{{ helpTxt }}</p></slot>
    </div>
    <div :class="inputClass">
      <span v-if="iconPre !== ''" :class="iconPreCLass">{{ iconPre }}</span>
      <RadioSelectInput v-if="isSelect"
                        :field-id="fieldId"
                        :access-key="accessKeyAttr"
                        :dedupe="dedupe"
                        :empty-txt="emptyTxt"
                        :help-ids="describedByIDs"
                        :is-required="required"
                        :is-readonly="readonly"
                        :is-disabled="disabled"
                        :last-updated="lastUpdated"
                        :no-non-empty="noNonEmpty"
                        :options="options"
                        :tab-index="tabindex"
                        :type="typeAttr"
                        :value="currentValue"
                        v-on:blur="selectChanged($event)"
                        v-on:change="selectChanged($event)"
                        v-on:focus="genericHandler($event)"
                        v-on:invalid="selectInvalid($event)" />
      <CheckboxList v-else-if="type === 'checkbox'"
                    :access-key="accessKeyAttr"
                    :aria-describedby="describedByIDs"
                    :dedupe="dedupe"
                    :field-id="fieldId"
                    :help-ids="describedByIDs"
                    :is-required="required"
                    :is-readonly="readonly"
                    :is-disabled="disabled"
                    :last-updated="lastUpdated"
                    :maxlength="maxLength"
                    :minlength="minLength"
                    :options="options"
                    :tab-index="tabindex"
                    v-on:blur="selectChanged($event)"
                    v-on:change="selectChanged($event)"
                    v-on:checkedchange="checkedChanged($event)"
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
                :pattern="customPat"
                :placeholder="customPlace"
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
                v-on:keyup="keyupHandler($event)"></textarea>
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
              :pattern="customPat"
              :placeholder="customPlace"
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
              v-on:keyup="keyupHandler($event)" />
      <button v-if="type === 'password' && noToggle === false"
              aria-live="polite"
              class="input-icon input-icon--password-toggle"
              v-on:click="togglePassword($event)">
        <span class="material-icons">{{ passwordBtnIcon }}</span>
        <span class="visually-hidden">{{ passwordBtnTxt }}</span>
      </button>
      <span v-if="showError === false && externalInvalid === false" :class="iconPostCLass">{{ iconPost }}</span>
      <span v-else-if="isCheckable === false" :class="errorIconClass">priority_high</span>
      <div v-if="showError === true && (hasError === true || extraError !== '')"
            aria-live="polite"
            :class="errorMsgClass"
            :id="getID('error')">
        <slot v-if="extraError === ''" name="error">{{ customErr }}</slot>
        <div v-if="extraError !== ''" v-html="extraError"></div>
      </div>
    </div>
    <div v-if="(hasHelp === true && helpFirst === false)" :class="helpClass" :id="getID('help')">
      <slot name="help"><p>{{ helpTxt }}</p></slot>
    </div>
  </li>
</template>

<script>
import { getEpre } from '@/utils/general-utils';
import RadioSelectInput from './RadioSelectInput.vue';
import CheckboxList from './CheckboxList.vue';
import validators from './validators';

const inputTypes = [
  'checkbox', 'color', 'combobox', 'date', 'datetime-local', 'email',
  'month', 'number', 'password', 'radio', 'range', 'select', 'tel',
  'text', 'textarea', 'time', 'url', 'week',
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

  emits: [
    'blur',
    'change',
    'checkedchange',
    'focus',
    'invalid',
    'keydown',
    'keypress',
    'keyup',
  ],

  props: {
    /**
     * Keyboard short cut key (using "alt + shift + [accesskey]") to
     * allow user to go directly to the input field
     *
     * > __Note:__ `accesskey` should only be used when a field is
     * >           always present and visible on a page and is
     * >           likely to be frequently used. Like login fields.
     *
     * @property {string} accesskey
     */
    accesskey: { type: String, required: false, default: '' },

    /**
     * A function that returns a (potentially) modified version of
     * the user input.
     *
     * This could be useful for:
     * * removing non-numeric characters from phone numbers
     *   Or
     * * more stripping illegal characters of user email addresses.
     *   Or
     * * for checkbox fields, ensuring that mutually exclusive
     *   options in a checkbox list cannot be checked
     *
     * > __Note:__ It's possible for this validation to be bypassed
     * >           in the browser so all validation __*must*__ be
     * >           duplicated on the server to ensure the user
     * >           doesn't submit bad data.
     *
     * > __Note also:__ For `<INPUT>` and `<TEXTAREA>` fields this
     * >           function is called on the `keyup` event, but for
     * >           checkbox fields, it is passed to the `change`
     * >           `CheckboxList` component and called on and `blur`
     * >           events.
     *
     * @property {Function} customValidation
     */
    customSanitisation: { type: Function, required: false, default: null },

    /**
     * A function that returns a string error message if input is
     * not valid. Or, an empty string if input is valid.
     *
     * This could be useful for:
     * * When you'd like to have a maximum word count on your
     *   textarea input.
     *   Or
     * * more complex validation of user email addresses.
     *   Or
     * * If you wish to check for expletives or malicious content.
     *
     * > __Note:__ It's possible for this validation to be bypassed
     * >           in the browser so all validation __*must*__ be
     * >           duplicated on the server to ensure the user
     * >           doesn't submit bad data.
     *
     * @property {Function} customValidation
     */
    customValidation: { type: Function, required: false, default: null },

    /**
     * Whether or not to remove duplicate options from
     * `RadioSelectInput` options list.
     *
     * @property {boolean} dedupe
     */
    dedupe: { type: Boolean, required: false, default: false },

    /**
     * Whether or not the field is disabled
     * (i.e. user is prevented from interacting with the field)
     *
     * A field should only be disabled when it is useful for the user
     * to see that the field is there but they cannot enter anything
     * until something changes.
     *
     * e.g. if you have primary and secondary email
     * fields you would disable the secondary field until the primary
     * fields is populated and validate
     *
     * (see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#disabled),
     * [MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#disabled) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#disabled)
     * for more info)
     *
     * @property {boolean} disabled
     */
    disabled: { type: Boolean, required: false, default: false },

    /**
     * For select fields where no default is currently set, this
     * provides an indicator that the user must choose an option
     *
     * (This text is inserted as the first item in a select list)
     *
     * Without user interaction in a `<select>` input, the first
     * option in a select field is the default. To prevent the
     * user from submitting a value that may not be relevant, it's
     * common practice to have an `empty` option as the first item
     * in the select list.
     *
     * > __Note:__ if [`no-non-empty`](#no-non-empty) is also set
     * >           and the default [`value`](#value) is not empty
     * >           this will be ignored.
     *
     * @property {string} emptyTxt
     */
    emptyTxt: { type: String, required: false, default: '' },

    /**
     * Error message to show the user when the value of the field is
     * invalid
     *
     * > __Note:__ If the field is marked as `required` an empty
     * >           value will also cause the error message to show.
     *
     * > __Note also:__ If you need to include HTML (e.g. a link)
     * >           in the error message use the "error" slot instead.
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
     * (See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) &
     * [WAI ARIA](https://w3c.github.io/aria/#aria-describedby)
     * for more info)
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
     * Whether or not to hide the label from screen. (Label is still visible to screen readers)
     *
     * Sometimes a design uses non-standard format for input fields
     * and their labels.
     * e.g. When the (visible) label for a field is use in such away
     *      that the input field's value forms first part of a
     *      sentance and the label form the rest of the sentance.
     *      In this case the screen reader usage of the label may
     *      not make any sense. In this case, we use the `help-txt`
     *      value as the visible label and hide the field's actual
     *      label from screen users.
     *
     * @property {boolean} helpFirst
     */
    hideLabel: { type: Boolean, required: false, default: false },

    /**
     * Text to label the field
     *
     * This is an accessiblity requirement.
     *
     * > __Note:__ If label is undefined or empty, an error will
     * >           be thrown
     *
     * (See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
     * for more info)
     *
     * @property {string} errorMsg
     */
    label: { type: String, required: true },

    /**
     * When the options for this item were last updated
     *
     * > __Note:__ If lastUpdated is not set, this field will not
     * >           update the options if changed by the parent.
     *
     * @property {number} lastUpdated
     */
    lastUpdated: { type: Number, requred: false, default: -1 },

    /**
     * Maximum number of characters user can enter into this field
     *
     * Used for email, number, text & url type input fields as well
     * as textarea fields
     *
     * (see
     * [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#maxlength) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#maxlength)
     * for more info)
     *
     * @property {number} maxLength
     */
    maxLength: { required: false },

    /**
     * Maximum value allowed
     *
     * (used for date, datetime-local, number, range & time type input fields)
     *
     * (See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#max)
     * for more info)
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
     * (see
     * [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#minlength) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#minlength)
     * for more info)
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
     * (See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#min)
     * for more info)
     *
     * @property {number|string} maxVal
     */
    minVal: { required: false },

    noLabel: { type: Boolean, required: false, default: false },

    /**
     * Whether or not to show the empty value if the default value
     * is non-empty
     *
     * By default, the first option in a select field is the default.
     * To prevent the user from submitting a value that may not be
     * relevant. It's common practice to have an `empty` option as
     * the first item in the select list. This prevents the empty
     * option from being rendered if there's already a non-empty
     * default.
     *
     * @property {boolean} noNonEmpty
     */
    noNonEmpty: { type: Boolean, required: false, default: false },

    /**
     * Whether or not to allow user to toggle password visibility
     * for password inputs
     *
     * If you want the user to enter a password and you expect their
     * password to be good, it's likely that (if it is actually good)
     * the password will be hard to enter. Thus, the user is likely
     * to make mistakes while typing. This allows the user toggle
     * whether or not their password is visible or obfuscated.
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
     * Options can have the following structures
     *
     * * Array of objects where the first property in the object
     *   represents what will go in the option's value attribute
     *   `<option value="">` and the second property will be the
     *   label/text that's wrapped within the `<option></option>`
     *   elements
     *   * either `{ value: {string|number}, label: {string} }`
     *     or
     *   * `{ key: {string|number}, value: {string} }`
     *     or
     *   * `{ Value: {string|number}, Key: {string} }`
     * * An array of strings (useful when the option value is the
     *   same as the option label/text)
     * * An object where the property name is used as the option's
     *   *value* attribute `<option value="">` and the property's
     *   value us use as the label/text that's wrapped within the
     *   `<option></option>` elements
     *   e.g. `{ '001': 'First option', '002': 'Option two', '003': 'Number three' }`
     *
     * (See
     * [MDN `<option>`](ttps://developer.mozilla.org/en-US/docs/Web/HTML/Element/option),
     * [MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select),
     * [MDN `<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist)
     * for more info)
     *
     * @property {<{key: string, value: string}>[]} options
     */
    options: { type: Array, required: false },

    /**
     * Override text to use for optional value fields
     *
     * @property {string} optionalTxt
     */
    optionalText: { type: String, required: false, default: 'optional' },

    /**
     * JavaScript regular expression for validating string input
     *
     * (see
     * [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#pattern) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#pattern)
     * for more info)
     *
     * @property {string} pattern
     */
    pattern: { type: String, required: false },

    /**
     * Helper text to show inside input field when value is empty
     *
     * (see
     * [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#placeholder) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#placeholder)
     * for more info)
     *
     * @property {string} placeholder
     */
    placeholder: { type: String, required: false },

    /**
     * Icon or character to render at the start of the input field
     *
     * e.g. "$" or
     *
     * @property {string} placeholder
     */
    prefixIcon: { type: String, required: false },

    /**
     * Whether or not the field is readonly
     * (i.e. user is prevented from interacting with the field)
     *
     * (see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#readonly) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#readonly)
     * for more info)
     *
     * @property {boolean} readonly
     */
    readonly: { type: Boolean, required: false, default: false },

    /**
     * Whether or not the field requres a non-empty value
     *
     * (see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#required),
     * [MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#required) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#required)
     * for more info)
     *
     * @property {boolean} required
     */
    required: { type: Boolean, required: false, default: false },

    /**
     * Whether or not render "(optional)" when input is optional,
     * instead of "(required)" when it's required.
     *
     * > __Note:__ This is a __VERY BAD__ pattern, however, my
     * >           current use-case requires it until we can have
     * >           it reversed
     *
     * Render "(optional)" when the field is optional and blank when
     * it is required, instead of the conventional approach which is
     * to render blank when input is optional and "(required)" when
     * it's required.
     *
     * @property {boolean} required
     */
    requiredRev: { type: Boolean, required: false, default: false },

    /**
     * Number of lines in a textarea input
     *
     * (see
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#rows)
     * for more info)
     *
     * @property {number} rows
     */
    rows: { required: false },

    /**
     * Sometimes you need a user to enter the same value into two
     * different field to ensure they've got it right (e.g. phone
     * number, password, or email). You use this attribute to provide
     * the value that must be compared.
     *
     * If `same-as-value` is not null and is different to the current
     * value, then the current value will be deemed invalid
     *
     * @property {string|null} sameAsValue
     */
    sameAsValue: { required: false, default: null },

    /**
     * Whether or not to use built in browser/system spell check
     * functionality
     *
     * (see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#spellcheck) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#spellcheck)
     * for more info)
     *
     * @property {boolean} spellCheck
     */
    spellCheck: { type: Boolean, required: false },

    /**
     * Increment when using buttons to decrease/increase value
     *
     * Used for date, datetime-local, number, range & time type
     * input fields.
     *
     * (See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#step)
     * for more info)
     *
     * @property {number|string} maxVal
     */
    step: { type: Number, required: false },

    /**
     * Icon or character to render at the end of the input field
     *
     * e.g. "$" or
     *
     * @property {string} placeholder
     */
    suffixIcon: { type: String, required: false },

    /**
     * When content is hidden, tabindex must be set to `-1` to
     * prevent the user using the keyboard to tab into hidden inputs.
     *
     * > __Note:__ If tabindex is not `-1` it will not be rendered
     * >           on the field, instead the browser's default
     * >           tabbing order will be used
     *
     * (see [MDN `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#tabindex),
     * [MDN `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#tabindex) &
     * [MDN `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#tabindex)
     * for more info)
     *
     * @property {number} tabindex
     */
    tabindex: { type: Number, required: false, default: 0 },

    /**
     * Type of field to be rendered
     *
     * Allowed types are:
     * * [color](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color)
     * * [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
     *   (Text field with fixed set of options. Useful for very long
     *   option lists - e.g. country list)
     * * [date](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date)
     * * [datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local)
     * * [email](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email)
     * * [month](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month)
     * * [number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)
     * * [password](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password)
     * * [radio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio)
     * * [range](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range)
     * * [select](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select)
     * * [tel](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel)
     * * [text](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text)
     * * [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)
     * * [time](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time)
     * * [url](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/url)
     * * [week](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week)
     *
     * > __Note:__ If the specified type is not one of the above,
     * >           an error will be thrown
     *
     * @property {string} type
     */
    type: { type: String, required: true },

    /**
     * Common standard validation types for text & numeric inputs
     *
     * Provides standard pattern attribute value, placeholder text
     * and where appropriate additional error messages for common
     * input field use-cases, plus sanitisation and validation functions.
     *
     * Available validation types:
     * * fixedphone (Australia)
     * * mobilephone (Australia)
     * * anyphone (Australia)
     * * intphone (International phone number)
     * * email (prevents malicious email being used)
     * * postcodepobox (PO box postcode)
     * * postcodestreet (Street address postcode)
     * * postcode (PO Box or Street address postcode)
     * * name (People's names)
     * * url
     * * money (number with zero or two decimal places)
     *
     * @property {string} valType
     */
    validationType: { type: String, required: false },

    /**
     * Predefined value for the field.
     *
     * @property {string|number|undefined} value
     */
    value: { required: false, default: '' },
  },

  components: { RadioSelectInput, CheckboxList },

  data() {
    return {
      /**
       * List of known and validated key/value pairs for HTML input
       * field attriubtes
       *
       * @property {Object} attrs
       */
      attrs: {},

      /**
       * The current value of the field
       *
       * @property {string} currentValue
       */
      currentValue: '',

      /**
       * Custom min & max values for validating temporal inputs
       *
       * @property {Object} custom
       */
      custom: {
        min: null,
        max: null,
      },

      /**
       * @property {string} customErr
       */
      customErr: '',

      /**
       * @property {string|undefined} customErr
       */
      customPat: undefined,

      /**
       * @property {string} customErr
       */
      customPlace: undefined,

      /**
       * Custom sanitisation function to sanitise user input on
       * keyup event
       *
       * @property {Function} customSan
       */
      customSan: null,

      /**
       * Custom validation function to check whether user input is
       * valid on change or on blur
       *
       * @property {Function} customVal
       */
      customVal: null,

      /**
       * Get the start of an error message string for a given method
       *
       * @param {string} method Name of method that might throw an error
       *
       * @returns {string}
       */
      ePre: null,

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
       * @property {boolean} hasError
       */
      hasError: true,

      /**
       * Whether or not there is help text either as an attribute
       * or a slot
       *
       * @property {boolean} hasHelp
       */
      hasHelp: false,

      /**
       * Custom icon to render in end of an input field
       * (e.g. "%" or material icon: "percent")
       *
       * @property {string} iconPost
       */
      iconPost: '',

      /**
       * Holder for iconPost value if the field is invalid
       *
       * If there is a post icon and the field is invalid, the
       * invalid icon will be shown. While the invalid icon is
       * shown, we need to hold the post icon value somewhere so it
       * can be put back when the field becomes valid again.
       *
       * @property {string} iconPostTmp
       */
      iconPostTmp: '',

      /**
       * Custom icon to render in front of an input field
       * (e.g. "$" or material icon: "attach_money")
       *
       * @property {string} iconPre
       */
      iconPre: '',

      /**
       * String to render when field is not required
       *
       * @property {string} optionalTxt
       */
      optionalTxt: '',

      /**
       * Material Design icon name for the icon to display in the
       * toggle password button
       *
       * @property {string} passwordBtnIcon
       */
      passwordBtnIcon: 'visibility',

      /**
       * Screen reader text for toggle password button
       *
       * @property {string} passwordBtnIcon
       */
      passwordBtnTxt: 'Show password',

      /**
       * String to render when field is required
       *
       * @property {string} requiredTxt
       */
      requiredTxt: ' (required)',

      /**
       * Whether or not the current value is valid
       *
       * > __Note:__ Fields that are `required` must not be empty,
       * >           otherwise they will show an error after the
       * >           field has had focus
       *
       * @property {boolean} showError
       */
      showError: false,

      /**
       * Whether or not to make password input a text field so
       * password can be seen
       *
       * @property {boolean} showPassword
       */
      showPassword: false,

      /**
       * Some standard configuration/validation for known inputs
       *
       * @property {Object|null} standardVal
       */
      standardVal: null,
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

      if (this.hasHelp === true) {
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

      let output = ((this.hasError === true && this.showError === true) || this.externalInvalid === true)
        ? `${tmp} ${tmp}--show`
        : tmp;

      if (this.isCheckable === true) {
        output += ` ${tmp}--checkable`;
      }

      return `material-icons ${output}`;
    },

    errorMsgClass() {
      const tmp = 'single-val-input__error';
      return (this.isCheckable === true)
        ? `${tmp} ${tmp}--checkable`
        : tmp;
    },

    helpClass() {
      const tmp = 'single-val-input__help';
      const tail = (this.helpFirst === true)
        ? 'before'
        : 'after';

      return `${tmp} ${tmp}--${tail}`;
    },

    iconPreCLass() {
      const tmp = 'input-icon input-icon--pre';
      return (this.iconPre.length > 1)
        ? `${tmp} material-icons`
        : tmp;
    },

    iconPostCLass() {
      const err = (this.showError)
        ? 'single-val-input__error-icon'
        : '';
      const tmp = `input-icon input-icon--post ${err}`;

      return (this.iconPost.length > 1)
        ? `${tmp} material-icons`
        : tmp;
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

      if (this.type === 'radio' || this.type === 'checkbox') {
        output += ` ${prefix}--checkable`;
      }

      if (temporal.indexOf(this.type) > -1) {
        output += ` ${prefix}--auto`;
      }

      if (noBorder.indexOf(this.type) > -1) {
        output += ` ${prefix}--no-border`;
      }

      if (this.type === 'password' && this.noToggle === false) {
        output += ` ${prefix}--password`;
      }

      if (this.showError === true || this.externalInvalid === true) {
        output += ` ${prefix}--invalid`;
      }

      return output;
    },

    /**
     * List of class names to add to the input field element
     *
     * @returns {string}
     */
    inputFieldClass() {
      const tmp = 'single-val-input__input';
      let output = tmp;

      if (this.type === 'password' && this.noToggle === false) {
        output += ` ${tmp}--password`;
      }

      if (this.showError === true || this.externalInvalid === true) {
        output += ` ${tmp}--invalid`;
      }

      if (this.iconPre !== '') {
        output += ` ${tmp}--icon-pre`;
      }

      if (this.iconPost !== '') {
        output += ` ${tmp}--icon-post`;
      }

      return output;
    },

    /**
     * Test whether or not the rendered field is a radio input group
     *
     * @returns {boolean} TRUE if type is "radop". FALSE otherwise
     */
    isCheckable() {
      return (this.type === 'radio' || this.type === 'checkbox');
    },

    /**
     * Test whether or not the rendered field is a select dropdown
     * field or radio input group.
     *
     * @returns {boolean} TRUE if type is "select", "radio" or "combo"
     *                    FALSE otherwise
     */
    isSelect() {
      const types = ['combobox', 'radio', 'select'];

      return types.indexOf(this.type) > -1;
    },

    /**
     * Test whether or not the rendered field is a textarea field
     *
     * @returns {boolean} TRUE if type is "textarea". FALSE otherwise
     */
    isTextarea() {
      return (this.type === 'textarea');
    },

    labelClass() {
      const tmp = 'single-val-input__label';
      return (this.hideLabel === true)
        ? `${tmp} visually-hidden`
        : tmp;
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

    showLabel() {
      if (this.type !== 'checkbox') {
        return true;
      }

      return (this.label !== '' || this.noLabel === false);
    },

    showPostIcon() {
      return (this.iconPost !== '');
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
      return (typeof this.customPat === 'string' && this.customPat.trim() !== '')
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

    requiredStr() {
      return (this.required === true)
        ? this.requiredTxt
        : this.optionalTxt;
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
    checkedChanged(event) {
      this.$emit('checkedchange', event);
    },

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
      this.$emit('invalid', this.showError);
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

      if (this.showError === false && this.customVal !== null
          && (this.required === true || this.currentValue !== '')
      ) {
        this.extraError = this.customVal(this.currentValue);
        this.showError = (typeof this.extraError === 'string' && this.extraError.trim() !== '');
      } else if (this.sameAsValue !== null && this.currentValue !== this.sameAsValue) {
        this.showError = true;
      }

      if (this.showError) {
        if (this.iconPost !== 'priority_high') {
          this.iconPostTmp = this.iconPost;
        }
        this.iconPost = 'priority_high';
      } else {
        this.iconPost = this.iconPostTmp;
      }

      this.$emit('invalid', this.showError);

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
     * key
     */
    keyupHandler(event) {
      if (this.customSan !== null && typeof this.customSan === 'function') {
        event.target.value = this.customSan(event.target.value); // eslint-disable-line
      } else {
        this.$emit(event.type, event);
      }
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

      let text = 'Show';
      let icon = '';

      if (this.showPassword === true) {
        text = 'Hide';
        icon = '_off';
      }

      this.passwordBtnIcon = `visibility${icon}`;
      this.passwordBtnTxt = `${text} password`;
    },
  },

  beforeMount() {
    if ((typeof this.label !== 'string' || this.label.trim() === '')
      && this.noLabel === false
    ) {
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
        + '(excluding "file" types)',
      );
    }

    if (this.type === 'select' || this.type === 'radio') {
      // Make sure there's at least two options to render in
      // select/radio input
      if (!Array.isArray(this.options) || this.options.length < 2) {
        throw new Error('Select & radio fields require at least two options');
      }
    }

    this.ePre = getEpre('SingleValueInput', this.fieldId);

    // Make sure we have a default current value
    this.currentValue = (typeof this.value !== 'undefined')
      ? this.value
      : '';

    // Do we have a help text block to show the user?
    this.hasHelp = this.notEmpty('help', 'helpTxt');

    this.iconPost = '';
    this.iconPre = '';

    // Check if we should be using common validation for this input
    if (typeof this.validationType === 'string'
        && this.validationType.trim() !== ''
    ) {
      // Normalise the validation type
      const vType = this.validationType.replace(/[^a-z]+/ig, '').trim().toLowerCase();

      if (typeof validators[vType] === 'undefined') {
        console.warn( // eslint-disable-line
          `"${this.validationType}" does not match any known validation types. `
          + 'Known validation types are: "'
          + `${Object.keys(validators).join('", "')}"`,
        );
      } else {
        this.standardVal = validators[vType];

        if (typeof this.standardVal.validate === 'function') {
          this.customVal = this.standardVal.validate;
        }

        if (typeof this.standardVal.sanitise === 'function') {
          this.customSan = this.standardVal.sanitise;
        }

        this.customErr = this.standardVal.error;

        if (this.standardVal.pattern.source !== '') {
          this.customPat = this.standardVal.pattern.source;
        }

        if (this.standardVal.placeholder.trim() !== '') {
          this.customPlace = this.standardVal.placeholder;
        }

        if (this.standardVal.preIcon.trim() !== '') {
          this.iconPre = this.standardVal.preIcon;
        }

        if (this.standardVal.postIcon.trim() !== '') {
          this.iconPost = this.standardVal.postIcon;
        }
      }
    }

    if (typeof this.customSanitisation === 'function') {
      this.customSan = this.customSanitisation;
    }

    if (typeof this.customValidation === 'function') {
      this.customVal = this.customValidation;
    }

    if (typeof this.errorMsg === 'string' && this.errorMsg.trim() !== '') {
      this.customErr = this.errorMsg;
    }

    if (typeof this.pattern === 'string' && this.pattern.trim() !== '') {
      this.customPat = this.pattern;
    }

    if (typeof this.placeholder === 'string' && this.placeholder.trim() !== '') {
      this.customPlace = this.placeholder;
    }

    if (typeof this.prefixIcon === 'string') {
      this.iconPre = this.prefixIcon;
    }

    if (typeof this.suffixIcon === 'string') {
      this.iconPost = this.suffixIcon;
    }

    this.iconPostTmp = this.iconPost;

    // Do we have an error message to show the user?
    this.hasError = this.notEmpty('error', 'customErr');

    if (this.requiredRev === true) {
      this.optionalTxt = (typeof this.optionalText === 'string' && this.optionalText.trim() !== '')
        ? ` (${this.optionalText.trim()})`
        : ' (optional)';
      this.requiredTxt = '';
    }
  },
};
</script>
