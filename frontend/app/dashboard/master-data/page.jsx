import MasterDataForm from "@/components/MasterDataForm";

// Force dynamic rendering to avoid pre-rendering issues
export const dynamic = "force-dynamic";

export default function MasterDataPage() {
  return <MasterDataForm />;
}
