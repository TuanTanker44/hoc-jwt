import { createContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Hàm login
  const login = async (username, password) => {
    console.log("Attempting login...");
    try {
      const loginRes = await axios.post(
        "http://localhost:5000/v1/auth/login",
        { username, password },
        { withCredentials: true },
      );
      setAccessToken(loginRes.data.accessToken);

      console.log("Login successful, access token:", loginRes.data.accessToken);

      // Gọi API /me để lấy thông tin user
      try {
        const meRes = await axios.get("http://localhost:5000/v1/user/me", {
          headers: {
            Authorization: `Bearer ${loginRes.data.accessToken}`,
          },
          withCredentials: true,
        });
        setCurrentUser(meRes.data);
      } catch (meErr) {
        console.error("Failed to fetch user profile:", meErr);
        setCurrentUser(null);
      }
    } catch (loginErr) {
      console.error("Login failed", loginErr);
      throw loginErr;
    }
  };

  // Hàm logout
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/v1/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setCurrentUser(null);
    }
  };

  const getChatItems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/v1/user/me/chatItems",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        },
      );
      return res.data;
    } catch (err) {
      console.error("Failed to fetch chat items", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        currentUser,
        setCurrentUser,
        login,
        logout,
        getChatItems,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
