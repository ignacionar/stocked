import { InvoiceJobsList } from "@/components/invoices/invoice-jobs-list";
import { CreateInvoiceJob } from "@/components/forms/invoices/create-invoice-form";
import { InvoiceJob } from "@shared/types/entities";
import { getAllInvoiceJobs } from "./actions";

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ commerceId: string }>;
}) {
  const { commerceId } = await params;

  const jobs: (InvoiceJob & { user?: { name: string; image: string | null; } })[] = await getAllInvoiceJobs(commerceId) || [];

  return (
    <>
      <InvoiceJobsList commerceId={commerceId} jobs={jobs} />
      <CreateInvoiceJob commerceId={commerceId} />
    </>
  );
}
