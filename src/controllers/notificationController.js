import admin from "../config/firebaseAdmin.js";

export const sendNotification = async (req, res) => {
  try {
    const { token } = req.body;

    await admin.messaging().send({
      token,

      notification: {
        title: "Expense Alert",
        body: "You spent ₹500 today",
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
