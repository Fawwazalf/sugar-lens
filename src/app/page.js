"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Switch from "./components/Switch";
import CameraModal from "./components/CameraModal";
import { motion } from "framer-motion";

export default function Home() {
  const [prompt, setPrompt] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isIndonesian, setIsIndonesian] = useState(false);

  const handleImageUpload = async (base64Image) => {
    setLoading(true);

    try {
      const response = await fetch("/api/generatePrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64Image.split(",")[1],
          language: isIndonesian,
        }),
      });

      if (response.ok) {
        let data = await response.text();
        console.log("Raw API Response Data:", data);

        data = data
          .replace(/\\n/g, " ")
          .replace(/\r?\n|\r/g, " ")
          .trim();
        console.log("Cleaned Data:", data);

        data = data.replace(/^"|"$/g, "");
        console.log("Data without Quotes:", data);

        const dataSplit = data.split("^&*").map((part) => part.trim());
        console.log("Data Split:", dataSplit);

        if (dataSplit.length >= 2) {
          setPrompt(dataSplit);
        } else {
          console.error("Data split did not produce the expected format.");
          setPrompt(["", ""]);
        }
      } else {
        console.error("Failed to fetch prompt data, response not ok.");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setIsIndonesian((prev) => !prev);
  };

  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    setAvailableCameras(cameras);
    if (cameras.length > 0) {
      setSelectedCamera(cameras[0].deviceId);
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    handleImageUpload(imageSrc);
  }, [webcamRef, handleImageUpload]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result;
      setImageSrc(base64Image);
      handleImageUpload(base64Image);
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
    <>
      <div className="relative w-screen min-h-[100svh] flex items-center justify-center ">
        <div className="relative w-full  max-h-[100svh] flex justify-center items-center">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ deviceId: selectedCamera }}
            className="w-auto"
          />
          {loading ? (
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "bottom" }}
                className="w-full h-full bg-gradient-to-t from-transparent to-white/50 border-t-2 border-dashed border-white"
              />
            </div>
          ) : (
            prompt.length > 0 &&
            imageSrc && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
                <div className="relative w-4/5 md:w-2/3 lg:w-1/2 bg-white/20 backdrop-blur-lg border border-white border-opacity-20 rounded-lg shadow-lg p-6">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 51 51"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-0 right-0 cursor-pointer"
                    onClick={() => setImageSrc(null)}
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

                  <h3 className="text-xl font-semibold text-center text-white">
                    Preview Gambar:
                  </h3>
                  <img
                    src={imageSrc}
                    alt="Selected or captured"
                    className="mt-4 w-full rounded-md"
                  />
                  <div className="mt-6 text-white">
                    <h2 className="text-2xl font-semibold mb-4">
                      {prompt[0] || "No Title Available"}
                    </h2>
                    <p className="text-lg">
                      {prompt[1] || "No Description Available"}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="absolute flex flex-col items-center justify-between w-full h-full z-10 top-0">
          <div className="w-full flex items-center justify-between mt-[36px] px-[16px]">
            <div className="h-[28px] w-[52px]"></div>
            <h1 className="text-[16px] font-bold text-center font-montserrat">
              Sugar Lens
            </h1>
            <Switch isOn={isIndonesian} handleToggle={toggleLanguage} />
          </div>

          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex justify-between w-full items-center max-w-[400px] px-[24px]">
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                whileTap={{ scale: 0.9 }}
              >
                <path
                  d="M4 24C4 14.572 4 9.858 6.928 6.928C9.86 4 14.572 4 24 4C33.428 4 38.142 4 41.07 6.928C44 9.86 44 14.572 44 24C44 33.428 44 38.142 41.07 41.07C38.144 44 33.428 44 24 44C14.572 44 9.858 44 6.928 41.07C4 38.144 4 33.428 4 24Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M32 20C34.2091 20 36 18.2091 36 16C36 13.7909 34.2091 12 32 12C29.7909 12 28 13.7909 28 16C28 18.2091 29.7909 20 32 20Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M4 25L7.504 21.934C8.38227 21.1661 9.51949 20.7606 10.6854 20.7996C11.8514 20.8386 12.959 21.3192 13.784 22.144L22.364 30.724C23.0298 31.3896 23.9091 31.7991 24.8471 31.8803C25.7851 31.9616 26.7217 31.7093 27.492 31.168L28.09 30.748C29.2012 29.9675 30.5442 29.5871 31.8996 29.6688C33.2551 29.7506 34.5426 30.2897 35.552 31.198L42 37"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
            </label>
            <motion.div
              whileTap={{ scale: 0.8 }}
              className="p-[2px] border-[3px] w-[80px] h-[80px] rounded-full justify-self-end flex flex-col "
            >
              <button
                onClick={capture}
                className="w-full h-full bg-white rounded-full"
              ></button>
            </motion.div>

            <button
              onClick={() => {
                toggleDropdown();
              }}
              className="w-[48px] h-[48px] border border-gray-300 rounded-full flex justify-center items-center"
            >
              <motion.div
                animate={{ rotate: dropdownOpen ? 360 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* SVG Content */}
                </svg>
              </motion.div>
            </button>

            <CameraModal
              availableCameras={availableCameras}
              selectCamera={selectCamera}
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
