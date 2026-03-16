import { PlanData, PlanResults, YearlyProjection } from "@/types/database";

export function calculatePlanResults(data: PlanData): PlanResults {
  // Total Acquisition Costs
  const total_acquisition_cost =
    data.purchase_price +
    data.notary_costs +
    data.agency_commission +
    data.registration_tax +
    data.other_acquisition_costs;

  // Total Renovation Costs
  const total_renovation_cost =
    data.total_renovation_cost +
    data.furniture_costs +
    data.technical_expenses;

  // Total Investment
  const total_investment = total_acquisition_cost + total_renovation_cost;

  // Mortgage Calculation (French amortization)
  const monthly_rate = data.mortgage_rate / 100 / 12;
  const num_payments = data.mortgage_years * 12;
  let monthly_mortgage_payment = 0;

  if (data.mortgage_amount > 0 && monthly_rate > 0) {
    monthly_mortgage_payment =
      (data.mortgage_amount *
        (monthly_rate * Math.pow(1 + monthly_rate, num_payments))) /
      (Math.pow(1 + monthly_rate, num_payments) - 1);
  }
  const annual_mortgage_payment = monthly_mortgage_payment * 12;

  // Rental Income
  const gross_monthly_income = data.monthly_rent_per_unit * data.num_units;
  const gross_annual_income = gross_monthly_income * 12;
  const effective_annual_income =
    gross_annual_income * (data.occupancy_rate / 100);

  // Operating Expenses
  const management_fees =
    effective_annual_income * (data.management_fee_percent / 100);
  const annual_expenses =
    data.property_tax_annual +
    data.insurance_annual +
    data.maintenance_annual +
    management_fees +
    data.condo_fees_annual +
    data.other_expenses_annual;

  // Net Operating Income
  const net_annual_income = effective_annual_income - annual_expenses;

  // Cash Flow (after mortgage)
  const annual_cash_flow = net_annual_income - annual_mortgage_payment;
  const monthly_cash_flow = annual_cash_flow / 12;

  // Key Metrics - Rental
  const gross_yield = (gross_annual_income / total_investment) * 100;
  const net_yield = (net_annual_income / total_investment) * 100;
  const cap_rate = (net_annual_income / data.purchase_price) * 100;
  const cash_on_cash_return =
    data.equity_amount > 0
      ? (annual_cash_flow / data.equity_amount) * 100
      : 0;
  const roi = (net_annual_income / total_investment) * 100;
  const payback_period_years =
    annual_cash_flow > 0 ? data.equity_amount / annual_cash_flow : 0;
  const break_even_occupancy =
    gross_annual_income > 0
      ? ((annual_expenses + annual_mortgage_payment) / gross_annual_income) * 100
      : 0;

  // Flip Analysis
  const total_cost = total_investment;
  const gross_profit = data.expected_sale_price - total_cost;
  const selling_costs = data.expected_sale_price * 0.03; // ~3% selling costs
  const net_profit = gross_profit - selling_costs;
  const profit_margin =
    data.expected_sale_price > 0
      ? (net_profit / data.expected_sale_price) * 100
      : 0;
  const annualized_roi =
    data.sale_timeline_months > 0
      ? (net_profit / total_cost) * (12 / data.sale_timeline_months) * 100
      : 0;

  // Yearly Projections
  const yearly_projections: YearlyProjection[] = [];
  let cumulative_cash_flow = 0;
  let remaining_mortgage = data.mortgage_amount;
  const annual_appreciation = 0.02; // 2% annual property appreciation

  for (let year = 1; year <= data.analysis_years; year++) {
    const year_rent_increase = Math.pow(
      1 + data.annual_rent_increase / 100,
      year - 1
    );
    const year_gross_income =
      gross_annual_income * year_rent_increase * (data.occupancy_rate / 100);
    const year_expenses = annual_expenses * Math.pow(1.02, year - 1); // 2% expense inflation
    const year_mortgage = annual_mortgage_payment;

    const year_net_cash_flow =
      year_gross_income - year_expenses - year_mortgage;
    cumulative_cash_flow += year_net_cash_flow;

    const property_value =
      data.purchase_price * Math.pow(1 + annual_appreciation, year) +
      total_renovation_cost;

    // Simplified remaining mortgage calculation
    if (remaining_mortgage > 0) {
      const principal_paid = annual_mortgage_payment - remaining_mortgage * (data.mortgage_rate / 100);
      remaining_mortgage = Math.max(0, remaining_mortgage - Math.max(0, principal_paid));
    }

    const equity = property_value - remaining_mortgage;
    const total_return =
      ((equity - data.equity_amount + cumulative_cash_flow) /
        data.equity_amount) *
      100;

    yearly_projections.push({
      year,
      gross_income: Math.round(year_gross_income * 100) / 100,
      expenses: Math.round(year_expenses * 100) / 100,
      mortgage_payment: Math.round(year_mortgage * 100) / 100,
      net_cash_flow: Math.round(year_net_cash_flow * 100) / 100,
      cumulative_cash_flow: Math.round(cumulative_cash_flow * 100) / 100,
      property_value: Math.round(property_value * 100) / 100,
      equity: Math.round(equity * 100) / 100,
      total_return: Math.round(total_return * 100) / 100,
    });
  }

  return {
    total_investment: Math.round(total_investment * 100) / 100,
    total_acquisition_cost: Math.round(total_acquisition_cost * 100) / 100,
    total_renovation_cost: Math.round(total_renovation_cost * 100) / 100,
    gross_annual_income: Math.round(effective_annual_income * 100) / 100,
    net_annual_income: Math.round(net_annual_income * 100) / 100,
    annual_expenses: Math.round(annual_expenses * 100) / 100,
    monthly_mortgage_payment: Math.round(monthly_mortgage_payment * 100) / 100,
    annual_mortgage_payment: Math.round(annual_mortgage_payment * 100) / 100,
    annual_cash_flow: Math.round(annual_cash_flow * 100) / 100,
    monthly_cash_flow: Math.round(monthly_cash_flow * 100) / 100,
    gross_yield: Math.round(gross_yield * 100) / 100,
    net_yield: Math.round(net_yield * 100) / 100,
    cap_rate: Math.round(cap_rate * 100) / 100,
    cash_on_cash_return: Math.round(cash_on_cash_return * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    payback_period_years: Math.round(payback_period_years * 100) / 100,
    break_even_occupancy: Math.round(break_even_occupancy * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
    gross_profit: Math.round(gross_profit * 100) / 100,
    net_profit: Math.round(net_profit * 100) / 100,
    profit_margin: Math.round(profit_margin * 100) / 100,
    annualized_roi: Math.round(annualized_roi * 100) / 100,
    yearly_projections,
  };
}
