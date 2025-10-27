import { useEffect, useState } from "react";
import { post } from "../../components/common/api";
import ToastMessage from "../../components/common/toast-message";

interface SoWProps {
  jsonData?: any;
  reportData?: any;
  durationDisplay?: string;
}

const SoW: React.FC<SoWProps> = ({ jsonData, reportData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [messagesBox, setMessagesBox] = useState<any[]>([]);
  const [editableMessagesBox, setEditableMessagesBox] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Fetching Report, Please wait...");

  const mobile_number = jsonData?.data?.profile?.phone;
  const historyData = jsonData?.data?.serviceHistory?.history || [];

  useEffect(() => {
    const uan = jsonData?.meta?.uan;
    if (uan && reportData?.withdrawabilityCheckupReport && historyData) {
      (async () => {
        const savedData = await fetchSavedMessages(uan);
        if (savedData) {
          const grouped = groupMessages(savedData.messages || []);
          setMessagesBox(grouped);
          setEditableMessagesBox(grouped);
        }
      })();
    }
  }, [jsonData?.meta?.uan, reportData, historyData]);

  const fetchSavedMessages = async (uan: string) => {
    try {
      const res = await post(`lead/get-message`, { uan });
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching saved messages:", error);
      return null;
    }
  };

  /** Group messages by companyName + memberId */
  const groupMessages = (data: any[]) => {
    const grouped: Record<string, any> = {};
  
    data.forEach((item) => {
      const key = `${item.companyName}-${item.memberId}`;
      if (!grouped[key]) {
        grouped[key] = {
          companyName: item.companyName,
          memberId: item.memberId,
          combinedMessages: [],
        };
      }
  
      // Push error first if exists
      if (item.errorMessagge) {
        grouped[key].combinedMessages.push({ type: "error", text: item.errorMessagge });
      }
  
      // Push POA messages after error
      if (item.messages?.length) {
        item.messages.forEach((msg: string) => {
          grouped[key].combinedMessages.push({ type: "poa", text: msg });
        });
      }
    });
  
    return Object.values(grouped);
  };
  

  const handleSave = async () => {
    setLoadingText("Report updating, please wait...");
    setLoading(true);
    try {
      const noteData = {
        uan: jsonData?.meta?.uan,
        messages: editableMessagesBox, // only one box now
      };

      const response = await post("lead/message", JSON.stringify(noteData));
      if (response?.success) {
        setMessage({
          type: "success",
          content: response.message || "Saved successfully!",
        });
        setMessagesBox(editableMessagesBox);
        setIsEditing(false);
      } else {
        setMessage({
          type: "error",
          content: response.message || "Failed to save. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setLoading(false);
      setLoadingText("Fetching Report, Please wait...");
    }
  };

  const handleSaveZohoNotes = async () => {
    setLoadingText("Zoho notes updating, please wait...");
    setLoading(true);
    try {
        const allMessages = messagesBox.flatMap((item) =>
            item.combinedMessages
              ?.filter((msg: any) => msg.type === "poa")
              .map((msg: any) => msg.text) || []
          );
      const noteData = {
        uan: jsonData?.meta?.uan,
        mobile_number,
        poaMessages: allMessages,
      };

      const response = await post("lead/zoho-notes", JSON.stringify(noteData));
      setLoading(false);

      const { success, message } = response;

      if (success) {
        setMessage({ type: "success", content: message });
      } else {
        setMessage({ type: "error", content: message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Something went wrong while calling the Zoho API.",
      });
    } finally {
      setLoading(false);
      setLoadingText("Fetching Report, Please wait...");
    }
  };

  const renderBox = (boxData: any[], editable: boolean, setEditable: any) => (
    <div className="alert alert-warning mt-4">
      {boxData.map((item, idx) => (
        <div key={idx} className="mb-3">
          <h6>
            
            {idx + 1}. {item.companyName} {item.memberId}
          </h6>
  
          {/* Display messages in Error → POA → Error → POA sequence */}
          {item.combinedMessages?.map((entry: any, mIdx: number) => {
            if (entry.type === "error") {
              return (
                <p key={mIdx} className="text-danger mb-1">
                  {entry.text}
                </p>
              );
            } else if (entry.type === "poa") {
              return editable ? (
                <textarea
                  key={mIdx}
                  className="form-control mb-2"
                  value={entry.text}
                  onChange={(e) => {
                    const newData = [...boxData];
                    newData[idx].combinedMessages[mIdx].text = e.target.value;
                    setEditable(newData);
                  }}
                  rows={2}
                />
              ) : (
                <p key={mIdx} className="mb-1">
                  {entry.text}
                </p>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
  

  return (
    <div className="container-fluid">
      {loading ? (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
          <div className="text-center p-4 bg-white rounded shadow">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">{loadingText}</p>
          </div>
        </div>
      ) : (
        <>
          {message.type && <ToastMessage message={message.content} type={message.type} />}
          <div
            className="card mb-4 p-3 position-relative"
            style={{ minHeight: "300px" }}
          >
            <div className="card-body pb-5">
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                <p>
                  Dear {jsonData?.data?.profile?.fullName} : {jsonData?.meta?.uan}
                </p>
                <p>
                  Below is the plan of action to ensure get all your issues resolved and
                  ensure that you can access your Provident Fund to the maximum.
                </p>

                {isEditing
                  ? editableMessagesBox.length > 0 &&
                    renderBox(editableMessagesBox, true, setEditableMessagesBox)
                  : messagesBox.length > 0 &&
                    renderBox(messagesBox, false, setMessagesBox)}

                <p>
                  We are committed to resolving your PF issue. You can sit back and relax
                  while we work on it. If you have any questions, please let us know.
                </p>
                <p>
                  Note: The timelines are estimates based on typical EPFO turnaround
                  times. Due to factors like server issues, they may vary slightly. We
                  will use escalation channels if there are any delays.
                </p>
              </div>
            </div>

            {/* Bottom Center Buttons */}
            <div
              className="d-flex justify-content-center gap-3"
              style={{
                position: "absolute",
                bottom: "20px",
                left: 0,
                right: 0,
              }}
            >
              <button
                className={`btn ${
                  isEditing ? "btn-secondary" : "btn-danger"
                } px-4 fw-semibold`}
                style={{ minWidth: "8rem" }}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setEditableMessagesBox(JSON.parse(JSON.stringify(messagesBox)));
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Save" : "Edit"}
              </button>
              <button
                className="btn btn-success px-4 fw-semibold"
                style={{ minWidth: "8rem" }}
                onClick={handleSaveZohoNotes}
                disabled={isEditing}
              >
                Send to Zoho
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SoW;
