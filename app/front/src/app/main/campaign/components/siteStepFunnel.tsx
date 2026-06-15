import InteractivePieChart from "@/components/ui/piechart";
import { SiteStepsSummary } from "@/models/site-steps-summary";
import { ChevronRight } from "lucide-react";

interface SiteStepFunnelProps {
    data: SiteStepsSummary;
    conversoes: number;
}

const SiteStepFunnel = ({ data, conversoes }: SiteStepFunnelProps) => {
    // Funil de cada etapa
    const step1 = [
        { label: "Page views", value: data.step_1_views }, // verde
        { label: "Abandonos", value: data.total_step_1 - data.step_1_views }, // cinza
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
        <div className="flex flex-col gap-small pb-small">
            <div className="inline-grid grid-cols-2 justify-center gap-medium relative md:min-h-[90px]">
                {steps.map((step, index) => {
                    const spacing = 45; // Espaçamento em % da largura total
                    const offset = (100 - spacing) / 2;
                    const currentPosition = offset + (index * spacing) / (steps.length - 1);

                    return (
                        <div
                            key={step.title}
                            className="flex justify-center items-center md:absolute md:transform md:-translate-x-1/2 md:top-0"
                            style={{
                                left: `calc(${currentPosition}%)`,
                            }}
                        >   
                            <InteractivePieChart
                                data={step.data}
                                type="default"
                                title={step.title}
                                size="small"
                                isFunnel={true}
                                operation={typeof step.total === "number" ? step.total : null}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Linha e porcentagens */}
            <div className="hidden md:block relative mt-small h-small">
                <div
                    className="absolute h-0.5 bg-bg-overlay top-1/2 transform -translate-y-1/2"
                    style={{
                        left: `calc(${(100 - 45) / 2}%)`,
                        right: `calc(${(100 - 45) / 2}%)`,
                    }}
                />
                {steps.map((step, index) => {
                    const currentValue = step.data.reduce(
                        (acc, item) => acc + (item.value ?? 0),
                        0
                    );
                    const nextStep = steps[index + 1];
                    const nextValue = nextStep
                        ? nextStep.data.reduce((acc, item) => acc + (item.value ?? 0), 0)
                        : 0;
                    const percentage =
                        currentValue > 0
                            ? ((nextValue / currentValue) * 100).toFixed(2)
                            : "0";
                    const isLast = index === steps.length - 1;
                    const spacing = 45;
                    const offset = (100 - spacing) / 2;
                    const currentPosition = offset + (index * spacing) / (steps.length - 1);
                    const nextPosition =
                        index < steps.length - 1
                            ? offset + ((index + 1) * spacing) / (steps.length - 1)
                            : undefined;
                    const middlePosition =
                        nextPosition !== undefined
                            ? `calc(${(currentPosition + nextPosition) / 2}%)`
                            : null;

                    return (
                        <div key={index}>
                            {!isLast && middlePosition && (
                                <div
                                    className="absolute text-small transform -translate-x-1/2 z-20"
                                    style={{
                                        left: middlePosition,
                                        top: "calc(50% - 1.5rem)",
                                    }}
                                >
                                    {percentage}%
                                </div>
                            )}
                            <div
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 ${isLast ? "w-default h-default bg-bg-primary rounded-full" : ""}`}
                                style={{
                                    left: `calc(${currentPosition}%)`,
                                }}
                            >
                                {!isLast && (
                                    <ChevronRight className="w-medium h-medium text-text-primary" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SiteStepFunnel;