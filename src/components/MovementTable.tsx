import React, { useState, useMemo } from 'react';
import { MovementItem } from '../types';

interface MovementTableProps {
  data: MovementItem[];
  tableSearch: string;
  onTableSearchChange: (val: string) => void;
  onSelectRow: (item: MovementItem) => void;
}

type SortField = 'data_nf' | 'nf' | 'cfop' | 'sku' | 'descricao' | 'cliente' | 'tipo' | 'qtd' | 'qtd_liquida';
type SortOrder = 'asc' | 'desc';

export const MovementTable: React.FC<MovementTableProps> = ({
  data,
  tableSearch,
  onTableSearchChange,
  onSelectRow,
}) => {
  const [sortField, setSortField] = useState<SortField>('data_nf');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return list;
  }, [data, sortField, sortOrder]);

  const sumQtd = data.reduce((acc, r) => acc + r.qtd, 0);
  const sumLiq = data.reduce((acc, r) => acc + r.qtd_liquida, 0);

  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-xs border border-surface-dim overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low border-b border-surface-dim">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">
            table_chart
          </span>
          <span className="font-headline-md text-headline-md text-on-surface">
            Detalhamento dos Lotes em Movimentação
          </span>
        </div>

        <div className="flex items-center gap-space-xs">
          <div className="relative">
            <input
              id="tableSearchInput"
              type="text"
              value={tableSearch}
              onChange={(e) => onTableSearchChange(e.target.value)}
              className="px-space-sm py-1 bg-surface-container-lowest rounded-xs text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary w-64 border border-surface-dim"
              placeholder="Filtre por produto ou cliente..."
            />
            {tableSearch && (
              <button
                onClick={() => onTableSearchChange('')}
                className="absolute right-2 top-1.5 text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full text-left font-data-tabular border-collapse">
          <thead className="bg-surface-container-high text-secondary font-table-header text-table-header uppercase tracking-wider sticky top-0 z-10 select-none">
            <tr>
              <th
                onClick={() => handleSort('data_nf')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                Data NF {sortField === 'data_nf' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('nf')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                Nº NF {sortField === 'nf' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('cfop')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                CFOP {sortField === 'cfop' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('sku')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                SKU {sortField === 'sku' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('descricao')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors"
              >
                Descrição do Equipamento {sortField === 'descricao' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('cliente')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors"
              >
                Cliente {sortField === 'cliente' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('tipo')}
                className="py-space-sm px-space-md cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                Modalidade {sortField === 'tipo' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('qtd')}
                className="py-space-sm px-space-md text-right cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                Qtd {sortField === 'qtd' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                onClick={() => handleSort('qtd_liquida')}
                className="py-space-sm px-space-md text-right cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap"
              >
                Qtd Líq. {sortField === 'qtd_liquida' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody id="tableBody" className="divide-y divide-surface-dim font-body-sm text-body-sm">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-secondary italic">
                  Nenhum registro encontrado para os critérios de busca.
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const isRetorno = row.tipo === 'RETORNO';
                const badgeClass = isRetorno
                  ? 'bg-surface-container text-secondary'
                  : 'bg-primary-fixed text-on-primary-fixed font-bold';

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectRow(row)}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                    title="Clique para visualizar detalhes da NF"
                  >
                    <td className="py-space-sm px-space-md text-secondary whitespace-nowrap">
                      {row.data_nf}
                    </td>
                    <td className="py-space-sm px-space-md font-data-tabular-bold text-on-surface whitespace-nowrap group-hover:text-primary transition-colors">
                      {row.nf}
                    </td>
                    <td className="py-space-sm px-space-md text-secondary whitespace-nowrap">
                      {row.cfop}
                    </td>
                    <td className="py-space-sm px-space-md font-data-tabular-bold text-primary whitespace-nowrap">
                      {row.sku}
                    </td>
                    <td
                      className="py-space-sm px-space-md max-w-xs truncate"
                      title={row.descricao}
                    >
                      {row.descricao}
                    </td>
                    <td
                      className="py-space-sm px-space-md font-label-md text-on-surface font-semibold max-w-xs truncate"
                      title={row.cliente}
                    >
                      {row.cliente}
                    </td>
                    <td className="py-space-sm px-space-md whitespace-nowrap">
                      <span
                        className={`inline-flex px-space-xs py-0.5 rounded-xs ${badgeClass} text-[10px] uppercase font-data-tabular`}
                      >
                        {row.tipo}
                      </span>
                    </td>
                    <td className="py-space-sm px-space-md text-right font-data-tabular-bold text-on-surface whitespace-nowrap">
                      {row.qtd}
                    </td>
                    <td
                      className={`py-space-sm px-space-md text-right font-data-tabular-bold whitespace-nowrap ${
                        row.qtd_liquida < 0 ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {row.qtd_liquida}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-space-md py-space-xs bg-surface-container-low flex flex-wrap items-center justify-between text-secondary font-data-tabular text-table-header border-t border-surface-dim gap-2">
        <div className="flex flex-wrap items-center gap-space-md">
          <span>
            Linhas Exibidas:{' '}
            <strong id="statCount" className="text-on-surface font-bold">
              {data.length}
            </strong>
          </span>
          <span>
            Soma das Quantidades:{' '}
            <strong id="statSumQtd" className="text-on-surface font-bold">
              {sumQtd}
            </strong>
          </span>
          <span>
            Saldo Líquido Acumulado:{' '}
            <strong id="statSumLiq" className="text-on-surface font-bold">
              {sumLiq}
            </strong>
          </span>
        </div>
        <div>
          <span>
            Status:{' '}
            <strong className="text-primary font-bold uppercase tracking-wider">
              Ativo
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
