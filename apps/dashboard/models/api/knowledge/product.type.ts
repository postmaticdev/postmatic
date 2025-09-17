/* payload for add & edit product */
export interface ProductKnowledgePld {
  images: string[];
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  benefit: string;
  allergen: string;
}

/* response for get product by id */
export interface ProductKnowledgeRes {
  id: string;
  name: string;
  category: string;
  description: string;
  currency: string;
  price: number;
  composition: string;
  benefit: string;
  allergen: string;
  images: string[];
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductKnowledgeDeleteRes {
  id: string
  name: string
  category: string
  description: string
  currency: string
  price: number
  composition: string | null
  benefit: string | null
  allergen: string
  images: string[]
  rootBusinessId: string
  deletedAt: string
  createdAt: string
  updatedAt: string
}
