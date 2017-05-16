const getGlobalSetTimeout = () => setTimeout;
const getGlobalClearTimeout = () => clearTimeout;

export function debounceKey(action, {
  ms = 1000,
  makeKey = first => first,
  setTimeout = getGlobalSetTimeout(),
  clearTimeout = getGlobalClearTimeout(),
}) {
  const timeouts = {};
  return function wrapped(...args) {
    const key = makeKey(...args);
    if (timeouts[key]) {
      clearTimeout(timeouts[key]);
    }
    timeouts[key] = setTimeout(function () {
      action.apply(this, args);
      delete timeouts[key];
    }, ms);
  };
}

export function debounce(action, options) {
  return debounceKey(action, {
    ...options,
    makeKey: () => '',
  });
}
