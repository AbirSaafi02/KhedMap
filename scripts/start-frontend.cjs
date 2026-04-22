const { spawn } = require("node:child_process");
const { resolveDevPorts } = require("./dev-env.cjs");

const { frontendHost, frontendPort } = resolveDevPorts();
const command = "npx";
const args = ["ng", "serve", "--host", frontendHost, "--port", frontendPort, "--proxy-config", "proxy.conf.js"];

console.log(`[dev] starting frontend on http://${frontendHost}:${frontendPort}`);

const child = spawn(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", code => {
  process.exit(code ?? 0);
});
