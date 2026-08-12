// Real cross-device storage backed by Supabase, matching the same
// get/set/delete/list API the app already uses.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ceqcvumhabpsfdpvxxxg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_BCF8EMfMCffCa1X7KUlqYQ_54Usi3tX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function install() {
  window.storage = {
    async get(key, shared = false) {
      const { data, error } = await supabase
        .from("kv_store")
        .select("v")
        .eq("k", key)
        .eq("shared", shared)
        .maybeSingle();
      if (error || !data) throw new Error("not found");
      return { key, value: data.v, shared };
    },

    async set(key, value, shared = false) {
      const { error } = await supabase
        .from("kv_store")
        .upsert(
          { k: key, v: value, shared, updated_at: new Date().toISOString() },
          { onConflict: "k" }
        );
      if (error) {
        console.error("storage.set error:", error.message);
        return null;
      }
      return { key, value, shared };
    },

    async delete(key, shared = false) {
      const { error } = await supabase
        .from("kv_store")
        .delete()
        .eq("k", key)
        .eq("shared", shared);
      if (error) return null;
      return { key, deleted: true, shared };
    },

    async list(prefix = "", shared = false) {
      const { data, error } = await supabase
        .from("kv_store")
        .select("k")
        .eq("shared", shared)
        .like("k", `${prefix}%`);
      if (error) return null;
      return { keys: (data || []).map((r) => r.k), prefix, shared };
    },
  };
}

install();
