import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiCamera, FiCheckCircle, FiXCircle, FiUser, FiHash, FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import API from "../../api/axios";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";
import StickyHeader from "../../components/common/StickyHeader";
import NmRippleButton from "../../components/common/NmRippleButton";

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
    <div className="sidebar-layout">
      <OrganizerNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Organizer", "Scan QR"]} />
        <div className="px-6 pb-8 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--nm-text)" }}>📷 QR Check-In Scanner</h1>
            <p className="mb-6" style={{ color: "var(--nm-text-secondary)" }}>Scan student QR codes to verify attendance</p>
          </motion.div>

          {/* Stats Bar */}
          <div className="nm-flat p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="nm-inset w-10 h-10 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>{checkedInCount}</p>
                <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>Checked in this session</p>
              </div>
            </div>
            {!scanning ? (
              <NmRippleButton onClick={startScanner} className="flex items-center gap-2">
                <FiCamera /> Start Scanning
              </NmRippleButton>
            ) : (
              <NmRippleButton onClick={stopScanner} variant="flat" className="flex items-center gap-2">
                <FiXCircle /> Stop
              </NmRippleButton>
            )}
          </div>

          {/* Scanner Area */}
          {scanning && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="nm-flat p-6 mb-6">
              <div id="qr-reader" className="rounded-lg overflow-hidden" />
              <p className="text-center text-sm mt-4" style={{ color: "var(--nm-text-secondary)" }}>Point your camera at the student's QR code</p>
            </motion.div>
          )}

          {/* Processing */}
          {processing && (
            <div className="nm-flat p-8 mb-6 text-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: "var(--nm-text-secondary)" }}>Verifying attendance...</p>
            </div>
          )}

          {/* Success Result */}
          {lastCheckedIn && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="nm-flat border border-green-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                  <FiCheckCircle />
                </div>
                <div>
                  <h3 className="font-bold text-green-700 text-lg">Check-in Successful!</h3>
                  <p className="text-sm text-green-600">
                    {new Date(lastCheckedIn.checkedInAt).toLocaleTimeString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2" style={{ color: "var(--nm-text)" }}>
                  <FiUser className="text-green-600" />
                  <span><strong>Name:</strong> {lastCheckedIn.student?.firstName} {lastCheckedIn.student?.lastName}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: "var(--nm-text)" }}>
                  <FiHash className="text-green-600" />
                  <span><strong>Enrollment:</strong> {lastCheckedIn.student?.enrollmentNo}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: "var(--nm-text)" }}>
                  <FiMail className="text-green-600" />
                  <span><strong>Email:</strong> {lastCheckedIn.student?.email}</span>
                </div>
              </div>
              <NmRippleButton onClick={startScanner} className="mt-4 text-sm py-2.5">
                Scan Next Student →
              </NmRippleButton>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="nm-flat border border-red-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <FiXCircle className="text-red-500 text-2xl" />
                <h3 className="font-bold text-red-700">Check-in Failed</h3>
              </div>
              <p className="text-red-600 text-sm">{error}</p>
              <NmRippleButton onClick={startScanner} className="mt-4 text-sm py-2.5">
                Try Again
              </NmRippleButton>
            </motion.div>
          )}

          {/* Instructions */}
          {!scanning && !lastCheckedIn && !error && (
            <div className="nm-flat p-6 text-center">
              <p className="text-6xl mb-4">📱</p>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--nm-text)" }}>Ready to scan</h3>
              <p className="text-sm" style={{ color: "var(--nm-text-secondary)" }}>Click "Start Scanning" to begin checking in students.</p>
              <p className="text-xs mt-2" style={{ color: "var(--nm-text-secondary)" }}>Make sure to allow camera access when prompted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanQR;
