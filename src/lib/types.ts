export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  description: string | null;
  is_complex: boolean;
  sort_order: number;
  created_at: string;
  stores?: Store[];
}

export interface Store {
  id: string;
  place_id: string;
  name: string;
  floor: string | null;
  memo: string | null;
  benefits: string[];
  sort_order: number;
  created_at: string;
  items?: Item[];
}

export interface Item {
  id: string;
  store_id: string;
  user_id: string;
  name: string;
  image_url: string;
  price: number | null;
  is_checked: boolean;
  priority: "must" | "optional";
  memo: string | null;
  sort_order: number;
  created_at: string;
}

export interface BrowseItem extends Item {
  user_name: string;
}

export interface PlaceWithStats extends Place {
  store_count: number;
  item_total: number;
  item_checked: number;
  single_store_id: string | null;
}

export interface StoreWithStats extends Store {
  item_total: number;
  item_checked: number;
}
