import { getRuntime } from "../runtimeResolver";
import { nginxAdapter } from "./nginx";
import { edgeAdapter } from "./edge";
import { RuntimeAdapter } from "../types";

export function getRuntimeAdapter(): RuntimeAdapter {
  const runtime = getRuntime();

  switch (runtime) {
    case "EDGE":
      return edgeAdapter;
    case "NGINX":
    default:
      return nginxAdapter;
  }
}
