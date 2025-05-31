// Message Template Types
export interface MessageTemplate {
  id: string
  name: string
  description: string | null
  template_type: TemplateType
  message_content_template: string | null
  details: TemplateDetails | null
  created_at: string
  updated_at: string
}

export type TemplateType = 
  | 'TEXT_ONLY'
  | 'TEXT_WITH_PLACEHOLDERS'
  | 'IMAGE_WITH_TEXT'
  | 'ACTION_BASED'
  | 'FLOW_TRIGGER'

export interface TemplateDetails {
  // For TEXT_WITH_PLACEHOLDERS, IMAGE_WITH_TEXT
  placeholders?: PlaceholderDefinition[]
  
  // For IMAGE_WITH_TEXT
  image_url?: string
  
  // For ACTION_BASED
  action_identifier?: string
  required_inputs_for_admin?: AdminInputDefinition[]
  target_operation?: TargetOperation
  message_placeholders?: MessagePlaceholder[]
  
  // For FLOW_TRIGGER
  flow_id?: string
  initial_message_placeholders?: PlaceholderDefinition[]
  map_admin_inputs_to_flow_params?: Record<string, string>
}

export interface PlaceholderDefinition {
  name: string
  description: string
  example: string
}

export interface AdminInputDefinition {
  name: string
  label: string
  type: 'text' | 'date' | 'time' | 'number' | 'textarea'
  required?: boolean
}

export interface TargetOperation {
  table: string
  map_to_columns: Record<string, string>
}

export interface MessagePlaceholder {
  name: string
  source_from_input?: string
  source_from_action_result?: string
  format?: string
}

export interface CreateTemplatePayload {
  name: string
  description?: string | null
  template_type: TemplateType
  message_content_template?: string | null
  details?: TemplateDetails | null
}

export interface UpdateTemplatePayload {
  name?: string
  description?: string | null
  template_type?: TemplateType
  message_content_template?: string | null
  details?: TemplateDetails | null
}

// Template preview data for rendering examples
export interface TemplatePreviewData {
  id: string
  name: string
  type: TemplateType
  preview_message: string
  placeholder_count: number
  has_action: boolean
}
