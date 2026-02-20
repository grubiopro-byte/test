"use client";

type TransportItem =
  | { key: string; label: string }
  | { key: string; label: string; options: string[]; question: string }
  | { key: string; label: string; freeText: true; question: string };

type ItemGroup = { label: string; items: TransportItem[] };

const ITEM_GROUPS: ItemGroup[] = [
  {
    label: "Salon",
    items: [
      { key: "canape",      label: "Canapé",       options: ["2 places", "3 places", "4 places", "Méridienne"], question: "Quelle configuration ?" },
      { key: "fauteuil",    label: "Fauteuil" },
      { key: "tv",          label: "TV / Écran" },
      { key: "table_basse", label: "Table basse" },
    ],
  },
  {
    label: "Salle à manger",
    items: [
      { key: "table",   label: "Table",   options: ["4 personnes", "6 personnes", "8+ personnes"], question: "Combien de places ?" },
      { key: "chaises", label: "Chaises" },
    ],
  },
  {
    label: "Chambre",
    items: [
      { key: "matelas", label: "Matelas",          options: ["1 place (90 cm)", "2 places (140 cm)", "2 places (160 cm)", "2 places (180 cm)"], question: "Quelle taille ?" },
      { key: "lit",     label: "Lit (structure)",  options: ["1 place (90 cm)", "2 places (140 cm)", "2 places (160 cm)", "2 places (180 cm)"], question: "Quelle taille ?" },
      { key: "armoire", label: "Armoire / Placard" },
      { key: "commode", label: "Commode" },
    ],
  },
  {
    label: "Cuisine & Électro",
    items: [
      { key: "refrigerateur", label: "Réfrigérateur", options: ["Standard", "Américain (XXL)"], question: "Quel type ?" },
      { key: "lave_linge",    label: "Lave-linge" },
      { key: "seche_linge",   label: "Sèche-linge" },
    ],
  },
  {
    label: "Autres",
    items: [
      { key: "cartons", label: "Cartons" },
      { key: "bureau",  label: "Bureau" },
      { key: "divers",  label: "Divers", freeText: true, question: "Décrivez vos autres objets…" },
    ],
  },
];

export const TRANSPORT_ITEMS: TransportItem[] = ITEM_GROUPS.flatMap((g) => g.items);

interface Step4ItemsProps {
  items: Record<string, number>;
  itemOptions: Record<string, string>;
  photos: File[];
  additionalInfo: string;
  onItemsChange: (items: Record<string, number>) => void;
  onItemOptionsChange: (options: Record<string, string>) => void;
  onPhotosChange: (photos: File[]) => void;
  onAdditionalInfoChange: (info: string) => void;
}

export default function Step4Items({
  items,
  itemOptions,
  photos,
  additionalInfo,
  onItemsChange,
  onItemOptionsChange,
  onPhotosChange,
  onAdditionalInfoChange,
}: Step4ItemsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onPhotosChange([...photos, ...Array.from(e.target.files)]);
  };

  const adjustQty = (key: string, delta: number) => {
    const next = Math.max(0, (items[key] ?? 0) + delta);
    onItemsChange({ ...items, [key]: next });
    if (next === 0) {
      const opts = { ...itemOptions };
      delete opts[key];
      onItemOptionsChange(opts);
    }
  };

  return (
    <div className="space-y-10">
      {/* Groupes d'objets */}
      <div>
        <label className="font-bold text-base block text-gray-900">Objets à transporter</label>
        <p className="text-sm text-gray-500 mt-1">Ajoutez ce que vous souhaitez transporter.</p>

        <div className="mt-5 space-y-5">
          {ITEM_GROUPS.map((group) => {
            const selectedInGroup = group.items.filter(
              (item) => (items[item.key] ?? 0) >= 1 && ("options" in item || "freeText" in item)
            ) as (TransportItem & ({ options: string[]; question: string } | { freeText: true; question: string }))[];

            return (
              <div key={group.label}>
                {/* Header groupe */}
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  {group.label}
                </p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const qty = items[item.key] ?? 0;
                    const isFreeText = "freeText" in item;

                    if (qty === 0) {
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => adjustQty(item.key, 1)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:border-gray-800 hover:text-gray-900 transition"
                        >
                          <span className="text-gray-400 leading-none">+</span>
                          {item.label}
                        </button>
                      );
                    }

                    if (isFreeText) {
                      return (
                        <div key={item.key} className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-black text-white text-sm">
                          <span className="font-medium">{item.label}</span>
                          <button
                            type="button"
                            onClick={() => adjustQty(item.key, -1)}
                            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-xs"
                            aria-label="Retirer"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={item.key} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-black text-white text-sm">
                        <button
                          type="button"
                          onClick={() => adjustQty(item.key, -1)}
                          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-base leading-none"
                        >
                          −
                        </button>
                        <span className="font-medium">
                          {item.label}
                          {qty > 1 && <span className="ml-1 opacity-60">×{qty}</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustQty(item.key, 1)}
                          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-base leading-none"
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Sous-options du groupe */}
                {selectedInGroup.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {selectedInGroup.map((item) => (
                      <div key={item.key} className="bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <span className="text-gray-400 mr-1">{item.label} —</span>
                          {item.question}
                        </p>
                        {"options" in item ? (
                          <div className="flex gap-2 flex-wrap">
                            {item.options.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => onItemOptionsChange({ ...itemOptions, [item.key]: opt })}
                                className={`px-3 py-1.5 rounded-full text-sm border transition
                                  ${itemOptions[item.key] === opt
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 text-gray-600 hover:border-gray-600"}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={itemOptions[item.key] ?? ""}
                            onChange={(e) => onItemOptionsChange({ ...itemOptions, [item.key]: e.target.value })}
                            placeholder={item.question}
                            rows={2}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-black hover:border-gray-500 transition placeholder:text-gray-400"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="font-bold text-base block text-gray-900">Photos</label>
        <p className="text-sm text-gray-600 mt-1">Ajoutez des photos de vos objets ou un bon de commande.</p>
        <div className="mt-3">
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm text-gray-500 mt-2">Upload images</span>
            <input id="photo-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </label>

          {photos.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onPhotosChange(photos.filter((_, j) => j !== i))}
                    aria-label="Supprimer la photo"
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Infos supplémentaires */}
      <div>
        <label className="font-bold text-base block text-gray-900">
          Infos supplémentaires{" "}
          <span className="text-sm font-normal text-gray-400 ml-2">optionnel</span>
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => onAdditionalInfoChange(e.target.value)}
          placeholder="Précisez quelque chose si besoin…"
          rows={2}
          className="mt-3 w-full border border-gray-400 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:border-black hover:border-black transition placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}
