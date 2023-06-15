<template>
  <li class="single-val-input single-val-input--no-edit">
    <span class="inputs-block__label">{{ label }}</span>
    <span v-if="showDefault === true" class="inputs-block__input placeholder-txt">Not specified</span>
    <span v-else class="inputs-block__input">{{ value }}</span>
  </li>
</template>

<script>
/**
 * `<NonEditInput>` Is a simple component for rendering input
 * label/value pairs. If value is empty, *"Not specified"* is
 * rendered to show that the value is empty.
 *
 * @property {sring} label Human readable label for the input
 * @property {sring} value Human readable value for the input
 */
export default {
  props: {
    label: { type: String, required: true },
    value: { type: String, required: false, default: '' },
  },

  computed: {
    showDefault() {
      return (typeof this.value !== 'string' || this.value.trim() === '');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/config';
.placeholder-txt {
  color: $dark-grey;
  font-style: italic;

  &::before {
    content: '[';
  }

  &::after {
    content: ']';
  }
}
</style>
