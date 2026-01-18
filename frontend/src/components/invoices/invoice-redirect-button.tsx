"use client"; 

import { useRouter } from "next/navigation";

export default function RedirectInvoiceButton({ commerceId, jobId }: { commerceId: string; jobId: string }) {
  const router = useRouter();
  
  <button
  key={jobId}
  onClick={() =>
    router.push(`/${commerceId}/invoices/${jobId}`)
  }
  className="w-full flex items-center justify-between border rounded px-3 py-2 hover:bg-muted transition"
></button>
}