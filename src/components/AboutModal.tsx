import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-[#14171B] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h3
              id="about-modal-title"
              className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            >
              Om Chronos
            </h3>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              v1.0.0
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass w-8 h-8 rounded-xl shrink-0"
            aria-label="Stäng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed overflow-y-auto overscroll-contain flex-1">
          <p>
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">Chronos</strong> är en
            högprecisionsapplikation för beräkning av tidsintervall, nedräkningar och kalenderdata.
          </p>

          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Matematisk och kalendarisk exakthet:
            </h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Skottår & Februari:</strong> Skiljer korrekt mellan 28 och 29 dagar i februari och justerar för skottårsintervall.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Verkliga månadslängder:</strong> Räknar inte schablonmässigt 30 dagar per månad, utan baseras på kalendermånaders faktiska dagar (28, 29, 30, 31).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Tidszonsförskjutning & DST:</strong> Fullt stöd för IANA-tidszoner och övergångar mellan sommartid och normaltid (Daylight Saving Time).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Realtidsuppdatering utan layout-hopp:</strong> Siffrorna hålls fasta med <code>tabular-nums</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Endast arbetsdagar & helgfiltrering:</strong> Beräkna tidsintervall i faktiska vardagar/arbetsdagar med valbart borträknande av lördagar och/eller söndagar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Tidsenhetskonvertering:</strong> Snabb och exakt konvertering mellan veckor, timmar, månader, sekunder, arbetsdagar och år.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-0.5">
                Integritet & lokal lagring
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Dina datum stannar på denna enhet. Alla beräkningar, historik och sparade favoriter körs och lagras uteslutande i din lokala webbläsare. Inga uppgifter skickas till externa servrar.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex justify-end bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-liquid-glass min-h-[36px] px-5 py-1.5 text-xs font-semibold rounded-xl"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};
