export type AccountType = "individual" | "grocery";

export type Profile = {
  id: string;
  account_type: AccountType;
  full_name: string;
  store_name: string | null;
  business_address: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type AlertSubscription = {
  id: string;
  user_id: string;
  alert_email: string;
  lat: number;
  lon: number;
  timezone: string;
  min_temp_alert_celsius: number;
  max_temp_alert_celsius: number;
  daily_digest_hour: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
