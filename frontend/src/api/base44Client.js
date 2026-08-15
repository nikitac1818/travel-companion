// Drop-in replacement for the Base44 SDK client that the exported pages import
// as `import { base44 } from "@/api/base44Client"`. Backed by Supabase (auth +
// Postgres) and our own Express backend (for LLM calls / email), so the page
// components underneath didn't need to be rewritten one by one.

import { supabase } from "@/lib/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// ---------- auth ----------

async function me() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email,
    ...profile,
  };
}

async function updateMe(data) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, ...data }, { onConflict: "id" });

  if (upsertError) throw upsertError;
  return me();
}

// Kept for API-compatibility with the original pages; actual login/signup UI
// now lives directly in the Auth page using supabase.auth, since Base44 no
// longer hosts the login flow for us.
async function redirectToLogin(afterLoginPath = "/") {
  window.location.href = `/auth?redirect=${encodeURIComponent(afterLoginPath)}`;
}

async function logout() {
  await supabase.auth.signOut();
}

const auth = { me, updateMe, redirectToLogin, logout };

// ---------- entities (generic Postgres table CRUD via Supabase) ----------

const TABLE_MAP = {
  Trip: "trips",
  Booking: "bookings",
  Review: "reviews",
  EmergencyContact: "emergency_contacts",
};

function makeEntity(tableName) {
  return {
    // filter(queryObj, sort, limit) — sort like "-created_date" means DESC on created_date
    async filter(query = {}, sort, limit) {
      let q = supabase.from(tableName).select("*");
      for (const [key, value] of Object.entries(query)) {
        if (key === "created_by") {
          // we store the owning user's email as created_by for parity with Base44
          q = q.eq("created_by", value);
        } else {
          q = q.eq(key, value);
        }
      }
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async list(sort, limit) {
      let q = supabase.from(tableName).select("*");
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const row = { ...payload, created_by: user?.email };
      const { data, error } = await supabase.from(tableName).insert(row).select().single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    },
  };
}

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith("-");
  const column = desc ? sort.slice(1) : sort;
  return query.order(column, { ascending: !desc });
}

const entities = Object.fromEntries(
  Object.entries(TABLE_MAP).map(([name, table]) => [name, makeEntity(table)])
);

// ---------- integrations (routed through our own backend, not Base44) ----------

async function InvokeLLM({ prompt, add_context_from_internet, response_json_schema }) {
  const res = await fetch(`${BACKEND_URL}/api/llm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, add_context_from_internet, response_json_schema }),
  });
  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

async function SendEmail({ to, subject, body }) {
  const res = await fetch(`${BACKEND_URL}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, body }),
  });
  if (!res.ok) throw new Error(`Email request failed: ${res.status}`);
  return res.json();
}

const integrations = { Core: { InvokeLLM, SendEmail } };

export const base44 = { auth, entities, integrations };
