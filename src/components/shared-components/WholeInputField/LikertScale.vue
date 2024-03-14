<template>
  <table class="likert-scale">
    <thead>
      <tr>
        <td>&nbsp;</td>
        <th
          v-for="option in options"
          :key="option.value"
          :id="`${fieldId}--${option.value}`">{{ option.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="q in localQs" :key="q.rowID">
        <th :id="q.rowID">
          {{ q.label }}
        </th>
        <td
          v-for="option in options"
          :key="option.value">
          <input
            :aria-labelledby="`${q.labeledBy}--${option.value}`"
            :checked="isChecked(option, localValues, q)"
            :data-fieldid="fieldId"
            :data-qid="q.id"
            :disabled="isDisabled"
            :id="getRadioID(q, option)"
            :name="q.name"
            :readonly="isReadonly"
            :required="isRequired"
            :tabindex="tabindex"
            type="radio"
            :value="option.value"
            v-on:blur="handleBlur($event)"
            v-on:change="handleChange($event)"
            v-on:focus="handleFocus($event)"
            class="visually-hidden" />
          <label class="radio-icon" :for="getRadioID(q, option)">
            {{ option.label }}
          </label>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { getEpre } from '../../../utils/general-utils';
import { multiFieldBlur } from '../../../utils/vue-utils';

const componentName = 'likert-scale';

// --------------------------------------------------
// START: Data types

/**
 * @typedef LikertOption
 * @type {object}
 * @property {string} value option's value to be sent back to the
 *                          server
 * @property {string} label option's human readable label
 */

/**
 * @typedef LikertQuestion
 * @type {object}
 * @property {string} id    Server side key for the response
 * @property {string} label Human readable label for the question
 */

/**
 * @typedef LikertQuestionLocal
 * @type {object}
 * @property {string} id        Server side key for the response
 * @property {string} label     Human readable label for the question
 * @property {string} name      Value to be use as the radio input
 *                              `name` attribute value
 * @property {string} rowID     ID for the question row
 * @property {string} labeledBy List of IDs to be added to the radio
 *                              input's `aria-labeldby`
 */

/**
 * User values supplied by the server and sent back to the server
 *
 * @typedef LikertValue
 * @type {{ [key: string]: string|number|null }} key/value pair where
 *                              the key is the question ID and the
 *                              value is the radio button value.
 */

/**
 * Data object emited whan one of the question values changes.
 *
 * @typedef LikertEvent
 * @type {object}
 * @property {string}      fieldId ID of the field that generated the
 *                                 event
 * @property {LikertValue} values  Current values of all Likert Scale
 *                                 inputs in this field
 */

//  END:  Data types
// --------------------------------------------------

const emit = defineEmits(['blur', 'change', 'lostfocus', 'invalid']);

// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * ID for the question group wrapper
   *
   * @property {string} fieldId
   */
  fieldId: { type: String, required: true },

  /**
   * Whether or not the fields are disabled
   *
   * @property {boolean} disabled
   */
  isDisabled: { type: Boolean, required: false, default: false },

  /**
   * Whether or not all the radio options in the likert scale should
   * be marked as read only
   *
   * @property {boolean} isRequired
   */
  isReadonly: { type: Boolean, required: false, default: false },

  /**
   * Whether or not user must select an option for each question
   *
   * @property {boolean} isRequired
   */
  isRequired: { type: Boolean, required: false, default: false },

  /**
   * String separated list of one or more IDs that help label this
   * field
   *
   * @property {string} labeledBy
   */
  labeledBy: { type: String, required: false, default: '' },

  /**
   * List of questions to display
   *
   * @property {LikertOption[]} questions
   */
  options: { type: Array, required: true },

  /**
   * List of questions to display
   *
   * @property {LikertQuestion[]} questions
   */
  questions: { type: Array, required: true },

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
   * User selected values
   *
   * @property {LikertValue[]} values
   */
  values: { type: Object, required: false, default: null },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

/**
 * A list key/value pairs where the key is the question ID and the
 * value is the user submitted or server supplied value for the
 * question.
 *
 * @property {object} localValues
 */
const ePre = ref(null);

const isBlured = ref(false);

/**
 * A list key/value pairs where the key is the question ID and the
 * value is the user submitted or server supplied value for the
 * question.
 *
 * @property {object} localValues
 */
const localValues = ref({});

/**
 * Enhanced list of strings for rendering question rows
 *
 * @property {LikertQuestionLocal[]} localQs
 */
const localQs = ref([]);

/**
 * List of question IDs that have already received focus
 *
 * @property {string[]} hadFocus
 */
const lostFocus = ref(false);

/**
 * A list key/value pairs where the key is the question ID and the
 * value boolean. TRUE if the answer is invalid. FALSE otherwise
 *
 *
 */
const invalidQs = ref({});
const qIDs = ref([]);
const timeoutID = ref(null);
const validOptions = ref([]);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const getRadioID = (q, option) => `${q.name}--${option.value}`;

/**
 * Get a unique ID for a question.
 *
 * Used to check whether a `focusout` event is actually moving away
 * from this group of questions.
 *
 * @param {string} qID
 */
const getLocalQId = (qID) => `${props.fieldId}--${qID}`;

const hasEmptyValues = () => {
  const keys = Object.keys(localValues.value);

  for (let a = 0; a < keys.length; a += 1) {
    if (localValues.value[keys[a]] === '' || localValues.value[keys[a]] === null) {
      return true;
    }
  }

  return false;
};

const hasInvalidValues = () => {
  const keys = Object.keys(invalidQs.value);

  for (let a = 0; a < keys.length; a += 1) {
    if (invalidQs.value[keys[a]] === true) {
      return true;
    }
  }

  return false;
};

const isChecked = (option, _localValues, q) => { // eslint-disable-line arrow-body-style
  return (option.value == _localValues[q.id]) // eslint-disable-line eqeqeq
    ? 'checked'
    : undefined;
};

const testInvalid = (forceTest = true) => {
  if (props.isRequired === true) {
    let output = false;

    if (lostFocus.value === true || forceTest === true) {
      output = hasEmptyValues();
    }

    if (output === false && forceTest === true) {
      output = hasInvalidValues();
    }

    emit('invalid', output);
  } else if (forceTest === true) {
    emit('invalid', hasInvalidValues());
  }
};

const optionIsInvalid = (value) => (validOptions.value.indexOf(value) === -1);

/**
 * Check a blur event to see if the likert scale radio buttons have
 * lost focus
 *
 * > __Note:__ This function uses settimeout() & clearTimeout() as a
 * >           hack to prevent a flash of error message, when the
 * >           user clicks on an option in one row of the Likert
 * >           Scale input, then clicks on an option in a different
 * >           row.
 *
 * @param {Event} event
 */
const handleBlur = (event) => {
  isBlured.value = true;

  if (typeof timeoutID.value === 'number') {
    // In case we have multiple blurs in quick succession we'll
    // clear the existing timeout
    clearTimeout(timeoutID.value);
  }

  // We are using the set timeout to delay emit `invalid` to ensure
  // that the user hasn't just switched between one Likert Scale row
  // and another
  timeoutID.value = setTimeout(
    () => {
      timeoutID.value = null;

      if (isBlured.value === true) {
        isBlured.value = false;
        const { lost } = multiFieldBlur(
          event,
          props.fieldId,
          emit,
          testInvalid,
          'radio',
          6,
        );

        lostFocus.value = lost;
      }
    },
    80,
  );
};

const handleChange = (event) => {
  const { value } = event.target;
  const qID = event.target.dataset.qid;

  if (optionIsInvalid(value) === true) {
    // eslint-disable-next-line no-console
    console.error(
      'LikertScale.handleChange() received an invalid value: '
      + `"${value}"`,
    );
    invalidQs.value[qID] = true;
  } else {
    // We have an expected value so let's keep going with
    // the validation.

    const tmp = { ...localValues.value };

    if (props.uniqueTwoD === true) {
      // Make sure every option is only used once

      const keys = Object.keys(tmp);

      for (let a = 0; a < keys.length; a += 1) {
        if (tmp[keys[a]] === value) {
          if (tmp[keys[a]] !== '') {
            invalidQs.value[keys[a]] = true;
          }

          tmp[keys[a]] = '';
          break;
        }
      }
    }

    tmp[qID] = value;
    invalidQs.value[qID] = false;

    localValues.value = tmp;

    emit('change', {
      fieldId: props.fieldId,
      values: localValues.value,
    });

    testInvalid(false);
  }
};

const handleFocus = () => {
  isBlured.value = false;
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre(componentName, props.fieldId);
  }

  if (qIDs.value.length === 0) {
    if (Array.isArray(props.questions) === false || props.questions.length === 0) {
      // throw new Error(
      console.error( // eslint-disable-line no-console
        'LikertScale component requires `question` attribute to be '
        + 'a non-empty array of objects containing a `id` property '
        + 'with a string value and a `label` property with a string '
        + 'value.',
      );
    } else {
      for (let a = 0; a < props.questions.length; a += 1) {
        if (typeof props.questions[a].id !== 'string'
          || typeof props.questions[a].label !== 'string'
          || props.questions[a].id.trim() === ''
          || props.questions[a].label.trim() === ''
        ) {
          console.error( // eslint-disable-line no-console
            'LikertScale component requires each item in the '
            + '`question` array to have a non-empty string '
            + '`id` property AND a non-empty string `label`. '
            + `Item ${a} does not meet these requirements`,
          );
        }
      }
    }

    validOptions.value = props.options.map((option) => option.value);
    const labedBy = (typeof props.labeledBy === 'string' && props.labeledBy.trim() !== '')
      ? `${props.labeledBy} `
      : '';

    if (labedBy === '') {
      console.warn( // eslint-disable-line no-console
        `LikertScale#${props.fieldId} does not have any external `
        + 'labels. This means that each question MUST make sense '
        + 'on its own and be unique page wide. '
        + '(i.e. you cannot use the same question in a different '
        + 'context)',
      );
    }

    const tmpValues = (props.values !== null)
      ? props.values
      : {};

    for (let a = 0; a < props.questions.length; a += 1) {
      const ID = props.questions[a].id;

      qIDs.value.push(getLocalQId(ID));

      if (typeof tmpValues[ID] !== 'undefined') {
        const isEmpty = tmpValues[ID] === '';
        localValues.value[ID] = tmpValues[ID];

        invalidQs.value[ID] = ((isEmpty === false && optionIsInvalid(tmpValues[ID]))
          || (props.isRequired === true && isEmpty === true));
      } else {
        localValues.value[ID] = '';
        invalidQs.value[ID] = false;
      }
    }

    if (props.questions !== null) {
      localQs.value = props.questions.map((question) => {
        const rowID = `${props.fieldId}--${question.id}`;

        return {
          ...question,
          rowID,
          name: `radio-${rowID}`,
          labeledBy: `${labedBy} ${rowID} ${props.fieldId}--`,
        };
      });
    }
  }
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>

<style lang="scss">
@import '../../../assets/scss/config';
// $white: #fff;
// $bright-blue: #0021ea;
// $field-borders: #8295ab;

.likert-scale {
  border: none;
  border-collapse: collapse;
  margin-bottom: 1rem;
  width: 100%;

  td, th {
    border: none;
    border-collapse: collapse;
    padding: 0.5rem 0.5rem;
    text-align: center;
  }

  tbody {
    th {
      font-weight: normal;
      padding-left: 0;
      text-align: left;
      // width: 100%;
    }
  }

  input {
    + .radio-icon {
      position: relative;
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      text-indent: -1000rem;
      border-radius: 10rem;

      &:hover {
        outline: 0.2rem solid $bright-blue;
        outline-offset: 0.2rem;
        cursor: pointer;
      }

      &::before, &::after {
        content: '';
        display: inline-block;
        // left: 50%;
        left: 0;
        position: absolute;
        // top: 50%;
        top: 0;
        border-radius: 10rem;
      }

      &::before {
        background-color: $white;
        border: 0.125rem solid $field-borders;
        box-sizing: border-box;
        content: '';
        display: inline-block;
        height: 1.5rem;
        width: 1.5rem;
      }

      &::after {
        display: inline-block;
        background-color: $bright-blue;
        height: 0.75rem;
        opacity: 0;
        transition: opacity ease-in-out 0.3s;
        width: 0.75rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    &:focus {
      + .radio-icon {
        outline: 0.1rem solid $bright-blue;
        outline-offset: 0.1rem;
      }
    }

    &:checked {
      + .radio-icon {
        &::after {
          opacity: 1;
        }
      }
    }
  }
}
</style>
