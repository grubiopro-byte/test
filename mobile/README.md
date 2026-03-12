# Livrizi Mobile App

Application mobile **iOS & Android** pour Livrizi — le Lugg français.

Construite avec **React Native + Expo** (framework cross-platform).

## Stack technique

| Besoin | Outil |
|--------|-------|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router (file-based) |
| UI / Styles | NativeWind (TailwindCSS) |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Maps | React Native Maps (Google Maps) |
| Paiement | Stripe React Native |
| État global | Zustand |
| Icons | @expo/vector-icons (Ionicons) |

## Structure

```
mobile/
├── app/
│   ├── (auth)/          # Écrans d'authentification
│   │   ├── welcome.tsx  # Page d'accueil / onboarding
│   │   ├── login.tsx    # Connexion
│   │   ├── register.tsx # Inscription client
│   │   └── register-livrizeur.tsx # Inscription livrizeur (4 étapes)
│   │
│   ├── (client)/        # Espace client
│   │   ├── index.tsx    # Accueil client
│   │   ├── booking/     # Flow réservation (6 étapes)
│   │   │   ├── step1.tsx  # Adresses + carte
│   │   │   ├── step2.tsx  # Véhicule + livrizeurs
│   │   │   ├── step3.tsx  # Date & créneau
│   │   │   ├── step4.tsx  # Objets + photos
│   │   │   ├── step5.tsx  # Accès & manutention
│   │   │   ├── step6.tsx  # Coordonnées + paiement
│   │   │   └── confirmation.tsx
│   │   ├── rides/       # Mes courses
│   │   │   ├── index.tsx  # Liste des courses
│   │   │   └── [id].tsx   # Détail + suivi + notation
│   │   └── profile.tsx  # Profil client
│   │
│   └── (livrizeur)/     # Espace livrizeur
│       ├── index.tsx    # Missions disponibles
│       ├── my-missions.tsx # Mes missions
│       ├── earnings.tsx # Gains & virements
│       └── profile.tsx  # Profil livrizeur
│
├── components/ui/       # Composants réutilisables
│   ├── BookingHeader.tsx # Header avec barre de progression
│   └── PriceSummary.tsx  # Récap prix en temps réel
│
└── lib/
    ├── supabase.ts      # Client Supabase
    ├── types.ts         # Types TypeScript
    ├── pricing.ts       # Formule de tarification
    ├── auth.ts          # Fonctions auth
    └── bookingStore.ts  # État global de la réservation (Zustand)
```

## Fonctionnalités

### Client
- ✅ Onboarding / bienvenue
- ✅ Inscription & connexion
- ✅ Flow de réservation en 6 étapes
  - Adresses avec Google Maps
  - Choix véhicule (6m³ / 11m³ / 20m³)
  - Toggle 1 ou 2 livrizeurs
  - Sélection date & créneau
  - Description objets + upload photos
  - Accès départ/arrivée + manutention
  - Coordonnées + paiement Stripe
- ✅ Calcul de prix en temps réel
- ✅ Page de confirmation
- ✅ Liste des courses (actives + historique)
- ✅ Suivi de course avec timeline
- ✅ Notation (étoiles + pourboire)
- ✅ Profil modifiable

### Livrizeur
- ✅ Inscription en 4 étapes avec upload documents
- ✅ Liste des missions disponibles
- ✅ Accepter une mission (premier arrivé premier servi)
- ✅ Mise à jour manuelle du statut (en route → sur place → en livraison)
- ✅ Tableau de bord des gains (jour/semaine/mois)
- ✅ Profil avec modification du rayon d'action

## Installation

```bash
cd mobile
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
expo start
```

## Variables d'environnement

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

## Build

```bash
# iOS (Expo Go ou EAS Build)
expo start --ios

# Android
expo start --android

# Build de production
eas build --platform all
```
