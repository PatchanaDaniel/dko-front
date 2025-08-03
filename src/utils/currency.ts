// Utilitaires pour le formatage des devises - Contexte Sénégal
// Utilise le Franc CFA (FCFA) comme devise principale

/**
 * Formate un montant en FCFA avec la notation appropriée
 * @param amount - Montant en FCFA
 * @param options - Options de formatage
 * @returns Chaîne formatée
 */
export const formatCurrency = (
  amount: number, 
  options: {
    compact?: boolean; // true pour afficher 1.5M au lieu de 1,500,000
    decimals?: number; // nombre de décimales à afficher
    showUnit?: boolean; // afficher "FCFA" ou non
  } = {}
): string => {
  const { compact = false, decimals = 0, showUnit = true } = options;

  if (compact && amount >= 1000000) {
    // Format compact pour les millions
    const millions = amount / 1000000;
    const formatted = millions.toFixed(decimals || 1);
    return `${formatted}M${showUnit ? ' FCFA' : ''}`;
  } else if (compact && amount >= 1000) {
    // Format compact pour les milliers
    const thousands = amount / 1000;
    const formatted = thousands.toFixed(decimals || 1);
    return `${formatted}K${showUnit ? ' FCFA' : ''}`;
  } else {
    // Format normal avec séparateurs de milliers
    const formatted = amount.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${formatted}${showUnit ? ' FCFA' : ''}`;
  }
};

/**
 * Convertit un montant d'Euro vers FCFA (taux approximatif)
 * @param euroAmount - Montant en euros
 * @returns Montant en FCFA
 */
export const euroToFCFA = (euroAmount: number): number => {
  // Taux de change approximatif : 1 EUR = 655.957 FCFA (taux fixe)
  return Math.round(euroAmount * 655.957);
};

/**
 * Convertit un montant de FCFA vers Euro (taux approximatif)
 * @param fcfaAmount - Montant en FCFA
 * @returns Montant en euros
 */
export const fcfaToEuro = (fcfaAmount: number): number => {
  // Taux de change approximatif : 1 EUR = 655.957 FCFA (taux fixe)
  return fcfaAmount / 655.957;
};

/**
 * Formate un pourcentage de budget utilisé
 * @param spent - Montant dépensé
 * @param budget - Budget total
 * @returns Pourcentage formaté
 */
export const formatBudgetPercentage = (spent: number, budget: number): string => {
  if (budget === 0) return '0%';
  return `${((spent / budget) * 100).toFixed(1)}%`;
};

/**
 * Retourne une classe CSS de couleur basée sur le niveau de consommation du budget
 * @param spent - Montant dépensé
 * @param budget - Budget total
 * @returns Classe CSS
 */
export const getBudgetColorClass = (spent: number, budget: number): string => {
  const percentage = (spent / budget) * 100;
  
  if (percentage > 100) return 'text-red-600';    // Dépassement
  if (percentage > 80) return 'text-yellow-600';  // Attention
  return 'text-green-600';                        // OK
};

/**
 * Retourne une classe CSS de couleur pour les barres de progression
 * @param spent - Montant dépensé
 * @param budget - Budget total
 * @returns Classe CSS
 */
export const getBudgetBarColorClass = (spent: number, budget: number): string => {
  const percentage = (spent / budget) * 100;
  
  if (percentage > 100) return 'bg-red-500';      // Dépassement
  if (percentage > 80) return 'bg-yellow-500';    // Attention
  return 'bg-green-500';                          // OK
};

// Exemples d'utilisation :
// formatCurrency(1500000) => "1,500,000 FCFA"
// formatCurrency(1500000, { compact: true }) => "1.5M FCFA"
// formatCurrency(25000, { compact: true }) => "25.0K FCFA"
// euroToFCFA(100) => 65596 FCFA (environ)
