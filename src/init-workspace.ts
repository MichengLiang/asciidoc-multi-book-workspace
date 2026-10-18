import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  defaultWorkspaceCopies,
  packageJsonTemplate,
  templatePackageNamePlaceholder,
  type TemplateCopy
} from "./template-manifest.js";

export interface InitWorkspaceOptions {
  targetDir: string;
  force?: boolean;
}

export interface InitWorkspaceResult {
  targetDir: string;
  packageName: string;
}

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(sourceDir, "..");
const templatesRoot = path.join(packageRoot, "templates");
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

async function createWorkspace(
  options: InitWorkspaceOptions,
  copies: readonly TemplateCopy[]
): Promise<InitWorkspaceResult> {
  const targetDir = path.resolve(options.targetDir);
  const targetExists = await exists(targetDir);

  if (targetExists && !options.force && !await isEmptyDirectory(targetDir)) {
    throw new Error(`target directory is not empty: ${targetDir}`);
  }

  await mkdir(targetDir, { recursive: true });

  for (const { from, to } of copies) {
    await cp(path.join(templatesRoot, from), path.join(targetDir, to), {
      force: true,
      recursive: true
    });
  }

  const packageTemplate = await readFile(path.join(templatesRoot, packageJsonTemplate), "utf8");
  const packageName = safePackageName(path.basename(targetDir));
  await writeFile(
    path.join(targetDir, "package.json"),
    packageTemplate.replaceAll(templatePackageNamePlaceholder, packageName),
    "utf8"
  );

  await mkdir(path.join(targetDir, "tools"), { recursive: true });
  await cp(runtimeScript, path.join(targetDir, "tools", "adoc-books.mjs"), { force: true });
  return { targetDir, packageName };
}

export async function initWorkspace(options: InitWorkspaceOptions): Promise<InitWorkspaceResult> {
  return createWorkspace(options, defaultWorkspaceCopies);
}
