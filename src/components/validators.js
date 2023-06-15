const sanitiseAustPhone = (input) => input.replace(/[^0-9]+/g, '').substring(0, 10);
const errPre = 'Please enter a valid ';

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
  title: '',
  url: `${errPre}website address (URL)`,
  money: `${errPre}dollar amount`,
}

export default {
  anyphone: {
    pattern: '^0[234578][0-9]{8}$',
    placeholder: 'e.g. 0291234567',
    error: errTxt.anyphone,
    validate: (input) => (input.match(/^0[45][0-9]{8}$/) ? '' : errTxt.anyphone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  fixedphone: {
    pattern: '^0[2378][0-9]{8}$',
    placeholder: 'e.g. 0291234567',
    error: errTxt.fixedphone,
    validate: (input) => (input.match(/^0[2378][0-9]{8}$/) ? '' : errTxt.fixedphone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  mobilephone: {
    pattern: '^0[45][0-9]{8}$',
    placeholder: 'e.g. 0412345678',
    error: errTxt.mobilephone,
    validate: (input) => (input.match(/^0[45][0-9]{8}$/) ? '' : errTxt.mobilephone),
    sanitise: sanitiseAustPhone,
    preIcon: '',
    postIcon: '',
  },

  intphone: {
    pattern: '^\+[0-9]{6-14}$',
    placeholder: 'e.g. +61291234567',
    error: errTxt.intphone,
    validate: (input) => input.match(/^\+[0-9]{6-14}$/)
      ? ''
      : errTxt.intphone,
    sanitise: (input) => (input.replace(/[^+0-9]+/g, '').replace(/(?<=.)\+/g, '').substring(0, 15)),
    preIcon: '',
    postIcon: '',
  },

  email: {
    pattern: '^[\d\w_.\'\-]+@[\d\w\-]+(?:\.[\d\w\-]+)*(?:\.[a-z]+){1,2}$',
    placeholder: 'e.g. robbie@example.com',
    error: '',
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

      if (tmp[0].trim() === '' ||
          domain === '' ||
          _email.includes('example') ||
          _email.includes('test') ||
          domain.match(ipPattern) ||
          domain.match(/:[0-9]{1,5}/)
      ) {
          return errTxt.email;
      }

      const regex = /^[\d\w_.\'\-]+@[\d\w\-]+(?:\.[\d\w\-]+)*(?:\.[a-z]+){1,2}$/i;

      return _email.match(regex)
        ? ''
        : errTxt.email;
    },
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  postcodepobox: {
    pattern: '',
    placeholder: '',
    error: errTxt.postcodepobox,
    validate: null,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  postcodestreet: {
    pattern: '',
    placeholder: 'e.g. sam@example.com.au',
    error: errTxt.postcodestreet,
    validate: null,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  postcode: {
    pattern: '^0[289][0-9]{2}|[1-9][0-9]{3}$',
    placeholder: 'e.g. 2001',
    error: errTxt.postcode,
    validate: null,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  name: {
    pattern: '^[^\w \-.\']+$',
    placeholder: 'e.g. Dale',
    error: errTxt.name,
    validate: null,
    sanitise: (input) => (input.replace(/[^\w \-.\']+/ig, ' ' ).replace(/\d+(?:\.\d+)*/g, ' ').replace(/([ \-.\'])+/g, '$1').trim()),
    preIcon: '',
    postIcon: '',
  },

  title: {
    pattern: '^[^\w\d&, \-_.?:!()<>\/\']+$',
    placeholder: '',
    error: '',
    validate: null,
    sanitise: (input) => (title.replace(/[^\w\d&, \-_.?:!\'()]+/ig, '').replace(/([&, \-_.?:!\'()])\1+/ig, '$1')),
  },

  url: {
    pattern: '^https?:\/\/[\d\w\-]+(?:\.[\d\w\-]+)*(?:\.[a-z]+){1,2}',
    placeholder: 'e.g. https://google.com',
    error: errTxt.url,
    validate: null,
    sanitise: null,
    preIcon: '',
    postIcon: '',
  },

  money: {
    pattern: '^[0-9]{7}(?:\.[0-9]{2})?$',
    placeholder: 'e.g. 89.37',
    error: errTxt.money,
    validate: null,
    sanitise: (input) => (input.replace(/[^0-9\.]+/g, '').replace(/^0+(?=[1-9.])/, '').replace(/^([0-9]+\.[0-9]{2}).*$/, '$1').substring(0, 10)),
    preIcon: 'attach_money',
    postIcon: '',
  },
};
