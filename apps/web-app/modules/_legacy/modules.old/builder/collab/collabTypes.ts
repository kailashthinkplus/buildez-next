export interface CollabUser {
  id: string;
  name: string;
  color: string;
}

export interface CollabPresence {
  userId: string;
  pageId: string;
  selection: string | null;
  cursor: { x: number; y: number } | null;
  lastActive: number;
}

export interface CollabEnvelope {
  userId: string;
  pageId: string;
  timestamp: number;
  data: any;
}

export interface CollabSyncResult {
  applied: CollabEnvelope[];
  rejected: CollabEnvelope[];
}
