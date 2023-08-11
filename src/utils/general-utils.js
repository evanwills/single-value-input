/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

/**
 * Convert and address object to a human readable (single line)
 * address
 *
 * @param {object} input Address object
 * @param {string} sep   Seperator character(s) to place between
 *                       fragments of the address
 *
 * @returns {string} Human readable address string.
 */
export const addressToHuman = (input, sep = ' ') => {
  const keys = Object.keys(input);
  let output = '';
  let _sep = '';

  for (let a = 0; a < keys.length; a += 1) {
    if (input[keys[a]] !== null && typeof input[keys[a]] === 'string') {
      const tmp = input[keys[a]].trim();
      if (tmp !== '') {
        output += _sep + tmp;
        _sep = sep;
      }
    }
  }

  return output;
};

/**
 * Check whether a value is empty or null
 *
 * @param {any} input value to be tested
 *
 * @returns {boolean} TRUE if input is undefined, NULL or empty string
 */
export const emptyOrNull = (input) => (input === null || input.trim() === '');

/**
 * Get an ISO 8601 date string offset by a given amount.
 *
 * > __Note:__ By default this function is not "pure" because it
 * >           calls Date.now() to get the current timestamp,
 * >           however, for testing purposes, you can pass in a
 * >           predefined "now" value which will cause the function
 * >           to be "pure" and give a predictable result.
 *
 * @param {number}      offset Offset from now
 * @param {string}      unit   Unit offset represents
 * @param {null|number} now    JS Timestamp for current time
 *
 * @returns {string}
 */
export const getRelativeIsoDate = (offset, unit = 'year', now = null) => {
  if (typeof offset !== 'number') {
    throw new Error(
      'getRelativeIsoDate() expects first parameter `offset` to '
      + `be a number. "${typeof offset}" given`,
    );
  }
  if (typeof unit !== 'string') {
    throw new Error(
      'getRelativeIsoDate() expects second parameter `unit` to be '
      + `a string. "${typeof offset}" given`,
    );
  }

  const _now = (typeof now !== 'number')
    ? Date.now()
    : now;

  let multiplyer = 1;

  switch (unit.trim().toLowerCase().replace(/s$/i, '')) {
    case 'year':
      multiplyer = 31557600000;
      break;
    case 'month':
      multiplyer = 2629800000;
      break;
    case 'week':
      multiplyer = 604800000;
      break;
    case 'day':
      multiplyer = 86400000;
      break;
    default:
      throw new Error('getRelativeIsoDate() expects unit to be a string matching: "year", "month", "week" or "day"');
  }

  const when = new Date(_now + (multiplyer * offset));

  return when.toISOString().replace(/T.*$/, '');
};

/**
 * Check whether there is content for an attribute and slot within
 * a Vue component.
 *
 * @param {import("vue").Component} component Component to be tested
 * @param {string} attr Name of attribute content might have
 *                      been added to
 * @param {string} slot Name of Slot that might contain content
 *
 * @returns {boolean} TRUE if slot or attribute has content.
 *                    FALSE otherwise
 */
export const hasContent = (component, attr, slot) => (
  (attr !== '' && typeof component[attr] === 'string' && component[attr].trim() !== '')
  || (slot !== '' && typeof component.$slots[slot] === 'string' && component.$slots[slot].trim() !== '')
);

/**
 * Check whether a value is boolean and TRUE
 *
 * @param {any} input A value to be tested
 *
 * @returns {boolean} TRUE if the value is boolean and TRUE.
 *                    FALSE otherwise.
 */
export const isBoolTrue = (input) => (typeof input === 'boolean' && input === true);

/**
 * Check whether a value is NULL, string, number or boolean
 *
 * @param {any} input
 *
 * @returns {boolean} TRUE if value is null or scalar.
 */
export const isScalarOrNull = (input) => (
  input === null || ['string', 'number', 'boolean'].indexOf(typeof input) > -1
);

/**
 * Convert the supplied pixel to REMs based on a 16px rem
 *
 * @param {number} px
 *
 * @returns {number} REM equivalent of supplied pixel value rounded
 *                   to 2 decimal places
 */
export const px2rems = (px) => Math.round((px / 16) * 100) / 100;

/**
 * Make the first alphabetical character in a string upper case.
 *
 * @param {string} _whole whole regular expression match
 * @param {string} pre    preceeding non-alpha characters
 * @param {string} first  first alpha character
 *
 * @returns {string} with the first alphabetical character converted
 *                   to uppercase
 */
const ucFirstInner = (_whole, pre, first) => (pre + first.toUpperCase());

/**
 * Make the first alphabetical character in a string uppercase.
 *
 * @param {string} input String to be modified
 *
 * @returns {string} string with first alphabetical character
 *                   uppercased.
 */
export const ucFirst = (input) => input.trim().replace(/([^a-z]*)([a-z])/i, ucFirstInner);

/**
 * Convert string to different format string
 * e.g. human string to camelCase string or
 *      kebab case string to snake case
 *
 * @param {string} input    string to be modified
 * @param {string} splitter character to split string on
 *                          (empty if input is camelCase)
 * @param {string} joiner   character to use as string joiner
 *                          (if empty if output is camelCase)
 *
 * @returns {string} modified version of input string
 */
export const stringToOther = (input, splitter = ' ', joiner = '') => {
  let _split = splitter;

  if (splitter === '') {
    _split = /(?<=[^A-Z])(?=[A-Z])/g;
  }

  const tmp = input.split(_split).map((item) => item.trim().toLowerCase());

  if (joiner === '') {
    for (let b = 1; b < tmp.length; b += 1) {
      tmp[b] = ucFirst(tmp[b]);
    }
  }

  return tmp.join(joiner);
};

/**
 * Convert a human readable string into a variable name format
 *
 * @param {string} input  String to be converted
 * @param {string} output Variable format.
 *                        Options are:
 *                        * `camel` [default] e.g. "myVarName"
 *                        * `snake` - e.g. "my_var_name"
 *                        * `SNAKE` - e.g. "MY_VAR_NAME"
 *                        * `kebab` - e.g. "my-var-name"
 *                        * `class` - e.g. "MyVarName"
 *                        * `dot` - e.g. "my.var.name"
 *
 * @returns {string}
 */
export const humanTo = (input, output = 'camel') => {
  switch (output) {
    case 'snake':
      return stringToOther(input, ' ', '_');
    case 'SNAKE':
      return stringToOther(input, ' ', '_').toUpperCase();
    case 'class':
      return ucFirst(stringToOther(input));
    case 'kebab':
      return stringToOther(input, ' ', '-');
    case 'dot':
      return stringToOther(input, ' ', '.');
    default:
      return stringToOther(input);
  }
};

/**
 * Recursively compare two objects.
 *
 * If a difference is encountered, FALSE is immediately returned.
 *
 * > __Note:__ The second object __*MUST*__must include all the
 * >           properties of the first object but can also include
 * >           any number of other properties.
 * >           Properties that are not in the first object are
 * >           ignored.
 *
 * @param {object} obj1 First object to be compared
 *                      (usually user updated values)
 * @param {object} obj2 Second object to be compared.
 *                      (usually data received from the server)
 *
 * @returns {boolean} TRUE if all properties (and their children) of
 *                    the first object have the same value in obj2.
 *                    FALSE otherwise
 * @throws {Error} If either argument are not objects
 * @throws {Error} If a property from obj1 is missing in obj2
 */
export const objectsAreSame = (obj1, obj2) => {
  if (typeof obj1 !== 'object') {
    throw new Error(
      'deepCompare() expects first property `obj1` to be an '
      + `object. "${typeof obj1}" given.`,
    );
  }

  if (typeof obj1 !== 'object') {
    throw new Error(
      'deepCompare() expects first property `obj2` to be an '
      + `object. "${typeof obj2}" given.`,
    );
  }

  const keys1 = Object.keys(obj1);

  for (let a = 0; a < keys1.length; a += 1) {
    if (typeof obj2[keys1[a]] === 'undefined') {
      throw new Error(
        'deepCompare() expects obj2 to have the same properties as '
        + `obj1. obj2 is missing property: "${keys1[a]}"`,
      );
    }

    if (obj1[keys1[a]] !== obj2[keys1[a]]) {
      return false;
    }

    if (typeof obj1[keys1[a]] === 'object') {
      if (!objectsAreSame(obj1[keys1[a]], obj2[keys1[a]])) {
        return false;
      }
    }
  }

  return true;
};
