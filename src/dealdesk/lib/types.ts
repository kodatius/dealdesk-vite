export type DealStage = 'Lead' | 'Offer Sent' | 'Under Contract' | 'Closed' | 'Dead';
export type DealScore = 'green' | 'yellow' | 'red';
export type ArvConfidence = 'high' | 'medium' | 'low' | 'none';
export type GhlSyncStatus = 'synced' | 'failed' | 'pending' | null;

export interface Deal {
  id: string;
  address: string;
  asking_price: number;
  beds: number;
  baths: number;
  sqft: number;
  repair_estimate: number;
  arv: number | null;
  arv_locked: boolean;
  mao: number;
  spread: number;
  stage: DealStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Seller info
  seller_first_name: string | null;
  seller_last_name: string | null;
  seller_phone: string | null;
  seller_email: string | null;
  // GHL sync tracking
  ghl_contact_id: string | null;
  ghl_opportunity_id: string | null;
  ghl_sync_status: GhlSyncStatus;
  ghl_last_synced_at: string | null;
}

export interface DealWithScore extends Deal {
  score: DealScore;
}

export interface Comp {
  id: string;
  deal_id: string;
  address: string;
  sale_price: number;
  sqft: number;
  date_sold: string;
  distance_miles: number | null;
  year_built: number | null;
  beds: number | null;
  baths: number | null;
  created_at: string;
}

export interface ArvResult {
  arv: number;
  confidence: ArvConfidence;
  compCount: number;
  weightedPricePerSqft: number;
}

export interface ActivityLog {
  id: string;
  deal_id: string | null;
  action: string;
  details: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  dealCounts: Record<DealStage, number>;
  avgSpread: number | null;
  recentActivity: ActivityLog[];
  totalDeals: number;
}

export type CreateDealInput = {
  address: string;
  asking_price: number;
  beds: number;
  baths: number;
  sqft: number;
  repair_estimate: number;
  arv?: number | null;
  arv_locked?: number;
  stage: DealStage;
  notes: string | null;
  // Seller info (optional)
  seller_first_name?: string | null;
  seller_last_name?: string | null;
  seller_phone?: string | null;
  seller_email?: string | null;
};
export type UpdateDealInput = Partial<CreateDealInput>;
export type CreateCompInput = {
  address: string;
  sale_price: number;
  sqft: number;
  date_sold: string;
  distance_miles?: number | null;
  year_built?: number | null;
  beds?: number | null;
  baths?: number | null;
};

// Valid stage transitions
export const STAGE_TRANSITIONS: Record<DealStage, DealStage[]> = {
  'Lead': ['Offer Sent', 'Dead'],
  'Offer Sent': ['Under Contract', 'Dead'],
  'Under Contract': ['Closed', 'Dead'],
  'Closed': [],
  'Dead': [],
};

export const TERMINAL_STAGES: DealStage[] = ['Closed', 'Dead'];

export function scoreDeal(spread: number): DealScore {
  if (spread > 15000) return 'green';
  if (spread >= 5000) return 'yellow';
  return 'red';
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
