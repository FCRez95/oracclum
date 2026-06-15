"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import Image from "next/image";
import logoTaboolaBlue from "@/assets/logos/logoTaboolaBlue.png";
import logoTaboolaWhite from "@/assets/logos/logoTaboolaWhite.svg";
import logoMeta from "@/assets/logos/logoMeta.png";
import logoMetaWhite from "@/assets/logos/metaWhiteLogo.png";
import { Icon } from "@/components/Icon/iconComponent";
import { useTheme } from "@/hooks/useTheme";
import { CampaignSummaryModel } from "@/models/campaign-summary";
import { DeleteCampaignModal } from "./deleteCampaignModal";
import { EditCampaignModal } from "./editCampaignModal";
import InteractivePieChart from "@/components/ui/piechart";
import { formatNumberMask } from "@/helper/dataMasks";

interface CampaignCardProps extends CampaignSummaryModel {
  onDeleted?: (id: number) => void;
  onEdited?: (id: number, updates: Partial<CampaignSummaryModel>) => void;
  onClick?: () => void;
}

export default function CampaignCard({
  id,
  name,
  link,
  sub_account,
  ad_provider,
  checkout_provider,
  external_id,
  revenue,
  expenses,
  roas = 0,
  clicks,
  checkout,
  conversion,
  sales,
  onDeleted = () => { },
  onEdited = () => { },
  onClick = () => { },
}: CampaignCardProps) {
  const { theme } = useTheme();
  const logo = ad_provider === "meta"
    ? theme === "dark" ? logoMetaWhite : logoMeta
    : theme === "dark" ? logoTaboolaWhite : logoTaboolaBlue;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const revenueData = [
    { label: "Faturamento", value: revenue },
    { label: "Gastos", value: expenses },
  ];

  const clickData = [{ label: "Cliques", value: clicks }];

  const checkoutData = [
    { label: "Checkout", value: checkout },
    { label: "Visualizações", value: clicks - checkout },
  ];

  const salesData = [
    { label: "Vendas", value: sales },
    { label: "Visualizações", value: checkout - sales },
  ];

  function onEditSuccess(updates: Partial<CampaignSummaryModel>) {
    onEdited(id, updates);
  }

  if (removed) return null;

  return (
    <>
      <div
        className="flex flex-col gap-medium hover:cursor-pointer hover:scale-103 rounded-large transition-all h-fit"
        onClick={onClick}
      >
        <Card borderType="borderless" paddingType="small" campaign>
          <div className="flex gap-extra-small items-start justify-between">
            <Image
              src={logo}
              alt={ad_provider === "meta" ? "Meta Logo" : "Taboola Logo"}
              width={90}
              height={32}
              className="mb-small"
            />
            <div className="flex gap-extra-small">

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
              >
                <Icon type="edit" size="small" color="secondary" />
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              >
                <Icon type="delete" size="small" color="cancel" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-extra-small group font-title">
            <h2 className="
              mb-0.5 font-normal 
              max-w-[300px]  
              overflow-hidden 
              text-ellipsis 
              whitespace-nowrap 
              group-hover:whitespace-normal   
              group-hover:break-words"
            >
              {name}
            </h2>
          </div>
          <div className="w-full h-0.5 bg-bg-primary my-extra-small rounded-full" />
          <div className="flex flex-row gap-default items-center mt-default">
            <InteractivePieChart
              data={revenueData}
              type="faturamento"
              title="Resultado ($)"
              size="medium"
              operation={{ a: revenue, b: expenses, op: "-" }}
            />
            <div className="flex flex-col gap-y-small space-x-10 w-44 text-small">
              <span className="flex justify-between w-full">
                <span className="font-semibold">Gastos:</span>
                <span>
                  R${" "}
                  {formatNumberMask(expenses)}
                </span>
              </span>
              <span className="flex justify-between w-full">
                <span className="font-semibold">Fatur.:</span>
                <span>
                  R${" "}
                  {formatNumberMask(revenue)}
                </span>
              </span>
              <span className="flex justify-between w-full">
                <span className="font-semibold">ROAS:</span>
                <span>{roas ? (roas * 100).toFixed(2) : 0}%</span>
              </span>
            </div>
          </div>
          <div className="w-full h-0.5 bg-bg-primary my-extra-small rounded-full" />
          <div className="flex flex-row justify-between w-full mt-small">
            <InteractivePieChart
              data={clickData}
              type="default"
              title="Clicks"
              size="medium"
              operation={clicks}
            />
            <InteractivePieChart
              data={checkoutData}
              type="default"
              title="Checkout"
              size="medium"
              operation={checkout}
            />
            <InteractivePieChart
              data={salesData}
              type="faturamento"
              title="Conversões"
              size="medium"
              operation={sales}
            />
          </div>
        </Card>
      </div>

      {showDeleteModal && (
        <DeleteCampaignModal
          campaignId={id}
          campaignName={name}
          onClose={() => {
            setShowDeleteModal(false);
            if (deleteSuccess) {
              setRemoved(true);
              onDeleted(id);
            }
          }}
          onDeleteSuccess={() => setDeleteSuccess(true)}
          onDeleted={() => { }}
        />
      )}

      {showEditModal && (
        <EditCampaignModal
          idCampaign={id}
          initialName={name}
          initialLink={link ?? ""}
          initialConversion={conversion ?? ""}
          sub_account={sub_account}
          ad_provider={ad_provider}
          checkout_provider={checkout_provider}
          external_id={external_id}
          onClose={() => setShowEditModal(false)}
          onEditSuccess={onEditSuccess}
        />
      )}
    </>
  );
}
