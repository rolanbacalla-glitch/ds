import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const rawArgs = process.argv.slice(2);
const translatedArgs = [];

let hasPort = false;
let hasHostname = false;

for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];

  if (arg === "--host") {
    translatedArgs.push("--hostname");
    hasHostname = true;
    continue;
  }

  if (arg.startsWith("--host=")) {
    translatedArgs.push(`--hostname=${arg.slice("--host=".length)}`);
    hasHostname = true;
    continue;
  }

  if (arg === "--hostname" || arg === "-H" || arg.startsWith("--hostname=")) {
    hasHostname = true;
  }

  if (arg === "--port" || arg === "-p" || arg.startsWith("--port=")) {
    hasPort = true;
  }

  translatedArgs.push(arg);
}

if (!hasPort) {
  translatedArgs.push("--port", process.env.PORT || "3000");
}

if (!hasHostname) {
  translatedArgs.push("--hostname", process.env.HOSTNAME || "0.0.0.0");
}

const child = spawn(process.execPath, [nextBin, "dev", ...translatedArgs], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
