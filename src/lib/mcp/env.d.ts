// The MCP tool files below are bundled into a Supabase Edge Function (Deno)
// by @lovable.dev/mcp-js at build time. `process.env` is available at runtime
// there. This ambient declaration keeps the Vite/browser typecheck happy
// without pulling Node types into the whole app.
declare const process: { env: Record<string, string | undefined> };