import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin, registerUser } from "../services/api";
import "./Register.css";

export default function Register() {
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitRegister = async () => {
    try {
      let response;

      if (role === "admin") {
        response = await registerAdmin(formData);
      } else {
        response = await registerUser(formData);
      }

      if (response.data?.code === 200) {
        alert("Registration Successful!");
        navigate("/login");
      } else {
        alert("Registration Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error: Registration Failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-title">Register</h1>

        {!role && (
          <div className="role-selector">
            <button onClick={() => setRole("admin")}>Admin Register</button>
            <button onClick={() => setRole("user")}>User Register</button>
          </div>
        )}

        {/* Admin Form */}
        {role === "admin" && (
          <div className="form-section">
            <input
              type="text"
              placeholder="Name"
              name="name"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Employee ID"
              name="empId"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Mobile"
              name="mobile"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Shift Timing"
              name="shiftTiming"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />

            <button className="register-btn" onClick={submitRegister}>
              Register
            </button>

            <p className="back-btn" onClick={() => setRole(null)}>
              ← Back
            </p>
          </div>
        )}

        {/* User Form */}
        {role === "user" && (
          <div className="form-section">
            <input
              type="text"
              placeholder="Name"
              name="name"                 // <--- NEW
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Mobile"
              name="mobile"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Location"
              name="location"
              onChange={handleChange}
            />

            <select
              name="usageType"
              className="usage-select"
              onChange={handleChange}
            >
              <option value="">Select Usage Type</option>
              <option value="PERSONAL">Personal</option>
              <option value="DOMESTIC_BUSINESS">Domestic Business</option>
              <option value="INTERNATIONAL_BUSINESS">
                International Business
              </option>
            </select>

            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />

            <button className="register-btn" onClick={submitRegister}>
              Register
            </button>

            <p className="back-btn" onClick={() => setRole(null)}>
              ← Back
            </p>
          </div>
        )}

        <p className="login-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
