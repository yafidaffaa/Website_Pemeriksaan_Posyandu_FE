import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, UserPlus, User, Calendar, Phone, MapPin, Baby, Heart, Loader } from "lucide-react";
import CustomAlert, { ConfirmDialog } from "../../components/CustomAlert";
import API from "../../api/axiosInstance";

export default function DetailPasien() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [pasien, setPasien] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    suggestion?: string;
    shouldNavigateOnClose?: boolean;
  }>({ show: false, type: 'info', title: '', message: '', shouldNavigateOnClose: false });

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  const queryParams = new URLSearchParams(location.search);
  const rawType = queryParams.get("type");

  const type =
    rawType?.toLowerCase() === "ibu_hamil" || rawType?.toLowerCase() === "ibu"
      ? "ibu_hamil"
      : "balita";

  useEffect(() => {
    const fetchDetailPasien = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await API.get(`/api/pasien/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPasien(response.data.data);
      } catch (err) {
        console.error("Gagal mengambil data pasien:", err);
        setAlert({
          show: true,
          type: 'error',
          title: 'Gagal Memuat Data',
          message: 'Tidak dapat mengambil data pasien dari server.',
          suggestion: 'Periksa koneksi internet Anda atau coba lagi nanti.',
          shouldNavigateOnClose: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetailPasien();
  }, [id]);

  const handleHapus = async () => {
    setConfirmDialog({
      show: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus pasien ini? Data yang dihapus tidak dapat dikembalikan.',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, show: false });
        try {
          const token = localStorage.getItem("token");
          await API.delete(`/api/pasien/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setAlert({
            show: true,
            type: 'success',
            title: 'Berhasil Dihapus',
            message: 'Data pasien berhasil dihapus dari sistem.',
            suggestion: 'Anda akan diarahkan kembali ke halaman daftar pasien.',
            shouldNavigateOnClose: true
          });
        } catch (err) {
          console.error("Gagal menghapus pasien:", err);
          setAlert({
            show: true,
            type: 'error',
            title: 'Gagal Menghapus',
            message: 'Terjadi kesalahan saat menghapus data pasien.',
            suggestion: 'Silakan coba lagi atau hubungi administrator jika masalah berlanjut.'
          });
        }
      }
    });
  };

  const handleAntrean = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
      "/api/pasien/add-to-queue",
        {
          pasienId: id,
          tanggal: new Date().toISOString().slice(0, 10),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlert({
        show: true,
        type: 'success',
        title: 'Berhasil Ditambahkan',
        message: 'Pasien berhasil ditambahkan ke antrian hari ini.',
        suggestion: 'Pasien dapat segera dipanggil untuk pemeriksaan.'
      });
    } catch (err: any) {
      console.error("Gagal menambahkan ke antrean:", err);
      setAlert({
        show: true,
        type: 'error',
        title: 'Gagal Menambahkan ke Antrian',
        message: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan pasien ke antrian.',
        suggestion: 'Pastikan pasien belum ada dalam antrian hari ini.'
      });
    }
  };

  const handleEdit = () => {
    navigate(`/editpasien/${id}?type=${type}`);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleAlertClose = () => {
    if (alert.shouldNavigateOnClose) {
      navigate("/pasien");
    } else {
      setAlert({ ...alert, show: false });
    }
  };

  const renderField = (label: string, value: any, icon?: React.ReactNode) => (
    <div className="py-3 px-4 hover:bg-teal-50 rounded-lg transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <div className="text-teal-600 flex-shrink-0">{icon}</div>}
          <span className="font-medium text-gray-600 text-sm">{label}</span>
        </div>
        <span className="text-gray-800 text-right font-medium whitespace-pre-line flex-shrink-0">
          {value || "-"}
        </span>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (type === "balita") {
      return (
        <div className="space-y-1">
          {renderField("Nama Balita", pasien.name, <Baby className="w-4 h-4" />)}
          {renderField("Nama Ibu", pasien.motherName, <User className="w-4 h-4" />)}
          {renderField(
            "Jenis Kelamin", 
            pasien.gender === "L" ? "Laki-laki" : pasien.gender === "P" ? "Perempuan" : "-",
            <User className="w-4 h-4" />
          )}
          {renderField("RT", pasien.rt, <MapPin className="w-4 h-4" />)}
          {renderField("Tanggal Lahir", pasien.birthDate, <Calendar className="w-4 h-4" />)}
          {renderField("Umur (minggu)", pasien.ageInWeeks, <Calendar className="w-4 h-4" />)}
          {renderField(
            "Imunisasi",
            Array.isArray(pasien.imunisasi)
              ? pasien.imunisasi.map((i: string) => `• ${i}`).join("\n")
              : pasien.imunisasi,
            <Heart className="w-4 h-4" />
          )}
          {renderField("Jenis KB", pasien.kb)}
          {renderField("PUS", pasien.pus === "Ya" ? "Ya" : pasien.pus === "Tidak" ? "Tidak" : "-")}
          {renderField("WUS", pasien.wus === "Ya" ? "Ya" : pasien.wus === "Tidak" ? "Tidak" : "-")}
        </div>
      );
    } else if (type === "ibu_hamil") {
      return (
        <div className="space-y-1">
          {renderField("Nama Ibu Hamil", pasien.name, <User className="w-4 h-4" />)}
          {renderField("Nama Suami", pasien.namaSuami, <User className="w-4 h-4" />)}
          {renderField("NIK", pasien.nik)}
          {renderField("No KK", pasien.noKK)}
          {renderField("RT", pasien.rt, <MapPin className="w-4 h-4" />)}
          {renderField("Tanggal Lahir", pasien.birthDate, <Calendar className="w-4 h-4" />)}
          {renderField("Umur (tahun)", pasien.ageInYears)}
          {renderField("Gravida", pasien.gravida)}
          {renderField("Partus", pasien.partus)}
          {renderField("Abortus", pasien.abortus)}
          {renderField("Jarak Persalinan Sebelumnya (bulan)", pasien.jarakPersalinanSebelumnya)}
          {renderField("Usia Kandungan (minggu)", pasien.usiaKandunganMinggu)}
          {renderField("Tanggal Pemeriksaan Pertama", pasien.tglPemeriksaanPertama, <Calendar className="w-4 h-4" />)}
          {renderField("HPM", pasien.hpm, <Calendar className="w-4 h-4" />)}
          {renderField("HPL", pasien.hpl, <Calendar className="w-4 h-4" />)}
          {renderField("Golongan Darah", pasien.golonganDarah)}
          {renderField("Nomor Jaminan", pasien.nomorJaminan)}
          {renderField("No Telepon", pasien.noTelp, <Phone className="w-4 h-4" />)}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <Loader className="w-16 h-16 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data pasien...</p>
        </div>
      </div>
    );
  }

  if (!pasien) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Data pasien yang Anda cari tidak tersedia.</p>
          <button
            onClick={handleClose}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {alert.show && (
        <CustomAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          suggestion={alert.suggestion}
          onClose={handleAlertClose}
        />
      )}

      {confirmDialog.show && (
        <ConfirmDialog
          type="danger"
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        />
      )}

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 py-8">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                {type === "balita" ? (
                  <Baby className="w-6 h-6 text-white" />
                ) : (
                  <Heart className="w-6 h-6 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                Detail {type === "balita" ? "Balita" : "Ibu Hamil"}
              </h2>
            </div>

            <div className="w-20"></div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4 text-teal-700">
                Informasi Pasien
              </h3>
              {renderDetail()}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleAntrean}
                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Tambah ke Antrean
              </button>
              <button
                onClick={handleHapus}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Pastikan data yang ditampilkan sudah sesuai sebelum melakukan perubahan
            </p>
          </div>
        </div>
      </div>
    </>
  );
}