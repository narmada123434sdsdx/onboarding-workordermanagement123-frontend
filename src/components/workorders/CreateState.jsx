import React, { useState, useEffect } from "react";
import "./css/setuppage.css";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api/api";

const CreateState = () => {
  const [formData, setFormData] = useState({
    REGION_ID: "",
    STATE_NAME: "",
    STATUS: "Active",
  });

  const [states, setStates] = useState([]);
  const [regionsList, setRegionsList] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    STATE_NAME: "",
    STATUS: "",
  });

  // ===============================
  // FETCH REGIONS (Dropdown)
  // ===============================
  const fetchRegionsList = async () => {
    try {
      const data = await apiGet("/api/region/");
      setRegionsList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching regions:", e);
    }
  };

  // ===============================
  // FETCH STATES (Joined Region Name)
  // ===============================
  const fetchStates = async () => {
    try {
      const data = await apiGet("/api/state/");
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  useEffect(() => {
    fetchRegionsList();
    fetchStates();
  }, []);

  // ===============================
  // ADD FORM CHANGE
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===============================
  // EDIT FORM CHANGE
  // ===============================
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  // ===============================
  // ADD STATE
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      region_id: formData.REGION_ID,
      state_name: formData.STATE_NAME,
      status: formData.STATUS,
    };

    try {
      const response = await apiPost("/api/state/", payload);

      if (response?.error) {
        alert("❌ " + response.error);
        return;
      }

      alert("✅ State added successfully!");
      fetchStates();
      setFormData({ REGION_ID: "", STATE_NAME: "", STATUS: "Active" });
    } catch (e) {
      console.error(e);
      alert("❌ Failed to add state");
    }
  };

  // ===============================
  // START EDIT
  // ===============================
  const handleEdit = (state) => {
    setEditingId(state.id);
    setEditingData({
      STATE_NAME: state.state_name,
      STATUS: state.status,
    });
  };

  // ===============================
  // CANCEL EDIT
  // ===============================
  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ STATE_NAME: "", STATUS: "" });
  };

  // ===============================
  // UPDATE STATE
  // ===============================
  const handleUpdate = async (id) => {
    const payload = {
      state_name: editingData.STATE_NAME,
      status: editingData.STATUS,
    };

    try {
      const response = await apiPut(`/api/state/${id}`, payload);

      if (response?.error) {
        alert("❌ " + response.error);
        return;
      }

      alert("✅ State updated!");
      setEditingId(null);
      fetchStates();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update");
    }
  };

  // ===============================
  // DELETE STATE
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this state?")) return;

    try {
      await apiDelete(`/api/state/${id}`);
      alert("✅ State deleted!");
      fetchStates();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete");
    }
  };

  // ===============================
  // RESET FORM
  // ===============================
  const handleReset = () => {
    setFormData({ REGION_ID: "", STATE_NAME: "", STATUS: "Active" });
  };

  return (
    <div className="setup-page">
      <div className="page-container">

        {/* ================= Add New State ================= */}
        <div className="box-section form-box">
          <h2>Add New State</h2>

          <form onSubmit={handleSubmit} className="form-create">
            <div className="form-header-row">
              <div className="form-header-cell">REGION NAME</div>
              <div className="form-header-cell">STATE NAME</div>
              <div className="form-header-cell">STATUS</div>
            </div>

            <div className="combined-body">
              {/* REGION DROPDOWN */}
              <div className="form-group required-wrapper">
                <select
                  name="REGION_ID"
                  value={formData.REGION_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Region</option>
                  {regionsList.map((r) => (
                    <option key={r.id} value={r.region_id}>
                      {r.region_name}
                    </option>
                  ))}
                </select>
                <span className="required-star">★</span>
              </div>

              {/* STATE INPUT */}
              <div className="form-group required-wrapper">
                <input
                  type="text"
                  name="STATE_NAME"
                  placeholder="Enter State Name"
                  value={formData.STATE_NAME}
                  onChange={handleChange}
                  required
                />
                <span className="required-star">★</span>
              </div>

              {/* STATUS DROPDOWN */}
              <div className="form-group required-wrapper">
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

            <div className="form-actions">
              <button type="submit" className="btn-primary">Submit</button>
              <button type="button" className="btn-reset" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ================= States Table ================= */}
        <div className="box-section table-box">
          <h2>Existing States</h2>

          <div className="table-wrapper">
            <div className="fixed-table">
              <table className="workorder-table">
                <thead>
                  <tr>
                    <th>Region Name</th>
                    <th>State Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {states.length > 0 ? (
                    states.map((state) => (
                      <tr key={state.id}>
                        {editingId === state.id ? (
                          <>
                            <td>{state.region_name}</td>

                            <td>
                              <input
                                type="text"
                                name="STATE_NAME"
                                value={editingData.STATE_NAME}
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
                              <button
                                className="btn-save"
                                onClick={() => handleUpdate(state.id)}
                              >
                                Save
                              </button>
                              <button className="btn-cancel" onClick={handleCancel}>
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{state.region_name}</td>
                            <td>{state.state_name}</td>
                            <td>{state.status}</td>

                            <td>
                              <button
                                className="btn-edit"
                                onClick={() => handleEdit(state)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(state.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>No Data</td>
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

export default CreateState;
