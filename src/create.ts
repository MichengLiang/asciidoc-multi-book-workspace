#!/usr/bin/env node
import path from "node:path";

import { initSoloWorkspace, initWorkspace } from "./init-workspace.js";

function usage(): string {
  return [
    "Usage:",
    "  create-asciidoc-multi-book-workspace <target> [--solo] [--force]",
    "",
    "Options:",
    "  --solo   one book only: the structured writing conventions sample, shelved as",
    "           books/01-structured-writing-conventions",
    "  --force  write into a non-empty target; template output paths are overwritten,",
    "           other files are kept",
    "",
    "Examples:",
    "  pnpm create asciidoc-multi-book-workspace my-books",
    "  pnpm create asciidoc-multi-book-workspace my-book --solo",
    "  npm create asciidoc-multi-book-workspace@latest my-books"
  ].join("\n");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return;
  }

  const target = args.find((arg) => !arg.startsWith("-"));
  if (!target) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  const init = args.includes("--solo") ? initSoloWorkspace : initWorkspace;
  const result = await init({ targetDir: target, force: args.includes("--force") });
  const displayTarget = path.relative(process.cwd(), result.targetDir) || ".";
  console.log(`Created AsciiDoc multi-book workspace in ${displayTarget}`);
  console.log("");
  console.log("Next:");
  console.log(`  cd ${displayTarget}`);
  console.log("  pnpm install");
  console.log("  pnpm run build");
  console.log("");
  console.log("Open:");
  console.log("  build/html/index.html");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
