#!/usr/bin/env node
import path from "node:path";

import { initWorkspace } from "./init-workspace.js";

function usage(): string {
  return [
    "Usage:",
    "  create-asciidoc-multi-book-workspace <target>",
    "",
    "Examples:",
    "  pnpm create asciidoc-multi-book-workspace my-books",
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

  const result = await initWorkspace({ targetDir: target, force: args.includes("--force") });
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
