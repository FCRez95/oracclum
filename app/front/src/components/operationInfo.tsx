import { formatNumberMask } from "@/helper/dataMasks";

interface summedCampaignData {
  expenses: number;
  revenue: number;
  clicks: number;
  checkout?: number;
  sales?: number;
  roas?: number;
  cpc?: number;
  vcpm?: number;
  cpa?: number;
  vctr?: number;
  // visible_impressions?: number;
}

interface Props {
  data: summedCampaignData | undefined;
  horizontalLayout?: boolean;
  loading?: boolean;
  allInfo?: boolean;
  designStyle?: boolean; // Prop pra testar esse novo estilo -> RETIRAR DEPOIS
}

export default function OperationInfo({
  data,
  horizontalLayout = false,
  loading = false,
  allInfo = false,
  designStyle = true,
}: Props) {
  const cpaCheckout =
    data?.checkout && data.checkout > 0
      ? data.expenses / data.checkout
      : null;

  const rowClass = horizontalLayout
    ? "flex flex-col items-center text-small text-text-secondary gap-x-2 min-w-[90px] md:min-w-0"
    : "flex justify-between items-center w-full text-small text-text-secondary gap-x-2";

  const containerClass = horizontalLayout
    ? `${designStyle ? "flex w-full flex-row flex-wrap md:justify-between justify-center gap-y-extra-small" : "flex flex-row flex-grow-1 space-around justify-between items-center pl-small"}`
    : "flex w-full px-extra-small flex-col gap-extra-small";

  const allItems = [
    { label: "Gastos:", value: data?.expenses },
    { label: "Faturamento:", value: data?.revenue },
    { label: "Clicks:", value: data?.clicks },
    { label: "Checkout:", value: data?.checkout },
    { label: "Conversões:", value: data?.sales },
    { label: "ROAS:", value: data?.roas ? data?.roas * 100 : undefined, suffix: "%" },
    { label: "CPC atual:", value: data?.cpc },
    { label: "VCPM:", value: data?.vcpm },
    { label: "CPA:", value: data?.cpa },
    { label: "CPA - Checkout:", value: cpaCheckout, emptyDisplay: "-" },
    { label: "VCTR:", value: data?.vctr, suffix: "%" },
    // data?.visible_impressions !== undefined && {
    //   label: "Visible Impressions:",
    //   value: data.visible_impressions,
    // },
  ].filter(Boolean); // tira falsos/undefined

  const items = [
    { label: "Gastos:", value: data?.expenses },
    { label: "Faturamento:", value: data?.revenue },
    { label: "Clicks:", value: data?.clicks },
    { label: "Checkout:", value: data?.checkout },
    { label: "Conversões:", value: data?.sales },
    { label: "ROAS:", value: data?.roas ? data?.roas * 100 : undefined, suffix: "%" },
    { label: "CPA:", value: data?.cpa },
    { label: "CPA - Checkout:", value: cpaCheckout, emptyDisplay: "-" },
    //{ label: "CPC atual:", value: data?.cpc },
    //{ label: "VCPM:", value: data?.vcpm },
    //{ label: "VCTR:", value: data?.vctr, suffix: "%" },
    // data?.visible_impressions !== undefined && {
    //   label: "Visible Impressions:",
    //   value: data.visible_impressions,
    // },
  ].filter(Boolean); // tira falsos/undefined

  const displayItems = allInfo ? allItems : items;

  return (
    <div className={containerClass}>
      {displayItems.map((item, idx) => {
        const isInteger =
          item.label === "Clicks:" ||
          item.label === "Checkout:" ||
          item.label === "Conversões:";
        const formattedValue =
          item.value === null || item.value === undefined
            ? (item.emptyDisplay ?? formatNumberMask(item.value, isInteger))
            : formatNumberMask(item.value, isInteger);
        return (
          <span key={idx} className={rowClass}>
            {item.label}
            {loading ? (
              <span className="inline-block h-5 w-20 bg-bg-overlay/50 rounded animate-pulse" />
            ) : (
              <strong>{formattedValue + (item.suffix ?? "")}</strong>
            )}
          </span>
        );
      })}
    </div>
  );
}
