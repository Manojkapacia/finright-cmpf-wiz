import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { BsCircleFill } from "react-icons/bs";
import "../styles/dashboard.module.css"
import { parseCurrency } from "../common/currency-formatter";
import { getClosingBalance } from "../common/data-transform";

ChartJS.register(ArcElement, Tooltip, Legend);

const FundDistribution = (props: any) => {

  const [balanceDetails, setBalanceDetails] = useState<any>(null)

  // Doughnut Chart for Fund Distribution
  const [fundDistributionChartData, setFundDistributionChartData] = useState({
    labels: ["Employee Share", "Employer Share", "Pension Share", "Interest Earned"],
    datasets: [
      {
        label: "Amount",
        data: [0, 0, 0, 0],
        backgroundColor: ["#27DEBF", "#00124F", "#4880FF", "#ABD5FD"],
        hoverOffset: 4,
      },
    ],
  });

  const options: any = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "bottom",
      },
      tooltip: {
        enabled: true,
      },
    },
  };
  // End

  useEffect(() => {
    if (props?.currentUanData?.rawData) {
      const balances: any = getClosingBalance(props?.currentUanData?.rawData?.data?.passbooks)
      setBalanceDetails(balances)

      // set fund distribution chart data
      const { employeeShare, employerShare, pensionShare, interestShare } = balances;

      setFundDistributionChartData((prevData: any) => ({
        ...prevData,
        datasets: [
          {
            ...prevData.datasets[0],
            data: [
              parseCurrency(employeeShare),
              parseCurrency(employerShare),
              parseCurrency(pensionShare),
              parseCurrency(interestShare)
            ],
          },
        ],
      }));

    }
  }, [props?.currentUanData])

  return (
    <>
      <div className="d-flex align-items-center gap-1 mt-4">
        <p className="sectionTitle mb-0">Fund Analysis</p>
      </div>
      <span className="underline mb-3"></span>
      <div className="bg-white shadow-sm px-3 py-3 rounded-1 my-3">
        <p className="mb-0 cardTitle">Fund Distribution</p>
        <div className="d-flex justify-content-center align-items-center mt-3">
          <div className="doughnut-chart">
            <Doughnut data={fundDistributionChartData} options={options} />
          </div>
        </div>
        {/* <table className="table mt-3">
          <thead>
            <tr>
              <th className="fw-bold">Particular</th>
              <th className="fw-bold text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="cardBody">
                <BsCircleFill style={{ color: "#27DEBF", fontSize: "0.75rem", marginRight: "8px" }} />
                Employee Share
              </td>
              <td className="text-end">{balanceDetails?.employeeShare}</td>
            </tr>
            <tr>
              <td className="cardBody">
                <BsCircleFill style={{ color: "#00124F", fontSize: "0.75rem", marginRight: "8px" }} />
                Employer Share
              </td>
              <td className="text-end">{balanceDetails?.employerShare}</td>
            </tr>
            <tr>
              <td className="cardBody">
                <BsCircleFill style={{ color: "#4880FF", fontSize: "0.75rem", marginRight: "8px" }} />
                Pension Share
              </td>
              <td className="text-end">{balanceDetails?.pensionShare}</td>
            </tr>
            <tr>
              <td className="cardBody">
                <BsCircleFill style={{ color: "#ABD5FD", fontSize: "0.75rem", marginRight: "8px" }} />
                Interest Earned
              </td>
              <td className="text-end">{balanceDetails?.interestShare}</td>
            </tr>
          </tbody>
        </table> */}
        <table className="table mt-3">
        <thead>
            <tr>
              <th className="cardTitle">Particular</th>
              <th className="cardTitle">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="d-flex align-items-center cardBody">
                  <BsCircleFill style={{ color: "#27DEBF", fontSize: "0.75rem", marginRight: "1rem" }} />
                  <span>Employee Share</span>
                </div>
              </td>
              <td style={{ fontFamily: 'roboto' }}>
                {balanceDetails?.employeeShare || "--"}
              </td>
            </tr>
            <tr>
              <td>
                <div className="d-flex align-items-center cardBody">
                  <BsCircleFill style={{ color: "#00124F", fontSize: "0.75rem", marginRight: "1rem" }} />
                  <span>Employer Share</span>
                </div>
              </td>
              <td style={{ fontFamily: 'roboto' }}>
                {balanceDetails?.employerShare|| "--"}
              </td>
            </tr>
            <tr>
              <td>
                <div className="d-flex align-items-center cardBody">
                  <BsCircleFill style={{ color: "#4880FF", fontSize: "0.75rem", marginRight: "1rem" }} />
                  <span>Pension Share</span>
                </div>
              </td>
              <td style={{ fontFamily: 'roboto' }}>
                {balanceDetails?.pensionShare|| "--"}
              </td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'roboto' }}>
                <div className="d-flex align-items-center cardBody">
                  <BsCircleFill style={{ color: "#ABD5FD", fontSize: "0.75rem", marginRight: "1rem" }} />
                  <span>Interest Earned</span>
                </div>
              </td>
              <td style={{ fontFamily: 'roboto' }}>
                {balanceDetails?.interestShare|| "--"}
              </td>
            </tr>
          </tbody>
        </table>


      </div>

    </>
  );
};

export default FundDistribution;
