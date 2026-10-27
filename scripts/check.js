const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const folders = [
  "config",
  "controllers",
  "middleware",
  "models",
  "routes",
  "services",
  "utils",
  "validation",
  "test",
];
const files = ["app.js", "server.js", "scripts/check.js"];

for (const folder of folders) {
  const directory = path.join(root, folder);
  if (!fs.existsSync(directory)) continue;
  for (const name of fs.readdirSync(directory)) {
    if (name.endsWith(".js")) files.push(path.join(folder, name));
  }
}

for (const file of [...new Set(files)]) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

const metricsPath = path.join(root, "mental_health_ml", "artifacts", "metrics.json");
const modelPath = path.join(root, "mental_health_ml", "artifacts", "support_topic_model.joblib");
if (!fs.existsSync(metricsPath) || !fs.existsSync(modelPath)) {
  throw new Error("Classifier artifacts are missing; run the generation and training scripts");
}
const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
if (metrics.independentSyntheticEvaluation.macroF1 < 0.75) {
  throw new Error("Classifier failed its required 0.75 macro-F1 gate");
}

console.log(`Checked ${new Set(files).size} JavaScript files`);
console.log(
  `Classifier synthetic evaluation: accuracy=${metrics.independentSyntheticEvaluation.accuracy.toFixed(3)}, macroF1=${metrics.independentSyntheticEvaluation.macroF1.toFixed(3)}`
);
