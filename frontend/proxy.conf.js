const { resolveDevPorts } = require("./scripts/dev-env.cjs");

const { backendHost, backendPort } = resolveDevPorts();
const target = `http://${backendHost}:${backendPort}`;

console.log(`[proxy] forwarding /api to ${target}`);

module.exports = {
  "/api": {
    target,
    secure: false,
    changeOrigin: true,
  },
};
