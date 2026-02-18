"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle } from "lucide-react";

function ConfirmationContent() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDEEF1] max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={56} className="text-[#3D4BA3]" strokeWidth={1.5} />
        </div>

        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Réservation confirmée !
        </h1>
        <p className="text-[15px] text-gray-600 mb-6">
          Votre transport a bien été enregistré. Un livrizeur vous sera attribué
          sous peu.
        </p>

        {id && (
          <div className="bg-[rgba(61,75,163,0.05)] rounded-[12px] px-4 py-3 mb-6">
            <p className="text-[12px] text-gray-500 mb-1">Numéro de mission</p>
            <p className="text-[14px] font-mono font-medium text-[#3D4BA3] break-all">
              {id}
            </p>
          </div>
        )}

        <p className="text-[13px] text-gray-400 mb-8">
          Votre carte ne sera débitée qu&apos;à la fin de la prestation.
        </p>

        <a
          href="/"
          className="inline-flex items-center justify-center w-full h-12 rounded-[12px] bg-[#3D4BA3] hover:bg-[rgb(36,50,138)] text-white text-[15px] font-medium transition-colors"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
