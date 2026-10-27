const { after, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  classifySupportText,
  stopClassifier,
} = require("../services/mentalHealthClassifier");
const { createSupportReply } = require("../services/supportReply");

after(() => stopClassifier());

test("classifies common support topics", async () => {
  const academic = await classifySupportText("exam ka pressure handle nahi ho raha");
  assert.equal(academic.topic, "academic_pressure");
  assert.equal(academic.isDiagnosis, false);

  const fomo = await classifySupportText("friends posted party stories and I feel left out");
  assert.equal(fomo.topic, "loneliness_fomo");
});

test("explicit self-harm language always triggers crisis handling", async () => {
  const analysis = await classifySupportText("I am thinking about killing myself tonight");
  assert.equal(analysis.topic, "crisis_self_harm");
  assert.equal(analysis.supportLevel, "crisis");
  assert.equal(analysis.requiresHumanReview, true);
  assert.match(createSupportReply(analysis, "test"), /immediate safety/i);
});

test("ordinary use of live is not treated as self-harm", async () => {
  const analysis = await classifySupportText("I don't want to live with roommates anymore");
  assert.notEqual(analysis.supportLevel, "crisis");
});
