import type { Request, Response } from "express";
import { loginUser } from "../../services/authentication/authService.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await loginUser({ email, password });

    return res.json({
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    console.error("Login failed:", error.message);
    return res
      .status(401)
      .json({ message: error.message || "Authentication failed" });
  }
};
