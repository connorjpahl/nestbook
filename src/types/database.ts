export type TimelineRole = "owner" | "editor" | "viewer";
export type MediaType = "photo" | "video";

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};

export type Timeline = {
  id: string;
  child_name: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

export type TimelineMember = {
  timeline_id: string;
  user_id: string;
  role: TimelineRole;
  created_at: string;
};

export type TimelineEvent = {
  id: string;
  timeline_id: string;
  title: string;
  narration: string | null;
  event_date: string;
  display_order: number | null;
  created_by: string;
  created_at: string;
};

export type EventMedia = {
  id: string;
  event_id: string;
  storage_path: string;
  media_type: MediaType;
  created_at: string;
};

type TableOf<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableOf<
        Profile,
        { id: string; display_name?: string; created_at?: string }
      >;
      timelines: TableOf<
        Timeline,
        {
          id?: string;
          child_name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
        }
      >;
      timeline_members: TableOf<
        TimelineMember,
        {
          timeline_id: string;
          user_id: string;
          role?: TimelineRole;
          created_at?: string;
        }
      >;
      events: TableOf<
        TimelineEvent,
        {
          id?: string;
          timeline_id: string;
          title: string;
          narration?: string | null;
          event_date: string;
          display_order?: number | null;
          created_by: string;
          created_at?: string;
        }
      >;
      event_media: TableOf<
        EventMedia,
        {
          id?: string;
          event_id: string;
          storage_path: string;
          media_type: MediaType;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_timeline: {
        Args: { _child_name: string; _description?: string | null };
        Returns: Timeline;
      };
      get_user_id_by_email: {
        Args: { _email: string };
        Returns: string;
      };
    };
  };
};
