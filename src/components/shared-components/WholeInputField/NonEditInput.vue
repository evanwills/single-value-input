<template>
  <li class="single-val-input single-val-input--no-edit">
    <span class="inputs-block__label">
      {{ label }}
      <span v-if="showRequired" class="single-val-input__required">{{ getRequredTxt }}</span>
    </span>
    <span v-if="showDefault === true" class="inputs-block__input placeholder-txt">
      Not specified
    </span>
    <span v-else-if="allowUnsafe" class="inputs-block__input" v-html="value"></span>
    <span v-else class="inputs-block__input">{{ value }}</span>
  </li>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { getEpre } from '../../../utils/general-utils';

// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
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

  /**
   * Whether or not to render unsafe HTML
   *
   * @property {boolean} allowUnsafe
   */
  allowUnsafe: { type: Boolean, required: false, default: false },

  /**
   * Whether or not to show required helper text
   *
   * @property {boolean} showRequired
   */
  showRequired: { type: Boolean, required: false, default: false },

  /**
   * Whether or not render "(optional)" when input is optional,
   * instead of "(required)" when it's required.
   *
   * > __Note:__ This is a __VERY BAD__ pattern, however, my
   * >           current use-case requires it until we can have
   * >           it reversed
   *
   * Render "(optional)" when the field is optional and blank when
   * it is required, instead of the conventional approach which is
   * to render blank when input is optional and "(required)" when
   * it's required.
   *
   * @property {boolean} required
   */
  requiredRev: { type: Boolean, required: false, default: false },

  /**
   * Override text to use for optional value fields
   *
   * @property {boolean} showRequired
   */
  optionalText: { type: String, required: false, default: '' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

/**
 * Get the start of an error message string for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
const ePre = ref(null);

/**
 * String to render when field is not required
 *
 * @property {string} optionalTxt
 */
const optionalTxt = ref('');

/**
 * String to render when field is required
 *
 * @property {string} requiredTxt
 */
const requiredTxt = ref(' (required)');

const showDefault = computed(() => (typeof props.value !== 'string' || props.value.trim() === ''));

const getRequredTxt = computed(() => { // eslint-disable-line arrow-body-style
  return (props.requiredRev === true)
    ? optionalTxt.value
    : requiredTxt.value;
});

onBeforeMount(() => {
  if (props.requiredRev === true) {
    optionalTxt.value = (props.optionalText.trim() !== '')
      ? ` (${props.optionalText.trim()})`
      : ' (optional)';

    requiredTxt.value = '';
  }

  ePre.value = getEpre(
    'NonEditInput',
    props.label.replace(/[^a-z0-9]+/ig, '-').toLocaleLowerCase(),
  );
});

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
