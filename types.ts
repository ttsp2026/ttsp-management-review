
export interface PDRRecord {
  id?: number; // 'No' in CSV
  department: string;
  group_name: string; // 'Group'
  team: string;
  year: number;
  billing_month: string;
  ship_number: string;
  revision_series_number: string;
  revision_number: string;
  industry_number: string;
  block_name_or_drawing_name: string;
  drawing_number: string;
  issuance_date: string;
  original_t_dreams_delivery: string;
  manhour_spent: number;
  responsible_team: string;
  origin: string;
  designer: string;
  checker: string;
  revised_by: string;
  reason_of_revision: string;
  design_update_code: string;
  from_d_number: string;
  type_of_error: string;
  detail_cause_of_error: string;
  general_cause_of_error: string;
  damage: string; // 'N', 'Y', 'Y and N'
  number_of_piece_with_damage: number;
  number_of_piece_without_damage: number;
  cost_of_damage: number; // 'Cost of Damage ¥'
  remarks: string;
  revision_family_number: string;
  add_info: string;
  update_info: string;
}

export type ThemeType = 'aurora' | 'oceanic' | 'industrial' | 'frost';

export interface ThemeConfig {
  name: string;
  value: ThemeType;
  class: string;
}
