import React from "react";
import * as d3 from "d3";
import "../dashboard.css";

type DataEntry = {
  Cust_Type: string;
  closed_fiscal_quarter: string;
  acv: number;
};

const AcvSummaryTable = ({ data }: { data: DataEntry[] }) => {
  const quarters = Array.from(
    new Set(data.map((d) => d.closed_fiscal_quarter))
  ).sort();
  const customerTypes = Array.from(new Set(data.map((d) => d.Cust_Type)));

  const grouped: Record<
    string,
    Record<string, { acv: number; count: number }>
  > = {};
  const totals: Record<string, { acv: number; count: number }> = {};

  quarters.forEach((q) => {
    grouped[q] = {};
    customerTypes.forEach((ct) => {
      const entries = data.filter(
        (d) => d.closed_fiscal_quarter === q && d.Cust_Type === ct
      );
      const acv = d3.sum(entries, (d) => d.acv);
      grouped[q][ct] = { acv, count: entries.length };
    });
  });

  customerTypes.forEach((ct) => {
    const entries = data.filter((d) => d.Cust_Type === ct);
    totals[ct] = {
      acv: d3.sum(entries, (d) => d.acv),
      count: entries.length,
    };
  });

  const grandTotal = {
    acv: d3.sum(data, (d) => d.acv),
    count: data.length,
  };

  const formatMoney = (val: number) => `$${d3.format(",.0f")(val)}`;
  const formatPct = (val: number) => `${Math.round(val * 100)}%`;

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th className="cell headerDark">Closed Fiscal Quarter</th>
            {quarters.map((q, i) => (
              <th
                key={q}
                className={`cell ${i % 2 === 0 ? "headerDark" : "headerLight"}`}
                colSpan={3}
              >
                {q}
              </th>
            ))}
            <th className="cell headerDark" colSpan={3}>
              Total
            </th>
          </tr>
          <tr>
            <th className="cell"> Cust Type</th>
            {quarters.map((q) => (
              <React.Fragment key={q}>
                <th className="cell"># of Opps</th>
                <th className="cell">ACV</th>
                <th className="cell">% of Total</th>
              </React.Fragment>
            ))}
            <th className="cell"># of Opps</th>
            <th className="cell">ACV</th>
            <th className="cell">% of Total</th>
          </tr>
        </thead>
        <tbody>
          {customerTypes.map((ct) => (
            <tr key={ct}>
              <td className="cell">{ct}</td>
              {quarters.map((q) => {
                const { acv, count } = grouped[q][ct];
                const qTotal = d3.sum(
                  customerTypes.map((t) => grouped[q][t].acv)
                );
                const pct = qTotal ? acv / qTotal : 0;
                return (
                  <React.Fragment key={q}>
                    <td className="cell">{count}</td>
                    <td className="cell">{formatMoney(acv)}</td>
                    <td className="cell">{formatPct(pct)}</td>
                  </React.Fragment>
                );
              })}
              <td className="cell">{totals[ct].count}</td>
              <td className="cell">{formatMoney(totals[ct].acv)}</td>
              <td className="cell">
                {formatPct(totals[ct].acv / grandTotal.acv)}
              </td>
            </tr>
          ))}
          <tr className="totalRow">
            <td className="cell">Total</td>
            {quarters.map((q) => {
              const count = customerTypes.reduce(
                (sum, ct) => sum + grouped[q][ct].count,
                0
              );
              const acv = customerTypes.reduce(
                (sum, ct) => sum + grouped[q][ct].acv,
                0
              );
              return (
                <React.Fragment key={q}>
                  <td className="cell">{count}</td>
                  <td className="cell">{formatMoney(acv)}</td>
                  <td className="cell">100%</td>
                </React.Fragment>
              );
            })}
            <td className="cell">{grandTotal.count}</td>
            <td className="cell">{formatMoney(grandTotal.acv)}</td>
            <td className="cell">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AcvSummaryTable;
