import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  defaultWorkspaceTemplate,
  templatePackageNamePlaceholder
} from "./template-manifest.js";

export interface InitWorkspaceOptions {
  targetDir: string;
  force?: boolean;
}

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(sourceDir, "..");
const templateRoot = path.join(packageRoot, "templates", defaultWorkspaceTemplate);
const runtimeScript = path.join(packageRoot, "dist", "runtime", "adoc-books.mjs");

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isEmptyDirectory(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir);
    return entries.length === 0;
  } catch {
    return true;
  }
}

function safePackageName(rawName: string): string {
  const normalized = rawName
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9._~-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
  return normalized || "asciidoc-books";
}

async function copyTemplatePath(name: string, targetDir: string): Promise<void> {
  await cp(path.join(templateRoot, name), path.join(targetDir, name), {
    force: true,
    recursive: true
  });
}

export async function initWorkspace(options: InitWorkspaceOptions): Promise<string> {
  const targetDir = path.resolve(options.targetDir);
  const targetExists = await exists(targetDir);

  if (targetExists && !options.force && !await isEmptyDirectory(targetDir)) {
    throw new Error(`target directory is not empty: ${targetDir}`);
  }

  await mkdir(targetDir, { recursive: true });

  for (const name of ["README.md", "catalog.adoc", "books", "shared"]) {
    await copyTemplatePath(name, targetDir);
  }

  const packageTemplate = await readFile(path.join(templateRoot, "package.json.template"), "utf8");
  const packageName = safePackageName(path.basename(targetDir));
  await writeFile(
    path.join(targetDir, "package.json"),
    packageTemplate.replaceAll(templatePackageNamePlaceholder, packageName),
    "utf8"
  );

  await writeFile(
    path.join(targetDir, ".gitignore"),
    await readFile(path.join(templateRoot, "gitignore.template"), "utf8"),
    "utf8"
  );

  await mkdir(path.join(targetDir, "tools"), { recursive: true });
  await cp(runtimeScript, path.join(targetDir, "tools", "adoc-books.mjs"), { force: true });
  return targetDir;
}
