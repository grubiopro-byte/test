"use client";

interface Step4ItemsProps {
  description: string;
  photos: File[];
  additionalContact: string;
  onDescriptionChange: (description: string) => void;
  onPhotosChange: (photos: File[]) => void;
  onAdditionalContactChange: (contact: string) => void;
}

export default function Step4Items({
  description,
  photos,
  additionalContact,
  onDescriptionChange,
  onPhotosChange,
  onAdditionalContactChange,
}: Step4ItemsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onPhotosChange([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-10">
      {/* Section description */}
      <div>
        <label className="font-bold text-base block text-gray-900">
          Description des objets
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Canapé, cartons, machine à laver..."
          rows={3}
          className="mt-3 w-full border border-gray-400 rounded-xl px-4 py-3 text-base resize-y focus:outline-none focus:border-black hover:border-black transition placeholder:text-gray-600"
        />
      </div>

      {/* Section photos */}
      <div>
        <label className="font-bold text-base block text-gray-900">Photos</label>
        <p className="text-sm text-gray-600 mt-1">
          Ajoutez des photos de vos objets ou un bon de commande.
        </p>
        <div className="mt-3">
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm text-gray-500 mt-2">Upload images</span>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Preview des images uploadées */}
          {photos.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Supprimer la photo"
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section infos complémentaires */}
      <div>
        <label className="font-bold text-base block text-gray-900">
          Infos complémentaires{" "}
          <span className="text-sm font-normal text-gray-400 ml-2">optionnel</span>
        </label>
        <textarea
          value={additionalContact}
          onChange={(e) => onAdditionalContactChange(e.target.value)}
          placeholder="Précisez quelque chose si besoin…"
          rows={2}
          className="mt-3 w-full border border-gray-400 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:border-black hover:border-black transition placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}
