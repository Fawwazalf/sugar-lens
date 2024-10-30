import React, { useState } from "react";

const CameraModal = ({ availableCameras, selectCamera, isOpen, onClose }) => {
  const [activeCameraId, setActiveCameraId] = useState(null); // Menyimpan kamera yang sedang aktif

  if (!isOpen) return null; // Jika modal tidak terbuka, kembalikan null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative bg-white/20 backdrop-blur-lg border border-white border-opacity-20 rounded-md shadow-lg p-6 w-max max-w-md">
        {/* Tombol Close di sudut kanan atas */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 51 51"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 right-0 cursor-pointer"
          onClick={onClose}
        >
          <path
            d="M19.0918 31.8198L31.8197 19.0919"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M31.8197 31.8198L19.0918 19.0919"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <ul>
          {availableCameras.map((camera) => (
            <li
              key={camera.deviceId}
              onClick={() => {
                selectCamera(camera.deviceId);
                setActiveCameraId(camera.deviceId); // Mengatur kamera aktif
                onClose(); // Menutup modal setelah memilih kamera
              }}
              className={`p-2 text-white rounded-md cursor-pointer transition-all ${
                activeCameraId === camera.deviceId
                  ? "bg-blue-500" // Warna atau gaya untuk kamera yang aktif
                  : "hover:bg-white/30 hover:backdrop-blur-md"
              }`}
            >
              {camera.label || `Kamera ${camera.deviceId}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CameraModal;
