import React from "react";
import { useNavigate } from "react-router-dom";
import './navbar.css'

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="navbar">
      {!token ? (
        <>
        <div className="nav-content">
          <button className="bsn" onClick={() => navigate("/login")}>Login</button>
          <button  className="btn" onClick={() => navigate("/register")}>Register</button>
          </div>
        </>
      ) : (
        <>
        <div className="nav-content">
          <button className="btn" onClick={() => navigate("/feedback")}>Feedback</button>
          <button  className="bsn" onClick={handleLogout}>Signout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;