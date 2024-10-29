"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Switch from "./components/Switch";
import CameraModal from "./components/CameraModa";
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
      <div className="h-full flex items-center justify-center">
        <div className="relative h-min">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ deviceId: selectedCamera }}
            className="w-full"
          />
          {loading ? (
            <div className="absolute inset-0 overflow-hidden">
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
                <g clip-path="url(#clip0_5_22)">
                  <path
                    d="M0.00730772 2.08887C-0.0573976 1.55525 0.314519 1.07018 0.848144 1.00548C1.38177 0.940771 1.86684 1.31269 1.93154 1.84631L2.51367 6.35776C4.71282 3.09142 8.43193 1.07013 12.4421 1.07013C17.5519 1.07013 22.0957 4.32032 23.7612 9.13903C23.9391 9.64031 23.6642 10.1901 23.1629 10.3679C23.0659 10.4003 22.9527 10.4164 22.8395 10.4164C22.4353 10.4164 22.0633 10.1577 21.9178 9.7696C20.5272 5.72708 16.7111 3.01051 12.4422 3.01051C8.94941 3.01051 5.69921 4.85389 3.88818 7.79687L8.7392 7.2471C9.27282 7.18239 9.75789 7.57051 9.80645 8.10414C9.85495 8.63776 9.48303 9.12283 8.94941 9.17139L1.96389 9.96372C1.93154 9.96372 1.88304 9.96372 1.85069 9.96372C1.36556 9.96372 0.945147 9.60795 0.896645 9.12289L0.00730772 2.08887ZM24.0361 15.0734L17.0506 15.8658C16.5169 15.9305 16.1289 16.3994 16.1935 16.933C16.2582 17.4667 16.7271 17.8547 17.2608 17.7901L21.4812 17.3211C19.8318 20.7977 16.3229 23.0453 12.4259 23.0453C8.04381 23.0453 4.09828 20.1186 2.83703 15.9305C2.67532 15.4131 2.1417 15.122 1.62427 15.2837C1.10685 15.4453 0.815791 15.979 0.977444 16.4964C1.70507 18.9058 3.22509 21.0726 5.23018 22.5925C7.31612 24.161 9.80634 25.0019 12.4259 25.0019C17.2123 25.0019 21.4974 22.156 23.3892 17.8385L24.0684 23.2231C24.1331 23.7083 24.5535 24.064 25.0224 24.064C25.0709 24.064 25.1033 24.064 25.1518 24.064C25.6854 23.9993 26.0573 23.5142 25.9926 22.9806L25.0871 15.9466C25.0386 15.3969 24.5697 15.0249 24.0361 15.0734Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_5_22">
                    <rect
                      width="26"
                      height="26"
                      fill="white"
                      transform="matrix(1 0 0 -1 0 26)"
                    />
                  </clipPath>
                </defs>
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
    </>
  );
}
