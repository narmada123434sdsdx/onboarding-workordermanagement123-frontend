import React, { useState } from "react";
import "./css/searchworkorders.css";

// 🔥 Import API wrapper
import { apiGet, apiFetch } from "../../api/api";

const SearchWorkOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [workorder, setWorkorder] = useState(null);
  const [childWorkorders, setChildWorkorders] = useState([]);
  const [closingImages, setClosingImages] = useState([]);
  const [childFilter, setChildFilter] = useState("ALL");
  const [error, setError] = useState("");

  // ================================
  // 🔍 SEARCH WORKORDER
  // ================================
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setWorkorder(null);
      setChildWorkorders([]);
      setError("");
      return;
    }

    try {
      const data = await apiGet(
        `/api/workorders/search?query=${searchTerm}`
      );

      if (!Array.isArray(data) || data.length === 0)
        throw new Error("Workorder not found");

      // Exact match (case-sensitive backend uses lowercase keys)
      const exactMatch = data.find(
        (wo) => wo.workorder === searchTerm
      );

      const selected = exactMatch || data[0];
      setWorkorder(selected);
      setError("");

      // Always clear child workorders for now
      setChildWorkorders([]);
    } catch (err) {
      setError(err.message);
    }
  };

  // ================================
  // 👶 FETCH CHILD WORKORDERS
  // ================================
  const fetchChildWorkorders = async (parentWO) => {
    try {
      const data = await apiGet(
        `/api/workorders/childs/${parentWO}`
      );

      setChildWorkorders(
        data.filter((c) =>
          ["OPEN", "CLOSED", "ACCEPTED"].includes(
            c.status?.toUpperCase()
          )
        )
      );
    } catch (err) {
      setChildWorkorders([]);
    }
  };

  // ================================
  // 🔴 CLOSE PARENT WORKORDER
  // ================================
  const handleCloseParent = async () => {
    if (!workorder) return alert("No workorder selected!");

    if (
      childWorkorders.some(
        (c) => c.status?.toUpperCase() !== "CLOSED"
      )
    ) {
      return alert("❌ Close all child workorders first.");
    }

    if (closingImages.length === 0) {
      return alert("Upload at least 1 closing image.");
    }

    const workorderId = workorder.id;

    try {
      const formData = new FormData();
      formData.append("STATUS", "CLOSED");

      closingImages.forEach((file) =>
        formData.append("closing_images[]", file)
      );

      await apiFetch(`/api/workorders/${workorderId}`, {
        method: "PUT",
        body: formData,
      });

      alert("✅  workorder closed successfully!");

      setWorkorder((prev) => ({
        ...prev,
        status: "CLOSED",
      }));

      fetchChildWorkorders(workorder.workorder);
      setClosingImages([]);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="workorders-container">
      <h2 className="page-title">Search WorkOrder</h2>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter WorkOrder..."
          value={searchTerm}
          onInput={(e) => {
            e.target.value = e.target.value
              .toUpperCase()
              .replace(/[^0-9A-Z]/g, "");
            setSearchTerm(e.target.value);
          }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* ================================
          📄 WORKORDER DETAILS
      ================================== */}
      {workorder && (
        <div className="section-card">
          <div className="section-header">Workorder Details</div>

          <div className="section-content">

            {/* Row 1 */}
            <div className="wo-row">
              <div className="wo-header-row">
                <div>WorkOrder</div>
                <div>Region</div>
                <div>Category</div>
              </div>
              <div className="wo-value-row">
                <div>{workorder.workorder}</div>
                <div>{workorder.region_name}</div>
                <div>{workorder.category_name}</div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="wo-header-row">
              <div>Requested Time Closing</div>
              <div>Remarks</div>
              <div>Client</div>
            </div>
            <div className="wo-value-row">
              <div>
                {workorder.requested_time_close
                  ? new Date(workorder.requested_time_close).toLocaleString()
                  : "N/A"}
              </div>
              <div>{workorder.remarks || "—"}</div>
              <div>{workorder.client || "—"}</div>
            </div>

            {/* Row 3 */}
            <div className="wo-row">
              <div className="wo-header-row">
                <div>Created At</div>
                <div>Status</div>
                <div></div>
              </div>
              <div className="wo-value-row">
                <div>
                  {workorder.created_t
                    ? new Date(workorder.created_t).toLocaleString()
                    : "N/A"}
                </div>
                <div>{workorder.status}</div>
                <div></div>
              </div>
            </div>

            {/* Contractor Info */}
            <div className="section-card no-header">
              <div className="table-wrapper">
                <table className="child-table">
                  <thead>
                    <tr>
                      <th>Sl. No</th>
                      <th>WorkOrder</th>
                      <th>Contractor Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>{workorder.workorder}</td>
                      <td>{workorder.contractor_name || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CLOSE BUTTON + IMAGE UPLOAD */}
            {["OPEN", "ACCEPTED"].includes(
              workorder.status?.toUpperCase()
            ) && (
              <div className="close-section">
                <label>Upload Closing Image:</label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setClosingImages([
                      ...closingImages,
                      ...Array.from(e.target.files),
                    ])
                  }
                />

                {/* Preview Images */}
                {closingImages.length > 0 && (
                  <div className="image-preview-list">
                    {closingImages.map((file, idx) => (
                      <div key={idx} className="image-preview-item">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="preview-thumbnail"
                        />
                        <div className="file-info">
                          <span>{file.name}</span>
                          <button
                            className="remove-btn"
                            onClick={() =>
                              setClosingImages(
                                closingImages.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button className="close-btn" onClick={handleCloseParent}>
                  Close Workorder
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================
          👶 CHILD WORKORDERS
      ================================== */}
      {childWorkorders.length > 0 && (
        <div className="section-card no-header">
          <div className="table-wrapper">
            <div className="filter-box">
              <label>Filter Child Workorders: </label>
              <select
                value={childFilter}
                onChange={(e) => setChildFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <table className="child-table">
              <thead>
                <tr>
                  <th>WorkOrder</th>
                  <th>Type</th>
                  <th>Area</th>
                  <th>Requested Time Closing</th>
                  <th>Remarks</th>
                  <th>Contractor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {childWorkorders
                  .filter((c) => {
                    if (childFilter === "OPEN")
                      return c.status === "OPEN";
                    if (childFilter === "CLOSED")
                      return c.status === "CLOSED";
                    return true;
                  })
                  .map((c, i) => (
                    <tr key={i}>
                      <td>{c.workorder}</td>
                      <td>{c.type}</td>
                      <td>{c.item}</td>
                      <td>
                        {c.requested_time_close
                          ? new Date(c.requested_time_close).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>{c.remarks || "—"}</td>
                      <td>{c.contractor_name || "-"}</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Child Workorders */}
      {workorder &&
        childWorkorders.length === 0 &&
        !workorder.parent_workorder && (
          <p className="no-child-msg"></p>
        )}
    </div>
  );
};

export default SearchWorkOrder;