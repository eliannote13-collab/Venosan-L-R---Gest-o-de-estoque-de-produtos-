import React from 'react';

interface MutationConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: { label: string; value: string | number }[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MutationConfirmModal: React.FC<MutationConfirmModalProps> = ({
  isOpen,
  title,
  description,
  details = [],
  confirmLabel = 'Confirmar Gravação',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest border border-surface-dim rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="p-space-md bg-surface-container-low border-b border-surface-dim flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">
              cloud_sync
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-space-lg flex flex-col gap-space-md">
          <p className="font-body-md text-on-surface leading-relaxed">
            {description}
          </p>

          {details.length > 0 && (
            <div className="p-space-sm bg-surface-container-low rounded-lg border border-surface-dim flex flex-col gap-1.5 font-body-sm">
              {details.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-secondary font-medium">{d.label}:</span>
                  <span className="font-data-tabular-bold text-on-surface">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-surface-dim">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-space-md py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-space-lg py-1.5 rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-xs transition-colors disabled:opacity-50"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              )}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
