/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

/**
 * Convert empty strings (and non-strings) to NULL otherwise return
 * the string with any leading or trailing white space removed
 *
 * @param {string|null} input Value to be checked
 *
 * @returns {string|null}
 */
export const empty2null = (input) => {
  const output = (typeof input === 'string')
    ? input.trim()
    : null;

  return output !== ''
    ? output
    : null;
};

/**
 * Check whether a value is empty or null
 *
 * @param {any} input value to be tested
 *
 * @returns {boolean} TRUE if input is undefined, NULL or empty string
 */
export const emptyOrNull = (input) => {
  const t = typeof input;

  return (t === 'undefined' || input === null || input === 0
    || (t === 'string' && input.trim() === ''));
};

export const formatDate = (isoDate) => {
  const tmp = (typeof isoDate === 'string')
    ? new Date(isoDate)
    : isoDate;

  if ((tmp instanceof Date) === false) {
    throw new Error('formatDate() could not convert input into Date object');
  }

  return tmp.toLocaleDateString(
    'en-AU',
    { day: 'numeric', month: 'short', year: 'numeric' },
  )
}

/**
 * Make an Australian phone number human readable
 *
 * e.g. mobile number: "0412345678" would be returned
 *      as: "0412 345 678"
 * e.g. fixed line number: "0298765432" would be returned
 *      as "02 9876 5432"
 *
 * @param {string} phone Phone number to be formatted
 *
 * @returns {string} Human readable Sustralian phone number
 */
export const formatPhone = (phone) => {
  const tmp = phone.replace(/[^0-9]+/, '');
  const pre = tmp.substring(0, 2);

  const regex = (pre === '04' || pre === '05')
    ? /(0[45][0-9]{2})([0-9]{3})([0-9]{3})/
    : /(0[1-36-9])([0-9]{4})([0-9]{4})/;

  return tmp.replace(regex, '$1 $2 $3');
};

/**
 * Get a function that returns the start of an error message
 * (or console group name) string for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
export const getEpre = (componentName, componentID = '') => {
  const tail = (componentID !== '')
    ? ` (#${componentID})`
    : '';

  return (method) => `${componentName}.${method}()${tail} `;
};

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
export const hasContent = (component, attr, slot = '') => (
  (attr !== '' && typeof component[attr] === 'string' && component[attr].trim() !== '')
  || (slot !== '' && typeof component.$slots[slot] !== 'undefined' && component.$slots[slot].length > 0)
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
 * Check whether the input is a plain JavaScript object.
 *
 * @param {unknown} input A value that may be an object
 *
 * @returns {boolean} TRUE if the input ins an object (and not nul
 *                    and not an array). FALSE otherwise
 */
export const isObj = (input) => (Object.prototype.toString.call(input) === '[object Object]');

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
  let tmp = [];

  if (splitter === '') {
    // We are using match for splitting camel case because before
    // 2023-03-27 iOS Safari does not support lookbehind syntax and
    // throws an error
    tmp = input.match(/([A-Z]?[^A-Z]+)(?=[A-Z]|$)/g);
  } else {
    tmp = input.split(splitter);
  }

  tmp = tmp.map((item) => item.trim().toLowerCase());

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
  if (isObj(obj1) === false) {
    throw new Error(
      'deepCompare() expects first property `obj1` to be an '
      + `object. "${typeof obj1}" given.`,
    );
  }

  if (isObj(obj2) === false) {
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

    if (isObj(obj1[keys1[a]]) || isObj(obj2[keys1[a]])) {
      if (obj1[keys1[a]] === null || obj2[keys1[a]] === null
        || !objectsAreSame(obj1[keys1[a]], obj2[keys1[a]])
      ) {
        return false;
      }
    } else if (obj1[keys1[a]] !== obj2[keys1[a]]) {
      return false;
    }
  }

  return true;
};

/**
 * Add HTML zero width space character entity to email address to
 * make it wrap after the `@` symbol
 *
 * > __Note:__ If you do this, the string must be rendered from
 * >           within a v-html attribute, which allows any HTML.
 *
 * > __Note also:__ For security reasons this function also filters
 * >           out almost all non-alphanumeric characters
 *
 * > __Final note:__ The email address output by this function may be
 * >           invalid when copied and pasted into an email "To",
 * >           "CC" or "BCC" field
 *
 * @param {string} email Email address to make wrappable
 *
 * @returns {string} email address that will wrap when line gets
 *                   too long.
 */
export const wrappableEmail = (email) => email.replace(/[^@a-z0-9.-_']+/, '').replace('@', '@&ZeroWidthSpace;');
