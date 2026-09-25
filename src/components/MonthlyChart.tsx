import React, { useState } from 'react';
import { MovementItem } from '../types';

interface MonthlyChartProps {
  data: MovementItem[];
}

interface MonthStat {
  month: string;
  total: number;
  comodato: number;
  demonstracao: number;
  locacao: number;
  comodatoPct: number;
  demonstracaoPct: number;
  locacaoPct: number;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Extract unique months sorted
  const months = Array.from(new Set(data.map((d) => d.mes_calc))).sort();

  const monthStats: MonthStat[] = months
    .map((m) => {
      const items = data.filter(
        (d) =>
          d.mes_calc === m &&
          (d.tipo === 'Comodato' || d.tipo === 'Demonstração' || d.tipo === 'Locação')
      );
      const total = items.reduce((acc, d) => acc + d.qtd, 0);

      const comodato = items
        .filter((d) => d.tipo === 'Comodato')
        .reduce((acc, d) => acc + d.qtd, 0);
      const demonstracao = items
        .filter((d) => d.tipo === 'Demonstração')
        .reduce((acc, d) => acc + d.qtd, 0);
      const locacao = items
        .filter((d) => d.tipo === 'Locação')
        .reduce((acc, d) => acc + d.qtd, 0);

      if (total === 0) return null;

      const comodatoPct = Math.round((comodato / total) * 100);
      const demonstracaoPct = Math.round((demonstracao / total) * 100);
      const locacaoPct = Math.round((locacao / total) * 100);

      return {
        month: m,
        total,
        comodato,
        demonstracao,
        locacao,
        comodatoPct,
        demonstracaoPct,
        locacaoPct,
      };
    })
    .filter(Boolean) as MonthStat[];

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-xs border border-surface-dim">
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Proporção Mensal de Movimentações de Saídas
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Distribuição entre Comodato vs. Demonstração vs. Locação mês a mês
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-md font-label-sm text-label-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-primary"></span>
            <span className="text-on-surface">Comodato</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-secondary"></span>
            <span className="text-on-surface">Demonstração</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-on-background"></span>
            <span className="text-on-surface">Locação</span>
          </div>
        </div>
      </div>

      {monthStats.length === 0 ? (
        <div className="py-8 text-center text-secondary font-body-sm italic">
          Nenhuma movimentação de saída registrada para os filtros selecionados.
        </div>
      ) : (
        <div className="flex flex-col gap-space-xs w-full font-data-tabular text-table-header">
          {monthStats.map((stat) => (
            <div
              key={stat.month}
              className="flex items-center gap-space-sm group relative"
              onMouseEnter={() => setHoveredMonth(stat.month)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <span className="w-16 text-secondary text-right shrink-0 group-hover:text-on-surface font-semibold transition-colors">
                {stat.month}
              </span>
              <div className="w-full flex h-6 rounded-xs bg-surface-container-low overflow-hidden border border-surface-dim relative cursor-pointer">
                {stat.comodato > 0 && (
                  <div
                    className="bg-primary hover:brightness-110 flex items-center justify-center text-on-primary font-data-tabular-bold text-[10px] transition-all"
                    style={{ width: `${stat.comodatoPct}%` }}
                    title={`Comodato: ${stat.comodato} un (${stat.comodatoPct}%)`}
                  >
                    {stat.comodatoPct >= 10 ? `${stat.comodatoPct}%` : ''}
                  </div>
                )}
                {stat.demonstracao > 0 && (
                  <div
                    className="bg-secondary hover:brightness-110 flex items-center justify-center text-on-primary font-data-tabular text-[10px] transition-all"
                    style={{ width: `${stat.demonstracaoPct}%` }}
                    title={`Demonstração: ${stat.demonstracao} un (${stat.demonstracaoPct}%)`}
                  >
                    {stat.demonstracaoPct >= 10 ? `${stat.demonstracaoPct}%` : ''}
                  </div>
                )}
                {stat.locacao > 0 && (
                  <div
                    className="bg-on-background hover:brightness-125 flex items-center justify-center text-surface-container font-data-tabular text-[10px] transition-all"
                    style={{ width: `${stat.locacaoPct}%` }}
                    title={`Locação: ${stat.locacao} un (${stat.locacaoPct}%)`}
                  >
                    {stat.locacaoPct >= 10 ? `${stat.locacaoPct}%` : ''}
                  </div>
                )}
              </div>
              <span className="w-16 text-right text-on-surface font-semibold shrink-0">
                {stat.total} un
              </span>

              {/* Detail Tooltip when hovering */}
              {hoveredMonth === stat.month && (
                <div className="absolute left-20 -top-8 z-20 bg-on-surface text-surface-container-lowest px-2 py-1 rounded text-[11px] font-data-tabular shadow-lg pointer-events-none whitespace-nowrap flex items-center gap-2">
                  <span className="text-primary-fixed">Com: {stat.comodato}</span>
                  <span>·</span>
                  <span className="text-secondary-container">Dem: {stat.demonstracao}</span>
                  <span>·</span>
                  <span className="text-surface">Loc: {stat.locacao}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
