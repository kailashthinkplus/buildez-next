import Link from "next/link";

export default function TenantRootPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight">
        Workspace
      </h1>

      <p className="mt-2 text-sm opacity-70">
        Your BuildEZ workspace is active.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/onboarding"
          className="bez-card p-6 glass-hover"
        >
          <h3 className="font-medium">Get started</h3>
          <p className="mt-2 text-sm opacity-70">
            Personalise your BuildEZ experience
          </p>
        </Link>

        <div className="bez-card p-6 opacity-40">
          <h3 className="font-medium">Create website</h3>
          <p className="mt-2 text-sm">
            Available after onboarding
          </p>
        </div>

        <div className="bez-card p-6 opacity-40">
          <h3 className="font-medium">Billing & plans</h3>
          <p className="mt-2 text-sm">
            Available after onboarding
          </p>
        </div>
      </div>
    </div>
  );
}
