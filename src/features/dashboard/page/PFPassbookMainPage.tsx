import { useEffect, useRef, useState } from "react";
import TabComponent from "../../../components/dashboard/PassbookTab";
import { get } from "../../../components/common/api";
import { useLocation } from "react-router-dom";
import { CircularLoading } from "../../../components/user-registeration/Loader";
import { decryptData, encryptData } from "../../../components/common/encryption-decryption";
import { TabProvider } from "../../../components/context/TabContext";

const PFPassbookMainPage = () => {
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(false)
  const [currentUanData, setCurrentUanData] = useState<any>(null)
  const [message, setMessage] = useState({ type: '', content: '' });
  const [activeTab, setActiveTab] = useState("pf-report");
  const isMessageActive = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [processedUanNumber, setProcessedUanNumber] = useState<any>('')

  const { processedUan, openTab } = location.state || {};

  useEffect(() => {
    if (message.type) {
      isMessageActive.current = true;
      const timer = setTimeout(() => {
        setMessage({ type: "", content: "" });
        isMessageActive.current = false;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Ensure the content area scrolls to top
    }
  }, [activeTab]);

  useEffect(() => {
    if (openTab && openTab === "passbook") {
      setActiveTab("passbook");
    }
  }, [location.state]);

  const fetchUanData = async () => {
    try {
      if (!processedUanNumber) return;
      setIsLoading(true);

      const result = await get('/data/fetchByUan/' + processedUanNumber);
      localStorage.setItem('Full_Name', encryptData(result?.rawData.data?.profile.fullName))
      localStorage.setItem('user_uan', encryptData(result?.rawData.data?.profile?.UAN))
      
      if (result.status === 400) {
        setIsLoading(false);
        setMessage({ type: "error", content: result.message });
      } else {
        // set data
        setCurrentUanData(result);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ type: "error", content: 'Oops! We encountred an error fetching your report now!!' });
    }
  }

  useEffect(() => {
    if (processedUan) {
      setProcessedUanNumber(processedUan)
    } else {
      setProcessedUanNumber(decryptData(localStorage.getItem('user_uan')))
    }
  }, [location.state])

  useEffect(() => {
    // setClarityTagButton("DASHBOARD", "In a dashboard page");
    fetchUanData()
  }, [processedUanNumber])


  return (
    <>
      {isLoading && <CircularLoading />}
      {!isLoading &&
          <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 offset-md-4 "  style={{backgroundColor: "#E6ECFF",height:"100%" }}>
          <div ref={containerRef} style={{ position: "relative", minHeight: "100vh"}}>
          
            {/* Tab Content (No Scrollbar) */}
            <div style={{ paddingBottom: "90px", marginTop: "20px", overflow: "hidden" }}>
              <TabProvider>
                <TabComponent currentUanData={currentUanData} activeTab={activeTab} />

              </TabProvider>

            </div>
          </div>
        </div>
        </div>

       </div>
      }

    </>

  );
};

export default PFPassbookMainPage;