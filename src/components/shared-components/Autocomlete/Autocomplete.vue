<template>
  <div ref="root">
    <slot
      :rootProps="rootProps"
      :inputProps="inputProps"
      :inputListeners="inputListeners"
      :resultListProps="resultListProps"
      :resultListListeners="resultListListeners"
      :results="results"
      :resultProps="resultProps">
      <div v-bind="rootProps">
        <input
          v-bind="inputProps"
          ref="input"
          @input="handleInput"
          @keydown="core.handleKeyDown"
          @focus="core.handleFocus"
          @blur="core.handleBlur"
          v-on="attrs" />
        <ul
          v-bind="resultListProps"
          ref="resultList"
          v-on="resultListListeners">
          <template v-for="(result, index) in results">
            <slot name="result" :result="result" :props="resultProps[index]">
              <li v-bind="resultProps[index]" :key="resultProps[index].id">
                {{ getResultValue(result) }}
              </li>
            </slot>
          </template>
        </ul>
      </div>
    </slot>
  </div>
</template>

<script setup>
/* eslint vue/multi-word-component-names: off */
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useAttrs,
} from 'vue';
import AutocompleteCore from './AutocompleteCore';
import uniqueId from './utils/uniqueId';
import getRelativePosition from './utils/getRelativePosition';
import debounce from './utils/debounce';
import getAriaLabel from './utils/getAriaLabel';

// --------------------------------------------------
// START: Emitted events

const emit = defineEmits(['valid', 'update', 'submit']);
const attrs = useAttrs();

defineOptions({ inheritAttrs: false });

//  END:  Emitted events
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  search: {
    type: Function,
    required: true,
  },
  baseClass: {
    type: String,
    default: 'autocomplete',
  },
  autoSelect: {
    type: Boolean,
    default: false,
  },
  getResultValue: {
    type: Function,
    default: (result) => result,
  },
  defaultValue: {
    type: String,
    default: '',
  },
  debounceTime: {
    type: Number,
    default: 0,
  },
  resultListLabel: {
    type: String,
    default: undefined,
  },
  submitOnEnter: {
    type: Boolean,
    default: false,
  },
  submitOnTab: {
    type: Boolean,
    default: false,
  },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const core = ref(null);
const value = ref('');
const resultListId = ref(null);
const results = ref([]);
const selectedIndex = ref(-1);
const expanded = ref(false);
const loading = ref(false);
const position = ref('below');
const resetPosition = ref(true);

const root = ref(null);
const input = ref(null);
const resultList = ref(null);

//  END:  Local state
// --------------------------------------------------
// START: local methods (used in computed)

const emitValid = () => {
  emit(
    'valid',
    {
      isValid: core.value.isValid,
      matchCount: core.value.matchCount,
    },
  );
};

const handleInput = (event) => {
  value.value = event.target.value;
  core.value.handleInput(event);
  emitValid();
};

//  END:  local methods (used in computed)
// --------------------------------------------------
// START: Computed properties

const rootProps = computed(() => ({
  class: props.baseClass,
  style: { position: 'relative' },
  'data-expanded': expanded.value,
  'data-loading': loading.value,
  'data-position': position.value,
}));

const resultProps = computed(() => results.value.map(
  (_result, index) => ({
    id: `${props.baseClass}-result-${index}`,
    class: `${props.baseClass}-result`,
    'data-result-index': index,
    role: 'option',
    ...(selectedIndex.value === index ? { 'aria-selected': 'true' } : {}),
  }),
));

const inputProps = computed(() => ({
  class: `${props.baseClass}-input`,
  value: value.value,
  role: 'combobox',
  autocomplete: 'off',
  autocapitalize: 'off',
  autocorrect: 'off',
  spellcheck: 'false',
  'aria-autocomplete': 'list',
  'aria-haspopup': 'listbox',
  'aria-owns': resultListId.value,
  'aria-expanded': expanded.value ? 'true' : 'false',
  'aria-activedescendant':
    selectedIndex.value > -1
      ? resultProps.value[selectedIndex.value].id
      : '',
  ...attrs,
}));

const inputListeners = computed(() => ({
  input: handleInput,
  keydown: core.value.handleKeyDown,
  focus: core.value.handleFocus,
  blur: core.value.handleBlur,
}));

const resultListProps = computed(() => {
  const yPosition = position.value === 'below' ? 'top' : 'bottom';
  const ariaLabel = getAriaLabel(props.resultListLabel);

  return {
    id: resultListId.value,
    class: `${props.baseClass}-result-list`,
    role: 'listbox',
    [ariaLabel?.attribute]: ariaLabel?.content,
    style: {
      position: 'absolute',
      zIndex: 1,
      width: '100%',
      visibility: expanded.value ? 'visible' : 'hidden',
      pointerEvents: expanded.value ? 'auto' : 'none',
      [yPosition]: '100%',
    },
  };
});

const resultListListeners = computed(() => ({
  mousedown: core.value.handleResultMouseDown,
  click: core.value.handleResultClick,
}));

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const setValue = (result) => {
  value.value = result ? props.getResultValue(result) : '';
};

const handleUpdate = (_results, _selectedIndex) => {
  results.value = _results;
  selectedIndex.value = _selectedIndex;

  emitValid();
  emit('update', results.value, selectedIndex.value);
};

const handleShow = () => {
  expanded.value = true;
};

const handleHide = () => {
  expanded.value = false;
  resetPosition.value = true;
};

const handleLoading = () => {
  loading.value = true;
};

const handleLoaded = () => {
  loading.value = false;
};

const handleSubmit = (selectedResult) => {
  emitValid();
  emit('submit', selectedResult);
};

const handleDocumentClick = (event) => {
  if (root.value.contains(event.target)) {
    return;
  }
  core.value.hideResults();
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  const _core = new AutocompleteCore({
    search: props.search,
    autoSelect: props.autoSelect,
    setValue,
    onUpdate: handleUpdate,
    onSubmit: handleSubmit,
    onShow: handleShow,
    onHide: handleHide,
    onLoading: handleLoading,
    onLoaded: handleLoaded,
    submitOnEnter: props.submitOnEnter,
    submitOnTab: props.submitOnTab,
  });

  if (props.debounceTime > 0) {
    _core.handleInput = debounce(_core.handleInput, props.debounceTime);
  }

  core.value = _core;
  resultListId.value = uniqueId(`${props.baseClass}-result-list-`);
});

onMounted(() => {
  document.body.addEventListener('click', handleDocumentClick);

  value.value = props.defaultValue;
});

onBeforeUnmount(() => {
  document.body.removeEventListener('click', handleDocumentClick);
});

onUpdated(() => {
  if (!input.value || !resultList.value) {
    return;
  }
  if (resetPosition.value && results.value.length > 0) {
    resetPosition.value = false;
    position.value = getRelativePosition(
      input.value,
      resultList.value,
    );
  }
  core.value.checkSelectedResultVisible(resultList.value);
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>
