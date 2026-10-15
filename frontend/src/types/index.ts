export type UserRole = 'donor' | 'recipient' | 'volunteer' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  organization_id?: number;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: number;
  name: string;
  org_type: string;
  registration_number?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  capacity_servings_per_day: number;
  service_radius_km: number;
  contact_email: string;
  contact_phone: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

export type ListingStatus = 
  | 'AVAILABLE' 
  | 'REQUESTED' 
  | 'ACCEPTED' 
  | 'PICKUP_ASSIGNED' 
  | 'PICKED_UP' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'FLAGGED_FOR_REVIEW';

export interface FoodListing {
  id: number;
  donor_id: number;
  organization_id?: number;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  remaining_quantity: number;
  estimated_servings: number;
  preparation_datetime: string;
  expiry_datetime: string;
  storage_conditions: string;
  allergens?: string;
  dietary_attributes: string;
  pickup_address: string;
  latitude?: number;
  longitude?: number;
  pickup_start_time: string;
  pickup_deadline: string;
  contact_name: string;
  contact_phone: string;
  food_safety_declaration: boolean;
  status: ListingStatus;
  image_url?: string;
  matched_recipient_org_id?: number;
  donor_org_name?: string;
  matched_recipient_org_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DonationRequest {
  id: number;
  listing_id: number;
  recipient_user_id: number;
  recipient_org_id: number;
  quantity_requested: number;
  servings_requested: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  listing?: FoodListing;
  recipient_org?: Organization;
}

export interface PickupTask {
  id: number;
  listing_id: number;
  donation_request_id?: number;
  volunteer_id?: number;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'COMPLETED' | 'DECLINED' | 'CANCELLED';
  pickup_deadline: string;
  pickup_instructions?: string;
  delivery_instructions?: string;
  notes?: string;
  assigned_at?: string;
  accepted_at?: string;
  picked_up_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  listing?: FoodListing;
  volunteer_name?: string;
  volunteer_phone?: string;
  recipient_org_name?: string;
  recipient_address?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  related_listing_id?: number;
  related_pickup_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface MatchRecommendation {
  recipient_org_id?: number;
  recipient_name?: string;
  listing_id?: number;
  title?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  estimated_servings?: number;
  pickup_address?: string;
  pickup_deadline?: string;
  donor_name?: string;
  org_type?: string;
  address?: string;
  contact_phone?: string;
  capacity_servings_per_day?: number;
  service_radius_km?: number;
  distance_km?: number;
  match_score: number;
  reasons: string[];
}

export interface CategoryImpact {
  category: string;
  count: number;
  servings: number;
  quantity_kg: number;
}

export interface TrendPoint {
  date: string;
  donations_count: number;
  servings: number;
}

export interface ImpactMetrics {
  total_donations_listed: number;
  donations_completed: number;
  donations_in_progress: number;
  completion_rate_percentage: number;
  total_servings_redistributed: number;
  total_quantity_redistributed_kg: number;
  average_hours_to_accept?: number;
  active_donor_orgs: number;
  active_recipient_orgs: number;
  volunteers_contributing: number;
  category_breakdown: CategoryImpact[];
  trend_data: TrendPoint[];
  sdg_alignment: Record<string, string>;
}

export interface AICategorizeResult {
  suggested_category: string;
  short_summary: string;
  estimated_servings_hint?: number;
  dietary_tags: string[];
  allergens_detected: string[];
  missing_fields: string[];
  safety_cautions: string[];
  model_used: string;
}

export interface AIImproveResult {
  completeness_score: number;
  suggestions: string[];
  enhanced_description?: string;
  safety_recommendations: string[];
}

export interface AISearchResult {
  interpreted_filters: Record<string, any>;
  explanation: string;
  category?: string;
  dietary?: string;
  max_distance_km?: number;
  urgent_only?: boolean;
}

export interface AIChatResult {
  reply: string;
  suggested_actions: string[];
  data_context_used: boolean;
}

export interface AdminStats {
  total_users: number;
  donor_count: number;
  recipient_count: number;
  volunteer_count: number;
  verified_recipients: number;
  pending_verifications: number;
  total_listings: number;
  active_listings: number;
  completed_donations: number;
  open_safety_reports: number;
  pickup_completion_rate: number;
}
