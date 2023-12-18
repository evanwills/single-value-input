<template>
  <table class="likert-scale">
    <thead>
      <tr>
        <td>&nbsp;</td>
        <th
          v-for="option in options"
          :key="option.value"
          :id="`${props.fieldId}--${option.value}`">{{ option.label }}</th>
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
            :checked="option.value === localValues[q.id]"
            :data-quid="q.id"
            :disabled="idDisabled"
            :id="`${q.name}--${option.value}`"
            :name="q.name"
            :readonly="isReadonly"
            :required="isRequired"
            :tabindex="tabindex"
            type="radio"
            :value="option.value"
            v-on:change="handleChange($event)"
            class="visually-hidden" />
          <label class="radio-icon" :for="`${q.name}--${option.value}`">
            {{ option.label }}
          </label>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';

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
 * @type {object}
 * @property {string} id    Server side key for the response
 * @property {string} value Human readable label for the question
 */

const emit = defineEmits(['blur', 'change', 'invalid']);

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
   * User selected values
   *
   * @property {LikertValue[]} values
   */
  values: { type: Object, required: false, default: null },

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
});

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
const hadFocus = ref([]);

/**
 * A list key/value pairs where the key is the question ID and the
 * value boolean. TRUE if the answer is invalid. FALSE otherwise
 *
 *
 */
const invalidQs = ref({});
const qIDs = ref([]);
const validOptions = ref([]);

const hasEmptyValues = () => {
  const keys = Object.keys(localValues.value);
  for (let a = 0; a < keys.length; a += 1) {
    if (localValues.value[keys[a]] === '') {
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

const testInvalid = (forceTest = false) => {
  if (props.isRequired === true) {
    let output = false;

    if (hadFocus.value.length === props.questions.length || forceTest === true) {
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

const setHadFocus = (id) => {
  if (hadFocus.value.indexOf(id) === -1) {
    // This one hasn't had focus before.
    hadFocus.value.push(id);
  }
};

const optionIsInvalid = (value) => (validOptions.value.indexOf(value) === -1);

const handleChange = (event) => {
  const { value } = event.target;
  const qID = event.target.dataset.quid;

  if (optionIsInvalid(value) === true) {
    throw new Error(
      'LikertScale.handleChange() received an invalid value: '
      + `"${value}"`,
    );
  }

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

  setHadFocus(qID);

  tmp[qID] = value;
  invalidQs.value[qID] = false;

  localValues.value = tmp;

  emit('change', localValues.value);
  testInvalid();
};

/**
 * Get a unique ID for a question.
 *
 * Used to check whether a `focusout` event is actually moving away
 * from this group of questions.
 *
 * @param {string} qID
 */
const getLocalQId = (qID) => `${props.fieldId}--${qID}`;

onBeforeMount(() => {
  if (qIDs.value.length === 0) {
    if (Array.isArray(props.questions) === false || props.questions.length === 0) {
      // throw new Error(
      console.error(
        'LikertScale component requires `question` attribute to be '
        + 'a non-empty array of objects containing a `id` property '
        + 'with a string value and a `label` property with a string '
        + 'value.',
      );
    } else {
      for (let a = 0; a < props.questions.length; a += 1) {
        if (typeof props.question[a].id !== 'string'
          || typeof props.question[a].label !== 'string'
          || props.questions[a].id.trim() === ''
          || props.questions[a].label.trim() === ''
        ) {
          // throw new Error(
          console.error(
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
        const isEmpty = tmpValues[ID] !== '';
        localValues.value[ID] = tmpValues[ID];

        invalidQs.value[ID] = ((isEmpty === false && optionIsInvalid(tmpValues[ID]))
          || (props.isRequired === true && isEmpty === true));
      } else {
        localValues.value[ID] = '';
        invalidQs.value[ID] = false;
      }
    }

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
});
</script>

<style lang="scss">
@import '../../../assets/scss/config';
// $white: #fff;
// $tsf-bright-blue: #0021ea;
// $tsf-field-borders: #8295ab;

.likert-scale {
  border: 0.05rem solid #eee;
  border-collapse: collapse;

  td, th {
    border: 0.05rem solid #eee;
    border-collapse: collapse;
    padding: 0.5rem 1rem;
  }

  tbody {
    th {
      text-align: left;
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
        outline: 0.2rem solid $tsf-bright-blue;
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
        border: 0.125rem solid $tsf-field-borders;
        box-sizing: border-box;
        content: '';
        display: inline-block;
        height: 1.5rem;
        width: 1.5rem;
      }

      &::after {
        display: inline-block;
        background-color: $tsf-bright-blue;
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
        outline: 0.1rem solid $tsf-bright-blue;
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
