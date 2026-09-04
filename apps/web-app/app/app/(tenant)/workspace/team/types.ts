export type Role = "ADMIN" | "EDITOR" | "VIEWER";
export type Person = { id: string; name: string | null; email: string | null; avatarUrl: string | null; lastLoginAt: string | null };
export type Member = { id: string; role: Role; userId: string; user: Person };
export type Invite = { id: string; email: string; role: Role; expiresAt: string | null; createdAt: string };
