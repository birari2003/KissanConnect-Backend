// const express = require("express");
// const router = express.Router();
// const { sendMessage } = require('../whatsapp-service');

// // POST /api/whatsapp/send
// router.post("/send", async (req, res) => {
//     const { number, message } = req.body;

//     if (!number || !message) {
//         return res.status(400).json({ success: false, error: "Number and message are required." });
//     }
    
//     // Simple validation for Indian numbers
//     if (!/^[6-9]\d{9}$/.test(number.replace(/^91/, ''))) {
//        return res.status(400).json({ success: false, error: "Invalid Indian phone number format." });
//     }

//     // Prepend country code if missing
//     const fullNumber = number.startsWith('91') ? number : `91${number}`;

//     try {
//         await sendMessage(fullNumber, message);
//         res.status(200).json({ success: true, message: "Message sent successfully." });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// module.exports = router;