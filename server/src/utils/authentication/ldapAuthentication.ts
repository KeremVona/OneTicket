import { Client } from "ldapts";

export const authenticateWithLdap = async (
  serverUrl: string,
  email: string,
  password: string,
) => {
  const client = new Client({ url: serverUrl });

  try {
    await client.bind(email, password);
  } finally {
    await client.unbind();
  }
};
