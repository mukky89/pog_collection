export type Rarity = "common" | "uncommon" | "rare" | "ultra-rare";
export type Condition = "mint" | "good" | "fair" | "poor";

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  year: number;
  totalItems: number;
  coverImage: string;
  manufacturer: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pog {
  _id: string;
  name: string;
  collectionId: string | Collection;
  number: number;
  rarity: Rarity;
  price: number; // v centoch
  imageUrl: string;
  imageBackUrl?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserCollection {
  _id: string;
  pogId: string | Pog;
  owned: boolean;
  condition?: Condition;
  acquiredDate?: string;
  paidPrice?: number; // v centoch
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** POG obohatený o stav vlastníctva pre UI */
export interface PogWithOwnership extends Pog {
  ownership?: UserCollection | null;
  isOwned: boolean;
}

/** Kolekcia obohatená o štatistiky */
export interface CollectionWithStats extends Collection {
  pogCount: number;
  ownedCount: number;
  completeness: number; // 0–100
  totalValue: number; // v centoch
  ownedValue: number; // v centoch
}

export interface DashboardStats {
  totalValue: number; // hodnota vlastnených (v centoch)
  missingValue: number; // hodnota chýbajúcich (v centoch)
  catalogValue: number; // hodnota celého katalógu (v centoch)
  ownedCount: number;
  totalPogs: number;
  missingCount: number;
  completeness: number; // 0–100
  collectionCount: number;
  rarest: Pog[];
}
