import { useEffect, useState } from "react";
import { formatCurrency, parseCurrency } from "../common/currency-formatter";
import { useTab } from "../context/TabContext";
import { FaCheckCircle } from "react-icons/fa";
import { BiChevronRight } from "react-icons/bi";

const TransactionCard = (props: any) => {

  const { setActiveTab } = useTab(); // Use context

  const [, setCurrentService] = useState<any>(null)

  useEffect(() => {
    const latestCompanyData = props?.currentUanData?.rawData?.data?.serviceHistory?.history.find((item: any) => item.heading === "1")
    setCurrentService(latestCompanyData)
  }, [])

  const getLastContributionSum = () => {
    const employeeShare: any = parseCurrency(props?.currentUanData?.reportData?.lastContribution?.employeeShare)
    const employerShare: any = parseCurrency(props?.currentUanData?.reportData?.lastContribution?.employerShare)
    return (formatCurrency(employeeShare + employerShare)) || '-'
  }

  return (

<div className="card  mb-3 position-relative" 
     style={{ border: "1px solid #34A853", cursor: 'pointer',borderRadius:"1rem", backgroundColor: "#F7F9FF",}} 
     onClick={() => {
        setActiveTab("passbook");
        window.scrollTo({ top: 0, behavior: "smooth" });
     }}>
 <div className="card-body" >
  <FaCheckCircle className="fs-5 mb-1" style={{ marginTop: '-0.5rem',color:"#34A853" }} />
  <p className="cardTitle mb-0" style={{ fontWeight: 700 }}>
    Last PF Contribution <span className="" ><span style={{ fontFamily: 'roboto',color:"#34A853" }}>{getLastContributionSum() || "--"}</span></span>
  </p>
  <p className="cardBody">Received on {props?.currentUanData?.reportData?.lastContribution?.wageMonth || "-"}</p>
  <p className="text-primary mt-3 mb-0" style={{ fontSize: "0.8125rem" }}>
    View Passbook
  </p>
</div>

  <BiChevronRight size={30} className=" fs-3 position-absolute text-secondary"  style={{ top: "50%", right: "1rem", transform: "translateY(-50%)" }} />
</div>


  );
}

export default TransactionCard;