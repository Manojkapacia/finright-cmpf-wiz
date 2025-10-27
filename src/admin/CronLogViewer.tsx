import React, { useEffect, useState } from 'react';
import SidebarLayout from './SidebarLayout';
import { get } from '../components/common/api';
import { Eye, ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from 'react-router-dom';

interface CronSummary {
  cron_completed_at: string | null;
  cronId: string;
  cron_type: string;
  cron_run_at: string;
  total_success: number;
  total_failure: number;
}

interface CronLogEntry {
  mobile: number;
  checkMyPfMatchedCount: number;
  passbookSuccessCount: number;
  uanFetchedCount: number;
  cron_name: string;
  cron_initiated_at: string;
  uan: string;
  status: 'Success' | 'Failed';
  message: string;
  mobileNumber: string;
  grievanceNumber: string;
  
}

const CRON_TABLE_CONFIG: Record<
  string,
  {
    columns: { key: string; label: string; className?: string }[];
    showAction: boolean;
    actionType?: 'modal' | 'navigate';
  }
> = {
  late_night_scrap_retry: {
    columns: [
      { key: 'total_success', label: 'Total Success', className: 'text-success' },
      { key: 'total_failure', label: 'Total Failure', className: 'text-danger' },
      { key: 'cron_completed_at', label: 'Completed At', className: 'text-black' }, 
    ],
    showAction: true,
    actionType: 'modal',
  },
  epfo_data_archive_cron: {
    columns: [
      { key: 'total_success', label: 'Total Archived', className: 'text-success' },
      { key: 'message', label: 'Message', className: 'text-primary' },
    ],
    showAction: true,
    actionType: 'navigate',
  },
  archive_logs: {
    columns: [
      { key: 'total_success', label: 'Scrapping Metrices', className: 'text-success' },
      { key: 'total_failure', label: 'Scrapping Logs', className: 'text-warning' },
    ],
    showAction: false,
  },
  bulk_passbook_fetch: {
    columns: [
      { key: 'total_success', label: 'Total Passbook success', className: 'text-success' },
      { key: 'total_failure', label: 'Total Passbook Failure', className: 'text-danger' },
      { key: 'total_lead_count', label: 'Total Lead Update', className: 'text-success' },      
    ],
    showAction: true,
    actionType: 'modal',
  },
  daily_whatsapp_report: {
    columns: [
      { key: 'total_success', label: 'Total Success', className: 'text-success' },
      { key: 'total_failure', label: 'Total Failure', className: 'text-danger' },
    ],
    showAction: false,
  },
  grievance_logs: {
    columns: [
      { key: 'total_success', label: 'Total Success', className: 'text-success' },
      { key: 'total_failure', label: 'Total Failure', className: 'text-danger' },
    ],
    showAction: true,
    actionType: 'modal',
  },
  claim_tracker_cron: {
    columns: [
      { key: 'total_success', label: 'Total Success', className: 'text-success' },
      { key: 'total_failure', label: 'Total Failure', className: 'text-danger' },
      { key: 'cron_completed_at', label: 'Completed At', className: 'text-black' }, 
    ],
    showAction: true,
    actionType: 'modal',
  },
};

// Mapping backend values to user-friendly labels
const CRON_TYPE_LABELS: Record<string, string> = {
  late_night_scrap_retry: 'Scrap failed login Cron',
  archive_logs: ' Archive old logs cron',
  bulk_passbook_fetch: ' Bulk Passbook fetch Cron',
  epfo_data_archive_cron: ' Archive old EPFO raw data cron',
  daily_whatsapp_report: 'WhatsApp Report message cron',
  grievance_logs: 'Grievance Tracker cron',
  claim_tracker_cron: 'Claim Tracker cron'
};

const CRON_TYPES = Object.keys(CRON_TYPE_LABELS);

const CronLogViewer: React.FC = () => {
  const [summaryLogs, setSummaryLogs] = useState<CronSummary[]>([]);
  const [selectedType, setSelectedType] = useState<string>('late_night_scrap_retry');

  const [selectedCronId, setSelectedCronId] = useState<string | null>(null);
  const [detailedLogs, setDetailedLogs] = useState<CronLogEntry[]>([]);
  const [uanFilter, setUanFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const fetchSummary = async (cronType: string) => {
    setLoading(true);
    setError('');
    try {
      const query = cronType ? `?cronType=${encodeURIComponent(cronType)}` : '';
      const response = await get(`/admin/cron-logs/summary${query}`);
      setSummaryLogs(response?.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch cron summary');
      setSummaryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedType);
  }, [selectedType]);

  useEffect(() => {
    if (!selectedCronId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await get(`/admin/cron-logs/flattened?cronId=${selectedCronId}`);
        if(response?.data){
          setDetailedLogs(response?.data || []);
        }
        else{
          setDetailedLogs(response || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch detailed logs');
        setDetailedLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedCronId]);

  const filteredLogs = selectedType === 'bulk_passbook_fetch'
    ? detailedLogs
    : detailedLogs.filter(log =>
      log.uan?.toLowerCase().includes(uanFilter.toLowerCase())
    );


  const handleBackButtonClick = () => {
    setSelectedCronId(null);
    setUanFilter('');
  };

  return (
    <SidebarLayout>
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-md-11">
          <h2 className="text-2xl font-semibold mb-4 text-center mt-2">
            {selectedCronId ? `${CRON_TYPE_LABELS[selectedType]} Logs` : 'Cron Run Summary'}
          </h2>

          {loading && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
              <div className="text-center p-4 bg-white rounded shadow">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Fetching Logs, Please wait...</p>
              </div>
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && (
            <>
              {selectedCronId ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <button className="btn p-0 d-flex align-items-center my-3" onClick={handleBackButtonClick}>
                      <ArrowLeft size={20} className="me-1" /> Back
                    </button>

                    {selectedType === 'late_night_scrap_retry' || selectedType === 'claim_tracker_cron' && (
                      <input
                        type="text"
                        className="form-control w-25"
                        placeholder="Search by UAN"
                        value={uanFilter}
                        onChange={(e) => setUanFilter(e.target.value)}
                      />
                    )}
                  </div>
                  {selectedType === "grievance_logs" && (
                    <table className="table table-hover">
                      <thead className="table-light text-center">
                        <tr>
                          <th>Sr No</th>
                          <th>Mobile Number</th>
                          <th>Reference ID</th>
                          <th>Message</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedLogs.length > 0 ? (
                          detailedLogs.map((log, index) => (
                            <tr key={index} className="text-center">
                              <td>{index + 1}</td>
                              <td>{log?.mobileNumber}</td>
                              <td>{log?.grievanceNumber}</td>
                              <td style={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>{log?.message}</td>
                              <td className={log?.status === 'Success' ? 'text-success' : 'text-danger'}>
                                {log?.status}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center">No Data Found!!</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {selectedType === 'bulk_passbook_fetch' && (
                    <table className="table table-hover">
                      <thead className="table-light text-center">
                        <tr>
                          <th>Sr No</th>
                          <th>UAN</th>
                          <th>Mobile Number</th>
                          <th>Status</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {detailedLogs.map((log, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td> {/* Proper serial no */}
                            <td>{log.uan || "—"}</td>
                            <td>{log.mobile || "—"}</td>
                            <td className={log.status === 'Success' ? 'text-success' : 'text-danger'}>
                                  {log.status}
                                </td>
                            <td>{log.message || "—"}</td>
                          </tr>
                        ))}
                        {detailedLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center">No Data Found!!</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}


                    {selectedType !== 'grievance_logs' && selectedType !== 'bulk_passbook_fetch' && (
                      <table className="table table-hover">
                        <thead className="table-light text-center">
                          <tr>
                            <th>Sr No</th>
                            <th>UAN</th>
                            <th>Status</th>
                            <th>Message</th>
                            <th>Initiated At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                              <tr key={index} className="text-center">
                                <td>{index + 1}</td>
                                <td>{log.uan}</td>
                                <td className={log.status === 'Success' ? 'text-success' : 'text-danger'}>
                                  {log.status}
                                </td>
                                <td style={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>
                                  {log.message || '—'}
                                </td>
                                <td>{new Date(log.cron_initiated_at).toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center">No Data Found!!</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                </>
              ) : (
                <>
                  {/* Dropdown filter */}
                  <div className="d-flex justify-content-end mb-3">
                    <select
                      className="form-select w-25"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {CRON_TYPES.map((type) => (
                        <option key={type} value={type}>{CRON_TYPE_LABELS[type]}</option>
                      ))}
                    </select>
                  </div>

                  <table className="table table-striped table-hover text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Sr No</th>
                        <th>Cron Type</th>
                        <th>Cron Run At</th>
                        {CRON_TABLE_CONFIG[selectedType]?.columns.map((col, i) => (
                          <th key={i}>{col.label}</th>
                        ))}
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryLogs.length > 0 ? (
                        summaryLogs.map((cron, index) => {
                          const config = CRON_TABLE_CONFIG[cron.cron_type];

                          return (
                            <tr key={cron.cronId}>
                              <td>{index + 1}</td>
                              <td>{CRON_TYPE_LABELS[cron.cron_type] || cron.cron_type}</td>
                              <td>{new Date(cron.cron_run_at).toLocaleString()}</td>

                              {/* Dynamic columns */}
                              {config?.columns.map((col, i) => (
                                <td key={i} className={col.className}>
                                  {col.key === 'message'
                                    ? 'Archive completed successfully'
                                    : col.key === 'cron_completed_at'
                                      ? (cron.cron_completed_at
                                        ? new Date(cron.cron_completed_at).toLocaleString()
                                        : '—')
                                      : cron[col.key as keyof typeof cron]}
                                </td>
                              ))}

                              {/* Dynamic action */}
                              <td>
                                {config?.showAction ? (
                                  config.actionType === 'navigate' ? (
                                    <Eye
                                      size={20}
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        navigate(`/operation/archived-module`)
                                      }
                                    />
                                  ) : (
                                    <Eye
                                      size={20}
                                      style={{ cursor: "pointer" }}
                                      onClick={() => setSelectedCronId(cron.cronId)}
                                    />
                                  )
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">No Data Found!!</td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CronLogViewer;
