import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user);
    }
  }, [isAuthenticated, user]);

  const redirectBasedOnRole = (userData) => {
    const role = userData?.role;
    if (role === "admin" || role === "مدير") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/employee/rentals", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "بيانات الدخول غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="login-header">
          <img src="/images/l3bty.png" alt="L3BTY" />
          <h1>L3BTY</h1>
          <p>نظام إدارة وتأجير ألعاب الأطفال</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

        </form>

        <div className="login-footer">
          © {new Date().getFullYear()} L3BTY - جميع الحقوق محفوظة
        </div>

      </div>
    </div>
  );
};

export default Login;