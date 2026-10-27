const { test } = require("node:test");
const assert = require("node:assert/strict");
const { auth, chat } = require("../validation/schemas");

test("public signup ignores no privileged-role field", () => {
  const parsed = auth.signup.parse({
    body: {
      name: "Student User",
      email: "STUDENT@example.com",
      password: "correct horse battery staple",
      role: "admin",
    },
  });
  assert.equal(parsed.body.email, "student@example.com");
  assert.equal(Object.hasOwn(parsed.body, "role"), false);
});

test("chat rejects blank and oversized messages", () => {
  assert.throws(() => chat.send.parse({ body: { message: "   " } }));
  assert.throws(() => chat.send.parse({ body: { message: "x".repeat(2001) } }));
});
