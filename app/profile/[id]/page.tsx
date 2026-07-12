import ProfileDetail from "@/components/ProfileDetail";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfileDetail id={id} />;
}
