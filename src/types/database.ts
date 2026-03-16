export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  payment_status: "pending" | "paid";
  payment_id: string | null;
  payment_provider: "stripe" | "paypal" | null;
  data: PlanData;
  results: PlanResults | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  provider: "stripe" | "paypal";
  provider_payment_id: string | null;
  created_at: string;
}

// Business Plan Data - Input fields for real estate investment analysis
export interface PlanData {
  // Property Information
  property_type: string;
  property_address: string;
  property_city: string;
  property_size_sqm: number;
  num_units: number;

  // Acquisition Costs
  purchase_price: number;
  notary_costs: number;
  agency_commission: number;
  registration_tax: number;
  other_acquisition_costs: number;

  // Renovation Costs
  renovation_cost_per_sqm: number;
  total_renovation_cost: number;
  furniture_costs: number;
  technical_expenses: number;

  // Financing
  equity_amount: number;
  mortgage_amount: number;
  mortgage_rate: number;
  mortgage_years: number;

  // Revenue (Rental)
  monthly_rent_per_unit: number;
  occupancy_rate: number;
  annual_rent_increase: number;

  // Revenue (Sale)
  expected_sale_price: number;
  sale_timeline_months: number;

  // Operating Expenses
  property_tax_annual: number;
  insurance_annual: number;
  maintenance_annual: number;
  management_fee_percent: number;
  condo_fees_annual: number;
  other_expenses_annual: number;

  // Analysis Settings
  analysis_years: number;
  investment_type: "rental" | "flip" | "both";
}

// Calculated Results
export interface PlanResults {
  // Summary
  total_investment: number;
  total_acquisition_cost: number;
  total_renovation_cost: number;

  // Rental Analysis
  gross_annual_income: number;
  net_annual_income: number;
  annual_expenses: number;
  monthly_mortgage_payment: number;
  annual_mortgage_payment: number;
  annual_cash_flow: number;
  monthly_cash_flow: number;

  // Key Metrics
  gross_yield: number;
  net_yield: number;
  cap_rate: number;
  cash_on_cash_return: number;
  roi: number;
  payback_period_years: number;
  break_even_occupancy: number;

  // Flip Analysis
  total_cost: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  annualized_roi: number;

  // Multi-year Projections
  yearly_projections: YearlyProjection[];
}

export interface YearlyProjection {
  year: number;
  gross_income: number;
  expenses: number;
  mortgage_payment: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
  property_value: number;
  equity: number;
  total_return: number;
}

// Default values for a new plan
export const defaultPlanData: PlanData = {
  property_type: "appartamento",
  property_address: "",
  property_city: "",
  property_size_sqm: 80,
  num_units: 1,

  purchase_price: 100000,
  notary_costs: 3000,
  agency_commission: 3000,
  registration_tax: 2000,
  other_acquisition_costs: 0,

  renovation_cost_per_sqm: 400,
  total_renovation_cost: 32000,
  furniture_costs: 5000,
  technical_expenses: 3000,

  equity_amount: 50000,
  mortgage_amount: 50000,
  mortgage_rate: 3.5,
  mortgage_years: 25,

  monthly_rent_per_unit: 600,
  occupancy_rate: 90,
  annual_rent_increase: 2,

  expected_sale_price: 180000,
  sale_timeline_months: 12,

  property_tax_annual: 800,
  insurance_annual: 300,
  maintenance_annual: 1000,
  management_fee_percent: 0,
  condo_fees_annual: 1200,
  other_expenses_annual: 0,

  analysis_years: 10,
  investment_type: "rental",
};
