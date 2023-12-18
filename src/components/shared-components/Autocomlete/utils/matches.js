// Polyfill for element.matches, to support Internet Explorer. It's a relatively
// simple polyfill, so we'll just include it rather than require the user to
// include the polyfill themselves. Adapted from
// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
export default (element, selector) => {
  if (element.matches) {
    return element.matches(selector);
  }

  if (element.msMatchesSelector) {
    return element.msMatchesSelector(selector);
  }

  if (element.webkitMatchesSelector) {
    return element.webkitMatchesSelector(selector);
  }
  return null;
};
