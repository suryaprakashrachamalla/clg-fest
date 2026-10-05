import { fetchCurrentUser } from "../services/api";

export async function getCurrentUser() {
  return fetchCurrentUser();
}
