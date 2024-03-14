/**
 * This file contains a collection of "pure" function that help with
 * testing and modifying data from the server.
 *
 * Each function is exported so it can be easily unit tested.
 *
 * @file data-utils.js
 * @author Evan Wills <evan.wills@thesmithfamily.com.au>
 */

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

/**
 * Check whether the input is a plain JavaScript object.
 *
 * @param {unknown} input A value that may be an object
 *
 * @returns {boolean} TRUE if the input is an object (and not NULL
 *                    and not an array).
 *                    FALSE otherwise
 */
export const isObj = (input) => (Object.prototype.toString.call(input) === '[object Object]');
