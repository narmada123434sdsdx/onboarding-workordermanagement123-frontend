import React, { useState, useEffect } from "react";
import "./css/setuppage.css";

import { apiGet, apiPost, apiPut, apiDelete } from '../../api/api';

const CreateRegion = () => {
  const [formData, setFormData] = useState({
    REGION_NAME: "",
    STATUS: "Active",
  });

  const [regions, setRegions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    REGION_NAME: "",
    STATUS: "",
  });

  // ============================
  // Fetch Regions
  // ============================
  const fetchRegions = async () => {
    try {
      const data = await apiGet("/api/region/");
      setRegions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  // ============================
  // Handle Add Input
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================
  // Handle Edit Input
  // ============================
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================
  // Add Region
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      region_name: formData.REGION_NAME,
      status: formData.STATUS,
    };

    try {
      const response = await apiPost("/api/region/", payload);

      if (response?.error) {
        alert("❌ " + response.error);
        return;
      }

      alert("✅ Region added successfully!");
      setFormData({ REGION_NAME: "", STATUS: "Active" });
      fetchRegions();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add region");
    }
  };

  // ============================
  // Start Editing
  // ============================
  const handleEdit = (region) => {
    setEditingId(region.id);
    setEditingData({
      REGION_NAME: region.region_name,
      STATUS: region.status,
    });
  };

  // ============================
  // Cancel Editing
  // ============================
  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ REGION_NAME: "", STATUS: "" });
  };

  // ============================
  // Update Region
  // ============================
  const handleUpdate = async (id) => {
    const payload = {
      region_name: editingData.REGION_NAME,
      status: editingData.STATUS,
    };

    try {
      const response = await apiPut(`/api/region/${id}`, payload);

      if (response?.error) {
        alert("❌ " + response.error);
        return;
      }

      alert("✅ Region updated!");
      setEditingId(null);
      fetchRegions();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update region");
    }
  };

  // ============================
  // Delete Region
  // ============================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this region?"))
      return;

    try {
      await apiDelete(`/api/region/${id}`);
      alert("✅ Region deleted!");
      fetchRegions();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete region");
    }
  };

  // ============================
  // Reset Form
  // ============================
  const handleReset = () => {
    setFormData({ REGION_NAME: "", STATUS: "Active" });
  };

  return (
    <div className="setup-page">
      <div className="page-container">
        
        {/* ================= Add New Region ================= */}
        <div className="box-section form-box">
          <h2>Add New Region</h2>

          <form onSubmit={handleSubmit} className="form-create">

            <div className="form-header-row">
              <div className="form-header-cell">REGION NAME</div>
              <div className="form-header-cell">STATUS</div>
            </div>

            {/* REGION NAME */}
            <div className="form-group">
              <div className="input-with-star">
                <input
                  type="text"
                  name="REGION_NAME"
                  placeholder="Enter Region Name"
                  value={formData.REGION_NAME}
                  onChange={handleChange}
                  required
                />
                <span className="required-star">★</span>
              </div>
            </div>

            {/* STATUS */}
            <div className="form-group">
              <div className="input-with-star">
                <select
                  name="STATUS"
                  value={formData.STATUS}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="required-star">★</span>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="form-actions">
              <button type="submit" className="btn-primary">Submit</button>
              <button type="button" className="btn-reset" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ================= Existing Regions Table ================= */}
        <div className="box-section table-box">
          <h2>Existing Regions</h2>

          <div className="table-wrapper">
            <div className="fixed-table">
              <table className="workorder-table">
                <thead>
                  <tr>
                    <th>Region Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {regions.length > 0 ? (
                    regions.map((region) => (
                      <tr key={region.id}>
                        {editingId === region.id ? (
                          <>
                            <td>
                              <input
                                type="text"
                                name="REGION_NAME"
                                value={editingData.REGION_NAME}
                                onChange={handleEditChange}
                              />
                            </td>

                            <td>
                              <select
                                name="STATUS"
                                value={editingData.STATUS}
                                onChange={handleEditChange}
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </td>

                            <td>
                              <button className="btn-save" onClick={() => handleUpdate(region.id)}>
                                Save
                              </button>
                              <button className="btn-cancel" onClick={handleCancel}>
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{region.region_name}</td>
                            <td>{region.status}</td>

                            <td>
                              <button className="btn-edit" onClick={() => handleEdit(region)}>
                                Edit
                              </button>
                              <button className="btn-delete" onClick={() => handleDelete(region.id)}>
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>No data available</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateRegion;
