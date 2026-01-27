import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import {
  getUser,
  makeUser,
  getUserById,
} from "../../services/authentication/authService.js";
import jwtGenerator from "../../utils/authentication/jwtGenerator.js";

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface GetIdRequestBody {
  id: number;
}

export const registerHandler = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
) => {
  const { username, email, password } = req.body;

  try {
    const user = await getUser(email);

    if (user === 0) {
      return res.status(401).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = await makeUser(username, email, bcryptPassword);

    const jwtToken = jwtGenerator(newUser.id, newUser.username);

    return res.json({ jwtToken });
  } catch (err) {
    console.error("Server error - registerHandler");
    if (err instanceof Error) {
      return res.status(500).send("Server error");
    }
  }
};

export const loginHandler = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
) => {
  const { email, password } = req.body;
  try {
    const user = await getUser(email);

    if (user === 0) {
      return res.status(401).json("Invalid email");
    }

    const validPassword = bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json("Invalid pasword");
    }

    const jwtToken = jwtGenerator(user.id, user.username);

    return res.json({ jwtToken });
  } catch (err) {
    console.error("Server error - loginHandler");
    if (err instanceof Error) {
      return res.status(500).send("Server error");
    }
  }
};

export const verifyHandler = async (res: Response) => {
  try {
    return res.json(true);
  } catch (err) {
    console.error("Server error - verifyHandler");
    if (err instanceof Error) {
      return res.status(500).send("Server error");
    }
  }
};

export const getUserIdHandler = async (
  req: Request<{}, {}, GetIdRequestBody>,
  res: Response,
) => {
  try {
    const { id } = req.body;

    const user = await getUserById(id);

    return res.json(user);
  } catch (err) {
    console.error("Server error - getUserIdHandler");
    return res.status(500).send("Server error");
  }
};
