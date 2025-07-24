import { useState, useEffect } from "react";
import axios from "axios";
import logo from "./assets/logo.png";

function App() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [csvText, setCsvText] = useState("");

  const downloadImage = async (mediaId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/media/${mediaId}`,
        { responseType: "blob" }
      );
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error("Invalid response format - expected Blob");
      }
      const url = URL.createObjectURL(response.data);
      setPreviewUrl(url);
      return url;
    } catch (err) {
      console.error("Image download error:", err);
      setError(`Failed to load media: ${err.message}`);
      return null;
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("http://localhost:3000/api/csv")
      .then((response) => {
        const csvData = response.data;
        setCsvText(csvData);
        const lines = csvData.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
          }, {});
        });
        const uniquePhones = [
          ...new Set(data.map((item) => item["Phone Number"])),
        ];
        setPhoneNumbers(uniquePhones);
      })
      .catch((err) => {
        console.error("Error fetching CSV:", err);
        setError("Failed to load CSV data");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePhoneClick = (phone) => {
    setSelectedPhone(phone);
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
    });

    const phoneMedia = data
      .filter((item) => item["Phone Number"] === phone)
      .filter((item) => item["Media Type"] === "image");

    setMediaFiles(phoneMedia);
    setSelectedMedia(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleMediaClick = async (media) => {
    setSelectedMedia(media);
    setError(null);
    try {
      await downloadImage(media["Media ID"]);
    } catch (err) {
      console.error("Error handling media click:", err);
      setError("Failed to load media file");
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement("a");
      link.href = previewUrl;
      link.download = `media_${selectedMedia["Media ID"]}`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(previewUrl);
      }, 100);
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-center bg-[#202938] text-white p-4 shadow-md h-16">
        <img
          src={logo}
          alt="Company Logo"
          className="absolute left-4 h-14 w-14"
        />
        <h1 className="text-xl font-semibold">MEDIA VIEWER</h1>
      </div>
      <div className="flex h-[calc(100vh-56px)]">
        {/* Phone Numbers Panel */}
        <div className="w-1/4 border-r border-gray-300 bg-white overflow-y-auto">
          <div className="p-3 border-b border-gray-300 bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-center">
              Phone Numbers
            </h2>
          </div>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <ul>
              {phoneNumbers.map((phone, index) => (
                <li
                  key={index}
                  className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex items-center ${
                    selectedPhone === phone ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handlePhoneClick(phone)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">+{phone}</p>
                    <p className="text-xs text-gray-500">Last active: today</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Media Files Panel */}
        <div className="w-1/4 border-r border-gray-300 bg-white overflow-y-auto">
          <div className="p-3 border-b border-gray-300 bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-center">Files</h2>
          </div>
          {selectedPhone ? (
            mediaFiles.length > 0 ? (
              <ul>
                {mediaFiles.map((media, index) => (
                  <li
                    key={index}
                    className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex items-center ${
                      selectedMedia?.["Media ID"] === media["Media ID"]
                        ? "bg-gray-100"
                        : ""
                    }`}
                    onClick={() => handleMediaClick(media)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{media["Media ID"]}</p>
                      <p className="text-xs text-gray-500">
                        {media["Media Type"]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No media files found
              </div>
            )
          ) : (
            <div className="p-4 text-center text-gray-500">
              Please select a phone number
            </div>
          )}
        </div>

        {/* Media Preview Panel */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="p-3 border-b border-gray-300 bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-center">View</h2>
          </div>
          {error && <div className="p-4 text-center text-red-500">{error}</div>}
          {selectedMedia ? (
            <div className="p-4">
              {selectedMedia["Media Type"] === "image" ? (
                <div className="rounded-lg overflow-hidden">
                  <div className="aspect-video min-w-full min-h-full flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Media preview"
                        className="max-w-full max-h-full object-contain"
                        onError={() => setError("Failed to load image")}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {!error && (
                          <p className="mt-2 text-gray-500">Loading image...</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">
                          +{selectedMedia["Phone Number"]}
                        </p>
                        <p className="text-xs text-gray-500">
                          Today at 12:45 PM
                        </p>
                      </div>
                    </div>
                    {previewUrl && (
                      <button
                        onClick={handleDownload}
                        className="bg-[#202938] text-white font-semibold px-3 py-1 rounded text-sm hover:bg-[#041635] transition-colors"
                      >
                        Download Media
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Unsupported media type
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Select a media file to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
