/**
 * Run ESLint on changed files only (no --fix). Exits 1 if there are lint errors.
 * Used in pre-commit after format:changed to reject commit when errors remain.
 */
const { execSync, spawnSync } = require("child_process");
const path = require("path");

const extensions = [".ts", ".tsx", ".js", ".jsx"];
const root = path.resolve(__dirname, "..");
const packageName = path.basename(root);

function getRepoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
  } catch {
    return root;
  }
}

function getChangedFiles() {
  try {
    const repoRoot = getRepoRoot();
    const diffPath = repoRoot === root ? "src/" : `${packageName}/src/`;
    const out = execSync(
      `git diff --name-only --diff-filter=ACMR HEAD -- ${diffPath}`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );
    const files = out
      .trim()
      .split("\n")
      .filter((f) => extensions.some((ext) => f.endsWith(ext)));
    return files;
  } catch {
    return [];
  }
}

let changed = getChangedFiles();
const prefix = `${packageName}/`;
changed = changed.map((f) => (f.startsWith(prefix) ? f.slice(prefix.length) : f));

if (changed.length === 0) {
  process.exit(0);
}

const result = spawnSync(
  "npx",
  ["eslint", "--max-warnings=9999", ...changed],
  { cwd: root, stdio: "inherit", shell: true }
);
process.exit(result.status !== 0 ? result.status || 1 : 0);
