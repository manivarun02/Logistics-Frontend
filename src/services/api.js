import axios from "axios";

const API = axios.create({
  baseURL: "https://logisticks-backend.onrender.com",
});

// ========================================== 
// 🛡️ JWT SUPPORT & AUTH INTERCEPTORS
// ==========================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ========================================== 
   🔑 AUTHENTICATION (USER & ADMIN)
   ========================================== */
export const registerUser = (data) => API.post("/user/register", data);
export const loginUser = (data) => API.post("/user/login", data);
export const registerAdmin = (data) => API.post("/admin/register", data);
export const loginAdmin = (data) => API.post("/admin/login", data);

/* ========================================== 
   👤 USER SPECIFIC APIS
   ========================================== */
// Address Management (User)
export const saveAddress = (data) =>
  API.post("/user/address", {
    street: data.street.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: String(data.pincode).trim(),
  });

// ✅ NEW: User Loading/Unloading
export const saveUserLoading = (data) => API.post("/user/loading", data);
export const saveUserUnloading = (data) => API.post("/user/unloading", data);

// Cargo Management
export const saveCargo = (data) => API.post("/user/cargo", data);
export const findCargo = (id) => API.get(`/user/cargo/${id}`);
export const deleteCargo = (id) => API.delete(`/user/cargo/${id}`);

// User Order Actions
export const placeOrder = (data) => API.post("/user/orders", data);
export const trackOrder = (id) => API.get(`/user/orders/track/${id}`);
export const cancelOrder = (id) => API.put(`/user/orders/cancel/${id}`);
export const getUserOrdersUser = (userId) =>
  API.get(`/user/orders/user/${userId}`);

// Pricing
export const getPriceEstimate = (data) =>
  API.post("/user/orders/price-preview", data);

/* ========================================== 
   ⚙️ ADMIN MANAGEMENT APIS
   ========================================== */

// --- 👷 DRIVER MANAGEMENT ---
export const saveDriver = (data) => API.post("/admin/savedriverdetails", data);
export const findDriver = (id) => API.get(`/admin/finddriver/${id}`);
export const deleteDriver = (id) => API.delete(`/admin/deletedriver/${id}`);
export const getAllDriversAdmin = () => API.get("/admin/alldrivers");

// Critical: Link Driver to Truck and Carrier
export const assignTruckToDriver = (driverId, truckId, carrierId) => {
  const params = {};
  if (truckId) params.truckId = truckId;
  if (carrierId) params.carrierId = carrierId;
  
  return API.put(`/admin/updatedriverassignment/${driverId}`, null, { params });
};

// --- 🚛 TRUCK MANAGEMENT ---
export const saveTruck = (data) => API.post("/admin/savetruck", data);
export const getAllTrucksAdmin = () => API.get("/admin/alltrucks");
export const deleteTruck = (id) => API.delete(`/admin/deletetruck/${id}`);

// Update Truck Assignments
export const updateTruckByNumber = (number, carrierId, driverId) => {
  const params = {};
  if (carrierId) params.carrierId = carrierId;
  if (driverId) params.driverId = driverId;
  
  return API.put(`/admin/updatetruck/${number}`, null, { params });
};

// Specialized Truck/Driver View (DTO based)
export const getAvailableTrucks = () => API.get("/admin/available-trucks-drivers");
export const getAvailableTrucksDrivers = () => API.get("/admin/available-trucks-drivers");

// Helper: Assign Carrier to truck only
export const assignCarrierToTruckByNumber = (truckNumber, carrierId) =>
  API.put(`/admin/updatetruck/${truckNumber}`, null, {
    params: { carrierId },
  });

// --- 🏢 CARRIER MANAGEMENT ---
export const saveCarrier = (data) => API.post("/admin/savecarrier", data);
export const findCarrier = (id) => API.get(`/admin/findcarrier/${id}`);
export const deleteCarrier = (id) => API.delete(`/admin/deletecarrier/${id}`);
export const getAllCarriersAdmin = () => API.get("/admin/allcarriers");

// --- ⬆️ LOADING & ⬇️ UNLOADING (Admin) ---
export const saveLoading = (data) => API.post("/admin/saveloading", data);
export const findLoading = (id) => API.get(`/admin/findloading/${id}`);
export const deleteLoading = (id) => API.delete(`/admin/deleteloading/${id}`);
export const getAllLoadings = () => API.get("/admin/allloadings");

export const saveUnloading = (data) => API.post("/admin/saveunloading", data);
export const findDeliverAddress = (id) => API.get(`/admin/findunloading/${id}`);
export const deleteUnloading = (id) => API.delete(`/admin/cancelunloading/${id}`);
export const getAllUnloadings = () => API.get("/admin/allunloadings");

// --- 📦 ORDER LOGISTICS (ADMIN) ---
export const getAllOrders = () => API.get("/admin/allorders");

// ✅ Full Assignment (Truck + Driver + Carrier)
export const assignFullOrder = (orderId, truckId, driverId, carrierId) => {
  const params = {};
  if (truckId) params.truckId = truckId;
  if (driverId) params.driverId = driverId;
  if (carrierId) params.carrierId = carrierId;
  
  return API.put(`/admin/assign-full/${orderId}`, null, { params });
};

// MAIN LOGIC: Link Order ID to Truck ID
export const assignOrderToTruck = (orderId, truckId) =>
  API.put(`/admin/updateorderassigncarrier/${orderId}/bytruckid/${truckId}`);

export const updateLoadingUnloadingDate = (orderId) =>
  API.put(`/admin/updateloadingunloadingdatebyorder/${orderId}`);

// --- 🧑‍🤝‍🧑 USER DIRECTORY ---
export const getAllUsers = () => API.get("/admin/allusers");
export const getUserOrdersAdmin = (userId) =>
  API.get(`/admin/userorders/${userId}`);

/* ========================================== 
   🔄 ROBUST DATA HELPERS
   ========================================== */

/**
 * Get user orders - tries multiple endpoints
 * @param {number|string} userId - The user ID
 * @returns {Promise} API response
 */
export async function getUserOrders(userId) {
  const endpoints = [
    `/user/orders/user/${userId}`,
    `/admin/userorders/${userId}`,
  ];
  
  let lastError;
  
  for (const endpoint of endpoints) {
    try {
      const response = await API.get(endpoint);
      return response;
    } catch (err) {
      lastError = err;
      console.warn(`Failed to fetch from ${endpoint}:`, err.message);
    }
  }
  
  throw lastError || new Error("Failed to fetch user orders from all endpoints");
}

/* ========================================== 
   ✅ ALIASES FOR COMPONENT CONSISTENCY
   ========================================== */
export const getAllCarriers = getAllCarriersAdmin;
export const getAllDrivers = getAllDriversAdmin;
export const getAllTrucksList = getAllTrucksAdmin;
export const getAllTrucks = getAllTrucksAdmin;

// Address endpoints (Admin)
export const findAddress = (id) => API.get(`/admin/findaddress/${id}`);
export const deleteAddress = (id) => API.delete(`/admin/deleteaddress/${id}`);

export default API;
