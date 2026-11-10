import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 1. Check MongoDB for existing profile
    let user = await User.findOne({ clerkId: userId });

    // 2. Automatically create profile if it doesn't exist
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      );

      if (!primaryEmail) {
        return res.status(400).json({
          message: "No primary email found in Clerk account",
        });
      }

      user = await User.create({
        clerkId: userId,
        email: primaryEmail.emailAddress,
        fullName:
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          "User",
        profilePic: clerkUser.imageUrl || "",
      });
    }

    // 3. Attach MongoDB user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
