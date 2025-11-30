import { useState, useEffect } from "react";
import CustomAlert, { ConfirmDialog } from "./../../components/CustomAlert";
import { X, Loader, Save, Info } from "lucide-react";
import API from "../../api/axiosInstance";

type EditCheckupProps = {
  checkupSessionId: number;
  measurementData?: any;
  type: "balita" | "ibuHamil";
  onClose: () => void;
};

const EditCheckup = ({ checkupSessionId, measurementData, type, onClose }: EditCheckupProps) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editableFields, setEditableFields] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [calculatedData, setCalculatedData] = useState<any>({});
  const [patientBirthDate, setPatientBirthDate] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    onConfirm: () => void;
  }>({ 
    show: false,
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

  const calculateAgeInMonths = (birthDate: string, checkupDate: string) => {
    if (!birthDate || !checkupDate) return null;
    
    const birth = new Date(birthDate);
    const checkup = new Date(checkupDate);
    
    if (isNaN(birth.getTime()) || isNaN(checkup.getTime())) return null;
    
    const yearDiff = checkup.getFullYear() - birth.getFullYear();
    const monthDiff = checkup.getMonth() - birth.getMonth();
    const dayDiff = checkup.getDate() - birth.getDate();
    
    let totalMonths = yearDiff * 12 + monthDiff;
    
    if (dayDiff < 0) {
      totalMonths--;
    }
    
    return Math.max(0, totalMonths);
  };

  const validateField = (name: string, value: any): string => {
    if (type === "balita") {
      switch (name) {
        case "weightKg":
          if (!value || value === "") return "";
          const weight = parseFloat(value);
          if (isNaN(weight)) return "Berat badan harus berupa angka";
          if (weight < 0) return "Berat badan tidak boleh negatif";
          if (weight > 50) return "Berat badan tidak masuk akal (maksimal 50 kg untuk balita)";
          if (weight < 1) return "Berat badan terlalu rendah (minimal 1 kg)";
          break;

        case "heightCm":
          if (!value || value === "") return "";
          const height = parseFloat(value);
          if (isNaN(height)) return "Tinggi badan harus berupa angka";
          if (height < 0) return "Tinggi badan tidak boleh negatif";
          if (height > 150) return "Tinggi badan tidak masuk akal (maksimal 150 cm untuk balita)";
          if (height < 30) return "Tinggi badan terlalu rendah (minimal 30 cm)";
          break;

        case "headCircCm":
          if (!value || value === "") return "";
          const headCirc = parseFloat(value);
          if (isNaN(headCirc)) return "Lingkar kepala harus berupa angka";
          if (headCirc < 0) return "Lingkar kepala tidak boleh negatif";
          if (headCirc > 60) return "Lingkar kepala tidak masuk akal (maksimal 60 cm)";
          if (headCirc < 25) return "Lingkar kepala terlalu rendah (minimal 25 cm)";
          break;

        case "lilaCm":
          if (!value || value === "") return "";
          const lila = parseFloat(value);
          if (isNaN(lila)) return "LILA harus berupa angka";
          if (lila < 0) return "LILA tidak boleh negatif";
          if (lila > 30) return "LILA tidak masuk akal (maksimal 30 cm)";
          if (lila < 8) return "LILA terlalu rendah (minimal 8 cm)";
          break;
      }
    }

    if (type === "ibuHamil") {
      switch (name) {
        case "ageMonthsPregnant":
          if (!value || value === "") return "";
          const agePregnant = parseInt(value);
          if (isNaN(agePregnant)) return "Usia kehamilan harus berupa angka";
          if (agePregnant < 0) return "Usia kehamilan tidak boleh negatif";
          if (agePregnant > 9) return "Usia kehamilan tidak boleh lebih dari 9 bulan";
          break;

        case "weightKgPregnant":
          if (!value || value === "") return "";
          const weightPregnant = parseFloat(value);
          if (isNaN(weightPregnant)) return "Berat badan harus berupa angka";
          if (weightPregnant < 0) return "Berat badan tidak boleh negatif";
          if (weightPregnant > 200) return "Berat badan tidak masuk akal (maksimal 200 kg)";
          if (weightPregnant < 30) return "Berat badan terlalu rendah (minimal 30 kg)";
          break;

        case "heightCmPregnant":
          if (!value || value === "") return "";
          const heightPregnant = parseFloat(value);
          if (isNaN(heightPregnant)) return "Tinggi badan harus berupa angka";
          if (heightPregnant < 0) return "Tinggi badan tidak boleh negatif";
          if (heightPregnant > 220) return "Tinggi badan tidak masuk akal (maksimal 220 cm)";
          if (heightPregnant < 130) return "Tinggi badan terlalu rendah (minimal 130 cm)";
          break;

        case "lilaCmPregnant":
          if (!value || value === "") return "";
          const lilaPregnant = parseFloat(value);
          if (isNaN(lilaPregnant)) return "LILA harus berupa angka";
          if (lilaPregnant < 0) return "LILA tidak boleh negatif";
          if (lilaPregnant > 50) return "LILA tidak masuk akal (maksimal 50 cm)";
          if (lilaPregnant < 15) return "LILA terlalu rendah (minimal 15 cm)";
          break;

        case "tekananDarah":
          if (!value || value === "") return "";
          const bpRegex = /^\d{2,3}\/\d{2,3}$/;
          if (!bpRegex.test(value)) return "Format tekanan darah harus seperti 120/80";
          const [systolic, diastolic] = value.split('/').map(Number);
          if (systolic < 70 || systolic > 250) return "Tekanan sistolik tidak normal (70-250 mmHg)";
          if (diastolic < 40 || diastolic > 150) return "Tekanan diastolik tidak normal (40-150 mmHg)";
          if (systolic <= diastolic) return "Tekanan sistolik harus lebih besar dari diastolik";
          break;

        case "gds":
          if (!value || value === "") return "";
          const gds = parseFloat(value);
          if (isNaN(gds)) return "GDS harus berupa angka";
          if (gds < 0) return "GDS tidak boleh negatif";
          if (gds > 600) return "GDS tidak masuk akal (maksimal 600 mg/dL)";
          break;

        case "HB":
          if (!value || value === "") return "";
          const hb = parseFloat(value);
          if (isNaN(hb)) return "HB harus berupa angka";
          if (hb < 0) return "HB tidak boleh negatif";
          if (hb > 20) return "HB tidak masuk akal (maksimal 20 g/dL)";
          if (hb < 5) return "HB terlalu rendah (minimal 5 g/dL)";
          break;
      }
    }

    return "";
  };

  useEffect(() => {
    const user = getUser();
    setRole(user.role || "");
    
    if (checkupSessionId) {
      fetchEditableData();
    }
  }, [checkupSessionId]);

  useEffect(() => {
    if (type === "balita" && patientBirthDate && sessionDate) {
      const calculatedAge = calculateAgeInMonths(patientBirthDate, sessionDate);
      if (calculatedAge !== null) {
        setFormData((prev: any) => ({
          ...prev,
          ageMonths: calculatedAge
        }));
      }
    }
  }, [patientBirthDate, sessionDate, type]);

  const fetchEditableData = async () => {
    try {
      setLoading(true);
      
      const measurementResponse = await API.get(
        `/api/measurement/session/${checkupSessionId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const measurementResult = measurementResponse.data;
      
      const editResponse = await API.get(
        `/api/measurement/edit/${checkupSessionId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const editResult = editResponse.data;
      
      if (measurementResult.success) {
        setFormData(measurementResult.data || {});
        
        if (editResult.success) {
          setEditableFields(editResult.data.editableFields || []);
        }
        
        if (measurementResult.data) {
          setCalculatedData({
            statusGizi: measurementResult.data.statusGizi,
            zScoreBMIU: measurementResult.data.zScoreBMIU,
            zScoreBMIPregnant: measurementResult.data.zScoreBMIPregnant,
            stuntingStatus: measurementResult.data.stuntingStatus
          });

          if (measurementResult.data.checkup_session?.patient?.birthDate) {
            setPatientBirthDate(measurementResult.data.checkup_session.patient.birthDate);
          }
          
          if (measurementResult.data.checkup_session?.sessionDate || 
              measurementResult.data.checkup_session?.session_date) {
            setSessionDate(
              measurementResult.data.checkup_session.sessionDate || 
              measurementResult.data.checkup_session.session_date
            );
          }
        }
      } else {
        setAlert({
          show: true,
          type: 'error',
          title: 'Gagal Memuat Data',
          message: measurementResult.message || 'Tidak dapat memuat data untuk edit.',
          suggestion: measurementResult.suggestion || 'Periksa hak akses Anda atau coba lagi.'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Kesalahan Jaringan',
        message: 'Tidak dapat terhubung ke server.',
        suggestion: 'Periksa koneksi internet Anda dan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === "radio") {
      const input = e.target as HTMLInputElement;
      setFormData((prev: any) => ({ ...prev, [name]: input.value }));
    } else {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }

      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (type === "balita") {
      if (isFieldEditable("weightKg") && formData.weightKg) {
        const error = validateField("weightKg", formData.weightKg);
        if (error) newErrors.weightKg = error;
      }
      if (isFieldEditable("heightCm") && formData.heightCm) {
        const error = validateField("heightCm", formData.heightCm);
        if (error) newErrors.heightCm = error;
      }
      if (isFieldEditable("headCircCm") && formData.headCircCm) {
        const error = validateField("headCircCm", formData.headCircCm);
        if (error) newErrors.headCircCm = error;
      }
      if (isFieldEditable("lilaCm") && formData.lilaCm) {
        const error = validateField("lilaCm", formData.lilaCm);
        if (error) newErrors.lilaCm = error;
      }
    } else if (type === "ibuHamil") {
      if (isFieldEditable("ageMonthsPregnant") && formData.ageMonthsPregnant) {
        const error = validateField("ageMonthsPregnant", formData.ageMonthsPregnant);
        if (error) newErrors.ageMonthsPregnant = error;
      }
      if (isFieldEditable("weightKgPregnant") && formData.weightKgPregnant) {
        const error = validateField("weightKgPregnant", formData.weightKgPregnant);
        if (error) newErrors.weightKgPregnant = error;
      }
      if (isFieldEditable("heightCmPregnant") && formData.heightCmPregnant) {
        const error = validateField("heightCmPregnant", formData.heightCmPregnant);
        if (error) newErrors.heightCmPregnant = error;
      }
      if (isFieldEditable("lilaCmPregnant") && formData.lilaCmPregnant) {
        const error = validateField("lilaCmPregnant", formData.lilaCmPregnant);
        if (error) newErrors.lilaCmPregnant = error;
      }
      if (isFieldEditable("tekananDarah") && formData.tekananDarah) {
        const error = validateField("tekananDarah", formData.tekananDarah);
        if (error) newErrors.tekananDarah = error;
      }
      if (isFieldEditable("gds") && formData.gds) {
        const error = validateField("gds", formData.gds);
        if (error) newErrors.gds = error;
      }
      if (isFieldEditable("HB") && formData.HB) {
        const error = validateField("HB", formData.HB);
        if (error) newErrors.HB = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateAllFields()) {
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      setAlert({
        show: true,
        type: 'error',
        title: 'Data Tidak Valid',
        message: 'Mohon periksa kembali data yang Anda masukkan.',
        suggestion: 'Pastikan semua DATA yang diisi memiliki nilai yang valid.'
      });
      return;
    }

    setConfirmDialog({
      show: true,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, show: false });
        
        try {
          setSaving(true);
          
          const response = await API.post(
            `/api/measurement/${checkupSessionId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
              },
            }
          );

          const result = response.data;
          
          if (result.success) {
            if (result.calculationInfo) {
              setCalculatedData({
                statusGizi: result.data?.statusGizi,
                zScoreBMIU: result.data?.zScoreBMIU,
                zScoreBMIPregnant: result.data?.zScoreBMIPregnant,
                stuntingStatus: result.data?.stuntingStatus || result.calculationInfo?.stuntingStatus
              });
            }
            
            setAlert({
              show: true,
              type: 'success',
              title: 'Berhasil Disimpan',
              message: result.message || 'Data pemeriksaan berhasil diperbarui.',
              suggestion: result.calculationInfo 
                ? `Z-Score: ${result.calculationInfo.zScore || '-'}, Status: ${result.calculationInfo.stuntingStatus || '-'}`
                : undefined,
                shouldNavigateOnClose: true
            });
          } else {
            setAlert({
              show: true,
              type: 'error',
              title: 'Gagal Menyimpan',
              message: result.message || 'Tidak dapat menyimpan data pemeriksaan.',
              suggestion: result.suggestion || 'Periksa kembali data yang diinput.'
            });
          }
        } catch (error) {
          setAlert({
            show: true,
            type: 'error',
            title: 'Kesalahan Jaringan',
            message: 'Terjadi kesalahan saat menyimpan data.',
            suggestion: 'Periksa koneksi internet Anda dan coba lagi.'
          });
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const isFieldEditable = (fieldName: string): boolean => {
    return editableFields.includes(fieldName);
  };

  const shouldDisplayField = (fieldName: string): boolean => {
    const calculatedFields = ['statusGizi', 'zScoreBMIU', 'zScoreBMIPregnant', 'stuntingStatus'];
    return isFieldEditable(fieldName) || calculatedFields.includes(fieldName);
  };

  const shouldShowAsInfo = (fieldName: string): boolean => {
    if (role === 'meja3') {
      const meja2Fields = [
        'ageMonths', 'weightKg', 'heightCm', 'headCircCm', 'lilaCm', 'asi', 'vitaminA',
        'statusGizi', 'stuntingStatus',
        'ageMonthsPregnant', 'weightKgPregnant', 'heightCmPregnant', 'lilaCmPregnant',
        'tekananDarah', 'proteinUrine', 'reduksiUrine', 'testHiv', 'testSifilis', 
        'testHbsAg', 'gds', 'ancTerpadu', 'HB', 'zScoreBMIPregnant'
      ];
      return meja2Fields.includes(fieldName);
    }
    return false;
  };

  if (!checkupSessionId) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
          <p className="text-red-600 font-semibold mb-4">Error: Checkup Session ID tidak valid</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
          <Loader className="w-8 h-8 text-teal-600 animate-spin mb-3" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {alert.show && (
        <CustomAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          suggestion={alert.suggestion}
          onClose={() => {
            setAlert({ ...alert, show: false });
            if (alert.shouldNavigateOnClose) {
              onClose();
            }
          }}
        />
      )}

      {confirmDialog.show && (
        <ConfirmDialog
          title="Simpan Perubahan"
          message="Apakah Anda yakin ingin menyimpan perubahan data pemeriksaan ini?"
          type="info"
          confirmText="Ya, Simpan"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        />
      )}

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {type === "balita"
                ? "EDIT PEMERIKSAAN BALITA"
                : "EDIT PEMERIKSAAN IBU HAMIL"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={22} />
            </button>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              <strong>Akses Anda ({role}):</strong> {role === 'meja3' 
                ? 'Data pengukuran dari Meja 2 ditampilkan sebagai informasi. Anda hanya dapat mengedit Catatan Konseling dan Resiko (Ibu Hamil).'
                : 'Inputan yang memiliki tanda AUTO akan dihitung otomatis dari sistem dan tidak dapat diubah manual. Catatan Konseling dan Resiko (Ibu Hamil) akan diinputkan di meja 3.'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {type === "balita" ? (
                <div>
                  {role === 'meja3' && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 mb-6">
                      <h3 className="text-lg font-bold text-teal-800 mb-3 flex items-center gap-2">
                        <span className="text-xs bg-teal-600 text-white px-3 py-1 rounded-full">INFORMASI MEJA 2</span>
                        Data Pengukuran & Hasil Analisis
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Umur:</span>
                          <span className="font-semibold ml-2">{formData.ageMonths || '-'} bulan</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Berat Badan:</span>
                          <span className="font-semibold ml-2">{formData.weightKg || '-'} kg</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Tinggi Badan:</span>
                          <span className="font-semibold ml-2">{formData.heightCm || '-'} cm</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Lingkar Kepala:</span>
                          <span className="font-semibold ml-2">{formData.headCircCm || '-'} cm</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">LILA:</span>
                          <span className="font-semibold ml-2">{formData.lilaCm || '-'} cm</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">ASI:</span>
                          <span className="font-semibold ml-2">{formData.asi || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Vitamin A:</span>
                          <span className="font-semibold ml-2">{formData.vitaminA || '-'}</span>
                        </div>
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-2 rounded-lg border border-blue-300">
                          <span className="text-blue-800 font-semibold">Status Gizi:</span>
                          <span className="font-bold ml-2 text-blue-900">{calculatedData.statusGizi || formData.statusGizi || '-'}</span>
                        </div>
                        <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-2 rounded-lg border border-purple-300 col-span-2">
                          <span className="text-purple-800 font-semibold">Status Stunting:</span>
                          <span className="font-bold ml-2 text-purple-900">{calculatedData.stuntingStatus || formData.stuntingStatus || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('ageMonths') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900 flex items-center gap-2">
                          Umur (bulan)
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <Info size={12} />
                            AUTO
                          </span>
                        </label>
                        <input
                          type="number"
                          name="ageMonths"
                          value={formData.ageMonths || ""}
                          readOnly
                          disabled
                          placeholder="Umur"
                          className="border border-green-200 bg-green-50 rounded-lg px-4 py-2 w-full sm:w-48 cursor-not-allowed font-medium text-green-900"
                        />
                      </div>
                      {patientBirthDate && (
                        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                          <Info size={12} />
                          Dihitung dari tanggal lahir: {new Date(patientBirthDate).toLocaleDateString('id-ID', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {(shouldDisplayField('weightKg') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Berat Badan (kg)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="weightKg"
                            value={formData.weightKg || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('weightKg')}
                            placeholder="Masukkan berat"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.weightKg 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('weightKg') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.weightKg && <p className="text-red-500 text-sm mt-1">{errors.weightKg}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('heightCm') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Tinggi Badan (cm)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="heightCm"
                            value={formData.heightCm || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('heightCm')}
                            placeholder="Masukkan tinggi"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.heightCm 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('heightCm') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.heightCm && <p className="text-red-500 text-sm mt-1">{errors.heightCm}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('headCircCm') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Lingkar Kepala (cm)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="headCircCm"
                            value={formData.headCircCm || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('headCircCm')}
                            placeholder="Masukkan LK"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.headCircCm 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('headCircCm') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.headCircCm && <p className="text-red-500 text-sm mt-1">{errors.headCircCm}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('lilaCm') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">LILA (cm)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="lilaCm"
                            value={formData.lilaCm || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('lilaCm')}
                            placeholder="Masukkan LILA"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.lilaCm 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('lilaCm') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.lilaCm && <p className="text-red-500 text-sm mt-1">{errors.lilaCm}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('asi') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">ASI</label>
                      <select
                        name="asi"
                        value={formData.asi || ""}
                        onChange={handleChange}
                        disabled={!isFieldEditable('asi')}
                        className={`border rounded-lg px-4 py-2 w-full sm:w-48 ${
                          isFieldEditable('asi') 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        <option value="">Pilih</option>
                        <option value="Eksklusif">Eksklusif</option>
                        <option value="Tidak Eksklusif">Parsial</option>
                      </select>
                    </div>
                  )}

                  {(shouldDisplayField('vitaminA') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Vitamin A</label>
                      <select
                        name="vitaminA"
                        value={formData.vitaminA || ""}
                        onChange={handleChange}
                        disabled={!isFieldEditable('vitaminA')}
                        className={`border rounded-lg px-4 py-2 w-full sm:w-48 ${
                          isFieldEditable('vitaminA') 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        <option value="">Pilih</option>
                        <option value="merah">Merah</option>
                        <option value="biru">Biru</option>
                        <option value="tidak">Tidak</option>
                      </select>
                    </div>
                  )}

                  {(shouldDisplayField('statusGizi') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-blue-50 p-3 rounded-lg mb-4">
                      <label className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">AUTO</span>
                        Status Gizi
                      </label>
                      <input
                        type="text"
                        value={calculatedData.statusGizi || formData.statusGizi || "-"}
                        disabled
                        className="border border-blue-200 bg-blue-100 rounded-lg px-4 py-2 w-full sm:w-48 cursor-not-allowed font-medium text-blue-900"
                      />
                    </div>
                  )}

                  {(shouldDisplayField('stuntingStatus') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-blue-50 p-3 rounded-lg mb-4">
                      <label className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">AUTO</span>
                        Status Stunting
                      </label>
                      <input
                        type="text"
                        value={calculatedData.stuntingStatus || formData.stuntingStatus || "-"}
                        disabled
                        className="border border-blue-200 bg-blue-100 rounded-lg px-4 py-2 w-full sm:w-48 cursor-not-allowed font-medium text-blue-900"
                      />
                    </div>
                  )}

                  {shouldDisplayField('counselingNotes') && (
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-900">Catatan Konseling</label>
                      <textarea
                        name="counselingNotes"
                        value={formData.counselingNotes || ""}
                        onChange={handleChange}
                        disabled={!isFieldEditable('counselingNotes')}
                        placeholder="Masukkan catatan..."
                        rows={3}
                        className={`border rounded-lg px-4 py-2 w-full ${
                          isFieldEditable('counselingNotes') 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {role === 'meja3' && (
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 mb-6">
                      <h3 className="text-lg font-bold text-teal-800 mb-3 flex items-center gap-2">
                        <span className="text-xs bg-teal-600 text-white px-3 py-1 rounded-full">INFORMASI MEJA 2</span>
                        Data Pengukuran & Hasil Pemeriksaan
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Usia Kehamilan:</span>
                          <span className="font-semibold ml-2">{formData.ageMonthsPregnant || '-'} bulan</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Berat Badan:</span>
                          <span className="font-semibold ml-2">{formData.weightKgPregnant || '-'} kg</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Tinggi Badan:</span>
                          <span className="font-semibold ml-2">{formData.heightCmPregnant || '-'} cm</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">LILA:</span>
                          <span className="font-semibold ml-2">{formData.lilaCmPregnant || '-'} cm</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Tekanan Darah:</span>
                          <span className="font-semibold ml-2">{formData.tekananDarah || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Protein Urine:</span>
                          <span className="font-semibold ml-2">{formData.proteinUrine || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Reduksi Urine:</span>
                          <span className="font-semibold ml-2">{formData.reduksiUrine || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Test HIV:</span>
                          <span className="font-semibold ml-2">{formData.testHiv || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Test Sifilis:</span>
                          <span className="font-semibold ml-2">{formData.testSifilis || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">Test HBsAg:</span>
                          <span className="font-semibold ml-2">{formData.testHbsAg || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">GDS:</span>
                          <span className="font-semibold ml-2">{formData.gds || '-'} mg/dL</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">ANC Terpadu:</span>
                          <span className="font-semibold ml-2">{formData.ancTerpadu || '-'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <span className="text-gray-600">HB:</span>
                          <span className="font-semibold ml-2">{formData.HB || '-'} g/dL</span>
                        </div>
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-2 rounded-lg border border-blue-300">
                          <span className="text-blue-800 font-semibold">Z-Score BMI:</span>
                          <span className="font-bold ml-2 text-blue-900">{calculatedData.zScoreBMIPregnant || formData.zScoreBMIPregnant || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('ageMonthsPregnant') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Usia Kehamilan (bulan)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            name="ageMonthsPregnant"
                            value={formData.ageMonthsPregnant || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('ageMonthsPregnant')}
                            placeholder="Masukkan usia kehamilan"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.ageMonthsPregnant 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('ageMonthsPregnant') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.ageMonthsPregnant && <p className="text-red-500 text-sm mt-1">{errors.ageMonthsPregnant}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('weightKgPregnant') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Berat Badan (kg)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="weightKgPregnant"
                            value={formData.weightKgPregnant || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('weightKgPregnant')}
                            placeholder="Masukkan berat"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.weightKgPregnant 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('weightKgPregnant') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.weightKgPregnant && <p className="text-red-500 text-sm mt-1">{errors.weightKgPregnant}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('heightCmPregnant') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Tinggi Badan (cm)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="heightCmPregnant"
                            value={formData.heightCmPregnant || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('heightCmPregnant')}
                            placeholder="Masukkan tinggi"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.heightCmPregnant 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('heightCmPregnant') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.heightCmPregnant && <p className="text-red-500 text-sm mt-1">{errors.heightCmPregnant}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('lilaCmPregnant') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">LILA (cm)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="lilaCmPregnant"
                            value={formData.lilaCmPregnant || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('lilaCmPregnant')}
                            placeholder="Masukkan LILA"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.lilaCmPregnant 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('lilaCmPregnant') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.lilaCmPregnant && <p className="text-red-500 text-sm mt-1">{errors.lilaCmPregnant}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('tekananDarah') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">Tekanan Darah</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="text"
                            name="tekananDarah"
                            value={formData.tekananDarah || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('tekananDarah')}
                            placeholder="120/80"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.tekananDarah 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('tekananDarah') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.tekananDarah && <p className="text-red-500 text-sm mt-1">{errors.tekananDarah}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('proteinUrine') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Protein Urine</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="proteinUrine"
                            value="positif"
                            checked={formData.proteinUrine === "positif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('proteinUrine')}
                            className="w-4 h-4"
                          />
                          <span>Positif</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="proteinUrine"
                            value="negatif"
                            checked={formData.proteinUrine === "negatif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('proteinUrine')}
                            className="w-4 h-4"
                          />
                          <span>Negatif</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('reduksiUrine') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Reduksi Urine</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="reduksiUrine"
                            value="positif"
                            checked={formData.reduksiUrine === "positif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('reduksiUrine')}
                            className="w-4 h-4"
                          />
                          <span>Positif</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="reduksiUrine"
                            value="negatif"
                            checked={formData.reduksiUrine === "negatif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('reduksiUrine')}
                            className="w-4 h-4"
                          />
                          <span>Negatif</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('testHiv') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Test HIV</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="testHiv"
                            value="positif"
                            checked={formData.testHiv === "positif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('testHiv')}
                            className="w-4 h-4"
                          />
                          <span>Positif</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="testHiv"
                            value="negatif"
                            checked={formData.testHiv === "negatif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('testHiv')}
                            className="w-4 h-4"
                          />
                          <span>Negatif</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('testSifilis') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Test Sifilis</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="testSifilis"
                            value="positif"
                            checked={formData.testSifilis === "positif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('testSifilis')}
                            className="w-4 h-4"
                          />
                          <span>Positif</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="testSifilis"
                            value="negatif"
                            checked={formData.testSifilis === "negatif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('testSifilis')}
                            className="w-4 h-4"
                          />
                          <span>Negatif</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('testHbsAg') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Test HBsAg</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="testHbsAg"
                            value="positif"
                            checked={formData.testHbsAg === "positif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('testHbsAg')}
                            className="w-4 h-4"
                          />
                          <span>Positif</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="testHbsAg"
                            value="negatif"
                            checked={formData.testHbsAg === "negatif"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('testHbsAg')}
                            className="w-4 h-4"
                          />
                          <span>Negatif</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('gds') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">GDS (mg/dL)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="gds"
                            value={formData.gds || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('gds')}
                            placeholder="Masukkan GDS"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.gds 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('gds') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.gds && <p className="text-red-500 text-sm mt-1">{errors.gds}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('ancTerpadu') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <label className="font-semibold text-gray-900">ANC Terpadu</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ancTerpadu"
                            value="sudah"
                            checked={formData.ancTerpadu === "sudah"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('ancTerpadu')}
                            className="w-4 h-4"
                          />
                          <span>Sudah</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ancTerpadu"
                            value="belum"
                            checked={formData.ancTerpadu === "belum"}
                            onChange={handleChange}
                            disabled={!isFieldEditable('ancTerpadu')}
                            className="w-4 h-4"
                          />
                          <span>Belum</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('HB') && role !== 'meja3') && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <label className="font-semibold text-gray-900">HB (g/dL)</label>
                        <div className="w-full sm:w-48">
                          <input
                            type="number"
                            step="0.1"
                            name="HB"
                            value={formData.HB || ""}
                            onChange={handleChange}
                            disabled={!isFieldEditable('HB')}
                            placeholder="Masukkan HB"
                            className={`border rounded-lg px-4 py-2 w-full ${
                              errors.HB 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-400' 
                                : isFieldEditable('HB') 
                                ? 'border-gray-300 bg-gray-50' 
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          />
                          {errors.HB && <p className="text-red-500 text-sm mt-1">{errors.HB}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {(shouldDisplayField('zScoreBMIPregnant') && role !== 'meja3') && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-blue-50 p-3 rounded-lg mb-4">
                      <label className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">AUTO</span>
                        Z-Score BMI
                      </label>
                      <input
                        type="text"
                        value={calculatedData.zScoreBMIPregnant || formData.zScoreBMIPregnant || "-"}
                        disabled
                        className="border border-blue-200 bg-blue-100 rounded-lg px-4 py-2 w-full sm:w-48 cursor-not-allowed font-medium text-blue-900"
                      />
                    </div>
                  )}

                  {shouldDisplayField('resiko') && (
                    <div className="flex flex-col gap-2 mb-4">
                      <label className="font-semibold text-gray-900">Resiko Lain</label>
                      <textarea
                        name="resiko"
                        value={formData.resiko || ""}
                        onChange={handleChange}
                        disabled={!isFieldEditable('resiko')}
                        placeholder="Masukkan resiko (maksimal 50 karakter)"
                        maxLength={50}
                        rows={2}
                        className={`border rounded-lg px-4 py-2 w-full ${
                          isFieldEditable('resiko') 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        }`}
                      />
                      {formData.resiko && (
                        <p className="text-xs text-gray-500">
                          {formData.resiko.length}/50 karakter
                        </p>
                      )}
                    </div>
                  )}

                  {shouldDisplayField('counselingNotes') && (
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-900">Catatan Konseling</label>
                      <textarea
                        name="counselingNotes"
                        value={formData.counselingNotes || ""}
                        onChange={handleChange}
                        disabled={!isFieldEditable('counselingNotes')}
                        placeholder="Masukkan catatan..."
                        rows={3}
                        className={`border rounded-lg px-4 py-2 w-full ${
                          isFieldEditable('counselingNotes') 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCheckup;