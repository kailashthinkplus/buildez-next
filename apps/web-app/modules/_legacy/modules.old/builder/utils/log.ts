export function log(scope: string, action: string, data?: any) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`🟦 [${scope}] ${action}`, data || "");
  }
}
