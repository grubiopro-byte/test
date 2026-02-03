# PROMPT CURSOR — Reproduction pixel-perfect de la page de réservation Livrizi (Step 1)

> Copie tout le contenu ci-dessous et colle-le dans Cursor comme prompt.

---

## Contexte

Tu dois créer la page de réservation de Livrizi (Step 1/6 — Adresses).
Le fichier `lugg-reference.html` à la racine contient le HTML exact de la page Lugg qu'on veut reproduire.
Lis-le attentivement et reproduis **exactement** la même structure, le même spacing, les mêmes proportions.

Remplacements à faire :
- "Lugg" → "Livrizi"
- "Sign in" → "Se connecter"
- "Your Lugg" → "Votre Livrizi"
- "Pickup & drop-off" → "Enlèvement & livraison"
- "Enter your pickup and drop-off addresses" → "Entrez vos adresses d'enlèvement et de livraison"
- "Pickup address" → "Adresse d'enlèvement"
- "Drop-off address" → "Adresse de livraison"
- "Apt. no (optional)" → "N° apt. (optionnel)"
- "Continue" → "Continuer"
- "STEP 1/5" → "ÉTAPE 1/6"
- "Pickup" → "Enlèvement"
- "Drop-off" → "Livraison"
- "Vehicle" → "Véhicule"
- "Price" → "Prix"
- "Arrival window" → "Créneau d'arrivée"
- "What you're moving" → "Objets à transporter"
- 5 barres de progression → 6 barres (car 6 étapes)
- "Terms" → "CGV"
- "Privacy" → "Confidentialité"
- Logo Lugg → texte "Livrizi" en font-bold text-[#3D4BA3]
- Liens footer vers lugg.com → liens vers livrizi.fr

Respecte `PROJECT.md`, `UI_RULES.md` et `.cursorrules`.

---

## Architecture exacte de la page (extraite du HTML de référence)

### Layout global
```
<div> (container principal, flex, min-h-screen)
  <div> (wrapper animé, fade-in)
    <style> CSS variables </style>
    <aside> COLONNE GAUCHE — recap panel </aside>
    <aside> COLONNE DROITE — formulaire </aside>
  </div>
</div>
```

### CSS Variables (dans un `<style>` tag)
```css
:root {
  --theme-primary-color: #3D4BA3;
  --theme-primary-light-color: rgba(61, 75, 163, 0.06);
  --theme-primary-dark-color: rgb(36, 50, 138);
  --theme-accent-color: #3D4BA3;
}
```

---

## COLONNE GAUCHE (Recap Panel)

**Container :** `<aside class="relative w-full lg:max-w-[26.5rem] flex flex-col self-stretch">`
**Background** : `#FAFAFA` (hérité du parent — c'est le fond global de la page)

### Header (logo + connexion)
```
<header class="mb-7">
  <div class="container flex min-h-[56px] items-center space-x-3 pt-4">
    <a> Logo Livrizi (à gauche, flex-1) </a>
    <a> "Se connecter" avec icône user SVG (à droite) </a>
  </div>
</header>
```
- Le lien "Se connecter" utilise : `text-theme-primary hover:text-theme-primary-dark text-label-3 font-medium`
- Icône user : SVG outline stroke (person head+body), `w-4`
- **IMPORTANT** : "Se connecter" est dans le header de la colonne GAUCHE, pas entre les colonnes

### Section "Votre Livrizi" (desktop only : `hidden lg:block`)
```
<div class="container">
  <div class="space-y-8">
    <h2 class="text-heading-3 mb-9 font-bold">Votre Livrizi</h2>

    <!-- Carte Google Maps -->
    <div class="h-32 overflow-hidden rounded-2xl">
      <!-- Google Maps embed ici -->
    </div>

    <!-- Timeline verticale -->
    <div class="relative space-y-8 before:absolute before:bottom-[40px] before:left-[15px] before:top-4 before:z-0 before:w-0.5 before:bg-gray-200 before:content-['']">
      <!-- Items timeline -->
    </div>
  </div>
</div>
```

### Timeline — Structure exacte de chaque item
Chaque item de la timeline suit ce pattern :
```html
<div class="flex w-full space-x-4 cursor-auto">
  <!-- Cercle icône -->
  <div class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
    <svg class="w-5 h-5"> <!-- icône outline --> </svg>
  </div>
  <!-- Contenu texte -->
  <div class="flex-1 space-y-0.5 text-left">
    <label class="text-label-4 block text-gray-600">Label</label>
    <h3 class="text-paragraph-2 font-medium leading-none text-black">Valeur</h3>
    <span class="text-label-4 block text-gray-600">Détail</span>
  </div>
</div>
```

**6 items de la timeline (adapter pour Livrizi) :**

1. **Enlèvement** — Icône : flèche vers le haut (ArrowUp outline)
   - Label: "Enlèvement"
   - Valeur: adresse pickup (dynamique, placeholder: tiret)
   - Détail: ville, code postal

2. **Livraison** — Icône : flèche vers le bas (ArrowDown outline)
   - Label: "Livraison"
   - Valeur: adresse dropoff (dynamique, placeholder: tiret)
   - Détail: ville, code postal

3. **Véhicule** — Icône : camion (Truck outline)
   - Label: "Véhicule"
   - Valeur: type de véhicule + badge nombre de livrizeurs
   - Badge : `rounded-md inline-block font-medium text-label-4 px-1.5 py-1 text-theme-primary-dark bg-theme-primary-light`

4. **Prix** — Icône : dollar/euro dans cercle (CurrencyDollar outline)
   - Label: "Prix"
   - Valeur: prix + "/min labor" + icône info (i dans cercle, remplie, text-theme-primary-dark w-5)

5. **Créneau d'arrivée** — Icône : calendrier (Calendar outline)
   - Label: "Créneau d'arrivée"
   - Valeur vide: `<div class="ml-px h-0.5 w-4 translate-y-1.5 bg-black"></div>` (tiret noir)

6. **Objets à transporter** — Icône : boîte/archive (Archive outline)
   - Label: "Objets à transporter"
   - Valeur vide: même tiret noir

### Ligne verticale de la timeline
```css
before:absolute before:bottom-[40px] before:left-[15px] before:top-4 before:z-0 before:w-0.5 before:bg-gray-200 before:content-['']
```
La ligne part du haut (top-4) au bas -40px et passe derrière les cercles (z-0).

### Footer gauche (desktop only)
```html
<footer class="flex gap-6 container mt-auto hidden py-14 lg:flex">
  <span class="flex gap-1 text-xs text-gray-600">
    powered by <span class="font-bold text-[#3D4BA3]">Livrizi</span>
  </span>
  <a class="text-xs text-gray-600 hover:underline hidden lg:inline" href="/cgv">CGV</a>
  <a class="text-xs text-gray-600 hover:underline hidden lg:inline" href="/confidentialite">Confidentialité</a>
</footer>
```

---

## COLONNE DROITE (Formulaire Step 1)

**Container :** `<aside class="relative w-full lg:max-w-[26.5rem]">`
**Background** : `#FFFFFF` (blanc — C'EST DIFFÉRENT de la colonne gauche qui est sur #FAFAFA)

### Padding bottom pour le footer fixe mobile
```html
<div class="pb-[var(--padding-bottom)] lg:pb-0" style="--padding-bottom: 84px;">
```

### Stepper (header de la colonne droite)
```html
<header class="container mb-4 lg:mb-8">
  <p class="text-yellow-1000 mb-5 text-base font-medium">ÉTAPE 1/6</p>
  <div class="flex gap-1.5">
    <!-- 6 barres de progression -->
    <div class="h-1 flex-grow rounded-sm isolate overflow-hidden bg-gray-100">
      <div class="bg-yellow-1000 h-full overflow-hidden rounded-sm" style="transform: none;"></div>
    </div>
    <!-- 5 barres inactives -->
    <div class="h-1 flex-grow rounded-sm isolate overflow-hidden bg-gray-100">
      <div class="bg-yellow-1000 h-full overflow-hidden rounded-sm" style="transform: translateX(-100%);"></div>
    </div>
    <!-- ... répéter 4 fois de plus ... -->
  </div>
</header>
```

**IMPORTANT :**
- Texte "ÉTAPE 1/6" : couleur `text-yellow-1000` (c'est un orange/ambre, correspond à `#E8891D` ou similaire)
- Barre active : `bg-yellow-1000` (même orange)
- Barre inactive : fond `bg-gray-100`, la barre intérieure est décalée avec `transform: translateX(-100%)` pour être cachée
- Hauteur barre : `h-1` (4px)
- Gap entre barres : `gap-1.5` (6px)
- Coins : `rounded-sm`

### Titre + sous-titre
```html
<section class="mb-5 container">
  <section class="space-y-1">
    <h2 class="text-heading-3 lg:text-heading-2 font-bold leading-tight">
      Enlèvement & livraison
    </h2>
    <p class="text-paragraph-2 text-gray-600">
      Entrez vos adresses d'enlèvement et de livraison
    </p>
  </section>
```

### Formulaire
```html
<form class="mt-10">
  <div class="space-y-10">
    <!-- Fieldset Pickup -->
    <!-- Fieldset Dropoff -->
  </div>
</form>
```

**Chaque fieldset suit exactement cette structure :**
```html
<fieldset class="group space-y-3 transition-opacity">
  <!-- Label -->
  <label class="text-label-2 font-medium leading-none text-gray-600">
    Adresse d'enlèvement
  </label>

  <div class="space-y-3">
    <!-- Adresse confirmée (visible après sélection) -->
    <div class="flex items-center gap-3">
      <svg class="w-5 h-5"> <!-- ArrowUp/ArrowDown --> </svg>
      <div class="flex-1">
        <span class="text-label-2 block font-medium">54 Texas Ave</span>
        <span class="text-label-4 block text-gray-600">Lawrence, MA 01841</span>
      </div>
      <button> <!-- Icône crayon (edit) -->
        <svg class="h-5 w-5 text-gray-600"> <!-- PencilSquare --> </svg>
      </button>
    </div>

    <!-- Input Google Places (avant sélection) ou Apt input (après sélection) -->
    <div class="relative border rounded-xl px-3.5 flex items-center gap-x-4 flex-wrap transition group min-h-[3rem] py-1.5 text-black border-gray-400 [&:has(>_*:enabled)]:focus-within:border-black [&:has(>_*:enabled)]:hover:border-black">
      <div class="pointer-events-none flex items-center justify-center">
        <svg class="w-5 h-5"> <!-- BuildingOffice icon --> </svg>
      </div>
      <input
        class="block w-full text-lg leading-[1.375] focus:outline-none flex-1 bg-transparent placeholder:text-gray-600 text-black caret-black"
        placeholder="N° apt. (optionnel)"
      />
    </div>
  </div>
</fieldset>
```

**Points clés du formulaire :**
- `space-y-10` entre les deux fieldsets (40px — grand espacement)
- `space-y-3` à l'intérieur de chaque fieldset (12px)
- Input container : `border rounded-xl px-3.5 min-h-[3rem] py-1.5 border-gray-400`
- Hover/focus du input : `border-black`
- Icône dans l'input : `BuildingOffice` SVG outline (bâtiment)
- Input text size : `text-lg` (18px)
- Placeholder color : `text-gray-600`

### Bouton "Continuer" (footer fixe mobile, static desktop)
```html
<div class="bg-gradient-footer fixed inset-x-0 bottom-0 z-40 lg:static">
  <nav class="container flex space-x-3 pb-3 pt-6">
    <button
      class="bg-theme-primary hover:bg-theme-primary-dark text-white border-none justify-center text-label-2 h-12 rounded-xl px-3 space-x-2 focus:ring-4 ring-theme-primary-light min-w-[48px] w-full font-medium"
      type="submit"
    >
      Continuer
    </button>
  </nav>
  <!-- Footer mobile -->
  <footer class="flex gap-6 container mb-3 justify-center lg:hidden">
    <a class="text-xs text-gray-600 hover:underline" href="/cgv">CGV</a>
    <a class="text-xs text-gray-600 hover:underline" href="/confidentialite">Confidentialité</a>
  </footer>
</div>
```

**Points clés du bouton :**
- Fixé en bas sur mobile (`fixed inset-x-0 bottom-0 z-40`)
- Static sur desktop (`lg:static`)
- `h-12` (48px), `rounded-xl` (12px)
- `bg-theme-primary` (#3D4BA3), hover: `bg-theme-primary-dark`
- `w-full` (pleine largeur)
- Focus ring : `ring-theme-primary-light`
- Gradient fade en haut sur mobile : `bg-gradient-footer`

---

## RESPONSIVE

### Mobile (< lg / < 1024px)
- Les deux colonnes s'empilent verticalement
- La colonne gauche (recap) est **cachée** (`hidden lg:block` sur la section "Votre Livrizi")
- Seul le header (logo + Se connecter) reste visible
- Le bouton "Continuer" est fixé en bas
- Footer mobile visible sous le bouton

### Desktop (≥ lg / ≥ 1024px)
- Deux colonnes côte à côte : chacune `max-w-[26.5rem]` (424px)
- Colonne gauche sticky pour le scroll
- Footer desktop visible en bas de la colonne gauche
- Bouton "Continuer" devient static dans le flow

---

## ICÔNES SVG (toutes en outline / stroke, pas filled)

Utiliser des SVG heroicons outline (stroke-width="2") :
- **ArrowUp** : `M5 10l7-7m0 0l7 7m-7-7v18`
- **ArrowDown** : `M19 14l-7 7m0 0l-7-7m7 7V3`
- **Truck** : paths camion (voir HTML référence)
- **CurrencyDollar/Euro** : `M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z`
- **Calendar** : `M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z`
- **Archive/Box** : `M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4`
- **BuildingOffice** : `M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4`
- **PencilSquare** (edit) : `M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z`
- **User** (header) : `M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z`
- **Info** (prix, filled) : `M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z`

---

## FICHIERS À CRÉER / MODIFIER

1. **`src/app/reservation/page.tsx`** — Page principale, layout split-screen
2. **`src/components/reservation/step1-addresses.tsx`** — Contenu Step 1
3. **`src/components/reservation/recap-panel.tsx`** — Colonne gauche (recap timeline)
4. **`src/components/reservation/stepper.tsx`** — Composant stepper (ÉTAPE X/6 + barres)
5. **`src/components/ui/button.tsx`** — Bouton primaire (si pas encore créé)
6. **`src/components/ui/input.tsx`** — Input avec icône (si pas encore créé)

---

## TAILWIND CONFIG

Ajoute ces couleurs custom dans `tailwind.config.ts` :
```ts
theme: {
  extend: {
    colors: {
      'theme-primary': '#3D4BA3',
      'theme-primary-dark': 'rgb(36, 50, 138)',
      'theme-primary-light': 'rgba(61, 75, 163, 0.06)',
      'yellow-1000': '#E8891D', // couleur stepper (orange Lugg)
    },
  },
},
```

---

## ÉTAT INITIAL (Step 1)

Au Step 1, le formulaire est en mode "saisie" :
- Pas d'adresse confirmée → afficher les inputs Google Places au lieu des adresses confirmées + Apt input
- Les items timeline Véhicule/Prix/Créneau/Objets affichent le tiret noir (pas encore remplis)
- Seule la première barre du stepper est active

Quand l'utilisateur entre une adresse et qu'elle est confirmée (via Google Places autocomplete) :
- L'input Google Places est remplacé par l'adresse confirmée (icône + texte + bouton edit)
- L'input Apt apparaît en dessous
- La carte se met à jour avec le marqueur

---

## RAPPEL CRITIQUE

- Background colonne gauche : `#FAFAFA` (le fond global de la page)
- Background colonne droite : `#FFFFFF` (blanc pur, surface)
- Le "Se connecter" est dans le header de la colonne GAUCHE
- Les cercles timeline : `h-8 w-8 rounded-full bg-gray-200` avec icônes `w-5 h-5` en outline
- Stepper couleur : orange `#E8891D` (pas le primary bleu)
- Input border : `border-gray-400` (pas gray-200), hover/focus: `border-black`
- Bouton : `h-12 rounded-xl w-full bg-[#3D4BA3]`
- Mobile-first obligatoire
- Lis `lugg-reference.html` pour tout détail non couvert ici
