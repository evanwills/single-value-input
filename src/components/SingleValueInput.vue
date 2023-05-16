
<template>
  <li class="single-val-input">
    <span v-if="type === 'radio'" :id="fieldId" class="single-val-input__label">
      {{ label }}
      <span v-if="required === true">(required)</span>
    </span>
    <label v-else :for="fieldId" class="single-val-input__label">
      {{ label }}
      <span v-if="required === true" class="single-val-input__required">(required)</span>
    </label>
    <div class="single-val-input__input-wrap">
      <AccessibleSelect v-if="isSelect"
                        :field-id="fieldId"
                        :options="options"
                        :radio="isRadio"
                        :required="required"
                        :readonly="readonly"
                        :disabled="disabled"
                        :tabindex="tabindex"
                        :accesskey="accessKeyAttr"
                        :value="value"
                        :title="titleAttr"
                        v-on:change="selectChanged($event)"></AccessibleSelect>
      <textarea v-else-if="isTextarea"
                :id="fieldId"
                :required="required"
                :readonly="readonly"
                :disabled="disabled"
                :tabindex="tabindex"
                :accesskey="accessKeyAttr"
                :minlength="minLengthAttr"
                :maxlength="maxLengthAttr"
                :pattern="patternAttr"
                :placeholder="placeholderAttr"
                :rows="rowsAttr"
                :spellcheck="spellCheckAttr"
                :title="titleAttr"
                v-on:change="hasChanged($event)"
                v-on:blur="hasChanged($event)"
                class="single-val-input__input">{{ value }}</textarea>
      <input  v-else
              :type="inputType"
              :id="fieldId"
              :required="required"
              :readonly="readonly"
              :disabled="disabled"
              :tabindex="tabindex"
              :accesskey="accessKeyAttr"
              :inputmode="inputModeAttr"
              :min="minAttr"
              :minlength="minLengthAttr"
              :max="maxAttr"
              :maxlength="maxLengthAttr"
              :pattern="patternAttr"
              :placeholder="placeholderAttr"
              :step="stepAttr"
              :title="titleAttr"
              :value="value"
              v-on:change="hasChanged($event)"
              v-on:blur="hasChanged($event)"
              class="single-val-input__input" />
      <span v-if="showError === true" :id="getID('error')" ></span>
    </div>
    <div class="single-val-input__help" :id="getID('help')"></div>
  </li>
</template>

<script>
// import { onUpdated, ref } from 'vue'
import AccessibleSelect from './AccessibleSelect.vue'

const inputTypes = [
  'color', 'date', 'datetime-local', 'email', 'month', 'number',
  'radio', 'range', 'select', 'tel', 'text', 'textarea', 'time',
  'url', 'week', 'year'
];

const inputAttibutes = {
  accesskey: 'string',
  max: 'number',
  maxlength: 'number',
  min: 'number',
  minlength: 'number',
  inputmode: 'string',
  pattern: 'string',
  placeholder: 'string',
  rows: 'number',
  size: 'number',
  step: 'number',
  spellcheck: 'boolean',
  title: 'string',
}

export default {
  name: 'single-value-input',

  emits: [ 'change', 'isvalid' ],

  props: {
    fieldId: { type: String, required: true, },
    label: { type: String, required: true, },
    type: { type: String, required: true, },
    accesskey: { type: String, required: false, },
    attributes: { type: Object, required: false },
    disabled: { type: Boolean, required: false, default: false, },
    options: { type: Array, required: false, default: [] },
    readonly: { type: Boolean, required: false, default: false, },
    required: { type: Boolean, required: false, default: false, },
    tabindex: { type: Number, required: false, default: 0, },
    value: { required: false, default: '', },
  },

  components: { AccessibleSelect },

  computed: {
    isSelect() {
      return (this.type === 'select' || this.type === 'radio');
    },
    isTextarea() {
      return (this.type === 'textarea');
    },
    isRadio() {
      return (this.type === 'radio');
    },
    inputType() {
      return (this.type === 'year')
        ? 'number'
        : this.type;
    },
    accessKeyAttr() {
      return (typeof this.attrs.accesskey !== 'undefined')
        ? this.attrs.accesskey
        : undefined;
    },
    maxAttr() {
      return (typeof this.attrs.max !== 'undefined')
        ? this.attrs.max
        : undefined;
    },
    maxLengthAttr() {
      return (typeof this.attrs.maxlength !== 'undefined')
        ? this.attrs.maxlength
        : undefined;
    },
    minAttr() {
      return (typeof this.attrs.min !== 'undefined')
        ? this.attrs.min
        : undefined;
    },
    minLengthAttr() {
      return (typeof this.attrs.minlength !== 'undefined')
        ? this.attrs.minlength
        : undefined;
    },
    inputModeAttr() {
      return (typeof this.attrs.inputmode !== 'undefined')
        ? this.attrs.inputmode
        : undefined;
    },
    patternAttr() {
      return (typeof this.attrs.pattern !== 'undefined')
        ? this.attrs.pattern
        : undefined;
    },
    placeholderAttr() {
      return (typeof this.attrs.placeholder !== 'undefined')
        ? this.attrs.placeholder
        : undefined;
    },
    rowsAttr() {
      return (typeof this.attrs.rows !== 'undefined')
        ? this.attrs.rows
        : undefined;
    },
    spellCheckAttr() {
      return (typeof this.attrs.spellcheck !== 'undefined')
        ? this.attrs.spellcheck
        : undefined;
    },
    stepAttr() {
      return (typeof this.attrs.step !== 'undefined')
        ? this.attrs.step
        : undefined;
    },
    titleAttr() {
      return (typeof this.attrs.title !== 'undefined')
        ? this.attrs.title
        : undefined;
    },
    inputClass() {
      const prefix = 'single-val-input__input';

      return (this.showError === true)
        ? `${prefix} ${prefix}--invalid`
        : prefix
    },

    isValid(validity) {
      console.group('isValid(element)');
      console.log('validity:', validity);
      console.log('validity:', validity);
      console.log('validity.valueMissing:', validity.valueMissing);
      console.log('validity.typeMismatch:', validity.typeMismatch);
      console.log('validity.patternMismatch:', validity.patternMismatch);
      console.log('validity.tooLong:', validity.tooLong);
      console.log('validity.tooShort:', validity.tooShort);
      console.log('validity.rangeUnderflow:', validity.rangeUnderflow);
      console.log('validity.rangeOverflow:', validity.rangeOverflow);
      console.log('validity.stepMismatch:', validity.stepMismatch);
      console.log('validity.badInput:', validity.badInput);
      console.log('validity.customError:', validity.customError);

      const vKeys = Object.keys(validity);

      for (let a = 0; a < vKeys.length; a += 1) {
        if (validity[vKeys[a]] === true) {
          console.groupEnd();
          return false;
        }
      }
      console.groupEnd();
      return true;
    },
  },

  methods: {
    getID(input) {
      return (typeof input === 'string' && input !== '')
        ? `${this.fieldId}--${input}`
        : this.fieldId;
    },
    selectChanged(e) {
      const field = e.target
      this.showError = field.checkValidity();
    },
    hasChanged(e) {
      this.showError = !e.target.checkValidity();
    },
    hasBlured(e) {
      this.showError = !e.target.checkValidity();
    },

    getTimeAsSeconds(input) {
      const regex = /^([01][0-9]|2[[0-3]):([0-5][0-9])(?::([0-5][0-9]))(\.[0-9]{1,10})?$/;
      const matches = input[key].match(regex);
      if (matches !== null) {
        let output = (matches[1] * 3600) + (matches[2] * 60);

        if (typeof matches[3] !== undefined) {
          output += matches[3];
        }
        if (typeof matches[4] !== undefined) {
          output += matches[4];
        }

        return output;
      } else {
        return false;
      }
    },
  },

  data() {
    return {
      currentValue: '',
      originalValue: '',
      attrs: {},
      showError: false,
      custom: {
        min: null,
        max: null,
      },
    }
  },

  beforeMount() {
    console.group('beforeMount()');
    if (typeof this.label !== 'string' || this.label.trim() === '') {
      throw new Error(
        '<single-value-input> component requires label attribute ' +
        'to be set and a non-empty string'
      );
    }

    if (inputTypes.indexOf(this.type) === -1) {
      throw new Error(
        '<single-value-input> component requires type attribute ' +
        'to be a valid (non-button) HTML input "type" value ' +
        '(excluding "file" & "checkbox" types)'
      );
    }

    if (this.type === 'select' || this.type === 'radio') {
      if (!Array.isArray(this.options) || this.options.length < 2) {
        throw new Error
      }
    }

    if (this.type === 'year') {
      this.attrs.min = 1900;
      this.attrs.max = 2100;
      this.attrs.step = 1;
    }

    console.log(this.attributes);
    if (typeof this.attributes !== 'undefined') {
      const notNum = ['date', 'time', 'datetime-local'];
      const tmpUserKeys = Object.keys(this.attributes);
      for (let a = 0; a < tmpUserKeys.length; a += 1) {
        const lowerKey = tmpUserKeys[a].toLowerCase();
        const key = tmpUserKeys[a];

        const attrType = typeof this.attributes[key];
        if ((typeof inputAttibutes[lowerKey] !== 'undefined' && attrType === inputAttibutes[lowerKey]) || (notNum.indexOf(this.type) > -1 && (lowerKey === 'min' || lowerKey === 'max') && attrType === 'string')) {
          this.attrs[lowerKey] = this.attributes[key];
          if (this.type === 'date' || this.type === 'datetime-local') {
            const tmpDate = new Date(this.attributes[key]);

            if (tmpDate.toString() === 'Invalid Date') {
              console.warn(
                `input#${this.fieldId} type: \`${this.type}\`, attribute: \`${key}\` ("${this.attributes[key]}") is invalid!`
              );
            } else {
              this.custom[lowerKey] = tmpDate;
            }
          } else if (this.type === 'time') {
            const tmpTime = this.getTimeAsSeconds(this.attributes[key])
            if (tmpTime !== false) {
              this.custom[lowerKey] = tmpTime;
            } else {
              console.warn(
                `input#${this.fieldId} type: \`time\`, attribute: \`${key}\` ("${this.attributes[key]}") is invalid!`
              );
            }
          }
        }
      }
    }

    console.log('this.attrs:', this.attrs);

    console.groupEnd();
  },

  mounted() {

  },

  unmounted() {

  },

  // onUpdated() {

  // },
}
</script>


<style lang="scss">
@import '../assets/scss/config';

$border-rad: 0.3rem;

.single-val-input {
  margin: 0;
  padding: 0;
  font-family: Poppins, Arial, Helvetica, sans-serif;
  list-style-type: none;

  &:nth-child(n + 2) {
    margin-top: 1rem;
  }

  &__label {
    display: block;
    // font-weight: bold;
    padding: 0.5rem 0;
    text-align: left;
    text-align: start;

    &::after {
      content: ':';
    }
  }

  &__input {
    background-color: $white;
    border: 0.05rem solid $tsf-field-borders;
    border-radius: $border-rad;
    box-sizing: border-box;
    display: block;
    font-family: 'Courier New', Courier, monospace;
    width: 100%;
    color: $black;
    padding: 0.5rem 0.6rem 0.4rem;
    font-size: 1rem;

    &--invalid {
      border-color: $tsf-red;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:placeholder-shown {
      color: $black;
    }

    &[type=date], &[type=time], &[type=datetime-local] {
      width: auto;
    }
  }

  &__required {
    font-style: italic;
    font-size: 0.875rem;
  }
}
</style>
