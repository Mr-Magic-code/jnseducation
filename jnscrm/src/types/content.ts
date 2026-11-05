import type { RowDataPacket } from 'mysql2';

export interface BlogRecord extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  category_name?: string | null;
  cover_image: string | null;
  content: string;
  status: string;
  author_name: string | null;
  author_role: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface CreateBlogPayload {
  title: string;
  slug: string;
  category_id: number | null;
  cover_image: string;
  content: string;
  status: string;
  author_name: string;
  author_role: string;
}

export type UpdateBlogPayload = Partial<CreateBlogPayload>;
