import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";
import PropertyType from "./PropertyType";
import PropertyAddress from "./PropertyAddress";
import PropertyDetails from "./PropertyDetails";

const AddProperty = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [propertyData, setPropertyData] = useState({
    name: "",
    propertyType: "",
    address: {
      buildingNo: "",
      near: "",
      road: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
    location: "",
  });

  const { managerToken } = useManagerAuth();
  const navigate = useNavigate();

  const handleNext = (stepData) => {
    setPropertyData((prev) => ({ ...prev, ...stepData }));
    setStep((prev) => Math.min(prev + 1, 3)); // ab 3 steps hain
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (finalStepData) => {
    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("name", propertyData.name);
      formData.append("propertyType", propertyData.propertyType);
      formData.append("location", propertyData.location);
      formData.append("address", JSON.stringify(propertyData.address));
      formData.append("totalRooms", finalStepData.totalRooms);
      formData.append("price", finalStepData.price);
      if (finalStepData.originalPrice) {
        formData.append("originalPrice", finalStepData.originalPrice);
      }
      formData.append("facilities", JSON.stringify(finalStepData.facilities));
      formData.append("description", finalStepData.description);

      finalStepData.images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("http://localhost:5001/api/hotels", {
        method: "POST",
        headers: { Authorization: `Bearer ${managerToken}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Failed to submit property");
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="wizard-page">
        <div className="wizard-card">
          <p className="wizard-eyebrow">HAVENCO · LIST YOUR PROPERTY</p>
          <h1 className="wizard-heading">Property submitted! 🎉</h1>
          <p style={{ fontFamily: "Inter, sans-serif", color: "#555", marginBottom: "2rem" }}>
            Your property is now pending admin approval. We'll notify you once it's live.
          </p>
          <button
            type="button"
            className="wizard-next-btn"
            style={{ width: "100%" }}
            onClick={() => navigate("/manager/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {step === 1 && (
        <PropertyType
          onNext={handleNext}
          initialValue={propertyData.propertyType}
          initialName={propertyData.name}
        />
      )}

      {step === 2 && (
        <PropertyAddress
          onNext={handleNext}
          onBack={handleBack}
          initialValue={propertyData.address}
        />
      )}

      {step === 3 && (
        <PropertyDetails onBack={handleBack} onSubmit={handleSubmit} submitting={submitting} />
      )}

      {submitError && (
        <p className="wizard-error" style={{ textAlign: "center", marginTop: "1rem" }}>
          {submitError}
        </p>
      )}
    </div>
  );
};

export default AddProperty;