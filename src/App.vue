<template>
  <ul>
    <SingleValueInput field-id="text-field"
                      label="Basic text field"
                      type="text"
                      required
                      error-msg="Bad user input"
                      help-txt="This is some useful info about 'First field'"
                      :attributes="txtInpAttr" />
    <SingleValueInput field-id="password-field"
                      label="Password"
                      type="password"
                      required
                      error-msg="Please enter a valid password">
      <template v-slot:help>
        <p>You need to enter your current password to change it. If you're not sure what your password is, you can <a href="https://www.thesmithfamily.com.au/forgot-password">reset your password</a> via email.</p>
      </template>
    </SingleValueInput>
    <SingleValueInput field-id="number-field"
                      label="Number field"
                      type="number"
                      required
                      error-msg="Must be a number between 10 and 40"
                      help-txt="Pick a number, any number"
                      :attributes="numInpAttr" />
    <SingleValueInput field-id="date-field"
                      label="Date (only) field label"
                      type="date"
                      required
                      error-msg="Please enter today's date"
                      :attributes="dateInpAttr" />
    <SingleValueInput field-id="bad-date-field"
                      label="Bad Date (only) field label"
                      type="date"
                      required
                      :attributes="badDateInpAttr" />
    <SingleValueInput field-id="datetime-field"
                      label="Date-time field label"
                      type="datetime-local"
                      :attributes="dateTimeInpAttr" />
    <SingleValueInput field-id="time-field"
                      label="Date-time field label"
                      type="datetime-local"
                      :attributes="dateTimeInpAttr" />
    <SingleValueInput field-id="time-field"
                      label="Time of day field"
                      type="time"
                      required
                      :attributes="dateTimeInpAttr">
      <template #error>
        <p>This some funcky error message with a <a href="https://vuejs.org/guide/components/slots.html">link</a></p>
      </template>
      <template #help>
        <p>Our office hours are between 8:30am and 5:30pm <a href="https://vuejs.org/guide/components/slots.html">link</a></p>
      </template>
    </SingleValueInput>
    <SingleValueInput field-id="range-field"
                      label="Range field label"
                      type="range" />
    <SingleValueInput field-id="colour-field"
                      label="Choose a colour"
                      type="color" />
    <SingleValueInput field-id="textarea-field"
                      label="Textarea field label"
                      type="textarea"
                      :attributes="textareaAttr"
                      required
                      error-msg="Please tell us somethings" />
    <SingleValueInput field-id="radio-field"
                      label="Radio list group label"
                      error-msg="Please choose an option"
                      type="radio"
                      required
                      :options="multiOptions" />
    <SingleValueInput error-msg="Please choose an option"
                      field-id="radio-field-default"
                      label="Radio list group label"
                      :options="multiOptions"
                      required
                      type="radio"
                      value="2" />
    <SingleValueInput empty-txt="-- please choose --"
                      error-msg="Please choose an option"
                      field-id="select-field"
                      label="Select field label"
                      :options="multiOptions"
                      required
                      type="select" />
    <SingleValueInput empty-txt="-- please choose --"
                      error-msg="Please choose an option"
                      field-id="select-field-default"
                      label="Select field with default"
                      no-non-empty
                      :options="multiOptions"
                      required
                      type="select"
                      value="3" />
  </ul>
</template>

<script setup>
import SingleValueInput from './components/SingleValueInput.vue';

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
</script>

<style scoped>
</style>
