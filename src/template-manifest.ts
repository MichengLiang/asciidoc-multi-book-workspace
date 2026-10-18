export interface TemplateCopy {
  /** Path under `templates/`. */
  from: string;
  /** Path inside the generated workspace. */
  to: string;
}

export const templatePackageNamePlaceholder = "{{name}}";

// Rendered with the target's package name instead of copied, so it stays outside the copy
// tables; every workspace shape renders this same file.
export const packageJsonTemplate = "default-workspace/package.json.template";

// A copy table is the complete list of template content a workspace shape receives;
// the initializer adds only the rendered package.json and tools/adoc-books.mjs.
// `gitignore.template` exists because npm drops `.gitignore` files from published packages.
export const defaultWorkspaceCopies: readonly TemplateCopy[] = [
  { from: "default-workspace/README.md", to: "README.md" },
  { from: "default-workspace/catalog.adoc", to: "catalog.adoc" },
  { from: "default-workspace/books", to: "books" },
  { from: "default-workspace/shared", to: "shared" },
  { from: "default-workspace/gitignore.template", to: ".gitignore" }
];
