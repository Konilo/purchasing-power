import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Plotly from "plotly.js-dist";

import AmountInput from "./AmountInput.jsx";
import NumberInput from "./NumberInput.jsx";

import "./styles/Basics.css";

const amount_formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

export default function Basics() {
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
