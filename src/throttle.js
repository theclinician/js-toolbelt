const getGlobalSetTimeout = () => setTimeout;

export function throttleKey(action, {
  ms = 1000,
  makeKey = first => first,
  setTimeout = getGlobalSetTimeout(),
}) {
  const timeouts = {};
  const next = {};

  const call = (key, args) => {
    timeouts[key] = setTimeout(() => {
      if (next[key]) {
        const temp = next[key];
        delete next[key];
        call(key, temp);
      } else {
        delete timeouts[key];
      }
    }, ms);
    action(...args);
  };

  return function wrapped(...args) {
    const key = makeKey(...args);
    if (timeouts[key]) {
      next[key] = args;
    } else {
      call(key, args);
    }
  };
}

export function throttle(action, options) {
  return throttleKey(action, {
    ...options,
    makeKey: () => '',
  });
}
