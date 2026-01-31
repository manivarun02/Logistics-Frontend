import { useState } from "react";
import { saveCarrier, findCarrier, deleteCarrier } from "../../services/api";

export default function CarrierManager() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    id: "",
  });
  const [found, setFound] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.contact) {
      alert("Please fill name, email and contact");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      contact: parseInt(form.contact, 10),
    };

    try {
      await saveCarrier(payload);
      alert("Carrier saved");
      // Optionally reset only name/email/contact
      setForm((prev) => ({
        ...prev,
        name: "",
        email: "",
        contact: "",
      }));
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save carrier";
      alert(msg);
    }
  };

  const handleFind = async () => {
    if (!form.id) {
      alert("Enter Carrier ID");
      return;
    }

    try {
      const res = await findCarrier(form.id);
      const data = res.data?.data || res.data;
      if (!data) {
        alert("Carrier not found");
        setFound(null);
        return;
      }
      setFound(data);

      // sync form with found carrier
      setForm((prev) => ({
        ...prev,
        name: data.name || "",
        email: data.email || "",
        contact:
          data.contact != null ? String(data.contact) : "",
      }));
    } catch (err) {
      console.error(err);
      alert("Carrier not found");
      setFound(null);
    }
  };

  const handleDelete = async () => {
    if (!form.id) {
      alert("Enter Carrier ID to delete");
      return;
    }
    if (!window.confirm("Delete carrier?")) return;

    try {
      await deleteCarrier(form.id);
      alert("Carrier deleted");
      setFound(null);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete carrier";
      alert(msg);
    }
  };

  return (
    <section className="panel">
      <h2>🏢 Carrier Management</h2>

      <h3>Create Carrier</h3>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="number"
          name="contact"
          placeholder="Contact (10 digits)"
          value={form.contact}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <button onClick={handleSave}>Save</button>
      </div>

      <h3>Find / Delete Carrier</h3>
      <div>
        <input
          type="number"
          name="id"
          placeholder="Carrier ID"
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
          <h3>Carrier Details</h3>
          <p>ID: {found.id}</p>
          <p>Name: {found.name}</p>
          <p>Email: {found.email}</p>
          <p>Contact: {found.contact}</p>
        </div>
      )}
    </section>
  );
}
