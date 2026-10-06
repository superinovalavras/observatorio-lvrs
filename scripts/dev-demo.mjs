// Sobe o next dev com startups fictícias (ver src/lib/demo.ts). Só para desenvolvimento.
import { spawn } from "node:child_process";

const args = ["next", "dev", ...process.argv.slice(2)];
spawn("npx", args, { stdio: "inherit", shell: true, env: { ...process.env, OBSERVATORIO_DEMO: "1" } }).on("exit", (c) =>
  process.exit(c ?? 0),
);
