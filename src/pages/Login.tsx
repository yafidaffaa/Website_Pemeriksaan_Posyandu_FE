import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string; global?: string }>({});
  const navigate = useNavigate();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: any = {};
    if (!username.trim()) newErrors.username = "Username wajib diisi";
    if (!password.trim()) newErrors.password = "Password wajib diisi";
    else if (password.length < 6) newErrors.password = "Password minimal 6 karakter";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await API.post("/api/auth/login", { username, password });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/home");
      } else {
        setErrors({ global: response.data.message || "Login gagal" });
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setErrors({ global: err.response.data.message });
      } else {
        setErrors({ global: "Terjadi kesalahan saat login" });
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-[900px]">
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-teal-500 to-teal-400 text-white p-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3">Selamat Datang!</h1>
            <p className="text-lg opacity-90">Posyandu</p>
            <p className="text-sm opacity-80 mt-1">Bunga Lily Gendeng</p>
          </div>
        </div>

        <div className="flex flex-col justify-center w-full md:w-1/2 p-6 sm:p-8 md:p-14">
          <div className="md:hidden mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-600 mb-2">Selamat Datang!</h1>
            <p className="text-sm text-gray-600">Posyandu Bunga Lily Gendeng</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full border rounded-full px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                  errors.username ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-400"
                }`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-2 ml-2">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-2 ml-2">{errors.password}</p>}
            </div>

            {errors.global && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm text-center">{errors.global}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-semibold py-3 rounded-full hover:from-teal-600 hover:to-teal-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Login
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6 md:hidden">
            © 2025 Posyandu Bunga Lily Gendeng. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;