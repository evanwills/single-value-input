/**
 * Check whether the data supplied infers it represents a child user
 *
 * Look through the properties of the supplied object and check if it
 * has `SchoolName`, if so assume it represents a child user.
 *
 * @param {object} data user data object
 *
 * @returns {boolean} TRUE if data is assumed to represent a child.
 *                    FALSE otherwise
 */
export const isChild = (data) => (typeof data.SchoolName === 'string');


export const mergeData = (oldData, newData) => {
  const keys = Object.keys(newData);
  const output = { ...oldData };

  for (let a = 0; a < keys.length; a += 1) {
    if (typeof output[keys[a]] !== 'undefined') {
      output[keys[a]] = newData[keys[a]];
    } else {
      throw new Error(`${keys[a]} is not a property in oldData`);
    }
  }

  return output;
};

export const updateObject = (object, updates) => {
  const result = {};

  Object.keys(object)
    .forEach((key) => {
      if (updates[key] !== null) {
        result[key] = (key in updates)
          ? updates[key]
          : object[key];
      } else {
        result[key] = object[key];
      }
    });

  return result;
}

/**
 * Merge user updated data into original data received from the
 * server so updates can be returned to the server.
 *
 * @param {object} oldData Original object to be updated
 * @param {object} newData New data to be merged into old data
 *                         before being sent to server
 * @param {string} dataKey Key for nested data (if appropriate);
 *
 * @returns {object} Deep clone of old data with new data merged in
 */
export const updateObjectNew = (oldData, newData, dataKey = '') => {
  // Deep copy source object
  const output = JSON.parse(JSON.stringify(oldData));

  let _dataKey = (typeof dataKey === 'undefined' || dataKey === null)
    ? ''
    : dataKey;

  if (typeof _dataKey !== 'string') {
    throw new Error(
      'utils.updateObject() expects third parameter `dataKey` '
      + 'to be a string',
    );
  }

  _dataKey = _dataKey.trim();

  if (_dataKey !== '') {
    if (typeof output[_dataKey] !== 'object') {
      throw new Error(
        `utils.updateObject() expects third parameter "${_dataKey}" `
        + 'to be a property name for the object to be updated.',
      );
    }

    output[_dataKey] = mergeData(output[_dataKey], newData);

    return output;
  }

  return mergeData(output, newData);
};

export const arrayRemoveValue = (arr, value) => arr.filter((el) => el !== value);

export const isValidFileType = (file) => {
  const allwedTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const tmpType = (typeof file.type === 'string')
    ? file.type.trim()
    : '';

  return (tmpType !== '' && allwedTypes.indexOf(tmpType) > -1);
}
