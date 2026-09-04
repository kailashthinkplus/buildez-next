export async function checkLockout(_identity: string): Promise<void> {
  // Lockout persistence is not present in the current schema. Keep the
  // established non-blocking behavior while restoring the public contract.
}
