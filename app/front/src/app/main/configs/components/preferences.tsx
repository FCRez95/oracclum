"use client";

import { useState } from "react";

import { Button } from "@/components/Button/buttonComponent";
import { ToggleThemeButton } from "@/components/toggleThemeBtn";

import DeleteMyDataModal from "./deleteMyDataModal";

export default function Preferences() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="flex flex-col pb-medium gap-default">
      <div className="flex gap-small">
        <p>Tema:</p>
        <ToggleThemeButton />
      </div>

      <section className="max-w-2xl rounded-large border border-border-error bg-bg-cancel/10 p-default">
        <h2 className="font-title text-subtitle text-text-main">
          ATENÇÃO:
        </h2>
        <p className="mt-extra-small text-content text-text-main">
          Ao confirmar esta ação, todos os dados relacionados à sua conta serão
          deletados. Esse processo não pode ser revertido.
        </p>
        <div className="mt-default flex justify-start">
          <Button
            type="cancel"
            size="medium"
            onClickAction={() => setIsDeleteModalOpen(true)}
          >
            Deletar meus dados
          </Button>
        </div>
      </section>

      {isDeleteModalOpen && (
        <DeleteMyDataModal onClose={() => setIsDeleteModalOpen(false)} />
      )}
    </div>
  );
}
