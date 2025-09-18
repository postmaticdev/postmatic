/* payload for add & edit product */
export interface ProductKnowledgePld {
  images: string[];
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
}

/* response for get product by id */
export interface ProductKnowledgeRes {
  id: string;
  name: string;
  category: string;
  description: string;
  currency: string;
  price: number;
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
  images: string[]
  rootBusinessId: string
  deletedAt: string
  createdAt: string
  updatedAt: string
}
