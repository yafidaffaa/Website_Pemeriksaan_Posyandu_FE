import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  HeartPulse,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axiosInstance";

const Pasien = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getInitialFilter = (): "balita" | "ibuHamil" => {
    if (location.state?.filter) {
      return location.state.filter;
    }
    const savedFilter = localStorage.getItem("lastPatientFilter");
    if (savedFilter === "balita" || savedFilter === "ibuHamil") {
      return savedFilter as "balita" | "ibuHamil";
    }
    return "balita";
  };

  const [filter, setFilter] = useState<"balita" | "ibuHamil">(getInitialFilter());
  const [dataPasien, setDataPasien] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const kader = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    localStorage.setItem("lastPatientFilter", filter);
  }, [filter]);

  const fetchPasien = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await API.get("/api/pasien", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.data;

      if (data.success) {
        setDataPasien(data.data || []);
      } else {
        console.error("Gagal memuat data pasien:", data.message);
      }
    } catch (error) {
      console.error("Error fetch pasien:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/api/auth/logout", {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastPatientFilter");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchPasien();
  }, []);

  const handleNavigation = (name: string) => {
    setOpen(false);
    if (name === "Halaman Utama") navigate("/home");
    else if (name === "Data Pasien") navigate("/pasien");
    else if (name === "Pemeriksaan") navigate("/checkup");
    else if (name === "Logout") handleLogout();
  };

  const filteredData = dataPasien
    .filter((item) =>
      filter === "balita"
        ? item.patientType === "balita"
        : item.patientType === "ibu_hamil"
    )
    .filter((item) => item.name?.toLowerCase().includes(search.toLowerCase()));

  const handleRowClick = (id: number) => {
    navigate(
      `/detailpasien/${id}?type=${filter === "ibuHamil" ? "ibu_hamil" : "balita"}`,
      { state: { filter } }
    );
  };

  const handleTambahPasien = () => {
    navigate(`/tambahpasien?type=${filter}`, { state: { filter } });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50 to-white text-gray-800 relative overflow-hidden">
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40
          bg-teal-700 text-white border-r border-teal-800 shadow-2xl
          transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/30">
          <div className="flex items-center justify-between p-1">
            <div>
              <h2 className="font-bold text-xl tracking-wide text-white drop-shadow-lg">
                POSYANDU
              </h2>
              <p className="text-xs text-white/80 mt-1">Bunga Lily Gendeng</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition md:hidden"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="flex flex-col space-y-2 p-4">
          {[
            { name: "Halaman Utama", icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: "Data Pasien", icon: <Users className="w-5 h-5" /> },
            { name: "Pemeriksaan", icon: <HeartPulse className="w-5 h-5" /> },
            { name: "Logout", icon: <LogOut className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.name)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-white hover:bg-white/20 transition-all duration-200"
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <main
        className={`flex-1 p-6 md:p-8 transition-all duration-500 ${open ? "blur-sm scale-[0.98]" : ""
          }`}
      >
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 bg-teal-600 text-white rounded-md shadow-lg hover:bg-teal-700 transition"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div>
            <h1 className="text-3xl font-bold text-teal-700">
              Data Pasien {filter === "balita" ? "Balita" : "Ibu Hamil"}
            </h1>
            <p className="text-gray-600">{kader?.nama_lengkap || "-"}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter("balita")}
              className={`px-5 py-2 rounded-full font-medium shadow transition-all duration-200 ${filter === "balita"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white border border-teal-400 text-teal-600 hover:bg-teal-50"
                }`}
            >
              Balita
            </button>
            <button
              onClick={() => setFilter("ibuHamil")}
              className={`px-5 py-2 rounded-full font-medium shadow transition-all duration-200 ${filter === "ibuHamil"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white border border-teal-400 text-teal-600 hover:bg-teal-50"
                }`}
            >
              Ibu Hamil
            </button>
          </div>

          <button
            onClick={handleTambahPasien}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-teal-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        </div>

        <div className="flex items-center bg-white rounded-lg shadow px-4 py-2 mb-6">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Cari nama ${filter === "balita" ? "balita..." : "ibu hamil..."
              }`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-3 w-full outline-none text-gray-700"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data pasien.
            </div>
          ) : (
            <table className="w-full border-collapse rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-teal-700 text-white text-left">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">
                    {filter === "balita" ? "Nama Ibu" : "Nama Suami"}
                  </th>
                  <th className="px-4 py-3">RT</th>
                  <th className="px-4 py-3">JK</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item: any) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    className="border-b last:border-none hover:bg-teal-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      {filter === "balita" ? item.motherName : item.namaSuami}
                    </td>
                    <td className="px-4 py-3">{item.rt}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${item.gender === "P"
                            ? "bg-pink-100 text-pink-600"
                            : "bg-blue-100 text-blue-600"
                          }`}
                      >
                        {item.gender}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          © 2025 Posyandu Bunga Lily Gendeng. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default Pasien;