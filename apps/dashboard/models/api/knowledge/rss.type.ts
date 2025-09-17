/* payload for add rss */
export interface AddRssPld {
  title: string;
  masterRssId: string;
  isActive: boolean;
}

/* response for add rss */
export interface AddRssRes {
  id: string;
  title: string;
  isActive: boolean;
  masterRssId: string;
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

/* response for get rss*/
export interface RssRes {
  id: string;
  title: string;
  isActive: boolean;
  masterRssId: string;
  rootBusinessId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
  masterRss: MasterRss;
}

export interface MasterRss {
  title: string;
  id: string;
  publisher: string;
  masterRssCategory: MasterRssCategory;
}

export interface MasterRssCategory {
  name: string;
  id: string;
}
