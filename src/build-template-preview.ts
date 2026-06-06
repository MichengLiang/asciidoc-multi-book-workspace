#!/usr/bin/env node
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { initWorkspace } from "./init-workspace.js";

export interface RunCommandOptions {
  cwd: string;
}

export type RunCommand = (command: string, args: string[], options: RunCommandOptions) => Promise<void>;

export interface BuildTemplatePreviewOptions {
  previewRoot?: string;
  runCommand?: RunCommand;
  fresh?: boolean;
  install?: boolean;
}

export interface BuildTemplatePreviewResult {
  previewRoot: string;
  workspaceDir: string;
  htmlDir: string;
}

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(sourceDir, "..");
const defaultPreviewRoot = path.join(packageRoot, "build", "template-preview");
const templateWorkspacePaths = ["README.md", "catalog.adoc", "package.json", ".gitignore", "books", "shared", "tools"];

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function defaultRunCommand(command: string, args: string[], options: RunCommandOptions): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: process.platform === "win32",
      stdio: "inherit"
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });
}

export async function buildTemplatePreview(options: BuildTemplatePreviewOptions = {}): Promise<BuildTemplatePreviewResult> {
  const previewRoot = path.resolve(options.previewRoot ?? defaultPreviewRoot);
  const workspaceDir = path.join(previewRoot, "workspace");
  const htmlDir = path.join(workspaceDir, "build", "html");
  const legacyHtmlMirrorDir = path.join(previewRoot, "html");
  const installStamp = path.join(previewRoot, ".installed-package.json");
  const runCommand = options.runCommand ?? defaultRunCommand;
  const installDependencies = options.install === true || options.fresh === true;

  if (options.fresh) await rm(previewRoot, { force: true, recursive: true });
  await mkdir(previewRoot, { recursive: true });
  await mkdir(workspaceDir, { recursive: true });

  for (const name of templateWorkspacePaths) {
    await rm(path.join(workspaceDir, name), { force: true, recursive: true });
  }
  await initWorkspace({ targetDir: workspaceDir, force: true });

  if (installDependencies) {
    const packageJson = await readFile(path.join(workspaceDir, "package.json"), "utf8");
    const installedPackageJson = await exists(installStamp) ? await readFile(installStamp, "utf8") : "";
    if (
      !await exists(path.join(workspaceDir, "node_modules")) ||
      !await exists(path.join(workspaceDir, "pnpm-lock.yaml")) ||
      installedPackageJson !== packageJson
    ) {
      await runCommand("pnpm", ["install", "--ignore-workspace"], { cwd: workspaceDir });
      await writeFile(installStamp, packageJson, "utf8");
    }
  }

  if (installDependencies) {
    await runCommand("pnpm", ["run", "build"], { cwd: workspaceDir });
  } else {
    await runCommand("node", ["tools/adoc-books.mjs", "build"], { cwd: workspaceDir });
  }
  await rm(legacyHtmlMirrorDir, { force: true, recursive: true });

  return { previewRoot, workspaceDir, htmlDir };
}

async function main(): Promise<void> {
  const fresh = process.argv.includes("--fresh");
  const result = await buildTemplatePreview({
    fresh,
    install: fresh || process.argv.includes("--install")
  });
  const displayIndex = path.relative(process.cwd(), path.join(result.htmlDir, "index.html")) || "index.html";
  console.log(`Built template preview at ${displayIndex}`);
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const modulePath = fileURLToPath(import.meta.url);
if (executedPath === modulePath) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
