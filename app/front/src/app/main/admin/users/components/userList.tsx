"use client";

import { useEffect, useState } from "react";
import { EnrichedAccount } from "@/models/enriched-account";
import { loadAllUsers } from "@/app/(DataAccessLayer)/(appServices)/calls/admin/callLoadAllUsers";
import { CallerWrapper } from "@/utils/CallerWrapper";
import UserRow from "./userRow";
import Loading from "@/components/Loading";
import { Search, ChevronDown } from "lucide-react";
import * as Select from "@radix-ui/react-select";

export default function UserList() {
  const [users, setUsers] = useState<EnrichedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [sortMetric, setSortMetric] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const data = await CallerWrapper(loadAllUsers(controller.signal));
        setUsers(data);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "AbortError" || error.message?.includes("signal is aborted")) return;
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, []);

  function handleUserDeleted(userId: number) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  function handleUserDeactivated(userId: number) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, allow_clicks: false } : u))
    );
  }

  function handleUserActivated(userId: number) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, allow_clicks: true } : u))
    );
  }

  const filteredUsers = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((u) => !filterActive || u.allow_clicks)
    .sort((a, b) => {
      let valA: string | number, valB: string | number;
      switch (sortMetric) {
        case "clicks": valA = a.total_clicks; valB = b.total_clicks; break;
        case "revenue": valA = a.total_revenue; valB = b.total_revenue; break;
        case "sales": valA = a.total_sales; valB = b.total_sales; break;
        default: valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
      }
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortDirection === "desc" ? -cmp : cmp;
    });

  if (loading) {
    return <Loading text="Loading users..." fullscreen={false} />;
  }

  return (
    <div className="flex flex-col gap-small w-full">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-default bg-bg-card text-text-main placeholder:text-text-secondary/50"
        />
      </div>

      {/* Filter & Sort */}
      <div className="flex flex-wrap items-center gap-small">
        <button
          onClick={() => setFilterActive((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-small transition-colors ${
            filterActive
              ? "bg-bg-primary text-text-on-primary"
              : "bg-bg-card border border-border-default text-text-secondary"
          }`}
        >
          Apenas ativos
        </button>

        <Select.Root value={sortMetric} onValueChange={setSortMetric}>
          <Select.Trigger className="px-3 py-1.5 rounded-lg border border-border-default bg-bg-card flex items-center gap-2 text-text-main text-small">
            <Select.Value placeholder="Ordenar por" />
            <Select.Icon><ChevronDown size={14} /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-60 bg-bg-app border border-border-muted rounded shadow-md text-small">
              <Select.Viewport className="p-1">
                <Select.Item value="name" className="p-extra-small rounded hover:bg-bg-primary cursor-pointer">
                  <Select.ItemText>Nome</Select.ItemText>
                </Select.Item>
                <Select.Item value="clicks" className="p-extra-small rounded hover:bg-bg-primary cursor-pointer">
                  <Select.ItemText>Clicks</Select.ItemText>
                </Select.Item>
                <Select.Item value="revenue" className="p-extra-small rounded hover:bg-bg-primary cursor-pointer">
                  <Select.ItemText>Faturamento</Select.ItemText>
                </Select.Item>
                <Select.Item value="sales" className="p-extra-small rounded hover:bg-bg-primary cursor-pointer">
                  <Select.ItemText>Conversões</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Select.Root value={sortDirection} onValueChange={(v) => setSortDirection(v as "asc" | "desc")}>
          <Select.Trigger className="px-3 py-1.5 rounded-lg border border-border-default bg-bg-card flex items-center gap-2 text-text-main text-small">
            <Select.Value placeholder="Ordem" />
            <Select.Icon><ChevronDown size={14} /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-60 bg-bg-app border border-border-muted rounded shadow-md text-small">
              <Select.Viewport className="p-1">
                <Select.Item value="asc" className="p-extra-small rounded hover:bg-bg-primary cursor-pointer">
                  <Select.ItemText>Crescente</Select.ItemText>
                </Select.Item>
                <Select.Item value="desc" className="p-extra-small rounded hover:bg-bg-primary cursor-pointer">
                  <Select.ItemText>Decrescente</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* User rows */}
      <div className="flex flex-col gap-small">
        {filteredUsers.length === 0 ? (
          <p className="text-text-secondary">No users found</p>
        ) : (
          filteredUsers.map((user) => <UserRow key={user.id} user={user} onDeleted={handleUserDeleted} onDeactivated={handleUserDeactivated} onActivated={handleUserActivated} />)
        )}
      </div>
    </div>
  );
}
