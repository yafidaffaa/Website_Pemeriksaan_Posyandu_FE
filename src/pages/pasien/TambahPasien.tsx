import { ArrowLeft, UserPlus, Baby, Heart, Loader } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomAlert from "../../components/CustomAlert";
import API from "../../api/axiosInstance";

const TambahPasien = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");

  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    motherName: "",
    namaSuami: "",
    nik: "",
    noKK: "",
    birthDate: "",
    gender: "",
    address: "",
    rt: "",
    imunisasi: [] as string[],
    kb: "",
    pus: "",
    wus: "",
    gravida: "",
    partus: "",
    abortus: "",
    jarakPersalinanSebelumnya: "",
    usiaKandunganMinggu: "",
    tglPemeriksaanPertama: "",
    hpm: "",
    hpl: "",
    nomorJaminan: "",
    noTelp: "",
    golonganDarah: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    suggestion?: string;
    shouldNavigateOnClose?: boolean;
  }>({ show: false, type: 'info', title: '', message: '', shouldNavigateOnClose: false });

  useEffect(() => {
    if (!isEdit) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await API.get(`/api/pasien/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setForm((prev) => ({
          ...prev,
          ...data,
          imunisasi: Array.isArray(data.imunisasi)
            ? data.imunisasi
            : data.imunisasi
            ? data.imunisasi.split(",").map((x: string) => x.trim())
            : [],
        }));
      } catch (err) {
        console.error("Gagal mengambil data pasien:", err);
        setAlert({
          show: true,
          type: 'error',
          title: 'Gagal Memuat Data',
          message: 'Tidak dapat mengambil data pasien dari server.',
          suggestion: 'Periksa koneksi internet Anda atau coba lagi nanti.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, navigate]);

  const validateField = (name: string, value: any): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === "balita") {
      switch (name) {
        case "name":
          if (value && value.trim().length < 3) return "Nama anak minimal 3 karakter";
          if (value && value.trim().length > 100) return "Nama anak maksimal 100 karakter";
          if (value && !/^[a-zA-Z\s.'-]+$/.test(value)) return "Nama hanya boleh mengandung huruf dan spasi";
          break;

        case "motherName":
          if (value && value.trim().length < 3) return "Nama ibu minimal 3 karakter";
          if (value && value.trim().length > 100) return "Nama ibu maksimal 100 karakter";
          if (value && !/^[a-zA-Z\s.'-]+$/.test(value)) return "Nama hanya boleh mengandung huruf dan spasi";
          break;

        case "rt":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "RT harus berupa angka";
          const rtNum = parseInt(value);
          if (rtNum < 1) return "RT minimal 1";
          if (rtNum > 999) return "RT maksimal 999";
          break;

        case "birthDate":
          if (value) {
            const birthDate = new Date(value);
            if (birthDate > today) return "Tanggal lahir tidak boleh lebih dari hari ini";
            const age = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            if (age > 5) return "Usia anak melebihi 5 tahun (bukan kategori balita)";
          }
          break;
      }
    } else if (type === "ibuHamil") {
      switch (name) {
        case "name":
          if (value && value.trim().length < 3) return "Nama ibu minimal 3 karakter";
          if (value && value.trim().length > 100) return "Nama ibu maksimal 100 karakter";
          if (value && !/^[a-zA-Z\s.'-]+$/.test(value)) return "Nama hanya boleh mengandung huruf dan spasi";
          break;

        case "namaSuami":
          if (value && value.trim().length < 3) return "Nama suami minimal 3 karakter";
          if (value && value.trim().length > 100) return "Nama suami maksimal 100 karakter";
          if (value && !/^[a-zA-Z\s.'-]+$/.test(value)) return "Nama hanya boleh mengandung huruf dan spasi";
          break;

        case "nik":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "NIK hanya boleh berisi angka";
          if (value.length < 16) return "NIK harus 16 digit";
          if (value.length > 16) return "NIK tidak boleh lebih dari 16 digit";
          break;

        case "noKK":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "No KK hanya boleh berisi angka";
          if (value.length < 16) return "No KK harus 16 digit";
          if (value.length > 16) return "No KK tidak boleh lebih dari 16 digit";
          break;

        case "rt":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "RT harus berupa angka";
          const rtNum = parseInt(value);
          if (rtNum < 1) return "RT minimal 1";
          if (rtNum > 999) return "RT maksimal 999";
          break;

        case "birthDate":
          if (value) {
            const birthDate = new Date(value);
            if (birthDate > today) return "Tanggal lahir tidak boleh lebih dari hari ini";
            const age = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            if (age < 15) return "Usia ibu terlalu muda (minimal 15 tahun)";
            if (age > 55) return "Usia ibu melebihi batas wajar untuk kehamilan";
          }
          break;

        case "gravida":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "Gravida harus berupa angka";
          const gravida = parseInt(value);
          if (gravida < 1) return "Gravida minimal 1";
          if (gravida > 15) return "Gravida maksimal 15";
          break;

        case "partus":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "Partus harus berupa angka";
          const partus = parseInt(value);
          if (partus < 0) return "Partus minimal 0";
          if (partus > 10) return "Partus maksimal 10";
          break;

        case "abortus":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "Abortus harus berupa angka";
          const abortus = parseInt(value);
          if (abortus < 0) return "Abortus minimal 0";
          if (abortus > 5) return "Abortus maksimal 5";
          break;

        case "jarakPersalinanSebelumnya":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "Jarak persalinan harus berupa angka";
          const jarak = parseInt(value);
          if (jarak < 0) return "Jarak persalinan minimal 0 bulan";
          if (jarak > 240) return "Jarak persalinan tidak wajar (maksimal 240 bulan/20 tahun)";
          break;

        case "usiaKandunganMinggu":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "Usia kandungan harus berupa angka";
          const usia = parseInt(value);
          if (usia < 1) return "Usia kandungan minimal 1 minggu";
          if (usia > 42) return "Usia kandungan maksimal 42 minggu";
          break;

        case "tglPemeriksaanPertama":
          if (value) {
            const tglPemeriksaan = new Date(value);
            if (tglPemeriksaan > today) return "Tanggal pemeriksaan tidak boleh lebih dari hari ini";
          }
          break;

        case "hpm":
          if (value) {
            const hpmDate = new Date(value);
            if (hpmDate > today) return "HPM tidak boleh lebih dari hari ini";
          }
          break;

        case "hpl":
          if (value) {
            const hplDate = new Date(value);
            const oneYearFromNow = new Date(today);
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            if (hplDate < today) return "HPL harus tanggal di masa depan";
            if (hplDate > oneYearFromNow) return "HPL tidak wajar (lebih dari 1 tahun dari sekarang)";
          }
          break;

        case "nomorJaminan":
          if (value && value.trim() !== "") {
            if (!/^\d+$/.test(value)) return "Nomor jaminan hanya boleh berisi angka";
            if (value.length < 9) return "Nomor jaminan minimal 9 digit";
            if (value.length > 11) return "Nomor jaminan maksimal 11 digit";
          }
          break;

        case "noTelp":
          if (!value || value === "") return "";
          if (!/^\d+$/.test(value)) return "No telepon hanya boleh berisi angka";
          if (value.length < 10) return "No telepon minimal 10 digit";
          if (value.length > 13) return "No telepon maksimal 13 digit";
          break;
      }
    }

    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name === "imunisasi") {
      setForm((prev) => {
        const updated = checked
          ? [...prev.imunisasi, value]
          : prev.imunisasi.filter((item) => item !== value);
        return { ...prev, imunisasi: updated };
      });
    } else {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('🔍 Memulai validasi untuk type:', type);
    console.log('📝 Form data:', form);

    if (type === "balita") {
      if (!form.name.trim()) newErrors.name = "Nama anak wajib diisi";
      if (!form.motherName.trim()) newErrors.motherName = "Nama ibu wajib diisi";
      if (!form.gender) newErrors.gender = "Jenis kelamin wajib dipilih";
      if (!form.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
      if (!form.rt.trim()) {
        newErrors.rt = "RT wajib diisi";
      } else if (!/^\d+$/.test(form.rt)) {
        newErrors.rt = "RT harus berupa angka";
      }
      if (!form.pus) newErrors.pus = "PUS wajib dipilih";
      if (!form.wus) newErrors.wus = "WUS wajib dipilih";
    } else if (type === "ibuHamil") {
      if (!form.name.trim()) newErrors.name = "Nama ibu wajib diisi";
      if (!form.namaSuami.trim()) newErrors.namaSuami = "Nama suami wajib diisi";
      
      if (!form.nik.trim()) {
        newErrors.nik = "NIK wajib diisi";
      } else if (!/^\d{16}$/.test(form.nik)) {
        newErrors.nik = "NIK harus 16 digit angka";
      }

      if (!form.noKK.trim()) {
        newErrors.noKK = "No KK wajib diisi";
      } else if (!/^\d{16}$/.test(form.noKK)) {
        newErrors.noKK = "No KK harus 16 digit angka";
      }

      if (!form.rt.trim()) {
        newErrors.rt = "RT wajib diisi";
      } else if (!/^\d+$/.test(form.rt)) {
        newErrors.rt = "RT harus berupa angka";
      }

      if (!form.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";

      if (!form.gravida.trim()) {
        newErrors.gravida = "Gravida wajib diisi";
      } else if (!/^\d+$/.test(form.gravida) || parseInt(form.gravida) < 0) {
        newErrors.gravida = "Gravida harus angka positif";
      }

      if (!form.partus.trim()) {
        newErrors.partus = "Partus wajib diisi";
      } else if (!/^\d+$/.test(form.partus) || parseInt(form.partus) < 0) {
        newErrors.partus = "Partus harus angka positif";
      }

      if (!form.abortus.trim()) {
        newErrors.abortus = "Abortus wajib diisi";
      } else if (!/^\d+$/.test(form.abortus) || parseInt(form.abortus) < 0) {
        newErrors.abortus = "Abortus harus angka positif";
      }

      if (!form.jarakPersalinanSebelumnya.trim()) {
        newErrors.jarakPersalinanSebelumnya = "Jarak persalinan sebelumnya wajib diisi";
      } else if (!/^\d+$/.test(form.jarakPersalinanSebelumnya) || parseInt(form.jarakPersalinanSebelumnya) < 0) {
        newErrors.jarakPersalinanSebelumnya = "Jarak persalinan harus angka positif";
      }

      if (!form.usiaKandunganMinggu.trim()) {
        newErrors.usiaKandunganMinggu = "Usia kandungan wajib diisi";
      } else if (!/^\d+$/.test(form.usiaKandunganMinggu) || parseInt(form.usiaKandunganMinggu) < 0) {
        newErrors.usiaKandunganMinggu = "Usia kandungan harus angka positif";
      }

      if (!form.tglPemeriksaanPertama) newErrors.tglPemeriksaanPertama = "Tanggal pemeriksaan pertama wajib diisi";
      if (!form.hpm) newErrors.hpm = "HPM wajib diisi";
      if (!form.hpl) newErrors.hpl = "HPL wajib diisi";
      if (!form.golonganDarah) newErrors.golonganDarah = "Golongan darah wajib dipilih";

      if (form.nomorJaminan.trim() && (!/^\d{9,11}$/.test(form.nomorJaminan))) {
        newErrors.nomorJaminan = "Nomor jaminan harus 9-11 digit angka";
      }

      if (!form.noTelp.trim()) {
        newErrors.noTelp = "No telepon wajib diisi";
      } else if (!/^\d{10,13}$/.test(form.noTelp)) {
        newErrors.noTelp = "No telepon harus 10-13 digit angka";
      }
    }

    console.log('🔴 Total errors found:', Object.keys(newErrors).length);
    console.log('📋 Errors detail:', newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validasi Gagal - Errors:', errors);
      
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
        suggestion: 'Pastikan semua DATA yang wajib sudah terisi dengan benar.'
      });
      return;
    }
    
    console.log('✅ Validasi Berhasil');

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const payload =
        type === "balita"
          ? {
              patientType: "balita",
              name: form.name,
              birthDate: form.birthDate,
              gender: form.gender,
              address: form.address,
              motherName: form.motherName,
              rt: form.rt,
              imunisasi: form.imunisasi.join(", "),
              kb: form.kb,
              pus: form.pus,
              wus: form.wus,
            }
          : {
              patientType: "ibu_hamil",
              name: form.name,
              birthDate: form.birthDate,
              address: form.address,
              rt: form.rt,
              nik: form.nik,
              noKK: form.noKK,
              namaSuami: form.namaSuami,
              gravida: form.gravida,
              partus: form.partus,
              abortus: form.abortus,
              jarakPersalinanSebelumnya: form.jarakPersalinanSebelumnya,
              usiaKandunganMinggu: form.usiaKandunganMinggu,
              tglPemeriksaanPertama: form.tglPemeriksaanPertama,
              hpm: form.hpm,
              hpl: form.hpl,
              nomorJaminan: form.nomorJaminan,
              noTelp: form.noTelp,
              golonganDarah: form.golonganDarah,
            };

      if (isEdit) {
        await API.put(`/api/pasien/${id}`, payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        setAlert({
          show: true,
          type: 'success',
          title: 'Berhasil Diperbarui',
          message: 'Data pasien berhasil diperbarui dalam sistem.',
          suggestion: 'Data pasien telah disimpan dan dapat digunakan untuk pemeriksaan.',
          shouldNavigateOnClose: true
        });
      } else {
        await API.post(`/api/pasien`,  payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        setAlert({
          show: true,
          type: 'success',
          title: 'Berhasil Disimpan',
          message: 'Data pasien baru berhasil ditambahkan ke dalam sistem.',
          suggestion: 'Pasien sudah terdaftar dan siap untuk dilakukan pemeriksaan.',
          shouldNavigateOnClose: true
        });
      }

    } catch (err: any) {
      console.error("Error simpan pasien:", err);
      setAlert({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pasien.',
        suggestion: 'Periksa kembali data yang diisi dan pastikan semua DATA sudah terisi dengan benar.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, show: false });
    if (alert.shouldNavigateOnClose) {
      navigate(-1);
    }
  };

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

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
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
                {isEdit
                  ? `Edit Data Pasien ${type === "balita" ? "Balita" : "Ibu Hamil"}`
                  : `Tambah Data Pasien ${type === "balita" ? "Balita" : "Ibu Hamil"}`}
              </h2>
            </div>

            <div className="w-20"></div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {type === "balita" ? (
                  <>
                    <InputField label="Nama Anak" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
                    <InputField label="Nama Ibu" name="motherName" value={form.motherName} onChange={handleChange} error={errors.motherName} required />
                    <RadioGroup
                      label="Jenis Kelamin"
                      name="gender"
                      options={[
                        { label: "Laki-laki", value: "L" },
                        { label: "Perempuan", value: "P" },
                      ]}
                      value={form.gender}
                      onChange={handleChange}
                      error={errors.gender}
                      required
                    />
                    <InputField label="RT" name="rt" type="text" value={form.rt} onChange={handleChange} error={errors.rt} required />
                    <InputField label="Tanggal Lahir" type="date" name="birthDate" value={form.birthDate} onChange={handleChange} error={errors.birthDate} required />

                    <CheckboxGroup
                      label="Imunisasi"
                      name="imunisasi"
                      values={form.imunisasi}
                      onChange={handleChange}
                      options={[
                        "Hepatitis B",
                        "BCG",
                        "Polio (OPV/IPV)",
                        "DTP-HB-Hib",
                        "PCV",
                        "Rotavirus",
                        "MR/MMR",
                        "Influenza",
                        "Varicella",
                        "Hepatitis A",
                        "Tifoid",
                        "Japanese Encephalitis (JE)",
                      ]}
                    />

                    <SelectField
                      label="Jenis KB"
                      name="kb"
                      value={form.kb}
                      onChange={handleChange}
                      options={[
                        { label: "Pil KB Progestin (Mini pil)", value: "Pil KB Progestin" },
                        { label: "KB Suntik Progestin", value: "KB Suntik Progestin" },
                        { label: "Implan (Susuk)", value: "Implan (Susuk)" },
                        { label: "IUD (Intrauterine Device)", value: "IUD" },
                        { label: "Kondom", value: "Kondom" },
                        { label: "Metode Amenore Laktasi (MAL)", value: "Metode Amenore Laktasi (MAL)" },
                      ]}
                    />
                    <RadioGroup
                      label="PUS"
                      name="pus"
                      options={[
                        { label: "Ya", value: "Ya" },
                        { label: "Tidak", value: "Tidak" },
                      ]}
                      value={form.pus}
                      onChange={handleChange}
                      error={errors.pus}
                      required
                    />
                    <RadioGroup
                      label="WUS"
                      name="wus"
                      options={[
                        { label: "Ya", value: "Ya" },
                        { label: "Tidak", value: "Tidak" },
                      ]}
                      value={form.wus}
                      onChange={handleChange}
                      error={errors.wus}
                      required
                    />
                  </>
                ) : (
                  <>
                    <InputField 
                      label="Nama Ibu" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      error={errors.name} 
                      required 
                    />
                    <InputField 
                      label="Nama Suami" 
                      name="namaSuami" 
                      value={form.namaSuami} 
                      onChange={handleChange} 
                      error={errors.namaSuami} 
                      required 
                    />
                    <InputField 
                      label="NIK" 
                      name="nik" 
                      value={form.nik} 
                      onChange={handleChange} 
                      error={errors.nik} 
                      required 
                      maxLength={16} 
                    />
                    <InputField 
                      label="No KK" 
                      name="noKK" 
                      value={form.noKK} 
                      onChange={handleChange} 
                      error={errors.noKK} 
                      required 
                      maxLength={16} 
                    />
                    <InputField 
                      label="RT" 
                      name="rt" 
                      type="text" 
                      value={form.rt} 
                      onChange={handleChange} 
                      error={errors.rt} 
                      required 
                    />
                    <InputField 
                      label="Tanggal Lahir" 
                      type="date" 
                      name="birthDate" 
                      value={form.birthDate} 
                      onChange={handleChange} 
                      error={errors.birthDate} 
                      required 
                    />
                    <InputField 
                      label="Gravida" 
                      name="gravida" 
                      type="text" 
                      value={form.gravida} 
                      onChange={handleChange} 
                      error={errors.gravida} 
                      required 
                    />
                    <InputField 
                      label="Partus" 
                      name="partus" 
                      type="text" 
                      value={form.partus} 
                      onChange={handleChange} 
                      error={errors.partus} 
                      required 
                    />
                    <InputField 
                      label="Abortus" 
                      name="abortus" 
                      type="text" 
                      value={form.abortus} 
                      onChange={handleChange} 
                      error={errors.abortus} 
                      required 
                    />
                    <InputField 
                      label="Jarak Persalinan Sebelumnya (bulan)" 
                      name="jarakPersalinanSebelumnya" 
                      type="text" 
                      value={form.jarakPersalinanSebelumnya} 
                      onChange={handleChange} 
                      error={errors.jarakPersalinanSebelumnya} 
                      required 
                    />
                    <InputField 
                      label="Usia Kandungan (minggu)" 
                      name="usiaKandunganMinggu" 
                      type="text" 
                      value={form.usiaKandunganMinggu} 
                      onChange={handleChange} 
                      error={errors.usiaKandunganMinggu} 
                      required 
                    />
                    <InputField 
                      label="Tanggal Pemeriksaan Pertama" 
                      type="date" 
                      name="tglPemeriksaanPertama" 
                      value={form.tglPemeriksaanPertama} 
                      onChange={handleChange} 
                      error={errors.tglPemeriksaanPertama} 
                      required 
                    />
                    <InputField 
                      label="HPM" 
                      type="date" 
                      name="hpm" 
                      value={form.hpm} 
                      onChange={handleChange} 
                      error={errors.hpm} 
                      required 
                    />
                    <InputField 
                      label="HPL" 
                      type="date" 
                      name="hpl" 
                      value={form.hpl} 
                      onChange={handleChange} 
                      error={errors.hpl} 
                      required 
                    />
                    <RadioGroup
                      label="Golongan Darah"
                      name="golonganDarah"
                      value={form.golonganDarah}
                      onChange={handleChange}
                      error={errors.golonganDarah}
                      options={[
                        { label: "A", value: "A" },
                        { label: "B", value: "B" },
                        { label: "AB", value: "AB" },
                        { label: "O", value: "O" },
                      ]}
                      required
                    />
                    <InputField 
                      label="Nomor Jaminan (Opsional)" 
                      name="nomorJaminan" 
                      value={form.nomorJaminan} 
                      onChange={handleChange} 
                      error={errors.nomorJaminan} 
                      maxLength={11} 
                    />
                    <InputField 
                      label="No Telepon" 
                      name="noTelp" 
                      value={form.noTelp} 
                      onChange={handleChange} 
                      error={errors.noTelp} 
                      required 
                      maxLength={13} 
                    />
                  </>
                )}
              </form>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    {isEdit ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Perbarui
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Simpan
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 text-start border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="text-red-500">*</span> menandakan DATA wajib diisi
              <br />
              <span className="text-black-500">Data pasien baru akan langsung dimasukkan ke dalam antrean setelah disimpan.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", error, required, maxLength }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      maxLength={maxLength}
      className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
        error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-400"
      }`}
      placeholder={`Masukkan ${label.toLowerCase()}...`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
        error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-400"
      }`}
    >
      <option value="">Pilih {label.toLowerCase()}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const RadioGroup = ({ label, name, options, value, onChange, error, required }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex gap-4 flex-wrap">
      {options.map((opt: any) => (
        <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="text-teal-500 focus:ring-teal-400"
          />
          {opt.label}
        </label>
      ))}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const CheckboxGroup = ({ label, name, options, values, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-3">
      {options.map((opt: any) => (
        <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={values.includes(opt)}
            onChange={onChange}
            className="text-teal-500 focus:ring-teal-400"
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

export default TambahPasien;