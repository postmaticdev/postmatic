import { redirect } from "next/navigation";

interface Params {
  params: Promise<{
    businessId: string;
  }>;
}
export default async function BusinessPage({ params }: Params) {
  const { businessId } = await params;
  redirect(`/business/${businessId}/dashboard`);
}
