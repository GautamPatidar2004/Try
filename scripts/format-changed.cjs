#!/usr/bin/env node
/**
 * Prettier on staged files only, then re-stage. No ESLint (keep pre-commit fast).
 * Works as a package inside a monorepo (e.g. paths voyagerfrontend/src/...) or standalone.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const EXT = /\.(js|jsx|ts|tsx|json)$/i;

function getRepoRoot() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
}

function stagedFilesFromGit() {
  const out = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const pkgRoot = path.resolve(__dirname, "..");
const repoRoot = getRepoRoot();
let pkgRel = path.relative(repoRoot, pkgRoot);
const pkgPrefix =
  !pkgRel || pkgRel === "."
    ? ""
    : pkgRel.split(path.sep).join("/");

const staged = stagedFilesFromGit();
const localFiles = [];

for (let f of staged) {
  f = f.split(path.sep).join("/");
  if (!EXT.test(f)) continue;
  let localRel;
  if (!pkgPrefix) {
    localRel = f;
  } else if (f === pkgPrefix || f.startsWith(pkgPrefix + "/")) {
    localRel = f.slice(pkgPrefix.length).replace(/^\//, "");
  } else {
    continue;
  }
  const abs = path.join(pkgRoot, ...localRel.split("/"));
  if (fs.existsSync(abs)) {
    localFiles.push(localRel.split("/").join(path.sep));
  }
}

if (localFiles.length === 0) {
  process.exit(0);
}

const prettierCli = require.resolve("prettier/bin/prettier.cjs");
execFileSync(process.execPath, [prettierCli, "--write", ...localFiles], {
  cwd: pkgRoot,
  stdio: "inherit",
});

const gitPaths = localFiles.map((lf) => {
  const posix = lf.split(path.sep).join("/");
  return pkgPrefix ? `${pkgPrefix}/${posix}` : posix;
});
execFileSync("git", ["add", "--", ...gitPaths], {
  cwd: repoRoot,
  stdio: "inherit",
});
