# Spécifications UI - Livrizi (basé sur Lugg)

## Layout Desktop

### Structure 2 colonnes
- **Conteneur principal** : `max-w-[1200px] mx-auto px-8`
- **Grid** : `grid grid-cols-[400px_1fr] gap-16`
- **Colonne gauche (Récap)** : `w-[400px]` sticky
- **Colonne droite (Contenu)** : `max-w-[580px]`

### Espacements
- Padding page : `px-8 py-10`
- Gap entre colonnes : `gap-16` (64px)
- Gap sections : `gap-8` (32px)
- Gap éléments : `gap-4` (16px)

## Composants

### Stepper
- Position : En haut à droite du contenu
- "STEP X/5" : `text-sm font-semibold text-orange-500` 
- Barre de progression : `h-1 bg-gray-200 rounded-full`
- Segments actifs : `bg-orange-500`

### Cards de sélection (Véhicule, Options, etc.)
- Border : `border border-gray-200`
- Border hover : `border-gray-300`
- Border selected : `border-[#4640DE] border-2`
- Radius : `rounded-xl` (12px)
- Padding : `p-6`
- Shadow : `shadow-sm`
- Hover : `hover:shadow-md transition-all`

### Boutons

#### Primary (Continue)
- Classes : `bg-[#4640DE] text-white rounded-xl px-8 py-4 font-semibold text-base`
- Hover : `hover:bg-[#3730C3]`
- Disabled : `bg-gray-200 text-gray-400`
- Width : `w-full`

#### Secondary (Back)
- Classes : `w-10 h-10 border border-gray-300 rounded-xl flex items-center justify-center`
- Hover : `hover:bg-gray-50`

### Inputs
- Border : `border border-gray-300`
- Border focus : `focus:border-[#4640DE] focus:ring-2 focus:ring-[#4640DE]/20`
- Radius : `rounded-xl`
- Padding : `px-4 py-3`
- Height : `h-14`

### Récap (Summary Card)
- Background : `bg-white`
- Border : `border border-gray-200`
- Shadow : `shadow-sm`
- Radius : `rounded-2xl`
- Padding : `p-6`
- Position : `sticky top-8`

### Typographie
- Titre principal : `text-3xl font-bold text-gray-900`
- Sous-titre : `text-lg text-gray-600`
- Label : `text-sm font-medium text-gray-700`
- Body : `text-base text-gray-900`
- Secondary : `text-sm text-gray-600`

### Couleurs principales
- Primary (boutons) : `#4640DE`
- Orange (stepper) : `#FF6B35` ou `#FF8C42`
- Gris fond : `#F8F8F9`
- Gris borders : `#E5E7EB`
- Texte principal : `#111827`
- Texte secondaire : `#6B7280`

## États

### Selected (card)
```
border-[#4640DE] border-2 bg-blue-50/30
```

### Hover (card)
```
hover:border-gray-300 hover:shadow-md
```

### Check mark (selected)
- Position : `absolute top-3 right-3`
- Style : `w-6 h-6 bg-[#4640DE] rounded-full flex items-center justify-center`
- Icon : `w-4 h-4 text-white` (checkmark)

## Breakpoints

### Mobile (<1024px)
- Layout : `grid-cols-1`
- Récap : En haut, plus compact
- CTA : Sticky bottom bar
