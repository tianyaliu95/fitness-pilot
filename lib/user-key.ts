/** Firestore doc id + localStorage key: email when available, else auth uid */
export interface UserIdentity {
  uid: string;
  email: string | null;
}

export function userDocId(user: UserIdentity): string {
  if (user.email) return user.email.trim().toLowerCase();
  return user.uid;
}
