# UI_RULES.md — Design System Livrizi (inspiré Lugg)

Objectif : garantir une UI cohérente, moderne et "app premium" (style Uber/Lugg), sans réinventer le design à chaque itération.

## 0) Règle d'or
- **Aucun style inventé dans les pages** (`src/app/**/page.tsx`).
- Les pages utilisent uniquement des composants UI dans `src/components/ui/`.
- Toute nouvelle UI = soit réutiliser un composant, soit créer un composant UI réutilisable.

---

## 1) Couleurs (tokens)
**Couleurs de base**
- App Background (global) : `#FAFAFA`
- Surface (cards/panels) : `#FFFFFF`
- Texte principal : `#09090B`
- Texte secondaire : `#6B7280`
- Bordures : `#EDEEF1`

**Couleurs marque**
- Primary : `#3D4BA3`
- Primary Dark : `rgb(36, 50, 138)` (≈ `#24328A`)
- Primary Light : `rgba(61, 75, 163, 0.06)`

**États**
- Hover Primary : utiliser `Primary Dark`
- Disabled : opacité + fond plus clair (pas de couleurs flashy)

---

## 2) Typographie
- Font stack : `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`
- Titre principal (pages) : `text-[34px] font-semibold leading-[40px]`
- Sous-titre : `text-[15px] text-slate-500 leading-6`
- Labels : `text-[13px] text-slate-600 font-medium`

⚠️ Pas de typographies fantaisie. Priorité à la lisibilité.

---

## 3) Rayons (radius)
- Boutons + Inputs : **12px**
- Cards : **16px**
- Petits éléments (badges) : **999px** (pill)

---

## 4) Spacing (espacements)
- Entre label et champ : **8px**
- Entre sections : **32px**
- Entre gros blocs : **40px**
- Padding cards : **16–20px**
- Gap entre cards : **12–16px**

---

## 5) Bouton primaire (CTA) — SPEC EXACTE (référence)
Le bouton "Continuer" doit reproduire ces valeurs :
- Height : **48px**
- Border-radius : **12px**
- Font-size : **16px**
- Font-weight : **500**
- Line-height : **24px**
- Padding horizontal : **12px**
- Background : `#3D4BA3`
- Texte : blanc
- Transition : **150ms**
- Display : flex, center

Implémentation Tailwind cible (approx) :
- `h-12 rounded-[12px] text-[16px] font-medium leading-6 px-3 bg-[#3D4BA3] text-white transition duration-150`

États :
- Hover : `bg-[rgb(36,50,138)]`
- Disabled : `opacity-50 cursor-not-allowed`

---

## 6) Inputs — SPEC
- Height : **52px** (si possible, sinon 48px minimum)
- Border : `1px solid #EDEEF1`
- Border-radius : **12px**
- Background : blanc
- Font-size : **15px**
- Padding horizontal : **16px**
- Focus ring : léger, basé sur Primary

Implémentation Tailwind cible :
- `h-[52px] rounded-[12px] border border-[#EDEEF1] bg-white px-4 text-[15px] outline-none`
- Focus : `focus:border-[#3D4BA3] focus:ring-4 focus:ring-[rgba(61,75,163,0.12)]`

---

## 7) Cards sélection (véhicules / options / livrizeurs)
- Radius : **16px**
- Border : `#EDEEF1`
- Background : blanc
- Shadow : très légère (`shadow-sm`), jamais agressive

État sélectionné :
- Border : `#3D4BA3`
- Background : `rgba(61,75,163,0.06)`
- Optionnel : petit "check badge" en haut à droite

---

## 8) Stepper (progress)
- Label : `ÉTAPE X/5` en petit (12px), légèrement espacé
- Barre : fine (2–4px), arrondie
- Inactif : `#E5E7EB`
- Actif : Primary ou accent discret
- Pas de stepper "gadget", minimal.

---

## 9) Layout "split screen" (desktop)
Objectif : même ressenti que Lugg.
- Wrapper : `min-h-screen`
- Fond global : `#FAFAFA`
- Desktop : 2 colonnes
  - gauche : résumé sticky
  - droite : contenu centré `max-w-[520px]`
- Padding top généreux (ex : `pt-[max(100px,10vh)]` si tu utilises ce modèle)

---

## 10) Règles d'implémentation (pour Cursor)
Quand tu modifies l'UI :
1) **Respecte strictement ces tokens** (couleurs, radius, tailles).
2) **Réutilise** `src/components/ui/*` au maximum.
3) Si tu dois ajouter un nouveau pattern :
   - crée un composant UI réutilisable
   - documente-le brièvement

Interdits :
- gradients flashy
- ombres fortes
- changements de style incohérents entre étapes
- styles inline dans les pages (sauf cas exceptionnel justifié)

---

## 11) Checklist avant de valider une PR
- [ ] CTA primaire conforme (48px, radius 12px, couleur #3D4BA3)
- [ ] Inputs conformes (52px, radius 12px, border #EDEEF1)
- [ ] Cards conformes (radius 16px, selected = border primary + bg light)
- [ ] Spacing : sections aérées (32px)
- [ ] UI mobile lisible + CTA visible
