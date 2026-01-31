import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, loginUser } from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!role) {
      alert("Please select User or Admin before login");
      return;
    }

    try {
      let response;

      if (role === "admin") {
        response = await loginAdmin({
          empId: formData.id,
          password: formData.password,
        });
      } else {
        response = await loginUser({
          email: formData.id,
          password: formData.password,
        });
      }

      if (response?.data?.code === 200) {
        const data = response.data.data;
        alert("Login Successful!");

        if (role === "user") {
          localStorage.setItem("userData", JSON.stringify(data));
          localStorage.setItem("role", "user");
          navigate("/user-dashboard");
        } else {
          localStorage.setItem("adminData", JSON.stringify(data));
          localStorage.setItem("role", "admin");
          navigate("/admin-dashboard");
        }
      } else {
        alert("Login Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Login</h1>

        {!role && (
          <div className="role-selector">
            <button onClick={() => setRole("admin")}>Admin Login</button>
            <button onClick={() => setRole("user")}>User Login</button>
          </div>
        )}

        {role && (
          <>
            <input
              type="text"
              name="id"
              placeholder={role === "admin" ? "Employee ID" : "Email"}
              value={formData.id}
              onChange={handleChange}
            />

            {/* PASSWORD WITH EYE */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>

            <p className="back-btn" onClick={() => setRole(null)}>
              ← Back
            </p>
          </>
        )}

        <p className="back-btn" onClick={() => navigate("/")}>
          ← Home
        </p>

        <p className="register-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}
