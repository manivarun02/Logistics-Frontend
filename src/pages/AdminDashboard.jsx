import { useEffect, useState } from "react";
import {
  getAllOrders,
  getAllTrucksAdmin,
  getAllDriversAdmin,
  getAllCarriersAdmin,
  getAvailableTrucksDrivers,
  assignFullOrder,
  getAllUsers,
  getUserOrders,
  getAllLoadings,
  getAllUnloadings,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

import TruckManager from "./admin/TruckManager";
import DriverManager from "./admin/DriverManager";
import CarrierManager from "./admin/CarrierManager";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Helper to normalize axios responses
  const unwrap = (res) => {
    if (res == null) return res;
    return res?.data?.data ?? res?.data ?? res;
  };

  const [activeMenu, setActiveMenu] = useState("orders");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Trucks state
  const [trucks, setTrucks] = useState([]);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [showTrucksList, setShowTrucksList] = useState(false);

  // Drivers state
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [showDriversList, setShowDriversList] = useState(false);

  // Carriers state
  const [carriers, setCarriers] = useState([]);
  const [loadingCarriers, setLoadingCarriers] = useState(false);
  const [showCarriersList, setShowCarriersList] = useState(false);

  // Assignment state
  const [availableTrucksDrivers, setAvailableTrucksDrivers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  const [error, setError] = useState("");

  // Users tab
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  // ✅ Loading & Unloading state
  const [loadings, setLoadings] = useState([]);
  const [loadingLoadings, setLoadingLoadings] = useState(false);
  const [unloadings, setUnloadings] = useState([]);
  const [loadingUnloadings, setLoadingUnloadings] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError("");
      const res = await getAllOrders();
      const data = unwrap(res);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTrucks = async () => {
    try {
      setLoadingTrucks(true);
      setError("");
      const res = await getAllTrucksAdmin();
      const data = unwrap(res);
      setTrucks(Array.isArray(data) ? data : []);
      setShowTrucksList(true);
    } catch (err) {
      console.error("Error fetching trucks:", err);
      setError("Failed to load trucks");
      setTrucks([]);
    } finally {
      setLoadingTrucks(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      setError("");
      const res = await getAllDriversAdmin();
      const data = unwrap(res);
      setDrivers(Array.isArray(data) ? data : []);
      setShowDriversList(true);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Failed to load drivers");
      setDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchCarriers = async () => {
    try {
      setLoadingCarriers(true);
      setError("");
      const res = await getAllCarriersAdmin();
      const data = unwrap(res);
      setCarriers(Array.isArray(data) ? data : []);
      setShowCarriersList(true);
    } catch (err) {
      console.error("Error fetching carriers:", err);
      setError("Failed to load carriers");
      setCarriers([]);
    } finally {
      setLoadingCarriers(false);
    }
  };

  const fetchAvailableTrucksDrivers = async () => {
    try {
      setLoadingAvailable(true);
      setError("");
      const res = await getAvailableTrucksDrivers();
      const data = unwrap(res);
      setAvailableTrucksDrivers(Array.isArray(data) ? data : []);
      
      // Also fetch all resources for assignment
      const [trucksRes, driversRes, carriersRes] = await Promise.all([
        getAllTrucksAdmin(),
        getAllDriversAdmin(),
        getAllCarriersAdmin(),
      ]);
      setTrucks(Array.isArray(unwrap(trucksRes)) ? unwrap(trucksRes) : []);
      setDrivers(Array.isArray(unwrap(driversRes)) ? unwrap(driversRes) : []);
      setCarriers(Array.isArray(unwrap(carriersRes)) ? unwrap(carriersRes) : []);
    } catch (err) {
      console.error("Error fetching available trucks/drivers:", err);
      setError("Failed to load available trucks/drivers");
      setAvailableTrucksDrivers([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // ✅ Fetch Loading locations (Pickup Addresses)
  const fetchLoadings = async () => {
    try {
      setLoadingLoadings(true);
      setError("");
      const res = await getAllLoadings();
      const data = unwrap(res);
      setLoadings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching loadings:", err);
      setError("Failed to load pickup locations");
      setLoadings([]);
    } finally {
      setLoadingLoadings(false);
    }
  };

  // ✅ Fetch Unloading locations (Drop Addresses)
  const fetchUnloadings = async () => {
    try {
      setLoadingUnloadings(true);
      setError("");
      const res = await getAllUnloadings();
      const data = unwrap(res);
      setUnloadings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching unloadings:", err);
      setError("Failed to load drop locations");
      setUnloadings([]);
    } finally {
      setLoadingUnloadings(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setActiveMenu("assign");
    setSelectedTruckId("");
    setSelectedDriverId("");
    setSelectedCarrierId("");
    fetchAvailableTrucksDrivers();
  };

  // ✅ IMPROVED: Calculate truck capacity from backend data
  const getTruckOrderCount = (truckId) => {
    // First check if we have capacity data from backend
    const truckData = availableTrucksDrivers.find(t => t.truckId === truckId);
    if (truckData && truckData.capacityUsed !== undefined) {
      return truckData.capacityUsed;
    }
    
    // Fallback: Calculate from orders array
    return orders.filter(o => o.truckId === truckId && o.status !== "Delivered").length;
  };

  // Helper to get carrier name by ID
  const getCarrierName = (carrierId) => {
    if (!carrierId) return "-";
    const carrier = carriers.find(c => c.id === carrierId);
    return carrier?.name || `Carrier #${carrierId}`;
  };

  // Helper to get truck number by ID
  const getTruckNumber = (truckId) => {
    if (!truckId) return "-";
    const truck = trucks.find(t => t.id === truckId);
    return truck?.number || `Truck #${truckId}`;
  };

  // ✅ IMPROVED: Full assignment handler with real-time refresh
  const handleAssignFull = async () => {
    if (!selectedOrder) {
      alert("Please select an order first");
      return;
    }

    if (!selectedTruckId && !selectedDriverId && !selectedCarrierId) {
      alert("Please select at least one resource to assign");
      return;
    }

    // Check truck capacity
    if (selectedTruckId) {
      const orderCount = getTruckOrderCount(selectedTruckId);
      if (orderCount >= 20) {
        alert("⚠️ This truck is at full capacity (20 orders). Please select another truck.");
        return;
      }
    }

    try {
      const res = await assignFullOrder(
        selectedOrder.id,
        selectedTruckId || null,
        selectedDriverId || null,
        selectedCarrierId || null
      );

      const updated = unwrap(res);

      // ✅ CRITICAL: Refresh both orders AND available trucks/drivers
      await Promise.all([
        fetchOrders(),
        fetchAvailableTrucksDrivers()
      ]);

      if (updated) {
        setSelectedOrder(updated);
      } else {
        const found = orders.find((o) => o.id === selectedOrder.id);
        if (found) setSelectedOrder(found);
      }

      // Reset selections
      setSelectedTruckId("");
      setSelectedDriverId("");
      setSelectedCarrierId("");

      alert("✅ Assignment successful! Order will be delivered within 3 days.");
    } catch (err) {
      console.error("Assignment error:", err);
      alert("❌ Failed to assign. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Users tab logic
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");
      const res = await getAllUsers();
      const data = unwrap(res);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setUserOrders([]);
    try {
      setLoadingUserOrders(true);
      const res = await getUserOrders(user.id);
      const data = unwrap(res);
      setUserOrders(Array.isArray(data) ? data : []);
      
      // Fetch carriers if not already loaded for proper name display
      if (carriers.length === 0) {
        await fetchCarriers();
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
      alert("Failed to load user's orders");
    } finally {
      setLoadingUserOrders(false);
    }
  };

  // Calculate delivery date (3 days from order date)
  const getDeliveryDate = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString();
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin Panel</h2>

        <nav className="admin-menu">
          <button
            className={activeMenu === "orders" ? "menu-item active" : "menu-item"}
            onClick={() => setActiveMenu("orders")}
          >
            📦 Orders
          </button>
          <button
            className={activeMenu === "assign" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("assign");
              if (selectedOrder) fetchAvailableTrucksDrivers();
            }}
            disabled={!selectedOrder}
          >
            🚚 Assign Order
          </button>
          <button
            className={activeMenu === "trucks" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("trucks");
              setShowTrucksList(false);
            }}
          >
            🚛 Trucks
          </button>
          <button
            className={activeMenu === "drivers" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("drivers");
              setShowDriversList(false);
            }}
          >
            👷 Drivers
          </button>
          <button
            className={activeMenu === "carriers" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("carriers");
              setShowCarriersList(false);
            }}
          >
            🏢 Carriers
          </button>
          <button
            className={activeMenu === "loading" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("loading");
              fetchLoadings();
            }}
          >
            ⬆ Loading
          </button>
          <button
            className={activeMenu === "unloading" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("unloading");
              fetchUnloadings();
            }}
          >
            ⬇ Unloading
          </button>
          <button
            className={activeMenu === "users" ? "menu-item active" : "menu-item"}
            onClick={() => {
              setActiveMenu("users");
              fetchUsers();
            }}
          >
            🧑‍🤝‍🧑 Users
          </button>
        </nav>

        <button className="logout-btn" onClick={logout}>
          ← Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {error && <div className="error-banner">{error}</div>}

        {/* Orders List */}
        {activeMenu === "orders" && (
          <section className="panel">
            <div className="panel-header">
              <h2>📦 All Orders</h2>
              <button onClick={fetchOrders}>Refresh</button>
            </div>

            {loadingOrders ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Truck ID</th>
                    <th>Driver ID</th>
                    <th>Carrier ID</th>
                    <th>Delivery Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className={selectedOrder?.id === o.id ? "selected-row" : ""}
                    >
                      <td>{o.id}</td>
                      <td>{o.orderDate || "N/A"}</td>
                      <td>
                        <span className={`status-badge status-${o.status?.toLowerCase()}`}>
                          {o.status || "Pending"}
                        </span>
                      </td>
                      <td>₹{o.cost || 0}</td>
                      <td>{o.truckId || "-"}</td>
                      <td>{o.driverId || "-"}</td>
                      <td>{o.carrierId || "-"}</td>
                      <td>{o.orderDate ? getDeliveryDate(o.orderDate) : "-"}</td>
                      <td>
                        <button 
                          onClick={() => handleSelectOrder(o)}
                          disabled={o.status === "Delivered"}
                        >
                          {o.truckId && o.driverId && o.carrierId ? "View" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* Assign Full */}
        {activeMenu === "assign" && (
          <section className="panel">
            <div className="panel-header">
              <h2>🚚 Assign Order Resources</h2>
            </div>

            {!selectedOrder ? (
              <p>Select an order from Orders tab first.</p>
            ) : (
              <>
                <div className="selected-order-card">
                  <h3>Selected Order #{selectedOrder.id}</h3>
                  <p><strong>Date:</strong> {selectedOrder.orderDate || "N/A"}</p>
                  <p><strong>Status:</strong> {selectedOrder.status || "Pending"}</p>
                  <p><strong>Cost:</strong> ₹{selectedOrder.cost || 0}</p>
                  <p><strong>Weight:</strong> {selectedOrder.totalWeightKg || "N/A"}kg</p>
                  <p><strong>Expected Delivery:</strong> {selectedOrder.orderDate ? getDeliveryDate(selectedOrder.orderDate) : "N/A"}</p>
                  <p>
                    <strong>Current Assignment:</strong> Truck:
                    {selectedOrder.truckId || "None"} | Driver:
                    {selectedOrder.driverId || "None"} | Carrier:
                    {selectedOrder.carrierId || "None"}
                  </p>
                </div>

                <div className="assign-grid">
                  <div className="assign-item">
                    <label>🚛 Select Truck</label>
                    <select
                      value={selectedTruckId}
                      onChange={(e) => setSelectedTruckId(e.target.value)}
                    >
                      <option value="">-- Select Truck --</option>
                      {trucks
                        .filter(t => {
                          const count = getTruckOrderCount(t.id);
                          return count < 20;
                        })
                        .map((t) => {
                          const count = getTruckOrderCount(t.id);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.number || `Truck #${t.id}`} — {t.capacity || "N/A"}kg 
                              ({count}/20 orders)
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div className="assign-item">
                    <label>👷 Select Driver</label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                    >
                      <option value="">-- Select Driver --</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name || d.id} {d.phonenumber ? `(${d.phonenumber})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="assign-item">
                    <label>🏢 Select Carrier</label>
                    <select
                      value={selectedCarrierId}
                      onChange={(e) => setSelectedCarrierId(e.target.value)}
                    >
                      <option value="">-- Select Carrier --</option>
                      {carriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || `Carrier #${c.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="primary-btn"
                  onClick={handleAssignFull}
                >
                  ✅ Confirm Assignment (3-Day Delivery)
                </button>

                {loadingAvailable ? (
                  <div className="assign-section">
                    <h3>Available Truck-Driver Pairs</h3>
                    <p>Loading...</p>
                  </div>
                ) : availableTrucksDrivers.length === 0 ? (
                  <div className="assign-section">
                    <h3>Available Truck-Driver Pairs</h3>
                    <p>No available pairs. Please assign trucks and drivers first.</p>
                  </div>
                ) : (
                  <div className="assign-section">
                    <h3>Available Truck-Driver Pairs ({availableTrucksDrivers.length})</h3>
                    <table className="data-table small">
                      <thead>
                        <tr>
                          <th>Truck</th>
                          <th>Driver</th>
                          <th>Carrier</th>
                          <th>Capacity Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableTrucksDrivers.map((x, i) => {
                          // ✅ Use backend capacity data
                          const capacityUsed = x.capacityUsed ?? 0;
                          const maxCapacity = x.maxCapacity ?? 20;
                          const isFull = capacityUsed >= maxCapacity;
                          
                          return (
                            <tr key={i} className={isFull ? "truck-full" : ""}>
                              <td>{x.truckNumber || x.truckId}</td>
                              <td>{x.driverName || x.driverId || "-"}</td>
                              <td>{x.carrierName || "-"}</td>
                              <td>
                                {capacityUsed}/{maxCapacity} {isFull && <span className="badge-full">FULL</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Trucks Section with Manager */}
        {activeMenu === "trucks" && (
          <section className="panel">
            <TruckManager />
            
            {/* View All Trucks Button at Bottom */}
            {!showTrucksList && (
              <div className="list-toggle-section">
                <button className="toggle-list-btn" onClick={fetchTrucks}>
                  📋 View All Trucks
                </button>
              </div>
            )}

            {/* Trucks List */}
            {showTrucksList && (
              <div className="list-display-section">
                <div className="list-header">
                  <h3>All Trucks ({trucks.length})</h3>
                  <button className="hide-list-btn" onClick={() => setShowTrucksList(false)}>
                    Hide List
                  </button>
                </div>

                {loadingTrucks ? (
                  <p>Loading trucks...</p>
                ) : trucks.length === 0 ? (
                  <p>No trucks found.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Number</th>
                        <th>Capacity</th>
                        <th>Driver ID</th>
                        <th>Carrier ID</th>
                        <th>Orders Assigned</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trucks.map((t) => {
                        const count = getTruckOrderCount(t.id);
                        const isFull = count >= 20;
                        return (
                          <tr key={t.id} className={isFull ? "truck-full" : ""}>
                            <td>{t.id}</td>
                            <td>{t.number || "-"}</td>
                            <td>{t.capacity || "N/A"}kg</td>
                            <td>{t.driverId || "-"}</td>
                            <td>{t.carrierId || "-"}</td>
                            <td>{count}/20</td>
                            <td>
                              {isFull ? (
                                <span className="badge-full">FULL</span>
                              ) : (
                                <span className="badge-available">AVAILABLE</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        )}

        {/* Drivers Section with Manager */}
        {activeMenu === "drivers" && (
          <section className="panel">
            <DriverManager />
            
            {/* View All Drivers Button at Bottom */}
            {!showDriversList && (
              <div className="list-toggle-section">
                <button className="toggle-list-btn" onClick={fetchDrivers}>
                  📋 View All Drivers
                </button>
              </div>
            )}

            {/* Drivers List */}
            {showDriversList && (
              <div className="list-display-section">
                <div className="list-header">
                  <h3>All Drivers ({drivers.length})</h3>
                  <button className="hide-list-btn" onClick={() => setShowDriversList(false)}>
                    Hide List
                  </button>
                </div>

                {loadingDrivers ? (
                  <p>Loading drivers...</p>
                ) : drivers.length === 0 ? (
                  <p>No drivers found.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Truck ID</th>
                        <th>Carrier ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((d) => (
                        <tr key={d.id}>
                          <td>{d.id}</td>
                          <td>{d.name || "-"}</td>
                          <td>{d.phonenumber || d.mobile || "-"}</td>
                          <td>{d.truckId || "-"}</td>
                          <td>{d.carrierId || "-"}</td>
                          <td>
                            {d.truckId ? (
                              <span className="badge-assigned">ASSIGNED</span>
                            ) : (
                              <span className="badge-available">FREE</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        )}

        {/* Carriers Section with Manager */}
        {activeMenu === "carriers" && (
          <section className="panel">
            <CarrierManager />
            
            {/* View All Carriers Button at Bottom */}
            {!showCarriersList && (
              <div className="list-toggle-section">
                <button className="toggle-list-btn" onClick={fetchCarriers}>
                  📋 View All Carriers
                </button>
              </div>
            )}

            {/* Carriers List */}
            {showCarriersList && (
              <div className="list-display-section">
                <div className="list-header">
                  <h3>All Carriers ({carriers.length})</h3>
                  <button className="hide-list-btn" onClick={() => setShowCarriersList(false)}>
                    Hide List
                  </button>
                </div>

                {loadingCarriers ? (
                  <p>Loading carriers...</p>
                ) : carriers.length === 0 ? (
                  <p>No carriers found.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Trucks</th>
                        <th>Drivers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carriers.map((c) => {
                        const carrierTrucks = trucks.filter(t => t.carrierId === c.id).length;
                        const carrierDrivers = drivers.filter(d => d.carrierId === c.id).length;
                        return (
                          <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name || "-"}</td>
                            <td>{carrierTrucks}</td>
                            <td>{carrierDrivers}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        )}

        {/* ✅ LOADING SECTION - Pickup Addresses */}
        {activeMenu === "loading" && (
          <section className="panel">
            <div className="panel-header">
              <h2>⬆ Loading Locations (Pickup Addresses)</h2>
              <button onClick={fetchLoadings}>Refresh</button>
            </div>

            {loadingLoadings ? (
              <p>Loading pickup locations...</p>
            ) : loadings.length === 0 ? (
              <p>No pickup locations found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Street</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Pincode</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loadings.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.street || "-"}</td>
                      <td>{l.city || "-"}</td>
                      <td>{l.state || "-"}</td>
                      <td>{l.pincode || "-"}</td>
                      <td>{l.date || "-"}</td>
                      <td>{l.time || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ✅ UNLOADING SECTION - Drop Addresses */}
        {activeMenu === "unloading" && (
          <section className="panel">
            <div className="panel-header">
              <h2>⬇ Unloading Locations (Drop Addresses)</h2>
              <button onClick={fetchUnloadings}>Refresh</button>
            </div>

            {loadingUnloadings ? (
              <p>Loading drop locations...</p>
            ) : unloadings.length === 0 ? (
              <p>No drop locations found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Street</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Pincode</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {unloadings.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.street || "-"}</td>
                      <td>{u.city || "-"}</td>
                      <td>{u.state || "-"}</td>
                      <td>{u.pincode || "-"}</td>
                      <td>{u.date || "-"}</td>
                      <td>{u.time || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* Users Tab */}
        {activeMenu === "users" && (
          <section className="panel">
            <div className="panel-header">
              <h2>🧑‍🤝‍🧑 Users & Their Orders</h2>
              <button onClick={fetchUsers}>Refresh Users</button>
            </div>

            {loadingUsers ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="split-layout">
                <div style={{ flex: 1, marginRight: 16 }}>
                  <h3>Users</h3>
                  <table className="data-table small">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Location</th>
                        <th>Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className={selectedUser?.id === u.id ? "selected-row" : ""}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectUser(u)}
                        >
                          <td>{u.id}</td>
                          <td>{u.email || "-"}</td>
                          <td>{u.mobile || "-"}</td>
                          <td>{u.location || "-"}</td>
                          <td>{u.usageType || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: 1 }}>
                  <h3>
                    {selectedUser
                      ? `Orders of ${selectedUser.email}`
                      : "Select a user to view orders"}
                  </h3>
                  {selectedUser && loadingUserOrders && <p>Loading orders...</p>}
                  {selectedUser &&
                    !loadingUserOrders &&
                    userOrders.length === 0 && <p>No orders for this user.</p>}
                  {selectedUser && userOrders.length > 0 && (
                    <table className="data-table small">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Cost</th>
                          <th>Truck</th>
                          <th>Carrier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((o) => (
                          <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.orderDate || "N/A"}</td>
                            <td>{o.status || "Pending"}</td>
                            <td>₹{o.cost || 0}</td>
                            <td>{o.truck?.number || getTruckNumber(o.truckId)}</td>
                            <td>{o.carrier?.name || getCarrierName(o.carrierId)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}