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

// One book on its own shelf: sample book 07 is shelved as 01. The catalog and README are
// written for this shelf; shared/images/ stays behind because only the sample catalog uses it.
export const soloWorkspaceCopies: readonly TemplateCopy[] = [
  { from: "solo-workspace/README.md", to: "README.md" },
  { from: "solo-workspace/catalog.adoc", to: "catalog.adoc" },
  {
    from: "default-workspace/books/07-structured-writing-conventions",
    to: "books/01-structured-writing-conventions"
  },
  { from: "default-workspace/shared/attributes.adoc", to: "shared/attributes.adoc" },
  { from: "default-workspace/gitignore.template", to: ".gitignore" }
];
