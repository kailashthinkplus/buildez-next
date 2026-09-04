import RecordDetails from "../../../components/RecordDetails";
import TenantCreditPanel from "../../../components/TenantCreditPanel";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <RecordDetails
        type="tenants"
        id={id}
      />

      <TenantCreditPanel
        tenantId={id}
      />
    </>
  );
}
