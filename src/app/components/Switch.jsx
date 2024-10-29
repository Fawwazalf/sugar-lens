import { motion } from "framer-motion";
import React from "react";
import { twMerge } from "tailwind-merge";

const Switch = ({ isOn, handleToggle }) => {
  return (
    <form className="flex space-x-4 antialiased items-center">
      <label
        htmlFor="checkbox"
        className="h-7 px-1 flex items-center border  rounded-full w-[52px] relative cursor-pointer transition duration-200  border-white"
      >
        <motion.div
          initial={{
            width: "20px",
            x: isOn ? 0 : 22, // Ubah nilai untuk menggeser posisi
          }}
          animate={{
            height: ["20px", "10px", "20px"],
            width: ["20px", "30px", "20px", "20px"],
            x: isOn ? 22 : 0, // Geser posisi bulatan
          }}
          transition={{
            duration: 0.3,
            delay: 0.1,
          }}
          key={String(isOn)}
          className={twMerge(
            "h-[20px] block rounded-full bg-white shadow-md z-10"
          )}
        ></motion.div>

        {/* Teks untuk ID dan EN */}
        <span
          className={
            "absolute left-2 text-xs font-semibold text-white transition-opacity duration-200 opacity-100"
          }
        >
          ID
        </span>
        <span
          className={
            "absolute right-2 text-xs font-semibold text-white transition-opacity duration-200 z-10 opacity-100"
          }
        >
          EN
        </span>

        <input
          type="checkbox"
          checked={isOn}
          onChange={handleToggle}
          className="hidden"
          id="checkbox"
        />
      </label>
    </form>
  );
};

export default Switch;
