#!/usr/bin/env node
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const WATCHED_EXTENSIONS = [".js", ".jsx", ".css"];

function readStdin() {
  try {
    const data = require("fs").readFileSync(0, "utf8");
    return data;
  } catch (err) {
    return "";
  }
}

function main() {
  const raw = readStdin();
  let payload;

  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error("[post-edit-build] Failed to parse hook input JSON:", err.message);
    process.exit(0);
  }

  const filePath = payload && payload.tool_input && payload.tool_input.file_path;

  if (!filePath) {
    process.exit(0);
  }

  const ext = path.extname(filePath).toLowerCase();

  if (!WATCHED_EXTENSIONS.includes(ext)) {
    process.exit(0);
  }

  console.log(`[post-edit-build] Hook fired: "${filePath}" was edited (${ext}). Running "npm run build"...`);

  const isWindows = process.platform === "win32";
  const npmCommand = isWindows ? "npm.cmd" : "npm";

  const result = spawnSync(npmCommand, ["run", "build"], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    shell: isWindows,
  });

  if (result.error) {
    console.error(`[post-edit-build] Failed to run "npm run build":`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[post-edit-build] Build FAILED (exit code ${result.status}) after editing "${filePath}".`);
    process.exit(1);
  }

  console.log(`[post-edit-build] Build SUCCEEDED after editing "${filePath}".`);
  process.exit(0);
}

main();
