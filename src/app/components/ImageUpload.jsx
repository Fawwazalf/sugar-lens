"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const ImageUpload = ({ sendFile }) => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [useWebcam, setUseWebcam] = useState(true);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State untuk mengontrol dropdown

  // Mengambil daftar kamera
  const getCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    setAvailableCameras(cameras);
    if (cameras.length > 0) {
      setSelectedCamera(cameras[0].deviceId); // Set kamera pertama sebagai default
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  // Fungsi untuk menangkap gambar dari webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    sendFile(imageSrc); // Kirim gambar yang diambil ke handler di parent component
  }, [webcamRef, sendFile]);

  // Fungsi untuk menangani upload dari storage
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result;
      setImageSrc(base64Image);
      sendFile(base64Image); // Kirim gambar yang dipilih dari storage ke handler di parent component
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const selectCamera = (cameraId) => {
    setSelectedCamera(cameraId);
    setDropdownOpen(false);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="use-webcam"
            name="input-source"
            value="webcam"
            checked={useWebcam}
            onChange={() => setUseWebcam(true)}
            className="hidden peer"
          />
          <label
            htmlFor="use-webcam"
            className={`cursor-pointer px-4 py-2 rounded-md border-2 ${
              useWebcam
                ? "border-blue-600 bg-blue-200 text-blue-800"
                : "border-gray-300 text-gray-800"
            } hover:bg-blue-100 transition duration-200`}
          >
            Gunakan Kamera
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="upload-storage"
            name="input-source"
            value="upload"
            checked={!useWebcam}
            onChange={() => setUseWebcam(false)}
            className="hidden peer"
          />
          <label
            htmlFor="upload-storage"
            className={`cursor-pointer px-4 py-2 rounded-md border-2 ${
              !useWebcam
                ? "border-blue-600 bg-blue-200 text-blue-800"
                : "border-gray-300 text-gray-800"
            } hover:bg-blue-100 transition duration-200`}
          >
            Upload dari Storage
          </label>
        </div>
      </div>

      {useWebcam ? (
        <div>
          <div className="relative mb-4">
            <button
              onClick={toggleDropdown}
              className="w-full border border-gray-300 rounded-md p-2 text-left text-gray-800"
            >
              {selectedCamera
                ? availableCameras.find(
                    (camera) => camera.deviceId === selectedCamera
                  )?.label || `Kamera ${selectedCamera}`
                : "Pilih Kamera"}
            </button>
            {dropdownOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                {availableCameras.map((camera) => (
                  <li
                    key={camera.deviceId}
                    onClick={() => selectCamera(camera.deviceId)}
                    className="p-2 text-gray-800 hover:bg-blue-100 cursor-pointer"
                  >
                    {camera.label || `Kamera ${camera.deviceId}`}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ deviceId: selectedCamera }}
            className="w-full rounded-md border border-gray-300"
          />
          <button
            onClick={capture}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Ambil Gambar
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-4 border border-gray-300 p-2 rounded-lg w-full"
        />
      )}

      {imageSrc && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Preview Gambar:</h3>
          <img
            src={imageSrc}
            alt="Selected or captured"
            className="mt-2 w-full rounded-md border border-gray-300"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
