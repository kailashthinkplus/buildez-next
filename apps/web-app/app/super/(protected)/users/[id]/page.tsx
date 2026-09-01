import RecordDetails from "../../../components/RecordDetails";
import RateLimitPanel from "../../../components/RateLimitPanel";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <RecordDetails type="users" id={id} />
      <RateLimitPanel userId={id} />
    </>
  );
}
