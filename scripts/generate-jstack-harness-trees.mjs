#!/usr/bin/env node

import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PSTACK = join(ROOT, "jstack");
const SKILLS = join(PSTACK, "skills");
// Outside jstack/ so Cursor, which copies the whole plugin folder, does not install this tree too.
const OUT = join(ROOT, "harness", "jstack");
// One installable tree per harness. Each tree carries its own adapter, and every Cursor name a skill uses needs a row in it.
const HARNESSES = [
  { tree: "claude-code", label: "Claude Code", adapter: "docs/harness/claude-code.md", manifests: ["plugin.json", ".claude-plugin/plugin.json"] },
  { tree: "pi", label: "pi", adapter: "docs/harness/pi.md", manifests: [] },
];
const GUIDE = "docs/guide";
const COMMAND = "node scripts/generate-jstack-harness-trees.mjs";
const LINK = /\]\(([^)\s]+)\)/g;
const README = `# jstack harness tree

This folder is generated from \`jstack/skills\`, \`jstack/agents\`, \`jstack/${GUIDE}\`, \`jstack/docs/harness\`, \`jstack/README.md\`, \`jstack/LICENSE\`, and \`jstack/plugin.json\`. Do not edit it by hand.

Cursor uses \`jstack/\` directly. Claude Code installs \`claude-code/\`, and pi installs \`pi/\`. Each tree leaves out the rest of \`jstack/\`, such as \`jstack/automations\` and \`jstack/assets\`. A relative link to a jstack file that a tree leaves out points at its absolute path in \`jstack/\` instead.

After editing those sources, run \`${COMMAND}\` from the repository root and commit the result.
`;

const TERMS = [
  { key: "`Task`", re: /`Task`|\bTask (tool|subagent|call)/ },
  { key: "`AskQuestion`", re: /AskQuestion/ },
  { key: "todolist", re: /\btodo ?list\b/i },
  { key: "generalPurpose", re: /generalPurpose/ },
  { key: "jstack-agent", re: /jstack-agent/ },
  { key: "comment-sicko", re: /comment-sicko/ },
  { key: "`readonly: true`", re: /readonly: (true|false)|readonly\/Ask/ },
  { key: "`environment: \"cloud\"`", re: /environment: "(cloud|local)"/ },
  { key: "cloud_base_branch", re: /cloud_base_branch/ },
  { key: "`run_in_background: true`", re: /run_in_background/ },
  { key: "`resume`", re: /`resume`/ },
  { key: "`file_attachments`", re: /file_attachments/ },
  { key: "claude-", re: /\bclaude-[a-z]+-\d/ },
  { key: "grok-", re: /\bgrok-\d/ },
  { key: "gpt-", re: /\bgpt-\d/ },
  { key: "inherit-parent", re: /inherit-parent/ },
  { key: "jstack-models.mdc", re: /jstack-models\.mdc/ },
  { key: ".cursor/skills/", re: /\.cursor\/skills/ },
  { key: "~/.cursor/plugins/", re: /\.cursor\/plugins|\.cursor-plugin/ },
  { key: ".cursor/rules/", re: /\.cursor\/rules|always-applied rule/ },
  { key: "agent-transcripts", re: /agent-transcripts|\.cursor\/projects/ },
  { key: "Cursor-only features", re: /Bugbot|Cursor [Aa]utomation|cursor\.(sh|com)\/automations|[Cc]loud [Aa]gent|built-in PR tool/ },
];
const ROUTE_KEY = "Run another jstack skill";
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === ".DS_Store" || name === "node_modules") return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function file(path) {
  return { bytes: readFileSync(path), executable: (statSync(path).mode & 0o111) !== 0 };
}

const skills = readdirSync(SKILLS).filter((name) => existsSync(join(SKILLS, name, "SKILL.md")));

function classify(skill) {
  const dir = join(SKILLS, skill);
  const others = skills.filter((name) => name !== skill).join("|");
  const route = new RegExp(`the \\*\\*(?<bold>${others})\\*\\* skill|\`/(?<command>${others})\``, "g");
  const linksToSkill = (line, name) => line.includes(`(../${name}/`);
  const namesBareSkill = (line) =>
    [...line.matchAll(route)].some(({ groups }) => !linksToSkill(line, groups.bold ?? groups.command));
  const usesCursorNames = new Set();
  for (const path of walk(dir).filter((path) => path.endsWith(".md"))) {
    const text = readFileSync(path, "utf8");
    for (const term of TERMS) if (term.re.test(text)) usesCursorNames.add(term.key);
    if (text.split("\n").some(namesBareSkill)) usesCursorNames.add(ROUTE_KEY);
  }
  const text = readFileSync(join(dir, "SKILL.md"), "utf8");
  const wrap = usesCursorNames.size > 0 && /^# /m.test(text);
  return { usesCursorNames, wrap };
}

const classes = new Map(skills.map((skill) => [skill, classify(skill)]));
const problems = [];
const users = new Map();
for (const [skill, { usesCursorNames, wrap }] of classes) {
  if (usesCursorNames.size > 0 && !wrap) problems.push(`skills/${skill}/SKILL.md uses Cursor names but has no H1`);
  for (const key of usesCursorNames) users.set(key, [...(users.get(key) ?? []), skill]);
  // Cursor runs a skill by its folder name and Claude Code lists it by its frontmatter `name`, so the two must match. The Agent Skills spec limits both to SKILL_NAME.
  const frontmatter = readFileSync(join(SKILLS, skill, "SKILL.md"), "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const name = frontmatter.match(/^name:(.*)$/m)?.[1].trim().replace(/^(["'])(.*)\1$/, "$2");
  if (name !== skill) problems.push(`skills/${skill}/SKILL.md has name ${JSON.stringify(name ?? "")}, not its folder name ${skill}`);
  if (!SKILL_NAME.test(skill) || skill.length > 64) problems.push(`skills/${skill} is not lowercase words joined by hyphens, at most 64 characters`);
}
for (const { label, adapter: path } of HARNESSES) {
  const adapter = readFileSync(join(PSTACK, path), "utf8");
  for (const [key, using] of users) {
    if (!adapter.includes(key)) problems.push(`${label} adapter has no row for ${key}, used by ${using.join(", ")}`);
  }
}
for (const problem of problems) console.log(`FAIL ${problem}`);
if (problems.length > 0) process.exit(1);

// The jstack-relative path that a relative link in `from` points at, if that path exists.
function resolve(from, href) {
  const target = href.replace(/[#?].*/, "");
  if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) return undefined;
  const path = posix.join(posix.dirname(from), target).replace(/\/$/, "");
  return existsSync(join(PSTACK, path)) ? path : undefined;
}

function has(files, path) {
  return files.has(path) || [...files.keys()].some((key) => key.startsWith(`${path}/`));
}

// pi-subagents reads `model` as a pi id and `async` for background launches, so the Cursor fields are translated.
function piAgent(text) {
  return text.replace(/^---\n([\s\S]*?)\n---/, (front, body) => {
    const lines = body.split("\n").flatMap((line) => {
      const model = line.match(/^model: (claude-[a-z]+-\d+-\d+)-([a-z]+)(?:-fast)?$/);
      if (model) return [`model: ${model[1]}`, `thinking: ${model[2]}`];
      if (/^model:/.test(line)) return [];
      if (/^is_background: true$/.test(line)) return ["async: true"];
      return [line];
    });
    // append keeps pi's base prompt and tool rules under the agent's own prompt.
    return `---\n${[...lines, "systemPromptMode: append"].join("\n")}\n---`;
  });
}

function render({ tree, label, adapter: ADAPTER, manifests }) {
  // Skills read the adapter, the guide, and the README at runtime, so Claude Code never fetches them.
  const copies = [
    ...walk(SKILLS),
    ...walk(join(PSTACK, "agents")),
    ...walk(join(PSTACK, GUIDE)),
    join(PSTACK, ADAPTER),
    join(PSTACK, "README.md"),
  ];
  const files = new Map(copies.map((path) => [relative(PSTACK, path), file(path)]));
  const line =
    `In ${label}, read [the ${label} adapter](../../${ADAPTER}) once per session before you follow this skill. ` +
    `It maps the Cursor names in jstack skills to ${label}.`;
  for (const [skill, { wrap }] of classes) {
    const path = `skills/${skill}/SKILL.md`;
    const text = files.get(path).bytes.toString("utf8");
    if (wrap) files.get(path).bytes = Buffer.from(text.replace(/^(# .*)\n+/m, `$1\n\n${line}\n\n`));
  }
  files.set("LICENSE", file(join(PSTACK, "LICENSE")));
  for (const manifest of manifests) files.set(manifest, file(join(PSTACK, "plugin.json")));
  if (tree === "pi") {
    const { version, description } = JSON.parse(readFileSync(join(PSTACK, "plugin.json"), "utf8"));
    const pkg = { name: "jstack", version, description, private: true, license: "MIT", keywords: ["pi-package"], pi: { skills: ["./skills"] }, "pi-subagents": { agents: ["./agents"] } };
    files.set("package.json", { bytes: Buffer.from(`${JSON.stringify(pkg, null, 2)}\n`), executable: false });
    for (const [path, entry] of files) {
      if (path.startsWith("agents/") && path.endsWith(".md")) entry.bytes = Buffer.from(piAgent(entry.bytes.toString("utf8")));
    }
  }
  for (const [path, entry] of files) {
    if (!path.endsWith(".md")) continue;
    const text = entry.bytes.toString("utf8").replace(LINK, (link, href) => {
      const target = resolve(path, href);
      if (!target || target.split("/")[0] === ".." || has(files, target)) return link;
      return `](${join(PSTACK, target)}${href.slice(href.search(/[#?]|$/))})`;
    });
    entry.bytes = Buffer.from(text);
  }
  return files;
}

// Each harness installs only its tree, so a relative link that works from jstack/ has to work inside the tree too.
// Links to jstack files that a tree leaves out already point at their absolute path, so a failure here is a link that leaves jstack/.
const rendered = new Map([["README.md", { bytes: Buffer.from(README), executable: false }]]);
const dangling = [];
for (const harness of HARNESSES) {
  const files = render(harness);
  for (const [path, entry] of files) {
    rendered.set(`${harness.tree}/${path}`, entry);
    if (!path.endsWith(".md")) continue;
    for (const [, href] of entry.bytes.toString("utf8").matchAll(LINK)) {
      const target = resolve(path, href);
      if (target && !has(files, target)) dangling.push(`harness/jstack/${harness.tree}/${path} links to ${href}, which is not in the tree`);
    }
  }
}
for (const link of dangling) console.log(`FAIL ${link}`);
if (dangling.length > 0) process.exit(1);

if (process.argv.includes("--check")) {
  const onDisk = new Map(existsSync(OUT) ? walk(OUT).map((path) => [relative(OUT, path), file(path)]) : []);
  const drifted = [...new Set([...rendered.keys(), ...onDisk.keys()])].sort().filter((path) => {
    const [want, have] = [rendered.get(path), onDisk.get(path)];
    return !want || !have || !want.bytes.equals(have.bytes) || want.executable !== have.executable;
  });
  for (const path of drifted.slice(0, 20)) console.log(`harness/jstack/${path}`);
  if (drifted.length > 0) {
    console.log(`harness/jstack is out of date. Run \`${COMMAND}\` and commit the result.`);
    process.exit(1);
  }
  console.log("harness/jstack is up to date.");
} else {
  rmSync(OUT, { recursive: true, force: true });
  for (const [path, { bytes, executable }] of rendered) {
    mkdirSync(dirname(join(OUT, path)), { recursive: true });
    writeFileSync(join(OUT, path), bytes);
    chmodSync(join(OUT, path), executable ? 0o755 : 0o644);
  }
  const wrapped = [...classes.values()].filter(({ wrap }) => wrap).length;
  console.log(`${skills.length} skills, ${wrapped} SKILL.md files with the adapter line, trees: ${HARNESSES.map(({ tree }) => tree).join(", ")}`);
}
