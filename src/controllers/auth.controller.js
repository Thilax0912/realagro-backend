import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");

  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role || "user" },
    secret,
    { expiresIn: "7d" }
  );
}

export async function signup(req, res) {
  try {
    const { name = "", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash, // ✅ new field
      password: passwordHash, // ✅ backward compatibility if old schema uses "password"
      role: "user",
      avatar: "",
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (e) {
    console.error("SIGNUP ERROR:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const storedHash = user.passwordHash || user.password;
    if (!storedHash) {
      return res.status(500).json({ error: "User password hash missing" });
    }

    const ok = await bcrypt.compare(password, storedHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
        role: user.role || "user",
        avatar: user.avatar || "",
      },
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "_id name email role avatar"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
        role: user.role || "user",
        avatar: user.avatar || "",
      },
    });
  } catch (e) {
    console.error("ME ERROR:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, avatar } = req.body;

    if (avatar && typeof avatar === "string" && avatar.length > 1_200_000) {
      return res.status(413).json({ error: "Image too large" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (typeof name === "string") user.name = name.trim();
    if (typeof avatar === "string") user.avatar = avatar;

    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
        role: user.role || "user",
        avatar: user.avatar || "",
      },
    });
  } catch (e) {
    console.error("UPDATE ME ERROR:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
