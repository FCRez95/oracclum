import { useState } from "react";
import { CampaignTaboolaData } from "../models/campaign-taboola-data";
import { Icon } from "./Icon/iconComponent";
import Toggle from "@/components/Toggle/Toggle";
import Loading from "@/components/Loading";
import { updateTaboolaCampaignDataAction } from "@/app/main/campaign/components/campaignActions";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";

type TaboolaSideInfoProps = Pick<
  CampaignTaboolaData,
  "cpc" | "daily_cap" | "is_active"
>;

const rowClass =
  "flex flex-row justify-between items-center w-full text-default text-text-on-primary";

function Skeleton() {
  return (
    <span className="inline-block h-5 w-20 bg-bg-card/30 rounded animate-pulse"></span>
  );
}

export default function TaboolaSideInfo({
  cpc,
  daily_cap,
  is_active,
  loading = false,
  edit,
  setEditTaboola,
  externalId,
  taboolaData,
  setTaboolaData,
  campaign
}: TaboolaSideInfoProps & { loading?: boolean; edit?: boolean; setEditTaboola: (edit: boolean) => void; externalId: string; taboolaData?: CampaignTaboolaData; setTaboolaData: (data: CampaignTaboolaData) => void; campaign?: CampaignOptimizationModel }) {
  const [newCpc, setNewCpc] = useState(cpc);
  const [newDailyCap, setNewDailyCap] = useState(daily_cap);
  const [newActive, setNewActive] = useState(is_active);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const handleToggleStatus = () => {
    setNewActive(!newActive);
  }

  const handleStartEdit = () => {
    setNewCpc(cpc);
    setNewDailyCap(daily_cap);
    setNewActive(is_active);
    setEditTaboola(true);
  };

  const handleCampaignEdit = async () => {
    setLoadingEdit(true);
    const updateData = {
      cpc: newCpc,
      daily_cap: newDailyCap,
      is_active: newActive
    }
    try {
      await updateTaboolaCampaignDataAction(externalId, updateData, campaign?.sub_account as string);
      setTaboolaData({
        ...taboolaData as CampaignTaboolaData,
        cpc: newCpc,
        daily_cap: newDailyCap,
        is_active: newActive
      });
    } catch (error) {
      console.error("Erro ao atualizar dados da campanha Taboola:", error);
    }
    setLoadingEdit(false);
    setEditTaboola(false);
  }
  return (
    <div className="bg-bg-navbar border-2 border-solid border-border-highlight rounded-extra-large p-small flex flex-col gap-3 text-text-primary w-full">
      {loadingEdit ? <Loading fullscreen={false}/> : (
        <>
          <div className="flex flex-row justify-between items-center">
            <span className="font-bold text-medium">Taboola</span>
            {!edit ? <Icon type="edit" size="medium" color="primary" onClickAction={handleStartEdit} /> 
            : <div className="flex flex-row gap-small">
                <button className="cursor-pointer flex" onClick={() => setEditTaboola(false)} title="Cancelar">
                    <Icon type="close" size="medium" color="cancel" />
                </button>
                <button className="cursor-pointer flex" onClick={handleCampaignEdit} title="Salvar">
                    <Icon type="check" size="medium" color="primary" />
                </button></div>}
          </div>

          <div className={rowClass}>
            <span>CPC:</span>
            {loading ? <Skeleton /> 
            : edit ? < input type="number" id="edit-cpc" step="0.001" defaultValue={cpc} onChange={(e) => setNewCpc(Number(e.target.value))} className="border rounded px-2 py-1 w-[80px] text-center" />
            : <span>{cpc}</span>}
          </div>

          <div className={rowClass}>
            <span className="truncate">Limite Diário:</span>
            {loading ? <Skeleton />
            : edit ? < input type="number" id="edit-daily-cap" defaultValue={daily_cap} onChange={(e) => setNewDailyCap(Number(e.target.value))} className="border rounded px-2 py-1 w-[80px] text-center" />
            : <span>{daily_cap}</span>}
          </div>

          <div className={rowClass}>
            <span>Status:</span>
            {loading ? <Skeleton />
            : edit ? <Toggle
            size="small"
            isOn={newActive || false}
            onToggle={handleToggleStatus}
            />
            : <span>{is_active ? "Ativa" : "Pausada"}</span>}
          </div>
        </>
      )}
    </div>
  );
}
