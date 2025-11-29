import React, { useState, useEffect } from "react";
import "./css/setuppage.css";
import { BASE_URLS } from '../../api/api';

const CreateCity = () => {
  const [formData, setFormData] = useState({
    REGION_ID: "",
    STATE_ID: "",
    CITY_NAME: "",
    STATUS: "Active",
  });

  const [regionsList, setRegionsList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [cities, setCities] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    CITY_NAME: "",
    STATUS: "",
  });

  // ================================
  // Fetch Regions
  // ================================
  const fetchRegions = async () => {
    const data = await apiGet("/api/region/");
    setRegionsList(Array.isArray(data) ? data : []);
  };

  // ================================
  // Fetch States by Region ID
  // ================================
  const fetchStatesByRegion = async (regionId) => {
    if (!regionId) {
      setStatesList([]);
      return;
    }

    const data = await apiGet(`/api/state/by-region/${regionId}`);
    setStatesList(Array.isArray(data) ? data : []);
  };

  // ================================
  // Fetch Cities
  // ================================
  const fetchCities = async () => {
    const data = await apiGet("/api/city/");
    setCities(Array.isArray(data) ? data : []);
  };

  // Initial load
  useEffect(() => {
    fetchRegions();
    fetchCities();
  }, []);

  // ================================
  // Handle Input Change
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "REGION_ID") {
      setFormData({
        ...formData,
        REGION_ID: value,
        STATE_ID: "",
      });
      fetchStatesByRegion(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditChange = (e) => {
    setEditingData({ ...editingData, [e.target.name]: e.target.value });
  };

  // ================================
  // Add City
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      region_id: formData.REGION_ID,
      state_id: formData.STATE_ID,
      city_name: formData.CITY_NAME,
      status: formData.STATUS,
    };

    const res = await apiPost("/api/city/", payload);

    if (res?.error) {
      alert("❌ " + res.error);
      return;
    }

    alert("✅ City added successfully!");
    fetchCities();

    setFormData({
      REGION_ID: "",
      STATE_ID: "",
      CITY_NAME: "",
      STATUS: "Active",
    });
    setStatesList([]);
  };

  // ================================
  // Edit City
  // ================================
  const handleEdit = (city) => {
    setEditingId(city.id);
    setEditingData({
      CITY_NAME: city.city_name,
      STATUS: city.status,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({
      CITY_NAME: "",
      STATUS: "",
    });
  };

  // ================================
  // Update City
  // ================================
  const handleUpdate = async (id) => {
    const payload = {
      city_name: editingData.CITY_NAME,
      status: editingData.STATUS,
    };

    const res = await apiPut(`/api/city/${id}`, payload);

    if (res?.error) {
      alert("❌ " + res.error);
      return;
    }

    alert("✅ City updated!");
    setEditingId(null);
    fetchCities();
  };

  // ================================
  // Delete City
  // ================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this city?")) return;

    await apiDelete(`/api/city/${id}`);

    alert("🗑️ City deleted!");
    fetchCities();
  };

  // ================================
  // Reset Form
  // ================================
  const handleReset = () => {
    setFormData({
      REGION_ID: "",
      STATE_ID: "",
      CITY_NAME: "",
      STATUS: "Active",
    });
    setStatesList([]);
  };

  // ================================
  // UI JSX
  // ================================
  return (
    <div className="setup-page create-city-page">
      <div className="page-container">

        {/* ================= Add New City ================= */}
        <div className="box-section form-box">
          <h2>Add New City</h2>

          <form className="form-create" onSubmit={handleSubmit}>
            <div className="form-header-row">
              <div className="form-header-cell">REGION NAME</div>
              <div className="form-header-cell">STATE NAME</div>
            </div>

            <div className="combined-body">
              {/* REGION */}
              <div className="form-group">
                <div className="input-with-star">
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
              </div>

              {/* STATE */}
              <div className="form-group">
                <div className="input-with-star">
                  <select
                    name="STATE_ID"
                    value={formData.STATE_ID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {statesList.map((s) => (
                      <option key={s.id} value={s.state_id}>
                        {s.state_name}
                      </option>
                    ))}
                  </select>
                  <span className="required-star">★</span>
                </div>
              </div>
            </div>

            <div className="form-header-row">
              <div className="form-header-cell">CITY NAME</div>
              <div className="form-header-cell">STATUS</div>
            </div>

            <div className="combined-body">
              {/* CITY NAME */}
              <div className="form-group">
                <div className="input-with-star">
                  <input
                    type="text"
                    name="CITY_NAME"
                    placeholder="Enter City Name"
                    value={formData.CITY_NAME}
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
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Submit</button>
              <button type="button" className="btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </form>
        </div>

        {/* ================= Existing Cities Table ================= */}
        <div className="box-section table-box">
          <h2>Existing Cities</h2>

          <div className="table-wrapper">
            <div className="fixed-table">
              <table className="workorder-table">
                <thead>
                  <tr>
                    <th>Region Name</th>
                    <th>State Name</th>
                    <th>City Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {cities.length > 0 ? (
                    cities.map((city) => (
                      <tr key={city.id}>
                        {editingId === city.id ? (
                          <>
                            <td>{city.region_name}</td>
                            <td>{city.state_name}</td>

                            <td>
                              <input
                                type="text"
                                name="CITY_NAME"
                                value={editingData.CITY_NAME}
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
                              <button className="btn-save" onClick={() => handleUpdate(city.id)}>Save</button>
                              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{city.region_name}</td>
                            <td>{city.state_name}</td>
                            <td>{city.city_name}</td>
                            <td>{city.status}</td>

                            <td>
                              <button className="btn-edit" onClick={() => handleEdit(city)}>Edit</button>
                              <button className="btn-delete" onClick={() => handleDelete(city.id)}>Delete</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>No Data</td>
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

export default CreateCity;
