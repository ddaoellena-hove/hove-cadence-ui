#!/usr/bin/env node
// Codemod boutons v2 (@ddaoellena/cadence-ui 0.3.0).
//
//   node scripts/codemods/buttons-v2.mjs [--dry] [--report] <fichiers ou dossiers…>
//
// - PrimaryButton outline               → inchangé (variante contour conservée)
// - SecondaryButton outline             → PrimaryButton outline size="sm"
// - SecondaryButton plein               → PrimaryButton size="sm" + TODO (rôle à vérifier)
// - withIcon left / right / only + icon → iconStart / iconEnd / icon + aria-label
// - destructive                         → tone="danger"
// - size medium / large                 → md (défaut, retiré) / lg ; SecondaryButton : sm / md
// - state, iconMap                      → retirés (state="disabled" → disabled)
// - imports mis à jour.
// Les cas qu'il ne sait pas trancher reçoivent un commentaire « TODO buttons-v2 ».
// Fichiers traités : .ts .tsx .js .jsx (en entier) et .md .mdx (blocs ```tsx / ```jsx).
//
// Basé sur l'API du compilateur TypeScript (déjà en devDependencies) :
// remplacements ciblés par position, la mise en forme est conservée.

import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TODO = "TODO buttons-v2";
const BUTTONS = new Set(["PrimaryButton", "SecondaryButton"]);

// ── Lecture des attributs ──────────────────────────────────────────────────

/** Valeur statique d'un attribut : true (sans valeur), chaîne, booléen, ou null si dynamique. */
const staticValue = (attr, sf) => {
  if (!attr.initializer) return true;
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const e = attr.initializer.expression;
    if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  }
  return null;
};

const attrText = (attr, sf) => (attr.initializer ? attr.initializer.getText(sf) : null);

/** Texte de la valeur pour un message : `{expr}` → `expr`. */
const valueText = (attr, sf) =>
  attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression
    ? attr.initializer.expression.getText(sf)
    : attrText(attr, sf);

// ── Transformation d'un élément ────────────────────────────────────────────

/**
 * Calcule les remplacements pour un élément <PrimaryButton> / <SecondaryButton>.
 * Renvoie { edits, newTag, todos }.
 */
const transformElement = (opening, closing, sf) => {
  const tag = opening.tagName.getText(sf);
  const attrs = new Map();
  for (const prop of opening.attributes.properties) {
    if (ts.isJsxAttribute(prop)) attrs.set(prop.name.getText(sf), prop);
  }
  const edits = [];
  const todos = [];
  const remove = (attr) => {
    // Retire l'attribut et l'espace qui le précède
    const start = attr.getFullStart();
    edits.push({ start, end: attr.getEnd(), text: "" });
  };
  const replace = (attr, text) => edits.push({ start: attr.getStart(sf), end: attr.getEnd(), text });
  const add = []; // attributs à ajouter après le nom de balise

  const isSecondary = tag === "SecondaryButton";
  // outline est conservé tel quel : PrimaryButton garde sa variante contour
  const outline = attrs.get("outline");

  // destructive
  const destructive = attrs.get("destructive");
  if (destructive) {
    const v = staticValue(destructive, sf);
    if (v === true) replace(destructive, 'tone="danger"');
    else if (v === false) remove(destructive);
    else replace(destructive, `tone={${destructive.initializer.expression.getText(sf)} ? "danger" : "default"}`);
  }

  // size
  const size = attrs.get("size");
  const sizeValue = size ? staticValue(size, sf) : undefined;
  const mapSize = (v) => (isSecondary ? { medium: "sm", large: "md" }[v] : { medium: "md", large: "lg" }[v]);
  if (size && (sizeValue === "medium" || sizeValue === "large")) {
    const next = mapSize(sizeValue);
    if (next === "md" && !isSecondary) remove(size); // md est le défaut
    else replace(size, `size="${next}"`);
  } else if (size && sizeValue === null) {
    todos.push(`size dynamique (${valueText(size, sf)}) : convertir medium/large en sm/md/lg`);
  } else if (!size && isSecondary) {
    add.push('size="sm"');
  }

  // state / iconMap
  const state = attrs.get("state");
  if (state) {
    const v = staticValue(state, sf);
    if (v === "disabled" && !attrs.has("disabled")) replace(state, "disabled");
    else remove(state);
    if (v === null) todos.push(`state dynamique supprimé (${valueText(state, sf)}) : utiliser disabled si besoin`);
  }
  const iconMap = attrs.get("iconMap");
  if (iconMap) remove(iconMap);

  // withIcon + icon + label
  const withIcon = attrs.get("withIcon");
  const icon = attrs.get("icon");
  const label = attrs.get("label");
  if (withIcon) {
    const v = staticValue(withIcon, sf);
    if (v === null) {
      todos.push(`withIcon dynamique (${valueText(withIcon, sf)}) : utiliser iconStart / iconEnd / icon`);
    } else {
      remove(withIcon);
      if (v === "left" && icon) replace(icon, `iconStart=${attrText(icon, sf)}`);
      if (v === "right" && icon) replace(icon, `iconEnd=${attrText(icon, sf)}`);
      if ((v === "left" || v === "right") && !icon) add.push(`${v === "left" ? "iconStart" : "iconEnd"}="map-01"`);
      if (v === "no" && icon) remove(icon);
      if (v === "only") {
        if (!icon) add.push('icon="map-01"');
        if (label) {
          replace(label, `aria-label=${attrText(label, sf)}`);
        } else if (!attrs.has("aria-label")) {
          add.push('aria-label=""');
          todos.push("icône seule sans libellé : renseigner aria-label");
        }
      }
    }
  }

  // Nouveau nom de composant : SecondaryButton → PrimaryButton (outline conservé)
  let newTag = tag;
  if (isSecondary) {
    newTag = "PrimaryButton";
    if (!outline) todos.push('ancien bouton secondaire plein → PrimaryButton size="sm" : vérifier le rôle (principal, ou GhostButton ?)');
  }
  if (newTag !== tag) {
    edits.push({ start: opening.tagName.getStart(sf), end: opening.tagName.getEnd(), text: newTag });
    if (closing) edits.push({ start: closing.tagName.getStart(sf), end: closing.tagName.getEnd(), text: newTag });
  }
  if (add.length) edits.push({ start: opening.tagName.getEnd(), end: opening.tagName.getEnd(), text: ` ${add.join(" ")}` });

  return { edits, newTag, todos };
};

/** Commentaire TODO placé avant l'élément, en JSX ou en JS selon le contexte. */
const todoEdit = (node, sf, messages, code) => {
  const start = node.getStart(sf);
  const lineStart = code.lastIndexOf("\n", start - 1) + 1;
  const indent = code.slice(lineStart, start).match(/^\s*/)[0];
  const inJsx = ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent);
  const body = `${TODO} : ${messages.join(" ; ")}`;
  const onOwnLine = code.slice(lineStart, start).trim() === "";
  const comment = inJsx ? `{/* ${body} */}` : `/* ${body} */`;
  return { start, end: start, text: onOwnLine ? `${comment}\n${indent}` : `${comment} ` };
};

// ── Imports ────────────────────────────────────────────────────────────────

const importEdits = (sf, used, code) => {
  const edits = [];
  // Imports par composant (« ./PrimaryButton », « ./SecondaryButton ») : un seul
  // bloc réémis à la place du premier, les suivants sont retirés
  let perComponentDone = false;
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause?.namedBindings) continue;
    const bindings = stmt.importClause.namedBindings;
    if (!ts.isNamedImports(bindings)) continue;
    const source = stmt.moduleSpecifier.text;
    const names = bindings.elements.map((e) => e.name.text);
    if (!names.some((n) => BUTTONS.has(n))) continue;

    const perComponent = /\/(PrimaryButton|SecondaryButton)$/.test(source);
    if (perComponent) {
      // import { SecondaryButton } from "./SecondaryButton" → un import par composant utilisé
      const dir = source.replace(/\/(PrimaryButton|SecondaryButton)$/, "");
      const others = names.filter((n) => !BUTTONS.has(n));
      const lines = perComponentDone ? [] : [...used].sort().map((n) => `import { ${n} } from "${dir}/${n}";`);
      perComponentDone = true;
      if (others.length) lines.unshift(`import { ${others.join(", ")} } from "${source}";`);
      // Déclaration vidée : on retire aussi son retour à la ligne
      const end = lines.length === 0 && code[stmt.getEnd()] === "\n" ? stmt.getEnd() + 1 : stmt.getEnd();
      edits.push({ start: stmt.getStart(sf), end, text: lines.join("\n") });
    } else {
      // Import du paquet (ou de l'index) : on ajuste la liste
      const kept = names.filter((n) => !BUTTONS.has(n) || used.has(n));
      for (const n of used) if (!kept.includes(n)) kept.push(n);
      const typeOnly = bindings.elements.filter((e) => e.isTypeOnly).map((e) => e.name.text);
      const list = kept.map((n) => (typeOnly.includes(n) ? `type ${n}` : n));
      const original = bindings.getText(sf);
      const multiline = original.includes("\n");
      const indent = multiline ? (original.match(/\n(\s+)/)?.[1] ?? "  ") : "";
      const text = multiline ? `{\n${indent}${list.join(`, `)},\n}` : `{ ${list.join(", ")} }`;
      edits.push({ start: bindings.getStart(sf), end: bindings.getEnd(), text });
    }
  }
  return edits;
};

// ── Transformation d'un source TS/JSX ──────────────────────────────────────

const applyEdits = (code, edits) => {
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let out = code;
  for (const e of sorted) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
};

const parse = (code, fileName) =>
  ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

/**
 * Transforme un source. Renvoie { code, changed, todos }.
 * `withImports` : false pour un extrait de documentation.
 */
export const transformSource = (code, fileName = "fichier.tsx", { withImports = true } = {}) => {
  const sf = parse(code, fileName);
  const edits = [];
  const todos = [];
  const used = new Set();
  let changed = false;

  const visit = (node) => {
    const opening = ts.isJsxSelfClosingElement(node) ? node : ts.isJsxElement(node) ? node.openingElement : null;
    if (opening && BUTTONS.has(opening.tagName.getText(sf))) {
      const closing = ts.isJsxElement(node) ? node.closingElement : null;
      const result = transformElement(opening, closing, sf);
      if (result.edits.length || result.todos.length) changed = true;
      edits.push(...result.edits);
      if (result.todos.length) {
        edits.push(todoEdit(node, sf, result.todos, code));
        todos.push(...result.todos.map((t) => ({ line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, message: t })));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  // Composants de bouton encore référencés après transformation (JSX, meta de
  // story, types…), hors imports et commentaires : parcours de l'AST transformé
  const after = parse(applyEdits(code, edits), fileName);
  const collect = (node) => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && ["PrimaryButton", "SecondaryButton", "GhostButton"].includes(node.text)) used.add(node.text);
    ts.forEachChild(node, collect);
  };
  collect(after);

  if (changed && withImports) edits.push(...importEdits(sf, used, code));
  return { code: changed ? applyEdits(code, edits) : code, changed, todos };
};

/** Un extrait de doc peut être du JSX nu (plusieurs racines) : on l'enveloppe si besoin. */
const transformSnippet = (snippet) => {
  const direct = parse(snippet, "extrait.tsx");
  if (!direct.parseDiagnostics?.length) return transformSource(snippet, "extrait.tsx", { withImports: true });
  const prefix = "const __extrait = (<>\n";
  const suffix = "\n</>);";
  const wrapped = transformSource(prefix + snippet + suffix, "extrait.tsx", { withImports: false });
  return { ...wrapped, code: wrapped.code.slice(prefix.length, wrapped.code.length - suffix.length) };
};

/** Markdown / MDX : transforme les blocs ```tsx et ```jsx. */
export const transformMarkdown = (text) => {
  const todos = [];
  let changed = false;
  const lines = text.split("\n");
  const code = text.replace(/```(tsx|jsx)\n([\s\S]*?)```/g, (block, lang, snippet, offset) => {
    const result = transformSnippet(snippet);
    if (!result.changed) return block;
    changed = true;
    const firstLine = text.slice(0, offset).split("\n").length + 1;
    todos.push(...result.todos.map((t) => ({ line: firstLine + t.line - 1, message: t.message })));
    return `\`\`\`${lang}\n${result.code}\`\`\``;
  });
  void lines;
  return { code, changed, todos };
};

// ── CLI ────────────────────────────────────────────────────────────────────

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"]);
const IGNORED = new Set(["node_modules", "dist", "storybook-static", ".git"]);

const listFiles = (path) => {
  const stat = statSync(path);
  if (stat.isFile()) return EXTENSIONS.has(extname(path)) ? [path] : [];
  return readdirSync(path).flatMap((name) => (IGNORED.has(name) ? [] : listFiles(join(path, name))));
};

const main = (argv) => {
  const dry = argv.includes("--dry");
  const report = argv.includes("--report");
  const targets = argv.filter((a) => !a.startsWith("--"));
  if (targets.length === 0) {
    console.error("Usage : node scripts/codemods/buttons-v2.mjs [--dry] [--report] <fichiers ou dossiers…>");
    process.exit(1);
  }
  const files = targets.flatMap(listFiles);
  const modified = [];
  const allTodos = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (!/PrimaryButton|SecondaryButton/.test(source)) continue;
    const isMarkdown = /\.mdx?$/.test(file);
    const result = isMarkdown ? transformMarkdown(source) : transformSource(source, file);
    if (!result.changed) continue;
    modified.push(file);
    allTodos.push(...result.todos.map((t) => ({ file, ...t })));
    if (!dry) writeFileSync(file, result.code);
  }
  console.log(`${dry ? "[simulation] " : ""}${modified.length} fichier(s) modifié(s) sur ${files.length} analysé(s).`);
  if (report || dry) for (const f of modified) console.log(`  ✎ ${f}`);
  if (allTodos.length) {
    console.log(`${allTodos.length} « ${TODO} » à relire :`);
    for (const t of allTodos) console.log(`  ${t.file}:${t.line}  ${t.message}`);
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
