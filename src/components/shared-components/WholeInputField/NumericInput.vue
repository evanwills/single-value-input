<template>
  <span>
    <span class="numeric-input">
      <input
        :describedBy="describedBy"
        :disabled="disabled"
        :id="fieldId"
        :min="_min"
        :max="_max"
        :step="_step"
        :pattern="_pattern"
        :placeholder="_placeholder"
        :required="required"
        :readonly="readonly"
        ref="numinput"
        :tabindex="tabindex"
        type="number"
        :value="currentValue"
        v-on:blur="inputBlur($event)"
        v-on:change="inputChange($event)"
        v-on:keyup="inputChange($event)" />
      <button
        :id="_decrementBtnID"
        :title="btnTitle('Decrease')"
        type="button"
        value="-"
        v-on:blur="inputBlur($event)"
        v-on:click="btnClick($event)">
        <span class="material-icons">remove</span>
      </button>
      <button
        :id="_incrementBtnID"
        :title="btnTitle('Increase')"
        type="button"
        value="+"
        v-on:blur="inputBlur($event)"
        v-on:click="btnClick($event)">
        <span class="material-icons">add</span>
      </button>
    </span>
  </span>
</template>

<script setup>
/* eslint vuejs-accessibility/form-control-has-label: off */
import { computed, onBeforeMount, ref } from 'vue';
import { getEpre } from '../../../utils/general-utils';
import { multiFieldBlur } from '../../../utils/vue-utils';

// --------------------------------------------------
// START: Data types

//  END:  Data types
// --------------------------------------------------
// START: Component config

const componentName = 'numeric-input';

const emit = defineEmits(['blur', 'change', 'invalid']);

//  END:  Component config
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  describedBy: { type: String, required: false, default: '' },
  disabled: { type: Boolean, required: false, default: false },
  fieldId: { type: String, required: true },
  labeledBy: { type: String, required: false, default: '' },
  lastUpdated: { type: Number, required: false, default: 0 },
  min: { type: Number, required: false, default: null },
  max: { type: Number, required: false, default: null },
  pattern: { type: String, required: false, default: '' },
  placeholder: { type: String, required: false, default: '' },
  required: { type: Boolean, required: false, default: false },
  readonly: { type: Boolean, required: false, default: false },
  step: { type: Number, required: false, default: 1 },
  tabindex: { type: Number, required: false, default: 0 },
  value: { required: false, default: '' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const ePre = ref(null);
const inputStep = ref(null);
const lostFocus = ref(false);
const invalid = ref(false);
const minNum = ref(null);
const maxNum = ref(null);
const rounder = ref(1);
const currentValue = ref('');
const numinput = ref(null);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

const _min = computed(() => { // eslint-disable-line arrow-body-style
  return (minNum.value !== null)
    ? minNum.value
    : undefined;
});

const _max = computed(() => { // eslint-disable-line arrow-body-style
  return (maxNum.value !== null)
    ? maxNum.value
    : undefined;
});

const _step = computed(() => { // eslint-disable-line arrow-body-style
  return (inputStep.value !== null)
    ? inputStep.value
    : undefined;
});

const _pattern = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.pattern === 'string' && props.pattern.trim() !== '')
    ? props.pattern
    : undefined;
});

const _placeholder = computed(() => { // eslint-disable-line arrow-body-style
  return (typeof props.placeholder === 'string' && props.placeholder.trim() !== '')
    ? props.placeholder
    : undefined;
});

const _incrementBtnID = computed(() => `${props.fieldId}--increment-btn`);

const _decrementBtnID = computed(() => `${props.fieldId}--decrement-btn`);

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const roundToStep = (input) => Math.round(input * rounder.value) / rounder.value;

const btnClick = (event) => {
  const target = (event.target.nodeName === 'BUTTON')
    ? event.target
    : event.target.parentNode;

  // Get the right increment value
  const inc = (target.value === '+')
    ? inputStep.value
    : inputStep.value * -1;

  // Make sure that the initial value is a number;
  let currrentV = currentValue.value;

  if (currrentV === null) {
    currrentV = 0;
  } else if (typeof currrentV === 'string') {
    currrentV = (currrentV === '')
      ? 0
      : parseFloat(currentValue.value, 10);
  }

  const output = roundToStep(currrentV + inc);

  if (minNum.value !== null && output < minNum.value) {
    currentValue.value = minNum.value;
  } else if (maxNum.value !== null && output > maxNum.value) {
    currentValue.value = maxNum.value;
  } else {
    currentValue.value = output;
  }

  emit('invalid', !target.validity.valid);
  emit('change', currentValue.value);
};

const btnTitle = (dir) => `${dir} by ${inputStep.value}`;

const inputChange = (event) => {
  const { value } = event.target;

  currentValue.value = roundToStep(value);

  emit('invalid', !event.target.validity.valid);
  emit(event.type, currentValue.value);
};

const testInvalid = () => {
  const isNull = (currentValue.value === '' || currentValue.value === null);

  if (props.required === true && isNull === true) {
    invalid.value = true;
  } else {
    invalid.value = (isNull === false
      && ((minNum.value !== null && currentValue.value < minNum.value)
      || (maxNum.value !== null && currentValue.value > maxNum.value)));
  }

  emit('invalid', invalid.value);
};

const inputBlur = (event) => {
  const { lost } = multiFieldBlur(
    event,
    props.fieldId,
    emit,
    testInvalid,
    'number',
    0,
    ['input', 'BUTTON'],
  );

  lostFocus.value = lost;
};

const sanitiseNum = (input) => {
  const minT = typeof input;

  if (minT === 'number') {
    return input;
  }

  if (minT === 'string' && input.trim() !== '') {
    return parseFloat(input);
  }

  return null;
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  if (ePre.value === null) {
    ePre.value = getEpre(componentName, props.fieldId);
  }
  currentValue.value = (typeof props.value === 'string' && props.value !== '')
    ? parseInt(props.value, 10)
    : props.value;

  minNum.value = sanitiseNum(props.min);
  maxNum.value = sanitiseNum(props.max);
  inputStep.value = sanitiseNum(props.step);

  rounder.value = (inputStep.value !== null)
    ? 1 / inputStep.value
    : 1;
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>

<style lang="scss">
.numeric-input {
  align-items: flex-start;
  display: flex !important;
  // column-gap: 0.5rem;
  margin-right: -0.25rem;

  input {
    /* -moz-appearance: textfield; */
    appearance: textfield;
    border: none;
    display: inline-block;
    flex-grow: 1;
    font-size: inherit;
    padding: 0;
    line-height: 1.75rem;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
      display: none;
      opacity: 0;
    }

    &:focus {
      outline: none;
    }
  }

  button {
    border: none;
    display: inline-block;
    background-color: transparent;
    font-weight: bold;
    height: 4rem;
    line-height: 1.5rem;
    margin: -1rem 0 -1.1rem;
    padding: 0;
    text-align: center;
    width: 3.25rem;

    .material-icons {
      font-size: 2rem;
    }

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
