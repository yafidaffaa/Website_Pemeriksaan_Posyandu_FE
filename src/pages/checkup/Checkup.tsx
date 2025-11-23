import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  HeartPulse,
  LogOut,
  Search,
  Printer,
} from "lucide-react";
import DetailCheckup from "./DetailCheckup";
import CustomAlert from "../../components/CustomAlert";
import API from "../../api/axiosInstance";

const Checkup = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("balita");
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  
  interface CheckupItem {
    id: number;
    patient?: {
      name?: string;
      motherName?: string;
      rt?: string;
      gender?: string;
      ageInYears?: number;
    };
    completed?: boolean;
    isDataComplete?: boolean;
  }

  const [dataCheckup, setDataCheckup] = useState<CheckupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [selectedCheckup, setSelectedCheckup] = useState<CheckupItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    suggestion?: string;
  }>({ show: false, type: 'info', title: '', message: '' });
  
  const navigate = useNavigate();

  const bulanList = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const tahunList = Array.from({ length: 5 }, (_, i) => 2023 + i);

  const getToken = () => localStorage.getItem("token");
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const namaKader = getUser()?.nama_lengkap || "Kader";

  useEffect(() => {
    const user = getUser();
    setRole(user.role || "");
  }, []);

  const handleLogout = async () => {
    try {
      await API.post(
      "/api/auth/logout",
      {}, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const handleNavigation = (name: string) => {
    setOpen(false);
    if (name === "Halaman Utama") navigate("/home");
    else if (name === "Data Pasien") navigate("/pasien");
    else if (name === "Pemeriksaan") navigate("/checkup");
    else if (name === "Logout") handleLogout();
  };

  const fetchCheckupData = async () => {
    try {
      setLoading(true);
      const month = String(filterBulan).padStart(2, "0");
      const year = filterTahun;
      const patientType = filter === "ibuHamil" ? "ibu_hamil" : "balita";

      const response = await API.get(
        `/api/checkup?month=${month}&year=${year}&patientType=${patientType}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = response.data;

      if (result.success) {
        setDataCheckup(result.data || []);
      } else {
        setDataCheckup([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data checkup:", error);
      setDataCheckup([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckupData();
  }, [filter, filterBulan, filterTahun]);

  const filteredData = dataCheckup.filter((item) => {
    const patient = item.patient || {};
    const keyword = search.toLowerCase();

    if (filter === "balita") {
      return (
        patient.name?.toLowerCase().includes(keyword) ||
        patient.motherName?.toLowerCase().includes(keyword)
      );
    } else {
      return patient.name?.toLowerCase().includes(keyword);
    }
  });

  const handlePrint = async (
  type: "puskesmas" | "penerima-manfaat"
): Promise<void> => {
  try {
    const month = String(filterBulan).padStart(2, "0");
    const year = filterTahun;
    const patientType = filter === "ibuHamil" ? "ibu_hamil" : "balita";
    const patientTypeLabel = filter === "ibuHamil" ? "Ibu Hamil" : "Balita";
    const monthName =
      bulanList.find((b) => b.value === filterBulan)?.label || month;

    let endpoint = "";
    let typeLabel = "";

    if (type === "puskesmas") {
      endpoint = "/api/measurement/export/puskesmas";
      typeLabel = "Puskesmas";
    } else {
      endpoint = "/api/measurement/export/penerima-manfaat";
      typeLabel = "Penerima Manfaat";
    }

    const url =
      type === "penerima-manfaat"
        ? `${endpoint}?month=${month}&year=${year}`
        : `${endpoint}?month=${month}&year=${year}&patientType=${patientType}`;

    const response = await API.get(url, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;

    const filename =
      type === "penerima-manfaat"
        ? `Penerima_Manfaat_Ibu_Hamil_${monthName}_${year}.xlsx`
        : `Laporan_${typeLabel}_${patientTypeLabel}_${monthName}_${year}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
    setShowExportModal(false);

    setAlert({
      show: true,
      type: "success",
      title: "Laporan Berhasil Diunduh",
      message: `Laporan ${typeLabel} ${
        type === "penerima-manfaat"
          ? "Ibu Hamil"
          : `untuk ${patientTypeLabel}`
      } bulan ${monthName} ${year} berhasil diunduh.`,
      suggestion:
        "File Excel telah tersimpan di folder Downloads Anda. Anda dapat membukanya dengan Microsoft Excel atau aplikasi spreadsheet lainnya.",
    });
  } catch (error: any) {
    console.error("Gagal mencetak laporan:", error);

    setAlert({
      show: true,
      type: "error",
      title: "Gagal Mencetak Laporan",
      message: error.message || "Terjadi kesalahan saat mencetak laporan.",
      suggestion:
        "Pastikan koneksi stabil dan data tersedia untuk periode yang dipilih. Jika masalah berlanjut, hubungi administrator.",
    });
  }
};


  const handleRowClick = async (item: CheckupItem) => {
    setSelectedCheckup(item);
  };

  const handleCloseDetail = () => {
    setSelectedCheckup(null);
    fetchCheckupData();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50 to-white text-gray-800 relative">
      {/* Custom Alert */}
      {alert.show && (
        <CustomAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          suggestion={alert.suggestion}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 bg-teal-700 text-white border-r border-teal-800 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/20">
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
            ...(role === "meja1"
              ? [{ name: "Data Pasien", icon: <Users className="w-5 h-5" /> }]
              : []),
            { name: "Pemeriksaan", icon: <HeartPulse className="w-5 h-5" /> },
            { name: "Logout", icon: <LogOut className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.name)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-white/20 transition-all duration-200"
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
        className={`flex-1 p-6 md:p-8 transition-all duration-500 overflow-x-auto ${
          open ? "blur-sm scale-[0.98]" : ""
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
              Pemeriksaan {filter === "balita" ? "Balita" : "Ibu Hamil"}
            </h1>
            <p className="text-gray-600">{namaKader}</p>
          </div>
        </div>

        {/* Filter Section - Split Layout */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left: Filter Balita/Ibu Hamil */}
            <div className="flex gap-3">
              <button
                onClick={() => setFilter("balita")}
                className={`px-5 py-2 rounded-full font-medium shadow transition-all duration-200 ${
                  filter === "balita"
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white border border-teal-400 text-teal-600 hover:bg-teal-50"
                }`}
              >
                Balita
              </button>
              <button
                onClick={() => setFilter("ibuHamil")}
                className={`px-5 py-2 rounded-full font-medium shadow transition-all duration-200 ${
                  filter === "ibuHamil"
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white border border-teal-400 text-teal-600 hover:bg-teal-50"
                }`}
              >
                Ibu Hamil
              </button>
            </div>

            {/* Right: Bulan, Tahun, Cetak */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Bulan */}
              <div className="flex items-center gap-2">
                <label htmlFor="bulan" className="text-gray-700 font-medium whitespace-nowrap">
                  Bulan:
                </label>
                <select
                  id="bulan"
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(Number(e.target.value))}
                  className="border border-teal-400 rounded-full px-4 py-2 text-gray-700 bg-white shadow-sm"
                >
                  {bulanList.map((bulan) => (
                    <option key={bulan.value} value={bulan.value}>
                      {bulan.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Tahun */}
              <div className="flex items-center gap-2">
                <label htmlFor="tahun" className="text-gray-700 font-medium whitespace-nowrap">
                  Tahun:
                </label>
                <select
                  id="tahun"
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(Number(e.target.value))}
                  className="border border-teal-400 rounded-full px-4 py-2 text-gray-700 bg-white shadow-sm"
                >
                  {tahunList.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Cetak */}
              {role === "meja1" && (
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white rounded-lg shadow px-4 py-2 mb-6">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Cari ${
              filter === "balita"
                ? "nama ibu atau anak..."
                : "nama ibu hamil..."
            }`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-3 w-full outline-none text-gray-700"
          />
        </div>

        <div className="w-full overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border-collapse bg-white">
            <thead>
              {filter === "balita" ? (
                <tr className="bg-teal-700 text-white text-left">
                  <th className="px-4 py-3">Nama Anak</th>
                  <th className="px-4 py-3">Nama Ibu</th>
                  <th className="px-4 py-3">RT</th>
                  <th className="px-4 py-3">JK</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              ) : (
                <tr className="bg-teal-700 text-white text-left">
                  <th className="px-4 py-3">Nama Ibu Hamil</th>
                  <th className="px-4 py-3">RT</th>
                  <th className="px-4 py-3">Umur (Tahun)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-gray-500 italic">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-gray-500 italic">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const patient = item.patient || {};
                  const status = item.completed || item.isDataComplete;

                  return filter === "balita" ? (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-4 py-3">{patient.name}</td>
                      <td className="px-4 py-3">{patient.motherName || "-"}</td>
                      <td className="px-4 py-3">{patient.rt}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                            patient.gender === "P"
                              ? "bg-pink-100 text-pink-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {patient.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            status
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {status ? "Sudah Lengkap" : "Belum Lengkap"}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="border-b last:border-none hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-4 py-3">{patient.name}</td>
                      <td className="px-4 py-3">{patient.rt}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {patient.ageInYears || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            status
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {status ? "Sudah Lengkap" : "Belum Lengkap"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          © 2025 Posyandu Bunga Lily Gendeng. All rights reserved.
        </footer>
      </main>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-teal-700 mb-4">
              Pilih Jenis Laporan
            </h3>
            <p className="text-gray-600 mb-6">
              Pilih format laporan yang ingin Anda unduh untuk {filter === "balita" ? "Balita" : "Ibu Hamil"}
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handlePrint("puskesmas")}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-400 rounded-lg transition"
              >
                <div className="text-left">
                  <span className="font-medium text-blue-700 block">Laporan Puskesmas</span>
                  <span className="text-xs text-blue-600">Format puskesmas Bangunjiwo</span>
                </div>
                <Printer className="w-5 h-5 text-blue-600" />
              </button>

              {filter === "ibuHamil" && (
                <button
                  onClick={() => handlePrint("penerima-manfaat")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-400 rounded-lg transition"
                >
                  <div className="text-left">
                    <span className="font-medium text-purple-700 block">Penerima Manfaat</span>
                    <span className="text-xs text-purple-600">Data ibu hamil penerima manfaat</span>
                  </div>
                  <Printer className="w-5 h-5 text-purple-600" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {selectedCheckup && (
        <DetailCheckup
          data={selectedCheckup}
          type={filter === "balita" ? "balita" : "ibuHamil"}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Checkup;