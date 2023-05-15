
<template>
  <li class="single-val-input">
    <span v-if="type === 'radio'" for="blah"></span>
    <label v-else for="blah"></label>
    <div class="single-val-input__input-wrap">
      <span v-if="type === 'select' || type === 'radio'"></span>
      <textarea v-else-if="type === 'textarea'"></textarea>
      <input v-else :type="type" />
      <span v-if="showError === true" id="blah--error" ></span>
    </div>
    <div class="single-val-input__help" id="blah--help"></div>
  </li>
</template>

<script>
import { onUpdated, ref } from 'vue'

export default {
  name: 'single-value-input',

  emits: [ 'change', 'isvalid' ],

  props: {
    fieldId: { type: String, required: true, },
    label: { type: String, required: true, },
    type: { type: String, required: true, },
    value: { required: false, default: '', },
    required: { type: Boolean, required: false, default: false, },
  },

  computed: {

  },

  data() {

  },

  beforeMount() {

  },

  mounted() {

  },

  unmounted() {

  },

  onUpdated() {

  },
}
</script>


<style scoped>
.read-the-docs {
  color: #888;
}
</style>
