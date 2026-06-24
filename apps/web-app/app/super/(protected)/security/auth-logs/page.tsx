"use client";

import { useEffect, useState } from "react";

export default function AuthLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/super/security/auth-logs")
      .then((r) => r.json())
      .then(setLogs);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">Authentication Logs</h1>

      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Time</th>
              <th>Email</th>
              <th>Provider</th>
              <th>Status</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td>{l.user?.email || "—"}</td>
                <td>{l.provider}</td>
                <td className={l.success ? "text-green-600" : "text-red-600"}>
                  {l.success ? "SUCCESS" : "FAIL"}
                </td>
                <td>{l.ipAddress || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
