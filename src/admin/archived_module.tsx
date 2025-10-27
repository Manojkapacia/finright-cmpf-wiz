import React, { useEffect, useState } from 'react';
import SidebarLayout from './SidebarLayout';
import { post } from '../components/common/api';
import { Eye } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

interface ArchiveFlatEntry {
  data: {
    meta: {
      uan: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const ArchivedModule: React.FC = () => {
  const [archiveData, setArchiveData] = useState<ArchiveFlatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uanFilter, setUanFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchArchiveLogs(currentPage);
  }, [currentPage]);

  const fetchArchiveLogs = async (page: number) => {
    try {
      setLoading(true);
      const response = await post("/admin/archive-logs", {
        type: "epfo_raw_data",
        page,
        limit: ITEMS_PER_PAGE,
      });

      setArchiveData(response?.results || []);
      setTotalPages(response?.pages || 1);
      generateVisiblePages(response?.page || 1, response?.pages || 1);
    } catch (err) {
      console.error(err);
      setError("No Data Found");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (_uan: string, entry: ArchiveFlatEntry) => {
    navigate('/operation/uan-list', {
      state: {
        fromArchive: true,
        archiveData: entry.data,
      },
    });
  };

  const generateVisiblePages = (current: number, total: number) => {
    let pages: number[] = [];

    if (total <= 5) {
      pages = Array.from({ length: total }, (_, i) => i + 1);
    } else {
      if (current <= 3) {
        pages = [1, 2, 3, 4, 5];
      } else if (current >= total - 2) {
        pages = [total - 4, total - 3, total - 2, total - 1, total];
      } else {
        pages = [current - 2, current - 1, current, current + 1, current + 2];
      }
    }

    setVisiblePages(pages);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredData = archiveData.filter((entry) =>
    entry.data?.meta?.uan?.toLowerCase().includes(uanFilter.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-md-10">
          <h2 className="text-2xl font-semibold mb-6 text-center mt-2">Archived EPFO Data</h2>

          {loading && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
              <div className="text-center p-4 bg-white rounded shadow">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Fetching Data, Please wait...</p>
              </div>
            </div>
          )}

          {error && <p className="text-danger text-center">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-3 d-flex justify-content-end gap-2">
                <input
                  type="text"
                  className="form-control w-25"
                  placeholder="Search by UAN"
                  value={uanFilter}
                  onChange={(e) => setUanFilter(e.target.value)}
                />
                {uanFilter && (
                  <button className="btn btn-secondary" onClick={() => setUanFilter('')}>
                    Clear
                  </button>
                )}
              </div>

              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Sr No</th>
                    <th className="text-center">UAN</th>
                    <th className="text-center">Archived At</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (filteredData.map((entry, index) => (
                    <tr key={index} className="text-center hover:bg-gray-50">
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td>{entry.data?.meta?.uan}</td>
                      <td>{new Date(entry.createdAt).toLocaleString()}</td>
                      <td>
                        <Eye
                          size={20}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleView(entry.data.meta.uan, entry)}
                        />
                      </td>
                    </tr>
                  ))

                ): (
                        <tr>
                          <td colSpan={6} className="text-center">No Data Found!!</td>
                        </tr>
                      )}
                </tbody>
              </table>
            </>
          )}

          {!loading && totalPages > 1 && (
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-end">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {visiblePages.map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(page)}>
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ArchivedModule;
