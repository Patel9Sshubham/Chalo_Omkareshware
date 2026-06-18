import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(rootDir, "..");

const services = [
  { name: "user-backend", cwd: path.join(projectRoot, "backend") },
  { name: "admin-backend", cwd: path.join(projectRoot, "admin_backend") },
  { name: "user-website", cwd: path.join(projectRoot, "Frontend") },
  { name: "admin-website", cwd: path.join(projectRoot, "admin_frontend") }
];

const children = services.map((service) => {
  const child = spawn("npm", ["start"], {
    cwd: service.cwd,
    stdio: "inherit",
    shell: true
  });

  child.on("exit", (code) => {
    console.log(`[${service.name}] exited with code ${code}`);
  });

  return child;
});

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
