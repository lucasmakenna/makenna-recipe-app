export type Recipe = {
  id: string;
  drink: string;
  category: string;
  recipe: string;
  hidden?: boolean;
  updated_at?: string;
};

export type AccessRole = 'view' | 'admin';
