import { useEffect, useState } from "react";
import { ArrowLeft } from 'react-bootstrap-icons';
import './style/transfer.css'
import { get } from "../../components/common/api";
import { useNavigate } from "react-router-dom";
interface TransferProps {
    uan: string; // Assuming UAN is a string
    onBack: () => void; // Assuming onBack is a function
}
function Transfer({ uan, onBack }: TransferProps) {
    const [transferData, setTransferData] = useState([])
    // const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        async function fetchTransferTable() {
            // setLoading(true);
            try {
                const response = await get(`/admin/getTransferLodgeTable/${uan}`)
                if (response.status === 401) {
                    localStorage.removeItem('admin_logged_in');
                    navigate('/operation/login');
                } else {
                    setTransferData(response);
                }
            } catch (error) {
                setTransferData([])
            } finally {
                // setLoading(false); 
            }
        }
        fetchTransferTable()
    }, []);

    return (
        <>
            <button className="btn p-0 d-flex align-items-center mt-5 mb-md-3" onClick={onBack}>
                <ArrowLeft size={20} className="me-1" /> Back
            </button>
            <div className="data-table-container">
                <h4 className="text-center">Transfer Table</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Member Id (From)</th>
                            <th>Claim ID</th>
                            <th>Amount</th>
                            <th>Approved Date</th>
                            <th>Type</th>
                            <th>Is Member Id (From) Trust?</th>
                            <th>Employed in Trust on Date of Transaction Approved?</th>
                            <th>Member Id (To)</th>
                            <th>Transaction Date</th>
                            <th>Transfer Employee Share</th>
                            <th>Transfer Employer Share</th>
                            <th>Pension Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transferData && transferData.length ? transferData.map((row, index) => (
                            <tr key={index}>
                                <td>{row["Member Id (From)"] || "N/A"}</td>
                                <td>{row["Claim ID"] || "N/A"}</td>
                                <td>{row["Amount"] || "N/A"}</td>
                                <td>{row["Approved Date"] || "N/A"}</td>
                                <td>{row["Type"] || "N/A"}</td>
                                <td>{row["Is Member Id (From) Trust?"] || "N/A"}</td>
                                <td>{row["Employed in Trust on Date of Transaction Approved?"] || "N/A"}</td>
                                <td>{row["Member Id (To)"] || "N/A"}</td>
                                <td>{row["Transaction Date"] || "N/A"}</td>
                                <td>{row["Transfer Employee Share"] || "N/A"}</td>
                                <td>{row["Transfer Employer Share"] || "N/A"}</td>
                                <td>{row["Pension Share"] || "N/A"}</td>
                            </tr>
                        )): <tr>
                                <td colSpan={12} className="text-center">No Transfer Found!</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Transfer;