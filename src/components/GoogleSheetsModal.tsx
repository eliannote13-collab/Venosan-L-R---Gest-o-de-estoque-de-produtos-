import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  listUserSpreadsheets,
  fetchSpreadsheetDetails,
  createNewSpreadsheet,
  SpreadsheetSummary,
  SpreadsheetDetails,
} from '../lib/sheetsService';
import { MovementItem } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  accessToken: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  currentSpreadsheet: SpreadsheetDetails | null;
  currentSheetName: string;
  onSelectSpreadsheet: (details: SpreadsheetDetails, sheetName: string) => Promise<void>;
  onDisconnectSpreadsheet?: () => void;
  localSeedData: MovementItem[];
  isSyncing: boolean;
  onManualSync: () => Promise<void>;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  user,
  accessToken,
  onSignIn,
  onSignOut,
  currentSpreadsheet,
  currentSheetName,
  onSelectSpreadsheet,
  onDisconnectSpreadsheet,
  localSeedData,
  isSyncing,
  onManualSync,
}) => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetSummary[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [manualIdOrUrl, setManualIdOrUrl] = useState('');
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>(
    currentSpreadsheet?.id || ''
  );
  const [loadedDetails, setLoadedDetails] = useState<SpreadsheetDetails | null>(
    currentSpreadsheet
  );
  const [selectedTab, setSelectedTab] = useState<string>(currentSheetName || 'Fluxo_Saidas');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync internal state when currentSpreadsheet changes
  useEffect(() => {
    if (currentSpreadsheet) {
      setSelectedSpreadsheetId(currentSpreadsheet.id);
      setLoadedDetails(currentSpreadsheet);
      setSelectedTab(currentSheetName || currentSpreadsheet.sheets[0]?.title || 'Fluxo_Saidas');
    }
  }, [currentSpreadsheet, currentSheetName]);

  // Load drive spreadsheets on modal open if authenticated
  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveSpreadsheets();
    }
  }, [isOpen, accessToken]);

  const loadDriveSpreadsheets = async () => {
    if (!accessToken) return;
    setLoadingDrive(true);
    setErrorMessage(null);
    try {
      const files = await listUserSpreadsheets(accessToken);
      setSpreadsheets(files);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Falha ao buscar planilhas do Google Drive.');
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleSelectSpreadsheetItem = async (sheetId: string) => {
    setSelectedSpreadsheetId(sheetId);
    setErrorMessage(null);
    try {
      const details = await fetchSpreadsheetDetails(accessToken, sheetId);
      setLoadedDetails(details);
      if (details.sheets.length > 0) {
        setSelectedTab(details.sheets[0].title);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Não foi possível ler esta planilha.');
    }
  };

  const handleManualIdLookup = async () => {
    if (!manualIdOrUrl) return;
    setErrorMessage(null);
    let extractedId = manualIdOrUrl.trim();
    // Check if it's a URL like https://docs.google.com/spreadsheets/d/ID/...
    const urlMatch = extractedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      extractedId = urlMatch[1];
    }

    try {
      const details = await fetchSpreadsheetDetails(accessToken, extractedId);
      setSelectedSpreadsheetId(details.id);
      setLoadedDetails(details);
      if (details.sheets.length > 0) {
        setSelectedTab(details.sheets[0].title);
      }
      setSuccessMessage(`Planilha "${details.title}" identificada! Clique em "Salvar Conexão Permanente".`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Planilha não encontrada. Verifique se o link está correto.');
    }
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) return;
    setIsCreatingNew(true);
    setErrorMessage(null);
    try {
      const title = `VENOSAN L&H - Estoque & Saídas (${new Date().toLocaleDateString('pt-BR')})`;
      const created = await createNewSpreadsheet(accessToken, title, localSeedData);
      setSelectedSpreadsheetId(created.id);
      setLoadedDetails(created);
      setSelectedTab(created.sheets[0]?.title || 'Fluxo_Saidas');
      await onSelectSpreadsheet(created, created.sheets[0]?.title || 'Fluxo_Saidas');
      setSuccessMessage(`Nova planilha criada no seu Google Drive com sucesso!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar nova planilha.');
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleConfirmConnection = async () => {
    if (!loadedDetails || !selectedTab) return;
    setErrorMessage(null);
    try {
      await onSelectSpreadsheet(loadedDetails, selectedTab);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao sincronizar com a planilha selecionada.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest border border-surface-dim rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-space-md bg-surface-container-low border-b border-surface-dim flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">
              table_view
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Banco de Dados: Google Sheets
              </h3>
              <p className="font-body-sm text-secondary">
                Conecte sua planilha do Google Drive para sincronizar lotes, NFs e expedições
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-space-lg overflow-y-auto flex flex-col gap-space-md flex-1">
          {/* Messages */}
          {errorMessage && (
            <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-space-sm rounded-lg bg-emerald-100 text-emerald-900 font-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* User Auth Section */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-dim flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuário'}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-surface-dim"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {user ? (user.email?.[0]?.toUpperCase() || 'U') : 'G'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {user ? user.displayName || user.email : 'Conta Google não conectada'}
                </span>
                <span className="font-body-sm text-secondary">
                  {user ? user.email : 'Faça login para acessar suas planilhas do Google Drive'}
                </span>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onSignOut}
                  className="px-space-sm py-1.5 rounded text-secondary hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface border border-surface-dim shadow-xs font-label-md text-label-md transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Conectar com Google</span>
              </button>
            )}
          </div>

          {user && (
            <>
              {/* Option A: Create New Sheet Database */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-dim flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      add_chart
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Criar Nova Planilha Modelo
                    </span>
                  </div>
                  <button
                    onClick={handleCreateNewSheet}
                    disabled={isCreatingNew}
                    className="flex items-center gap-1.5 px-space-md py-1.5 rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-xs disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">magic_button</span>
                    <span>
                      {isCreatingNew ? 'Criando no Google Sheets...' : 'Criar Planilha Oficial'}
                    </span>
                  </button>
                </div>
                <p className="font-body-sm text-secondary">
                  Cria uma planilha no seu Google Drive com todas as colunas corretas (Data NF, Nº
                  NF, CFOP, SKU, Cliente, Modalidade, etc.) e popula com os registros iniciais.
                </p>
              </div>

              {/* Option B: Pick from Drive */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                    Planilhas Encontradas no seu Google Drive
                  </span>
                  <button
                    onClick={loadDriveSpreadsheets}
                    disabled={loadingDrive}
                    className="text-primary hover:underline font-table-header text-[11px] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>Atualizar lista</span>
                  </button>
                </div>

                {loadingDrive ? (
                  <div className="py-6 text-center text-secondary font-body-sm flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Buscando arquivos no Google Drive...</span>
                  </div>
                ) : spreadsheets.length === 0 ? (
                  <div className="p-space-sm bg-surface-container-low rounded-lg text-secondary font-body-sm text-center">
                    Nenhuma planilha encontrada recentemente no seu Google Drive. Use o botão "Criar
                    Planilha Oficial" acima ou cole o link abaixo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {spreadsheets.map((s) => {
                      const isSelected = selectedSpreadsheetId === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSpreadsheetItem(s.id)}
                          className={`p-space-sm rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-primary-fixed/40 border-primary text-on-surface'
                              : 'bg-surface-container-low border-surface-dim hover:border-secondary/40 text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-space-xs truncate min-w-0">
                            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">
                              table_chart
                            </span>
                            <span className="font-label-md text-label-md truncate font-semibold">
                              {s.name}
                            </span>
                          </div>
                          {s.modifiedTime && (
                            <span className="font-data-tabular text-[11px] text-secondary shrink-0 ml-2">
                              {new Date(s.modifiedTime).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Option C: Enter Sheet URL or ID */}
              <div className="flex flex-col gap-1">
                <span className="font-table-header text-table-header uppercase text-secondary tracking-wider">
                  Ou Cole a URL / ID da Planilha
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualIdOrUrl}
                    onChange={(e) => setManualIdOrUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/SEU_ID/edit..."
                    className="flex-1 bg-surface-container-low border border-surface-dim rounded-xs px-space-sm py-1.5 font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleManualIdLookup}
                    className="px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-on-surface font-label-md text-label-md transition-colors"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Sheet Details & Tab Selection */}
              {loadedDetails && (
                <div className="p-space-md bg-surface-container-high/40 rounded-xl border border-surface-dim flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        check_circle
                      </span>
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {loadedDetails.title}
                      </span>
                    </div>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${loadedDetails.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline font-table-header text-[11px]"
                    >
                      <span>Abrir no Google Sheets</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-space-md">
                    <label className="font-table-header text-table-header uppercase text-secondary shrink-0">
                      Aba da Planilha:
                    </label>
                    <select
                      value={selectedTab}
                      onChange={(e) => setSelectedTab(e.target.value)}
                      className="bg-surface-container-lowest border border-surface-dim rounded px-space-sm py-1 font-data-tabular text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {loadedDetails.sheets.map((tab) => (
                        <option key={tab.sheetId} value={tab.title}>
                          {tab.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Permanent Connection Info Banner */}
        <div className="mx-space-lg p-space-sm rounded-lg bg-surface-container border border-surface-dim flex items-center gap-2 text-body-sm text-secondary">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
            lock
          </span>
          <span>
            <strong>Conexão Permanente Ativa:</strong> A planilha conectada fica salva na memória do navegador. Você não precisa conectar novamente ao entrar no sistema.
          </span>
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-dim flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentSpreadsheet && (
              <>
                <button
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isSyncing ? 'animate-spin text-primary' : ''
                    }`}
                  >
                    sync
                  </span>
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                </button>
                {onDisconnectSpreadsheet && (
                  <button
                    onClick={onDisconnectSpreadsheet}
                    className="text-error hover:underline font-label-md text-[11px] ml-2 cursor-pointer"
                  >
                    Desconectar Planilha
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              onClick={onClose}
              className="px-space-md py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
            >
              Fechar
            </button>

            {loadedDetails && (
              <button
                onClick={handleConfirmConnection}
                disabled={isSyncing}
                className="px-space-lg py-1.5 rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-xs transition-colors cursor-pointer"
              >
                Salvar Conexão Permanente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
