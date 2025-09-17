/* payload for save template */
export interface SavedTemplatePld {
  templateImageContentId: string;
}

/* response for get saved templates */
export interface SavedTemplateRes {
  name: string;
  imageUrl: string;
  category: string[];
  templateImageContent: TemplateImageContent;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateImageContent {
  id: string;
  publisher: string | null;
}
export interface TemplateImageCategories {
  id: string;
  name: string;
}

/* response for get published templates */
export interface PublishedTemplateRes {
  id: string;
  name: string;
  imageUrl: string;
  publisher: string | null;
  templateImageCategories: TemplateImageCategories[];
  createdAt: string;
  updatedAt: string;
}

/* response for get template categories */
export interface TemplateCategoryRes {
  id: string;
  name: string;
  _count: Count;
}

export interface Count {
  templateImageContents: number;
}
