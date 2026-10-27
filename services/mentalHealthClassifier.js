const crypto = require("crypto");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");

const workerPath = path.join(__dirname, "..", "mental_health_ml", "infer.py");
const pending = new Map();
let worker;

const topicLabels = {
  anxiety_fear: "fear or ongoing worry",
  panic_distress: "acute panic or distress",
  low_mood: "low mood",
  loneliness_fomo: "loneliness or fear of missing out",
  relationship_conflict: "relationship difficulty",
  academic_pressure: "academic pressure",
  burnout: "burnout or exhaustion",
  grief_loss: "grief or loss",
  sleep_difficulty: "sleep difficulty",
  self_esteem: "self-esteem difficulty",
  anger_conflict: "anger or conflict",
  substance_concern: "substance-use concern",
  bullying_harassment: "bullying or harassment",
  wellbeing_general: "general wellbeing",
  crisis_self_harm: "possible immediate safety concern",
};

const crisisPatterns = [
  /\b(suicid(?:e|al)|kill(?:ing)? myself|end my life|take my life)\b/i,
  /\b(hurt myself|harm myself|self[ -]?harm)\b/i,
  /\b(don'?t want to be alive|don'?t want to live(?: anymore| any longer)?(?:[.!?]|$)|no reason to live)\b/i,
  /\b(can'?t (?:keep|stay) (?:myself )?safe|not safe with myself)\b/i,
  /\b(wrote|sent).{0,24}\bgoodbye\b/i,
  /\b(overdose myself|about to do something to myself)\b/i,
  /(?:jaan|zindagi).{0,20}(?:khatam|nahi jeena)/i,
];

const urgentPatterns = [
  /\b(right now|tonight|immediately|about to|already did|have a plan)\b/i,
  /\b(can'?t breathe|chest (?:is )?tight|might faint)\b/i,
  /\b(threaten(?:ing|ed)?|unsafe|stalking|violence|abuse)\b/i,
];

const fallbackRules = [
  ["crisis_self_harm", crisisPatterns],
  ["panic_distress", [/panic/i, /can'?t breathe/i, /heart.{0,10}racing/i]],
  ["academic_pressure", [/exam/i, /grades?/i, /study|padhai/i]],
  ["loneliness_fomo", [/lonely/i, /left out/i, /fomo/i]],
  ["relationship_conflict", [/relationship/i, /partner/i, /breakup|ex\b/i]],
  ["sleep_difficulty", [/sleep|insomnia|neend/i]],
  ["grief_loss", [/grief|died|passed away|loss/i]],
  ["bullying_harassment", [/bully|harass|threaten|rumou?r/i]],
  ["substance_concern", [/alcohol|drink|drugs?|pills|high\b/i]],
  ["burnout", [/burnout|drained|exhausted|no energy/i]],
  ["self_esteem", [/not good enough|failure|confidence|self esteem/i]],
  ["anger_conflict", [/angry|anger|temper|gussa|furious/i]],
  ["low_mood", [/sad|empty|hopeless|udaas|nothing feels/i]],
  ["anxiety_fear", [/anxious|worry|overthink|fear|darr|tension/i]],
];

const fallbackClassify = (text) => {
  for (const [topic, patterns] of fallbackRules) {
    if (patterns.some((pattern) => pattern.test(text))) {
      return { topic, confidence: 0.55, alternatives: [], model: "safety-keyword-fallback" };
    }
  }
  return {
    topic: "wellbeing_general",
    confidence: 0.35,
    alternatives: [],
    model: "safety-keyword-fallback",
  };
};

const startWorker = () => {
  if (worker && !worker.killed) return worker;
  worker = spawn(process.env.PYTHON_BIN || "python3", [workerPath, "--serve"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  worker.unref();

  readline.createInterface({ input: worker.stdout }).on("line", (line) => {
    try {
      const result = JSON.parse(line);
      const request = pending.get(result.id);
      if (!request) return;
      clearTimeout(request.timer);
      pending.delete(result.id);
      if (result.error) request.reject(new Error(result.error));
      else request.resolve(result);
    } catch (error) {
      console.error("Classifier returned invalid output:", error.message);
    }
  });

  worker.stderr.on("data", (data) => console.error(`Classifier: ${String(data).trim()}`));
  worker.on("exit", () => {
    worker = undefined;
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error("Classifier worker stopped"));
    }
    pending.clear();
  });
  return worker;
};

const modelClassify = (text) =>
  new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const child = startWorker();
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Classifier timed out"));
    }, Number(process.env.CLASSIFIER_TIMEOUT_MS || 10_000));
    pending.set(id, { resolve, reject, timer });
    child.stdin.write(`${JSON.stringify({ id, text })}\n`);
  });

const supportLevelFor = (text, topic) => {
  if (crisisPatterns.some((pattern) => pattern.test(text)) || topic === "crisis_self_harm") {
    return "crisis";
  }
  if (topic !== "wellbeing_general" && urgentPatterns.some((pattern) => pattern.test(text))) {
    return "urgent";
  }
  if (["panic_distress", "substance_concern", "bullying_harassment"].includes(topic)) {
    return "elevated";
  }
  if (["low_mood", "anxiety_fear", "grief_loss", "burnout"].includes(topic)) {
    return "elevated";
  }
  return "routine";
};

const classifySupportText = async (text) => {
  const normalized = String(text).trim().slice(0, 10_000);
  // Safety rules run before and after ML. A statistical confidence score can
  // never downgrade explicit self-harm language.
  let result;
  if (crisisPatterns.some((pattern) => pattern.test(normalized))) {
    result = { topic: "crisis_self_harm", confidence: 1, alternatives: [], model: "safety-rule-v1" };
  } else {
    try {
      result = await modelClassify(normalized);
      if (result.confidence < 0.55) {
        const fallback = fallbackClassify(normalized);
        if (fallback.topic !== "wellbeing_general") result = fallback;
      }
    } catch (error) {
      console.error("Classifier unavailable; using fallback:", error.message);
      result = fallbackClassify(normalized);
    }
  }

  const supportLevel = supportLevelFor(normalized, result.topic);
  return {
    topic: result.topic,
    topicLabel: topicLabels[result.topic] || "general emotional support",
    confidence: result.confidence,
    alternatives: result.alternatives,
    supportLevel,
    requiresHumanReview: supportLevel !== "routine" || result.confidence < 0.55,
    model: result.model,
    isDiagnosis: false,
  };
};

const stopClassifier = () => {
  if (worker && !worker.killed) worker.kill();
  worker = undefined;
};

module.exports = { classifySupportText, stopClassifier, topicLabels };
