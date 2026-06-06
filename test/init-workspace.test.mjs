import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { initWorkspace } from "../dist/init-workspace.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const expectedBooks = [
  "00-book-anatomy",
  "01-starter-book",
  "02-multipart-monograph",
  "03-technical-book-workflow",
  "04-reference-manual",
  "05-upper-volume",
  "06-lower-volume"
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("initWorkspace creates the complete default user workspace", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `init-complete-${randomUUID()}`);

  const result = await initWorkspace({ targetDir: target });

  assert.deepEqual(result, {
    targetDir: target,
    packageName: path.basename(target)
  });
  assert.equal(await exists(path.join(target, "README.md")), true);
  assert.equal(await exists(path.join(target, "catalog.adoc")), true);
  assert.equal(await exists(path.join(target, "package.json")), true);
  assert.equal(await exists(path.join(target, ".gitignore")), true);
  assert.equal(await exists(path.join(target, "gitignore.template")), false);
  assert.equal(await exists(path.join(target, "tools", "adoc-books.mjs")), true);
  assert.equal(await exists(path.join(target, "shared", "attributes.adoc")), true);
  assert.equal(await exists(path.join(target, "shared", "images", "workspace-map.svg")), true);

  const books = await readdir(path.join(target, "books"));
  assert.deepEqual(books.sort(), expectedBooks);
});

test("initWorkspace output excludes maintainer-only assets", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `init-clean-${randomUUID()}`);

  await initWorkspace({ targetDir: target });

  for (const forbidden of [".github", "test", "src", "dist", "DESIGN.adoc", "scripts"]) {
    assert.equal(await exists(path.join(target, forbidden)), false, forbidden);
  }

  const runtime = await readFile(path.join(target, "tools", "adoc-books.mjs"), "utf8");
  assert.doesNotMatch(runtime, /sampleContractIssuesForWorkspace|check-sample-contract/);
});

test("initWorkspace renders user package.json with visible AsciiDoc dependencies", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `init-package-${randomUUID()}`);

  await initWorkspace({ targetDir: target });

  const packageJson = JSON.parse(await readFile(path.join(target, "package.json"), "utf8"));
  assert.equal(packageJson.name, path.basename(target));
  assert.equal(packageJson.private, true);
  assert.deepEqual(packageJson.scripts, {
    build: "node tools/adoc-books.mjs build",
    check: "node tools/adoc-books.mjs check",
    clean: "node tools/adoc-books.mjs clean"
  });
  assert.deepEqual(packageJson.engines, { node: ">=20.19.0" });
  assert.equal(packageJson.packageManager, "pnpm@10.33.0");
  assert.equal(packageJson.devDependencies["@asciidoctor/reducer"], "1.1.2");
  assert.equal(packageJson.devDependencies.asciidoctor, "2.2.9");
  assert.equal(packageJson.devDependencies["asciidoctor-kroki"], "0.18.1");
});

test("initWorkspace refuses a non-empty target unless force is enabled", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `init-non-empty-${randomUUID()}`);
  await initWorkspace({ targetDir: target });

  await assert.rejects(
    () => initWorkspace({ targetDir: target }),
    /target directory is not empty/
  );

  await writeFile(path.join(target, "notes.txt"), "keep me", "utf8");
  await initWorkspace({ targetDir: target, force: true });
  assert.equal(await readFile(path.join(target, "notes.txt"), "utf8"), "keep me");
});

test("package root exports the workspace initializer API", async () => {
  const api = await import("create-asciidoc-multi-book-workspace");
  const target = path.join(repoRoot, "tmp", "test-fixtures", `init-public-api-${randomUUID()}`);

  const result = await api.initWorkspace({ targetDir: target });

  assert.deepEqual(result, {
    targetDir: target,
    packageName: path.basename(target)
  });
  assert.equal(await exists(path.join(target, "tools", "adoc-books.mjs")), true);
});
