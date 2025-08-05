import { useState } from "react";
import login_bg from "../../assets/login_bg.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/v1/auth/login", {
        username,
        password,
      });

      // Lưu token hoặc thông tin xác thực nếu cần
      localStorage.setItem("token", res.data.token);

      // Chuyển hướng
      navigate("/messenger");
    } catch (error) {
      alert("Đăng nhập thất bại", error);
    }
  };

  const handleToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div
      className="h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: `url(${login_bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-[38rem] rounded-[50px] p-[50px] flex gap-x-[10px]">
        <form
          className="w-[32rem] rounded-[40px] bg-blend-multiply p-[50px] flex gap-x-[10px] border-4 flex-col items-center"
          onSubmit={handleLogin}
        >
          <p className="font-[700] text-[24px] text-[#fb6f92]">
            Chào mừng quay trở lại!
          </p>
          <p className="font-[700] text-[27px] mb-[25px]">
            Đăng nhập tài khoản của bạn
          </p>
          <div className="relative mb-[25px]">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="peer w-[22rem] border-2 border-[#000] rounded-[10px] pl-[20px] h-[44px] 
                            focus:border-[#fb6f92] focus:outline-none"
            />
            <label
              htmlFor="password"
              className={`absolute left-[20px] transition-all bg-white px-[3px] 
                    ease-in-out duration-200 
                    ${username ? "text-[black]" : "text-[grey]"}
                    ${
                      username
                        ? "top-[-13px] text-[#fb6f92] font-[600] text-[18px] pl-[3px] pr-[3px] bg-[#FEEEFB]"
                        : "top-[3px] text-[24px]"
                    }
                    peer-focus:top-[-13px] peer-focus:text-[#fb6f92] 
                    peer-focus:font-[600] peer-focus:text-[18px] peer-focus:pl-[3px] peer-focus:pr-[3px] peer-focus:bg-[#FEEEFB]`}
            >
              Tài khoản
            </label>
          </div>
          <div className="relative mb-[25px]">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-[22rem] border-2 border-[#000] rounded-[10px] pl-[20px] h-[44px] 
                            focus:border-[#fb6f92] focus:outline-none"
            />
            <label
              htmlFor="password"
              className={`absolute left-[20px] transition-all bg-white px-[3px] 
                    ease-in-out duration-200 
                    ${password ? "text-[black]" : "text-[grey]"}
                    ${
                      password
                        ? "top-[-13px] text-[#fb6f92] font-[600] text-[18px] pl-[3px] pr-[3px] bg-[#F3D8F2]"
                        : "top-[3px] text-[24px]"
                    }
                    peer-focus:top-[-13px] peer-focus:text-[#fb6f92] 
                    peer-focus:font-[600] peer-focus:text-[18px] peer-focus:pl-[3px] peer-focus:pr-[3px] peer-focus:bg-[#F3D8F2]`}
            >
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={handleToggleShowPassword}
              className={`absolute right-[8px] top-[5px] p-[5px] bg-[#EAD4EC]
                            ${password ? "block" : "hidden"}
                        `}
            >
              <i
                className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
              ></i>
            </button>
          </div>
          <button className="w-[25rem] h-[50px] bg-[#ff8fab] cursor-pointer mb-[10px] font-[600] hover:bg-[#90e0ef]">
            <i className="fa-solid fa-user mr-[10px] text-[22px]"></i>
            <span className="text-[22px]">Đăng nhập</span>
          </button>
          <p className="text-[20px] font-[600] mb-[10px]">Hoặc</p>
          <button className="w-[25rem] h-[50px] bg-[#ff8fab] cursor-pointer font-[600] hover:bg-[#90e0ef]">
            <span className="text-[22px]">Tạo tài khoản</span>
          </button>
        </form>
      </div>
    </div>
  );
};
