import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManagerAuth } from "../context/ManagerAuthContext";
import "./ManagerKyc.css";

const ManagerKyc = () => {
  const { managerProfile, managerToken, setManagerProfile } = useManagerAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const currentStatus = managerProfile?.kycStatus || "not_submitted";

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a document to upload.");
      return;
    }
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch("http://localhost:5001/api/managers/upload-kyc", {
        method: "POST",
        headers: { Authorization: `Bearer ${managerToken}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setManagerProfile((prev) => ({
        ...prev,
        govtIdDocument: data.govtIdDocument,
        kycStatus: data.kycStatus,
      }));
      setSuccess(true);
      setUploading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="kyc-page">
      <div className="kyc-card">
        <p className="kyc-eyebrow">HAVENCO · IDENTITY VERIFICATION</p>
        <h1>Verify your identity</h1>
        <p className="kyc-subtext">
          Upload a government-issued ID (Aadhaar, PAN, Passport, or Driving Licence) so our team can verify your account.
        </p>

        <div className={`kyc-status-badge status-${currentStatus}`}>
          {currentStatus.replace("_", " ")}
        </div>

        {currentStatus === "verified" ? (
          <p className="kyc-done-note">
            Your identity has already been verified. No further action needed.
          </p>
        ) : currentStatus === "pending" && !success ? (
          <p className="kyc-done-note">
            Your document is under review. You can upload a new one below if you need to replace it.
          </p>
        ) : null}

        {success ? (
          <div className="kyc-success">
            <p>Document uploaded — awaiting admin verification.</p>
            <button className="kyc-back-btn" onClick={() => navigate("/manager/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            <label className="kyc-upload-box" htmlFor="kyc-file">
              {preview ? (
                <img src={preview} alt="Document preview" className="kyc-preview" />
              ) : (
                <span>Click to choose a file (image or PDF)</span>
              )}
            </label>
            <input
              id="kyc-file"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              hidden
            />

            {error && <p className="kyc-error">{error}</p>}

            <div className="kyc-actions">
              <button
                className="kyc-back-btn"
                onClick={() => navigate("/manager/dashboard")}
                disabled={uploading}
              >
                Back
              </button>
              <button className="kyc-upload-btn" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerKyc;