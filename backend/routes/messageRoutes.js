const express = require("express");
const {
  allMessages,
  sendMessage,
  uploadAttachment,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/attachment").post(protect,upload.single('file'), uploadAttachment);

module.exports = router;
