import PropTypes from "prop-types";

export default function PersonalFinanceSchema({
  initialAmountInvested,
  recurringInvestmentFrequency,
  recurringInvestmentAmount,
  investmentDuration,
  totalSpending,
  buyInFees,
  annualGrossYield,
  totalCustodianFees,
  sellOutFees,
  inflationCorrectedSellOutFees,
  netPreTaxFinalValue,
  netPreTaxInflationCorrectedFinalValue,
  netPreTaxFinalGain,
  netPreTaxInflationCorrectedFinalGain,
  taxOnGains,
  inflationCorrectedTaxOnGains,
  netPostTaxFinalGain,
  netPostTaxInflationCorrectedFinalGain,
  inflationCorrectedTotalSpending,
  netPostTaxFinalValue,
  netPostTaxInflationCorrectedFinalValue,
}) {
  const amount_formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <svg
      width="1438"
      height="432"
      viewBox="0 0 1438 432"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Group 1">
        <rect
          id="Rectangle 4"
          x="1.5"
          y="1.5"
          width="1435"
          height="429"
          rx="23.5"
          stroke="white"
          strokeWidth="3"
        />
        <rect
          id="Rectangle 5"
          x="26.5"
          y="19.5"
          width="819"
          height="333"
          rx="23.5"
          stroke="white"
          strokeWidth="3"
        />
        <rect
          id="Rectangle 6"
          x="320.5"
          y="97.5"
          width="241"
          height="213"
          rx="23.5"
          stroke="white"
          strokeWidth="3"
        />
        <text
          id="Investment envelope"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="20"
          fontWeight="bold"
          letterSpacing="0em"
        >
          <tspan x="33" y="399.273">
            Investment envelope
          </tspan>
        </text>
        <text
          id="Broker"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="20"
          fontWeight="bold"
          letterSpacing="0em"
        >
          <tspan x="59" y="325.273">
            Broker
          </tspan>
        </text>
        <text
          id="Asset"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="20"
          fontWeight="bold"
          letterSpacing="0em"
        >
          <tspan x="347" y="288.273">
            Asset
          </tspan>
        </text>
        <text
          id="$x&#226;&#128;&#168;initial investment + $x&#226;&#128;&#168;monthly investment for n years = Total spending of $x"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="59" y="96.4545">
            ${amount_formatter.format(initialAmountInvested)}&#x2028;
          </tspan>
          <tspan x="59" y="114.455">
            initial investment&#10;
          </tspan>
          <tspan x="59" y="132.455">
            +&#10;
          </tspan>
          <tspan x="59" y="150.455">
            ${amount_formatter.format(recurringInvestmentAmount)}&#x2028;
          </tspan>
          <tspan x="59" y="168.455">
            {recurringInvestmentFrequency} investment&#10;
          </tspan>
          <tspan x="59" y="186.455">
            for {investmentDuration} years&#10;
          </tspan>
          <tspan x="59" y="204.455">
            =&#10;
          </tspan>
          <tspan x="59" y="222.455">
            Total spending of&#10;
          </tspan>
          <tspan x="59" y="240.455">
            ${amount_formatter.format(totalSpending)}
          </tspan>
        </text>
        <text
          id="$x buy-in fees"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="220" y="124.455">
            ${amount_formatter.format(buyInFees)}&#10;
          </tspan>
          <tspan x="220" y="142.455">
            buy-in fees
          </tspan>
        </text>
        <text
          id="$x custody fees"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="395" y="63.4545">
            ${amount_formatter.format(totalCustodianFees)}&#10;
          </tspan>
          <tspan x="395" y="81.4545">
            custody fees
          </tspan>
        </text>
        <text
          id="Assets owned"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="391" y="168.455">
            Assets owned
          </tspan>
        </text>
        <text
          id="Gross, annual yield of&#226;&#128;&#168;x% during the n years"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="364" y="219.455">
            Gross, annual yield of&#x2028;
          </tspan>
          <tspan x="364" y="237.455">
            {annualGrossYield}% during the {investmentDuration} years
          </tspan>
        </text>
        <text
          id="$x sell-out fees&#226;&#128;&#168;(IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="580" y="104.455">
            ${amount_formatter.format(sellOutFees)}&#10;
          </tspan>
          <tspan x="580" y="122.455">
            sell-out fees&#x2028;
          </tspan>
          <tspan x="580" y="140.455">
            (IC = ${amount_formatter.format(inflationCorrectedSellOutFees)})
          </tspan>
        </text>
        <text
          id="$x net, pre-tax,&#226;&#128;&#168;final value (IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="699" y="147.455">
            ${amount_formatter.format(netPreTaxFinalValue)}&#10;
          </tspan>
          <tspan x="699" y="165.455">
            net, pre-tax&#x2028;
          </tspan>
          <tspan x="699" y="183.455">
            value&#10;
          </tspan>
          <tspan x="699" y="201.455">
            (IC = ${amount_formatter.format(netPreTaxInflationCorrectedFinalValue)})
          </tspan>
        </text>
        <text
          id="$x net, pre-tax,&#226;&#128;&#168;final gain (IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="870" y="78.4545">
            ${amount_formatter.format(netPreTaxFinalGain)}&#10;
          </tspan>
          <tspan x="870" y="96.4545">
            net, pre-tax&#x2028;
          </tspan>
          <tspan x="870" y="114.455">
            gain&#10;
          </tspan>
          <tspan x="870" y="132.455">
            (IC = ${amount_formatter.format(netPreTaxInflationCorrectedFinalGain)})
          </tspan>
        </text>
        <text
          id="$x&#226;&#128;&#168;net, post-tax,&#226;&#128;&#168;final gain (IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="1135" y="72.4545">
            ${amount_formatter.format(netPostTaxFinalGain)}&#10;
          </tspan>
          <tspan x="1135" y="90.4545">
            net, post-tax,&#x2028;
          </tspan>
          <tspan x="1135" y="108.455">
            gain&#10;
          </tspan>
          <tspan x="1135" y="126.455">
            (IC = ${amount_formatter.format(netPostTaxInflationCorrectedFinalGain)})
          </tspan>
        </text>
        <text
          id="$x net, post-tax,&#226;&#128;&#168;final value (IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="1306" y="123.455">
            ${amount_formatter.format(netPostTaxFinalValue)}&#10;
          </tspan>
          <tspan x="1306" y="141.455">
            net, post-tax,&#x2028;
          </tspan>
          <tspan x="1306" y="159.455">
            value&#10;
          </tspan>
          <tspan x="1306" y="177.455">
            (IC = ${amount_formatter.format(netPostTaxInflationCorrectedFinalValue)})
          </tspan>
        </text>
        <text
          id="$x tax on gains (IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="999" y="44.4545">
            ${amount_formatter.format(taxOnGains)}&#10;
          </tspan>
          <tspan x="999" y="62.4545">
            tax on gains&#10;
          </tspan>
          <tspan x="999" y="80.4545">
            (IC = ${amount_formatter.format(inflationCorrectedTaxOnGains)})
          </tspan>
        </text>
        <text
          id="$x total spending (IC = $x)"
          fill="white"
          xmlSpace="preserve"
          style={{ whiteSpace: "pre" }}
          fontFamily="Inter"
          fontSize="15"
          letterSpacing="0em"
        >
          <tspan x="988" y="217.455">
            ${amount_formatter.format(totalSpending)}&#10;
          </tspan>
          <tspan x="988" y="235.455">
            total spending&#10;
          </tspan>
          <tspan x="988" y="253.455">
            (IC = ${amount_formatter.format(inflationCorrectedTotalSpending)})
          </tspan>
        </text>
        <path
          id="Arrow 8"
          d="M364.709 162.93C365.097 162.538 365.094 161.905 364.702 161.516L358.306 155.183C357.914 154.795 357.281 154.798 356.892 155.19C356.504 155.583 356.507 156.216 356.899 156.605L362.584 162.234L356.955 167.918C356.566 168.311 356.569 168.944 356.962 169.332C357.354 169.721 357.988 169.718 358.376 169.325L364.709 162.93ZM207.005 164L364.003 163.227L363.993 161.227L206.995 162L207.005 164Z"
          fill="white"
        />
        <path
          id="Arrow 9"
          d="M675.707 163.707C676.098 163.317 676.098 162.683 675.707 162.293L669.343 155.929C668.953 155.538 668.319 155.538 667.929 155.929C667.538 156.319 667.538 156.953 667.929 157.343L673.586 163L667.929 168.657C667.538 169.047 667.538 169.681 667.929 170.071C668.319 170.462 668.953 170.462 669.343 170.071L675.707 163.707ZM525 164L675 164V162L525 162V164Z"
          fill="white"
        />
        <path
          id="Arrow 10"
          d="M856 113.981C855.989 113.429 855.533 112.99 854.981 113L845.982 113.173C845.43 113.184 844.991 113.64 845.002 114.192C845.012 114.744 845.469 115.183 846.021 115.173L854.019 115.019L854.173 123.018C854.184 123.57 854.64 124.009 855.192 123.998C855.744 123.988 856.183 123.531 856.173 122.979L856 113.981ZM804.721 167.693L855.721 114.693L854.279 113.307L803.279 166.307L804.721 167.693Z"
          fill="white"
        />
        <path
          id="Arrow 11"
          d="M961.408 227.913C961.912 227.688 962.138 227.096 961.913 226.592L958.24 218.375C958.015 217.871 957.423 217.645 956.919 217.871C956.415 218.096 956.189 218.687 956.414 219.192L959.679 226.495L952.375 229.76C951.871 229.985 951.645 230.577 951.871 231.081C952.096 231.585 952.687 231.811 953.192 231.586L961.408 227.913ZM803.643 167.934L960.643 227.934L961.357 226.066L804.357 166.066L803.643 167.934Z"
          fill="white"
        />
        <path
          id="Arrow 12"
          d="M1103.71 100.707C1104.1 100.317 1104.1 99.6834 1103.71 99.2929L1097.34 92.9289C1096.95 92.5384 1096.32 92.5384 1095.93 92.9289C1095.54 93.3195 1095.54 93.9526 1095.93 94.3431L1101.59 100L1095.93 105.657C1095.54 106.047 1095.54 106.681 1095.93 107.071C1096.32 107.462 1096.95 107.462 1097.34 107.071L1103.71 100.707ZM980 101H1103V99H980V101Z"
          fill="white"
        />
        <path
          id="Arrow 13"
          d="M1293.89 167.45C1294.14 166.957 1293.94 166.356 1293.45 166.107L1285.41 162.056C1284.92 161.807 1284.32 162.005 1284.07 162.498C1283.82 162.992 1284.02 163.593 1284.51 163.841L1291.66 167.443L1288.06 174.586C1287.81 175.08 1288.01 175.681 1288.5 175.929C1288.99 176.178 1289.59 175.98 1289.84 175.487L1293.89 167.45ZM1111.31 227.95L1293.31 167.95L1292.69 166.05L1110.69 226.05L1111.31 227.95Z"
          fill="white"
        />
        <path
          id="Arrow 14"
          d="M1293.4 118.916C1293.91 118.695 1294.14 118.105 1293.92 117.599L1290.31 109.354C1290.09 108.848 1289.5 108.617 1288.99 108.838C1288.49 109.06 1288.26 109.649 1288.48 110.155L1291.68 117.485L1284.35 120.691C1283.85 120.913 1283.62 121.502 1283.84 122.008C1284.06 122.514 1284.65 122.745 1285.16 122.524L1293.4 118.916ZM1246.64 100.931L1292.64 118.931L1293.36 117.069L1247.36 99.0688L1246.64 100.931Z"
          fill="white"
        />
      </g>
    </svg>
  );
}
PersonalFinanceSchema.propTypes = {
    initialAmountInvested: PropTypes.number,
    recurringInvestmentFrequency: PropTypes.string,
    recurringInvestmentAmount: PropTypes.number,
    investmentDuration: PropTypes.number,
    totalSpending: PropTypes.number,
    buyInFees: PropTypes.number,
    annualGrossYield: PropTypes.number,
    totalCustodianFees: PropTypes.number,
    sellOutFees: PropTypes.number,
    inflationCorrectedSellOutFees: PropTypes.number,
    netPreTaxFinalValue: PropTypes.number,
    netPreTaxInflationCorrectedFinalValue: PropTypes.number,
    netPreTaxFinalGain: PropTypes.number,
    netPreTaxInflationCorrectedFinalGain: PropTypes.number,
    taxOnGains: PropTypes.number,
    inflationCorrectedTaxOnGains: PropTypes.number,
    netPostTaxFinalGain: PropTypes.number,
    netPostTaxInflationCorrectedFinalGain: PropTypes.number,
    inflationCorrectedTotalSpending: PropTypes.number,
    netPostTaxFinalValue: PropTypes.number,
    netPostTaxInflationCorrectedFinalValue: PropTypes.number,
};
