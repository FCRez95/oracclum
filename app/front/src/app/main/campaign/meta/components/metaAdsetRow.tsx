"use client";

import { useState } from "react";
import { MetaAdsetModel } from "@/models/meta-adset-model";
import { updateMetaAdsetAction } from "./metaCampaignActions";
import OperationInfo from "@/components/operationInfo";
import Toggle from "@/components/Toggle/Toggle";
import { Icon } from "@/components/Icon/iconComponent";
import { Loader } from "lucide-react";
import { useMetaCampaignContext } from "@/context/MetaCampaignContext";
import { motion } from "framer-motion";

type MetaAdsetRowProps = {
  adset: MetaAdsetModel;
  onUpdate: (adsetId: string, updates: Partial<MetaAdsetModel>) => void;
};

export default function MetaAdsetRow({ adset, onUpdate }: MetaAdsetRowProps) {
  const { selectedSideDate } = useMetaCampaignContext();
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(
    adset.daily_budget ? (Number(adset.daily_budget) / 100).toFixed(2) : ""
  );
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const isActive = adset.status === "ACTIVE";
  const budgetDisplay = adset.daily_budget
    ? `R$ ${(Number(adset.daily_budget) / 100).toFixed(2)}`
    : "—";

  const periodLabel =
    selectedSideDate === 0
      ? "Today"
      : selectedSideDate === 1
        ? "Yesterday"
        : selectedSideDate === 720 || selectedSideDate === 100000
          ? "All time"
          : `${selectedSideDate} days`;

  const handleToggleStatus = async () => {
    setToggleLoading(true);
    const newStatus = !isActive ? "ACTIVE" : "PAUSED";
    const result = await updateMetaAdsetAction(adset.id, { status: newStatus });
    if (result.success) {
      onUpdate(adset.id, { status: newStatus });
    }
    setToggleLoading(false);
  };

  const handleSaveBudget = async () => {
    setLoadingUpdate(true);
    const cents = String(Math.round(Number(newBudget) * 100));
    const result = await updateMetaAdsetAction(adset.id, {
      daily_budget: cents,
    });
    if (result.success) {
      onUpdate(adset.id, { daily_budget: cents });
    }
    setEditingBudget(false);
    setLoadingUpdate(false);
  };

  return (
    <div className="flex gap-small items-start w-[1100px] 2xl:w-full">
      <div className="flex gap-0 items-start w-full">
        {/* Card */}
        <div className="relative rounded-2xl shadow-md shadow-text-main/25 dark:shadow-none bg-bg-card p-small w-full">
          <div className="flex flex-row w-full items-center gap-2">
            <h2 className="font-semibold flex items-center">
              {adset.name}
            </h2>
          </div>
          <div className="h-[2px] bg-bg-card my-extra-small" />
          <div className="mt-extra-small flex">
            <div className="border-2 border-bg-primary rounded-full pr-small flex w-full">
              <span className="rounded-full bg-bg-black text-text-primary p-small z-10 relative mr-extra-small right-[10px] md:right-0">
                {periodLabel}
              </span>
              <OperationInfo data={adset.summary} allInfo={true} horizontalLayout={true} designStyle={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Side panel: toggle + budget */}
      {!editingBudget ? (
        <div className="rounded-lg border-2 bg-bg-card border-bg-primary p-small flex flex-col items-center justify-center min-w-[120px]">
          {toggleLoading ? (
            <Loader className="animate-spin text-text-main flex-shrink-0" size={20} />
          ) : (
            <Toggle
              size="small"
              isOn={isActive}
              onToggle={handleToggleStatus}
            />
          )}
          <span
            className="text-text-main font-semibold mt-1 cursor-pointer"
            onClick={() => adset.daily_budget && setEditingBudget(true)}
          >
            {budgetDisplay}
          </span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border-2 bg-bg-card border-bg-primary p-small shadow-lg flex flex-col items-center justify-center min-w-[120px]"
        >
          <span className="text-text-main text-small font-semibold">
            Orçamento Diário
          </span>
          <div className="flex flex-col items-center mt-extra-small">
            <label className="text-text-main text-small mb-1">R$</label>
            <input
              type="number"
              step="0.01"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="border rounded px-2 py-1 w-[80px] text-center"
            />
          </div>
          {loadingUpdate ? (
            <Loader className="animate-spin text-text-main flex-shrink-0 mt-extra-small" size={20} />
          ) : (
            <div className="flex gap-small mt-extra-small">
              <button onClick={() => setEditingBudget(false)} title="Cancelar">
                <Icon type="close" size="medium" color="cancel" />
              </button>
              <button onClick={handleSaveBudget} title="Salvar">
                <Icon type="check" size="medium" color="primary" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
