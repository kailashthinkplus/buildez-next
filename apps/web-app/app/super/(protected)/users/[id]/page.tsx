import RecordDetails from "../../../components/RecordDetails";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <RecordDetails type="users" id={id}/>; }
