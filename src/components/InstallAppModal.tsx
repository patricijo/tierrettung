import { Download, MoreVertical, PlusSquare, Share, Smartphone, X } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  canPromptNatively: boolean;
  onTriggerNativeInstall: () => void;
}

export function InstallAppModal({
  isOpen,
  onClose,
  canPromptNatively,
  onTriggerNativeInstall,
}: InstallAppModalProps) {
  if (!isOpen) return null;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-teal-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-5 w-5 text-teal-300" />
            <div>
              <h2 id="install-modal-title" className="text-base font-bold">
                Zum Startbildschirm hinzufügen
              </h2>
              <p className="text-xs text-teal-200">
                Im Notfall mit 1 Klick griffbereit wie eine normale App
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-teal-200 transition hover:bg-teal-800 hover:text-white"
            aria-label="Fenster schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto p-5 text-xs text-slate-700 sm:text-sm">
          {canPromptNatively && (
            <div className="rounded-2xl border-2 border-teal-600 bg-teal-50 p-4 text-center">
              <p className="font-bold text-teal-950">
                Dein Browser unterstützt die direkte 1-Klick-Installation:
              </p>
              <button
                type="button"
                onClick={onTriggerNativeInstall}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-extrabold text-white shadow-xs hover:bg-teal-800"
              >
                <Download className="h-4 w-4" />
                <span>Jetzt direkt auf Startbildschirm installieren</span>
              </button>
            </div>
          )}

          {/* iPhone / iPad Anleitung */}
          <div
            className={`rounded-2xl border p-4 ${
              isIOS
                ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-400'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">
                iPhone & iPad (Safari)
              </h3>
              {isIOS && (
                <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white">
                  Dein Gerät
                </span>
              )}
            </div>
            <ol className="mt-2.5 space-y-2 text-xs leading-relaxed">
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-teal-800 shadow-2xs ring-1 ring-slate-200">
                  1
                </span>
                <span>
                  Tippe unten in der Safari-Leiste auf das{' '}
                  <strong className="inline-flex items-center gap-1 text-slate-900">
                    Teilen-Symbol <Share className="inline h-3.5 w-3.5 text-blue-600" />
                  </strong>
                  .
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-teal-800 shadow-2xs ring-1 ring-slate-200">
                  2
                </span>
                <span>
                  Scrolle kurz nach unten und wähle{' '}
                  <strong className="inline-flex items-center gap-1 text-slate-900">
                    „Zum Home-Bildschirm“{' '}
                    <PlusSquare className="inline h-3.5 w-3.5 text-slate-700" />
                  </strong>
                  .
                </span>
              </li>
            </ol>
          </div>

          {/* Android & Desktop Anleitung */}
          <div
            className={`rounded-2xl border p-4 ${
              !isIOS
                ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-400'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <h3 className="font-extrabold text-slate-900">
              Android (Chrome / Firefox / Samsung) & PC
            </h3>
            <ol className="mt-2.5 space-y-2 text-xs leading-relaxed">
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-teal-800 shadow-2xs ring-1 ring-slate-200">
                  1
                </span>
                <span>
                  Tippe oben rechts im Browser auf das{' '}
                  <strong className="inline-flex items-center gap-0.5 text-slate-900">
                    Menü-Symbol <MoreVertical className="inline h-3.5 w-3.5" />
                  </strong>{' '}
                  (oder das Installieren-Icon in der Adressleiste).
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-teal-800 shadow-2xs ring-1 ring-slate-200">
                  2
                </span>
                <span>
                  Tippe auf{' '}
                  <strong className="text-slate-900">
                    „App installieren“
                  </strong>{' '}
                  bzw.{' '}
                  <strong className="text-slate-900">
                    „Zum Startbildschirm hinzufügen“
                  </strong>
                  .
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
