// DonutChart.tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// This componnent creates a donut chart showing ACV share per Cust_Type
const DonutChart = ({ data }: { data: any[] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 600;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear prev

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Group ACV by Cust_Type
    const acvByType: Record<string, number> = {};
    data.forEach((d) => {
      acvByType[d.Cust_Type] = (acvByType[d.Cust_Type] || 0) + d.acv;
    });

    const total = d3.sum(Object.values(acvByType));

    const color = d3
      .scaleOrdinal()
      .domain(Object.keys(acvByType))
      .range(["#1f77b4", "#ff7f0e"]); // blue and orange to match stacked chart

    const pie = d3.pie<[string, number]>().value((d) => d[1]);
    const arc = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const labelArc = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(radius * 0.85)
      .outerRadius(radius * 0.85);

    const arcs = pie(Object.entries(acvByType));

    g.selectAll("path")
      .data(arcs)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data[0])!)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // lines and labels
    const outerG = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    outerG
      .selectAll("polyline")
      .data(arcs)
      .join("polyline")
      .attr("stroke", "#999")
      .attr("fill", "none")
      .attr("points", (d) => {
        const pos = labelArc.centroid(d);
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const offset = midAngle < Math.PI ? 80 : -80;
        return [
          arc.centroid(d),
          labelArc.centroid(d),
          [pos[0] + offset, pos[1]],
        ];
      });

    outerG
      .selectAll("text")
      .data(arcs)
      .join("text")
      .attr("transform", (d) => {
        const pos = labelArc.centroid(d);
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const offset = midAngle < Math.PI ? 80 : -80;
        return `translate(${pos[0] + offset},${pos[1]})`;
      })
      .attr("text-anchor", (d) =>
        (d.startAngle + d.endAngle) / 2 < Math.PI ? "start" : "end"
      )
      .attr("alignment-baseline", "middle")
      .style("font-size", "13px")
      .style("fill", "#333")
      .text((d) => {
        const val = d.data[1];
        const pct = Math.round((val / total) * 100);
        return `$${(val / 1000).toFixed(0)}K (${pct}%)`;
      });

    // Center label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("y", -5)
      .text("Total");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "16px")
      .attr("y", 15)
      .text(`$${(total / 1000).toFixed(0)}K`);
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default DonutChart;
