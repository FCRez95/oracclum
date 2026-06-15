import { useState } from "react";
import { MetaCampaignData } from "@/models/meta-campaign-data";
import { Icon } from "./Icon/iconComponent";
import Toggle from "@/components/Toggle/Toggle";
import Loading from "@/components/Loading";
import { updateMetaCampaignAction } from "@/app/main/campaign/meta/components/metaCampaignActions";

type MetaSideInfoProps = {
  daily_budget?: string;
  status?: string;
  effective_status?: string;
  issues_info?: { error_code: number; error_summary: string; error_message: string; level: string }[];
  objective?: string;
  loading?: boolean;
  edit?: boolean;
  setEditMeta: (edit: boolean) => void;
  externalId: string;
  metaData?: MetaCampaignData;
  setMetaData: (data: MetaCampaignData) => void;
};

const rowClass =
  "flex flex-row justify-between items-center w-full text-default text-text-on-primary";

const effectiveStatusMap: Record<string, string> = {
  WITH_ISSUES: "Com problemas",
  IN_PROCESS: "Em processamento",
  PAUSED: "Pausada",
  DELETED: "Excluída",
  ARCHIVED: "Arquivada",
};

function Skeleton() {
  return (
    <span className="inline-block h-5 w-20 bg-bg-card/30 rounded animate-pulse"></span>
  );
}

export default function MetaSideInfo({
  daily_budget,
  status,
  effective_status,
  issues_info,
  objective,
  loading = false,
  edit,
  setEditMeta,
  externalId,
  metaData,
  setMetaData,
}: MetaSideInfoProps) {
  const budgetDisplay = daily_budget ? (Number(daily_budget) / 100).toFixed(2) : "—";
  const [newBudget, setNewBudget] = useState(budgetDisplay);
  const [newActive, setNewActive] = useState(status === "ACTIVE");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleToggleStatus = () => {
    setNewActive(!newActive);
  };

  const handleStartEdit = () => {
    setNewBudget(budgetDisplay);
    setNewActive(status === "ACTIVE");
    setEditMeta(true);
  };

  const handleCampaignEdit = async () => {
    setLoadingEdit(true);
    const updateData: Record<string, unknown> = {
      status: newActive ? "ACTIVE" : "PAUSED",
    };
    if (newBudget !== "—") {
      updateData.daily_budget = String(Math.round(Number(newBudget) * 100));
    }
    try {
      await updateMetaCampaignAction(externalId, updateData);
      setMetaData({
        ...metaData as MetaCampaignData,
        status: newActive ? "ACTIVE" : "PAUSED",
        daily_budget: updateData.daily_budget as string ?? metaData?.daily_budget,
      });
    } catch (error) {
      console.error("Erro ao atualizar dados da campanha Meta:", error);
    }
    setLoadingEdit(false);
    setEditMeta(false);
  };

  return (
    <div className="bg-bg-navbar border-2 border-solid border-border-highlight rounded-extra-large p-small flex flex-col gap-3 text-text-primary w-full">
      {loadingEdit ? <Loading fullscreen={false} /> : (
        <>
          <div className="flex flex-row justify-between items-center">
            <span className="font-bold text-medium">Meta</span>
            {!edit ? <Icon type="edit" size="medium" color="primary" onClickAction={handleStartEdit} />
            : <div className="flex flex-row gap-small">
                <button className="cursor-pointer flex" onClick={() => setEditMeta(false)} title="Cancelar">
                    <Icon type="close" size="medium" color="cancel" />
                </button>
                <button className="cursor-pointer flex" onClick={handleCampaignEdit} title="Salvar">
                    <Icon type="check" size="medium" color="primary" />
                </button></div>}
          </div>

          <div className={rowClass}>
            <span>Orçamento Diário:</span>
            {loading ? <Skeleton />
            : edit ? <input type="number" id="edit-daily-budget" step="0.01" defaultValue={newBudget !== "—" ? newBudget : ""} onChange={(e) => setNewBudget(e.target.value)} className="border rounded px-2 py-1 w-[80px] text-center" />
            : <span>R$ {budgetDisplay}</span>}
          </div>

          <div className={rowClass}>
            <span>Status:</span>
            {loading ? <Skeleton />
            : edit ? <Toggle
            size="small"
            isOn={newActive}
            onToggle={handleToggleStatus}
            />
            : <span>{status === "ACTIVE" ? "Ativa" : "Pausada"}</span>}
          </div>

          {!loading && effective_status && effective_status !== "ACTIVE" && (
            <div className="flex flex-col gap-1 w-full">
              <div className={rowClass}>
                <span>Entrega:</span>
                <span className={effective_status === "WITH_ISSUES" ? "text-red-400" : "text-yellow-400"}>
                  {"\u26A0"} {effectiveStatusMap[effective_status] ?? effective_status}
                </span>
              </div>
              {issues_info && issues_info.length > 0 && (
                <span className="text-small text-text-alt-primary pl-1">
                  {issues_info[0].error_summary}
                </span>
              )}
            </div>
          )}

          <div className={rowClass}>
            <span>Objetivo:</span>
            {loading ? <Skeleton />
            : <span>{objective || "—"}</span>}
          </div>
        </>
      )}
    </div>
  );
}
