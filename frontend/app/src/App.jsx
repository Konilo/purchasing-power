import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import Plotly from "plotly.js-dist";
import PersonalFinanceSchema from "./PersonalFinanceSchema";
import "./App.css"
import "./Sidebar.css";
import "./Home.css";
import "./Basics.css";
import "./PersonalFinance.css";
import "./Footer.css";
import GitHubLogo from "./assets/github-mark-white.svg";


const amount_formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Sidebar() {
  return (
    <div className="sidebar">
      <h1>Purchasing Power</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">About</Link>
          </li>
          <li>
            <Link to="/basics">Basics</Link>
          </li>
          <li>
            <Link to="/personal_finance">Personal Finance</Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-bottom-item">
        <a
          href="https://github.com/Konilo/purchasing-power/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={GitHubLogo} alt="GitHub logo" />
        </a>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="home">
      <h1>About</h1>
      <h2>Measuring purchasing power &gt; counting dollars</h2>
      <p>
        The purchasing power of a currency unit varies over time. For
        example, in the US, the purchasing power of the US dollar fell by almost
        18% between 2020 and 2023 (USBLS,{" "}
        <a href="https://data.bls.gov/timeseries/CUUR0000SA0" target="_blank" rel="noreferrer">
          2024
        </a>
        ).
      </p>
      <p>
        Hence, focusing on purchasing power instead of mere
        units of currency is crucial for any long-term financial projection or retrospective analysis.
      </p>
      <p>
        Browse through the tabs to learn more about purchasing power and its
        evolution in a set of countries.
      </p>
    </div>
  );
}

function CpiDropdown({ selectedCpi, setSelectedCpi }) {
  const [cpiOptions, setCpiOptions] = useState([]);

  const handleSelectChange = (event) => {
    setSelectedCpi(event.target.value);
    console.log("Selected CPI:", event.target.value);
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/cpis`, {
        headers: {
          accept: "application/json",
          "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
        },
      })
      .then((response) => {
        const options = Object.entries(response.data)
          .map(([key, value]) => ({
            id: key,
            name: `${value.country_name}, ${value.cpi_name}`,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCpiOptions(options);
        console.log("Fetched CPI options");
      })
      .catch((error) => console.error("Error fetching CPI data:", error));
  }, []);

  return (
    <div>
      <label htmlFor="cpi-select">CPI to explore: </label>
      <select id="cpi-select" value={selectedCpi} onChange={handleSelectChange}>
        {cpiOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
CpiDropdown.propTypes = {
  selectedCpi: PropTypes.string.isRequired,
  setSelectedCpi: PropTypes.func.isRequired,
};

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

function CpiPlot({ selectedCpi }) {
  const [cpiValues, setCpiValues] = useState({});
  const [annualInflationRates, setAnnualInflationRates] = useState({});
  const [institution, setInstitution] = useState("");
  const [docLink, setDocLink] = useState("");
  const [legalMentions, setLegalMentions] = useState("");
  const [plotTitle, setPlotTitle] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/cpis/${selectedCpi}`, {
        headers: {
          accept: "application/json",
          "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
        },
      })
      .then((response) => {
        // in backend, for this endpoint, add country name and CPI name for the title of the plot
        setPlotTitle(
          `${response.data.country_name}, ${response.data.cpi_name}`
        );
        setCpiValues(response.data.cpi_values);
        setAnnualInflationRates(response.data.annual_inflation_rates);
        setInstitution(response.data.institution_name);
        setDocLink(response.data.documentation_link);
        setLegalMentions(response.data.legal_mentions);
        console.log("Fetched selected CPI (", selectedCpi, ") overview");
      })
      .catch((error) => console.error("Error fetching CPI data:", error));
  }, [selectedCpi]);

  useEffect(() => {
    Plotly.newPlot(
      "cpi-plot",
      [
        {
          x: Object.keys(cpiValues),
          y: Object.values(cpiValues),
          type: "scatter",
          mode: "lines+markers",
          name: "CPI Values",
          marker: { color: "#ff9900" },
        },
        {
          x: Object.keys(annualInflationRates),
          y: Object.values(annualInflationRates),
          type: "bar",
          name: "Annual Inflation Rates",
          yaxis: "y2",
          marker: { color: "#47AEA7" },
          zorder: -1,
        },
      ],
      {
        title: { text: plotTitle },
        xaxis: { title: "Year" },
        yaxis: { title: "CPI Value" },
        yaxis2: {
          title: "Annual Inflation Rate (%)",
          overlaying: "y",
          side: "right",
          showgrid: false,
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { color: "white" },
        width: 850,
        height: 500,

        annotations: [
          {
            x: 1,
            y: -0.23,
            xref: "paper",
            yref: "paper",
            text: "Source: " + institution,
            showarrow: false,
          },
        ],
      }
    );
  }, [cpiValues, plotTitle, institution, annualInflationRates]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div>
      <h3>CPI Evolution</h3>
      <div id="cpi-plot" className="plot" />
      <details>
        <summary>More information</summary>
        <ul>
          <li>
            Source: {institution}
          </li>
          <li>
            Documentation about this CPI can be found{" "}
            <a href={docLink} target="_blank" rel="noreferrer">
              here
            </a>
            .
          </li>
          <li>
            Legal mentions:{" "}
            {isValidUrl(legalMentions) ? (
              <a href={legalMentions} target="_blank" rel="noreferrer">
                {legalMentions}
              </a>
            ) : (
              legalMentions
            )}
          </li>
        </ul>
      </details>
    </div>
  );
}
CpiPlot.propTypes = {
  selectedCpi: PropTypes.string.isRequired,
};

function AmountInput({ id, label, value, setAmount }) {
  const handleAmountChange = (event) => {
    setAmount(Number(event.target.value));
  };
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" onChange={handleAmountChange} value={value} />
    </div>
  );
}
AmountInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  setAmount: PropTypes.func.isRequired,
};

function NumberInput({ id, label, value, setNumber }) {
  const handleNumberChange = (event) => {
    setNumber(Number(event.target.value));
  };
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" onChange={handleNumberChange} value={value} />
    </div>
  );
}
NumberInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  setNumber: PropTypes.func.isRequired,
};

function CpiCorrection({ selectedCpi }) {
  const [yearA, setYearA] = useState(2000);
  const [yearB, setYearB] = useState(2020);
  const [amount, setAmount] = useState(1);
  const [correctedAmount, setCorrectedAmount] = useState(0);
  const [inflationRate, setInflationRate] = useState(0);
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/cpis/${selectedCpi}/correction?year_a=${yearA}&year_b=${yearB}&amount=${amount}`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
          },
        }
      )
      .then((response) => {
        setCorrectedAmount(response.data.corrected_amount);
        setInflationRate(response.data.inflation_rate);
        setCurrency(response.data.currency);
        console.log("Fetched CPI correction");
      })
      .catch((error) => console.error("Error fetching CPI correction:", error));
  }, [selectedCpi, yearA, yearB, amount]);

return (
  <div className="cpi-correction">
    <h3>Inflation Correction</h3>
    <div className="cpi-correction-input">
      <AmountInput
        id="basics-amount"
        label={`Amount (${currency}): `}
        value={amount}
        setAmount={setAmount}
      />
      <NumberInput
        id="basics-yearA-input"
        label="Starting year: "
        value={yearA}
        setNumber={setYearA}
      />
      <NumberInput
        id="basics-yearB-input"
        label="Target year: "
        value={yearB}
        setNumber={setYearB}
      />
    </div>
    <div className="cpi-correction-output">
      <p>
        A sum of{" "}
        <strong>
          {currency}
          {amount_formatter.format(amount)}
        </strong>{" "}
        in <strong>{yearA}</strong> has the same purchasing power as{" "}
        <strong>
          {currency}
          {amount_formatter.format(correctedAmount)}
        </strong>{" "}
        in <strong>{yearB}</strong> (inflation rate ={" "}
        <strong>{inflationRate}%</strong>).
      </p>
    </div>
  </div>
);
}
CpiCorrection.propTypes = {
  selectedCpi: PropTypes.string.isRequired,
};

function Basics() {
  const [selectedCpi, setSelectedCpi] = useState("1");

  return (
    <div className="basics">
      <h1>Basics</h1>
      <h2>Consumer Price Indexes, explained</h2>
      <p>
        The purchasing power of a currency unit is measured using price indexes.
        Each country or institution defines its own price indexes. But they
        generally follow the same principle:
      </p>
      <ul>
        <li>
          A price index is defined by a set of goods and/or services, their
          respective quantities, and the type of marketplace where their price
          is probed.
        </li>
        <li>The price of this basket is measured at regular time intervals.</li>
        <li>
          A price index is also characterized by the year it uses as reference,
          called the base year. The value of the price index at a given time
          point is the ratio of the price of the basket at that time to the
          price of the basket at the base year, multiplied by 100.
        </li>
      </ul>
      <p>
        For instance, an inflation rate of 2% from 2020 to 2021 observed with a
        price index that uses 2020 as its base year means that the price of the
        basket it monitors has increased by 2% in that time frame (i.e., the CPI
        value rose from 100 to 102).
      </p>
      <p>
        Prices indexes can be categorized based on the nature of the goods and
        services they monitor. Consumer price indexes (CPIs) are one of the most
        common price indexes. They focus on <em>consumer</em> goods and
        services. When a CPI&apos;s value rises, the purchasing power of a
        currency unit decreases and the cost of living increases (on a currency
        unit basis) &ndash; that&rsquo;s <b>inflation</b>. When it drops, the
        purchasing power of a unit increases and the cost of living decreases
        (idem) &ndash; that&apos;s <b>deflation</b>.
      </p>
      <details>
        <summary>More information</summary>
        <ul>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Price_index"
              target="_blank"
              rel="noreferrer"
            >
              https://en.wikipedia.org/wiki/Price_index
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Consumer_price_index"
              target="_blank"
              rel="noreferrer"
            >
              https://en.wikipedia.org/wiki/Consumer_price_index
            </a>
          </li>
        </ul>
      </details>
      <h2>Exploration of a Consumer Price Index</h2>
      <CpiDropdown selectedCpi={selectedCpi} setSelectedCpi={setSelectedCpi} />
      <CpiPlot selectedCpi={selectedCpi} />
      <CpiCorrection selectedCpi={selectedCpi} />
    </div>
  );
}   

function PersonalFinance() {
  // Simulation inputs
  const [initialAmountInvested, setInitialAmountInvested] = useState(1000);
  const [recurringInvestmentFrequency, setRecurringInvestmentFrequency] = useState("monthly");
  const [recurringInvestmentAmount, setRecurringInvestmentAmount] = useState(1000);
  const [investmentDuration, setInvestmentDuration] = useState(10);
  const [annualGrossYield, setAnnualGrossYield] = useState(8);
  const [annualInflationRate, setAnnualInflationRate] = useState(2);
  const [investmentBuyInFee, setInvestmentBuyInFee] = useState(0.35);
  const [annualCustodyFee, setAnnualCustodyFee] = useState(0);
  const [investmentSellOutFee, setInvestmentSellOutFee] = useState(0);
  const [taxOnGains, setTaxOnGains] = useState(17.5);

  // Simulation output details
  const [summaryTotalSpending, setSummaryTotalSpending] = useState(0);
  const [summaryNetPostTaxFinalValue, setSummaryNetPostTaxFinalValue] = useState(0);
  const [summaryNetPostTaxInflationCorrectedFinalValue, setSummaryNetPostTaxInflationCorrectedFinalValue] = useState(0);
  const [summaryNetPostTaxFinalGain, setSummaryNetPostTaxFinalGain] = useState(0);
  const [summaryNetPostTaxInflationCorrectedFinalGain, setSummaryNetPostTaxInflationCorrectedFinalGain] = useState(0);
  const [summaryTotalInflationPct, setSummaryTotalInflationPct] = useState(0);
  const [summaryNetPostTaxYield, setSummaryNetPostTaxYield] = useState(0);
  const [summaryNetPostTaxInflationCorrectedYield, setSummaryNetPostTaxInflationCorrectedYield] = useState(0);

  // Simulation output details
  const [detailsInitialAmountInvested, setDetailsInitialAmountInvested] = useState(0);
  const [detailsRecurringInvestmentFrequency, setDetailsRecurringInvestmentFrequency] = useState("");
  const [detailsRecurringInvestmentAmount, setDetailsRecurringInvestmentAmount] = useState(0);
  const [detailsTotalSpending, setDetailsTotalSpending] = useState(0);
  const [detailsBuyInFees, setDetailsBuyInFees] = useState(0);
  const [detailsAnnualGrossYield, setDetailsAnnualGrossYield] = useState(0);
  const [detailsTotalCustodianFees, setDetailsTotalCustodianFees] = useState(0);
  const [detailsSellOutFees, setDetailsSellOutFees] = useState(0);
  const [detailsInflationCorrectedSellOutFees, setDetailsInflationCorrectedSellOutFees] = useState(0);
  const [detailsNetPreTaxFinalValue, setDetailsNetPreTaxFinalValue] = useState(0);
  const [detailsNetPreTaxInflationCorrectedFinalValue, setDetailsNetPreTaxInflationCorrectedFinalValue] = useState(0);
  const [detailsNetPreTaxFinalGain, setDetailsNetPreTaxFinalGain] = useState(0);
  const [detailsNetPreTaxInflationCorrectedFinalGain, setDetailsNetPreTaxInflationCorrectedFinalGain] = useState(0);
  const [detailsTaxOnGains, setDetailsTaxOnGains] = useState(0);
  const [detailsInflationCorrectedTaxOnGains, setDetailsInflationCorrectedTaxOnGains] = useState(0);
  const [detailsNetPostTaxFinalGain, setDetailsNetPostTaxFinalGain] = useState(0);
  const [detailsNetPostTaxInflationCorrectedFinalGain, setDetailsNetPostTaxInflationCorrectedFinalGain] = useState(0);
  const [detailsInflationCorrectedTotalSpending, setDetailsInflationCorrectedTotalSpending] = useState(0);
  const [detailsNetPostTaxFinalValue, setDetailsNetPostTaxFinalValue] = useState(0);
  const [detailsNetPostTaxInflationCorrectedFinalValue, setDetailsNetPostTaxInflationCorrectedFinalValue] = useState(0);


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
        setSummaryTotalSpending(response.data.summary.total_spending);
        setSummaryNetPostTaxFinalValue(response.data.summary.net_post_tax_final_value);
        setSummaryNetPostTaxInflationCorrectedFinalValue(response.data.summary.net_post_tax_inflation_corrected_final_value);
        setSummaryNetPostTaxFinalGain(response.data.summary.net_post_tax_final_gain);
        setSummaryNetPostTaxInflationCorrectedFinalGain(response.data.summary.net_post_tax_inflation_corrected_final_gain);
        setSummaryTotalInflationPct(response.data.summary.total_inflation_pct);
        setSummaryNetPostTaxYield(response.data.summary.net_post_tax_yield);
        setSummaryNetPostTaxInflationCorrectedYield(response.data.summary.net_post_tax_inflation_corrected_yield);

        setDetailsInitialAmountInvested(response.data.details.initial_amount_invested);
        setDetailsRecurringInvestmentFrequency(response.data.details.recurring_investment_frequency);
        setDetailsRecurringInvestmentAmount(response.data.details.recurring_investment_amount);
        setDetailsTotalSpending(response.data.details.total_spending);
        setDetailsBuyInFees(response.data.details.buy_in_fees);
        setDetailsAnnualGrossYield(response.data.details.annual_gross_yield);
        setDetailsTotalCustodianFees(response.data.details.total_custodian_fees);
        setDetailsSellOutFees(response.data.details.sell_out_fees);
        setDetailsInflationCorrectedSellOutFees(response.data.details.inflation_corrected_sell_out_fees);
        setDetailsNetPreTaxFinalValue(response.data.details.net_pre_tax_final_value);
        setDetailsNetPreTaxInflationCorrectedFinalValue(response.data.details.net_pre_tax_inflation_corrected_final_value);
        setDetailsNetPreTaxFinalGain(response.data.details.net_pre_tax_final_gain);
        setDetailsNetPreTaxInflationCorrectedFinalGain(response.data.details.net_pre_tax_inflation_corrected_final_gain);
        setDetailsTaxOnGains(response.data.details.tax_on_gains);
        setDetailsInflationCorrectedTaxOnGains(response.data.details.inflation_corrected_tax_on_gains);
        setDetailsNetPostTaxFinalGain(response.data.details.net_post_tax_final_gain);
        setDetailsNetPostTaxInflationCorrectedFinalGain(response.data.details.net_post_tax_inflation_corrected_final_gain);
        setDetailsInflationCorrectedTotalSpending(response.data.details.inflation_corrected_total_spending);
        setDetailsNetPostTaxFinalValue(response.data.details.net_post_tax_final_value);
        setDetailsNetPostTaxInflationCorrectedFinalValue(response.data.details.net_post_tax_inflation_corrected_final_value);

        console.log("Fetched CPI correction");
      })
      .catch((error) =>
        console.error("Error fetching CPI correction:", error)
      );
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
          power generally decreases over time. Hence, for long-term personal
          finance projects, taking inflation into account for our projections is
          essential. This is what we will do here.
        </p>
        <p>
          First off, a personal finance project can be characterized based on
          the following criteria, essentially:
          <ul>
            <li>
              the amount of capital we are aiming for <em>in todays money</em>
            </li>
            <li>
              the investment horizon (when do we want to have this capital
              available?)
            </li>
            <li>
              and the risk aversion of the investor &ndash; more risk equals
              more potential gain and vice versa
            </li>
          </ul>
        </p>
        <p>
          For instance, if the goal is to buy a good or service in ten years
          that currently costs twenty thousand dollars, and if we consider an
          arbitrary annual inflation rate of 2%, we need to aim for a capital of
          $20,000.00 &times; (1 + 0.02)<sup>10</sup> = $24,379.89 in 10 years.
        </p>
        <p>
          To plan projects like this, simulation is crucial and the simulation
          tool below is designed to this effect. It requires several pieces of
          information on top of the 3 project characterstics discussed above, so we need to:
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
            (And bare in mind that future yields and inflation rates are totally
            uncertain)
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
        <p>
          Total spending: ${amount_formatter.format(summaryTotalSpending)}{" "}
          <br />
          Net post-tax final value: $
          {amount_formatter.format(summaryNetPostTaxFinalValue)} <br />
          Net post-tax inflation-corrected final value: $
          {amount_formatter.format(
            summaryNetPostTaxInflationCorrectedFinalValue
          )}{" "}
          <br />
          Net post-tax final gain: $
          {amount_formatter.format(summaryNetPostTaxFinalGain)} <br />
          Net post-tax inflation-corrected final gain: $
          {amount_formatter.format(
            summaryNetPostTaxInflationCorrectedFinalGain
          )}{" "}
          <br />
          Total inflation: {summaryTotalInflationPct}% <br />
          Net post-tax yield: {summaryNetPostTaxYield}% <br />
          Net post-tax inflation-corrected yield:{" "}
          {summaryNetPostTaxInflationCorrectedYield}% <br />
        </p>
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
          inflationCorrectedTotalSpending={
            detailsInflationCorrectedTotalSpending
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

function Footer() {
  return (
    <div>
      <p>
        &copy; 2024{" "}
        <a href="https://linktr.ee/konilozio" target="_blank" rel="noreferrer">
          Konilo Zio
        </a>
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/basics" element={<Basics />} />
            <Route path="/personal_finance" element={<PersonalFinance />} />
          </Routes>
          <footer className="footer">
            <Footer />
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
