/**
 * This file exports a collection of validation configuration objects.
 *
 * Each object is intended for providing settings, functions, error
 * messages and icons for validating a commonly used input field
 * (e.g. mobile phone number).
 *
 * They are intended for use by the `SingleValueInput` component
*/

/**
 * Remove unwanted and/or excess characters from an Australian phone
 * number input field
 *
 * @param {string} input Value for phone number input
 *
 * @returns {string} clean phone number value
 */
const sanitiseAustPhone = (input) => input.replace(/[^0-9]+/gs, '').substring(0, 10);

/**
 * Remove unwanted and/or excess characters from an Australian post
 * codes number input field
 *
 * @param {string} input Value for phone number input
 *
 * @returns {string} clean phone number value
 */
const sanitisePostCode = (input) => input.replace(/[^0-9]+/gs, '').substring(0, 4);

/**
 * Sanitise any positive number
 *
 * @param {string} input  Value entered by user
 * @param {Array}  extras List of regular expressions or arrays with
 *                        regular expression and string replacement
 *                        to be applied to input
 * @param {number} max    Maximum number of characters the output
 *                        should be.
 *
 * @returns {string}
 */
const sanitiseNumber = (input, extras, max) => {
  // strip non-number chanracters
  let output = input.replace(/[^0-9.]+/gs, '')
    // strip unwanted leading zeros
    .replace(/^(?:0+(?=[1-9])|0+?(?=0\.))/, '');

  for (let a = 0; a < extras.length; a += 1) {
    output = output.replace(extras[a], '$1');
  }

  return (typeof max === 'number' && max > 0)
    ? output.substring(0, max)
    : output;
};

/**
 * Standard prefix for error messages when field validation fails
 *
 * @var {string}
 */
const errPre = 'Please enter a valid ';

/**
 * A collection of error messages that can/should be displayed when
 * input validation fails
 *
 * @var {Object<string>}
 */
const errTxt = {
  anyphone: `${errPre}Australian phone number`,
  fixedphone: `${errPre}Australian fixed line phone number`,
  mobilephone: `${errPre}Australian mobile phone number`,
  intphone: `${errPre}international phone number (including country code)`,
  email: `${errPre}email address`,
  postcodepobox: '',
  postcodestreet: '',
  postcode: `${errPre}Australian post code`,
  name: 'Please enter a name',
};

/**
 * A collection of regular expressions that are use multiple times
 * for validation and "pattern" attribute values
 *
 * > NOTE: A number of the regular expressions have seemingly
 * >       redundant escape characters. This is because they are used
 * >       as the pattern attribute for some text fields and some
 * >       browsers (Chrome) complain when the characters are not
 * >       escaped.
 *
 * @var {Object<RegExp>}
 */
const regex = {
  anyphone: /^0[234578][0-9]{8}$/,
  fixedphone: /^0[2378][0-9]{8}$/,
  mobilephone: /^0[45][0-9]{8}$/,
  intphone: /^\+[0-9]{8-14}$/,
  email: /^[a-z0-9_\.'\-]+@[a-z0-9\-]+(?:\.[a-z0-9-]+)*(?:\.[a-z]+){1,2}$/, // eslint-disable-line
  postcode: /^0[289][0-9]{2}|[1-9][0-9]{3}$/,
  name: /^[a-zA-Z \-\.']+$/, // eslint-disable-line
  title: /^[a-zA-Z0-9 ,\.\&\?:!\(\)<>\/'\-]+$/, // eslint-disable-line
};

const passwordValidation = (input) => {
  const uc = /[A-Z]/;
  const num = /[0-9]/;
  const spec = /[- `~!@#$%^&*()_+={}[\]|\\:";'<>?,./]/;

  return (input.length < 8 || !input.match(uc) || !input.match(num) || !input.match(spec))
    ? 'The password entered doesn\'t meet the requirements. '
      + 'Please ensure it is a minimum of 8 characters and includes '
      + 'an uppercase letter, a number and a special character.'
    : '';
};

export default {
  anyphone: {
    pattern: regex.anyphone,
    placeholder: 'e.g. 0291234567',
    error: errTxt.anyphone,
    validate: (input) => (input.match(regex.anyphone) ? '' : errTxt.anyphone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  fixedphone: {
    pattern: regex.fixedphone,
    placeholder: 'e.g. 0291234567',
    error: errTxt.fixedphone,
    validate: (input) => (input.match(regex.fixedphone) ? '' : errTxt.fixedphone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  mobilephone: {
    pattern: regex.mobilephone,
    placeholder: 'e.g. 0412345678',
    error: errTxt.mobilephone,
    validate: (input) => (input.match(regex.mobilephone) ? '' : errTxt.mobilephone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  intphone: {
    pattern: regex.intphone,
    placeholder: 'e.g. +61291234567',
    error: errTxt.intphone,
    validate: (input) => (input.match(regex.intphone) ? '' : errTxt.intphone),
    sanitise: (input) => (input.replace(/[^+0-9]+/g, '').replace(/(?<=.)\+/g, '').substring(0, 15)),
    preIcon: '',
    postIcon: '',
  },

  email: {
    pattern: regex.email, // eslint-disable-line
    placeholder: 'e.g. robbie@example.com',
    error: errTxt.email,
    validate: (email) => {
      const _email = email.trim();

      if (_email.length > 192) {
        return errTxt.email;
      }

      const ipPattern = /(?:[01][0-9]{2}|[1-9][0-9]?|2(?:[0-4][0-9]|5[0-5]))(?:\.(?:[01][0-9]{2}|[1-9][0-9]?|2(?:[0-4][0-9]|5[0-5]))){3}/;

      const tmp = _email.toLowerCase().split('@');

      if (tmp.length !== 2) {
        return errTxt.email;
      }

      const domain = tmp[1].trim();

      if (tmp[0].trim() === ''
          || domain === ''
          || _email.includes('example')
          || _email.includes('test')
          || domain.match(ipPattern)
          || domain.match(/:[0-9]{1,5}/)
      ) {
        return errTxt.email;
      }

      return _email.match(regex.email)
        ? ''
        : errTxt.email;
    },
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  postcodepobox: {
    pattern: regex.postcode,
    placeholder: '',
    error: errTxt.postcode,
    validate: null,
    sanitise: sanitisePostCode,
    preIcon: '',
    postIcon: '',
  },

  postcodestreet: {
    pattern: regex.postcode,
    placeholder: 'e.g. 2001',
    error: errTxt.postcode,
    validate: null,
    sanitise: sanitisePostCode,
    preIcon: '',
    postIcon: '',
  },

  postcode: {
    pattern: regex.postcode,
    placeholder: 'e.g. 2001',
    error: errTxt.postcode,
    validate: null,
    sanitise: sanitisePostCode,
    preIcon: '',
    postIcon: '',
  },

  name: {
    pattern: regex.name, // eslint-disable-line
    placeholder: 'e.g. Dale',
    error: errTxt.name,
    validate: null,
    sanitise: (input) => (input.replace(/[^a-zA-Z .'-]+/ig, ' ').replace(/([- .'])\1+/g, '$1').replace(/(?<=[- .']{3})[- .']+/g, '')),
    preIcon: '',
    postIcon: '',
  },

  title: {
    pattern: regex.title, // eslint-disable-line
    placeholder: '',
    error: '',
    validate: null,
    sanitise: (input) => (input.replace(/[^a-zA-Z0-9&, _.?:!'()-]+/ig, '').replace(/([&, \-_.?:!\'()])\1+/ig, '$1')), // eslint-disable-line
    preIcon: '',
    postIcon: '',
  },

  url: {
    pattern: '^https?://[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*(?:\.[a-z]+){1,2}', // eslint-disable-line
    placeholder: 'e.g. https://google.com',
    error: `${errPre}website address (URL)`,
    validate: null,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  money: {
    pattern: '^[0-9]{7}(?:\.[0-9]{2})?$', // eslint-disable-line
    placeholder: 'e.g. 89.37',
    error: `${errPre}dollar amount`,
    validate: null,
    sanitise: (input) => sanitiseNumber(
      input, [/^.*([0-9]{1,7}(?:\.[0-9]{2})?).*$/], 10,
    ),
    preIcon: 'attach_money',
    postIcon: '',
  },

  password: {
    pattern: '',
    placeholder: '',
    error: '',
    validate: passwordValidation,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  /**
   * Validation for percent input fields
   *
   * @property {object}
   */
  percent: {
    pattern: '^[0-9]{1,3}(?:\.[0-9]{1,3})?$', // eslint-disable-line
    placeholder: 'e.g. 89.37',
    error: `${errPre}percentage`,
    validate: null,
    sanitise: (input) => sanitiseNumber(
      input, [/^.*?([0-9]{1,3}(?:\.[0-9]{1,3})?).*$/], 7,
    ),
    preIcon: '',
    postIcon: 'percent',
  },
};
