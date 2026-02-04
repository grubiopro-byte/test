import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 text-gray-900">
            Livrizi
          </h1>
          <p className="text-xl text-gray-600">
            Plateforme de réservation et suivi de livraison
          </p>
        </div>

        {/* Grille de navigation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Réservation */}
          <Link
            href="/reservation"
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-black group"
          >
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-black transition">
              Réservation
            </h2>
            <p className="text-gray-600">
              Créez une nouvelle réservation de livraison en 6 étapes simples
            </p>
          </Link>

          {/* Suivi */}
          <Link
            href="/track/DEMO123"
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-black group"
          >
            <div className="text-4xl mb-4">🚚</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-black transition">
              Suivi
            </h2>
            <p className="text-gray-600">
              Suivez l'état de votre livraison en temps réel
            </p>
          </Link>

          {/* Espace Client */}
          <Link
            href="/client"
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-black group"
          >
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-black transition">
              Espace Client
            </h2>
            <p className="text-gray-600">
              Accédez à votre historique et vos informations personnelles
            </p>
          </Link>

          {/* Espace Livrizeur */}
          <Link
            href="/livrizeur"
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-black group"
          >
            <div className="text-4xl mb-4">🚛</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-black transition">
              Espace Livrizeur
            </h2>
            <p className="text-gray-600">
              Interface pour les livreurs partenaires
            </p>
          </Link>

          {/* Admin */}
          <Link
            href="/admin"
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-black group"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-black transition">
              Administration
            </h2>
            <p className="text-gray-600">
              Tableau de bord administrateur et gestion de la plateforme
            </p>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Application de gestion de livraison • Next.js App Router</p>
        </div>
      </div>
    </div>
  );
}
