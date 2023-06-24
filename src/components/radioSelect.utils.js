/**
 * Get the option list as an array (rather than an array nested
 * within an object)
 *
 * @param {Object|Array} optionList
 *
 * @returns {Array}
 */
const getListOptions = (optionList) => {
  const output = (typeof optionList.SelectOptionItems !== 'undefined')
    ? optionList.SelectOptionItems
    : optionList;

  if (!Array.isArray(output)) {
    throw new Error(`Expected optionList to have an array. Found ${typeof output}`);
  }

  return output;
};

/**
 * Find the selected option based on the supplied value
 *
 * @param {<{Value: string, Key: string|number}>[]} optionList List
 *                              of Key/Value pairs
 * @param {string|number} value Currently selected value
 *
 * @returns {Array} one option from the supplied array if an item
 *                  was found to match the value.
 *                  Empty array if no match was found
 */
export const findSelectedOption = (optionList, value) => {
  for (let a = 0; a < optionList.length; a += 1) {
    if (optionList[a].value === value) {
      return [optionList[a]];
    }
  }

  return [];
};

/**
 * Get a list of objects to be used passed <PrettySelect> options
 *
 * Output objects have
 * * `key`   property which is used as the option Value
 * * `value` property which is used as the option's label (what
 * *         the end user sees)
 *
 * @param {Array} optionList
 * @returns {array}
 */
export const getKeyValueOptions = (optionList) => {
  const _list = getListOptions(optionList);

  return _list.map((oneOption) => { // eslint-disable-line
    return {
      key: oneOption.Value,
      value: oneOption.Key,
    };
  });
};

/**
 * Get the human readable version of the user selected value, or the
 * previous human readable version the value if user selected value
 * was invalid.
 *
 * @param {Object|Array}  optionList List of select options a value
 *                                   should be found in.
 * @param {string|number} newValue   New value user has selected
 * @param {string|number} oldValue   Previous human readable version
 *                                   of value
 *
 * @returns {string|number}
 */
export const getSelectedLabel = (optionList, newValue, oldValue) => {
  const option = findSelectedOption(optionList, newValue);

  return (option.length > 0)
    ? option[0].label
    : oldValue;
};

/**
 * Normalise option objects so they have expected properties
 *
 * @param {<string|number|Object>[]} options List of options
 *
 * @returns {Object[]}
 */
export const normaliseOptions = (options, defaultVal) => {
  let _options = [];

  if (Array.isArray(options) === false && typeof options === 'object') {
    const output = [];
    const keys = Object.keys(options);

    for (let a = 0; a < keys.length; a += 1) {
      const key = keys[a];
      output.push({ value: key, label: options[key] });
    }

    _options = output;
  } else {
    _options = [...options];
  }

  return _options.map((item) => {
    const t = typeof item;
    let _val = '';
    let _label = '';
    let vProp = '';
    let lProp = '';

    if (t === 'string' || t === 'number') {
      _val = item;
      _label = _val;
    } else {
      if (typeof item.label !== 'undefined') {
        lProp = 'label';
        vProp = (typeof item.value !== 'undefined')
          ? 'value'
          : 'label';
      } else if (typeof item.key !== 'undefined') {
        vProp = 'key';
        lProp = (typeof item.value !== 'undefined')
          ? 'value'
          : 'key';
      } else if (typeof item.Value !== 'undefined') {
        vProp = 'Value';
        lProp = (typeof item.Key !== 'undefined')
          ? 'Key'
          : 'Value';
      } else if (typeof item.Key !== 'undefined') {
        lProp = 'Key';
        vProp = (typeof item.Key !== 'undefined')
          ? 'Key'
          : 'Value';
      }

      if (vProp === '' || lProp === '') {
        throw new Error(
          'Could not determine either the `value` or `label` '
          + `property of option: "${item.toString()}"`,
        );
      }

      _val = item[vProp];
      _label = item[lProp];
    }

    if (typeof _val !== 'string') {
      _val = _val.toString();
    }

    if (typeof _label !== 'string') {
      _label = _label.toString();
    }

    return { value: _val, label: _label, default: (defaultVal === _val) };
  });
};
