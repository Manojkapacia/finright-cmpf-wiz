import "../styles/dashboard.module.css";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BsCircleFill } from "react-icons/bs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FundGrowthChart = (props: any) => {
  const [fundYears, setFundYears] = useState<any>(null)

  // Line Chart for Fund Growth
  const [fundGrowthChartData, setFundGrowthChartData] = useState({
    labels: ["FY22", "FY23", "FY24"], // X-axis labels
    datasets: [
      {
        label: "Employee Share",
        data: [0, 0, 0],
        borderColor: "#27DEBF",
        fill: false
      },
      {
        label: "Employer Share",
        data: [0, 0, 0],
        borderColor: "#00124F",
        fill: false
      },
      {
        label: "Pension Share",
        data: [0, 0, 0],
        borderColor: "#4880FF",
        fill: false
      },
      {
        label: "Interest Share",
        data: [0, 0, 0],
        borderColor: "#ABD5FD",
        fill: false
      }
    ],
  });

  const optionsFundGrowth: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: false
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        // stacked: true,
        // suggestedMax: 100000,
        ticks: {
          callback: function (value: any) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(0) + 'M'; // Million
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K'; // Thousand
            } else {
              return value; // Direct number
            }
          }
        }
      },
    },
  };
  // End

  const generateChartData = (data: any) => {
    if (!data || typeof data !== "object") {
      return { labels: [], datasets: [] }; // Return empty data if undefined/null
    }

    const labels = Object.keys(data).map((year: any) => `AY'${year.slice(-2)}`);

    const datasets = [
      {
        label: "Employee Share",
        data: Object.values(data).map((item: any) => item?.totalEmployeeShare || 0),
        borderColor: "#27DEBF",
        fill: false
      },
      {
        label: "Employer Share",
        data: Object.values(data).map((item: any) => item?.totalEmployerShare || 0),
        borderColor: "#00124F",
        fill: false
      },
      {
        label: "Pension Share",
        data: Object.values(data).map((item: any) => item?.totalPensionShare || 0),
        borderColor: "#4880FF",
        fill: false
      },
      {
        label: "Interest Share",
        data: Object.values(data).map((item: any) => item?.totalInterestShare || 0),
        borderColor: "#ABD5FD",
        fill: false
      }
    ];

    return { labels, datasets };
  };


  // useEffect(() => {
  //   const chartData = generateChartData(props?.currentUanData?.reportData?.fundValues);
  //   setFundGrowthChartData(chartData)

  //   setFundYears(Object?.keys(props?.currentUanData?.reportData?.fundValues));
  // }, [])
  useEffect(() => {
    const fundValues = props?.currentUanData?.reportData?.fundValues;

    if (fundValues && typeof fundValues === "object") {
      const chartData = generateChartData(fundValues);
      setFundGrowthChartData(chartData);

      setFundYears(Object.keys(fundValues));
    }
  }, [props?.currentUanData?.reportData?.fundValues]);


  return (
    <div className="bg-white mt-3 px-3 py-3 shadow-sm " style={{borderRadius:"1rem"}}>
      <p className="mb-0 cardTitle">Fund Growth </p>

      <div className="d-flex justify-content-center align-items-center mt-3">
        <div className="w-100">
          <Line data={fundGrowthChartData} options={optionsFundGrowth} />
        </div>
      </div>
      <div className="table-responsive mt-3">
        <table className="table">
          <thead>
            <tr>
              <th className="cardTitle">Particular</th>
              {fundYears?.map((year: any) => (
                <th key={year} className="cardTitle">AY'{year.slice(-2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Amount You Contributed", color: "#27DEBF", key: "totalEmployeeShare" },
              { label: "Amount Contributed by Employer", color: "#00124F", key: "totalEmployerShare" },
              { label: "Pension Accumulated", color: "#4880FF", key: "totalPensionShare" },
              { label: "Interest Earned", color: "#ABD5FD", key: "totalInterestShare" },
            ].map((item, index) => (
              <tr key={index}>
                <td className="cardBody">
                  <div className="d-flex align-items-center gap-2">
                    <BsCircleFill style={{ color: item.color, fontSize: "0.75rem" }} />
                    <span className="text-nowrap">{item.label}</span>
                  </div>
                </td>

                {fundYears?.map((year: any) => (
                  <td key={year} className="cardBody" style={{fontFamily:'roboto'}}>
                    <span>₹{props?.currentUanData?.reportData?.fundValues[year][item.key].toLocaleString()}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>

  );
};

export default FundGrowthChart;

