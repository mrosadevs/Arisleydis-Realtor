"use client";

import { useMemo, useState } from "react";

type ToolKey = "mortgage" | "affordability" | "rent-vs-buy" | "closing" | "dti";

type ToolTab = {
  key: ToolKey;
  label: string;
};

const tabs: ToolTab[] = [
  { key: "mortgage", label: "Mortgage" },
  { key: "affordability", label: "Affordability" },
  { key: "rent-vs-buy", label: "Rent vs Buy" },
  { key: "closing", label: "Closing Costs" },
  { key: "dti", label: "DTI" }
];

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function monthlyMortgagePayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (months <= 0) {
    return 0;
  }

  if (monthlyRate <= 0) {
    return principal / months;
  }

  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function remainingBalance(principal: number, annualRate: number, years: number, paidMonths: number): number {
  const months = years * 12;

  if (months <= 0) {
    return 0;
  }

  const monthly = monthlyMortgagePayment(principal, annualRate, years);
  const monthlyRate = annualRate / 100 / 12;
  const safePaidMonths = Math.max(0, Math.min(paidMonths, months));

  if (monthlyRate <= 0) {
    return Math.max(principal - monthly * safePaidMonths, 0);
  }

  const growth = Math.pow(1 + monthlyRate, safePaidMonths);
  const balance = principal * growth - monthly * ((growth - 1) / monthlyRate);
  return Math.max(balance, 0);
}

export function ResourcesHub() {
  const [active, setActive] = useState<ToolKey>("mortgage");

  const [mortgage, setMortgage] = useState({
    homePrice: "460000",
    downPaymentPercent: "10",
    interestRate: "6.75",
    termYears: "30",
    annualTax: "5200",
    annualInsurance: "2100",
    hoaMonthly: "0",
    closingCostPercent: "3"
  });

  const [affordability, setAffordability] = useState({
    annualIncome: "120000",
    monthlyDebt: "650",
    downPaymentCash: "35000",
    interestRate: "6.75",
    termYears: "30",
    taxInsuranceRate: "1.6",
    hoaMonthly: "0",
    pmiRate: "0.7",
    maxDti: "43"
  });

  const [rentVsBuy, setRentVsBuy] = useState({
    homePrice: "440000",
    downPaymentPercent: "10",
    interestRate: "6.75",
    termYears: "30",
    yearsInHome: "7",
    monthlyRent: "2600",
    annualRentIncrease: "4",
    annualAppreciation: "3",
    propertyTaxRate: "1.2",
    maintenanceRate: "1",
    annualInsurance: "2100",
    hoaMonthly: "0",
    closingCostPercent: "3",
    sellingCostPercent: "6"
  });

  const [closing, setClosing] = useState({
    homePrice: "450000",
    downPaymentPercent: "10",
    closingRatePercent: "2.8",
    lenderFees: "2200",
    titleEscrow: "1800",
    inspection: "500",
    appraisal: "650",
    credits: "0",
    earnestMoney: "5000"
  });

  const [dti, setDti] = useState({
    grossMonthlyIncome: "9800",
    projectedHousingPayment: "3100",
    otherMonthlyDebt: "750"
  });

  const mortgageResult = useMemo(() => {
    const homePrice = Math.max(toNumber(mortgage.homePrice), 0);
    const downPaymentPercent = Math.max(toNumber(mortgage.downPaymentPercent), 0);
    const interestRate = Math.max(toNumber(mortgage.interestRate), 0);
    const termYears = Math.max(toNumber(mortgage.termYears), 1);
    const annualTax = Math.max(toNumber(mortgage.annualTax), 0);
    const annualInsurance = Math.max(toNumber(mortgage.annualInsurance), 0);
    const hoaMonthly = Math.max(toNumber(mortgage.hoaMonthly), 0);
    const closingCostPercent = Math.max(toNumber(mortgage.closingCostPercent), 0);

    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = Math.max(homePrice - downPayment, 0);
    const principalAndInterest = monthlyMortgagePayment(loanAmount, interestRate, termYears);
    const taxAndInsurance = annualTax / 12 + annualInsurance / 12;
    const totalMonthly = principalAndInterest + taxAndInsurance + hoaMonthly;
    const estimatedCashToClose = downPayment + homePrice * (closingCostPercent / 100);

    return {
      downPayment,
      loanAmount,
      principalAndInterest,
      taxAndInsurance,
      totalMonthly,
      estimatedCashToClose
    };
  }, [mortgage]);

  const affordabilityResult = useMemo(() => {
    const annualIncome = Math.max(toNumber(affordability.annualIncome), 0);
    const monthlyDebt = Math.max(toNumber(affordability.monthlyDebt), 0);
    const downPaymentCash = Math.max(toNumber(affordability.downPaymentCash), 0);
    const interestRate = Math.max(toNumber(affordability.interestRate), 0);
    const termYears = Math.max(toNumber(affordability.termYears), 1);
    const taxInsuranceRate = Math.max(toNumber(affordability.taxInsuranceRate), 0);
    const hoaMonthly = Math.max(toNumber(affordability.hoaMonthly), 0);
    const pmiRate = Math.max(toNumber(affordability.pmiRate), 0);
    const maxDti = Math.max(toNumber(affordability.maxDti), 1);

    const monthlyIncome = annualIncome / 12;
    const maxHousingPayment = Math.max(monthlyIncome * (maxDti / 100) - monthlyDebt, 0);

    function estimatedPaymentForPrice(price: number): number {
      const loan = Math.max(price - downPaymentCash, 0);
      const principalAndInterest = monthlyMortgagePayment(loan, interestRate, termYears);
      const taxInsurance = (price * (taxInsuranceRate / 100)) / 12;
      const ltv = price > 0 ? loan / price : 0;
      const pmiMonthly = ltv > 0.8 ? (loan * (pmiRate / 100)) / 12 : 0;
      return principalAndInterest + taxInsurance + pmiMonthly + hoaMonthly;
    }

    if (maxHousingPayment <= 0) {
      return {
        maxHousingPayment,
        maxPrice: 0,
        estimatedPayment: 0
      };
    }

    let low = 0;
    let high = 250000;

    while (estimatedPaymentForPrice(high) < maxHousingPayment && high < 10000000) {
      high *= 1.5;
    }

    for (let index = 0; index < 60; index += 1) {
      const mid = (low + high) / 2;
      const payment = estimatedPaymentForPrice(mid);

      if (payment > maxHousingPayment) {
        high = mid;
      } else {
        low = mid;
      }
    }

    const maxPrice = low;
    return {
      maxHousingPayment,
      maxPrice,
      estimatedPayment: estimatedPaymentForPrice(maxPrice)
    };
  }, [affordability]);

  const rentVsBuyResult = useMemo(() => {
    const homePrice = Math.max(toNumber(rentVsBuy.homePrice), 0);
    const downPaymentPercent = Math.max(toNumber(rentVsBuy.downPaymentPercent), 0);
    const interestRate = Math.max(toNumber(rentVsBuy.interestRate), 0);
    const termYears = Math.max(toNumber(rentVsBuy.termYears), 1);
    const yearsInHome = Math.max(toNumber(rentVsBuy.yearsInHome), 1);
    const monthlyRent = Math.max(toNumber(rentVsBuy.monthlyRent), 0);
    const annualRentIncrease = Math.max(toNumber(rentVsBuy.annualRentIncrease), 0);
    const annualAppreciation = Math.max(toNumber(rentVsBuy.annualAppreciation), 0);
    const propertyTaxRate = Math.max(toNumber(rentVsBuy.propertyTaxRate), 0);
    const maintenanceRate = Math.max(toNumber(rentVsBuy.maintenanceRate), 0);
    const annualInsurance = Math.max(toNumber(rentVsBuy.annualInsurance), 0);
    const hoaMonthly = Math.max(toNumber(rentVsBuy.hoaMonthly), 0);
    const closingCostPercent = Math.max(toNumber(rentVsBuy.closingCostPercent), 0);
    const sellingCostPercent = Math.max(toNumber(rentVsBuy.sellingCostPercent), 0);

    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = Math.max(homePrice - downPayment, 0);
    const monthlyMortgage = monthlyMortgagePayment(loanAmount, interestRate, termYears);
    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyMaintenance = (homePrice * (maintenanceRate / 100)) / 12;
    const monthlyInsurance = annualInsurance / 12;
    const months = Math.floor(yearsInHome * 12);

    const buyRecurring = months * (monthlyMortgage + monthlyTax + monthlyMaintenance + monthlyInsurance + hoaMonthly);
    const buyUpfront = downPayment + homePrice * (closingCostPercent / 100);

    let totalRent = 0;
    for (let year = 0; year < yearsInHome; year += 1) {
      const adjustedRent = monthlyRent * Math.pow(1 + annualRentIncrease / 100, year);
      totalRent += adjustedRent * 12;
    }

    const projectedValue = homePrice * Math.pow(1 + annualAppreciation / 100, yearsInHome);
    const remainingLoan = remainingBalance(loanAmount, interestRate, termYears, months);
    const saleProceedsAfterFees = projectedValue * (1 - sellingCostPercent / 100);
    const estimatedEquity = Math.max(saleProceedsAfterFees - remainingLoan, 0);

    const netBuyCost = buyUpfront + buyRecurring - estimatedEquity;
    const advantage = totalRent - netBuyCost;

    return {
      totalRent,
      netBuyCost,
      estimatedEquity,
      advantage
    };
  }, [rentVsBuy]);

  const closingResult = useMemo(() => {
    const homePrice = Math.max(toNumber(closing.homePrice), 0);
    const downPaymentPercent = Math.max(toNumber(closing.downPaymentPercent), 0);
    const closingRatePercent = Math.max(toNumber(closing.closingRatePercent), 0);
    const lenderFees = Math.max(toNumber(closing.lenderFees), 0);
    const titleEscrow = Math.max(toNumber(closing.titleEscrow), 0);
    const inspection = Math.max(toNumber(closing.inspection), 0);
    const appraisal = Math.max(toNumber(closing.appraisal), 0);
    const credits = Math.max(toNumber(closing.credits), 0);
    const earnestMoney = Math.max(toNumber(closing.earnestMoney), 0);

    const downPayment = homePrice * (downPaymentPercent / 100);
    const percentageCosts = homePrice * (closingRatePercent / 100);
    const totalClosingCosts = percentageCosts + lenderFees + titleEscrow + inspection + appraisal;
    const estimatedCashToClose = Math.max(downPayment + totalClosingCosts - credits - earnestMoney, 0);

    return {
      downPayment,
      totalClosingCosts,
      estimatedCashToClose
    };
  }, [closing]);

  const dtiResult = useMemo(() => {
    const grossMonthlyIncome = Math.max(toNumber(dti.grossMonthlyIncome), 0);
    const projectedHousingPayment = Math.max(toNumber(dti.projectedHousingPayment), 0);
    const otherMonthlyDebt = Math.max(toNumber(dti.otherMonthlyDebt), 0);

    if (grossMonthlyIncome <= 0) {
      return {
        frontEndDti: 0,
        backEndDti: 0,
        status: "Add income to calculate DTI"
      };
    }

    const frontEndDti = (projectedHousingPayment / grossMonthlyIncome) * 100;
    const backEndDti = ((projectedHousingPayment + otherMonthlyDebt) / grossMonthlyIncome) * 100;

    let status = "Strong";
    if (backEndDti > 43) {
      status = "High";
    } else if (backEndDti > 36) {
      status = "Moderate";
    }

    return {
      frontEndDti,
      backEndDti,
      status
    };
  }, [dti]);

  return (
    <section id="resources" className="section container resources-section">
      <div className="section-heading stacked">
        <p className="kicker">Resources</p>
        <h2>Smart tools for home buyers, sellers, and owners</h2>
        <p className="resources-intro">
          Use these calculators to estimate payments, affordability, and total ownership costs before making big
          decisions.
        </p>
      </div>

      <div className="resource-tabs" role="tablist" aria-label="Real estate resources">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`resource-tab ${active === tab.key ? "active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="resource-tool-shell">
        {active === "mortgage" ? (
          <div className="resource-tool-grid">
            <div className="resource-inputs">
              <label>
                Home price
                <input
                  type="number"
                  min="0"
                  value={mortgage.homePrice}
                  onChange={(event) => setMortgage((prev) => ({ ...prev, homePrice: event.target.value }))}
                />
              </label>

              <label>
                Down payment (%)
                <input
                  type="number"
                  min="0"
                  value={mortgage.downPaymentPercent}
                  onChange={(event) =>
                    setMortgage((prev) => ({ ...prev, downPaymentPercent: event.target.value }))
                  }
                />
              </label>

              <label>
                Interest rate (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={mortgage.interestRate}
                  onChange={(event) => setMortgage((prev) => ({ ...prev, interestRate: event.target.value }))}
                />
              </label>

              <label>
                Loan term (years)
                <input
                  type="number"
                  min="1"
                  value={mortgage.termYears}
                  onChange={(event) => setMortgage((prev) => ({ ...prev, termYears: event.target.value }))}
                />
              </label>

              <label>
                Annual property tax
                <input
                  type="number"
                  min="0"
                  value={mortgage.annualTax}
                  onChange={(event) => setMortgage((prev) => ({ ...prev, annualTax: event.target.value }))}
                />
              </label>

              <label>
                Annual insurance
                <input
                  type="number"
                  min="0"
                  value={mortgage.annualInsurance}
                  onChange={(event) =>
                    setMortgage((prev) => ({ ...prev, annualInsurance: event.target.value }))
                  }
                />
              </label>

              <label>
                HOA (monthly)
                <input
                  type="number"
                  min="0"
                  value={mortgage.hoaMonthly}
                  onChange={(event) => setMortgage((prev) => ({ ...prev, hoaMonthly: event.target.value }))}
                />
              </label>

              <label>
                Closing costs (%)
                <input
                  type="number"
                  min="0"
                  value={mortgage.closingCostPercent}
                  onChange={(event) =>
                    setMortgage((prev) => ({ ...prev, closingCostPercent: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="resource-results">
              <article>
                <h3>Total Monthly Payment</h3>
                <p className="result-primary">{currency(mortgageResult.totalMonthly)}</p>
                <p className="result-sub">Includes principal, interest, taxes, insurance, and HOA.</p>
              </article>

              <article>
                <h3>Loan Amount</h3>
                <p>{currency(mortgageResult.loanAmount)}</p>
              </article>

              <article>
                <h3>Principal + Interest</h3>
                <p>{currency(mortgageResult.principalAndInterest)}</p>
              </article>

              <article>
                <h3>Estimated Cash To Close</h3>
                <p>{currency(mortgageResult.estimatedCashToClose)}</p>
              </article>
            </div>
          </div>
        ) : null}

        {active === "affordability" ? (
          <div className="resource-tool-grid">
            <div className="resource-inputs">
              <label>
                Annual household income
                <input
                  type="number"
                  min="0"
                  value={affordability.annualIncome}
                  onChange={(event) =>
                    setAffordability((prev) => ({ ...prev, annualIncome: event.target.value }))
                  }
                />
              </label>

              <label>
                Monthly debt payments
                <input
                  type="number"
                  min="0"
                  value={affordability.monthlyDebt}
                  onChange={(event) =>
                    setAffordability((prev) => ({ ...prev, monthlyDebt: event.target.value }))
                  }
                />
              </label>

              <label>
                Cash available for down payment
                <input
                  type="number"
                  min="0"
                  value={affordability.downPaymentCash}
                  onChange={(event) =>
                    setAffordability((prev) => ({ ...prev, downPaymentCash: event.target.value }))
                  }
                />
              </label>

              <label>
                Interest rate (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={affordability.interestRate}
                  onChange={(event) =>
                    setAffordability((prev) => ({ ...prev, interestRate: event.target.value }))
                  }
                />
              </label>

              <label>
                Loan term (years)
                <input
                  type="number"
                  min="1"
                  value={affordability.termYears}
                  onChange={(event) =>
                    setAffordability((prev) => ({ ...prev, termYears: event.target.value }))
                  }
                />
              </label>

              <label>
                Target max DTI (%)
                <input
                  type="number"
                  min="1"
                  value={affordability.maxDti}
                  onChange={(event) => setAffordability((prev) => ({ ...prev, maxDti: event.target.value }))}
                />
              </label>

              <label>
                Tax + insurance assumption (% of home value/yr)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={affordability.taxInsuranceRate}
                  onChange={(event) =>
                    setAffordability((prev) => ({ ...prev, taxInsuranceRate: event.target.value }))
                  }
                />
              </label>

              <label>
                PMI assumption (% of loan/yr)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={affordability.pmiRate}
                  onChange={(event) => setAffordability((prev) => ({ ...prev, pmiRate: event.target.value }))}
                />
              </label>
            </div>

            <div className="resource-results">
              <article>
                <h3>Estimated Affordable Home Price</h3>
                <p className="result-primary">{currency(affordabilityResult.maxPrice)}</p>
              </article>

              <article>
                <h3>Max Monthly Housing Budget</h3>
                <p>{currency(affordabilityResult.maxHousingPayment)}</p>
              </article>

              <article>
                <h3>Projected Monthly Payment</h3>
                <p>{currency(affordabilityResult.estimatedPayment)}</p>
              </article>

              <article>
                <h3>Note</h3>
                <p className="result-sub">Use this as planning guidance, then confirm with your lender.</p>
              </article>
            </div>
          </div>
        ) : null}

        {active === "rent-vs-buy" ? (
          <div className="resource-tool-grid">
            <div className="resource-inputs">
              <label>
                Home price
                <input
                  type="number"
                  min="0"
                  value={rentVsBuy.homePrice}
                  onChange={(event) => setRentVsBuy((prev) => ({ ...prev, homePrice: event.target.value }))}
                />
              </label>

              <label>
                Down payment (%)
                <input
                  type="number"
                  min="0"
                  value={rentVsBuy.downPaymentPercent}
                  onChange={(event) =>
                    setRentVsBuy((prev) => ({ ...prev, downPaymentPercent: event.target.value }))
                  }
                />
              </label>

              <label>
                Interest rate (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rentVsBuy.interestRate}
                  onChange={(event) => setRentVsBuy((prev) => ({ ...prev, interestRate: event.target.value }))}
                />
              </label>

              <label>
                Years to compare
                <input
                  type="number"
                  min="1"
                  value={rentVsBuy.yearsInHome}
                  onChange={(event) => setRentVsBuy((prev) => ({ ...prev, yearsInHome: event.target.value }))}
                />
              </label>

              <label>
                Current monthly rent
                <input
                  type="number"
                  min="0"
                  value={rentVsBuy.monthlyRent}
                  onChange={(event) => setRentVsBuy((prev) => ({ ...prev, monthlyRent: event.target.value }))}
                />
              </label>

              <label>
                Rent increase per year (%)
                <input
                  type="number"
                  min="0"
                  value={rentVsBuy.annualRentIncrease}
                  onChange={(event) =>
                    setRentVsBuy((prev) => ({ ...prev, annualRentIncrease: event.target.value }))
                  }
                />
              </label>

              <label>
                Home appreciation per year (%)
                <input
                  type="number"
                  min="0"
                  value={rentVsBuy.annualAppreciation}
                  onChange={(event) =>
                    setRentVsBuy((prev) => ({ ...prev, annualAppreciation: event.target.value }))
                  }
                />
              </label>

              <label>
                Closing costs (%)
                <input
                  type="number"
                  min="0"
                  value={rentVsBuy.closingCostPercent}
                  onChange={(event) =>
                    setRentVsBuy((prev) => ({ ...prev, closingCostPercent: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="resource-results">
              <article>
                <h3>Total Rent Cost</h3>
                <p>{currency(rentVsBuyResult.totalRent)}</p>
              </article>

              <article>
                <h3>Estimated Net Cost of Buying</h3>
                <p>{currency(rentVsBuyResult.netBuyCost)}</p>
              </article>

              <article>
                <h3>Estimated Equity at Sale</h3>
                <p>{currency(rentVsBuyResult.estimatedEquity)}</p>
              </article>

              <article>
                <h3>Difference</h3>
                <p className="result-primary">
                  {rentVsBuyResult.advantage >= 0
                    ? `${currency(rentVsBuyResult.advantage)} favoring buying`
                    : `${currency(Math.abs(rentVsBuyResult.advantage))} favoring renting`}
                </p>
              </article>
            </div>
          </div>
        ) : null}

        {active === "closing" ? (
          <div className="resource-tool-grid">
            <div className="resource-inputs">
              <label>
                Home price
                <input
                  type="number"
                  min="0"
                  value={closing.homePrice}
                  onChange={(event) => setClosing((prev) => ({ ...prev, homePrice: event.target.value }))}
                />
              </label>

              <label>
                Down payment (%)
                <input
                  type="number"
                  min="0"
                  value={closing.downPaymentPercent}
                  onChange={(event) =>
                    setClosing((prev) => ({ ...prev, downPaymentPercent: event.target.value }))
                  }
                />
              </label>

              <label>
                Closing cost estimate (%)
                <input
                  type="number"
                  min="0"
                  value={closing.closingRatePercent}
                  onChange={(event) =>
                    setClosing((prev) => ({ ...prev, closingRatePercent: event.target.value }))
                  }
                />
              </label>

              <label>
                Lender fees
                <input
                  type="number"
                  min="0"
                  value={closing.lenderFees}
                  onChange={(event) => setClosing((prev) => ({ ...prev, lenderFees: event.target.value }))}
                />
              </label>

              <label>
                Title + escrow
                <input
                  type="number"
                  min="0"
                  value={closing.titleEscrow}
                  onChange={(event) => setClosing((prev) => ({ ...prev, titleEscrow: event.target.value }))}
                />
              </label>

              <label>
                Inspection
                <input
                  type="number"
                  min="0"
                  value={closing.inspection}
                  onChange={(event) => setClosing((prev) => ({ ...prev, inspection: event.target.value }))}
                />
              </label>

              <label>
                Appraisal
                <input
                  type="number"
                  min="0"
                  value={closing.appraisal}
                  onChange={(event) => setClosing((prev) => ({ ...prev, appraisal: event.target.value }))}
                />
              </label>

              <label>
                Credits + concessions
                <input
                  type="number"
                  min="0"
                  value={closing.credits}
                  onChange={(event) => setClosing((prev) => ({ ...prev, credits: event.target.value }))}
                />
              </label>

              <label>
                Earnest money already paid
                <input
                  type="number"
                  min="0"
                  value={closing.earnestMoney}
                  onChange={(event) => setClosing((prev) => ({ ...prev, earnestMoney: event.target.value }))}
                />
              </label>
            </div>

            <div className="resource-results">
              <article>
                <h3>Estimated Down Payment</h3>
                <p>{currency(closingResult.downPayment)}</p>
              </article>

              <article>
                <h3>Total Closing Costs</h3>
                <p>{currency(closingResult.totalClosingCosts)}</p>
              </article>

              <article>
                <h3>Estimated Cash Needed</h3>
                <p className="result-primary">{currency(closingResult.estimatedCashToClose)}</p>
              </article>
            </div>
          </div>
        ) : null}

        {active === "dti" ? (
          <div className="resource-tool-grid">
            <div className="resource-inputs">
              <label>
                Gross monthly income
                <input
                  type="number"
                  min="0"
                  value={dti.grossMonthlyIncome}
                  onChange={(event) => setDti((prev) => ({ ...prev, grossMonthlyIncome: event.target.value }))}
                />
              </label>

              <label>
                Projected housing payment
                <input
                  type="number"
                  min="0"
                  value={dti.projectedHousingPayment}
                  onChange={(event) =>
                    setDti((prev) => ({ ...prev, projectedHousingPayment: event.target.value }))
                  }
                />
              </label>

              <label>
                Other monthly debt payments
                <input
                  type="number"
                  min="0"
                  value={dti.otherMonthlyDebt}
                  onChange={(event) => setDti((prev) => ({ ...prev, otherMonthlyDebt: event.target.value }))}
                />
              </label>
            </div>

            <div className="resource-results">
              <article>
                <h3>Front-End DTI</h3>
                <p>{dtiResult.frontEndDti.toFixed(1)}%</p>
              </article>

              <article>
                <h3>Back-End DTI</h3>
                <p className="result-primary">{dtiResult.backEndDti.toFixed(1)}%</p>
              </article>

              <article>
                <h3>Qualification Signal</h3>
                <p>{dtiResult.status}</p>
                <p className="result-sub">Lower DTI usually means stronger financing options.</p>
              </article>
            </div>
          </div>
        ) : null}
      </div>

      <div className="resource-guide-grid">
        <article className="resource-guide-card">
          <h3>First-Time Buyer Checklist</h3>
          <p>Get pre-approval, define your budget, compare neighborhoods, and prepare your offer package.</p>
        </article>

        <article className="resource-guide-card">
          <h3>Seller Prep Timeline</h3>
          <p>Use a 30-day plan for staging, pricing, photos, and launch strategy to attract serious buyers fast.</p>
        </article>

        <article className="resource-guide-card">
          <h3>Homeowner Cost Planner</h3>
          <p>Track recurring ownership costs including insurance, taxes, maintenance, and reserve savings.</p>
        </article>
      </div>
    </section>
  );
}
