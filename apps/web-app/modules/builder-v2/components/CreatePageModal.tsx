"use client";

interface CreatePageModalProps {
  open: boolean;
  siteSlug: string;
  onClose(): void;
}

export default function CreatePageModal({ open }: CreatePageModalProps) {
  if (!open) return null;

  return null;
}
