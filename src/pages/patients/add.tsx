import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/common/Navbar";
import MaleInfertilityCRF from "@/components/crf/male_infertility";
import MaleSexualDysfunctionCRF from "@/components/crf/male_sexual_dysfunction";
import { useAuth } from "@/hooks/AuthContext";
import CalenderModal from "@/components/modal/CalenderModal";
import { usePatient } from "@/hooks/PatientContext";
import { useQuery } from "@tanstack/react-query";
import { parseExcelToCRF } from "@/utils/upload";
import PreviewModal from "@/components/modal/PreviewModal";

export default function AddPatient() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [selectedMethod, setSelectedMethod] = useState<"crf" | "upload">("crf");
  const [crfType, setCrfType] = useState("");
  const [continueClicked, setContinueClicked] = useState(false);
  const [isCalenderModalOpen, setIsCalenderModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCrfForm, setShowCrfForm] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [uploadType, setUploadType] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  // const [appointMentCount, setAppointmentCount] = useState(null)

  const { patientDetails, setPatientDetails } = usePatient();


  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await parseExcelToCRF(file, "male_infertility");
    console.log("data", data)
    setParsedData(data);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${apiBase}/api/crf/pdf`, { method: "POST", body: formData });
    // const res = await transformPDFtoCRF(file, "p1", "23/10/2020")
    console.log("res", res)
    const json = await res.json();
    console.log([json.data])
    setParsedData([json.data]);
  };

  useEffect(() => {
    if (patientDetails) {
      setCrfType(patientDetails?.condition);
      setContinueClicked(true);
      setIsCalenderModalOpen(true);
      setIsFirstTime(false);
    }
    const currDate = new Date();
    setCurrentDate(new Date());
    setSelectedDate(currDate.getDate());
  }, []);

  const { user } = useAuth();

  const { data: appointMentCount, isLoading } = useQuery({
    queryKey: [
      "appointments",
      user?.id,
      currentDate.getFullYear(),
      currentDate.getMonth(),
    ],
    queryFn: async () => {
      const res = await fetch(
        `${apiBase}/api/doctor/appointments?year=${currentDate.getFullYear()}&month=${
          currentDate.getMonth() + 1
        }&doctor_id=${user?.id}&count=true`
      );
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
    enabled: !!user?.id && !!currentDate,
    staleTime: 1000 * 60 * 5,
  });

  const handleContinue = () => {
    setContinueClicked(true);
    if (selectedMethod === "crf") {
      setIsCalenderModalOpen(true);
    } else {
      setIsPreviewModalOpen(true);
    }

    // if (selectedMethod === 'crf' && crfType) {
    //   // Navigate to CRF form based on type
    //   router.push(`/patients/crf/${crfType}`)
    // } else if (selectedMethod === 'upload') {
    //   // Navigate to file upload page
    //   router.push('/patients/upload')
    // }
  };

  const handleCloseCalenderModal = () => {
    setIsCalenderModalOpen(false);
    setContinueClicked(false);
  };

  const handleShowCrfForm = () => {
    setShowCrfForm(true);
  };

  const renderCalenderModal = () => {
    if (isCalenderModalOpen) {
      return (
        <CalenderModal
          handleCloseCalenderModal={handleCloseCalenderModal}
          handleShowCrfForm={handleShowCrfForm}
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          appointments={appointMentCount}
          isLoading={isLoading}
        />
      );
    }
  };
  const renderCrfForm = () => {
    if (crfType === "male_infertility") {
      return (
        <MaleInfertilityCRF
          user={user}
          isFirstTime={isFirstTime}
          selectedDate={
            currentDate.getFullYear() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-" +
            selectedDate
          }
        />
      );
    }
    if (crfType === "male_sexual_dysfunction") {
      return (
        <MaleSexualDysfunctionCRF
          user={user}
          isFirstTime={isFirstTime}
          selectedDate={
            currentDate.getFullYear() +
            "-" +
            (currentDate.getMonth() + 1) +
            "-" +
            selectedDate
          }
        />
      );
    }
  };

  const renderPreviewModal = () => {
    console.log(selectedMethod, parsedData)
    return (
      <PreviewModal setIsPreviewModal={setIsPreviewModalOpen} data={uploadType === 'excel' ? parsedData.slice(1) : parsedData} user={user}/>
    )
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        {showCrfForm ? (
          renderCrfForm()
        ) : (
          <>
            {continueClicked ? (
             selectedMethod === "upload" ? renderPreviewModal() : renderCalenderModal()
            ) : (
              <main className="container-page py-8">
                <div className="max-w-4xl mx-auto">
                  {/* Page Header */}
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Add New Patient
                    </h1>
                    <p className="text-lg text-gray-300">
                      Choose a method to add patient information to the PRISM
                      platform.
                    </p>
                  </div>

                  {/* Method Selection */}
                  <div className="space-y-4 mb-8">
                    {/* CRF Method */}
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMethod === "crf"
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedMethod("crf")}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                            selectedMethod === "crf"
                              ? "border-green-500 bg-green-500"
                              : "border-gray-400"
                          }`}
                        >
                          {selectedMethod === "crf" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Enter Data via CRF
                          </h3>
                          <p className="text-gray-400">
                            Manually input patient data using a structured Case
                            Report Form (CRF).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Upload Method */}
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMethod === "upload"
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedMethod("upload")}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${
                            selectedMethod === "upload"
                              ? "border-green-500 bg-green-500"
                              : "border-gray-400"
                          }`}
                        >
                          {selectedMethod === "upload" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Upload File
                          </h3>
                          <p className="text-gray-400">
                            Upload patient data from PDF or Excel files for
                            automated extraction.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CRF Type Selection (only show if CRF method is selected) */}
                  {selectedMethod === "crf" && (
                    <div className="mb-8">
                      <label className="block text-lg font-medium text-white mb-3">
                        CRF Type
                      </label>
                      <select
                        value={crfType}
                        onChange={(e) => setCrfType(e.target.value)}
                        className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select CRF Type</option>
                        <option value="male_infertility">
                          Male Infertility
                        </option>
                        <option value="male_sexual_dysfunction">
                          Male Sexual Dysfunction
                        </option>
                      </select>
                    </div>
                  )}

                  {selectedMethod === "upload" && (
                    <div className="mb-8">
                      <label className="block text-lg font-medium text-white mb-3">
                        Upload file
                      </label>
                      <select
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select file Type</option>
                        <option value="excel">Excel(.xlsx)</option>
                        {/* <option value="pdf">PDF(.pdf)</option> */}
                      </select>

                      {uploadType !== "" && (
                        <>
                          <h2>Upload file ({uploadType})</h2>
                          {uploadType === "excel" ? (
                            <input
                              type="file"
                              accept=".xlsx"
                              onChange={handleExcelUpload}
                            />
                          ) : (
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handlePdfUpload}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Continue Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleContinue}
                      disabled={selectedMethod === "crf" && !crfType}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </main>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
