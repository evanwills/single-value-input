<template>
  <ul
    v-if="renderType === 'radio'"
    class="checkable-group"
    role="group"
    :aria-labelledby="fieldId">
    <li v-for="(option, i) of usableOptions" v-bind:key="i">
      <input
        :aria-describedby="getDescribedbyIDs"
        :checked="isSelected(option)"
        class="visually-hidden"
        :disabled="disabledOption(option, isDisabled)"
        :id="option.id"
        :name="radioName"
        :readonly="readonlyAttr"
        :required="requiredAttr"
        :tabindex="tabIndex"
        :type="type"
        :value="option.value"
        v-on:blur="radioBlur($event)"
        v-on:change="radioChanged($event)" />
      <label :for="option.id" :class="radioClass">{{ option.label }}</label>
    </li>
  </ul>

  <span v-else :class="selectClass">
    <select
      :id="fieldId"
      :aria-describedby="getDescribedbyIDs"
      :disabled="disabledAttr"
      :readonly="readonlyAttr"
      :required="requiredAttr"
      :tabindex="tabIndex"
      v-on:change="selectChanged($event)"
      v-on:blur="selectChanged($event)">
      <option
        v-for="(option) of usableOptions"
        :disabled="disabledOption(option, isDisabled)"
        :selected="isSelected(option)"
        :value="option.value"
        v-bind:key="option.value">
        {{ option.label }}
      </option>
    </select>
  </span>
</template>

<script setup>
// Because `RadioSelectInput` is always intended to be used within
// `WholeInputField` not including the label here is acceptable.
/* eslint vuejs-accessibility/form-control-has-label: off */

import {
  ref,
  computed,
  onBeforeMount,
  onMounted,
  onUpdated,
} from 'vue';
import {
  disabledOption,
  normaliseOptions,
  removeEmptyFilter,
  setOptionIDs,
} from './radio-select.utils';
import { getEpre } from '../../../utils/general-utils';
import { multiFieldBlur } from '../../../utils/vue-utils';

//  END:  component props
// --------------------------------------------------------
// START: define emitted events

const emit = defineEmits(['blur', 'change', 'focus', 'invalid', 'keyup', 'lostfocus']);

//  END:  define emitted events
// --------------------------------------------------------
// START: component props

const props = defineProps({
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
   * Whether or not the field is readonly
   * (i.e. user is prevented from interacting with the field)
   *
   * @property {boolean} isReadonly
   */
  isReadonly: { type: Boolean, required: false, default: false },

  /**
   * Whether or not the field requres a non-empty value
   *
   * @property {boolean} isRequired
   */
  isRequired: { type: Boolean, required: false, default: false },

  /**
   * When the options for .valueitem were last updated
   *
   * > __Note:__ If lastUpdated is not set, this field will not
   * >           update the options if changed by the parent.
   *
   * @property {number} lastUpdated
   */
  lastUpdated: { type: Number, requred: false, default: -1 },

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

  /**
   * Type of field being rendered
   *
   * Options are:
   * * `select` (default)
   * * `radio`
   * * `combobox` (also, known as typeahead)
   *
   * @property {string} type
   */
  type: { type: String, required: false, default: 'select' },

  /**
   * Predefined value for the field.
   *
   * @property {string|number|undefined} value
   */
  value: { required: true },
});

//  END:  component props
// --------------------------------------------------------
// START: local state

const comboValue = ref('');

/**
 * Current value of the field
 *
 * @property {string} currentValue
 */
const currentValue = ref('');

/**
 * Get the start of an error message (or console group name) string
 * for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
const ePre = ref(null); // eslint-disable-line no-unused-vars

/**
 * List of options filtered by existing string in text input
 *
 * @property {string[]}
 */
const filteredOptions = ref([]);

/**
 * Whether or not the current user submitted value is valid
 *
 * (i.e. is not empty and is one of the known values provided
 * when the component was mounted)
 *
 * @property {boolean} invlid
 */
const invalid = ref(false);

/**
 * Timestamp for when data was last received from the server
 *
 * @var {number}
 */
const localLastUpdated = ref(0);

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
const renderType = ref('select');

/**
 * value to add to the checked/selected attribute of a
 * <SELECT>/<INPUT type="checkbox" /> element;
 *
 * Options are:
 * * "selected" (default)
 * * "checked"
 *
 * @property {string} selectStr
 */
const selectStr = ref('selected');

/**
 * List of options to be rendered
 *
 * Each option object has the following properties
 *
 * @property {Object[]}
 */
const usableOptions = ref([]);

/**
 * Whether or not to render the empty option for <SELECT>
 * fields
 *
 * Only ever true if `no-non-empty` is set and the `value`
 * attribute on this component is an empty string
 *
 * @property {boolean} useEmpty
 */
const useEmpty = ref(false);

/**
 * The name of the attribute used to indicate the preset value
 * for the field
 *
 * * For <SELECT> field the correct attribute is `selected`
 * * For <INPUT type="radio"> the correct attribute is `checked`
 *
 * @property {string} valueAttr
 */
const valueAttr = ref('selected');

//  END:  local state
// --------------------------------------------------------
// START: computed properties

/**
 * Sets the disabled attribute on field
 *
 * @returns {true|undefined}
 */
const disabledAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (props.isDisabled === true)
    ? true
    : undefined;
});

// /**
//  * Get the ID for the error element
//  *
//  * @returns {string}
//  */
// const errorID = computed(() => `${props.fieldId}--error`);

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
const radioClass = computed(() => {
  const base = 'checkable-group__label';
  const output = `${base} ${base}--${props.type}`;

  return (currentValue.value === '')
    ? `${output} ${base}--empty`
    : output;
});

/**
 * Get the value of the `name` attribute for all radio inputs
 * in the group
 *
 * @returns {string}
 */
const radioName = computed(() => { // eslint-disable-line arrow-body-style
  return (props.type === 'radio')
    ? `${props.fieldId}-radio`
    : undefined;
});

/**
 * Sets the readonly attribute on field
 *
 * @returns {true|undefined}
 */
const readonlyAttr = computed(() => { // eslint-disable-line arrow-body-style
  return (props.isReadonly === true)
    ? true
    : undefined;
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

/**
 * Get the class to use on the label for the select field
 *
 * @returns {string}
 */
const selectClass = computed(() => {
  const base = 'tsf-select';

  let output = (props.required === true)
    ? `${base} ${base}--required`
    : base;

  if (renderType.value === 'combo') {
    output += ` ${base}--combo`;
  }

  return (invalid.value === true)
    ? `${output} ${base}--error`
    : output;
});

//  END:  computed properties
// --------------------------------------------------------
// START: local methods

const getLabels = (option) => option.label;

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
const handleChangeShared = (e, newVal) => {
  const oldVal = currentValue.value;

  if (typeof newVal === 'string') {
    currentValue.value = newVal;
  }

  invalid.value = (
    (props.isRequired === true
    && (typeof currentValue.value !== 'string' || currentValue.value === ''))
    || newVal === false
  );

  emit('invalid', invalid.value);

  if (oldVal !== currentValue.value) {
    emit('change', e);
  } else if (e.type === 'blur') {
    emit('blur', e);
  }
};

/**
 * determine if an option has been chosen
 *
 * @param {{key: string|number, value: string}} option single select/radio
 */
const isSelected = (option) => { // eslint-disable-line arrow-body-style
  return (option.value == props.value) // eslint-disable-line eqeqeq
    ? selectStr.value
    : undefined;
};

/**
 * Set the current/default value
 * (i.e. the value that's come from the server)
 */
const validateCurrentValue = () => {
  // Make sure initial value is one of the allowed options
  if (typeof currentValue.value !== 'string' || currentValue.value === '') {
    let ok = false;

    for (let a = 0; a < usableOptions.value.length; a += 1) {
      if (usableOptions.value[a].value === currentValue.value) {
        // All good! We found a match
        if (props.type === 'combobox') {
          comboValue.value = usableOptions.value[a].label;
        }
        ok = true;
        break;
      }
    }

    if (ok === false) {
      // Lets check whether the initial value matches a label
      // string instead of the value
      for (let a = 0; a < usableOptions.value.length; a += 1) {
        if (usableOptions.value[a].label === currentValue.value) {
          // All good! We found a match
          currentValue.value = usableOptions.value[a].value;
          if (props.type === 'combobox') {
            comboValue.value = usableOptions.value[a].label;
          }
          ok = true;
          break;
        }
      }
    }

    if (ok === false) {
      // Could not find a valid match so make current value
      // empty.
      currentValue.value = '';
    }

    emit('invalid', currentValue.value === '');
  }
};

/**
 * Validate new value from last user interaction
 *
 * @returns {string|false} String if new value is valid,
 *                         FALSE otherwise.
 */
const validateValue = (val) => {
  for (let a = 0; a < usableOptions.value.length; a += 1) {
    if (usableOptions.value[a].value === val) {
      // make sure there's no funny business going on and that
      // the selected value is valid
      return val;
    }
  }

  return false;
};

/**
 * Check a blur event to see if the likert scale radio buttons have
 * lost focus
 *
 * @param {Event} event
 */
const radioBlur = (event) => {
  emit(event.type, event);
  multiFieldBlur(event, props.fieldId, emit, validateCurrentValue);
};

/**
 * Handle changes to radio or select input fields
 *
 * @param {Event} event
 */
const radioChanged = (event) => {
  const newVal = (event.target.checked === true)
    ? validateValue(event.target.value)
    : true;

  handleChangeShared(event, newVal);
};

/**
 * Handle changes to <SELECT> fields
 *
 * @param {Event} event
 */
const selectChanged = (event) => {
  handleChangeShared(event, validateValue(event.target.value));

  if (currentValue.value.trim() !== '' && props.noNonEmpty === true) {
    usableOptions.value = usableOptions.value.filter(removeEmptyFilter);
  }
};

/**
 * Make option list usable for <SELECT> and/or <INPUT type="radio" />
 *
 * Normalise key/value pairs
 */
const setUsableOptions = () => {
  // Make sure options are useable
  let options = normaliseOptions(
    props.options,
    currentValue.value,
    props.dedupe,
  );

  options = (useEmpty.value === true)
    ? [{ value: '', label: props.emptyTxt }, ...options]
    : options;

  // Give each radio option a unique ID
  usableOptions.value = (renderType.value === 'radio')
    ? options.map(setOptionIDs(props.fieldId))
    : options;

  if (renderType.value === 'combo') {
    // show all the options available until user starts typing
    filteredOptions.value = usableOptions.value.map(getLabels);
  }
};

//  END:  local methods
// --------------------------------------------------------
// START: Lifecycle handlers

onBeforeMount(() => {
  if (localLastUpdated.value === 0) {
    localLastUpdated.value = props.lastUpdated;
  }

  ePre.value = getEpre('RadioSelectInput', props.fieldId);

  // Get the data type of the supplied default value
  switch (typeof props.value) {
    case 'string':
      currentValue.value = props.value;
      break;
    case 'number':
      currentValue.value = props.value.toString();
      break;
    default:
      currentValue.value = '';
  }

  if (typeof props.type === 'string') {
    const type = props.type.replace(/[^a-z]+/ig, '').toLowerCase();

    if (type === 'radio' || type === 'select') {
      selectStr.value = (type === 'radio')
        ? 'checked'
        : 'selected';
      renderType.value = type;
    } else if (type.includes('type') || type.includes('search') || type.includes('combo')) {
      renderType.value = 'combo';
    }
  }

  useEmpty.value = (renderType.value === 'select'
    && (props.noNonEmpty === false || currentValue.value === ''));

  // Get the string value for the selected item.
  valueAttr.value = (renderType.value === 'radio')
    ? 'checked'
    : 'selected';

  setUsableOptions();
  validateCurrentValue();
});

onMounted(() => {
  // emit('input', this.selected);
  if (validateValue(currentValue.value) === false) {
    emit('invalid', invalid.value);
  }
});

onUpdated(() => {
  if (localLastUpdated.value < props.lastUpdated) {
    localLastUpdated.value = props.lastUpdated;

    setUsableOptions();
    validateCurrentValue();
  }
});

//  END:  Lifecycle handlers
// --------------------------------------------------------
</script>
