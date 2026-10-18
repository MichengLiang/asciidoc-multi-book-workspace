import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..");
const createScript = path.join(repoRoot, "dist", "create.js");

test("create CLI --solo creates the one-book workspace", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `cli-solo-${randomUUID()}`);

  const { stdout } = await execFileAsync("node", [createScript, target, "--solo"], { encoding: "utf8" });

  assert.match(stdout, /Created AsciiDoc multi-book workspace in /);
  assert.deepEqual(await readdir(path.join(target, "books")), ["01-structured-writing-conventions"]);
});

test("create CLI without --solo creates the default sample workspace", async () => {
  const target = path.join(repoRoot, "tmp", "test-fixtures", `cli-default-${randomUUID()}`);

  await execFileAsync("node", [createScript, target], { encoding: "utf8" });

  const books = await readdir(path.join(target, "books"));
  assert.equal(books.length, 8);
  assert.equal(books.includes("07-structured-writing-conventions"), true);
});

test("create CLI --help documents --solo", async () => {
  const { stdout } = await execFileAsync("node", [createScript, "--help"], { encoding: "utf8" });

  assert.match(stdout, /--solo/);
});
