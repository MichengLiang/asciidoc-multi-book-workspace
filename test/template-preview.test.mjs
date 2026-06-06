import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { buildTemplatePreview } from "../dist/build-template-preview.js";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("buildTemplatePreview creates a maintainer preview workspace and reports its HTML output without installing dependencies", async () => {
  const previewRoot = path.join(repoRoot, "tmp", "test-fixtures", `template-preview-${randomUUID()}`);
  const commands = [];

  const result = await buildTemplatePreview({
    previewRoot,
    runCommand: async (command, args, options) => {
      commands.push({ command, args, cwd: options.cwd });
      if (args.join(" ") !== "tools/adoc-books.mjs build") return;

      const htmlDir = path.join(options.cwd, "build", "html");
      await mkdir(htmlDir, { recursive: true });
      await writeFile(path.join(htmlDir, "index.html"), "<!doctype html>\n<title>Preview</title>\n", "utf8");
    }
  });

  assert.equal(result.previewRoot, previewRoot);
  assert.equal(result.workspaceDir, path.join(previewRoot, "workspace"));
  assert.equal(result.htmlDir, path.join(result.workspaceDir, "build", "html"));

  assert.equal(await exists(path.join(result.workspaceDir, "package.json")), true);
  assert.equal(await exists(path.join(result.workspaceDir, "tools", "adoc-books.mjs")), true);
  assert.equal(await readFile(path.join(result.htmlDir, "index.html"), "utf8"), "<!doctype html>\n<title>Preview</title>\n");
  assert.equal(await exists(path.join(previewRoot, "html")), false);

  assert.deepEqual(commands, [
    { command: "node", args: ["tools/adoc-books.mjs", "build"], cwd: result.workspaceDir }
  ]);
});

test("buildTemplatePreview refreshes template-owned files while preserving local preview state", async () => {
  const previewRoot = path.join(repoRoot, "tmp", "test-fixtures", `template-preview-cache-${randomUUID()}`);
  const commands = [];

  const runCommand = async (command, args, options) => {
    commands.push({ command, args, cwd: options.cwd });

    const htmlDir = path.join(options.cwd, "build", "html");
    await mkdir(htmlDir, { recursive: true });
    await writeFile(path.join(htmlDir, "index.html"), "<!doctype html>\n<title>Preview</title>\n", "utf8");
  };

  const first = await buildTemplatePreview({ previewRoot, runCommand });
  await mkdir(path.join(first.workspaceDir, ".preview-cache"), { recursive: true });
  await writeFile(path.join(first.workspaceDir, ".preview-cache", "kept.txt"), "keep local preview state", "utf8");
  await mkdir(path.join(first.workspaceDir, "books", "stale-book"), { recursive: true });
  await writeFile(path.join(first.workspaceDir, "books", "stale-book", "book.adoc"), "= Stale\n", "utf8");

  commands.length = 0;
  const second = await buildTemplatePreview({ previewRoot, runCommand });

  assert.equal(await readFile(path.join(second.workspaceDir, ".preview-cache", "kept.txt"), "utf8"), "keep local preview state");
  assert.equal(await exists(path.join(second.workspaceDir, "books", "stale-book", "book.adoc")), false);
  assert.deepEqual(commands, [
    { command: "node", args: ["tools/adoc-books.mjs", "build"], cwd: second.workspaceDir }
  ]);
});

test("buildTemplatePreview installs generated workspace dependencies only when requested", async () => {
  const previewRoot = path.join(repoRoot, "tmp", "test-fixtures", `template-preview-install-${randomUUID()}`);
  const commands = [];

  await buildTemplatePreview({
    previewRoot,
    install: true,
    runCommand: async (command, args, options) => {
      commands.push({ command, args, cwd: options.cwd });
      if (args.join(" ") === "install --ignore-workspace") {
        await mkdir(path.join(options.cwd, "node_modules"), { recursive: true });
        await writeFile(path.join(options.cwd, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n", "utf8");
        return;
      }

      const htmlDir = path.join(options.cwd, "build", "html");
      await mkdir(htmlDir, { recursive: true });
      await writeFile(path.join(htmlDir, "index.html"), "<!doctype html>\n<title>Preview</title>\n", "utf8");
    }
  });

  const workspaceDir = path.join(previewRoot, "workspace");
  assert.deepEqual(commands, [
    { command: "pnpm", args: ["install", "--ignore-workspace"], cwd: workspaceDir },
    { command: "pnpm", args: ["run", "build"], cwd: workspaceDir }
  ]);
});
