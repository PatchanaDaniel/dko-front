# Déchets KO - Gestion Intelligente des Déchets

Application complète de gestion des déchets avec frontend React et backend Django, adaptée au contexte sénégalais.

## 💰 Devise et Localisation

L'application utilise le **Franc CFA (FCFA)** comme devise principale, adaptée au contexte sénégalais.

### Utilitaires de Devise

```typescript
import { formatCurrency, euroToFCFA } from './src/utils/currency';

// Formatage basique
formatCurrency(1500000); // "1,500,000 FCFA"

// Formatage compact
formatCurrency(1500000, { compact: true }); // "1.5M FCFA"
formatCurrency(25000, { compact: true });   // "25.0K FCFA"

// Conversion Euro → FCFA
const fcfaAmount = euroToFCFA(100); // ~65,596 FCFA
```

## 📁 Structure du projet

```
dechets-ko/
├── frontend-mock/     # Frontend avec données mockées
├── frontend-api/      # Frontend connecté à l'API Django
├── backend/          # Backend Django REST API
└── server/           # Serveur Node.js (alternative)
```

## 🚀 Démarrage rapide

### Option 1: Frontend Mock (sans backend)
```bash
cd frontend-mock
npm install
npm run dev
```
Accès: http://localhost:5173


```
Accès: 
- Frontend: http://localhost:5173
- API Django: http://localhost:8000/api
- Admin Django: http://localhost:8000/admin


```



## 🎯 Fonctionnalités

### 👥 Rôles utilisateurs:
- **Citoyen** : Signalement de problèmes, consultation
- **Collecteur** : Gestion des tournées, confirmation collectes
- **Coordinateur** : Planification, gestion équipes
- **Municipalité** : Statistiques, vue d'ensemble
- **Agent PRN** : Surveillance points de collecte

### 📊 Modules:
- **Carte interactive** : Visualisation temps réel
- **Suivi camions** : Géolocalisation des véhicules
- **Signalements** : Gestion des incidents
- **Planning** : Organisation des collectes
- **Statistiques** : Tableaux de bord analytiques
- **Gestion équipes** : Organisation du personnel

## 🛠️ Technologies

### Frontend:
- React 18 + TypeScript
- Tailwind CSS
- Lucide React (icônes)
- Vite (build tool)


## 📖 Documentation






