import React from 'react';
import { KpiSummary } from '../types';

interface KpiCardsProps {
  summary: KpiSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
      {/* Card 1: Total Saídas Gerais */}
      <div className="flex flex-col justify-between bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-dim transition-all hover:border-secondary/40">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Total Saídas Gerais
          </span>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">output</span>
          </span>
        </div>
        <div className="mt-space-md flex flex-col">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {summary.totalSaidas}
            </span>
            <span className="font-data-tabular text-body-sm text-secondary">un</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary mt-1">
            Expedições (Comodato, Dem. e Loc.)
          </span>
        </div>
      </div>

      {/* Card 2: Comodato */}
      <div className="flex flex-col justify-between bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-dim transition-all hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Comodato
          </span>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-[16px]">handshake</span>
          </span>
        </div>
        <div className="mt-space-md flex flex-col">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {summary.comodato}
            </span>
            <span className="font-data-tabular text-body-sm text-secondary">un</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary mt-1">
            {summary.comodatoPct}% do volume de saídas
          </span>
        </div>
      </div>

      {/* Card 3: Demonstração */}
      <div className="flex flex-col justify-between bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-dim transition-all hover:border-secondary/40">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Demonstração
          </span>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-low text-secondary">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </span>
        </div>
        <div className="mt-space-md flex flex-col">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {summary.demonstracao}
            </span>
            <span className="font-data-tabular text-body-sm text-secondary">un</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary mt-1">
            {summary.demonstracaoPct}% do volume de saídas
          </span>
        </div>
      </div>

      {/* Card 4: Locação */}
      <div className="flex flex-col justify-between bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-dim transition-all hover:border-secondary/40">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Locação
          </span>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-low text-secondary">
            <span className="material-symbols-outlined text-[16px]">real_estate_agent</span>
          </span>
        </div>
        <div className="mt-space-md flex flex-col">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-surface">
              {summary.locacao}
            </span>
            <span className="font-data-tabular text-body-sm text-secondary">un</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary mt-1">
            {summary.locacaoPct}% do volume de saídas
          </span>
        </div>
      </div>

      {/* Card 5: Sem Retorno (Retenção Positiva em Clientes) */}
      <div className="flex flex-col justify-between bg-error-container p-space-md rounded-xl shadow-xs border border-primary/20 relative overflow-hidden transition-all hover:border-primary/50">
        <div className="flex items-center justify-between relative z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-error-container font-semibold">
            Sem Retorno
          </span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
        </div>
        <div className="mt-space-md flex flex-col relative z-10">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-metric-display text-metric-display text-on-error-container">
              {summary.semRetorno}
            </span>
            <span className="font-data-tabular text-body-sm text-on-error-container font-normal">
              un
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-error-container mt-1 font-semibold">
            Ativos retidos em clientes
          </span>
        </div>
      </div>
    </div>
  );
};
