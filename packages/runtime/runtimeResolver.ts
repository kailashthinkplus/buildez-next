import { RuntimeType } from "./types";

export function getRuntime(): RuntimeType {
  return (process.env.RUNTIME_TARGET as RuntimeType) || "NGINX";
}
