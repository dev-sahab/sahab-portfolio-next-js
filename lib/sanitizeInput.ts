/**
 * Strips MongoDB update-operator keys ($set, $unset, $rename, $inc, etc.)
 * from a client-supplied JSON object before it's passed to a Mongoose
 * write. Every dashboard write route does `const body = await req.json()`
 * and hands that object straight to `Model.create()` /
 * `findByIdAndUpdate(id, body)` — without this, a payload like
 * `{ "$rename": { "published": "whatever" } }` reaches Mongoose as a raw
 * update-operator document instead of a plain field update, letting an
 * already-permitted writer restructure the document in ways the dashboard
 * UI never intends (vibe-coding checklist prompt 4: check every API field
 * for injection).
 */
export function stripOperatorKeys<T extends Record<string, unknown>>(body: T): T {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (key.startsWith('$')) continue
    clean[key] = value
  }
  return clean as T
}
