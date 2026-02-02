# BUSINESS.md — Livrizi

> Document de contexte généré par interview le 02/02/2026.
> Sert de référence pour toutes les futures conversations IA sur le business, les outils et les automatisations.

---

## 1. Présentation de l'activité

### Concept
**Livrizi** = le "Lugg" français. Plateforme de transport d'objets volumineux et de déménagement en formule éco, à la demande. L'objectif est de reproduire le modèle de [lugg.com](https://lugg.com) adapté au marché français.

### Cible clients
- Jeunes / étudiants
- Mamans solo
- Couples ayant besoin d'un coup de main + camion

### Modèle économique
- **Commission de 20%** sur chaque prestation réalisée par un livrizeur
- **Tarification à la minute** (pas au volume ni au nombre d'objets)
- Le prix est calculé automatiquement selon :
  - La taille du véhicule (6m³ / 11m³ / 20m³)
  - Le nombre de livrizeurs (1 ou 2)
  - Le temps de route (API Google Maps)
  - L'option de manutention choisie

### Structure juridique
- Auto-entrepreneur (micro-entreprise)
- Charges URSSAF : 24%

### Stade actuel
- **Opérationnel** avec des clients quotidiens
- Fondateur solo : gère le business ET réalise les prestations lui-même
- 1 camion loué au mois
- MVP fonctionnel (Shopify + Google Apps Script)
- Pas encore de livrizeurs recrutés (en attente de la plateforme technique)

### Chiffres clés (CA en tant que livrizeur)

| Mois | Recettes | Dépenses | Bénéfice | Heures travaillées |
|------|----------|----------|----------|---------------------|
| Septembre 2025 | 1 150 € | 1 313 € | -163 € | — |
| Octobre 2025 | 2 647 € | 1 794 € | +853 € | 37h50 |
| Novembre 2025 | 3 185 € | 1 817 € | +1 368 € | 44h50 |
| Décembre 2025 | 4 080 € | 2 099 € | +1 982 € | 61h05 |
| Janvier 2026 | 2 604 € | 1 459 € | +1 145 € | 36h30 |
| Février 2026 | 299 € | 30 € | +269 € | En cours |

**Tendance** : croissance de sept. à déc. 2025 (x3,5 en recettes), pic en décembre.

---

## 2. Formule de tarification

### Variables de base
- `routeMin` = temps de route Google Maps (défaut : 30 min si absent)
- 30 minutes de manutention toujours incluses
- `M_base = routeMin + 30`

### Tarif minute par véhicule (HT)

| Véhicule | Tarif/min | Calcul |
|----------|-----------|--------|
| 11m³ | 1,15 € | Référence (`p11`) |
| 6m³ | 0,9775 € | `p11 × 0.85` |
| 20m³ | 1,38 € | `p11 × 1.20` |

### Majoration 2 livrizeurs
- Si `movers = 2` : `p = p_vehicle + 0.3647`
- Si `movers = 1` : `p = p_vehicle`

### Options de manutention

| Option | Minutes extra | % extra sur la partie ajoutée |
|--------|--------------|-------------------------------|
| Express | 0 | 0% |
| Prolongée (-1H) | 60 | +15% |
| Prolongée Plus (-2H) | 120 | +15% |
| Prolongée Max (-3H) | 180 | +10% |

### Formule finale
```
P_base  = p × M_base
P_extra = p × extraMin × (1 + extraPercent)
P_total = P_base + P_extra
```

> Le pourcentage s'applique uniquement sur la partie ajoutée (extraMin), pas sur le total.

---

## 3. Stack technique & outils

| Outil | Usage |
|-------|-------|
| **Shopify** | Site web, formulaire de réservation, SEO |
| **Google Apps Script** | Automatisations (mails confirmation, gestion de course depuis mail admin, calendrier) |
| **Slack** | Notifications en temps réel à chaque réservation |
| **Google Calendar** | Blocage automatique des créneaux réservés |
| **Google Maps API** | Autocomplétion adresses + calcul temps de route |
| **SumUp** | Paiement par carte en physique (fin de presta) |
| **Espèces** | Paiement alternatif en physique |
| **Freebe** | Facturation (à la demande, pas systématique) |
| **Notion** | Suivi financier (revenus, charges, bénéfices mensuels) |
| **ChatGPT** | Aide contenu / acquisition |
| **Cursor** | Tentatives d'amélioration technique / dev |
| **Réseaux sociaux** | Acquisition (Instagram, etc.) |
| **Le Bon Coin** | Acquisition clients |
| **Google SEO** | Acquisition organique |

---

## 4. Workflow actuel — Parcours d'une commande

### Étape 1 : Réservation (côté client)
1. Le client arrive sur le site Shopify
2. Il entre l'adresse de départ et d'arrivée (autocomplétion Google Maps)
3. La carte affiche le point A et le point B
4. Il choisit le jour et le créneau horaire d'arrivée au point A
5. Il choisit le nombre de livrizeurs (1 ou 2) avec le prix affiché
6. Il indique l'accès pour chaque point : pied du camion / étages avec ou sans ascenseur
7. Il décrit les objets à transporter
8. Il choisit l'option de manutention (Express / Prolongée / Prolongée Plus / Prolongée Max) — prix mis à jour en temps réel
9. Il entre ses coordonnées (prénom, nom, téléphone, email)
10. Il clique sur "Réserver mon transport"

### Étape 2 : Confirmation automatique
- Le client reçoit un **mail récapitulatif**
- Le fondateur reçoit le **même mail** + un **mail admin** (avec bouton "Gérer la course" pour modifier l'option si nécessaire)
- Une **notification Slack** est envoyée
- Un **créneau est bloqué** sur Google Calendar automatiquement

### Étape 3 : Avant la presta
- Envoi d'un **SMS au client** (manuel) pour confirmer l'heure exacte d'arrivée le jour J (pas systématique mais fréquent)
- Pas d'autre échange en général

### Étape 4 : Jour J
- Le fondateur gère sa route seul (Google Maps)
- Possibilité de plusieurs prestas dans la même journée
- Réalisation du transport

### Étape 5 : Après la presta
- **Encaissement en physique** (espèces ou carte via SumUp)
- **Pas de suivi post-presta** (pas de mail de remerciement, pas de demande d'avis)
- Facturation via Freebe uniquement si le client la demande
- Notation manuelle du revenu dans Notion

### Gestion des modifications
- Si le client a choisi la mauvaise option de manutention, le fondateur peut **modifier la course depuis le mail admin** (bouton "Gérer la course" via Apps Script)

### Annulations / Reports
- Annulations : pas de politique formelle, pas de frais
- Reports : les clients appellent directement

---

## 5. Points de friction identifiés

### Technique (prioritaire)
- **Limité par Shopify** pour créer une vraie web app / plateforme marketplace
- **Pas de dashboard livrizeur** : impossible de recruter et d'assigner des missions à d'autres livrizeurs
- **Pas de dashboard client** : le client ne peut pas suivre sa commande en temps réel
- **Pas de dashboard admin** : pas de vue centralisée sur toutes les courses
- **Pas de système de matching** : quand une commande arrive, pas de mécanisme pour l'attribuer à un livrizeur disponible
- **Compétences dev limitées** : le fondateur est débutant en développement, vite dépassé sur les aspects techniques complexes

### Opérationnel
- **Seul à faire les missions** : impossible de scaler tant qu'il n'y a pas d'autres livrizeurs
- **Pas de paiement intégré en ligne** : tout se fait en physique (SumUp / espèces), friction pour le client
- **Communication client manuelle** : SMS envoyé à la main, pas de notification automatique le jour J
- **Suivi financier manuel** : saisie des revenus/charges dans Notion à la main
- **Pas de politique d'annulation** : perte sèche quand un client annule

---

## 6. Objectifs & Vision

### Priorité n°1 (court terme)
**Décentraliser le business** : permettre à d'autres livrizeurs en France d'accepter des missions et générer des commissions (20%) sur chaque course réalisée.

### Vision produit
Reproduire l'expérience **lugg.com** en France :
- **Simplicité de réservation** pour le client (UX user-friendly)
- **Paiement intégré** dans la plateforme (plus d'espèces/SumUp)
- **Matching** automatique client ↔ livrizeur disponible
- **Dashboards** : client (suivi), livrizeur (missions), admin (vue globale)

### Stratégie de recrutement livrizeurs
- Le Bon Coin
- Youjob
- Facebook
- Cibler des personnes avec leur propre véhicule utilitaire

### Stratégie de déploiement
- Lancer dans toutes les grandes villes de France
- Pas de ville pilote définie — ambition nationale

### Contraintes
- **Budget : 0 €** — pas de budget pour du dev ou des outils payants
- **Temps disponible** : le fondateur a du temps à allouer pour apprendre et construire
- **Shopify conservé** pour le SEO, mais ouvert à construire une web app à côté

### Acquisition
- Google SEO
- ChatGPT (contenu)
- Réseaux sociaux
- Le Bon Coin

---

## 7. Résumé stratégique

| Dimension | Aujourd'hui | Objectif |
|-----------|------------|----------|
| Opérations | Fondateur seul, 1 camion | Réseau de livrizeurs indépendants dans toute la France |
| Revenus | ~3-4K€/mois en prestation directe | Commissions 20% sur toutes les courses (scalable) |
| Technique | Shopify + Apps Script (MVP) | Web app complète type Lugg (dashboards, matching, paiement) |
| Paiement | Physique (SumUp/espèces) | Intégré en ligne dans la plateforme |
| Budget dev | 0 € | Temps du fondateur + outils IA (Cursor, ChatGPT, Claude) |

---

## 8. Architecture technique cible

### Principe
- **livrizi.fr** (Shopify) = vitrine SEO + première accroche. Le client entre ses adresses, choisit véhicule + livrizeurs, puis est redirigé vers `book.livrizi.fr`
- **book.livrizi.fr** (Next.js sur Vercel) = web app complète. Fonctionne aussi de manière **autonome** (le client peut faire tout le flow sans passer par Shopify)

### Stack cible (tout gratuit)

| Besoin | Outil | Coût |
|--------|-------|------|
| Frontend + Backend | Next.js | Gratuit |
| Base de données + Auth | Supabase | Gratuit (tier free) |
| Hébergement | Vercel | Gratuit (tier free) |
| Paiement marketplace | Stripe Connect | 0€ fixe, ~1.4% + 0.25€/transaction |
| Maps / Géolocalisation | Google Maps API | Déjà utilisé |
| Notifications temps réel | Supabase Realtime | Inclus |
| Dev assisté par IA | Cursor + Claude | Déjà utilisé |
| SEO / Vitrine | Shopify | Déjà en place |

### Flow de réservation client (book.livrizi.fr) — inspiré de Lugg

Layout : **split-screen** — récap "Votre Livrizi" à gauche (carte + résumé progressif), formulaire étape par étape à droite.

| Étape | Contenu | Détails |
|-------|---------|---------|
| **Step 1/6** | Adresses départ & arrivée | Autocomplétion Google Maps. Pré-rempli si vient de Shopify, sinon saisie libre. Carte affichée avec point A → B |
| **Step 2/6** | Véhicule + livrizeurs | **Dynamique** : affiche uniquement les véhicules disponibles dans la zone du client (basé sur les livrizeurs inscrits et leur rayon d'action). Choix 1 ou 2 livrizeurs avec prix correspondant |
| **Step 3/6** | Date & créneau d'arrivée | Sélection jour (Today, +1, +2, +3, More) + créneaux horaires |
| **Step 4/6** | Objets à transporter | Description texte + upload photos (optionnel) |
| **Step 5/6** | Accès & manutention | Accès point A et B (pied du camion / étages avec ou sans ascenseur) + option de manutention (Express / Prolongée / Prolongée+ / Prolongée Max) avec **prix calculé en temps réel** |
| **Step 6/6** | Coordonnées + paiement | Téléphone, email, prénom, nom + **paiement Stripe intégré** |

### Panneau récap gauche ("Votre Livrizi")
Se remplit progressivement à chaque étape :
- Carte Google Maps (point A → B)
- Adresse départ
- Adresse arrivée
- Véhicule + nombre de livrizeurs
- Prix estimé
- Créneau d'arrivée
- Objets à transporter

### Logique de disponibilité des véhicules (Step 2)
- Chaque livrizeur inscrit renseigne : adresse de base, type de véhicule, **rayon d'action en km**
- Quand un client entre son adresse de départ (Step 1), le système calcule la distance entre le point A et l'adresse de base de chaque livrizeur
- Seuls les véhicules des livrizeurs dont le rayon couvre le point A sont affichés au Step 2
- Si aucun livrizeur n'est disponible dans la zone → message "Livrizi n'est pas encore disponible dans votre zone"

### Pages de la web app

**Côté client :**
- `/reservation` — flow de booking en 6 étapes
- `/confirmation` — récap après paiement
- `/mes-courses` — historique + suivi en temps réel

**Côté livrizeur :**
- `/livrizeur/inscription` — créer son profil (nom, véhicule, adresse, rayon d'action)
- `/livrizeur/missions` — missions disponibles dans sa zone
- `/livrizeur/mes-missions` — missions acceptées + historique

**Côté admin :**
- `/admin` — toutes les courses, tous les livrizeurs, revenus/commissions

---

*Ce document sera utilisé comme contexte de référence pour toutes les futures conversations sur l'optimisation, l'automatisation et le développement technique de Livrizi.*
