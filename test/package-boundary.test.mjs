import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";

const execFileAsync = promisify(execFile);

test("pnpm pack dry-run contains release assets and excludes maintainer-only files", async () => {
  const { stdout } = await execFileAsync("pnpm", ["pack", "--dry-run"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  for (const required of [
    "dist/create.js",
    "dist/init-workspace.js",
    "dist/runtime/adoc-books.mjs",
    "dist/template-manifest.js",
    "templates/default-workspace/package.json.template",
    "templates/default-workspace/gitignore.template",
    "templates/default-workspace/catalog.adoc",
    "templates/default-workspace/books/00-book-anatomy/book.adoc",
    "templates/default-workspace/books/06-lower-volume/book.adoc",
    "templates/default-workspace/shared/images/workspace-map.svg",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    "package.json"
  ]) {
    assert.equal(stdout.includes(required), true, required);
  }

  for (const forbidden of [
    "test/",
    ".github/",
    "src/",
    "DESIGN.adoc",
    "tsconfig.json",
    "scripts/",
    ".github/workflows/",
    "release-please-config.json",
    ".release-please-manifest.json"
  ]) {
    assert.equal(stdout.includes(forbidden), false, forbidden);
  }
});
