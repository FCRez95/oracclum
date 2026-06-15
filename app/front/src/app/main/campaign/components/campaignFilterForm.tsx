import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import InputComponent from '@/components/Forms/InputComponent';

type CampaignFilterFormProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedMetric: string;
  setSelectedMetric: (value: string) => void;
  orderDirection: 'asc' | 'desc';
  setOrderDirection: (value: 'asc' | 'desc') => void;
  selectedProvider?: string;
  setSelectedProvider?: (value: string) => void;
  sitePage?: boolean;
};

const CampaignFilterForm: React.FC<CampaignFilterFormProps> = ({
  searchTerm,
  setSearchTerm,
  selectedMetric,
  setSelectedMetric,
  orderDirection,
  setOrderDirection,
  selectedProvider,
  setSelectedProvider,
  sitePage,
}) => {
  return (
    <div className="flex flex-col gap-extra-small p-small md:p-0">
      <span className="text-center text-text-on-primary text-small">
        {sitePage ? "Filtrar sites" : "Filtrar campanhas"}
      </span>

      <InputComponent
        type="text"
        placeholder="Buscar por nome"
        defaultValue={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        classType="extraSmall"
      />

      {selectedProvider !== undefined && setSelectedProvider && (
        <div className="flex flex-col gap-1">
          <label
            className="text-extra-small text-text-on-primary mb-0.5"
            htmlFor="provider-select"
          >
            Plataforma
          </label>
          <Select.Root value={selectedProvider} onValueChange={setSelectedProvider}>
            <Select.Trigger
              id="provider-select"
              className="p-extra-small rounded border border-border-muted bg-bg-app flex items-center justify-between text-text-main/70 text-small"
            >
              <Select.Value placeholder="Selecione" />
              <Select.Icon>
                <ChevronDown />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-60 bg-bg-app border border-border-muted rounded shadow-md text-small">
                <Select.Viewport className="p-1">
                  <Select.Item value="all" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Todos</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="meta" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Meta</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="taboola" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Taboola</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      )}

      <div className="h-0.25 rounded-full bg-bg-primary my-extra-small" />

      <div className='flex flex-col gap-extra-small'>
        {/* Select "Ordenar por" */}
        <div className="flex flex-col gap-1">
          <label
            className="text-extra-small text-text-on-primary mb-0.5"
            htmlFor="order-by-select"
          >
            Ordenar por
          </label>
          <Select.Root value={selectedMetric} onValueChange={setSelectedMetric}>
            <Select.Trigger
              id="order-by-select"
              className="p-extra-small rounded border border-border-muted bg-bg-app flex items-center justify-between text-text-main/70 text-small"
            >
              <Select.Value placeholder="Selecione" />
              <Select.Icon>
                <ChevronDown />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-60 bg-bg-app border border-border-muted rounded shadow-md text-small">
                <Select.Viewport className="p-1">
                  <Select.Item value="id" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Data da criação</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="roas" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>ROAS</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="expenses" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Gastos</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="revenue" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Faturamento</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="clicks" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Clicks</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="checkout" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Checkout</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="sales" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Conversões</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Select "Ordem" */}
        <div className="flex flex-col gap-1">
          <label
            className="text-extra-small text-text-on-primary mb-0.5 mt-extra-small"
            htmlFor="order-direction-select"
          >
            Ordem
          </label>
          <Select.Root value={orderDirection} onValueChange={setOrderDirection}>
            <Select.Trigger
              id="order-direction-select"
              className="p-extra-small rounded border border-border-muted bg-bg-app flex items-center justify-between text-text-main/70 text-small"
            >
              <Select.Value placeholder="Selecione" />
              <Select.Icon>
                <ChevronDown />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-60 bg-bg-app border border-border-muted rounded shadow-md text-small">
                <Select.Viewport className="p-1">
                  <Select.Item value="desc" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Decrescente</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="asc" className="p-extra-small rounded hover:bg-bg-primary">
                    <Select.ItemText>Crescente</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    </div>
  );
};

export default CampaignFilterForm;

