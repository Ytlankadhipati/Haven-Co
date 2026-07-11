import React from "react";
import AuthForm from "../components/AuthForm/AuthForm";
import "./AuthPage.css";

const Signup = () => {
  return (
    <div className="auth-page">
      <AuthForm mode="signup" />
    </div>
  );
};

export default Signup;
