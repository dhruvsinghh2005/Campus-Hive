import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiCamera, FiCheckCircle, FiXCircle, FiUser, FiHash, FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import API from "../../api/axios";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";

const ScanQR = () => {
  const { eventId } = useParams();
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastCheckedIn, setLastCheckedIn] = useState(null);
  const [error, setError] = useState(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const scannerRef = useRef(null);

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);
    setError(null);
    setLastCheckedIn(null);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        qrbox: { width: 280, height: 280 },
        fps: 10,
        rememberLastUsedCamera: true,
      });

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    stopScanner();
    setProcessing(true);
    setError(null);

    try {
      const qrData = JSON.parse(decodedText);
      const { data } = await API.post("/registrations/verify-qr", {
        studentId: qrData.studentId,
        eventId: eventId || qrData.eventId,
      });

      if (data.success) {
        setLastCheckedIn(data.data);
        setCheckedInCount((prev) => prev + 1);
        toast.success("✅ Check-in successful!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid QR code";
      setError(msg);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const onScanFailure = (err) => {
    // Silently ignore scan failures (happens every frame without QR)
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganizerNavbar />

      <div className="max-w-2xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">📷 QR Check-In Scanner</h1>
          <p className="text-gray-500 mb-6">Scan student QR codes to verify attendance</p>
        </motion.div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{checkedInCount}</p>
              <p className="text-xs text-gray-500">Checked in this session</p>
            </div>
          </div>
          {!scanning ? (
            <button onClick={startScanner}
              className="bg-campus-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <FiCamera /> Start Scanning
            </button>
          ) : (
            <button onClick={stopScanner}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <FiXCircle /> Stop
            </button>
          )}
        </div>

        {/* Scanner Area */}
        {scanning && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div id="qr-reader" className="rounded-lg overflow-hidden" />
            <p className="text-center text-sm text-gray-500 mt-4">Point your camera at the student's QR code</p>
          </motion.div>
        )}

        {/* Processing */}
        {processing && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying attendance...</p>
          </div>
        )}

        {/* Success Result */}
        {lastCheckedIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                <FiCheckCircle />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">Check-in Successful!</h3>
                <p className="text-sm text-green-600">
                  {new Date(lastCheckedIn.checkedInAt).toLocaleTimeString("en-IN")}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <FiUser className="text-green-600" />
                <span><strong>Name:</strong> {lastCheckedIn.student?.firstName} {lastCheckedIn.student?.lastName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiHash className="text-green-600" />
                <span><strong>Enrollment:</strong> {lastCheckedIn.student?.enrollmentNo}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiMail className="text-green-600" />
                <span><strong>Email:</strong> {lastCheckedIn.student?.email}</span>
              </div>
            </div>
            <button onClick={startScanner}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition">
              Scan Next Student →
            </button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FiXCircle className="text-red-500 text-2xl" />
              <h3 className="font-bold text-red-800">Check-in Failed</h3>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={startScanner}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition">
              Try Again
            </button>
          </motion.div>
        )}

        {/* Instructions */}
        {!scanning && !lastCheckedIn && !error && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-6xl mb-4">📱</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to scan</h3>
            <p className="text-gray-500 text-sm">Click "Start Scanning" to begin checking in students.</p>
            <p className="text-gray-400 text-xs mt-2">Make sure to allow camera access when prompted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQR;