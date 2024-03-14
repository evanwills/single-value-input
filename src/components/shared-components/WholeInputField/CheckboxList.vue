<template>
  <ul
    class="checkable-group"
    role="group"
    :aria-labelledby="fieldId">
    <li v-for="(option, i) of usableOptions" v-bind:key="i">
      <input
        :aria-describedby="getDescribedbyIDs"
        :checked="option.default"
        class="visually-hidden"
        :disabled="option.disabled || option.maxedOut || isDisabled"
        :id="option.id"
        :readonly="isReadonly"
        :required="requiredAttr"
        :tabindex="tabIndex"
        type="checkbox"
        :value="option.value"
        v-on:change="checkboxChange($event)"
        v-on:blur="handleBlur($event)" />
      <label :for="option.id" :class="checkboxClass">{{ option.label }}</label>
    </li>
  </ul>
</template>

<script setup>
import {
  ref,
  computed,
  onBeforeMount,
  // onMounted,
  onUpdated,
} from 'vue';
import { normaliseOptions, setOptionIDs } from './radio-select.utils';
import { getEpre } from '../../../utils/general-utils';
import { multiFieldBlur } from '../../../utils/vue-utils';

// --------------------------------------------------
// START: Emitted events

const emit = defineEmits([
  'blur',
  'change',
  'checkedchange',
  'focus',
  'invalid',
  'keyup',
  'lostfocus',
  'maxedout',
]);

//  END:   Emitted events
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * Whether or not to remove duplicate options from options list.
   *
   * @property {boolean} dedupe
   */
  dedupe: { type: Boolean, required: false, default: false },

  /**
   * Whether or not to prevent select additional options after
   * maximum have been selected
   *
   * @property {boolean} disableAfterMax
   */
  disableAfterMax: { type: Boolean, required: false, default: false },

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
   * When the parent/client component was last updated (or when it
   * last received data from the server)
   *
   * @property {number} lastUpdated
   */
  lastUpdated: { type: Number, required: false, default: 0 },

  /**
   * Maximum number of items in the list user check
   *
   * @property {number} maxLength
   */
  maxLength: { required: false, default: -1 },

  /**
   * Minimum number of items in the list user check
   *
   * @property {number} minLength
   */
  minLength: { required: false, default: -1 },

  /**
   * If data from the server has null values for each checkbox item,
   * Make null options FALSE after the first checkbox is checked
   *
   * @property {boolean} nullToFalse
   */
  nullToFalse: { type: Boolean, required: false, default: false },

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
   * >       on the field, instead the browser's default
   * >       tabbing order will be used
   * @property {number} tabIndex
   */
  tabIndex: { type: Number, required: false, default: 0 },
});

//  END:   Properties/attributes
// --------------------------------------------------
// START: Local state

/**
 * Current value of the field
 *
 * @property {string} current
 */
const current = ref({});

/**
 * A function that returns the start of an error message
 * (or console.group name) string for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
const ePre = ref(null);

/**
 * Whether or not the current user submitted value is valid
 *
 * (i.e. is not empty and is one of the known values provided
 * when the component was mounted)
 *
 * @property {boolean} invalid
 */
const invalid = ref(false);

/**
 * Whether or not maximum number of options has already been checked
 *
 * @property {boolean} isMaxed
 */
const isMaxed = ref(false);

/**
 * When the options list was last updated
 *
 * @property {number}
 */
const localLastUpdated = ref(0);

/**
 * The minimum number of options the user must check
 *
 * > __Note:__ If the group is required, the minimum number
 * >           will be forced to 1 if it's not already higher.
 *
 * @property {number}
 */
const minChecked = ref(0);

/**
 * The minimum number of options the user must check
 *
 * > __Note:__ If the group is required, the minimum number
 * >           will be forced to 1 if it's not already higher.
 *
 * @property {number}
 */
const maxChecked = ref(-1);

/**
 * Whether or not NULL values have been converted to false
 */
const noNull = ref(false);

/**
 * List of options to be rendered
 *
 * Each option object has the following properties
 *
 * @property {Object[]}
 */
const usableOptions = ref([]);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

/**
 * Get the help IDs (as provided by the client) to render in the
 * `aria-describedby` attribute
 *
 * @returns {string|undefined}
 */
const getDescribedbyIDs = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.helpIds === 'string' && props.helpIds.trim() !== '')
    ? props.helpIds
    : undefined;
});

/**
 * Get the class to use on the wrapper for the select field
 *
 * @returns {string}
 */
const checkboxClass = computed(() => {
  const base = 'checkable-group__label';
  const output = `${base} ${base}--checkbox`;

  return (current.value === '')
    ? `${output} ${base}--empty`
    : output;
});

/**
 * Sets the required attribute on field
 *
 * @returns {true|undefined}
 */
const requiredAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (props.isRequired === true)
    ? true
    : undefined;
});

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const validateOptions = () => {
  const keys = Object.keys(current.value);
  let c = 0;

  for (let a = 0; a < keys.length; a += 1) {
    if (current.value[keys[a]] === true) {
      c += 1;
    }
  }

  isMaxed.value = maxChecked.value > -1 && c >= maxChecked.value;

  invalid.value = (c < minChecked.value
    || (maxChecked.value > -1 && c > maxChecked.value));

  if (props.disableAfterMax === true && isMaxed.value === true) {
    let a = 0;
    usableOptions.value = usableOptions.value.map((option) => {
      if (current.value[option.value] === true) {
        a += 1;
      }
      return {
        ...option,
        maxedOut: (!current.value[option.value] || a > maxChecked.value),
      };
    });
  }

  emit('maxedout', isMaxed.value);
  emit('invalid', invalid.value);
};

/**
 * Check a blur event to see if the likert scale radio buttons have
 * lost focus
 *
 * @param {Event} event
 */
const handleBlur = (event) => {
  multiFieldBlur(event, props.fieldId, emit, validateOptions, 'checkbox');
};

/**
 * Handle changes to radio or select input fields
 *
 * @param {Event} e
 */
const checkboxChange = (e) => {
  const key = e.target.value;

  if (typeof current.value[key] !== 'boolean' && current.value[key] !== null) {
    throw new Error(
      `${ePre.value('checkboxChange')} cannot set current value for "${key}"`,
    );
  }

  current.value[key] = (e.target.checked === true);

  if (props.nullToFalse === true && noNull.value === false) {
    // Loop through options and make anything that is null false
    noNull.value = true;
    const keys = Object.keys(current.value);

    for (let a = 0; a < keys.length; a += 1) {
      if (current.value[keys[a]] === null) {
        current.value[keys[a]] = false;
      }
    }
  }

  validateOptions();

  emit('checkedchange', current.value);
  emit(e.type, e);
};

/**
 * Make option list usable for <SELECT> and/or <INPUT type="radio" />
 *
 * Normalise key/value pairs
 */
const setUsableOptions = () => {
  // Make sure options are useable
  const options = normaliseOptions(
    props.options,
    'XXXX',
    props.dedupe,
  );

  // Give each radio option a unique ID
  usableOptions.value = options.map(setOptionIDs(props.fieldId));
  for (let a = 0; a < usableOptions.value.length; a += 1) {
    current.value[usableOptions.value[a].value] = usableOptions.value[a].default;
  }
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle events

onBeforeMount(() => {
  if (localLastUpdated.value === 0) {
    localLastUpdated.value = props.lastUpdated;
  }

  ePre.value = getEpre(props.fieldId);
  const tmp = ePre.value('beforeMount');

  if (typeof props.minLength !== 'undefined' && props.minLength !== null && props.minLength > -1) {
    minChecked.value = parseInt(props.minLength, 10);

    if (Number.isNaN(minChecked.value) || minChecked.value < 0) {
      console.error( // eslint-disable-line no-console
        `${tmp} expects attribute \`min-length\` to be a positive integer`,
      );
    }
  }

  if (typeof props.maxLength !== 'undefined' && props.maxLength !== null && props.maxLength > -1) {
    maxChecked.value = parseInt(props.maxLength, 10);

    if (Number.isNaN(maxChecked.value) || maxChecked.value < 0) {
      console.error( // eslint-disable-line no-console
        `${tmp} expects attribute \`max-length\` to be a positive integer`,
      );
    }
  }

  if (props.isRequired === true && minChecked.value === 0) {
    minChecked.value = 1;
  }

  setUsableOptions();

  if (usableOptions.value.length < 1) {
    console.error( // eslint-disable-line no-console
      `${tmp} expects at least one checkbox item. No options provided`,
    );
  }

  if (maxChecked.value >= usableOptions.value.length) {
    console.warn( // eslint-disable-line no-console
      `${tmp} maximum number of checked options matched or `
      + 'exceeded available options so maximum is now unlimited',
    );
    maxChecked.value = -1;
  } else if (maxChecked.value > -1 && maxChecked.value < minChecked.value) {
    console.error( // eslint-disable-line no-console
      `${tmp} Invalid value for max-length or min-length. `
      + `max-length (${maxChecked.value}) must be greater than `
      + `min-length (${minChecked.value})`,
    );
  }
});

// mounted() {
// },

onUpdated(() => {
  if (localLastUpdated.value < props.lastUpdated) {
    localLastUpdated.value = props.lastUpdated;

    setUsableOptions();
    validateOptions();
  }
});

//  END:   Lifecycle events
// --------------------------------------------------
</script>
