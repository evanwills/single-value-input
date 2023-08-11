<template>
  <li class="single-val-input single-val-input--no-edit">
    <span class="inputs-block__label">{{ label }}</span>
    <span v-if="showDefault === true" class="inputs-block__input placeholder-txt">Not specified</span>
    <span v-else-if="allowUnsafe" class="inputs-block__input" v-html="value"></span>
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
    /**
     * Text to label the field
     *
     * This is an accessiblity requirement.
     *
     * > __Note:__ If label is undefined or empty, an error will
     * >           be thrown
     *
     * (See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
     * for more info)
     *
     * @property {string} errorMsg
     */
    label: { type: String, required: true },

    /**
     * Predefined value for the field.
     *
     * @property {string|number|undefined} value
     */
    value: { type: String, required: false, default: '' },

    allowUnsafe: { type: Boolean, required: false, default: false },
  },

  computed: {
    showDefault() {
      return (typeof this.value !== 'string' || this.value.trim() === '');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/config';
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
