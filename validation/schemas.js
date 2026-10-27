const { z } = require("zod");

const id = z.coerce.number().int().positive();
const optionalBoolean = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");
const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
const idParams = z.object({ id });
const text = (max) => z.string().trim().min(1).max(max);
const safeUrl = z
  .string()
  .url()
  .max(2048)
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "Only http and https URLs are allowed",
  });

exports.auth = {
  signup: z.object({
    body: z.object({
      name: text(100).min(2),
      email: z.string().trim().toLowerCase().email().max(254),
      password: z.string().min(10).max(72),
      schoolInfo: z.string().trim().max(200).optional(),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().trim().toLowerCase().email().max(254),
      password: z.string().min(1).max(72),
      role: z.string().optional(),
    }),
  }),
  updateProfile: z.object({
    body: z
      .object({
        name: text(100).min(2).optional(),
        schoolInfo: z.string().trim().max(200).nullable().optional(),
      })
      .refine((value) => Object.keys(value).length > 0, "No profile changes supplied"),
  }),
  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1).max(72),
      newPassword: z.string().min(10).max(72),
    }),
  }),
};

exports.doctor = {
  create: z.object({
    body: z.object({
      userId: id,
      specialization: text(120),
      experience: z.coerce.number().int().min(0).max(80).optional(),
      bio: z.string().trim().max(500).optional(),
    }),
  }),
  id: z.object({ params: idParams }),
  slot: z.object({
    params: idParams,
    body: z.object({
      startsAt: z.string().datetime({ offset: true }),
      endsAt: z.string().datetime({ offset: true }),
    }),
  }),
  slotItem: z.object({ params: z.object({ id, slotId: id }) }),
  list: z.object({
    query: paginationQuery.extend({ specialization: z.string().trim().max(120).optional() }),
  }),
};

exports.appointment = {
  create: z.object({
    body: z.object({
      slotId: id,
      notes: z.string().trim().max(1000).optional(),
    }),
  }),
  list: z.object({ query: paginationQuery }),
  status: z.object({
    params: idParams,
    body: z.object({ status: z.enum(["confirmed", "cancelled", "completed"]) }),
  }),
  id: z.object({ params: idParams }),
};

exports.chat = {
  send: z.object({
    body: z.object({
      receiverId: id.nullable().optional(),
      message: text(2000),
      consentToAI: z.boolean().optional().default(false),
    }),
  }),
  history: z.object({
    params: z.object({ receiverId: z.union([z.literal("bot"), id]) }),
    query: paginationQuery,
  }),
};

const anonymousContent = z.object({
  text: text(5000),
  media: safeUrl.nullable().optional(),
  anonymous: z.boolean().optional().default(true),
});
exports.discussion = {
  create: z.object({ body: anonymousContent }),
  update: z.object({
    params: idParams,
    body: anonymousContent.partial().refine((value) => Object.keys(value).length > 0),
  }),
  list: z.object({ query: paginationQuery }),
  id: z.object({ params: idParams }),
  comment: z.object({
    params: idParams,
    body: z.object({ text: text(3000), anonymous: z.boolean().optional().default(true) }),
  }),
  commentItem: z.object({
    params: z.object({ id, commentId: id }),
    body: z.object({ text: text(3000), anonymous: z.boolean().optional() }),
  }),
  commentPath: z.object({ params: z.object({ id, commentId: id }) }),
  reply: z.object({
    params: z.object({ id, commentId: id }),
    body: z.object({ text: text(3000), anonymous: z.boolean().optional().default(true) }),
  }),
  replyItem: z.object({
    params: z.object({ id, commentId: id, replyId: id }),
    body: z.object({ text: text(3000), anonymous: z.boolean().optional() }),
  }),
  replyPath: z.object({ params: z.object({ id, commentId: id, replyId: id }) }),
};

exports.resource = {
  create: z.object({
    body: z.object({
      title: text(255),
      type: z.enum(["video", "audio", "article"]),
      url: safeUrl,
      category: z.string().trim().min(1).max(100).optional(),
    }),
  }),
  update: z.object({
    params: idParams,
    body: z
      .object({
        title: text(255).optional(),
        type: z.enum(["video", "audio", "article"]).optional(),
        url: safeUrl.optional(),
        category: z.string().trim().min(1).max(100).optional(),
      })
      .refine((value) => Object.keys(value).length > 0),
  }),
  list: z.object({
    query: paginationQuery.extend({
      type: z.enum(["video", "audio", "article"]).optional(),
      category: z.string().trim().max(100).optional(),
    }),
  }),
  id: z.object({ params: idParams }),
  feedback: z.object({
    params: idParams,
    body: z.object({ comment: text(2000), rating: z.coerce.number().int().min(1).max(5) }),
  }),
};

exports.mood = {
  save: z.object({
    body: z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
      mood: z.enum(["happy", "calm", "neutral", "sad", "anxious", "angry"]),
      journalEntry: z.string().trim().max(5000).optional().default(""),
    }),
  }),
  list: z.object({
    query: z.object({
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
  }),
  id: z.object({ params: idParams }),
};

exports.notification = {
  list: z.object({
    query: paginationQuery.extend({ unreadOnly: optionalBoolean.optional() }),
  }),
  id: z.object({ params: idParams }),
};
