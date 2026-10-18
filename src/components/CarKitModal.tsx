import { useState, useEffect } from 'react';
import { BriefcaseMedical, CheckCircle2, Circle, RotateCcw, X } from 'lucide-react';
import { CAR_KIT_ITEMS } from '../data/rescueData';

interface CarKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'tierrettung_carkit_checked_v1';

export function CarKitModal({ isOpen, onClose }: CarKitModalProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // ignore storage quota errors
    }
  }, [checkedIds]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const progressCount = checkedIds.length;
  const totalCount = CAR_KIT_ITEMS.length;
  const progressPercent = Math.round((progressCount / totalCount) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carkit-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <BriefcaseMedical className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 id="carkit-modal-title" className="text-base font-bold sm:text-lg">
                Tierrettungs-Notfallbox fürs Auto
              </h2>
              <p className="text-xs text-slate-300">
                Checkliste für deinen Kofferraum (wird lokal gespeichert)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Checkliste schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>
              Bereits im Auto gepackt: {progressCount} von {totalCount} Artikeln
            </span>
            <span className="text-teal-700">{progressPercent}% einsatzbereit</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2.5 overflow-y-auto p-5">
          {CAR_KIT_ITEMS.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  isChecked
                    ? 'border-teal-300 bg-teal-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-400" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.priority === 'essentiell'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.purpose}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={() => setCheckedIds([])}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Auswahl zurücksetzen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}
