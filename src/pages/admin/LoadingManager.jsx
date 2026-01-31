import { useState } from "react";
import {
  saveLoading,
  findLoading,
  deleteLoading,
} from "../../services/api";

export default function LoadingManager() {
  const [form, setForm] = useState({
    id: "",
    date: "",
    time: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
  });
  const [found, setFound] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.id || !form.street || !form.city || !form.pincode || !form.state) {
      alert("Please fill ID, street, city, pincode and state");
      return;
    }

    const payload = {
      id: parseInt(form.id, 10),
      date: form.date,
      time: form.time,
      adress: {
        street: form.street,
        city: form.city,
        pincode: parseInt(form.pincode, 10),
        state: form.state,
      },
    };

    try {
      await saveLoading(payload);
      alert("Loading address saved");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save loading address";
      alert(msg);
    }
  };

  const handleFind = async () => {
    if (!form.id) {
      alert("Enter ID");
      return;
    }

    try {
      const res = await findLoading(form.id);
      // Backend returns ResponceStucture<Loading>
      const body = res.data || {};
      const loading = body.data || body;

      if (!loading) {
        alert("Loading record not found");
        setFound(null);
        return;
      }

      setFound(loading);

      const addr = loading.adress || loading.address || {};
      setForm((prev) => ({
        ...prev,
        date: loading.date || "",
        time: loading.time || "",
        street: addr.street || "",
        city: addr.city || "",
        pincode:
          addr.pincode != null ? String(addr.pincode) : "",
        state: addr.state || "",
      }));
    } catch (err) {
      console.error(err);
      alert("Loading address not found");
      setFound(null);
    }
  };

  const handleDelete = async () => {
    if (!form.id) {
      alert("Enter ID to delete");
      return;
    }

    if (!window.confirm("Delete loading address & details?")) return;

    try {
      await deleteLoading(form.id);
      alert("Loading details deleted");
      setFound(null);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete loading details";
      alert(msg);
    }
  };

  return (
    <section className="panel">
      <h2>⬆ Loading Locations</h2>

      <h3>Create / Update Loading</h3>
      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          name="id"
          placeholder="Loading ID"
          value={form.id}
          onChange={handleChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <input
          type="text"
          name="date"
          placeholder="Date (optional)"
          value={form.date}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="text"
          name="time"
          placeholder="Time (optional)"
          value={form.time}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={form.street}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="number"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <button onClick={handleSave}>Save</button>
      </div>

      <h3>Find / Delete Loading</h3>
      <div>
        <input
          type="number"
          name="id"
          placeholder="Loading ID"
          value={form.id}
          onChange={handleChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <button onClick={handleFind}>Find</button>
        <button style={{ marginLeft: 6 }} onClick={handleDelete}>
          Delete
        </button>
      </div>

      {found && (
        <div className="selected-order-card" style={{ marginTop: 10 }}>
          <h3>Loading Details</h3>
          <p>
            <strong>ID:</strong> {found.id}
          </p>
          <p>
            <strong>Date:</strong> {found.date || "-"}
          </p>
          <p>
            <strong>Time:</strong> {found.time || "-"}
          </p>
          {found.adress && (
            <p>
              <strong>Address:</strong>{" "}
              {found.adress.street}, {found.adress.city} –{" "}
              {found.adress.pincode}, {found.adress.state}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
