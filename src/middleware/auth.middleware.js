import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // ✅ Extract token
      token = req.headers.authorization.split(" ")[1];

      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // ✅ Find user from DB
      const user = await User.findById(decoded.id).select("-password");

      // ❌ If user not found
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // ✅ Attach user to request
      req.user = user;

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    console.log("AUTH ERROR:", error.message); // 🔥 debug

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export default protect;
