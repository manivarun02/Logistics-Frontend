import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserOrders,
  placeOrder,
  trackOrder,
  cancelOrder,
  getPriceEstimate,
} from "../services/api";
import API from "../services/api";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [menuOpen, setMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("myOrders");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");

  // New order form states (minimal)
  const initialOrderForm = {
    cargoName: "",
    cargoDescription: "",
    cargoWeight: "",
    lStreet: "",
    lCity: "",
    lPincode: "",
    lState: "",
    uStreet: "",
    uCity: "",
    uPincode: "",
    uState: "",
  };

  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [loadingId, setLoadingId] = useState(null);
  const [unloadingId, setUnloadingId] = useState(null);

  const [priceEstimate, setPriceEstimate] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("UPI");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Track / Cancel states
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [tracking, setTracking] = useState(false);

  const [cancelId, setCancelId] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Utility: determine if price can be fetched
  const canFetchPrice = () => {
    return (
      orderForm.lStreet &&
      orderForm.lCity &&
      orderForm.lPincode &&
      orderForm.lState &&
      orderForm.uStreet &&
      orderForm.uCity &&
      orderForm.uPincode &&
      orderForm.uState &&
      orderForm.cargoWeight &&
      parseFloat(orderForm.cargoWeight) > 0
    );
  };

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (!stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    if (parsed?.id) fetchOrders(parsed.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchOrders = async (userId) => {
    try {
      setLoadingOrders(true);
      setError("");
      const res = await getUserOrders(userId);
      const payload = res?.data?.data ?? res?.data ?? res;
      if (Array.isArray(payload)) setOrders(payload);
      else if (payload && Array.isArray(payload.data)) setOrders(payload.data);
      else setOrders(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  // ✅ UPDATED: Create Loading & Unloading entries directly
  const handleFetchPrice = async () => {
    if (!canFetchPrice()) {
      setError("Enter complete addresses + weight first");
      return;
    }

    if (!user?.id) {
      setError("Please login first");
      return;
    }

    setPriceLoading(true);
    setError("");

    try {
      let newLoadingId = loadingId;
      let newUnloadingId = unloadingId;

      if (!newLoadingId || !newUnloadingId) {
        // ✅ CREATE LOADING ENTRY (Pickup Address)
        const loadingRes = await API.post("/admin/saveloading", {
          street: orderForm.lStreet.trim(),
          city: orderForm.lCity.trim(),
          pincode: String(orderForm.lPincode).trim(),
          state: orderForm.lState.trim()
        });
        newLoadingId = loadingRes?.data?.data?.id ?? loadingRes?.data?.id ?? loadingRes?.id;

        // ✅ CREATE UNLOADING ENTRY (Drop Address)
        const unloadingRes = await API.post("/admin/saveunloading", {
          street: orderForm.uStreet.trim(),
          city: orderForm.uCity.trim(),
          pincode: String(orderForm.uPincode).trim(),
          state: orderForm.uState.trim()
        });
        newUnloadingId = unloadingRes?.data?.data?.id ?? unloadingRes?.data?.id ?? unloadingRes?.id;

        setLoadingId(newLoadingId);
        setUnloadingId(newUnloadingId);

        console.log("✅ Loading ID:", newLoadingId);
        console.log("✅ Unloading ID:", newUnloadingId);
      }

      const res = await getPriceEstimate({
        totalWeightKg: Number(orderForm.cargoWeight),
      });

      const data = res?.data?.data ?? res?.data ?? res;
      const cost = data?.cost ?? data?.finalCost ?? data?.price ?? 0;

      setPriceEstimate({ ...data, cost });
      setDistanceKm(Number(data?.distanceKm || 0));
    } catch (err) {
      console.error("Price fetch error:", err);
      setError("Failed to fetch price. Check addresses.");
      setPriceEstimate(null);
      setDistanceKm(0);
      setLoadingId(null);
      setUnloadingId(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const filteredOrders = (mode) => {
    if (mode === "current") {
      return orders.filter(
        (o) =>
          o.status &&
          ["placed", "pending", "in-progress"].includes(o.status.toLowerCase())
      );
    }
    return orders.filter(
      (o) =>
        o.status &&
        !["placed", "pending", "in-progress"].includes(o.status.toLowerCase())
    );
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));

    if (
      [
        "cargoWeight",
        "lStreet",
        "lCity",
        "lPincode",
        "lState",
        "uStreet",
        "uCity",
        "uPincode",
        "uState",
      ].includes(name)
    ) {
      setPriceEstimate(null);
      setDistanceKm(0);
      setLoadingId(null);
      setUnloadingId(null);
    }
  };

  const openPaymentModal = () => {
    if (
      !orderForm.cargoName ||
      !orderForm.cargoDescription ||
      !orderForm.cargoWeight ||
      parseFloat(orderForm.cargoWeight) <= 0 ||
      !loadingId ||
      !unloadingId
    ) {
      alert("Please fill fields and click 'Get Final Price' first.");
      return;
    }
    if (!priceEstimate?.cost) {
      alert('Click "💰 Get Final Price" first to fetch backend price.');
      return;
    }
    setShowPayment(true);
  };

  // Validated order creation
  const handleCreateOrder = async (paymentMethod = "COD") => {
    if (!user?.id) {
      alert("User not found. Login again.");
      return;
    }

    if (!loadingId || !unloadingId) {
      alert("Price session expired. Fetch price again.");
      return;
    }

    // ✅ VALIDATE CARGO DETAILS
    if (!orderForm.cargoName || orderForm.cargoName.trim() === "") {
      alert("⚠️ Please enter cargo name (e.g., 'Iron Rods')");
      return;
    }

    if (!orderForm.cargoDescription || orderForm.cargoDescription.trim() === "") {
      alert("⚠️ Please enter cargo description (e.g., 'Construction Material')");
      return;
    }

    if (!orderForm.cargoWeight || parseFloat(orderForm.cargoWeight) <= 0) {
      alert("⚠️ Please enter valid cargo weight");
      return;
    }

    setCreatingOrder(true);
    try {
      const totalWeightKg = Number(orderForm.cargoWeight);

      const dto = {
        userId: user.id,
        loadingId,
        unloadingId,
        totalWeightKg,
        paymentMethod,
        cargoName: orderForm.cargoName.trim(),
        cargoDescription: orderForm.cargoDescription.trim(),
        cargoCount: 1,
      };

      console.log("🚀 Placing order with payload:", dto);

      const response = await placeOrder(dto);

      console.log("✅ Order response:", response);

      alert("✅ Order placed successfully! Addresses saved in Loading/Unloading.");

      // Refresh orders list
      fetchOrders(user.id);

      // Reset form
      setShowNewOrderForm(false);
      setOrderForm(initialOrderForm);
      setPriceEstimate(null);
      setDistanceKm(0);
      setLoadingId(null);
      setUnloadingId(null);
      setError("");
    } catch (err) {
      console.error("❌ Order error:", err);
      console.error("Response data:", err.response?.data);

      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      alert("❌ Order failed: " + errorMsg);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleConfirmPaymentAndPlaceOrder = async () => {
    setPaymentProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      await handleCreateOrder(selectedPayment);
      setShowPayment(false);
    } catch (err) {
      console.error(err);
      alert("Payment or order placement failed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Track & Cancel handlers
  const handleTrackOrder = async () => {
    if (!trackId) {
      alert("Enter Order ID to track");
      return;
    }
    setTracking(true);
    setTrackResult(null);
    try {
      const res = await trackOrder(trackId);
      setTrackResult(res?.data?.data ?? res?.data ?? res);
    } catch (err) {
      console.error(err);
      alert("Order not found");
    } finally {
      setTracking(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelId) {
      alert("Enter Order ID to cancel");
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      await cancelOrder(cancelId);
      alert("Cancel request sent");
      if (user?.id) fetchOrders(user.id);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  // Calculate simple delivery date (3 days from order date)
  const getDeliveryDate = (orderDate) => {
    if (!orderDate) return "-";
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString();
  };

  return (
    <div className="user-layout with-bg">
      <header className="user-header">
        <button className="burger-btn" onClick={() => setMenuOpen((p) => !p)}>
          ☰
        </button>
        <div className="user-greeting">
          <div className="greet-main">
            {user ? `Hi, ${user.name || user.email || user.mobile || "User"} 👋` : "Hi 👋"}
          </div>
          <div className="greet-sub">Welcome back to LogiStick</div>
        </div>
        <button className="logout-small" onClick={logout}>
          Logout
        </button>
      </header>

      <div className="user-body">
        {menuOpen && (
          <aside className="user-sidebar">
            <nav>
              <button className={activeTab === "overview" ? "side-item active" : "side-item"} onClick={() => setActiveTab("overview")}>
                🏠 Overview
              </button>
              <button className={activeTab === "myOrders" ? "side-item active" : "side-item"} onClick={() => setActiveTab("myOrders")}>
                📦 My Orders
              </button>
              <button className={activeTab === "history" ? "side-item active" : "side-item"} onClick={() => setActiveTab("history")}>
                📜 Order History
              </button>
              <button className={activeTab === "offers" ? "side-item active" : "side-item"} onClick={() => setActiveTab("offers")}>
                🎁 Offers
              </button>
              <button className={activeTab === "support" ? "side-item active" : "side-item"} onClick={() => setActiveTab("support")}>
                🛟 Support
              </button>
              <button className={activeTab === "refunds" ? "side-item active" : "side-item"} onClick={() => setActiveTab("refunds")}>
                💸 Refunds & Help
              </button>
              <button className={activeTab === "profile" ? "side-item active" : "side-item"} onClick={() => setActiveTab("profile")}>
                👤 Profile & Settings
              </button>
            </nav>
          </aside>
        )}

        <main className="user-main">
          {error && <div className="error-banner">{error}</div>}

          {/* ===== MY ORDERS TAB ===== */}
          {activeTab === "myOrders" && (
            <section className="panel">
              <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>📦 My Orders</h2>
                <button className="primary-btn" onClick={() => setShowNewOrderForm((p) => !p)}>
                  ➕ New Order
                </button>
              </div>

              {loadingOrders ? (
                <p>Loading your orders...</p>
              ) : filteredOrders("current").length === 0 ? (
                <p>No active orders. Click <b>➕ New Order</b> to book one.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Order Date</th>
                      <th>Cost</th>
                      <th>Expected Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders("current").map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.status}</td>
                        <td>{o.orderDate}</td>
                        <td>₹{o.cost}</td>
                        <td>{getDeliveryDate(o.orderDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* New Order Form */}
              {showNewOrderForm && (
                <div style={{ marginTop: 20 }}>
                  <h3>Create New Order</h3>
                  <p style={{ fontSize: 13, marginBottom: 8 }}>Fill details → <b>Get Final Price</b> → Proceed to Payment.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <h4>Cargo Details</h4>
                      <div style={{ marginBottom: 12 }}>
                        <label>Cargo Name:</label>
                        <input id="cargoName" type="text" name="cargoName" placeholder="Cargo Name" value={orderForm.cargoName} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>Cargo Description:</label>
                        <textarea id="cargoDescription" name="cargoDescription" placeholder="Cargo Description" value={orderForm.cargoDescription} onChange={handleOrderInputChange} rows={3} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>Total Weight (kg):</label>
                        <input id="cargoWeight" type="number" name="cargoWeight" placeholder="Total weight in KG" value={orderForm.cargoWeight} onChange={handleOrderInputChange} step="0.1" min="0" />
                      </div>

                      <div className="price-box" style={{ background: "#fff3cd" }}>
                        {!priceEstimate?.cost ? (
                          <div>Click "💰 Get Final Price" to fetch backend price</div>
                        ) : (
                          <>
                            <div>📏 Distance: <b>{distanceKm > 0 ? distanceKm.toFixed(1) : "--"}</b> km</div>
                            <div>✅ Backend Price: <b>₹{priceEstimate.cost}</b></div>
                            <div style={{ fontSize: 12, color: "#555" }}>Official final price from server</div>
                          </>
                        )}
                      </div>

                      {user?.id && (
                        <div style={{ marginTop: 12 }}>
                          <button className="primary-btn" style={{ background: "#28a745", fontSize: 13, padding: "8px 16px" }} onClick={handleFetchPrice} disabled={priceLoading || !canFetchPrice()}>
                            {priceLoading ? "🔄 Fetching backend price..." : "💰 Get Final Price"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4>Pickup Address (Loading)</h4>
                      <div style={{ marginBottom: 12 }}>
                        <label>Street:</label>
                        <input id="lStreet" type="text" name="lStreet" placeholder="Street" value={orderForm.lStreet} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>City:</label>
                        <input id="lCity" type="text" name="lCity" placeholder="City" value={orderForm.lCity} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>Pincode:</label>
                        <input id="lPincode" type="text" name="lPincode" maxLength="6" placeholder="6-digit pincode" value={orderForm.lPincode} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>State:</label>
                        <input id="lState" type="text" name="lState" placeholder="State" value={orderForm.lState} onChange={handleOrderInputChange} />
                      </div>

                      <h4 style={{ marginTop: 12 }}>Deliver Address (Drop)</h4>
                      <div style={{ marginBottom: 12 }}>
                        <label>Street:</label>
                        <input id="uStreet" type="text" name="uStreet" placeholder="Street" value={orderForm.uStreet} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>City:</label>
                        <input id="uCity" type="text" name="uCity" placeholder="City" value={orderForm.uCity} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>Pincode:</label>
                        <input id="uPincode" type="text" name="uPincode" maxLength="6" placeholder="6-digit pincode" value={orderForm.uPincode} onChange={handleOrderInputChange} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>State:</label>
                        <input id="uState" type="text" name="uState" placeholder="State" value={orderForm.uState} onChange={handleOrderInputChange} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button className="primary-btn" onClick={openPaymentModal} disabled={creatingOrder || priceLoading || !priceEstimate?.cost}>
                      {creatingOrder ? "Placing..." : "Proceed to Payment"}
                    </button>
                    <small style={{ marginLeft: 12, color: "#666" }}>UPI / Card / Cash on Delivery available</small>
                  </div>
                </div>
              )}
              
              {/* Quick Actions: Track & Cancel */}
              <div style={{ marginTop: 30 }}>
                <h3>Quick Actions</h3>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
                  <div>
                    <h4>Track Order</h4>
                    <input type="text" placeholder="Order ID" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
                    <button className="primary-btn" style={{ marginTop: 6 }} onClick={handleTrackOrder} disabled={tracking}>
                      {tracking ? "Tracking..." : "Track"}
                    </button>
                    {trackResult && (
                      <p style={{ marginTop: 6, fontSize: 13 }}>
                        Status: <b>{trackResult.status}</b>, Cost: ₹{trackResult.cost}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4>Cancel Order</h4>
                    <input type="text" placeholder="Order ID" value={cancelId} onChange={(e) => setCancelId(e.target.value)} />
                    <button className="primary-btn" style={{ marginTop: 6, background: "#c62828" }} onClick={handleCancelOrder} disabled={cancelling}>
                      {cancelling ? "Cancelling..." : "Cancel Order"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === "overview" && (
            <section className="panel">
              <h2>🏠 Overview</h2>
              <div className="overview-cards">
                <div className="overview-card">
                  <h3>Current Orders</h3>
                  <p>{filteredOrders("current").length}</p>
                </div>
                <div className="overview-card">
                  <h3>Total Orders</h3>
                  <p>{orders.length}</p>
                </div>
                <div className="overview-card">
                  <h3>Delivered</h3>
                  <p>{filteredOrders("history").length}</p>
                </div>
                <div className="overview-card">
                  <h3>Support</h3>
                  <p>Available</p>
                </div>
                <div className="overview-card">
                  <h3>Fast Booking</h3>
                  <p>Enabled</p>
                </div>
                <div className="overview-card">
                  <h3>Secure Payment</h3>
                  <p>Available</p>
                </div>
              </div>
            </section>
          )}

          {/* ===== ORDER HISTORY TAB ===== */}
          {activeTab === "history" && (
            <section className="panel">
              <h2>📜 Order History</h2>
              {loadingOrders ? (
                <p>Loading...</p>
              ) : filteredOrders("history").length === 0 ? (
                <p>No past orders.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Order Date</th>
                      <th>Cost</th>
                      <th>Delivered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders("history").map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.status}</td>
                        <td>{o.orderDate}</td>
                        <td>₹{o.cost}</td>
                        <td>{getDeliveryDate(o.orderDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* ===== OFFERS / SUPPORT / REFUNDS / PROFILE ===== */}
          {activeTab === "offers" && (
            <section className="panel">
              <h2>🎁 Offers</h2>
              <ul>
                <li>5% off next inter-city</li>
                <li>Free pickup above ₹2000</li>
                <li>Flat ₹100 off on first 3 orders</li>
                <li>Referral bonus ₹250 per successful referral</li>
              </ul>
            </section>
          )}

          {activeTab === "support" && (
            <section className="panel">
              <h2>🛟 Support</h2>
              <p>📞 +91-98765-43210 | 📧 support@logistick.com</p>
              <p style={{ marginTop: 12 }}>Available: Monday - Friday, 9:00 AM - 6:00 PM IST</p>
            </section>
          )}

          {activeTab === "refunds" && (
            <section className="panel">
              <h2>💸 Refunds</h2>
              <p>Track refund status here.</p>
              <div style={{ marginTop: 12 }}>
                <h4>Refund Policy</h4>
                <ul>
                  <li>Refunds processed within 5-7 business days</li>
                  <li>Cancellation free within 30 mins of order placement</li>
                  <li>For issues contact support team</li>
                </ul>
              </div>
            </section>
          )}

          {activeTab === "profile" && (
            <section className="panel">
              <h2>👤 Profile</h2>
              {user ? (
                <div>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Mobile:</strong> {user.mobile}</p>
                  <button className="primary-btn" style={{ marginTop: 12, background: "#c62828" }}>Change Password</button>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </section>
          )}
        </main>
      </div>

      {/* ===== PAYMENT MODAL ===== */}
      {showPayment && (
        <div className="payment-modal">
          <div className="payment-card">
            <h3>Choose Payment Method</h3>
            <div className="payment-options">
              <label className={`pay-opt ${selectedPayment === "UPI" ? "active" : ""}`}>
                <input type="radio" name="pay" value="UPI" checked={selectedPayment === "UPI"} onChange={() => setSelectedPayment("UPI")} /> UPI
              </label>
              <label className={`pay-opt ${selectedPayment === "CARD" ? "active" : ""}`}>
                <input type="radio" name="pay" value="CARD" checked={selectedPayment === "CARD"} onChange={() => setSelectedPayment("CARD")} /> Card
              </label>
              <label className={`pay-opt ${selectedPayment === "COD" ? "active" : ""}`}>
                <input type="radio" name="pay" value="COD" checked={selectedPayment === "COD"} onChange={() => setSelectedPayment("COD")} /> Cash on Delivery
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <div>Distance: <strong>{distanceKm > 0 ? distanceKm.toFixed(1) : "--"} km</strong></div>
              <div>Amount: <strong>₹{priceEstimate?.cost || "--"}</strong></div>
              <small style={{ color: "#666" }}>Final cost from backend</small>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowPayment(false)} className="secondary-btn">Cancel</button>
              <button className="primary-btn" onClick={handleConfirmPaymentAndPlaceOrder} disabled={paymentProcessing}>
                {paymentProcessing ? "Processing..." : selectedPayment === "COD" ? "Place Order (COD)" : `Pay & Place (${selectedPayment})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}