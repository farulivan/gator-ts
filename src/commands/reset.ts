import { deleteAllUsers } from "../lib/db/queries/users";

export async function handlerReset() {
  await deleteAllUsers();
  console.log("Database reset successfully!");
}
