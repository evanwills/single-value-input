/**
 * This file exports a collection of validation configuration objects.
 *
 * Each object is intended for providing settings, functions, error
 * messages and icons for validating a commonly used input field
 * (e.g. mobile phone number).
 *
 * They are intended for use by the `WholeInputField` component
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

const sanitiseAddrLine = (input) => input.replace(/[^\-a-zA-Z0-9 ,.()/']+/, '');

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
  password: 'The password entered doesn\'t meet the requirements. '
    + 'Please ensure it is a minimum of 8 characters and includes '
    + 'an uppercase letter, a number and a special character.',
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
  // eslint-disable-next-line no-useless-escape
  addrLine: /^[\-a-zA-Z0-9 ,.()/']+$/,
  anyphone: /^0[234578][0-9]{8}$/,
  fixedphone: /^0[2378][0-9]{8}$/,
  mobilephone: /^0[45][0-9]{8}$/,
  intphone: /^\+[0-9]{8-14}$/,
  // eslint-disable-next-line no-useless-escape
  email: /^[a-z0-9]+[\-a-z0-9_.']*@[\-a-z0-9]+(?:\.[\-a-z0-9]+)*(?:\.[a-z]+){1,2}$/,
  postcode: /^0[289][0-9]{2}|[1-9][0-9]{3}$/,
  // eslint-disable-next-line no-useless-escape
  name: /^[\-a-zA-Z .']+$/,
  // eslint-disable-next-line no-useless-escape
  title: /^[\-a-zA-Z0-9 ,.&?:!()<>/']+$/,
  // eslint-disable-next-line no-useless-escape
  password: /^[\-a-zA-Z0-9`~!@#$%^&*()_+{}|:";'<>?,./\\[\]]{8,64}$/,
};

const reg2pat = (_regex) => {
  const output = _regex.toString().replace(/^\/\^|\$\/$/g, '');
  return output;
  // return _regex.toString().replace(/^\/\^|\$\/$/g, '');
};

/**
 * Object containing validation for different types of input field
 */
export default {
  addressline: {
    pattern: reg2pat(regex.addrLine),
    placeholder: 'e.g. 123 Smith Street',
    error: '',
    validate: null,
    sanitise: sanitiseAddrLine,
    preIcon: '',
    postIcon: '',
  },
  anyphone: {
    pattern: reg2pat(regex.anyphone),
    placeholder: 'e.g. 0291234567',
    error: errTxt.anyphone,
    validate: (input) => (input.match(regex.anyphone) ? '' : errTxt.anyphone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  fixedphone: {
    pattern: reg2pat(regex.fixedphone),
    placeholder: 'e.g. 0291234567',
    error: errTxt.fixedphone,
    validate: (input) => (input.match(regex.fixedphone) ? '' : errTxt.fixedphone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  mobilephone: {
    pattern: reg2pat(regex.mobilephone),
    placeholder: 'e.g. 0412345678',
    error: errTxt.mobilephone,
    validate: (input) => (input.match(regex.mobilephone) ? '' : errTxt.mobilephone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  intphone: {
    pattern: reg2pat(regex.intphone),
    placeholder: 'e.g. +61291234567',
    error: errTxt.intphone,
    validate: (input) => (input.match(regex.intphone) ? '' : errTxt.intphone),
    sanitise: (input) => (input.replace(/[^+0-9]+/g, '').replace(/([^+]+)\+/g, '$1').substring(0, 15)),
    preIcon: '',
    postIcon: '',
  },

  email: {
    pattern: reg2pat(regex.email), // eslint-disable-line
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
    pattern: reg2pat(regex.postcode),
    placeholder: '',
    error: errTxt.postcode,
    validate: null,
    sanitise: sanitisePostCode,
    preIcon: '',
    postIcon: '',
  },

  postcodestreet: {
    pattern: reg2pat(regex.postcode),
    placeholder: 'e.g. 2001',
    error: errTxt.postcode,
    validate: null,
    sanitise: sanitisePostCode,
    preIcon: '',
    postIcon: '',
  },

  postcode: {
    pattern: reg2pat(regex.postcode),
    placeholder: 'e.g. 2001',
    error: errTxt.postcode,
    validate: null,
    sanitise: sanitisePostCode,
    preIcon: '',
    postIcon: '',
  },

  name: {
    pattern: reg2pat(regex.name), // eslint-disable-line
    placeholder: 'e.g. Dale',
    error: errTxt.name,
    validate: null,
    sanitise: (input) => (input.replace(/[^a-zA-Z .'-]+/ig, ' ').replace(/([- .'])\1+/g, '$1').replace(/([- .']{3})[- .']+/g, '$1')),
    preIcon: '',
    postIcon: '',
  },

  title: {
    pattern: reg2pat(regex.title), // eslint-disable-line
    placeholder: '',
    error: '',
    validate: null,
    sanitise: (input) => (input.replace(/[^a-zA-Z0-9&, _.?:!'()-]+/ig, '').replace(/([&, \-_.?:!\'()])\1+/ig, '$1')), // eslint-disable-line
    preIcon: '',
    postIcon: '',
  },

  url: {
    pattern: 'https?://[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*(?:\.[a-z]+){1,2}', // eslint-disable-line
    placeholder: 'e.g. https://google.com',
    error: `${errPre}website address (URL)`,
    validate: null,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  money: {
    pattern: '[0-9]{7}(?:\.[0-9]{2})?', // eslint-disable-line
    placeholder: 'e.g. 89.37',
    error: `${errPre}dollar amount`,
    validate: null,
    sanitise: (input) => sanitiseNumber(
      input,
      [/^.*([0-9]{1,7}(?:\.[0-9]{2})?).*$/],
      10,
    ),
    preIcon: 'attach_money',
    postIcon: '',
  },

  /**
   * Validation for percent input fields
   *
   * @property {object}
   */
  percent: {
    pattern: '[0-9]{1,3}(?:\.[0-9]{1,3})?', // eslint-disable-line
    placeholder: 'e.g. 89.37',
    error: `${errPre}percentage`,
    validate: null,
    sanitise: (input) => sanitiseNumber(
      input,
      [/^.*?([0-9]{1,3}(?:\.[0-9]{1,3})?).*$/],
      7,
    ),
    preIcon: '',
    postIcon: 'percent',
  },

  password: {
    error: errTxt.password,
    pattern: reg2pat(regex.password),
    placeholder: '',
    postIcon: '',
    preIcon: '',
    sanitise: null,
    validate: (input) => { // eslint-disable-line arrow-body-style
      return (input.match(regex.password) === null
        || input.match(/[A-Z]+/) === null
        || input.match(/[0-9]+/) === null
        || input.match(/[`~!@#$%^&*()\-=_+/[\]\\{}|;':",./<>?]/) === null)
        ? errTxt.password
        : '';
    },
  },
};
