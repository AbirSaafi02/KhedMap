const fs = require("node:fs");
const path = require("node:path");

const backendEnvPath = path.join(__dirname, "..", "..", "backend", ".env");

function loadEnvFile(filePath = backendEnvPath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        return env;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return env;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
      env[key] = value;
      return env;
    }, {});
}

function resolveDevPorts() {
  const envFile = loadEnvFile();

  return {
    backendHost: process.env.BACKEND_HOST || envFile.BACKEND_HOST || "127.0.0.1",
    backendPort: process.env.BACKEND_PORT || envFile.BACKEND_PORT || "5000",
    frontendHost: process.env.FRONTEND_HOST || envFile.FRONTEND_HOST || "127.0.0.1",
    frontendPort: process.env.FRONTEND_PORT || envFile.FRONTEND_PORT || "8100",
  };
}

module.exports = {
  loadEnvFile,
  resolveDevPorts,
};
