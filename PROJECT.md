# PROJECT.md — Livrizi : Bible technique & produit

> Document de spécification complet du projet Livrizi.
> Ce fichier sert de référence absolue pour tout développement (Cursor, Claude, ou tout autre outil/dev).
> Toute décision technique ou produit doit être cohérente avec ce document.
>
> Dernière mise à jour : 02/02/2026

---

## 1. Vision produit

### Concept
**Livrizi** est une plateforme de transport d'objets volumineux et de déménagement éco à la demande. Le modèle est directement inspiré de [lugg.com](https://lugg.com), adapté au marché français.

### Référence UI/UX
**L'interface, l'expérience utilisateur et le design doivent se rapprocher au maximum de lugg.com.** Cela signifie :
- Design épuré, moderne, beaucoup de blanc
- Formulaire de réservation en split-screen (récap à gauche, étapes à droite)
- Barre de progression colorée en haut des étapes
- Boutons larges, typographie claire, mobile-first
- Simplicité absolue : le client doit pouvoir réserver en moins de 2 minutes
- Palette de couleurs Livrizi (à définir, mais inspirée du bleu/jaune Lugg)

### Cible
- Jeunes / étudiants
- Mamans solo
- Couples ayant besoin d'un coup de main + camion

---

## 2. Architecture technique

### Domaines

| Domaine | Techno | Rôle |
|---------|--------|------|
| `livrizi.fr` | Shopify | SEO, vitrine, acquisition. Formulaire simplifié (adresses + véhicule + livrizeurs) qui redirige vers `app.livrizi.fr` |
| `app.livrizi.fr` | Next.js sur Vercel | Application complète : réservation, dashboards client/livrizeur/admin, paiement, matching |

### Stack technique

| Besoin | Outil | Coût |
|--------|-------|------|
| Frontend + Backend | **Next.js** (App Router) | Gratuit |
| Base de données + Auth | **Supabase** (PostgreSQL + Auth + Realtime + Storage) | Gratuit (free tier) |
| Hébergement | **Vercel** | Gratuit (free tier) |
| Paiement marketplace | **Stripe Connect** | 0€ fixe, ~1.4% + 0.25€/transaction |
| Maps / Géolocalisation | **Google Maps API** (Places, Directions, Distance Matrix) | Pay-as-you-go (déjà utilisé) |
| Notifications push | **Supabase Realtime** + navigateur Push API | Gratuit |
| SMS | À déterminer (Twilio / free alternative) | À évaluer |
| Email transactionnel | À déterminer (Resend / Brevo free tier) | Gratuit |
| Dev assisté | **Cursor + Claude** | Déjà utilisé |

### Projet unique
**Une seule application Next.js**, un seul déploiement Vercel, un seul projet Supabase. Les routes gèrent la séparation des espaces (client, livrizeur, admin).

---

## 3. Rôles utilisateurs

### 3.1 Client
- Peut réserver sans créer de compte (guest checkout)
- Un compte est créé automatiquement lors de la réservation (email + téléphone)
- Peut se connecter pour voir ses courses, factures, et suivre en temps réel

### 3.2 Livrizeur (driver)
- **Doit avoir son propre véhicule utilitaire**
- **Doit être à son compte** (auto-entrepreneur, SIRET obligatoire)
- Inscription soumise à **validation manuelle par l'admin**
- Peut avoir un helper attitré (binôme fixe)

**Informations requises à l'inscription :**
- Nom, prénom, téléphone, email
- Photo de profil
- Adresse de base (point de départ)
- Rayon d'action en km (distance max qu'il accepte depuis son adresse de base)
- Type de véhicule (6m³ / 11m³ / 20m³) + photo du véhicule
- Permis de conduire (photo recto/verso)
- Carte d'identité (photo recto/verso)
- Numéro SIRET
- Attestation d'assurance du véhicule
- (Optionnel) Nom et téléphone de son helper attitré

### 3.3 Helper
- **Pas besoin d'être à son compte**
- **Pas besoin de véhicule**
- Aide à la manutention uniquement (bras en plus)
- Deux cas :
  - **Helper attitré** : inscrit par le livrizeur lors de son inscription → toujours affecté avec ce livrizeur
  - **Helper indépendant** : inscrit seul sur la plateforme → matché automatiquement quand un client demande 2 personnes et que le livrizeur n'a pas de helper attitré

**Informations requises (helper) :**
- Nom, prénom, téléphone, email
- Photo de profil
- Adresse de base + rayon d'action en km
- Carte d'identité (photo)

### 3.4 Admin (fondateur)
- Accès total à toutes les données
- Valide/refuse les inscriptions
- Gère les litiges et remboursements
- Vue sur les revenus et commissions

---

## 4. Flow de réservation client

### Entrée depuis Shopify
Le client arrive sur `livrizi.fr` (Shopify), remplit un formulaire simplifié (adresse départ, adresse arrivée, véhicule, nombre de livrizeurs) et clique "Réserver". Il est redirigé vers :
```
https://app.livrizi.fr/reservation?from=ADRESSE_ENCODEE&to=ADRESSE_ENCODEE&vehicule=11&movers=2
```
Les paramètres sont pré-remplis dans le formulaire. Le client peut aussi arriver directement sur `app.livrizi.fr/reservation` (flow autonome, tout est vide).

### Layout (inspiré Lugg)
**Split-screen :**
- **Gauche (40%)** : panneau récap "Votre Livrizi" — carte Google Maps + résumé progressif qui se remplit à chaque étape
- **Droite (60%)** : formulaire étape par étape avec barre de progression en haut

**Mobile** : le panneau gauche disparaît, seul le formulaire est affiché (le récap est accessible via un bouton toggle).

### Étapes

#### Step 1/6 — Adresses départ & arrivée
- Deux champs avec **autocomplétion Google Maps Places**
- La carte se met à jour en temps réel avec les marqueurs A et B
- Le temps de route est calculé automatiquement (Google Directions API) → stocké pour le calcul du prix
- Bouton "Continuer"
- Pré-rempli si paramètres URL présents

#### Step 2/6 — Véhicule + livrizeurs
- **3 cartes véhicule** avec icône : Fourgon 6m³ / Fourgon 11m³ / Fourgon 20m³
- **Affichage dynamique** : seuls les véhicules disponibles dans la zone du client sont cliquables (basé sur les livrizeurs inscrits dont le rayon couvre le point A)
- Si aucun véhicule dispo → message "Livrizi n'est pas encore disponible dans votre zone"
- **Toggle "1 Livrizeur / 2 Livrizeurs"** (comme le toggle Lugg "Save 35% Get 1 Lugger")
- Image du véhicule sélectionné avec dimensions
- **Prix affiché** : forfait de base + prix/min (calculé selon la formule)
- Description courte du véhicule
- Bouton retour + "Continuer"

#### Step 3/6 — Date & créneau d'arrivée
- **Sélection jour** : Aujourd'hui, +1, +2, +3, "Plus" (calendrier complet)
- **Sélection créneau** : boutons avec créneaux d'1h (8h-9h, 9h-10h, ..., 18h-19h)
- Seuls les créneaux encore disponibles sont affichés (basé sur les réservations existantes des livrizeurs de la zone)
- Bouton retour + "Continuer"

#### Step 4/6 — Objets à transporter
- **Zone de texte** : "Décrivez les objets à transporter"
- **Upload photos** (optionnel) : drag & drop ou bouton, stockage Supabase Storage
- **Contact additionnel** (optionnel) : numéro de téléphone d'une personne à prévenir
- Bouton retour + "Continuer"

#### Step 5/6 — Accès & manutention
**Accès point de départ :**
- Pied du camion
- Étage(s) sans ascenseur (champ nombre d'étages)
- Étage(s) avec ascenseur (champ nombre d'étages)

**Accès point d'arrivée :** (mêmes options)

**Option de manutention :**
- Express (30 min de manutention incluses)
- Prolongée -1H (+60 min)
- Prolongée Plus -2H (+120 min)
- Prolongée Max -3H (+180 min)

**Prix total recalculé en temps réel** à chaque changement d'option.

Bouton retour + "Continuer"

#### Step 6/6 — Coordonnées + paiement
- Téléphone (avec vérification SMS optionnelle)
- Email
- Prénom + Nom
- **Formulaire de paiement Stripe** (empreinte bancaire)
- Le débit ne se fait qu'à la fin de la course (quand le client clique "Terminé")
- Bouton retour + **"Réserver mon transport"**

### Après la réservation
- Page `/confirmation` avec récap complet
- Email de confirmation envoyé au client
- La course passe en statut `en_attente` → le matching commence

---

## 5. Panneau récap "Votre Livrizi" (gauche)

Se remplit progressivement, exactement comme Lugg :

| Après step | Affiché |
|-----------|---------|
| 1 | Carte avec marqueurs A/B + adresses départ/arrivée |
| 2 | + Véhicule (type + icône) + nombre de livrizeurs + prix/min |
| 3 | + Date et créneau d'arrivée |
| 4 | + Description des objets |
| 5 | + Accès + option manutention + **prix total** |
| 6 | + Coordonnées client |

---

## 6. Formules de tarification

### Variables de base
- `R` = temps de route réel Google Maps en minutes (défaut : 30 min si absent)
- 30 minutes de manutention toujours incluses
- `M = R + 30` (minutes facturées de base)

### Tarif minute par véhicule (HT) — Mode SOLO

| Véhicule | Variable | Tarif/min | Calcul |
|----------|----------|-----------|--------|
| 11m³ | `p11` | 1,15 € | Référence |
| 6m³ | `p6` | 0,9775 € | `p11 × 0.85` |
| 20m³ | `p20` | 1,38 € | `p11 × 1.20` |

### Mode SOLO (1 livrizeur)
```
p = p_vehicle (selon le véhicule choisi)
P_solo = p × M

Répartition :
  Chauffeur = 0.80 × P_solo
  Livrizi   = 0.20 × P_solo
```

### Mode DUO (1 livrizeur + 1 helper)

**Objectif** : le livrizeur (proprio du camion) doit gagner exactement comme en solo. Le helper touche +0.31€/min.

```
p_duo = p + (0.31 / 0.80)  ≈ p + 0.3875

Pour 11m³ : p_duo ≈ 1,5375 €/min (afficher 1,54 €/min)

P_duo = p_duo × M

Répartition :
  Équipe   = 0.80 × P_duo
  Livrizi  = 0.20 × P_duo

  Dans l'équipe (par minute) :
    Proprio = 0.80 × p  (exactement comme en solo)
    Helper  = 0.31 €/min
```

### Options de manutention

| Option | Minutes extra (`extraMin`) | % extra sur la partie ajoutée (`extraPercent`) |
|--------|---------------------------|-----------------------------------------------|
| Express | 0 | 0% |
| Prolongée (-1H) | 60 | +15% |
| Prolongée Plus (-2H) | 120 | +15% |
| Prolongée Max (-3H) | 180 | +10% |

### Formule finale (avec option de manutention)
```
P_base  = p × M                              (ou p_duo × M en mode DUO)
P_extra = p × extraMin × (1 + extraPercent)   (ou p_duo × ...)
P_total = P_base + P_extra
```

> Le pourcentage s'applique uniquement sur la partie ajoutée (extraMin), jamais sur le total.

### Exemples — SOLO 11m³ (p = 1.15)

| Route | M_base | Express | Prolongée (-1H) | Prolongée+ (-2H) | Prolongée Max (-3H) |
|-------|--------|---------|-----------------|-------------------|---------------------|
| 20 min | 50 | 57,50 € | 136,85 € | 216,20 € | 288,65 € |
| 30 min | 60 | 69,00 € | 148,35 € | 227,70 € | 300,15 € |
| 45 min | 75 | 86,25 € | 165,60 € | 244,95 € | 317,40 € |

---

## 7. Système de matching

### Déclenchement
Dès qu'une réservation est confirmée (Step 6 validé + empreinte bancaire enregistrée), le matching commence.

### Logique
1. Le système identifie tous les **livrizeurs actifs** dont :
   - Le rayon d'action couvre le point A du client
   - Le véhicule correspond à celui choisi par le client
   - Le créneau demandé n'est pas déjà pris (pas de chevauchement)
2. **Tous les livrizeurs éligibles** reçoivent une notification simultanée (push + SMS + email)
3. **Premier arrivé, premier servi** : le premier livrizeur qui accepte prend la course
4. Si le client a demandé 2 personnes :
   - Si le livrizeur qui accepte a un **helper attitré** → automatiquement assigné
   - Sinon → le système matche un **helper indépendant** disponible dans la zone

### Timeout
- **5 minutes** sans réponse d'aucun livrizeur → l'admin est notifié (push + email)
- L'admin peut alors :
  - Assigner manuellement un livrizeur
  - Contacter un livrizeur par téléphone
  - Annuler la course et rembourser le client

### Si un livrizeur annule après avoir accepté
- La course repart immédiatement en matching (re-notification de tous les livrizeurs éligibles)
- Le livrizeur qui a annulé reçoit une **pénalité** (impact sur sa note)

---

## 8. Cycle de vie d'une course

### Statuts

```
en_attente → acceptée → en_route → sur_place → en_livraison → terminée
                                                                  ↓
                                                              (notation + pourboire)

À tout moment : → annulée
```

| Statut | Description | Déclenché par |
|--------|-------------|---------------|
| `en_attente` | Client a réservé, en attente d'un livrizeur | Système (après paiement) |
| `acceptée` | Un livrizeur a accepté la mission | Livrizeur |
| `en_route` | Le livrizeur est en route vers le point A | Automatique (GPS) |
| `sur_place` | Le livrizeur est arrivé au point A, chargement | Automatique (GPS) |
| `en_livraison` | En route vers le point B | Automatique (GPS) |
| `terminée` | Course finie, client a confirmé | Client (bouton "Terminé") |
| `annulée` | Annulée par client ou livrizeur | Client / Livrizeur / Admin |

### Changements de statut
Les transitions sont **automatiques via GPS** (geofencing : quand le livrizeur entre dans un rayon de ~100m du point A ou B, le statut change). Le livrizeur n'a pas besoin de cliquer manuellement.

### Fin de course
1. Le client clique **"Terminé"** dans son interface
2. Le débit Stripe est déclenché (montant total)
3. Le virement au livrizeur (et au helper si DUO) est programmé à **J+1** (24h après) via Stripe Connect
4. Le client est invité à **noter** le livrizeur (1-5 étoiles + commentaire) et optionnellement laisser un **pourboire**

### Suivi temps réel (v2 — nice-to-have)
- Le client peut voir la position du livrizeur en temps réel sur une carte (quand statut = `en_route` ou `en_livraison`)
- Implémentation : GPS du téléphone du livrizeur → Supabase Realtime → carte Google Maps côté client
- **Non prioritaire pour le MVP** — le changement automatique de statut suffit pour la v1

---

## 9. Paiement

### Flow
1. **Step 6** : le client entre sa carte → **empreinte bancaire** (Stripe PaymentIntent avec `capture_method: manual`)
2. **Fin de course** : le client clique "Terminé" → le montant est **capturé** (débité)
3. **J+1** : Stripe Connect effectue le **virement automatique** vers le compte du livrizeur (et du helper si DUO)

### Commission Livrizi : 20%
```
SOLO :
  Client paie    → P_total
  Livrizeur reçoit → 0.80 × P_total
  Livrizi garde   → 0.20 × P_total

DUO :
  Client paie    → P_total
  Proprio reçoit  → 0.80 × p × M_total  (même montant qu'en solo)
  Helper reçoit   → 0.31 × M_total
  Livrizi garde   → 0.20 × P_total
```

### Stripe Connect
- Chaque livrizeur (et helper indépendant) a un **compte Stripe Connect** lié
- Créé lors de la validation de son inscription par l'admin
- Les virements sont automatiques via Stripe (pas de virement manuel)

### Pourboire
- Après la course, le client peut laisser un pourboire (montant libre ou suggestions : 5€ / 10€ / 15€ / 20€)
- Le pourboire va **100% au livrizeur** (et au helper si DUO : split 50/50 ou au choix)
- Aucune commission Livrizi sur le pourboire

---

## 10. Politique d'annulation & modifications

### Annulation par le client
| Quand | Conséquence |
|-------|-------------|
| **> 24h avant** la course | Annulation gratuite, remboursement intégral |
| **< 24h avant** la course | Frais d'annulation = **20% du prix total** (commission Livrizi retenue) |

### Annulation par le livrizeur
- Le livrizeur peut annuler à tout moment
- La course **repart immédiatement en matching**
- Le livrizeur reçoit une **pénalité** sur sa note
- Annulations répétées → suspension du compte par l'admin

### Modification par le client
- Le client peut modifier sa réservation (date, créneau, option de manutention, nombre de livrizeurs) **tant que la course est à > 24h**
- Modification < 24h → doit contacter le support

### Litiges
- Le client contacte le support (email / formulaire dans l'app)
- L'admin gère manuellement depuis le dashboard admin :
  - Remboursement total
  - Remboursement partiel
  - Aucun remboursement
- Contrôle total par l'admin sur les montants remboursés

---

## 11. Notifications

| Événement | Destinataire | Canal |
|-----------|-------------|-------|
| Nouvelle réservation (course en attente) | Tous les livrizeurs éligibles + Admin | Push + SMS + Email |
| Un livrizeur accepte la course | Client + Admin | SMS + Email |
| Rappel veille de la course | Client | SMS + Email |
| Livrizeur en route vers point A | Client | Push + SMS |
| Livrizeur arrivé au point A | Client | Push |
| Course terminée (client confirme) | Client (facture) + Admin | Email |
| Personne n'accepte (timeout 5 min) | Admin | Push + Email |
| Nouveau livrizeur inscrit (en attente validation) | Admin | Email |
| Inscription validée / refusée | Livrizeur | Email + SMS |
| Annulation par le client | Livrizeur assigné + Admin | Push + SMS + Email |
| Annulation par le livrizeur | Admin (+ re-matching automatique) | Push + Email |

---

## 12. Notes & avis

### Système de notation
- Après chaque course terminée, le client peut noter le livrizeur : **1 à 5 étoiles + commentaire**
- Le livrizeur ne note PAS le client
- Les notes et commentaires sont **publics** (visibles sur le profil du livrizeur par les futurs clients)

### Seuil de suspension
- Note moyenne < **4.0 étoiles** → le livrizeur est **automatiquement suspendu**
- L'admin est notifié et peut réactiver le compte ou le confirmer suspendu

### Pourboire
- Proposé après la notation
- Montants suggérés : 5€ / 10€ / 15€ / 20€ / montant libre
- 100% reversé au livrizeur (0% commission Livrizi)

---

## 13. Dashboards

### 13.1 Dashboard Client (`/client/*`)

**`/client/mes-courses`**
- Liste des courses à venir (avec bouton annuler/modifier si > 24h)
- Liste des courses passées (avec note donnée, facture)
- Statut en temps réel de la course en cours
- (v2) Position du livrizeur sur la carte

**`/client/factures`**
- Historique des factures avec téléchargement PDF

### 13.2 Dashboard Livrizeur (`/livrizeur/*`)

**`/livrizeur/missions`**
- Liste des missions disponibles dans sa zone (triées par date)
- Détails de chaque mission (adresses, véhicule, option manutention, prix estimé)
- Bouton "Accepter" sur chaque mission

**`/livrizeur/mes-missions`**
- Missions à venir (avec détails + contact client)
- Missions passées (avec gains)

**`/livrizeur/gains`**
- Gains par course, par semaine, par mois
- Historique des virements Stripe

**`/livrizeur/profil`**
- Modifier son rayon d'action
- Modifier son véhicule
- Voir sa note moyenne + commentaires reçus
- Gérer son helper attitré

### 13.3 Dashboard Admin (`/admin/*`)

**`/admin`** (vue principale)
- Vue globale : courses du jour, courses à venir, courses en attente de matching
- KPIs : CA total, commissions Livrizi, nombre de courses, nombre de livrizeurs actifs

**`/admin/courses`**
- Toutes les courses (filtres : en attente / acceptée / en cours / terminée / annulée)
- Détail de chaque course (infos client, livrizeur, prix, statut)
- Boutons : modifier la course, annuler, assigner manuellement un livrizeur

**`/admin/livrizeurs`**
- Tous les livrizeurs (filtres : en attente de validation / actifs / suspendus)
- Boutons : valider, refuser, suspendre, réactiver
- Voir le profil complet (documents, note moyenne, historique de courses)

**`/admin/helpers`**
- Tous les helpers (attirés et indépendants)

**`/admin/revenus`**
- Commissions Livrizi par jour / semaine / mois
- Détail par course
- Export CSV

**`/admin/litiges`**
- Litiges en cours
- Boutons : remboursement total / partiel / refus
- Historique des litiges résolus

---

## 14. Base de données (schéma Supabase)

### Tables principales

#### `users`
```
id                UUID (PK)
email             TEXT UNIQUE
phone             TEXT
first_name        TEXT
last_name         TEXT
role              ENUM ('client', 'livrizeur', 'helper', 'admin')
avatar_url        TEXT
created_at        TIMESTAMP
```

#### `livrizeurs`
```
id                UUID (PK)
user_id           UUID (FK → users)
address           TEXT
latitude          DECIMAL
longitude         DECIMAL
radius_km         INTEGER
vehicle_type      ENUM ('6m3', '11m3', '20m3')
vehicle_photo_url TEXT
license_photo_url TEXT
id_card_photo_url TEXT
siret             TEXT
insurance_url     TEXT
helper_id         UUID (FK → users, nullable) -- helper attitré
status            ENUM ('pending', 'active', 'suspended')
average_rating    DECIMAL DEFAULT 5.0
total_ratings     INTEGER DEFAULT 0
stripe_account_id TEXT
created_at        TIMESTAMP
```

#### `helpers`
```
id                UUID (PK)
user_id           UUID (FK → users)
address           TEXT
latitude          DECIMAL
longitude         DECIMAL
radius_km         INTEGER
id_card_photo_url TEXT
status            ENUM ('pending', 'active', 'suspended')
stripe_account_id TEXT
created_at        TIMESTAMP
```

#### `courses`
```
id                UUID (PK)
client_id         UUID (FK → users)
livrizeur_id      UUID (FK → livrizeurs, nullable)
helper_id         UUID (FK → helpers, nullable)

-- Adresses
pickup_address    TEXT
pickup_lat        DECIMAL
pickup_lng        DECIMAL
dropoff_address   TEXT
dropoff_lat       DECIMAL
dropoff_lng       DECIMAL

-- Options
vehicle_type      ENUM ('6m3', '11m3', '20m3')
movers            INTEGER (1 ou 2)
route_minutes     INTEGER
manutention       ENUM ('express', 'prolongee', 'prolongee_plus', 'prolongee_max')

-- Accès
pickup_access     ENUM ('pied_camion', 'etages_sans_ascenseur', 'etages_avec_ascenseur')
pickup_floors     INTEGER DEFAULT 0
dropoff_access    ENUM ('pied_camion', 'etages_sans_ascenseur', 'etages_avec_ascenseur')
dropoff_floors    INTEGER DEFAULT 0

-- Objets
items_description TEXT
items_photos      TEXT[] -- URLs Supabase Storage
additional_contact TEXT

-- Planification
scheduled_date    DATE
scheduled_slot    TEXT (ex: '11h-12h')

-- Prix
price_per_min     DECIMAL
price_total       DECIMAL
commission_amount DECIMAL
livrizeur_amount  DECIMAL
helper_amount     DECIMAL

-- Paiement
stripe_payment_id TEXT
payment_status    ENUM ('pending', 'captured', 'refunded', 'partial_refund')

-- Statut
status            ENUM ('en_attente', 'acceptee', 'en_route', 'sur_place', 'en_livraison', 'terminee', 'annulee')
matching_timeout  TIMESTAMP -- 5 min après création

-- Pourboire
tip_amount        DECIMAL DEFAULT 0

-- Timestamps
created_at        TIMESTAMP
accepted_at       TIMESTAMP
started_at        TIMESTAMP
completed_at      TIMESTAMP
cancelled_at      TIMESTAMP
cancelled_by      ENUM ('client', 'livrizeur', 'admin')
```

#### `ratings`
```
id                UUID (PK)
course_id         UUID (FK → courses)
client_id         UUID (FK → users)
livrizeur_id      UUID (FK → livrizeurs)
stars             INTEGER (1-5)
comment           TEXT
created_at        TIMESTAMP
```

#### `notifications`
```
id                UUID (PK)
user_id           UUID (FK → users)
type              TEXT
title             TEXT
body              TEXT
read              BOOLEAN DEFAULT false
data              JSONB -- données contextuelles (course_id, etc.)
created_at        TIMESTAMP
```

---

## 15. Routes de l'application

### Pages publiques (pas d'auth)
```
/                          → Landing page (ou redirect vers livrizi.fr)
/reservation               → Flow de booking en 6 étapes
/confirmation/:course_id   → Récap après réservation
/livrizeur/inscription     → Formulaire inscription livrizeur
/livrizeur/inscription-helper → Formulaire inscription helper indépendant
```

### Pages client (auth requise, role = client)
```
/client/mes-courses        → Courses à venir + passées + suivi temps réel
/client/factures           → Historique factures
/client/profil             → Modifier ses infos
```

### Pages livrizeur (auth requise, role = livrizeur)
```
/livrizeur/missions        → Missions disponibles dans sa zone
/livrizeur/mes-missions    → Missions acceptées + historique
/livrizeur/gains           → Revenus et virements
/livrizeur/profil          → Modifier profil, rayon, véhicule, helper
```

### Pages admin (auth requise, role = admin)
```
/admin                     → Vue globale + KPIs
/admin/courses             → Toutes les courses
/admin/livrizeurs          → Gestion des livrizeurs
/admin/helpers             → Gestion des helpers
/admin/revenus             → Commissions et CA
/admin/litiges             → Gestion des litiges et remboursements
```

---

## 16. Phases de développement

### Phase 1 — MVP (priorité absolue)
- [ ] Setup projet Next.js + Supabase + Vercel
- [ ] Base de données : tables users, livrizeurs, helpers, courses
- [ ] Auth Supabase (inscription + connexion)
- [ ] Flow de réservation client (6 étapes, layout Lugg)
- [ ] Google Maps intégré (autocomplétion + carte + calcul route)
- [ ] Calcul de prix en temps réel (formule complète)
- [ ] Dashboard livrizeur (voir + accepter missions)
- [ ] Inscription livrizeur avec upload documents
- [ ] Dashboard admin basique (voir courses + valider livrizeurs)
- [ ] Notifications par email (Resend ou Brevo)
- [ ] Matching automatique (notification tous les livrizeurs éligibles, premier arrivé premier servi)
- [ ] Connecter le sous-domaine `app.livrizi.fr`

### Phase 2 — Paiement
- [ ] Intégration Stripe Connect (empreinte bancaire + capture différée)
- [ ] Virement automatique J+1 aux livrizeurs/helpers
- [ ] Système de pourboire
- [ ] Gestion des remboursements (total/partiel) depuis l'admin
- [ ] Politique d'annulation automatisée (gratuit > 24h, 20% sinon)

### Phase 3 — Expérience complète
- [ ] Notifications SMS (Twilio ou alternative)
- [ ] Notifications push (navigateur)
- [ ] Dashboard client complet (mes courses, factures, suivi)
- [ ] Système de notation (étoiles + commentaire + suspension auto < 4.0)
- [ ] Dashboard livrizeur complet (gains, historique virements)
- [ ] Dashboard admin complet (KPIs, revenus, litiges, exports CSV)

### Phase 4 — Scale & optimisation (nice-to-have)
- [ ] Suivi GPS temps réel (position livrizeur sur la carte du client)
- [ ] Changement de statut automatique par geofencing
- [ ] App mobile (PWA ou React Native)
- [ ] Créneaux dynamiques (basés sur la dispo réelle des livrizeurs)
- [ ] Système de disponibilité livrizeur (calendrier de dispo)
- [ ] Multi-stops (comme Lugg : jusqu'à 5 arrêts par course)

---

## 17. Redirections Shopify → app.livrizi.fr

### Format de l'URL de redirection
```
https://app.livrizi.fr/reservation?from={PICKUP_ADDRESS}&to={DROPOFF_ADDRESS}&vehicule={6|11|20}&movers={1|2}
```

### Paramètres
| Param | Type | Description |
|-------|------|-------------|
| `from` | string (URL encoded) | Adresse de départ |
| `to` | string (URL encoded) | Adresse d'arrivée |
| `vehicule` | number | Type de véhicule (6, 11 ou 20) |
| `movers` | number | Nombre de livrizeurs (1 ou 2) |

Tous les paramètres sont optionnels. Si absents, les champs sont vides et le client remplit tout depuis le Step 1.

---

*Ce document est la bible du projet Livrizi. Toute modification doit être validée et documentée ici. Il sert de source de vérité unique pour le développement.*
