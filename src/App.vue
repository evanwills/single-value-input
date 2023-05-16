<template>
  <ul>
    <SingleValueInput field-id="first-field"
                      label="First field label"
                      type="text"
                      required
                      error-msg="Bad user input"
                      :attributes="txtInpAttr" />
    <SingleValueInput field-id="date-field"
                      label="Date (only) field label"
                      type="date"
                      required
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
    <SingleValueInput field-id="range-field"
                      label="Range field label"
                      type="range" />
    <SingleValueInput field-id="textarea-field"
                      label="Textarea field label"
                      type="textarea"
                      :attributes="textareaAttr" />
    <SingleValueInput field-id="select-field"
                      label="Select field label"
                      type="select"
                      :options="multiOptions" />
    <SingleValueInput field-id="radio-field"
                      label="Radio list group label"
                      type="radio"
                      :options="multiOptions" />
  </ul>
</template>

<script setup>
import SingleValueInput from './components/SingleValueInput.vue';

const multiOptions = [
  { key: '1', value: 'first option' },
  { key: '2', value: 'Two is a cool number' },
  { key: 3, value: 33 },
  { key: '4', value: 'Quarter of the way to the end of the list' },
  { key: 'five', value: 'Only joking 5 is the end' },
];


const txtInpAttr = {
  placeholder: 'Please enter some text',
  pattern: '^[a-z0-9]+$'
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
