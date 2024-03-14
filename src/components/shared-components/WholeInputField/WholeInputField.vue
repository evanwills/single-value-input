<template>
  <li :class="wrapClass" :id="wrapID">
    <label v-if="!isCheckable" :for="fieldId" :class="labelClass" data-tmp>
      {{ label }}
      <span class="whole-input__required">{{ requiredStr }}</span>
    </label>
    <span v-else-if="showLabel" :id="fieldId" :class="labelClass">
      {{ label }}
      <span class="whole-input__required">{{ requiredStr }}</span>
      <span :class="errorIconClass">priority_high</span>
    </span>

    <div v-if="(hasHelp === true && helpFirst === true)" :class="helpClass" :id="getID('help')">
      <slot name="help"><p>{{ helpTxt }}</p></slot>
    </div>

    <div :class="inputClass">
      <span v-if="iconPre !== ''" :class="iconPreCLass">{{ iconPre }}</span>
      <!-- START: auto-complete -->
      <Autocomplete
        v-if="type === 'combobox'"
        :aria-describedby="describedByIDs"
        :debounce-time="comboThrottle"
        :default-value="currentValue"
        :disabled="disabled"
        :id="fieldId"
        :get-result-value="comboLabelGetter"
        :placeholder="customPlace"
        :search="optionsGetter"
        submit-on-enter
        submit-on-tab
        :tab-index="tabindex"
        v-on:submit="comboboxChanged($event)"
        v-on:update="comboboxUpdated($event)"
        v-on:focus="genericHandler($event)"
        v-on:keydown="genericHandler($event)"
        v-on:keypress="genericHandler($event)"
        v-on:keyup="keyupHandler($event)"
        v-on:valid="comboboxInvalid($event)" />
      <!--  END:  auto-complete -->

      <!-- START: checkbox-list -->
      <CheckboxList
        v-else-if="type === 'checkbox'"
        :aria-describedby="describedByIDs"
        :dedupe="dedupe"
        :field-id="fieldId"
        :help-ids="describedByIDs"
        :is-required="required"
        :is-readonly="readonly"
        :is-disabled="disabled"
        :last-updated="lastUpdated"
        :max-length="maxLength"
        :min-length="minLength"
        :null-to-false="nullToFalse"
        :options="options"
        :tab-index="tabindex"
        v-on:blur="genericHandler($event)"
        v-on:change="simpleChange($event)"
        v-on:checkedchange="checkedChanged($event)"
        v-on:focus="genericHandler($event)"
        v-on:invalid="simpleInvalid($event)"
        v-on:lostfocus="lostFocus($event)" />
      <!--  END:  checkbox-list -->

      <!-- START: likert-scale -->
      <LikertScale
        v-else-if="type === 'likert'"
        :aria-describedby="describedByIDs"
        :field-id="`likert-${fieldId}`"
        :labeled-by="fieldId"
        :is-required="required"
        :is-readonly="readonly"
        :is-disabled="disabled"
        :last-updated="lastUpdated"
        :questions="questions"
        :options="options"
        :tab-index="tabindex"
        :unique-two-d="uniqueTwoD"
        :values="value"
        v-on:change="simpleChange($event)"
        v-on:invalid="simpleInvalid($event)"
        v-on:lostfocus="lostFocus($event)" />
      <!--  END:  likert-scale -->

      <!-- START: numeric-input -->
      <NumericInput
        v-else-if="type === 'numeric'"
        :class="inputFieldClass"
        :described-by="describedByIDs"
        :disabled="disabled"
        :field-id="fieldId"
        :last-updated="lastUpdated"
        :max="maxAttr"
        :min="minAttr"
        :pattern="customPat"
        :placeholder="customPlace"
        :step="stepAttr"
        :readonly="readonly"
        :required="required"
        :tabindex="tabindex"
        :value="currentValue"
        v-model="currentValue"
        v-on:blur="genericHandler($event)"
        v-on:change="simpleChange($event)"
        v-on:focus="genericHandler($event)"
        v-on:invalid="simpleInvalid($event)"
        v-on:keydown="genericHandler($event)"
        v-on:keypress="genericHandler($event)"
        v-on:keyup="simpleKeyUp($event)" />
      <!--  END:  numeric-input -->

      <!-- START: pretty-select -->
      <PrettySelect
        v-else-if="type === 'prettyselect'"
        :dedupe="dedupe"
        :empty-txt="emptyTxt"
        :field-id="fieldId"
        :force-above="forceAbove"
        :is-required="required"
        :is-readonly="readonly"
        :no-non-empty="noNonEmpty"
        :options="options"
        :tab-index="tabindex"
        :value="currentValue"
        v-on:blur="genericHandler($event)"
        v-on:change="selectChanged($event)"
        v-on:focus="genericHandler($event)"
        v-on:invalid="simpleInvalid($event)" />
      <!--  END:  numeric-input -->

      <!-- START: radio-select -->
      <RadioSelectInput
        v-else-if="isSelect"
        :field-id="fieldId"
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
        v-on:blur="genericHandler($event)"
        v-on:change="selectChanged($event)"
        v-on:focus="genericHandler($event)"
        v-on:invalid="simpleInvalid($event)" />
      <!--  END:  radio-select -->

      <!-- START: textarea (standard) -->
      <textarea
        v-else-if="isTextarea"
        class="whole-input__input"
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
      <!--  END:  textarea (standard) -->

      <!-- START: input (standard) -->
      <input
        v-else
        :class="inputFieldClass"
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
        v-on:blur="genericHandler($event)"
        v-on:change="hasChanged($event)"
        v-on:focus="genericHandler($event)"
        v-on:keydown="genericHandler($event)"
        v-on:keypress="genericHandler($event)"
        v-on:keyup="keyupHandler($event)" />
      <!--  END:  input (standard) -->
      <button
        v-if="type === 'password' && noToggle === false"
        aria-live="polite"
        class="input-icon input-icon--password-toggle"
        :tabindex="tabindex"
        type="button"
        v-on:click="togglePassword($event)">
        <span class="material-icons">{{ passwordBtnIcon }}</span>
        <span class="visually-hidden">{{ passwordBtnTxt }}</span>
      </button>
      <span
        v-if="showError === false && externalInvalid === false"
        :class="iconPostClass">{{ iconPost }}</span>
      <span v-else-if="isCheckable === false" :class="errorIconClass">priority_high</span>
      <div
        v-if="(showError === true || externalInvalidShow === true)
          && (hasError === true || extraError !== '')"
        aria-live="polite"
        :class="errorMsgClass"
        :id="getID('error')"
        :key="errorChange">
        <slot v-if="extraError === ''" name="error">{{ customErr }}</slot>
        <div v-if="extraError !== ''" v-html="extraError"></div>
      </div>
    </div>
    <div v-if="(hasHelp === true && helpFirst === false)" :class="helpClass" :id="getID('help')">
      <slot name="help"><p>{{ helpTxt }}</p></slot>
    </div>
  </li>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  ref,
  useSlots,
} from 'vue';
import { isObj } from '../../../utils/data-utils';
import { getEpre } from '../../../utils/general-utils';
import { hasContent } from '../../../utils/vue-utils';
import Autocomplete from '../Autocomlete/Autocomplete.vue';
import CheckboxList from './CheckboxList.vue';
import LikertScale from './LikertScale.vue';
import PrettySelect from './PrettySelect.vue';
import RadioSelectInput from './RadioSelectInput.vue';
import validators from './validators';
import NumericInput from './NumericInput.vue';

const slots = useSlots();
// --------------------------------------------------
// START: Emitted events

const emit = defineEmits([
  'blur',
  'change',
  'checkedchange',
  'focus',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'lostfocus',
]);

//  END:  Emitted events
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * Number of miliseconds (tf required) between one aysnc filter
   * request and another.
   *
   * @property {number}
   */
  comboThrottle: { required: false, default: 0 },

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
   * >       in the browser so all validation __*must*__ be
   * >       duplicated on the server to ensure the user
   * >       doesn't submit bad data.
   *
   * > __Note also:__ For `<INPUT>` and `<TEXTAREA>` fields this
   * >       function is called on the `keyup` event, but for
   * >       checkbox fields, it is passed to the `change`
   * >       `CheckboxList` component and called on and `blur`
   * >       events.
   *
   * @property {Function} customSanitisation
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
   * >       in the browser so all validation __*must*__ be
   * >       duplicated on the server to ensure the user
   * >       doesn't submit bad data.
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
   * >       and the default [`value`](#value) is not empty
   * >       this will be ignored.
   *
   * @property {string} emptyTxt
   */
  emptyTxt: { type: String, required: false, default: '' },

  /**
   * Error message to show the user when the value of the field is
   * invalid
   *
   * > __Note:__ If the field is marked as `required` an empty
   * >       value will also cause the error message to show.
   *
   * > __Note also:__ If you need to include HTML (e.g. a link)
   * >       in the error message use the "error" slot instead.
   *
   * @property {string} errorMsg
   */
  errorMsg: { type: String, required: false, default: '' },

  /**
   * Whether or not this field has been marked as invalid due to
   * (addional) external rules
   *
   * e.g. User must enter either a mobile phone number or a land
   *    line number.
   *    If both are empty then both fields must be marked as
   *    invalid.
   *
   * @property {boolean} externalInvalid
   */
  externalInvalid: { type: Boolean, required: false, default: false },

  /**
   * If external-invalid is TRUE, Whether or not to render this
   * field's error message
   *
   * e.g. The validation for this field has changed due to the
   *    value of another field changing, now this field's value
   *    is invalid. Show this field's error message.
   *
   * > __Note:__ If `external-invalid-show` is not set, the error
   * >       message won't show until this field changes or
   * >       emits a blur event.
   *
   * @property {boolean} externalInvalidShow
   */
  externalInvalidShow: { type: Boolean, required: false, default: false },

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
   *       be thrown
   *
   * @property {string} fieldId
   */
  fieldId: { type: String, required: true },

  /**
   * Sometimes you need the dropdown to always drop up (sit above the
   * main button)
   *
   * @property {boolean} forceAbove
   */
  forceAbove: { type: Boolean, required: false, default: false },

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
   * >       error message use the "help" slot instead.
   *
   * @property {string} helpTxt
   */
  helpTxt: { type: String, required: false, default: '' },

  /**
   * Whether or not to hide the label from screen. (Label is still visible to screen readers)
   *
   * Sometimes a design uses non-standard format for input fields
   * and their labels.
   * e.g. When the (visible) label for a field is use in such away
   *    that the input field's value forms first part of a
   *    sentance and the label form the rest of the sentance.
   *    In this case the screen reader usage of the label may
   *    not make any sense. In this case, we use the `help-txt`
   *    value as the visible label and hide the field's actual
   *    label from screen users.
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
   * >       be thrown
   *
   * (See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
   * for more info)
   *
   * @property {string} label
   */
  label: { type: String, required: true },

  /**
   * When the options for this item were last updated
   *
   * > __Note:__ If lastUpdated is not set, this field will not
   * >       update the options if changed by the parent.
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
  maxLength: { required: false, default: null },

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
  maxVal: { required: false, default: null },

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
  minLength: { required: false, default: null },

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
  minVal: { required: false, default: null },

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
   * For checkbox lists it sometimes causes issues if the server
   * provides null values for checkboxes
   *
   * If data from the server has null values for each checkbox item,
   * Make null options FALSE after the first checkbox is checked
   *
   * @property {boolean} noNonEmpty
   */
  nullToFalse: { type: Boolean, required: false, default: false },

  /**
   * List of options available in a <SELECT> or <INPUT type="radio">
   * field
   *
   * > __Note:__ If `type` is "select" or "radio" and there are
   * >       less than two options in the in the `options`
   * >       property, an error will be thrown
   *
   * Options can have the following structures
   *
   * * Array of objects where the first property in the object
   *   represents what will go in the option's value attribute
   *   `<option value="">` and the second property will be the
   *   label/text that's wrapped within the `<option></option>`
   *   elements
   *   * either `{ value: {string|number}, label: {string} }`
   *   or
   *   * `{ key: {string|number}, value: {string} }`
   *   or
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
  options: { type: Array, required: false, default: null },

  /**
   * for `combobox` inputs, options getter is a function
   *
   * @property {function}
   */
  optionsGetter: { type: Function, required: false, default: null },

  /**
   * for `combobox` inputs, options label getter is a function
   *
   * @property {function}
   */
  comboLabelGetter: { type: Function, required: false, default: null },

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
  pattern: { type: String, required: false, default: null },

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
  placeholder: { type: String, required: false, default: null },

  /**
   * Icon or character to render at the start of the input field
   *
   * e.g. "$" or
   *
   * @property {string} placeholder
   */
  prefixIcon: { type: String, required: false, default: null },

  /**
   * List of questions to display in Likert Scale field
   *
   * @property {LikertQuestion[]} questions
   */
  questions: { type: Array, required: false, default: null },

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
   * >       current use-case requires it until we can have
   * >       it reversed
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
  rows: { required: false, default: null },

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
  step: { type: Number, required: false, default: 1 },

  /**
   * Icon or character to render at the end of the input field
   *
   * e.g. "$" or
   *
   * @property {string} placeholder
   */
  suffixIcon: { type: String, required: false, default: null },

  /**
   * When content is hidden, tabindex must be set to `-1` to
   * prevent the user using the keyboard to tab into hidden inputs.
   *
   * > __Note:__ If tabindex is not `-1` it will not be rendered
   * >       on the field, instead the browser's default
   * >       tabbing order will be used
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
   * >       an error will be thrown
   *
   * @property {string} type
   */
  type: { type: String, required: true },

  /**
   * If you are asking users to rank items in order of preference,
   * you may want them to be able to select each option only once
   * and want all the options to be used up.
   *
   * By setting `unique-two-d` the user will only be able to select
   * each option once. If they select an option a second time, the
   * first one will be made empty and they'll have to update their
   * selection for that row.
   *
   * e.g. Rank your preferred modes of transport from 1 to 9, where
   *      1 is most preferred and 9 is least preferred
   *
   * VALID:
   * * Bicycle    - 1
   * * Bus        - 5
   * * Car        - 7
   * * Ferry      - 4
   * * Motorcycle - 6
   * * Taxi       - 8
   * * Train      - 3
   * * Walking    - 2
   *
   * The above is valid because numbers are only used once
   *
   * INVALID
   * * Bicycle    - 1
   * * Bus        - 4
   * * Car        - 2
   * * Ferry      - 4
   * * Motorcycle - 2
   * * Taxi       - 3
   * * Train      - 7
   * * Walking    - 1
   *
   * The above is invalid because 1, 2 & 4 have been used multiple
   * times and 5, 6 & 8 have not been used atall
   *
   * @property {boolean} uniqueTwoD
   */
  uniqueTwoD: { type: Boolean, required: false, default: false },

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
  validationType: { type: String, required: false, default: null },

  /**
   * Predefined value for the field.
   *
   * NOTE: for 'likert' scale fields the value must be an indexed
   *       object (key/value) pair where the key is a string and
   *       the value is a string, number or null.
   *       the key MUST match the ID of one of the questions in the
   *       likert scale. If not, it will be ignored
   *
   * @property {string|number|Object|undefined} value
   */
  value: { required: false, default: '' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local constants

const inputTypes = [
  'checkbox', 'color', 'combobox', 'date', 'datetime-local', 'email',
  'month', 'number', 'numeric', 'password', 'radio', 'range', 'select', 'tel',
  'text', 'textarea', 'time', 'url', 'week',
  'likert', 'prettyselect',
];

const temporal = ['date', 'datetime-local', 'time'];

//  END:  Local constants
// --------------------------------------------------
// START: Local state

// /**
//  * List of known and validated key/value pairs for HTML input
//  * field attriubtes
//  *
//  * @property {Object} attrs
//  */
// const attrs = ref({});

/**
 * The current value of the field
 *
 * @property {string} currentValue
 */
const currentValue = ref('');

// /**
//  * Custom min & max values for validating temporal inputs
//  *
//  * @property {Object} custom
//  */
// const custom = ref({
//   min: null,
//   max: null,
// });

/**
 * @property {string} customErr
 */
const customErr = ref('');

/**
 * @property {string|undefined} customPat
 */
const customPat = ref(undefined);

/**
 * Placehoder string to use in input.
 *
 * Could be added by standard validation type or by parent template.
 *
 * @property {string} customPlace
 */
const customPlace = ref(undefined);

/**
 * Custom sanitisation function to sanitise user input on
 * keyup event
 *
 * @property {Function} customSan
 */
const customSan = ref(null);

/**
 * Custom validation function to check whether user input is
 * valid on change or on blur
 *
 * @property {Function} customVal
 */
const customVal = ref(null);

/**
 * Get the start of an error message string for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
const ePre = ref(null);

const errorChange = ref(Date.now());

/**
 * Extra error message generated by custom validation function
 *
 * @property {string} extraError
 */
const extraError = ref('');

/**
 * Whether or not there is error text either as an attribute
 * or a slot
 *
 * @property {boolean} hasError
 */
const hasError = ref(true);

/**
 * Whether or not there is help text either as an attribute
 * or a slot
 *
 * @property {boolean} hasHelp
 */
const hasHelp = ref(false);

/**
 * Custom icon to render in end of an input field
 * (e.g. "%" or material icon: "percent")
 *
 * @property {string} iconPost
 */
const iconPost = ref('');

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
const iconPostTmp = ref('');

/**
 * Custom icon to render in front of an input field
 * (e.g. "$" or material icon: "attach_money")
 *
 * @property {string} iconPre
 */
const iconPre = ref('');

/**
 * String to render when field is not required
 *
 * @property {string} optionalTxt
 */
const optionalTxt = ref('');

/**
 * Material Design icon name for the icon to display in the
 * toggle password button
 *
 * @property {string} passwordBtnIcon
 */
const passwordBtnIcon = ref('visibility');

/**
 * Screen reader text for toggle password button
 *
 * @property {string} passwordBtnIcon
 */
const passwordBtnTxt = ref('Show password');

/**
 * String to render when field is required
 *
 * @property {string} requiredTxt
 */
const requiredTxt = ref(' (required)');

/**
 * Whether or not the current value is valid
 *
 * > __Note:__ Fields that are `required` must not be empty,
 * >           otherwise they will show an error after the
 * >           field has had focus
 *
 * @property {boolean} showError
 */
const showError = ref(false);

/**
 * Whether or not to make password input a text field so
 * password can be seen
 *
 * @property {boolean} showPassword
 */
const showPassword = ref(false);

/**
 * Some standard configuration/validation for known inputs
 *
 * @property {Object|null} standardVal
 */
const standardVal = ref(null);

//  END:   Local state
// --------------------------------------------------
// START: Computed properties

/**
 * Get the custom ID (or `for` attribute) for a given element
 *
 * @param {string|undefined} suffix Custom suffix for the ID
 *
 * @returns {string} custom ID (or `for` attribute) value
 */
const getID = (suffix) => { // eslint-disable-line arrow-body-style
  return (typeof suffix === 'string' && suffix !== '')
    ? `${props.fieldId}--${suffix}`
    : props.fieldId;
};

/**
 * Test whether or not the rendered field is a radio input group
 *
 * @returns {boolean} TRUE if type is "radop". FALSE otherwise
 */
const isCheckable = computed(() => ['checkbox', 'likert', 'radio'].indexOf(props.type) >= 0);

const hasLimit = (type) => {
  const areLimited = ['date', 'datetime-local', 'month', 'number', 'numeric', 'range', 'time', 'week'];

  return (areLimited.indexOf(type) > -1);
};

const hasCharLimit = (type) => {
  const areLimited = ['email', 'password', 'tel', 'text', 'textarea', 'url'];

  return (areLimited.indexOf(type) > -1);
};

/**
 * IDs to link the input field with help text and error message
 * blocks
 *
 * @returns {string|undefined}
 */
const describedByIDs = computed(() => {
  let output = '';
  let sep = '';

  if (hasHelp.value === true) {
    output = getID('help');
    sep = ' ';
  }

  if (hasError.value && showError.value === true) {
    output += sep + getID('error');
    sep = ' ';
  }

  if (typeof props.extraDescByIds === 'string' && props.extraDescByIds.trim() !== '') {
    output += sep + props.extraDescByIds;
  }

  return (output !== '')
    ? output
    : undefined;
});

const errorIconClass = computed(() => {
  const tmp = 'whole-input__error-icon';

  let output = ((hasError.value === true && showError.value === true)
    || props.externalInvalid === true)
    ? `${tmp} ${tmp}--show`
    : tmp;

  if (isCheckable.value === true) {
    output += ` ${tmp}--checkable`;
  }

  return `material-icons ${output}`;
});

const errorMsgClass = computed(() => {
  const tmp = 'whole-input__error';
  return (isCheckable.value === true)
    ? `${tmp} ${tmp}--checkable`
    : tmp;
});

const helpClass = computed(() => {
  const tmp = 'whole-input__help';
  const tail = (props.helpFirst === true)
    ? 'before'
    : 'after';

  return `${tmp} ${tmp}--${tail}`;
});

const iconPreCLass = computed(() => {
  const tmp = 'input-icon input-icon--pre';
  return (iconPre.value.length > 1)
    ? `${tmp} material-icons`
    : tmp;
});

const iconPostClass = computed(() => {
  const err = (showError.value)
    ? 'whole-input__error-icon'
    : '';
  const tmp = `input-icon input-icon--post ${err}`;

  return (iconPost.value.length > 1)
    ? `${tmp} material-icons`
    : tmp;
});

/**
 * List of class names to add to the input field
 *
 * @returns {string}
 */
const inputClass = computed(() => {
  const noBorder = ['radio', 'range'];
  const prefix = 'whole-input__input-wrap';
  let output = prefix;

  if (props.type === 'radio' || props.type === 'checkbox') {
    output += ` ${prefix}--checkable`;
  } else {
    output += ` ${prefix}--${props.type}`;
  }

  if (temporal.indexOf(props.type) > -1) {
    output += ` ${prefix}--auto`;
  }

  if (noBorder.indexOf(props.type) > -1) {
    output += ` ${prefix}--no-border`;
  }

  if (props.type === 'password' && props.noToggle === false) {
    output += ` ${prefix}--password`;
  } else if (props.type === 'number') {
    output += ` ${prefix}--number`;
  }

  if (showError.value === true || props.externalInvalid === true) {
    output += ` ${prefix}--invalid`;
  }

  return output;
});

/**
 * List of class names to add to the input field element
 *
 * @returns {string}
 */
const inputFieldClass = computed(() => {
  const tmp = 'whole-input__input';
  let output = tmp;

  if (props.type === 'password' && props.noToggle === false) {
    output += ` ${tmp}--password`;
  }

  if (showError.value === true || props.externalInvalid === true) {
    output += ` ${tmp}--invalid`;
  }

  if (iconPre.value !== '') {
    output += ` ${tmp}--icon-pre`;
  }

  if (iconPost.value !== '') {
    output += ` ${tmp}--icon-post`;
  }

  return output;
});

// const showPostIcon = computed(() => ((showError.value === false
//   && props.externalInvalid === false) || isCheckable.value === false));

// const getPostIconClass = computed(() => {
//   if (showError.value === false && props.externalInvalid === false) {
//     return iconPostClass;
//   }

//   return (isCheckable.value === false)
//     ? errorIconClass
//     : undefined;
// });

// const getPostIcon = computed(() => {
//   if (showError.value === false && props.externalInvalid === false) {
//     return iconPost;
//   }

//   return (isCheckable.value === false)
//     ? 'priority_high'
//     : '';
// });

/**
 * Test whether or not the rendered field is a select dropdown
 * field or radio input group.
 *
 * @returns {boolean} TRUE if type is "select", "radio" or "combo"
 *                    FALSE otherwise
 */
const isSelect = computed(() => { // eslint-disable-line arrow-body-style
  const types = ['radio', 'select'];

  return types.indexOf(props.type) > -1;
  // return props.type === 'radio';
});

/**
 * Test whether or not the rendered field is a textarea field
 *
 * @returns {boolean} TRUE if type is "textarea". FALSE otherwise
 */
const isTextarea = computed(() => (props.type === 'textarea'));

const labelClass = computed(() => {
  const tmp = 'whole-input__label';
  let output = tmp;

  if (hasError.value === true) {
    output += ` ${tmp}--invalid`;
  }
  if (props.hideLabel === true) {
    output += `${tmp} visually-hidden`;
  }

  return output;
});

/**
 * Maximum numeric/temporal value allowed for valid input
 *
 * @returns {number|undefined}
 */
const maxAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (hasLimit(props.type) && typeof props.maxVal !== 'undefined')
    ? props.maxVal
    : undefined;
});

/**
 * Maximum number of characters allowed for valid input
 *
 * @returns {number|undefined}
 */
const maxLengthAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (hasCharLimit(props.type) && typeof props.maxLength !== 'undefined')
    ? props.maxLength
    : undefined;
});

/**
 * Minimum numeric/temporal value allowed for valid input
 *
 * @returns {number|undefined}
 */
const minAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (hasLimit(props.type) && typeof props.minVal !== 'undefined')
    ? props.minVal
    : undefined;
});

/**
 * Minimum number of characters allowed for valid input
 *
 * @returns {number|undefined}
 */
const minLengthAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (hasCharLimit(props.type) && typeof props.minLength !== 'undefined')
    ? props.minLength
    : undefined;
});

/**
 * Whether or not to show the non-<label> label
 *
 * @returns {boolean}
 */
const showLabel = computed(() => {
  if (props.type !== 'checkbox') {
    return true;
  }

  return (props.label !== '' || props.noLabel === false);
});

// /**
//  * Whether or not to show the post/suffix icon on the input field
//  *
//  * @returns {boolean}
//  */
// const showPostIcon = computed(() => {
//   return (iconPost.value !== '');
// });

/**
 * Get the string to use as the type attribute for the <input /> field
 *
 * @return {string}
 */
const typeAttr = computed(() => {
  if (props.type !== 'password') {
    return props.type;
  }

  return (showPassword.value === true)
    ? 'text'
    : 'password';
});

// /**
//  * Validation pattern for input (JavaScript RegExp pattern)
//  *
//  * @returns {string|undefined}
//  */
// const patternAttr = computed(() => { // eslint-disable-line arrow-body-style
//   return (typeof customPat.value === 'string' && customPat.value.trim() !== '')
//     ? props.pattern
//     : undefined;
// });

// /**
//  * Help text to render inside an empty input filed
//  *
//  * @returns {string|undefined}
//  */
// const placeholderAttr = computed(() => { // eslint-disable-line arrow-body-style
//   return (typeof props.placeholder === 'string' && props.placeholder.trim() !== '')
//     ? props.placeholder
//     : undefined;
// });

/**
 * Get the string to use as the required/optional text
 *
 * @returns {string}
 */
const requiredStr = computed(() => { // eslint-disable-line arrow-body-style
  return (props.required === true)
    ? requiredTxt.value
    : optionalTxt.value;
});

/**
 * Number of lines high a textarea field should be.
 *
 * @returns {number|undefined}
 */
const rowsAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.rows !== 'undefined')
    ? props.rows
    : undefined;
});

/**
 * Whether or not to use browser spell checker on user supplied
 * content
 *
 * @returns {boolean|undefined}
 */
const spellCheckAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.spellCheck !== 'undefined')
    ? props.spellCheck
    : undefined;
});

/**
 * The amount to increment a numeric value when the user clicks
 * an arrow key
 *
 * @returns {number|undefined}
 */
const stepAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.step !== 'undefined')
    ? props.step
    : undefined;
});

const wrapID = computed(() => `${props.fieldId}-wrap`);

const wrapClass = computed(() => {
  const tmp = 'whole-input';
  let output = `${tmp} ${tmp}--${props.type}`;

  if (isCheckable.value === true) {
    output += ` ${tmp}--checkable`;
  }
  return output;
});

//  END:   Computed properties
// --------------------------------------------------
// START: Local methods

/**
 * Pass checkboxchange event up to client component.
 *
 * @param {object} event List of checkbox inputs and their current
 *                   boolean states
 *
 * @returns {void}
 */
const checkedChanged = (event) => {
  emit('checkedchange', event);
};

const lostFocus = (event) => {
  emit('lostfocus', event);
};

/**
 * Handle a combobox (Autocomplete.vue) isValid event
 *
 * @param {Object<{isValid: boolean, matchCount: number}} event
 */
const comboboxInvalid = (event) => {
  if (isObj(event)) {
    if (typeof event.matchCount === 'number' && typeof event.isValid === 'boolean') {
      showError.value = (event.isValid === false || event.matchCount < 1);

      emit('invalid', showError.value);
    }
  }
};

/**
 * Handle basic 'change' events
 *
 * Just update the current value pass and the event up to the
 * parent component.
 *
 * @param {any} newValue Whatever was emitted by the child field(s)
 */
const simpleChange = (newValue) => {
  currentValue.value = newValue;
  emit('change', newValue);
};

/**
 * Handle basic 'keyup' events
 *
 * Just update the current value and pass the event up to the
 * parent component.
 *
 * @param {string|number} newValue Value emitted by text like
 *                                 input field
 */
const simpleKeyUp = (newValue) => {
  currentValue.value = newValue;
  emit('keyup', newValue);
};

/**
 * Handle basic 'invalid' event
 *
 * Just update the showError value and pass the event up to the
 * parent component.
 *
 * @param {boolean} isInvalid Whether or not the field that just
 *                            changed now has an invalid value
 */
const simpleInvalid = (isInvalid) => {
  showError.value = isInvalid;
  emit('invalid', showError.value);
};

/**
 * Handle  of an RadioSelectInput component `change` or `blur`
 * event
 *
 * @param {Event} event An event emitted by <SELECT> or
 *                      <input type="radio"> element within an
 *                      RadioSelectInput component
 */
const selectChanged = (event) => {
  if (showError.value === false) {
    emit('change', event);
  }
};

/**
 * Handle  of an RadioSelectInput component `change` or `blur`
 * event
 *
 * @param {Event} event An event emitted by <SELECT> or
 *                      <input type="radio"> element within an
 *                      RadioSelectInput component
 */
const comboboxChanged = (event) => {
  const isStrNum = (typeof event === 'string' || typeof event === 'number');

  let tmp = null;

  if (isStrNum === true || isObj(event)) {
    tmp = event;
  } else if (Array.isArray(event) && event.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    tmp = event[0];
  } else if (Array.isArray(event.target) && event.target.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    tmp = event.target[0];
  }

  if (tmp !== null) {
    let dud = false;

    if (isStrNum === true) {
      currentValue.value = tmp;
    } else if (isObj(tmp)) {
      if (typeof tmp.value !== 'undefined') {
        currentValue.value = tmp.value;
      } else if (typeof tmp.label !== 'undefined') {
        currentValue.value = tmp.label;
      } else if (typeof tmp.id !== 'undefined') {
        currentValue.value = tmp.id;
      } else {
        dud = true;
      }
    } else {
      dud = true;
    }

    if (dud === true) {
      throw new Error(
        `${ePre.value('comboboxChanged')} could not determine the current value`,
      );
    }

    errorChange.value = Date.now();
    showError.value = false;
    emit('change', tmp);
  } else {
    emit('change', null);
  }
};

const comboboxUpdated = (event) => {
  if (typeof event.type === 'string') {
    emit(event.type, event);
  }
};

/**
 * Handle `change` events emitted by <INPUT> or <TEXTAREA>
 * elements
 *
 * @param {Event} event An event emitted by a change event from an
 *                      <INPUT> or <TEXTAREA> element rendered
 *                      directly within this component
 */
const hasChanged = (event) => {
  showError.value = !event.target.checkValidity();
  currentValue.value = event.target.value;
  errorChange.value = Date.now();

  if (showError.value === false && customVal.value !== null
      && (props.required === true || currentValue.value !== '')
  ) {
    extraError.value = customVal.value(currentValue.value);
    showError.value = (typeof extraError.value === 'string' && extraError.value.trim() !== '');
  } else if (props.sameAsValue !== null && currentValue.value !== props.sameAsValue) {
    showError.value = true;
  }

  if (showError.value) {
    if (iconPost.value !== 'priority_high') {
      iconPostTmp.value = iconPost.value;
    }
    iconPost.value = 'priority_high';
  } else {
    iconPost.value = iconPostTmp.value;
  }

  emit('invalid', showError.value);

  if (showError.value === false) {
    emit('change', event);
  }
};

/**
 * Re-emit a focus, keyup, keydown or keypress event.
 *
 * @param {Event} event
 */
const genericHandler = (event) => {
  if (typeof event.type === 'string') {
    emit(event.type, event);
  }
};

/**
 * key
 */
const keyupHandler = (event) => {
  if (standardVal.value !== null
      && typeof standardVal.value.sanitise === 'function'
  ) {
    // eslint-disable-next-line no-param-reassign
    event.target.value = customSan.value(event.target.value);
  }

  emit(event.type, event);
};

/**
 * Toggle the visibility of the password in the password field.
 *
 * @param {Event} e
 */
const togglePassword = (e) => {
  e.preventDefault();

  showPassword.value = !showPassword.value;

  let text = 'Show';
  let icon = '';

  if (showPassword.value === true) {
    text = 'Hide';
    icon = '_off';
  }

  passwordBtnIcon.value = `visibility${icon}`;
  passwordBtnTxt.value = `${text} password`;
};

//  END:   Local methods
// --------------------------------------------------
// START: Lifecycle events

onBeforeMount(() => {
  if ((typeof props.label !== 'string' || props.label.trim() === '')
    && props.noLabel === false
  ) {
    // For accessibility reasons we MUST have a non-empty label
    throw new Error(
      '<whole-input-field> component requires label attribute '
      + 'to be set and a non-empty string',
    );
  }

  if (inputTypes.indexOf(props.type) === -1) {
    // There's no point in rendering something that shouldn't be
    // used here
    throw new Error(
      '<whole-input-field> component requires type attribute '
      + 'to be a valid (non-button) HTML input "type" value '
      + '(excluding "file" types)',
    );
  }

  ePre.value = getEpre('whole-input-field', props.fieldId);

  if (props.type === 'select' || props.type === 'radio' || props.type === 'prettyselect') {
    // Make sure there's at least two options to render in
    // select/radio input
    if (!Array.isArray(props.options) || props.options.length < 2) {
      throw new Error(
        `${ePre.value('onBeforeMount')}Select & radio fields `
        + 'require at least two options',
      );
    }
  }

  // Make sure we have a default current value
  currentValue.value = (typeof props.value !== 'undefined')
    ? props.value
    : '';

  // Do we have a help text block to show the user?
  hasHelp.value = hasContent(slots, props, 'help', 'helpTxt');

  iconPost.value = '';
  iconPre.value = '';

  // Check if we should be using common validation for this input
  if (typeof props.validationType === 'string'
      && props.validationType.trim() !== ''
  ) {
    // Normalise the validation type
    const vType = props.validationType.replace(/[^a-z]+/ig, '').trim().toLowerCase();

    if (typeof validators[vType] === 'undefined') {
      console.warn( // eslint-disable-line no-console
        `"${props.validationType}" does not match any known validation types. `
        + 'Known validation types are: "'
        + `${Object.keys(validators).join('", "')}"`,
      );
    } else {
      standardVal.value = validators[vType];

      if (typeof standardVal.value.validate === 'function') {
        customVal.value = standardVal.value.validate;
      }

      if (typeof standardVal.value.sanitise === 'function') {
        customSan.value = standardVal.value.sanitise;
      }

      customErr.value = standardVal.value.error;

      if (standardVal.value.pattern.source !== '') {
        customPat.value = standardVal.value.pattern.source;
      }

      if (standardVal.value.placeholder.trim() !== '') {
        customPlace.value = standardVal.value.placeholder;
      }

      if (standardVal.value.preIcon.trim() !== '') {
        iconPre.value = standardVal.value.preIcon;
      }

      if (standardVal.value.postIcon.trim() !== '') {
        iconPost.value = standardVal.value.postIcon;
      }
    }
  }

  if (typeof props.customSanitisation === 'function') {
    customSan.value = props.customSanitisation;
  }

  if (typeof props.customValidation === 'function') {
    customVal.value = props.customValidation;
  }

  if (typeof props.errorMsg === 'string' && props.errorMsg.trim() !== '') {
    customErr.value = props.errorMsg.trim();
  }

  if (typeof props.pattern === 'string' && props.pattern.trim() !== '') {
    customPat.value = props.pattern;
  }

  if (typeof props.placeholder === 'string' && props.placeholder.trim() !== '') {
    customPlace.value = props.placeholder;
  }

  if (typeof props.prefixIcon === 'string') {
    iconPre.value = props.prefixIcon;
  }

  if (typeof props.suffixIcon === 'string') {
    iconPost.value = props.suffixIcon;
  }

  iconPostTmp.value = iconPost.value;

  // Do we have an error message to show the user?
  hasError.value = hasContent(slots, props, 'error') || customErr.value !== '';

  if (props.requiredRev === true) {
    optionalTxt.value = (typeof props.optionalText === 'string' && props.optionalText.trim() !== '')
      ? ` (${props.optionalText.trim()})`
      : ' (optional)';
    requiredTxt.value = '';
  }
});

//  END:   Lifecycle events
// --------------------------------------------------
</script>

<style>
.data-report {
  display: none;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 0.05rem solid #eee;
}
.data-report th, .data-report td {
  border-bottom: 0.05rem solid #eee;
  padding: 0.5rem 0;
  vertical-align: top;
}
</style>
