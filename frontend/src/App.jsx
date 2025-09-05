/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { LoginForm } from "./pages/LoginPage/Login.jsx";
import { Messenger } from "./pages/MainPage/Messenger.jsx";
import LoginSuccess from "./components/test/LoginSuccess.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/messenger" element={<Messenger />} />
    </Routes>
  );
}

export default App;
