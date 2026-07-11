import React from "react";
import AuthForm from "../components/AuthForm/AuthForm";
import "./AuthPage.css";

const Login = () => {
  return (
    <div className="auth-page">
      <AuthForm mode="login" />
    </div>
  );
};

export default Login;
