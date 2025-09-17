/* response for get rss */
export interface RssLibraryRes {
  id: string;
  title: string;
  url: string;
  publisher: string;
  masterRssCategoryId: string;
  deletedAt: null;
  createdAt: Date;
  updatedAt: Date;
}

/* response for get rss categories */
export interface RssCategoryRes {
  id: string;
  name: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

/* response for get rss articles */
export interface RssArticleRes {
  title: string;
  url: string;
  summary: string;
  imageUrl: string | null;
  publishedAt: string;
  masterRssId: string;
  deletedAt: string;
  publisher: string;
}
