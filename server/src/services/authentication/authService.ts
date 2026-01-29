import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma.js";
import { authenticateWithLdap } from "../../utils/authentication/ldapAuthentication.js";
import { authenticateInDev } from "../../utils/authentication/devAuthentication.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
const isDev = process.env.NODE_ENV !== "production";

interface LoginDto {
  email: string;
  password: string; // The raw password typed in frontend
}

export const loginUser = async ({ email, password }: LoginDto) => {
  const domain = email.split("@")[1];
  if (!domain) throw new Error("Invalid email format");

  const ldapConfig = await prisma.ldapConfig.findUnique({
    where: { domainName: domain },
  });

  if (!ldapConfig) {
    throw new Error("Organization not recognized. Please contact IT.");
  }

  if (isDev) {
    await authenticateInDev(email, password);
  } else {
    await authenticateWithLdap(ldapConfig.serverUrl, email, password);
  }

  const defaultDept = await prisma.department.findFirst({
    where: { ldapConfigId: ldapConfig.id },
  });

  if (!defaultDept)
    throw new Error("Configuration Error: No department found for this domain");

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      fullName: email.split("@")[0]!, // Placeholder, ideally fetch from LDAP search
      role: "EMPLOYEE", // Default role
      departmentId: defaultDept.id,
    },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, deptId: user.departmentId },
    JWT_SECRET,
    { expiresIn: "8h" },
  );

  return { user, token };
};
