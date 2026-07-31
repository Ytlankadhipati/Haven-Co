import React from "react";
import AuthForm from "../components/AuthForm/AuthForm";
import "./AuthPage.css";
import { API_BASE_URL } from "../config/api";

const Signup = () => {
  return (
    <div className="auth-page">
      <AuthForm mode="signup" />
    </div>
  );
};

export default Signup;
