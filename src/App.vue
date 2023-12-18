<template>
  <ul>
    <!-- -->
    <WholeInputField
      error-msg="Bad user input"
      field-id="text-field"
      help-txt="This is some useful info about 'First field'"
      label="Basic text field"
      required
      type="text" />
    <WholeInputField
      error-msg="Please enter a valid password"
      field-id="password-field"
      label="Password"
      no-toggle
      required
      type="password">
      <template #help>
        <p>
          You need to enter your current password to change it.
          If you're not sure what your password is, you can
          <a href="https://www.thesmithfamily.com.au/forgot-password">
            reset your password
          </a>
          via email.
        </p>
      </template>
    </WholeInputField>
    <WholeInputField
      :custom-validation="validPasswd"
      error-msg="Please enter a valid password"
      field-id="password2-field"
      help-txt="Please enter a password with at least 8 characters and no more than 32 characters. Your password must include at least one number and or special character"
      help-first
      label="Password"
      min-length="8"
      max-length="32"
      required
      type="password" />
    <WholeInputField
      error-msg="Must be a number between 10 and 40"
      field-id="number-field"
      help-txt="Pick a number, any number"
      min-length="8"
      max-length="32"
      label="Number field"
      required
      type="number" />
    <WholeInputField
      field-id="date-field"
      label="Date (only) field label"
      min-val="1979-01-29T09:00:00+12:00"
      max-val="2028-11-16T15:10:00+11:00"
      type="date"
      required
      error-msg="Please enter today's date" />
    <WholeInputField
      field-id="bad-date-field"
      label="Bad Date (only) field label"
      required
      type="date" />
    <WholeInputField
      field-id="datetime-field"
      label="Date-time field label"
      min-val="1979-01-29T09:00:00+12:00"
      max-val="2028-11-16T15:10:00+11:00"
      type="datetime-local" />
    <WholeInputField
      field-id="time-field"
      label="Date-time field label"
      type="datetime-local" />
    <WholeInputField
      field-id="time-field"
      label="Time of day field"
      min-val="08:30:00"
      max-val="17:30:00"
      required
      type="time">
      <template #error>
        <p>
          This some funcky error message with a
          <a href="https://vuejs.org/guide/components/slots.html">link</a>
        </p>
      </template>
      <template #help>
        <p>
          Our office hours are between 8:30am and 5:30pm
          <a href="https://vuejs.org/guide/components/slots.html">link</a>
        </p>
      </template>
    </WholeInputField>
    <WholeInputField
      field-id="range-field"
      label="Range field label"
      type="range" />
    <WholeInputField
      field-id="colour-field"
      label="Choose a colour"
      type="color" />
    <WholeInputField
      error-msg="Please tell us somethings"
      field-id="textarea-field"
      label="Textarea field label"
      required
      type="textarea" />
    <WholeInputField
      field-id="radio-field"
      label="Radio list group label"
      error-msg="Please choose an option"
      type="radio"
      required
      :options="multiOptions" />
    <WholeInputField
      error-msg="Please choose an option"
      field-id="radio-field-default"
      label="Radio list group label"
      :options="multiOptions"
      required
      type="radio"
      value="2" />
    <WholeInputField
      empty-txt="-- please choose --"
      error-msg="Please choose an option"
      help-txt="This help text goes first"
      field-id="select-field"
      help-first
      label="Select field label"
      :options="multiOptions"
      required
      type="select" />
    <!-- -->
    <WholeInputField
      :combo-label-getter="getPickleLabel"
      error-msg="Please choose an option"
      field-id="conbo-field-default"
      label="What's your favourite option"
      :options-getter="getPickle"
      required
      type="combobox"
      value="Evan">
      <template #help>
        <p>We need to know your favourite option so we can try and give it to you.</p>
      </template>
    </WholeInputField>
    <!-- -->
    <WholeInputField
      field-id="mobile-field"
      label="Mobile phone"
      required
      validation-type="mobilephone"
      type="tel" />
    <WholeInputField
      field-id="money-field"
      label="Money"
      required
      validation-type="money"
      step="0.01"
      type="number" />
    <WholeInputField
      field-id="percent-field"
      label="Percent"
      required
      suffix-icon="%"
      type="number" />
    <!-- -->
  </ul>
</template>

<script setup>
import WholeInputField from './components/shared-components/WholeInputField/WholeInputField.vue';
import './assets/scss/main.scss';

const multiOptions = [
  { value: '1', label: 'first option' },
  { value: '2', label: 'Two is a cool number' },
  { value: 3, label: 33 },
  { value: '4', label: 'Quarter of the way to the end of the list. Well actually not really, we are more like 80% of the way to the end of the list' },
  { value: 'five', label: 'Only joking 5 is the end' },
];


const txtInpAttr = {
  placeholder: 'Enter text (non-alpha-numeric shows error)',
  pattern: '^[a-z0-9]+$'
};
const numInpAttr = {
  placeholder: 'e.g. 25',
  min: 10,
  max: 40,
  step: 1
};
const dateInpAttr = {
  min: '2023-05-10',
  max: '2023-05-20'
};
const badDateInpAttr = {
  min: 'I am chicken',
  max: 1684210093,
};
const dateTimeInpAttr = {
  min: '1979-01-29T09:00:00+12:00',
  max: '2028-11-16T15:10:00+11:00',
};
const textareaAttr = { rows: 11, };

const validPasswd = (input) => {
  const matches = input.match(/[\[\]\\\/\`\-0-9_+=!@#$%^&*(){}|:";'<>?,.~ ]/g);

  if (matches !== null && matches.length > 1) {
    return true;
  }

  return 'Your password must include at least 2 non alphabetical characters';
}

const getPickleLabel = (data) => data.label;

/**
 *
 *
 * @param {function} search Async API address search function
 *
 * @returns {array} List of matched addresses.
 */
const getPickle = (input) => {
  return [
    {
      id: 'evan',
      label: 'Evan',
    },
    {
      label: 'Ivan',
      id: 'ivan',
    },
    {
      label: 'Tarrin',
      id: 'tarrin',
    },
    {
      label: 'Toria',
      id: 'victoria',
    },
    {
      label: 'Mallee',
      id: 'mallee',
    },
    {
      label: 'Ada',
      id: 'ada',
    },
    {
      label: 'Emile',
      id: 'emile',
    },
    {
      label: 'Owen',
      id: 'owen',
    },
    {
      id: 'unknown',
      label: 'Unable to find address?',
    }
  ];
};

const pickleValidation = (input) => {
  return (input.length < 5)
    ? 'Please enter at least 5 characters'
    : '';
}
</script>

<style scoped>
</style>
