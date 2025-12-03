import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  HeartPulse,
  LogOut,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import API from "../api/axiosInstance";

const COLORS = ["#dc2626", "#0d9488"];

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [kaderName, setKaderName] = useState("Kader");
  const [role, setRole] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const [statistik, setStatistik] = useState({
    balita: 0,
    ibu_hamil: 0,
    total: 0,
  });

  const [stuntingStats, setStuntingStats] = useState({
    balita: { stunting: 0, tidakStunting: 0 },
    ibu_hamil: { stunting: 0, tidakStunting: 0 }
  });

  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setKaderName(parsedUser.nama_lengkap || "Kader");
        setRole(parsedUser.role || "");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStatistik = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/pasien/statistik", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        if (data?.data) {
          setStatistik({
            balita: data.data.jumlahBalita,
            ibu_hamil: data.data.jumlahIbuHamil,
            total: data.data.totalPasien,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data statistik pasien:", error);
      }
    };

    fetchStatistik();
  }, []);

  useEffect(() => {
    const fetchStuntingStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(
          "/api/measurement/statistics/stunting",
          {
            params: { month: bulan, year: tahun },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data;
        if (data?.data) {
          setStuntingStats({
            balita: {
              stunting: data.data.balita.stunting,
              tidakStunting: data.data.balita.tidakStunting
            },
            ibu_hamil: {
              stunting: data.data.ibu_hamil.stunting,
              tidakStunting: data.data.ibu_hamil.tidakStunting
            }
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data statistik stunting:", error);
      }
    };

    fetchStuntingStats();
  }, [bulan, tahun]);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(
          `/api/measurement/statistics/trends`,
          {
            params: { month: bulan, year: tahun },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.data;
        if (data?.data) {
          setTrendData(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data trend stunting:", error);
      }
    };

    fetchTrendData();
  }, [bulan, tahun]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post("/api/auth/logout", {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  const handleNavigation = (name: string) => {
    setOpen(false);
    if (name === "Halaman Utama") window.location.href = "/home";
    else if (name === "Data Pasien") window.location.href = "/pasien";
    else if (name === "Pemeriksaan") window.location.href = "/checkup";
    else if (name === "Logout") handleLogout();
  };

  const menuItems = [
    { name: "Halaman Utama", icon: <LayoutDashboard className="w-5 h-5" /> },
    ...(role === "meja1" ? [{ name: "Data Pasien", icon: <Users className="w-5 h-5" /> }] : []),
    { name: "Pemeriksaan", icon: <HeartPulse className="w-5 h-5" /> },
    { name: "Logout", icon: <LogOut className="w-5 h-5" /> },
  ];

  const dataBalitaPie = [
    { name: "Stunting", value: stuntingStats.balita.stunting },
    { name: "Tidak Stunting", value: stuntingStats.balita.tidakStunting },
  ];
  const totalBalita = dataBalitaPie.reduce((acc, d) => acc + d.value, 0);

  const dataIbuPie = [
    { name: "Stunting", value: stuntingStats.ibu_hamil.stunting },
    { name: "Tidak Stunting", value: stuntingStats.ibu_hamil.tidakStunting },
  ];
  const totalIbu = dataIbuPie.reduce((acc, d) => acc + d.value, 0);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const CustomLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-6 bg-red-600 rounded relative overflow-hidden">
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)'
            }}>
          </div>
        </div>
        <span className="text-sm text-gray-700 font-medium">Balita Stunting</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-6 bg-teal-600 rounded relative overflow-hidden">
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.4) 3px, rgba(0,0,0,0.4) 6px)'
            }}>
          </div>
        </div>
        <span className="text-sm text-gray-700 font-medium">Balita Tidak Stunting</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-6 bg-red-600 rounded"></div>
        <span className="text-sm text-gray-700 font-medium">Ibu Hamil Stunting</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-6 bg-teal-600 rounded"></div>
        <span className="text-sm text-gray-700 font-medium">Ibu Hamil Tidak Stunting</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50 to-white text-gray-800 relative overflow-hidden">
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 bg-teal-700 text-white border-r border-teal-800 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${open ? "translate-x-0" : "-translate-x-full"
          }`}
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
          {menuItems.map((item) => (
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
            <h1 className="text-3xl font-bold text-teal-700">Halaman Utama</h1>
            <p className="text-gray-600">{kaderName}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Balita", value: statistik.balita },
            { label: "Ibu Hamil", value: statistik.ibu_hamil },
            { label: "Total", value: statistik.total }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-4xl font-bold">{item.value}</h2>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium">Periode:</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {monthNames.map((b, idx) => (
                <option key={idx} value={idx + 1}>{b}</option>
              ))}
            </select>

            <select
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {[2023, 2024, 2025, 2026].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 italic">
            Menampilkan data untuk {monthNames[bulan - 1]} {tahun}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="font-semibold mb-4 text-gray-700">
              Grafik Balita Stunting & Tidak Stunting
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Periode: {monthNames[bulan - 1]} {tahun}
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span className="text-xs text-gray-600 font-medium">Stunting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-teal-600"></div>
                <span className="text-xs text-gray-600 font-medium">Tidak Stunting</span>
              </div>
            </div>

            <div className="relative h-64 flex justify-center items-center">
              {totalBalita > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataBalitaPie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        label
                      >
                        {dataBalitaPie.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold text-teal-700">{totalBalita}</p>
                    <p className="text-gray-500 text-sm">Total Balita</p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-2">Belum ada data</p>
                  <p className="text-xs text-gray-400">untuk periode {monthNames[bulan - 1]} {tahun}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="font-semibold mb-4 text-gray-700">
              Grafik Ibu Hamil Stunting & Tidak Stunting
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Periode: {monthNames[bulan - 1]} {tahun}
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span className="text-xs text-gray-600 font-medium">Stunting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-teal-600"></div>
                <span className="text-xs text-gray-600 font-medium">Tidak Stunting</span>
              </div>
            </div>

            <div className="relative h-64 flex justify-center items-center">
              {totalIbu > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataIbuPie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        label
                      >
                        {dataIbuPie.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold text-teal-700">{totalIbu}</p>
                    <p className="text-gray-500 text-sm">Total Ibu Hamil</p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-2">Belum ada data</p>
                  <p className="text-xs text-gray-400">untuk periode {monthNames[bulan - 1]} {tahun}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition mb-12">
          <h3 className="font-semibold mb-4 text-gray-700">
            Grafik Pertumbuhan Stunting - 4 Bulan Terakhir
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Menampilkan data {monthNames[bulan - 1]} {tahun} dan 3 bulan sebelumnya
          </p>

          {trendData.length > 0 ? (
            <>
              <CustomLegend />

              {!isMobile ? (
                <ResponsiveContainer width="100%" height={450}>
                  <ComposedChart data={trendData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-15}
                      textAnchor="end"
                      height={80}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, (dataMax) => Math.max(30, Math.ceil(dataMax))]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                    <Bar
                      dataKey="balitaStunting"
                      fill="url(#stripesRedBlack)"
                      name="Balita Stunting"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="balitaTidakStunting"
                      fill="url(#stripesTealBlack)"
                      name="Balita Tidak Stunting"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="ibuHamilStunting"
                      fill="#dc2626"
                      name="Ibu Hamil Stunting"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="ibuHamilTidakStunting"
                      fill="#0d9488"
                      name="Ibu Hamil Tidak Stunting"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <pattern id="stripesRedBlack" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill="#dc2626" />
                        <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
                      </pattern>
                      <pattern id="stripesTealBlack" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <rect width="6" height="6" fill="#0d9488" />
                        <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
                      </pattern>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={600}>
                    <ComposedChart
                      data={trendData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        style={{ fontSize: '11px' }}
                        allowDecimals={false}
                        domain={[0, (dataMax) => Math.max(30, Math.ceil(dataMax))]}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        style={{ fontSize: '11px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                      />
                      <Bar
                        dataKey="balitaStunting"
                        fill="url(#stripesRedBlack)"
                        name="Balita Stunting"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="balitaTidakStunting"
                        fill="url(#stripesTealBlack)"
                        name="Balita Tidak Stunting"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="ibuHamilStunting"
                        fill="#dc2626"
                        name="Ibu Hamil Stunting"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="ibuHamilTidakStunting"
                        fill="#0d9488"
                        name="Ibu Hamil Tidak Stunting"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      />
                      <defs>
                        <pattern id="stripesRedBlack" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                          <rect width="6" height="6" fill="#dc2626" />
                          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
                        </pattern>
                        <pattern id="stripesTealBlack" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                          <rect width="6" height="6" fill="#0d9488" />
                          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
                        </pattern>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">Belum ada data untuk periode ini</p>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          © 2025 Posyandu Bunga Lily Gendeng. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;