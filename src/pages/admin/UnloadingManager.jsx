import { useState } from "react";
import {
  saveUnloading,
  findDeliverAddress,
  deleteUnloading,
} from "../../services/api";

export default function UnloadingManager() {
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
      date: form.date, // optional – backend currently ignores them, but OK to send
      time: form.time,
      adress: {
        street: form.street,
        city: form.city,
        pincode: parseInt(form.pincode, 10),
        state: form.state,
      },
    };

    try {
      await saveUnloading(payload);
      alert("Unloading address saved");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save unloading address";
      alert(msg);
    }
  };

  const handleFind = async () => {
    if (!form.id) {
      alert("Enter ID");
      return;
    }

    try {
      const res = await findDeliverAddress(form.id);
      // Backend returns ResponceStucture<Address>
      const body = res.data || {};
      const addr = body.data || body;

      if (!addr || !addr.street) {
        alert("Address not found");
        setFound(null);
        return;
      }

      setFound(addr);

      // Also sync form with address
      setForm((prev) => ({
        ...prev,
        street: addr.street || "",
        city: addr.city || "",
        pincode: addr.pincode != null ? String(addr.pincode) : "",
        state: addr.state || "",
      }));
    } catch (err) {
      console.error(err);
      alert("Address not found");
      setFound(null);
    }
  };

  const handleDelete = async () => {
    if (!form.id) {
      alert("Enter ID to delete");
      return;
    }

    if (!window.confirm("Delete unloading address & details?")) return;

    try {
      await deleteUnloading(form.id);
      alert("Unloading details deleted");
      setFound(null);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete unloading details";
      alert(msg);
    }
  };

  return (
    <section className="panel">
      <h2>⬇ Unloading Locations</h2>

      <h3>Create / Update Unloading</h3>
      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          name="id"
          placeholder="Unloading ID"
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

      <h3>Find / Delete Unloading Address</h3>
      <div>
        <input
          type="number"
          name="id"
          placeholder="Unloading ID"
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
          <h3>Unloading Address</h3>
          <p>
            {found.street}, {found.city} – {found.pincode}, {found.state}
          </p>
        </div>
      )}
    </section>
  );
}
