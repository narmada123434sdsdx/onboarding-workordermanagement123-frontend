import React, { useEffect, useState } from "react";
import "./css/setuppage.css";
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/api';

const DescriptionPage = () => {
  const [formData, setFormData] = useState({
    DESCRIPTION: "",
    CATEGORY_ID: "",
    ITEM_ID: "",
    TYPE_ID: "",
    STATUS: "Active",
  });

  const [descriptions, setDescriptions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [itemsAll, setItemsAll] = useState([]);
  const [typesAll, setTypesAll] = useState([]);

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    DESCRIPTION: "",
    CATEGORY_ID: "",
    ITEM_ID: "",
    TYPE_ID: "",
    STATUS: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cat = await apiGet("/api/category");
    const desc = await apiGet("/api/description");
    const allItems = await apiGet("/api/items");
    const allTypes = await apiGet("/api/types");

    setCategories(Array.isArray(cat) ? cat : []);
    setDescriptions(Array.isArray(desc) ? desc : []);
    setItemsAll(Array.isArray(allItems) ? allItems : []);
    setTypesAll(Array.isArray(allTypes) ? allTypes : []);
  };

  const fetchItemsForCategory = async (categoryId) => {
    if (!categoryId) {
      setItems([]);
      return;
    }
    const data = await apiGet(`/api/items/${categoryId}`);
    setItems(Array.isArray(data) ? data : []);
  };

  const fetchTypesForCategoryItem = async (categoryId, itemId) => {
    if (!categoryId || !itemId) {
      setTypes([]);
      return;
    }
    const data = await apiGet(
      `/api/types/filter?category_id=${categoryId}&item_id=${itemId}`
    );
    setTypes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (formData.CATEGORY_ID) fetchItemsForCategory(formData.CATEGORY_ID);
    else setItems([]);
  }, [formData.CATEGORY_ID]);

  useEffect(() => {
    if (formData.CATEGORY_ID && formData.ITEM_ID)
      fetchTypesForCategoryItem(formData.CATEGORY_ID, formData.ITEM_ID);
    else setTypes([]);
  }, [formData.ITEM_ID, formData.CATEGORY_ID]);

  useEffect(() => {
    if (editingId && editingData.CATEGORY_ID)
      fetchItemsForCategory(editingData.CATEGORY_ID);
  }, [editingData.CATEGORY_ID, editingId]);

  useEffect(() => {
    if (editingId && editingData.CATEGORY_ID && editingData.ITEM_ID)
      fetchTypesForCategoryItem(
        editingData.CATEGORY_ID,
        editingData.ITEM_ID
      );
  }, [editingData.ITEM_ID, editingData.CATEGORY_ID, editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "CATEGORY_ID") {
        updated.ITEM_ID = "";
        updated.TYPE_ID = "";
      }
      if (name === "ITEM_ID") {
        updated.TYPE_ID = "";
      }
      return updated;
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingData((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "CATEGORY_ID") {
        updated.ITEM_ID = "";
        updated.TYPE_ID = "";
      }
      if (name === "ITEM_ID") {
        updated.TYPE_ID = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      description: formData.DESCRIPTION,
      category_id: formData.CATEGORY_ID,
      item_id: formData.ITEM_ID,
      type_id: formData.TYPE_ID,
      status: formData.STATUS,
    };

    const res = await apiPost("/api/description", payload);

    if (res?.error) {
      alert(res.error);
      return;
    }

    setFormData({
      DESCRIPTION: "",
      CATEGORY_ID: "",
      ITEM_ID: "",
      TYPE_ID: "",
      STATUS: "Active",
    });

    setItems([]);
    setTypes([]);
    await loadData();
    alert("Description added successfully!");
  };

  const handleEdit = async (row) => {
    setEditingId(row.id);

    await fetchItemsForCategory(row.category_id);
    await fetchTypesForCategoryItem(row.category_id, row.item_id);

    setEditingData({
      DESCRIPTION: row.description_name,   // FIXED
      CATEGORY_ID: row.category_id,
      ITEM_ID: row.item_id,
      TYPE_ID: row.type_id,
      STATUS: row.status,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({
      DESCRIPTION: "",
      CATEGORY_ID: "",
      ITEM_ID: "",
      TYPE_ID: "",
      STATUS: "",
    });
    setItems([]);
    setTypes([]);
  };

  const handleUpdate = async (id) => {
    const payload = {
      description: editingData.DESCRIPTION,
      category_id: editingData.CATEGORY_ID,
      item_id: editingData.ITEM_ID,
      type_id: editingData.TYPE_ID,
      status: editingData.STATUS,
    };

    await apiPut(`/api/description/${id}`, payload);

    setEditingId(null);
    setItems([]);
    setTypes([]);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this description?")) return;
    await apiDelete(`/api/description/${id}`);
    await loadData();
  };

  return (
    <div className="setup-page">
      <div className="page-container">
        <div className="box-section form-box">
          <h2>Add Description</h2>

          <form className="form-create" onSubmit={handleSubmit}>
            <div className="form-header-row">
              <div className="form-header-cell">CATEGORY</div>
              <div className="form-header-cell">ITEM</div>
              <div className="form-header-cell">TYPE</div>
            </div>

            <div className="combined-body small-three">
              <div className="form-group required-wrapper">
                <select
                  name="CATEGORY_ID"
                  value={formData.CATEGORY_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
                <span className="required-star">★</span>
              </div>

              <div className="form-group required-wrapper">
                <select
                  name="ITEM_ID"
                  value={formData.ITEM_ID}
                  onChange={handleChange}
                  disabled={!formData.CATEGORY_ID}
                  required
                >
                  <option value="">Select Item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.item_id}>
                      {it.item_name}
                    </option>
                  ))}
                </select>
                <span className="required-star">★</span>
              </div>

              <div className="form-group required-wrapper">
                <select
                  name="TYPE_ID"
                  value={formData.TYPE_ID}
                  onChange={handleChange}
                  disabled={!formData.ITEM_ID}
                  required
                >
                  <option value="">Select Type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.type_id}>
                      {t.type_name}
                    </option>
                  ))}
                </select>
                <span className="required-star">★</span>
              </div>
            </div>

            <div className="form-header-row">
              <div className="form-header-cell">DESCRIPTION</div>
              <div className="form-header-cell">STATUS</div>
            </div>

            <div className="combined-body">
              <div className="form-group required-wrapper">
                <textarea
                  name="DESCRIPTION"
                  value={formData.DESCRIPTION}
                  onChange={handleChange}
                  required
                  placeholder="Enter description"
                ></textarea>
                <span className="required-star">★</span>
              </div>

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
              <button className="btn-primary">Submit</button>
              <button
                type="button"
                className="btn-reset"
                onClick={() =>
                  setFormData({
                    DESCRIPTION: "",
                    CATEGORY_ID: "",
                    ITEM_ID: "",
                    TYPE_ID: "",
                    STATUS: "Active",
                  })
                }
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="box-section table-box">
          <h2>Existing Descriptions</h2>

          <div className="table-wrapper">
            <div className="fixed-table">
              <table className="workorder-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {descriptions.map((row) => {
                    const cat = categories.find(
                      (c) => c.category_id === row.category_id
                    );
                    const item = itemsAll.find(
                      (i) => i.item_id === row.item_id
                    );
                    const type = typesAll.find(
                      (t) => t.type_id === row.type_id
                    );

                    return (
                      <tr key={row.id}>
                        {editingId === row.id ? (
                          <>
                            <td>
                              <select value={editingData.CATEGORY_ID} disabled>
                                <option>
                                  {cat?.category_name}
                                </option>
                              </select>
                            </td>

                            <td>
                              <select
                                name="ITEM_ID"
                                value={editingData.ITEM_ID}
                                onChange={handleEditChange}
                              >
                                <option value="">Select Item</option>
                                {items.map((it) => (
                                  <option key={it.id} value={it.item_id}>
                                    {it.item_name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <select
                                name="TYPE_ID"
                                value={editingData.TYPE_ID}
                                onChange={handleEditChange}
                              >
                                <option value="">Select Type</option>
                                {types.map((t) => (
                                  <option key={t.id} value={t.type_id}>
                                    {t.type_name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <textarea
                                name="DESCRIPTION"
                                value={editingData.DESCRIPTION}
                                onChange={handleEditChange}
                              ></textarea>
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
                                onClick={() => handleUpdate(row.id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={handleCancel}
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{cat?.category_name}</td>
                            <td>{item?.item_name}</td>
                            <td>{type?.type_name}</td>
                            <td>{row.description_name}</td>
                            <td>{row.status}</td>

                            <td>
                              <button
                                className="btn-edit"
                                onClick={() => handleEdit(row)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(row.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DescriptionPage;
