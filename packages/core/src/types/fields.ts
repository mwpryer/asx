/**
 * Static field registries for Asana resource types.
 * Used by the `describe` command to expose available opt_fields.
 */

export const TASK_FIELDS = [
  "gid",
  "name",
  "completed",
  "completed_at",
  "assignee",
  "assignee.name",
  "assignee.email",
  "due_on",
  "due_at",
  "start_on",
  "start_at",
  "notes",
  "html_notes",
  "tags",
  "tags.name",
  "projects",
  "projects.name",
  "memberships.section.name",
  "parent",
  "parent.name",
  "num_subtasks",
  "permalink_url",
  "created_at",
  "modified_at",
  "custom_fields",
  "custom_fields.name",
  "custom_fields.display_value",
  "followers",
  "followers.name",
] as const;

export const PROJECT_FIELDS = [
  "gid",
  "name",
  "archived",
  "color",
  "owner",
  "owner.name",
  "team",
  "team.name",
  "workspace",
  "workspace.name",
  "notes",
  "html_notes",
  "permalink_url",
  "created_at",
  "modified_at",
  "due_on",
  "start_on",
  "default_view",
  "public",
  "members",
  "members.name",
  "custom_fields",
  "custom_fields.name",
  "custom_fields.display_value",
] as const;

export const WORKSPACE_FIELDS = [
  "gid",
  "name",
  "is_organization",
  "email_domains",
] as const;

export const SECTION_FIELDS = [
  "gid",
  "name",
  "created_at",
  "project",
  "project.name",
] as const;

export const USER_FIELDS = [
  "gid",
  "name",
  "email",
  "photo",
  "workspaces",
  "workspaces.name",
] as const;
