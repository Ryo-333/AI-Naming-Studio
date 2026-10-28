import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import vm from "node:vm";

// Run with Node 24: node --experimental-vm-modules --test tests/sync-outages.test.mjs
// Execute the real store with in-memory browser storage and a scripted Supabase client.
const source = stripTypeScriptTypes(await readFile(new URL("../src/lib/store.ts", import.meta.url), "utf8"));
const key = "ans.collections.v1";
const local = [{ id: "default", title: "My Favorites", names: [{ id: "local", name: "Aster", category: "baby" }] }];
const remote = [{ id: "default", title: "My Favorites", names: [{ id: "remote", name: "Ren", category: "baby" }] }];

async function harness(options = {}) {
  const storage = new Map([[key, JSON.stringify(local)]]);
  const operations = [];
  let sessionCalls = 0;
  const sb = {
    auth: {
      async getSession() {
        sessionCalls++;
        if (options.sessionThrows) throw new Error("Session unavailable");
        if (options.sessionError) return { data: { session: null }, error: { message: "Refresh unavailable" } };
        return { data: { session: options.signedOut || (options.expireBeforePush && sessionCalls > 1) ? null : { user: { id: "user-1" } } }, error: null };
      },
    },
    from(table) {
      assert.equal(table, "user_collections");
      return {
        select(columns) {
          return { async eq(column, user) {
            assert.equal(column, "user_id");
            assert.equal(user, "user-1");
            const operation = columns === "id" ? "list" : "pull";
            operations.push(operation);
            return { data: operation === "pull" ? remote : options.stale ? [{ id: "stale" }] : [], error: options.fail === operation ? { message: `${operation} unavailable` } : null };
          } };
        },
        async upsert(rows) {
          operations.push("push");
          assert.equal(rows[0].user_id, "user-1");
          if (options.pushThrows) throw new Error("Network unavailable");
          return { error: options.fail === "push" ? { message: "push unavailable" } : null };
        },
        delete() {
          return { eq(column, user) {
            assert.equal(column, "user_id");
            assert.equal(user, "user-1");
            return { async in() {
              operations.push("delete");
              return { error: options.fail === "delete" ? { message: "delete unavailable" } : null };
            } };
          } };
        },
      };
    },
  };
  const context = vm.createContext({
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
    window: { dispatchEvent() {} }, Event: class {}, setTimeout, clearTimeout,
  });
  const module = new vm.SourceTextModule(source, { context });
  await module.link(specifier => {
    const exports = specifier === "react"
      ? { useCallback() {}, useEffect() {}, useState() {} }
      : specifier === "./supabase" ? { getSupabase: () => options.unconfigured ? null : sb } : null;
    assert.ok(exports, `Unexpected import: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return { api: module.namespace, storage, operations };
}

test("successful pull and push merges names and reports success", async () => {
  const { api, storage, operations } = await harness();
  assert.equal((await api.syncNow()).ok, true);
  assert.equal(api.getSyncState().state, "synced");
  assert.deepEqual(JSON.parse(storage.get(key))[0].names.map(n => n.name), ["Aster", "Ren"]);
  assert.deepEqual(operations, ["pull", "push", "list"]);
});

for (const fail of ["pull", "push", "list", "delete"]) {
  test(`${fail} failure is reported and preserves local favorites`, async () => {
    const { api, storage, operations } = await harness({ fail, stale: true });
    const result = await api.syncNow();
    assert.equal(result.ok, false);
    assert.equal(result.message, `${fail} unavailable`);
    assert.equal(api.getSyncState().state, "error");
    assert.equal(JSON.parse(storage.get(key))[0].names[0].name, "Aster");
    if (fail === "pull") assert.equal(storage.get(key), JSON.stringify(local));
    if (fail === "push" || fail === "pull") assert.ok(!operations.includes("delete"));
  });
}

for (const scenario of ["sessionThrows", "sessionError", "pushThrows"]) {
  test(`${scenario} returns an error instead of rejecting or claiming success`, async () => {
    const { api, storage } = await harness({ [scenario]: true });
    assert.equal((await api.syncNow()).ok, false);
    assert.equal(api.getSyncState().state, "error");
    assert.equal(JSON.parse(storage.get(key))[0].names[0].name, "Aster");
  });
}

for (const scenario of ["signedOut", "expireBeforePush", "unconfigured"]) {
  test(`${scenario} cannot report a successful cloud save`, async () => {
    const { api, storage, operations } = await harness({ [scenario]: true });
    assert.equal((await api.syncNow()).ok, false);
    assert.ok(!operations.includes("push"));
    assert.equal(JSON.parse(storage.get(key))[0].names[0].name, "Aster");
  });
}
