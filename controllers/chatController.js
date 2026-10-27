const { Op } = require("sequelize");
const { Appointment, Chat, Doctor, User } = require("../models");
const { sequelize } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { paginationFrom, paginatedData } = require("../utils/pagination");
const { classifySupportText } = require("../services/mentalHealthClassifier");
const { createSupportReply } = require("../services/supportReply");

const canDirectMessage = async (sender, receiverId) => {
  const receiver = await User.findByPk(receiverId, { attributes: ["id", "role", "isActive"] });
  if (!receiver || !receiver.isActive || receiver.id === sender.id) return false;

  let doctor;
  let studentId;
  if (sender.role === "student" && receiver.role === "doctor") {
    doctor = await Doctor.findOne({ where: { userId: receiver.id } });
    studentId = sender.id;
  } else if (sender.role === "doctor" && receiver.role === "student") {
    doctor = await Doctor.findOne({ where: { userId: sender.id } });
    studentId = receiver.id;
  } else {
    return false;
  }

  return Boolean(
    doctor &&
      (await Appointment.count({
        where: {
          studentId,
          doctorId: doctor.id,
          status: { [Op.in]: ["pending", "confirmed"] },
        },
      }))
  );
};

// Send message
exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const isBotChat = receiverId === null || receiverId === undefined;

  if (!isBotChat && !(await canDirectMessage(req.user, receiverId))) {
    return errorResponse(res, "Direct chat is available only for an active care relationship", 403);
  }

  const analysis = isBotChat ? await classifySupportText(message) : null;
  const reply = analysis ? createSupportReply(analysis, message) : null;

  const result = await sequelize.transaction(async (transaction) => {
    const newMessage = await Chat.create(
      {
        senderId: req.user.id,
        receiverId: receiverId || null,
        message,
        type: req.user.role === "doctor" ? "doctor" : "student",
        analysis,
      },
      { transaction }
    );

    const botMessage = isBotChat
      ? await Chat.create(
          {
            senderId: null,
            receiverId: req.user.id,
            message: reply,
            type: "bot",
            analysis: {
              inResponseTo: newMessage.id,
              topic: analysis.topic,
              supportLevel: analysis.supportLevel,
            },
          },
          { transaction }
        )
      : null;
    return { newMessage, botMessage };
  });

  return successResponse(res, "Message sent successfully", {
    ...result,
    support: analysis
      ? {
          ...analysis,
          disclaimer: "Automated support routing only; this is not a diagnosis or emergency service.",
        }
      : null,
  }, 201);
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  const receiverId = req.validatedParams.receiverId;
  const senderId = req.user.id;
  const { page, limit, offset } = paginationFrom(req.validatedQuery);

  if (receiverId !== "bot" && !(await canDirectMessage(req.user, receiverId))) {
    return errorResponse(res, "Not authorized to view this conversation", 403);
  }

  const where = receiverId === "bot"
    ? { [Op.or]: [{ senderId, receiverId: null }, { senderId: null, receiverId: senderId }] }
    : { [Op.or]: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }] };

  const { rows, count } = await Chat.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return successResponse(
    res,
    "Messages fetched successfully",
    paginatedData(rows.reverse(), count, page, limit)
  );
};
