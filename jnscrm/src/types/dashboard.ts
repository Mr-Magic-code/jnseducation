export type AppTab =
  | 'overview'
  | 'all-pages'
  | 'requests'
  | 'users'
  | 'submissions'
  | 'all-blogs'
  | 'add-blog'
  | 'blog-categories'
  | 'all-events'
  | 'add-event';

export type EventStatus = 'Live' | 'Coming Soon' | 'Past Event';

export interface Message {
  text: string;
  type: 'success' | 'error' | '' | string;
}

export interface RequestUser {
  id: number;
  name: string;
  full_name?: string;
  email: string;
  role: string;
  created_at: string;
}

export type SubmissionFormData = Record<string, string | undefined>;

export interface Submission {
  id: number;
  form_type: string;
  region: string;
  source_url: string;
  form_data: string | SubmissionFormData;
  parsed_data: SubmissionFormData;
  status: string;
  created_at: string;
}

export type RawSubmission = Omit<
  Submission,
  'parsed_data' | 'source_url' | 'region'
> & {
  region?: string;
  source_url?: string | null;
  parsed_data?: SubmissionFormData;
};

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface BlogItem {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  status: 'published' | 'draft' | 'trashed';
  category_id: number | null;
  category_name?: string;
  content: string;
    author_name: string;
    author_role?: string | null;
    author_email?: string;
  last_edited_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageItem {
  name: string;
  path: string;
  parentPage?: string;
  isIndexed?: boolean;
  status?: string;
  created_at?: string | null;
}

export interface EventItem {
  id: number;
  event_name: string;
  day_date: string;
  event_time: string;
  venue: string;
  cover_image: string | null;
  target_page: string;
  status: EventStatus;
  created_at: string;
}

export interface FormOption {
  name: string;
  unreadCount?: number;
}

export interface HoveredUrl {
  url: string;
  x: number;
  y: number;
}
