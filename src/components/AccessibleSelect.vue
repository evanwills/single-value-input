<template>
  <ul class="radio-group" v-if="radio === true" role="group" :aria-labelledby="fieldId">
    <li v-for="(option, i) of usableOptions" v-bind:key="i">
      <input type="radio" class="visually-hidden"
            :id="option.id"
            :value="option.key"
            :name="radioName"
            :checked="isSelected(option)"
            :required="required"
            :tabindex="tabIndex"
            :aria-describedby="getDescribedbyIDs"
            v-on:change="hasChanged($event)" />
      <label :for="option.id" class="radio-group__label">{{ option.value }}</label>
    </li>
  </ul>

  <span v-else>
    <span :class="selectClass">
      <select :id="fieldId"
              :aria-describedby="getDescribedbyIDs"
              :tabindex="tabIndex"
              v-bind:required="required"
              v-on:change="hasChanged($event)"
              v-on:blur="blured($event)">
        <option v-for="(option, i) of usableOptions"
                :value="option.key"
                :selected="isSelected(option)"
                v-bind:key="i">
          {{ option.value }}
        </option>
      </select>
    </span>
  </span>
</template>

<script>
/**
 * Add an ID string for each item in the array.
 *
 * @param {string} labelID ID for the label for the whole radio group
 *
 * @returns {Function} A function that can be passed to Array.map()
 */
const usableOptionsWithID = (labelID) => (item, index) => ({ ...item, id: `${labelID}--${index}` });

export default {
  name: 'accessible-select',

  props: {
    emptyText: { type: String, required: false, default: '' },
    errorMsgId: { type: String, required: false, default: '' },
    fieldHelpId: { type: String, required: false },
    fieldId: { type: String, required: true },
    invalid: { type: Boolean, required: false, default: false },
    options: { type: Array, required: true },
    radio: { type: Boolean, required: false, default: false },
    required: { type: Boolean, required: false, default: false },
    value: { required: true },
    tabIndex: { type: Number, required: false, default: 0 },
    errorOnBlur: { type: Boolean, required: false, default: false },
  },

  data() {
    return {
      originalValue: '',
      currentValue: this.value,
      // selected: this.default ? this.default : this.options[0],
      open: false,
      usableOptions: [],
      showError: false,
      useMode: 'select',
      hadFocus: false,
      canShowError: false,
    };
  },

  computed: {
    radioName() {
      return `${this.fieldId}-radio`;
    },

    selectClass() {
      const base = 'pretty-select';

      const output = (this.required === true)
        ? `${base} ${base}--required`
        : base;

      return (this.showError === true)
        ? `${output} ${base}--error`
        : output;
    },

    errorID() {
      return `${this.fieldId}--error`;
    },

    getDescribedbyIDs() {
      const helpID = (typeof this.fieldHelpId === 'string' && this.fieldHelpId.trim() !== '')
        ? ` ${this.fieldHelpId.trim()}`
        : '';
      const errorID = (this.showError)
        ? `${this.fieldId}--error`
        : '';

      return (helpID !== '' || errorID !== '')
        ? helpID + errorID
        : undefined;
    },
  },

  methods: {
    /**
     * determine if an option has been chosen
     *
     * @param {{key: string|number, value: string}} option single select/radio
     */
    isSelected(option) {
      return (option.key == this.value) // eslint-disable-line
        ? this.useMode
        : undefined;
    },

    setShowError() {
      this.hadFocus = true;

      if (this.canShowError === true && (this.errorOnBlur === false || this.hadFocus === true)) {
        this.showError = (this.required && this.currentValue === '');
      }
    },

    /**
     * Handle changes to radio or select input fields
     *
     * @param {Event} e
     */
    hasChanged(e) {
      console.group('hasChanged(e)');
      console.log('e.target:', e.target);
      console.log('this.required:', this.required);
      console.log('this.currentValue:', this.currentValue);
      const field = e.target;

      for (let a = 0; a < this.usableOptions.length; a += 1) {
        if (this.usableOptions[a].key === field.value) {
          // make sure there's no funny business going on and that
          // the selected value is valid
          this.currentValue = field.value;
        }
      }
      this.setShowError();

      console.log('this.currentValue:', this.currentValue);
      console.log('this.showError:', this.showError);
      console.groupEnd();
      this.$emit('change', e);
    },

    blured(e) {
      console.group('blured(e)');
      console.log('e.target:', e.target);
      console.log('this.required:', this.required);
      console.log('this.currentValue:', this.currentValue);
      console.log('this.hadFocus:', this.hadFocus);
      console.log('this.showError:', this.showError);

      if (typeof this.currentValue === 'undefined') {
        this.currentValue = '';
      }

      this.setShowError();

      console.log('this.hadFocus:', this.hadFocus);
      console.log('this.showError:', this.showError);
      console.groupEnd();
    },
  },

  beforeMount() {
    console.group('beforeMount()');
    console.log('this.options:', this.options);
    // Add empty option if text for one has been specified
    const options = (typeof this.emptyText !== 'undefined' && this.emptyText !== '')
      ? [{ key: '', value: this.emptyText }, ...this.options]
      : [...this.options];

    // Give each radio option a unique ID
    this.usableOptions = (this.radio === true)
      ? options.map(usableOptionsWithID(this.fieldId))
      : options;

    // Get the data type of the supplied "selected" value
    const selType = typeof this.value;

    this.currentValue = (selType === 'string' || selType === 'number')
      ? this.value
      : '';
    this.originalValue = this.currentValue;

    /**
     * Get the string value for the selected item.
     */
    this.useMode = (typeof this.radio === 'boolean' && this.radio === true)
      ? 'checked'
      : 'selected';

    // Wh
    this.setShowError();

    this.canShowError = (typeof this.errorMsg === 'string' && this.errorMsg !== '');
    console.groupEnd();
  },

  mounted() {
    this.currentValue = this.value;
    // this.$emit('input', this.selected);
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/scss/_config.scss';

.pretty-select {
  align-items: center;
  background-color: $white;
  // background-image: linear-gradient(to top, $grey, $white 33%);
  border: 0.05rem solid $regular-grey;
  border-radius: 0.3125rem;
  cursor: pointer;
  display: block;
  margin-top: 0.5rem;
  max-width: 30rem;
  min-width: 10rem;
  padding: 0;
  position: relative;
  width: 100%;

  &--error {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  &--required {
    border-color: $tsf-red;
  }

  &__error {
    background-color: $tsf-red;
    border-radius: 0.3125rem;
    box-sizing: border-box;
    font-family: Poppins, Arial, Helvetica, sans-serif;
    color: $white;
    display: block;
    text-align: left;
    padding: 1rem;
    width: 100%;
    margin-right: -0.2rem;

    &--select {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }

  &::before {
    content: "";
    height: 0.5em;
    outline: none;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 3rem;
    height: 100%;
    border-left: 0.05rem solid $regular-grey;
  }

  &::after {
    background-color: $black;
    clip-path: polygon(100% 0%, 0 0%, 50% 100%);
    content: "";
    height: 0.5em;
    outline: none;
    position: absolute;
    top: 50%;
    right: 1.1rem;
    transform: translateY(-50%) rotate(0deg);
    transition: transform ease-in-out 0.3s;
    width: 0.7em;
  }

  &:focus-within {
    outline: 0.1rem solid $utility-blue;
    outline-offset: 0.1rem;

    &::after {
      transform: translateY(-50%) rotate(180deg);
      transition: transform ease-in-out 0.3s;
    }
  }

  > select {
    appearance: none;
    background-color: transparent;
    border: none;
    color: $dark-grey;
    cursor: inherit;
    display: block;
    // font-family: $tsf-font;
    font-size: 1.1rem;
    /* font-weight: bold; */
    line-height: 1.5rem;
    outline: none;
    padding: 1rem 4rem 1rem 1rem;
    margin: -0.1rem 0 -0.1em 0;
    width: 100%;

    &::-ms-expand {
      display: none;
    }
  }

  option {
    background-color: #fff;
    /* color: $dark-grey; */
    font-weight: normal;
    // font-family: $tsf-font;
    font-size: 1rem;
    padding: 0.5rem;
  }
}

ul.radio-group {
  // padding-top: 1rem;
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;

  > li {
    text-align: left;

  }

  > li:nth-child(1n) {
    margin-top: 0;
  }

  > li:nth-child(n + 2) {
    margin-top: .25rem;
  }

  & .radio-group__label {
    display: block;
    font-weight: bold;
    padding: 0.5rem 0 0.5rem 3rem;
    position: relative;
    width: 100%;

    &:hover {
      cursor: pointer;

      &:before {
        border-color: $tsf-bright-blue;
      }
    }

    &::before, &::after {
      content: '';
      left: 0.75rem;
      position: absolute;
      top: 1.25rem;
      transform: translate(-50%, -50%);
    }

    &::before {
      background-color: $white;
      border: 0.125rem solid $tsf-field-borders;
      border-radius: 10rem;
      box-sizing: border-box;
      content: '';
      display: inline-block;
      height: 1.5rem;
      width: 1.5rem;
    }

    &::after {
      background-color: $tsf-bright-blue;
      border-radius: 10rem;
      display: inline-block;
      height: 0.75rem;
      opacity: 0;
      transition: opacity ease-in-out 0.3s;
      width: 0.75rem;
    }
  }

  input {
    &:focus {
      &:before {
        border-color: $tsf-bright-blue;
      }
    }

    &:checked + .radio-group__label {
      &:after {
        opacity: 1;
      }
    }
  }
}
</style>
