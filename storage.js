// Standalone stand-in for Claude's window.storage API, backed by localStorage.
// NOTE: "shared" storage here is still just this browser's localStorage —
// it will NOT sync between different people's devices. To make the Live Room
// work across real users, swap this file for calls to a real backend
// (e.g. Supabase) using the same get/set/delete/list method signatures.

const PREFIX = "ca-study";
const ns = (shared) => `${PREFIX}:${shared ? "shared" : "personal"}:`;

function install() {
  window.storage = {
    async get(key, shared = false) {
      try {
        const raw = localStorage.getItem(ns(shared) + key);
        if (raw === null) throw new Error("not found");
        return { key, value: raw, shared };
      } catch (e) {
        throw e;
      }
    },
    async set(key, value, shared = false) {
      try {
        localStorage.setItem(ns(shared) + key, value);
        return { key, value, shared };
      } catch (e) {
        return null;
      }
    },
    async delete(key, shared = false) {
      try {
        localStorage.removeItem(ns(shared) + key);
        return { key, deleted: true, shared };
      } catch (e) {
        return null;
      }
    },
    async list(prefix = "", shared = false) {
      try {
        const full = ns(shared) + prefix;
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(full)) keys.push(k.slice(ns(shared).length));
        }
        return { keys, prefix, shared };
      } catch (e) {
        return null;
      }
    },
  };
}

install();
