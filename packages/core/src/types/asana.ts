export interface AsanaCompact {
  gid: string;
  name: string;
  resource_type: string;
}

export interface AsanaWorkspace extends AsanaCompact {
  resource_type: "workspace";
  is_organization: boolean;
}

export interface AsanaUser extends AsanaCompact {
  resource_type: "user";
  email: string;
  photo?: { image_128x128: string } | null;
  workspaces?: AsanaCompact[];
}

export interface AsanaProject extends AsanaCompact {
  resource_type: "project";
  archived: boolean;
  color?: string | null;
  created_at: string;
  modified_at: string;
  notes?: string;
  owner?: AsanaCompact | null;
  workspace?: AsanaCompact;
  team?: AsanaCompact | null;
  members?: AsanaCompact[];
}

export interface AsanaSection extends AsanaCompact {
  resource_type: "section";
  project?: AsanaCompact;
  created_at?: string;
}

export interface AsanaTask extends AsanaCompact {
  resource_type: "task";
  assignee?: AsanaCompact | null;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  due_on?: string | null;
  due_at?: string | null;
  modified_at: string;
  notes?: string;
  html_notes?: string;
  projects?: AsanaCompact[];
  parent?: AsanaCompact | null;
  tags?: AsanaCompact[];
  memberships?: Array<{
    project: AsanaCompact;
    section: AsanaCompact;
  }>;
  custom_fields?: AsanaCustomFieldValue[];
  num_subtasks?: number;
  permalink_url?: string;
}

export interface AsanaStory extends AsanaCompact {
  resource_type: "story";
  created_at: string;
  created_by?: AsanaCompact;
  text: string;
  html_text?: string;
  type: "comment" | "system";
  resource_subtype: string;
}

export interface AsanaTag extends AsanaCompact {
  resource_type: "tag";
  color?: string | null;
}

export interface AsanaTeam extends AsanaCompact {
  resource_type: "team";
  organization?: AsanaCompact;
}

export interface AsanaCustomFieldValue {
  gid: string;
  name: string;
  display_value?: string | null;
  type: string;
  number_value?: number | null;
  text_value?: string | null;
  enum_value?: AsanaCompact | null;
}

export interface AsanaAttachment extends AsanaCompact {
  resource_type: "attachment";
  created_at: string;
  download_url?: string | null;
  host: string;
  view_url?: string | null;
}
