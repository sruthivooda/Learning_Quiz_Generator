import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lheader from "./components/loginheader";
import Footer from "./components/footer";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const navigate = useNavigate(); // Hook for navigation

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignup ? "/register" : "/login";
    const payload = isSignup
      ? { email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        if (!isSignup) {
          navigate("/"); // Redirect to home page after login
        }
      } else {
        alert(result.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to the server. Please try again.");
    }
  };

  const styles = {
    sec: {
      display: "flex",
    //   background: "url('/6213932.jpg') no-repeat center center/cover",
    flexDirection: 'column',
    justifyContent: 'center',
    },
    sectionBgOverlay: {
      width: "100%",
      height: "64vh",
      backgroundColor: "rgba(208,148,34,0.50)",
      display: "flex",
      justifyContent:'space-evenly',
      alignItems: "center",
      color: "white",
    },
    formBox: {
      position: "relative",
      width: "400px",
      height: "auto",
      background: "transparent",
      border: "2px solid rgba(255,255,255,0.5)",
      borderRadius: "20px",
      backdropFilter: "blur(15px)",
      WebkitBackdropFilter: "blur(15px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    },
    inputBox: {
      position: "relative",
      margin: "20px 0",
      width: "310px",
      borderBottom: "2px solid #fff",
    },
    input: {
      width: "100%",
      height: "50px",
      background: "transparent",
      border: "none",
      outline: "none",
      fontSize: "1em",
      padding: "0 35px 0 5px",
      color: "#fff",
    },
    label: {
      position: "absolute",
      top: "50%",
      left: "5px",
      transform: "translateY(-50%)",
      color: "#fff",
      fontSize: "1em",
      pointerEvents: "none",
      transition: ".5s",
    },
    button: {
      width: "100%",
      height: "40px",
      borderRadius: "40px",
      background: "#8e7842",
      border: "none",
      outline: "none",
      cursor: "pointer",
      fontSize: "1em",
      fontWeight: "600",
      color: "#ffffff",
      marginTop: "15px",
    },
    toggleLink: {
      textDecoration: "none",
      color: "#fff",
      fontWeight: "600",
      cursor: "pointer",
    },
    register: {
      fontSize: ".9em",
      color: "#fff",
      textAlign: "center",
      margin: "20px 0 10px",
    },
    blackLine: {
        border: 'none',
        borderTop: '2px solid black',
        height: '10%',
        margin: '20px auto',
    },
  };

  return (
    // <section style={styles.section}>
    <div style={styles.sec}>
      <Lheader />
      <div style={styles.sectionBgOverlay}>
        <div style={styles.formBox}>
          <form onSubmit={handleSubmit}>
          <h3>{isSignup ? "Register" : "Login"}</h3>
            <div style={styles.inputBox}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={styles.input}
                onFocus={(e) => (e.target.nextSibling.style.top = "-5px")}
                onBlur={(e) => e.target.value === "" && (e.target.nextSibling.style.top = "50%")}
              />
              <label style={styles.label}>Email</label>
            </div>
            <div style={styles.inputBox}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={styles.input}
                onFocus={(e) => (e.target.nextSibling.style.top = "-5px")}
                onBlur={(e) => e.target.value === "" && (e.target.nextSibling.style.top = "50%")}
              />
              <label style={styles.label}>Password</label>
            </div>
            {isSignup && (
              <div style={styles.inputBox}>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  onFocus={(e) => (e.target.nextSibling.style.top = "-5px")}
                  onBlur={(e) => e.target.value === "" && (e.target.nextSibling.style.top = "50%")}
                />
                <label style={styles.label}>Confirm Password</label>
              </div>
            )}
            <button style={styles.button} type="submit">
              {isSignup ? "Register" : "Login"}
            </button>
            <div style={styles.register}>
              <p>
                {isSignup
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <span
                  style={styles.toggleLink}
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setFormData({ email: "", password: "", confirmPassword: "" }); // Reset form
                  }}
                >
                  {isSignup ? "Login" : "Register"}
                </span>
              </p>
            </div>
          </form>
        </div>
        <div style={{height:'100%',width:'2px',backgroundColor:'black'}}></div>
        {/* <hr style={styles.blackLine} /> */}
      <div><h1>hello0000000</h1></div>
      </div>
      <Footer />
      </div>
    // </section>
  );
};

export default Login;
