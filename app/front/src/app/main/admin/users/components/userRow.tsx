"use client";

import { useState, useRef, useEffect } from "react";
import { EnrichedAccount } from "@/models/enriched-account";
import { ChevronDown, User, Mail, Calendar, MousePointer, DollarSign, ShoppingCart, MoreVertical, Trash2, UserX, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMaxClicks } from "@/constants/planLimits";
import { DeleteUserModal } from "./deleteUserModal";
import { DeactivateUserModal } from "./deactivateUserModal";
import { ActivateUserModal } from "./activateUserModal";

type UserRowProps = {
  user: EnrichedAccount;
  onDeleted: (userId: number) => void;
  onDeactivated: (userId: number) => void;
  onActivated: (userId: number) => void;
};

function formatClicks(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

export default function UserRow({ user, onDeleted, onDeactivated, onActivated }: UserRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const maxClicks = getMaxClicks(user.user_type);
  const clickUsage = maxClicks > 0 ? (user.total_clicks / maxClicks) * 100 : 0;
  const phoneNumber = user.telephone ?? user.phone;

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <div className="flex gap-small items-start w-full">
        <div className="flex gap-0 items-start w-full">
          {/* Expand button */}
          <div className="flex flex-col justify-center">
            <button
              className="h-full min-h-[53px] w-10 flex items-center justify-center rounded-l-lg border-2 border-bg-alt-primary border-r-0 bg-bg-alt-primary hover:bg-bg-primary-hover transition cursor-pointer"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                size={24}
                className={`transition-transform text-text-alt-main ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* User card */}
          <div className="relative rounded-2xl rounded-tl-none shadow-md shadow-text-main/25 dark:shadow-none bg-bg-card p-small w-full">
            {/* Header row */}
            <div className="flex flex-row w-full items-center justify-between flex-wrap gap-small">
              <div className="flex items-center gap-small">
                <User size={20} className="text-text-secondary" />
                <h2 className="font-semibold text-text-main">{user.name}</h2>
                <span
                  className={`text-extra-small px-2 py-1 rounded-full ${
                    user.user_type === "admin"
                      ? "bg-primary/20 text-primary"
                      : "bg-bg-alt-primary text-text-secondary"
                  }`}
                >
                  {user.user_type}
                </span>
              </div>
              <div className="flex items-center gap-small">
                <div className="flex flex-wrap items-center gap-small text-text-secondary text-small">
                  <div className="flex items-center gap-small">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  {phoneNumber && (
                    <div className="flex items-center gap-small">
                      <Phone size={16} />
                      <span>{phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* 3-dots menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    className="p-1 rounded-md hover:bg-bg-primary-hover transition cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                    title="Actions"
                  >
                    <MoreVertical size={18} className="text-text-secondary" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-bg-card border border-border-default rounded-lg shadow-lg z-10 min-w-[140px]">
                      {user.allow_clicks ? (
                        <button
                          className="flex items-center gap-2 w-full px-3 py-2 text-small text-text-main hover:bg-bg-primary-hover rounded-t-lg transition cursor-pointer"
                          onClick={() => {
                            setMenuOpen(false);
                            setDeactivateModalOpen(true);
                          }}
                        >
                          <UserX size={14} className="text-yellow-500" />
                          <span>Desativar</span>
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-2 w-full px-3 py-2 text-small text-text-main hover:bg-bg-primary-hover rounded-t-lg transition cursor-pointer"
                          onClick={() => {
                            setMenuOpen(false);
                            setActivateModalOpen(true);
                          }}
                        >
                          <User size={14} className="text-text-success" />
                          <span>Ativar</span>
                        </button>
                      )}
                      <div className="relative group">
                        <button
                          className={`flex items-center gap-2 w-full px-3 py-2 text-small rounded-b-lg transition ${
                            user.allow_clicks
                              ? "text-text-muted cursor-not-allowed"
                              : "text-text-main hover:bg-bg-primary-hover cursor-pointer"
                          }`}
                          onClick={() => {
                            if (user.allow_clicks) return;
                            setMenuOpen(false);
                            setDeleteModalOpen(true);
                          }}
                          disabled={!!user.allow_clicks}
                        >
                          <Trash2 size={14} className={user.allow_clicks ? "text-text-muted" : "text-text-error"} />
                          <span>Deletar</span>
                        </button>
                        {!!user.allow_clicks && (
                          <div className="absolute hidden group-hover:block right-full top-1/2 -translate-y-1/2 mr-1 px-2 py-1 text-extra-small text-text-main bg-bg-app border border-border-default rounded-md shadow-md whitespace-nowrap z-20">
                            Desative o usuário primeiro
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-[2px] bg-bg-primary my-extra-small" />

            {/* Summary row */}
            <div className="flex gap-default text-small text-text-secondary flex-wrap">
              <div className="flex items-center gap-1">
                <MousePointer size={14} />
                <span className={clickUsage >= 90 ? "text-text-error" : clickUsage >= 70 ? "text-yellow-500" : ""}>
                  {formatClicks(user.total_clicks)} / {formatClicks(maxClicks)} clicks
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={14} />
                <span>${user.total_revenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingCart size={14} />
                <span>{user.total_sales} sales</span>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-small overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-small text-small">
                    <div>
                      <span className="text-text-secondary">Contract:</span>
                      <span
                        className={`ml-2 ${
                          user.contract_signed ? "text-text-success" : "text-text-error"
                        }`}
                      >
                        {user.contract_signed ? "Signed" : "Not signed"}
                      </span>
                    </div>
                    {user.signed_at && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-text-secondary" />
                        <span>{new Date(user.signed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-text-secondary">Allow clicks:</span>
                      <span
                        className={`ml-2 ${
                          user.allow_clicks ? "text-text-success" : "text-text-error"
                        }`}
                      >
                        {user.allow_clicks ? "Yes" : "No"}
                      </span>
                    </div>
                    {user.ip_address && (
                      <div>
                        <span className="text-text-secondary">IP:</span>
                        <span className="ml-2">{user.ip_address}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {deleteModalOpen && (
        <DeleteUserModal
          onClose={() => setDeleteModalOpen(false)}
          onDeleted={onDeleted}
          userId={user.id}
          userName={user.name}
        />
      )}

      {deactivateModalOpen && (
        <DeactivateUserModal
          onClose={() => setDeactivateModalOpen(false)}
          onDeactivated={onDeactivated}
          userId={user.id}
          userName={user.name}
        />
      )}

      {activateModalOpen && (
        <ActivateUserModal
          onClose={() => setActivateModalOpen(false)}
          onActivated={onActivated}
          userId={user.id}
          userName={user.name}
        />
      )}
    </>
  );
}
