import { JobClientView } from "@/components/invoices/invoice-view";
import { getInvoiceJob } from "../actions";

export default async function JobPage({
  params,
}: {
  params: Promise<{ commerceId: string; jobId: string }>;
}) {

  const { commerceId, jobId } = await params;

  const job = await getInvoiceJob(commerceId, jobId);

  if (!job) return (
    <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2 mb-[150px]">
            <h1 className="text-3xl font-bold">Proceso no encontrado</h1>
          </div>
        </div>
      </>
  )

  else {
    return <JobClientView initialJob={job} />;
  }

}