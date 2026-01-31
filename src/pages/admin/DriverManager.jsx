import { useState } from "react";
import {
  saveDriver,
  findDriver,
  deleteDriver,
  assignTruckToDriver,
} from "../../services/api";

export default function DriverManager() {
  const [driverForm, setDriverForm] = useState({
    id: "",
    name: "",
    contact: "",
  });

  const [assignForm, setAssignForm] = useState({
    driverId: "",
    truckId: "",
    carrierId: "",
  });

  const [foundDriver, setFoundDriver] = useState(null);

  // Local list of drivers seen/created in this session
  const [drivers, setDrivers] = useState([]);

  const handleDriverChange = (e) => {
    const { name, value } = e.target;
    setDriverForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    if (!driverForm.id || !driverForm.name || !driverForm.contact) {
      alert("Please fill ID, name and contact");
      return null;
    }

    return {
      id: parseInt(driverForm.id, 10),
      name: driverForm.name,
      contact: parseInt(driverForm.contact, 10),
      // truck & carrier are assigned separately
    };
  };

  const handleSaveNewDriver = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      await saveDriver(payload);
      alert("Driver saved");

      // update local list
      setDrivers((prev) => {
        const exists = prev.find((d) => d.id === payload.id);
        if (exists) return prev; // don't duplicate
        return [...prev, payload];
      });

      setFoundDriver(payload);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save driver";
      alert(msg);
    }
  };

  // We will later support update properly in backend (same API),
  // for now frontend uses same endpoint.
  const handleUpdateDriver = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      await saveDriver(payload);
      alert("Driver updated");

      // update local list
      setDrivers((prev) =>
        prev.map((d) => (d.id === payload.id ? { ...d, ...payload } : d))
      );

      setFoundDriver(payload);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update driver (backend must support update)";
      alert(msg);
    }
  };

  const handleFindDriver = async () => {
    if (!driverForm.id) {
      alert("Enter Driver ID");
      return;
    }

    try {
      const res = await findDriver(driverForm.id);
      const d = res.data?.data || res.data;
      if (!d) {
        alert("Driver not found");
        setFoundDriver(null);
        return;
      }
      setFoundDriver(d);

      // also add/update to local list
      setDrivers((prev) => {
        const exists = prev.find((x) => x.id === d.id);
        if (exists) {
          return prev.map((x) => (x.id === d.id ? d : x));
        }
        return [...prev, d];
      });

      // optionally sync form with found driver
      setDriverForm({
        id: d.id,
        name: d.name,
        contact: d.contact,
      });
    } catch (err) {
      console.error(err);
      alert("Driver not found");
      setFoundDriver(null);
    }
  };

  const handleDeleteDriver = async () => {
    if (!driverForm.id) {
      alert("Enter Driver ID to delete");
      return;
    }
    if (!window.confirm("Delete driver?")) return;

    try {
      await deleteDriver(driverForm.id);
      alert("Driver deleted");

      setFoundDriver(null);
      setDrivers((prev) =>
        prev.filter((d) => d.id !== parseInt(driverForm.id, 10))
      );
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete driver";
      alert(msg);
    }
  };

  const handleAssign = async () => {
    if (!assignForm.driverId || !assignForm.truckId || !assignForm.carrierId) {
      alert("Enter driverId, truckId, carrierId");
      return;
    }

    try {
      await assignTruckToDriver(
        assignForm.driverId,
        assignForm.truckId,
        assignForm.carrierId
      );
      alert("Assigned truck & carrier to driver");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to assign truck/carrier";
      alert(msg);
    }
  };

  return (
    <section className="panel">
      <h2>👷 Driver Management</h2>

      {/* Create / Update section */}
      <h3>Create / Update Driver</h3>
      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          name="id"
          placeholder="Driver ID"
          value={driverForm.id}
          onChange={handleDriverChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={driverForm.name}
          onChange={handleDriverChange}
          style={{ marginRight: 6 }}
        />
        <input
          type="number"
          name="contact"
          placeholder="Contact (10 digits)"
          value={driverForm.contact}
          onChange={handleDriverChange}
          style={{ marginRight: 6 }}
        />
        <button onClick={handleSaveNewDriver}>Save New</button>
        <button style={{ marginLeft: 6 }} onClick={handleUpdateDriver}>
          Update Existing
        </button>
        <button style={{ marginLeft: 6 }} onClick={handleFindDriver}>
          Find
        </button>
        <button style={{ marginLeft: 6 }} onClick={handleDeleteDriver}>
          Delete
        </button>
      </div>

      {/* Found driver card */}
      {foundDriver && (
        <div className="selected-order-card" style={{ marginBottom: 16 }}>
          <h3>Driver Details</h3>
          <p>ID: {foundDriver.id}</p>
          <p>Name: {foundDriver.name}</p>
          <p>Contact: {foundDriver.contact}</p>
          {foundDriver.truck && (
            <p>Truck: {foundDriver.truck.number || foundDriver.truck.id}</p>
          )}
          {foundDriver.carrier && (
            <p>Carrier: {foundDriver.carrier.name}</p>
          )}
        </div>
      )}

      {/* Local driver list (session-based) */}
      <h3>Driver List (this session)</h3>
      {drivers.length === 0 ? (
        <p>No drivers loaded yet. Save or find a driver to add here.</p>
      ) : (
        <table className="data-table small">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr
                key={d.id}
                onClick={() => {
                  setDriverForm({
                    id: d.id,
                    name: d.name,
                    contact: d.contact,
                  });
                  setFoundDriver(d);
                }}
                style={{ cursor: "pointer" }}
              >
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Assign truck & carrier */}
      <h3 style={{ marginTop: 20 }}>Assign Truck & Carrier</h3>
      <div>
        <input
          type="number"
          name="driverId"
          placeholder="Driver ID"
          value={assignForm.driverId}
          onChange={handleAssignChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <input
          type="number"
          name="truckId"
          placeholder="Truck ID"
          value={assignForm.truckId}
          onChange={handleAssignChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <input
          type="number"
          name="carrierId"
          placeholder="Carrier ID"
          value={assignForm.carrierId}
          onChange={handleAssignChange}
          style={{ marginRight: 6, width: 120 }}
        />
        <button onClick={handleAssign}>Assign</button>
      </div>
    </section>
  );
}
