import { setUser } from "../config";
import { createUser, getUserByName } from 'src/lib/db/queries/users';

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const existingUser = await getUserByName(userName);
  if (!existingUser) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(userName);
  console.log("User switched successfully!");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];

  const existingUser = await getUserByName(userName);
  if (existingUser) {
    throw new Error(`User ${userName} already exists`);
  }

  const user = await createUser(userName);
  if (!user) {
    throw new Error(`Failed to create user ${userName}`);
  }

  setUser(userName);
  console.log("User registered successfully!");
}
