const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).send({ message: 'No file uploaded' });
    return;
  }

  let resourceType = 'auto'; // Let Cloudinary decide the resource type

  if (req.file.mimetype.startsWith('image/')) {
    resourceType = 'image';
  } else if (req.file.mimetype.startsWith('video/')) {
    resourceType = 'video';
  } else {
    resourceType = 'raw';
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: resourceType,
  });

  //console.log(result);
  res.send({ fileUrl: result.secure_url });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, fileUrl } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    fileUrl: fileUrl
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage, uploadAttachment };
