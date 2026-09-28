/* Replacement for the `window.storage` shim the original single-file
   prototype relied on (it only existed inside its original sandbox).
   Exposes the same {get(key, x), set(key, value, x), delete(key, x)}
   shape, backed by localStorage, so persistence works standalone. The
   second argument is accepted for call-site compatibility and ignored. */
const storage = {
  async get(key) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? undefined : { value };
    } catch (e) {
      return undefined;
    }
  },
  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable, keep in memory only */
    }
  },
  async delete(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
  },
};

export default storage;
