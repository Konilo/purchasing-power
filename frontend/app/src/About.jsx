import "./styles/About.css";

export default function About() {
  return (
    <div className="about">
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
