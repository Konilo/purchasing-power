import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

import AmountInput from "./AmountInput";
import NumberInput from "./NumberInput";
import PersonalFinanceSchema from "./PersonalFinanceSchema";
import "./styles/PersonalFinance.css";


const amount_formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function DropDown({ id, label, options, selectedOption, setSelectedOption }) {
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    console.log("Selected option:", event.target.value);
  };

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={selectedOption} onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
DropDown.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedOption: PropTypes.string.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
};

export default function PersonalFinance() {
  // Simulation inputs
  const [initialAmountInvested, setInitialAmountInvested] = useState(1000);
  const [recurringInvestmentFrequency, setRecurringInvestmentFrequency] =
    useState("monthly");
  const [recurringInvestmentAmount, setRecurringInvestmentAmount] =
    useState(1000);
  const [investmentDuration, setInvestmentDuration] = useState(10);
  const [annualGrossYield, setAnnualGrossYield] = useState(8);
  const [annualInflationRate, setAnnualInflationRate] = useState(2);
  const [investmentBuyInFee, setInvestmentBuyInFee] = useState(0.35);
  const [annualCustodyFee, setAnnualCustodyFee] = useState(0);
  const [investmentSellOutFee, setInvestmentSellOutFee] = useState(0);
  const [taxOnGains, setTaxOnGains] = useState(17.5);

  // Simulation output summary
  const [summaryNetPostTaxFinalValue, setSummaryNetPostTaxFinalValue] =
    useState(0);
  const [
    summaryNetPostTaxInflationCorrectedFinalValue,
    setSummaryNetPostTaxInflationCorrectedFinalValue,
  ] = useState(0);
  const [summaryNetPostTaxFinalGain, setSummaryNetPostTaxFinalGain] =
    useState(0);
  const [
    summaryNetPostTaxInflationCorrectedFinalGain,
    setSummaryNetPostTaxInflationCorrectedFinalGain,
  ] = useState(0);
  const [summaryTotalInflationPct, setSummaryTotalInflationPct] = useState(0);
  const [summaryNetPostTaxYield, setSummaryNetPostTaxYield] = useState(0);
  const [
    summaryNetPostTaxInflationCorrectedYield,
    setSummaryNetPostTaxInflationCorrectedYield,
  ] = useState(0);

  // Simulation output details
  const [detailsInitialAmountInvested, setDetailsInitialAmountInvested] =
    useState(0);
  const [
    detailsRecurringInvestmentFrequency,
    setDetailsRecurringInvestmentFrequency,
  ] = useState("");
  const [
    detailsRecurringInvestmentAmount,
    setDetailsRecurringInvestmentAmount,
  ] = useState(0);
  const [detailsTotalSpending, setDetailsTotalSpending] = useState(0);
  const [detailsBuyInFees, setDetailsBuyInFees] = useState(0);
  const [detailsAnnualGrossYield, setDetailsAnnualGrossYield] = useState(0);
  const [detailsTotalCustodianFees, setDetailsTotalCustodianFees] = useState(0);
  const [detailsSellOutFees, setDetailsSellOutFees] = useState(0);
  const [
    detailsInflationCorrectedSellOutFees,
    setDetailsInflationCorrectedSellOutFees,
  ] = useState(0);
  const [detailsNetPreTaxFinalValue, setDetailsNetPreTaxFinalValue] =
    useState(0);
  const [
    detailsNetPreTaxInflationCorrectedFinalValue,
    setDetailsNetPreTaxInflationCorrectedFinalValue,
  ] = useState(0);
  const [detailsNetPreTaxFinalGain, setDetailsNetPreTaxFinalGain] = useState(0);
  const [
    detailsNetPreTaxInflationCorrectedFinalGain,
    setDetailsNetPreTaxInflationCorrectedFinalGain,
  ] = useState(0);
  const [detailsTaxOnGains, setDetailsTaxOnGains] = useState(0);
  const [
    detailsInflationCorrectedTaxOnGains,
    setDetailsInflationCorrectedTaxOnGains,
  ] = useState(0);
  const [detailsNetPostTaxFinalGain, setDetailsNetPostTaxFinalGain] =
    useState(0);
  const [
    detailsNetPostTaxInflationCorrectedFinalGain,
    setDetailsNetPostTaxInflationCorrectedFinalGain,
  ] = useState(0);
  const [detailsNetPostTaxFinalValue, setDetailsNetPostTaxFinalValue] =
    useState(0);
  const [
    detailsNetPostTaxInflationCorrectedFinalValue,
    setDetailsNetPostTaxInflationCorrectedFinalValue,
  ] = useState(0);

  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/project_personal_finances?initial_amount_invested=${initialAmountInvested}&recurring_investment_frequency=${recurringInvestmentFrequency}&recurring_investment_amount=${recurringInvestmentAmount}&investment_duration_yrs=${investmentDuration}&annual_gross_yield=${annualGrossYield}&annual_inflation_rate=${annualInflationRate}&investment_buy_in_fee_pct=${investmentBuyInFee}&annual_custody_fee_pct=${annualCustodyFee}&investment_sell_out_fee_pct=${investmentSellOutFee}&tax_on_gains_pct=${taxOnGains}`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
          },
        }
      )
      .then((response) => {
        setSummaryNetPostTaxFinalValue(
          response.data.summary.net_post_tax_final_value
        );
        setSummaryNetPostTaxInflationCorrectedFinalValue(
          response.data.summary.net_post_tax_inflation_corrected_final_value
        );
        setSummaryNetPostTaxFinalGain(
          response.data.summary.net_post_tax_final_gain
        );
        setSummaryNetPostTaxInflationCorrectedFinalGain(
          response.data.summary.net_post_tax_inflation_corrected_final_gain
        );
        setSummaryTotalInflationPct(response.data.summary.total_inflation_pct);
        setSummaryNetPostTaxYield(response.data.summary.net_post_tax_yield);
        setSummaryNetPostTaxInflationCorrectedYield(
          response.data.summary.net_post_tax_inflation_corrected_yield
        );

        setDetailsInitialAmountInvested(
          response.data.details.initial_amount_invested
        );
        setDetailsRecurringInvestmentFrequency(
          response.data.details.recurring_investment_frequency
        );
        setDetailsRecurringInvestmentAmount(
          response.data.details.recurring_investment_amount
        );
        setDetailsTotalSpending(response.data.details.total_spending);
        setDetailsBuyInFees(response.data.details.buy_in_fees);
        setDetailsAnnualGrossYield(response.data.details.annual_gross_yield);
        setDetailsTotalCustodianFees(
          response.data.details.total_custodian_fees
        );
        setDetailsSellOutFees(response.data.details.sell_out_fees);
        setDetailsInflationCorrectedSellOutFees(
          response.data.details.inflation_corrected_sell_out_fees
        );
        setDetailsNetPreTaxFinalValue(
          response.data.details.net_pre_tax_final_value
        );
        setDetailsNetPreTaxInflationCorrectedFinalValue(
          response.data.details.net_pre_tax_inflation_corrected_final_value
        );
        setDetailsNetPreTaxFinalGain(
          response.data.details.net_pre_tax_final_gain
        );
        setDetailsNetPreTaxInflationCorrectedFinalGain(
          response.data.details.net_pre_tax_inflation_corrected_final_gain
        );
        setDetailsTaxOnGains(response.data.details.tax_on_gains);
        setDetailsInflationCorrectedTaxOnGains(
          response.data.details.inflation_corrected_tax_on_gains
        );
        setDetailsNetPostTaxFinalGain(
          response.data.details.net_post_tax_final_gain
        );
        setDetailsNetPostTaxInflationCorrectedFinalGain(
          response.data.details.net_post_tax_inflation_corrected_final_gain
        );
        setDetailsNetPostTaxFinalValue(
          response.data.details.net_post_tax_final_value
        );
        setDetailsNetPostTaxInflationCorrectedFinalValue(
          response.data.details.net_post_tax_inflation_corrected_final_value
        );

        console.log("Fetched CPI correction");
      })
      .catch((error) => console.error("Error fetching CPI correction:", error));
  }, [
    initialAmountInvested,
    recurringInvestmentFrequency,
    recurringInvestmentAmount,
    investmentDuration,
    annualGrossYield,
    annualInflationRate,
    investmentBuyInFee,
    annualCustodyFee,
    investmentSellOutFee,
    taxOnGains,
  ]);

  return (
    <div className="personal-finance">
      <div className="personal-finance-text">
        <h1>Personal Finance</h1>
        <h2>Planning for the future</h2>
        <p>
          In the Basics section, we have seen that currencies&apos; purchasing
          power generally decreases over time. This has deep impacts on
          long-term personal finance projects. For instance, if the project aims
          to buy a good or service in ten years that currently costs twenty
          thousand dollars, and if we consider an arbitrary annual inflation
          rate of 2%, we need to aim for a capital of $20,000.00 &times; (1 +
          0.02)<sup>10</sup> = $24,379.89 in 10 years. That&apos;s a
          considerable 0.02 <sup>10</sup> = 21.9% increase in the amount of
          capital to set has an objective. Hence, correcting for inflation is
          key for long-term projections. And this is what we will do here.
        </p>
        <p>
          First off, a personal finance project can be characterized based on
          the following criteria, essentially:
        </p>
        <ul>
          <li>
            the amount of capital we are aiming for <em>in todays money</em>
          </li>
          <li>
            the investment horizon (when do we want to have this capital
            available?)
          </li>
          <li>
            and the risk aversion of the investor &ndash; more risk equals more
            potential gain and vice versa
          </li>
        </ul>
        <p>
          To plan projects like this, simulation is crucial and the tool below
          is designed to this effect. It requires several pieces of information
          on top of the 3 project characterstics discussed above, so we need to:
        </p>
        <ul>
          <li>
            Define the amount of capital we will invest intially and/or
            periodically
          </li>
          <li>
            Based on our risk aversion and investment horizon, select the
            asset(s) in which we will invest and the expected annual yield
          </li>
          <li>
            Understand the fees and taxes that will be applied to our investment
          </li>
          <li>Determine the annual inflation rate we expect to face</li>
          <li>
            And bare in mind that future yields and inflation rates are totally
            uncertain.
          </li>
        </ul>
        <p>
          We can now use the simulator below to obtain, between others, the net,
          post-tax, inflation-corrected capital we would have accumulated once
          the investment horizon is reached, given the parameters we have set.
        </p>
      </div>
      <h2>Simulation</h2>
      <div className="personal-finance-inputs">
        <h3>Inputs</h3>
        <AmountInput
          id="personal-finance-initial-amount-invested"
          label={`Initial amount invested ($): `}
          value={initialAmountInvested}
          setAmount={setInitialAmountInvested}
        />
        <DropDown
          id="personal-finance-recurring-investment-frequency"
          label="Recurring investment frequency: "
          options={[
            { id: "yearly", name: "Yearly" },
            { id: "monthly", name: "Monthly" },
            { id: "weekly", name: "Weekly" },
          ]}
          selectedOption="monthly"
          setSelectedOption={setRecurringInvestmentFrequency}
        />
        <AmountInput
          id="personal-finance-recurring-investment-amount"
          label={`Recurring investment amount ($): `}
          value={recurringInvestmentAmount}
          setAmount={setRecurringInvestmentAmount}
        />
        <NumberInput
          id="personal-finance-investment-duration"
          label="Investment duration (years): "
          value={investmentDuration}
          setNumber={setInvestmentDuration}
        />
        <NumberInput
          id="personal-finance-annual-gross-yield"
          label="Annual gross yield (%): "
          value={annualGrossYield}
          setNumber={setAnnualGrossYield}
        />
        <NumberInput
          id="personal-finance-annual-inflation-rate"
          label="Annual inflation rate (%): "
          value={annualInflationRate}
          setNumber={setAnnualInflationRate}
        />
        <NumberInput
          id="personal-finance-investment-buy-in-fee"
          label="Investment buy-in fee (%): "
          value={investmentBuyInFee}
          setNumber={setInvestmentBuyInFee}
        />
        <NumberInput
          id="personal-finance-annual-custody-fee"
          label="Annual custody fee (%): "
          value={annualCustodyFee}
          setNumber={setAnnualCustodyFee}
        />
        <NumberInput
          id="personal-finance-investment-sell-out-fee"
          label="Investment sell-out fee (%): "
          value={investmentSellOutFee}
          setNumber={setInvestmentSellOutFee}
        />
        <NumberInput
          id="personal-finance-tax-on-gains"
          label="Tax on gains (%): "
          value={taxOnGains}
          setNumber={setTaxOnGains}
        />
      </div>
      <div className="personal-finance-outputs">
        <h3>Outputs</h3>
        <h4>Summary</h4>
        <ul>
          <li>
            By investing ${amount_formatter.format(initialAmountInvested)} now
            and ${amount_formatter.format(recurringInvestmentAmount)}{" "}
            {recurringInvestmentFrequency}, you would constitute a net,
            post-tax, final capital of{" "}
            <strong>
              ${amount_formatter.format(summaryNetPostTaxFinalValue)}
            </strong>{" "}
            after {investmentDuration} years.
          </li>
          <li>
            In {investmentDuration} years, this amount would have the purchasing
            power of{" "}
            <strong>
              $
              {amount_formatter.format(
                summaryNetPostTaxInflationCorrectedFinalValue
              )}
            </strong>{" "}
            today.
          </li>
        </ul>
        <ul>
          <li>
            Total inflation over the investment horizon:{" "}
            {summaryTotalInflationPct}%
          </li>
        </ul>
        <ul>
          <li>Net, post-tax yield: {summaryNetPostTaxYield}%</li>
          <li>
            Net, post-tax, inflation-corrected yield:{" "}
            {summaryNetPostTaxInflationCorrectedYield}%
          </li>
        </ul>
        <ul>
          <li>
            Net, post-tax final gain: $
            {amount_formatter.format(summaryNetPostTaxFinalGain)}
          </li>
          <li>
            Net, post-tax, inflation-corrected final gain: $
            {amount_formatter.format(
              summaryNetPostTaxInflationCorrectedFinalGain
            )}
          </li>
        </ul>
        <h4>Details</h4>
        <PersonalFinanceSchema
          initialAmountInvested={detailsInitialAmountInvested}
          recurringInvestmentFrequency={detailsRecurringInvestmentFrequency}
          recurringInvestmentAmount={detailsRecurringInvestmentAmount}
          investmentDuration={investmentDuration}
          totalSpending={detailsTotalSpending}
          buyInFees={detailsBuyInFees}
          annualGrossYield={detailsAnnualGrossYield}
          totalCustodianFees={detailsTotalCustodianFees}
          sellOutFees={detailsSellOutFees}
          inflationCorrectedSellOutFees={detailsInflationCorrectedSellOutFees}
          netPreTaxFinalValue={detailsNetPreTaxFinalValue}
          netPreTaxInflationCorrectedFinalValue={
            detailsNetPreTaxInflationCorrectedFinalValue
          }
          netPreTaxFinalGain={detailsNetPreTaxFinalGain}
          netPreTaxInflationCorrectedFinalGain={
            detailsNetPreTaxInflationCorrectedFinalGain
          }
          taxOnGains={detailsTaxOnGains}
          inflationCorrectedTaxOnGains={detailsInflationCorrectedTaxOnGains}
          netPostTaxFinalGain={detailsNetPostTaxFinalGain}
          netPostTaxInflationCorrectedFinalGain={
            detailsNetPostTaxInflationCorrectedFinalGain
          }
          netPostTaxFinalValue={detailsNetPostTaxFinalValue}
          netPostTaxInflationCorrectedFinalValue={
            detailsNetPostTaxInflationCorrectedFinalValue
          }
        />
      </div>
    </div>
  );
}
