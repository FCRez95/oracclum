import InteractivePieChart from "@/components/ui/piechart";
import { SiteStepsSummary } from "@/models/site-steps-summary";

interface SiteStepFunnelPreviewProps {
    data: SiteStepsSummary;
    conversoes: number;
}

const SiteStepFunnelPreview = ({ data, conversoes }: SiteStepFunnelPreviewProps) => {
    // Funil de cada etapa
    const step1 = [
        { label: "Page views", value: data.step_1_views },
        { label: "Abandonos", value: data.total_step_1 - data.step_1_views },
    ];
    const step2 = [
        { label: "Page views", value: data.step_2_views },
        { label: "Abandonos", value: data.total_step_2 - data.step_2_views },
    ];
    const step3 = [
        { label: "Page views", value: data.step_3_views },
        { label: "Abandonos", value: data.total_step_3 - data.step_3_views },
    ];
    const step4 = [
        { label: "Page views", value: data.step_4_views },
        { label: "Abandonos", value: data.total_step_4 - data.step_4_views },
    ];
    const checkout = [
        { label: "Checkout", value: data.checkout_views },
        { label: "Abandonos", value: data.total_checkout - data.checkout_views },
    ];
    const sales =
        conversoes > 0
            ? [
                { label: "Conversões", value: conversoes },
                { label: "Abandonos", value: data.checkout_views - conversoes },
            ]
            : [
                { label: "Abandonos", value: data.checkout_views },
            ];

    const steps = [
        { title: "Passo 1", data: step1, total: data.total_step_1 },
        ...(data.total_step_2 > 0 ? [{ title: "Passo 2", data: step2, total: data.total_step_2 }] : []),
        ...(data.total_step_3 > 0 ? [{ title: "Passo 3", data: step3, total: data.total_step_3 }] : []),
        ...(data.total_step_4 > 0 ? [{ title: "Passo 4", data: step4, total: data.total_step_4 }] : []),
        { title: "Checkout", data: checkout, total: data.total_checkout },
        { title: "Conversões", data: sales, total: data.checkout_views },
    ].flat();

    return (
        <div className="flex items-center gap-extra-small">
            {steps.map((step, idx) => (
                <InteractivePieChart
                    key={`${step.title}-${idx}`}
                    data={step.data}
                    type="default"
                    title=""
                    isFunnel={true}
                    size="extra-small"
                    operation={typeof step.total === "number" ? step.total : null}
                    isPreview={true}
                />
            ))}
        </div>
    );
};

export default SiteStepFunnelPreview;
