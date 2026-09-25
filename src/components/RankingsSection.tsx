import React, { useState } from 'react';
import { MovementItem, MovementType } from '../types';

interface RankingsSectionProps {
  data: MovementItem[];
  onSelectClient?: (clientName: string) => void;
}

export const RankingsSection: React.FC<RankingsSectionProps> = ({
  data,
  onSelectClient,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<MovementType>('Comodato');

  // 1. Top 5 Destinatários de Maior Volume
  const saidas = data.filter(
    (d) => d.tipo === 'Comodato' || d.tipo === 'Demonstração' || d.tipo === 'Locação'
  );
  const clientTotals: Record<string, number> = {};
  saidas.forEach((d) => {
    clientTotals[d.cliente] = (clientTotals[d.cliente] || 0) + d.qtd;
  });
  const sortedTopClients = Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxTopVal = sortedTopClients[0] ? sortedTopClients[0][1] : 1;

  // 2. Ranking por Categoria
  const categoryItems = data.filter((d) => d.tipo === activeCategoryTab);
  const categoryTotals: Record<string, number> = {};
  categoryItems.forEach((d) => {
    categoryTotals[d.cliente] = (categoryTotals[d.cliente] || 0) + d.qtd;
  });
  const sortedCategoryClients = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 3. Clientes Sem Retorno (Saldo positivo)
  const balances: Record<string, number> = {};
  data.forEach((d) => {
    balances[d.cliente] = (balances[d.cliente] || 0) + d.qtd_liquida;
  });
  const sortedSemRetorno = Object.entries(balances)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
      {/* Card A: Destinatários de Maior Volume de Expedição */}
      <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-dim">
        <div className="flex items-center justify-between pb-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              military_tech
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Destinatários de Maior Volume
            </h3>
          </div>
          <span className="font-data-tabular text-label-sm text-secondary font-semibold">
            Top 5 Saídas
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-secondary mb-space-md">
          Clientes que mais receberam equipamentos no período.
        </p>

        {sortedTopClients.length === 0 ? (
          <div className="py-6 text-center text-secondary font-body-sm italic">
            Nenhum dado encontrado
          </div>
        ) : (
          <div className="flex flex-col gap-space-md flex-1 justify-center">
            {sortedTopClients.map(([cliente, val], idx) => {
              const pct = ((val / maxTopVal) * 100).toFixed(1);
              return (
                <div
                  key={cliente}
                  onClick={() => onSelectClient?.(cliente)}
                  className="flex flex-col gap-1 cursor-pointer group"
                  title={`Filtrar por ${cliente}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full ${
                          idx === 0
                            ? 'bg-primary text-on-primary font-bold'
                            : 'bg-surface-container-high text-on-surface'
                        } font-data-tabular-bold text-[11px] flex items-center justify-center shrink-0`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                        {cliente}
                      </span>
                    </div>
                    <span className="font-data-tabular-bold text-body-sm text-on-surface shrink-0">
                      {val} un
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card B: Ranking por Categoria */}
      <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-dim">
        <div className="flex items-center justify-between pb-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              category
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Ranking por Categoria
            </h3>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-secondary mb-space-sm">
          Top clientes por modalidade contratual.
        </p>

        {/* Abas Interativas */}
        <div className="flex p-1 bg-surface-container-low rounded-lg mb-space-md border border-surface-dim">
          {(['Comodato', 'Demonstração', 'Locação'] as MovementType[]).map((tab) => {
            const isActive = activeCategoryTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveCategoryTab(tab)}
                className={`flex-1 py-1 px-space-xs text-center rounded-xs font-label-md text-label-md font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {sortedCategoryClients.length === 0 ? (
          <div className="py-6 text-center text-secondary font-body-sm italic">
            Nenhum registro encontrado para {activeCategoryTab}
          </div>
        ) : (
          <div className="flex flex-col gap-space-md flex-1 justify-center">
            {sortedCategoryClients.map(([cliente, val], idx) => (
              <div
                key={cliente}
                onClick={() => onSelectClient?.(cliente)}
                className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg border border-surface-dim hover:border-primary/30 transition-all cursor-pointer group"
                title={`Filtrar por ${cliente}`}
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span
                    className={`font-data-tabular-bold text-headline-md ${
                      idx === 0 ? 'text-primary' : 'text-on-surface'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <div className="truncate max-w-[200px]">
                    <p className="font-label-md text-label-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
                      {cliente}
                    </p>
                    <p className="font-body-sm text-body-sm text-secondary">
                      {activeCategoryTab}
                    </p>
                  </div>
                </div>
                <span className="font-data-tabular-bold text-body-md text-on-surface shrink-0 ml-2">
                  {val} un
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card C: Clientes com Produtos Sem Retorno (Retenção) */}
      <div className="flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-dim">
        <div className="flex items-center justify-between pb-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              notification_important
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Clientes sem Retorno
            </h3>
          </div>
          <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-data-tabular-bold text-label-sm">
            MAIOR SALDO
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-secondary mb-space-md">
          Clientes acumulando saldo positivo de ativos sem devolução.
        </p>

        {sortedSemRetorno.length === 0 ? (
          <div className="py-6 text-center text-secondary font-body-sm italic">
            Nenhum saldo pendente de devolução
          </div>
        ) : (
          <div className="flex flex-col gap-space-sm flex-1">
            {sortedSemRetorno.map(([cliente, val]) => (
              <div
                key={cliente}
                onClick={() => onSelectClient?.(cliente)}
                className="p-space-sm rounded-lg bg-surface-container-low border border-surface-dim flex flex-col gap-space-2xs hover:border-primary/40 transition-all cursor-pointer group"
                title={`Filtrar por ${cliente}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-space-xs truncate min-w-0">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                    <span className="font-label-md text-label-md text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                      {cliente}
                    </span>
                  </div>
                  <span className="font-data-tabular-bold text-primary text-body-sm shrink-0">
                    +{val} un
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
