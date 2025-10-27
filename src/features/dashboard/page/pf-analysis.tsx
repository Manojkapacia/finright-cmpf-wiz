import FundDistribution from "../../../components/dashboard/FundDistribution";
import FundGrowthChart from "../../../components/dashboard/FundGrowth";
import PfAnalysisPensionReport from "../../../components/dashboard/PfAnalysisPensionReport";
import "../styles/pf-analysis.css";

const PfAnalysis = (props: any) => {
  return (
    <>
      <div >
        
       
            <FundDistribution currentUanData={props?.currentUanData} />
            <FundGrowthChart currentUanData={props?.currentUanData} />
            <PfAnalysisPensionReport currentUanData={props?.currentUanData}/>
     
        
      </div>
    </>
  );
};

export default PfAnalysis;
