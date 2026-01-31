import { useEffect, useState } from "react";
import { saveTruck, getAllTrucks, deleteTruck } from "../../services/api";

export default function TruckManager() {
  const [form, setForm] = useState({ name: "", number: "", capacity: "" });
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTrucks = async () => {
    try {
      setLoading(true);
      const res = await getAllTrucks();
      // Backend returns List<Truck>
      const data = res.data || res.data?.data || [];
      setTrucks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load trucks", err);
      alert("Failed to load trucks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrucks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.number || !form.capacity) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      name: form.name,
      number: form.number,
      capacity: parseInt(form.capacity, 10),
      // status defaults to "Available" in entity
    };

    try {
      await saveTruck(payload);
      alert("Truck added successfully");
      setForm({ name: "", number: "", capacity: "" });
      loadTrucks();
    } catch (err) {
      console.error("Failed to save truck", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save truck ❌ (check backend log)";
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this truck?")) return;

    try {
      await deleteTruck(id);
      alert("Truck deleted successfully ✅");
      loadTrucks();
    } catch (err) {
      console.error("Failed to delete truck", err);
      const backend = err.response?.data;
      // If later backend sends a friendly JSON for FK errors, show it
      if (backend?.message) {
        alert(backend.message);
      } else {
        alert(
          "Failed to delete truck. It may be used in some orders (foreign key constraint)."
        );
      }
    }
  };

  return (
    <section className="panel">
      <h2>🚛 Manage Trucks</h2>

      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="text"
          placeholder="Number (10 chars)"
          name="number"
          value={form.number}
          onChange={handleChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="number"
          placeholder="Capacity (>=50)"
          name="capacity"
          value={form.capacity}
          onChange={handleChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <button onClick={handleAdd}>+ Add Truck</button>
        <button style={{ marginLeft: 8 }} onClick={loadTrucks}>
          🔄 Refresh List
        </button>
      </div>

      {loading ? (
        <p>Loading trucks...</p>
      ) : trucks.length === 0 ? (
        <p>No trucks found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Number</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Carrier</th>
              <th>Driver</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.number}</td>
                <td>{t.capacity}</td>
                <td>{t.status}</td>
                <td>{t.carrier ? t.carrier.name : "-"}</td>
                <td>{t.driver ? t.driver.name : "-"}</td>
                <td>
                  <button onClick={() => handleDelete(t.id)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
