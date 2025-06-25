import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data }: { data: any[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length) return;

    const grouped = d3.groups(data, (d) => d.closed_fiscal_quarter);
    const customerTypes = ["Existing Customer", "New Customer"]; // fix order
    const colorMap: Record<string, string> = {
      "Existing Customer": "#1f77b4",
      "New Customer": "#ff7f0e",
    };

    const stackedData = grouped.map(([quarter, values]) => {
      const entry: any = { quarter };
      values.forEach((v) => {
        entry[v.Cust_Type] = v.acv;
      });
      return entry;
    });

    const stackGen = d3.stack().keys(customerTypes);
    const layers = stackGen(stackedData);

    const width = 900;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 100, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear chart

    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(stackedData.map((d) => d.quarter))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(layers, (layer) => d3.max(layer, (d) => d[1])) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // draw bars
    svg
      .append("g")
      .selectAll("g")
      .data(layers)
      .join("g")
      .attr("fill", (d) => colorMap[d.key])
      .selectAll("rect")
      .data((d) => d.map((item) => ({ ...item, key: d.key })))
      .join("rect")
      .attr("x", (d) => x(d.data.quarter)!)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

    // add labels inside bars (value + %)
    svg
      .append("g")
      .selectAll("g")
      .data(layers)
      .join("g")
      .selectAll("text")
      .data((d) =>
        d.map((item) => {
          const acv = item[1] - item[0];
          const total = customerTypes.reduce(
            (sum, key) => sum + (item.data[key] || 0),
            0
          );
          const percent = total > 0 ? Math.round((acv / total) * 100) : 0;
          return {
            ...item,
            acv,
            percent,
            key: d.key,
          };
        })
      )
      .join("text")
      .attr("x", (d) => x(d.data.quarter)! + x.bandwidth() / 2)
      .attr("y", (d) => y(d[1]) + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "11px")
      .text((d) => `${formatK(d.acv)} (${d.percent}%)`);

    // total label on top
    stackedData.forEach((d) => {
      const total = customerTypes.reduce((sum, key) => sum + (d[key] || 0), 0);
      svg
        .append("text")
        .attr("x", x(d.quarter)! + x.bandwidth() / 2)
        .attr("y", y(total) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#444")
        .text(formatK(total));
    });

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => `$${(d as number) / 1000}K`));

    // X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .text("Closed Fiscal Quarter");

    // legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2 - 100}, ${height - margin.bottom + 80})`
      );

    customerTypes.forEach((type, i) => {
      const g = legend.append("g").attr("transform", `translate(${i * 140},0)`);
      g.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", colorMap[type]);
      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("fill", "#333")
        .text(type)
        .style("font-size", "13px");
    });
  }, [data]);

  return <svg ref={svgRef} />;
};

const formatK = (val: number) => `$${Math.round(val / 1000)}K`;

export default StackedBarChart;
