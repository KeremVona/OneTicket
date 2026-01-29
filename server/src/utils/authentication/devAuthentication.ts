export const authenticateInDev = async (email: string, password: string) => {
  const DEV_PASSWORD = process.env.DEV_LDAP_PASSWORD || "dev123";

  if (password !== DEV_PASSWORD) {
    throw new Error("Invalid credentials (DEV)");
  }

  await new Promise((res) => setTimeout(res, 200));
};
