"use client";

type TransportItem =
  | { key: string; label: string }
  | { key: string; label: string; options: string[]; question: string }
  | { key: string; label: string; freeText: true; question: string };

type ItemGroup = { emoji: string; label: string; items: TransportItem[] };

const ITEM_GROUPS: ItemGroup[] = [
  {
    emoji: "🛋",
    label: "Salon",
    items: [
      { key: "canape",      label: "Canapé",      options: ["2 places", "3 places", "4 places", "Méridienne"], question: "" },
      { key: "fauteuil",    label: "Fauteuil" },
      { key: "tv",          label: "TV / Écran" },
      { key: "table_basse", label: "Table basse" },
    ],
  },
  {
    emoji: "🍽",
    label: "Salle à manger",
    items: [
      { key: "table",   label: "Table",   options: ["4 pers.", "6 pers.", "8+ pers."], question: "" },
      { key: "chaises", label: "Chaises" },
    ],
  },
  {
    emoji: "🛏",
    label: "Chambre",
    items: [
      { key: "matelas", label: "Matelas",         options: ["90 cm", "140 cm", "160 cm", "180 cm"], question: "" },
      { key: "lit",     label: "Lit (structure)", options: ["90 cm", "140 cm", "160 cm", "180 cm"], question: "" },
      { key: "armoire", label: "Armoire / Placard" },
      { key: "commode", label: "Commode" },
    ],
  },
  {
    emoji: "🧊",
    label: "Cuisine & Électro",
    items: [
      { key: "refrigerateur", label: "Réfrigérateur", options: ["Standard", "Américain (XXL)"], question: "" },
      { key: "lave_linge",    label: "Lave-linge" },
      { key: "seche_linge",   label: "Sèche-linge" },
    ],
  },
];

const AUTRES_ITEMS: TransportItem[] = [
  { key: "cartons", label: "Cartons" },
  { key: "bureau",  label: "Bureau" },
  { key: "divers",  label: "Divers", freeText: true, question: "Décrivez vos autres objets…" },
];

export const TRANSPORT_ITEMS: TransportItem[] = [
  ...ITEM_GROUPS.flatMap((g) => g.items),
  ...AUTRES_ITEMS,
];

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

  const renderItemBlock = (item: TransportItem) => {
    const qty = items[item.key] ?? 0;
    const hasOptions = "options" in item;
    const isFreeText = "freeText" in item;
    const isSelected = qty >= 1;

    return (
      <div key={item.key} className="flex flex-col gap-1.5">
        {/* Chip */}
        {!isSelected ? (
          <button
            type="button"
            onClick={() => adjustQty(item.key, 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:border-gray-400 hover:text-gray-800 transition"
          >
            <span className="text-gray-300 text-xs">+</span>
            {item.label}
          </button>
        ) : isFreeText ? (
          <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-black text-white text-sm w-fit">
            <span className="font-medium">{item.label}</span>
            <button
              type="button"
              onClick={() => adjustQty(item.key, -1)}
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pl-2 pr-2 py-1.5 rounded-full bg-black text-white text-sm w-fit">
            <button
              type="button"
              onClick={() => adjustQty(item.key, -1)}
              className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition leading-none"
            >
              −
            </button>
            <span className="font-medium px-0.5">
              {item.label}{qty > 1 && <span className="opacity-50 ml-1">×{qty}</span>}
            </span>
            <button
              type="button"
              onClick={() => adjustQty(item.key, 1)}
              className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition leading-none"
            >
              +
            </button>
          </div>
        )}

        {/* Options inline sous le chip */}
        {isSelected && hasOptions && (
          <div className="flex flex-wrap gap-1 pl-0.5">
            {(item as { options: string[] }).options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onItemOptionsChange({ ...itemOptions, [item.key]: opt })}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  itemOptions[item.key] === opt
                    ? "bg-black text-white border-black"
                    : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Zone texte libre sous le chip */}
        {isSelected && isFreeText && (
          <textarea
            value={itemOptions[item.key] ?? ""}
            onChange={(e) => onItemOptionsChange({ ...itemOptions, [item.key]: e.target.value })}
            placeholder="Décrivez vos autres objets…"
            rows={2}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-gray-400 transition placeholder:text-gray-300 w-48"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Objets */}
      <div>
        <div className="space-y-6">
          {/* Rangées 2 colonnes */}
          {[[ITEM_GROUPS[0], ITEM_GROUPS[1]], [ITEM_GROUPS[2], ITEM_GROUPS[3]]].map(([left, right]) => (
            <div key={left.label} className="grid grid-cols-2 gap-x-8 gap-y-2">
              {[left, right].map((group) => (
                <div key={group.label}>
                  <p className="text-base font-semibold text-gray-800 mb-3">
                    {group.emoji} {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(renderItemBlock)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Séparateur léger */}
          <div className="border-t border-gray-100" />

          {/* Autres — ligne simple */}
          <div>
            <p className="text-base font-semibold text-gray-800 mb-3">📦 Autres</p>
            <div className="flex flex-wrap gap-2">
              {AUTRES_ITEMS.map(renderItemBlock)}
            </div>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="font-bold text-base block text-gray-900">Photos</label>
        <p className="text-sm text-gray-400 mt-1">Ajoutez des photos ou un bon de commande.</p>
        <div className="mt-3">
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm text-gray-300 mt-1.5">Ajouter des photos</span>
            <input id="photo-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </label>

          {photos.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                  <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onPhotosChange(photos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-4 h-4 bg-black/40 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
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
          <span className="text-sm font-normal text-gray-300 ml-1">optionnel</span>
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => onAdditionalInfoChange(e.target.value)}
          placeholder="Précisez quelque chose si besoin…"
          rows={2}
          className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 transition placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}
