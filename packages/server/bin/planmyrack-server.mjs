#!/usr/bin/env node
// Node 24+ strips TypeScript types natively, so the server runs from source: no build step, and
// the workspace packages it imports stay TypeScript too. Requires the .ts extensions used in
// src/, because Node does not rewrite a .js specifier to a .ts file.
import '../src/main.ts'
