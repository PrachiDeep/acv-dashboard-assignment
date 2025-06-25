import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import StackedBarChart from "./StackedBarChart";
import DonutChart from "./DonutChart";
import AcvSummaryTable from "./AcvSummaryTable";

const ACVMixDashboard = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/customer-type.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#000",
          justifyContent: "center",
          display: "flex",
        }}
      >
        Won ACV mix by Cust Type
      </Typography>

      {/* Top charts row */}
      <Grid
        container
        spacing={3}
        sx={{ flexGrow: 1, minHeight: 0, marginBottom: "2rem" }}
      >
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: 1 }}>
              <StackedBarChart data={data} />
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DonutChart data={data} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Table takes remaining space */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Card>
          <CardContent>
            <AcvSummaryTable data={data} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ACVMixDashboard;
