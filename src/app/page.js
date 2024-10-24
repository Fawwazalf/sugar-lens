"use client";
import { useState } from "react";
import ImageUpload from "./components/ImageUpload";

export default function Home() {
  const [prompt, setPrompt] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(false);
  const [isIndonesian, setIsIndonesian] = useState(false); // Default to English (false)

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
    setIsIndonesian((prev) => !prev); // Toggle between true and false
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">gizi lens</h1>
      <button
        className="mb-4 p-2 bg-blue-500 text-white rounded"
        onClick={toggleLanguage}
      >
        {isIndonesian ? "Switch to English" : "Switch to Indonesian"}
      </button>
      <ImageUpload sendFile={handleImageUpload} />
      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : (
        prompt.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">
              {prompt[0] || "No Title Available"}
            </h2>
            <p className="text-lg">{prompt[1] || "No Description Available"}</p>
          </div>
        )
      )}
    </div>
  );
}
