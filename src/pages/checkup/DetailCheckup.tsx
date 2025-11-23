import { useState, useEffect } from "react";
import EditCheckup from "./EditCheckup";
import CustomAlert, { ConfirmDialog } from "../../components/CustomAlert";
import { ArrowLeft, Trash2, Edit, CheckCircle, Loader, Baby, Heart, User } from "lucide-react";
import API from "../../api/axiosInstance";

type DetailCheckupProps = {
  data: any;
  type: "balita" | "ibuHamil";
  onClose: () => void;
};

const DetailCheckup = ({ data, type, onClose }: DetailCheckupProps) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [role, setRole] = useState("");
  
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
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({ 
    show: false, 
    title: '', 
    message: '', 
    type: 'warning',
    onConfirm: () => {} 
  });

  const getToken = () => localStorage.getItem("token");
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const user = getUser();
    setRole(user.role || "");

    if (data?.id) {
      fetchDetails();
    }
  }, [data]);

  const fetchDetails = async () => {
    if (!data?.id) return;

    try {
      setLoading(true);
      const measurementResponse = await API.get(
        `/api/measurement/session/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const measurementResult = measurementResponse.data;

      if (measurementResult.success) {
        setDetailData(measurementResult.data);
        if (measurementResult.data?.checkup_session?.patient) {
          setPatientDetail(measurementResult.data.checkup_session.patient);
        }
      } else {
        setDetailData(null);
        setPatientDetail(null);
        
        if (measurementResult.message) {
          setAlert({
            show: true,
            type: 'warning',
            title: 'Belum Ada Data',
            message: measurementResult.message,
            suggestion: measurementResult.suggestion
          });
        }
      }
    } catch (error) {
      console.error("Gagal mengambil detail:", error);
      setAlert({
        show: true,
        type: 'error',
        title: 'Kesalahan Jaringan',
        message: 'Tidak dapat mengambil data pemeriksaan. Periksa koneksi internet Anda.',
        suggestion: 'Coba refresh halaman atau hubungi administrator jika masalah berlanjut.'
      });
      setDetailData(null);
      setPatientDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmDialog({
      show: true,
      title: 'Hapus Data Pemeriksaan',
      message: 'Apakah Anda yakin ingin menghapus data pemeriksaan ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, show: false });
        
        try {
          const response = await API.delete(`/api/checkup/${data.id}`, 
            {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const result = response.data;

          if (result.success) {
            setAlert({
              show: true,
              type: 'success',
              title: 'Berhasil Dihapus',
              message: result.message || 'Data pemeriksaan berhasil dihapus dari sistem.',
              suggestion: 'Data telah dihapus permanen dan tidak dapat dikembalikan.'
            });
            
          } else {
            setAlert({
              show: true,
              type: 'error',
              title: 'Gagal Menghapus',
              message: result.message || 'Tidak dapat menghapus data pemeriksaan.',
              suggestion: result.suggestion || 'Periksa hak akses Anda atau hubungi administrator.'
            });
          }
        } catch (error) {
          setAlert({
            show: true,
            type: 'error',
            title: 'Kesalahan Jaringan',
            message: 'Terjadi kesalahan saat menghapus data.',
            suggestion: 'Periksa koneksi internet Anda dan coba lagi.'
          });
        }
      }
    });
  };

  const handleComplete = () => {
    setConfirmDialog({
      show: true,
      title: 'Tandai Sebagai Selesai',
      message: 'Apakah Anda yakin ingin menandai pemeriksaan ini sebagai selesai? Data tidak dapat diubah setelah ditandai selesai.',
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, show: false });
        
        try {
          const response = await API.put(`/api/checkup/complete/${data.id}`, {}, 
            {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          });
          const result = response.data;

          if (result.success) {
            setAlert({
              show: true,
              type: 'success',
              title: 'Status Diperbarui',
              message: result.message || 'Pemeriksaan telah ditandai sebagai selesai.',
              suggestion: 'Data pemeriksaan ini sudah lengkap dan tidak dapat diubah lagi.'
            });

          } else {
            setAlert({
              show: true,
              type: 'error',
              title: 'Gagal Mengubah Status',
              message: result.message || 'Tidak dapat mengubah status pemeriksaan.',
              suggestion: result.suggestion || 'Periksa apakah pemeriksaan sudah lengkap.'
            });
          }
        } catch (error) {
          setAlert({
            show: true,
            type: 'error',
            title: 'Kesalahan Jaringan',
            message: 'Terjadi kesalahan saat mengubah status.',
            suggestion: 'Periksa koneksi internet Anda dan coba lagi.'
          });
        }
      }
    });
  };

  const canSeeField = (fieldName: string): boolean => {
    if (role === 'meja1') return true;
    
    if (role === 'meja2') {
      return !['counselingNotes', 'resiko'].includes(fieldName);
    }
    
    if (role === 'meja3') {
      return ['counselingNotes', 'resiko'].includes(fieldName);
    }
    
    return false;
  };

  const renderField = (label: string, value: any) => {
  const isCounseling = label.toLowerCase().includes("catatan konseling");

  return (
    <div className="py-3 px-4 hover:bg-teal-50 rounded-lg transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <span className="font-medium text-gray-600 text-sm flex-shrink-0">
          {label}
        </span>
        <span
          className={`text-gray-800 font-medium break-words whitespace-pre-wrap w-full sm:w-auto ${
            isCounseling ? "text-left" : "text-right"
          }`}
        >
          {value || "-"}
        </span>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <Loader className="w-16 h-16 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data pemeriksaan...</p>
        </div>
      </div>
    );
  }

  if (!data?.id) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Data Tidak Lengkap</h2>
          <p className="text-gray-600 mb-6">Data checkup belum lengkap atau ID tidak ditemukan.</p>
          <button
            onClick={onClose}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (editMode) {
    return (
      <EditCheckup
        checkupSessionId={data.id}
        measurementData={detailData}
        type={type}
        onClose={() => {
          setEditMode(false);
          fetchDetails();
        }}
      />
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
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        />
      )}

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
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
                Detail {type === "balita" ? "Pemeriksaan Balita" : "Pemeriksaan Ibu Hamil"}
              </h2>
            </div>

            <div className="w-20"></div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {(role === "meja1" || role === "meja2" || role === "meja3") && patientDetail && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-teal-700">
                  Data Pasien
                </h3>
                <div className="space-y-1">
                  {renderField("Nama", patientDetail?.name || data.patient?.name || "-")}
                  {type === "balita" && renderField("Nama Ibu", patientDetail?.motherName || data.patient?.motherName || "-")}
                  {renderField("RT", patientDetail?.rt || data.patient?.rt || "-")}
                  {renderField("Jenis Kelamin", patientDetail?.gender || data.patient?.gender || "-")}
                  {renderField("Tanggal Lahir", patientDetail?.birthDate || "-")}
                  {type === "ibuHamil" && (
                    <>
                      {renderField("NIK", patientDetail?.nik || "-")}
                      {renderField("Nama Suami", patientDetail?.namaSuami || "-")}
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-4 text-teal-700">
                Data Pemeriksaan
              </h3>

              {type === "balita" ? (
                <div className="space-y-1">
                  {canSeeField('ageMonths') && renderField("Umur (bulan)", detailData?.ageMonths)}
                  {canSeeField('weightKg') && renderField("Berat Badan (kg)", detailData?.weightKg)}
                  {canSeeField('heightCm') && renderField("Tinggi Badan (cm)", detailData?.heightCm)}
                  {canSeeField('headCircCm') && renderField("Lingkar Kepala (cm)", detailData?.headCircCm)}
                  {canSeeField('lilaCm') && renderField("LILA (cm)", detailData?.lilaCm)}
                  {canSeeField('asi') && renderField("ASI", detailData?.asi)}
                  {canSeeField('vitaminA') && renderField("Vitamin A", detailData?.vitaminA)}
                  
                  {canSeeField('statusGizi') && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-3">
                      <p className="text-sm text-blue-800 font-semibold mb-2">
                        📊 Status Gizi (Berdasarkan Z-Score BMI/U)
                      </p>
                      <p className="font-bold text-blue-900 text-xl mb-1">
                        {detailData?.statusGizi || "-"}
                      </p>
                      {detailData?.zScoreBMIU && (
                        <p className="text-xs text-blue-700 mb-1">
                          Z-Score BMI/U: {detailData.zScoreBMIU}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 italic">
                        Kategori: Gizi Buruk / Gizi Kurang / Normal / Gizi Lebih / Obesitas
                      </p>
                    </div>
                  )}
                  
                  {canSeeField('stuntingStatus') && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 my-3">
                      <p className="text-sm text-purple-800 font-semibold mb-2">
                        📏 Status Stunting (Berdasarkan Z-Score TB/U)
                      </p>
                      <p className="font-bold text-purple-900 text-xl mb-1">
                        {detailData?.stuntingStatus || "-"}
                      </p>
                      <p className="text-xs text-purple-600 italic">
                        Kategori: Sangat Pendek / Pendek / Normal / Tinggi
                      </p>
                    </div>
                  )}
                  
                  {canSeeField('counselingNotes') && renderField("Catatan Konseling", detailData?.counselingNotes)}
                </div>
              ) : (
                <div className="space-y-1">
                  {canSeeField('ageMonthsPregnant') && renderField("Usia Kehamilan (bulan)", detailData?.ageMonthsPregnant)}
                  {canSeeField('weightKgPregnant') && renderField("Berat Badan (kg)", detailData?.weightKgPregnant)}
                  {canSeeField('heightCmPregnant') && renderField("Tinggi Badan (cm)", detailData?.heightCmPregnant)}
                  {canSeeField('lilaCmPregnant') && renderField("LILA (cm)", detailData?.lilaCmPregnant)}
                  {canSeeField('tekananDarah') && renderField("Tekanan Darah", detailData?.tekananDarah)}
                  {canSeeField('proteinUrine') && renderField("Protein Urine", detailData?.proteinUrine)}
                  {canSeeField('reduksiUrine') && renderField("Reduksi Urine", detailData?.reduksiUrine)}
                  {canSeeField('testHiv') && renderField("Test HIV", detailData?.testHiv)}
                  {canSeeField('testSifilis') && renderField("Test Sifilis", detailData?.testSifilis)}
                  {canSeeField('testHbsAg') && renderField("Test HBsAg", detailData?.testHbsAg)}
                  {canSeeField('gds') && renderField("GDS", detailData?.gds)}
                  {canSeeField('ancTerpadu') && renderField("ANC Terpadu", detailData?.ancTerpadu)}
                  {canSeeField('HB') && renderField("HB (g/dL)", detailData?.HB)}
                  
                  {canSeeField('zScoreBMIPregnant') && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-3">
                      <p className="text-sm text-blue-800 font-semibold mb-2">
                        📊 Klasifikasi BMI Ibu Hamil
                      </p>
                      <p className="font-bold text-blue-900 text-xl mb-1">
                        {detailData?.statusGizi || detailData?.dataValues?.statusGizi || "-"}
                      </p>
                      {(detailData?.zScoreBMIPregnant || detailData?.dataValues?.zScoreBMIPregnant) && (
                        <p className="text-xs text-blue-700 mb-1">
                          Z-Score: {detailData?.zScoreBMIPregnant || detailData?.dataValues?.zScoreBMIPregnant}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 italic">
                        Kategori: Kurus (Underweight) / Normal / Kelebihan Berat Badan / Obesitas
                      </p>
                    </div>
                  )}
                  
                  {canSeeField('stuntingStatus') && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 my-3">
                      <p className="text-sm text-purple-800 font-semibold mb-2">
                        🩺 Status Gizi Ibu Hamil
                      </p>
                      <p className="font-bold text-purple-900 text-xl mb-1">
                        {detailData?.stuntingStatus || detailData?.nutritionStatus || detailData?.dataValues?.nutritionStatus || "-"}
                      </p>
                      <p className="text-xs text-purple-600 italic">
                        Kategori: KEK (Kurang Energi Kronis) / Normal / Resti (Resiko Tinggi)
                      </p>
                    </div>
                  )}
                  
                  {canSeeField('stuntingStatus') && detailData?.dataValues?.stuntingRisk && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 my-3">
                      <p className="text-sm text-red-800 font-semibold mb-2">
                        ⚠️ Risiko Stunting pada Bayi
                      </p>
                      <p className="font-bold text-red-900 text-xl mb-1">
                        {detailData.dataValues.stuntingRisk}
                      </p>
                      {detailData?.dataValues?.stuntingRiskDetail && (
                        <p className="text-xs text-red-700 mt-2">
                          {detailData.dataValues.stuntingRiskDetail}
                        </p>
                      )}
                      <p className="text-xs text-red-600 italic">
                        Risiko: Rendah / Sedang / Tinggi / Sangat Tinggi
                      </p>
                    </div>
                  )}
                  
                  {canSeeField('resiko') && renderField("Resiko", detailData?.resiko)}
                  {canSeeField('counselingNotes') && renderField("Catatan Konseling", detailData?.counselingNotes)}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              {(role === "meja2" || role === "meja3") && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}

              {/* {role === "meja1" && !data.completed && (
                <button
                  onClick={handleComplete}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>
              )} */}

              {role === "meja1" && (
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Data pemeriksaan ditampilkan berdasarkan input pemeriksaan terbaru.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailCheckup;