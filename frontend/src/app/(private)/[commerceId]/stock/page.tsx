import StockManagementTable from "@/components/stock/stock-table";
import { getStockFromCommerce } from "./actions";
import { Stock } from "@shared/types/entities";

export default async function StockPage({ params }: { params: Promise<{ commerceId: string }> }) {
  const { commerceId } = await params;

  const stockItems: Stock[] = await getStockFromCommerce(commerceId);

  const measures = Array.from(
    new Set(
      stockItems
        .map(item =>
          item.measure
            .toLowerCase()
            .replace(/[^a-záéíóúñ]/gi, "")
        )
        .filter(Boolean) 
    )
  );

  const suppliers = Array.from(new Set(stockItems.map(item => item.supplier)));

  return <StockManagementTable stockItems={stockItems} pageSize={10} measures={measures} commerceId={commerceId} suppliers={suppliers} />;
}
