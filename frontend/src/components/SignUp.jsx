import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import axios from "axios"; // Importing axios
import SplineModelLogin from "../utils/SplineModelLogin";

const SignUp = () => {
  const navigate = useNavigate();
  const backToWebsite = () => {
    navigate("/");
  };

  // State for storing the uploaded image
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // To store the actual image file for upload
  const [cardId, setCardId] = useState(null); // State for storing the extracted Aadhar card number
  const [loading, setLoading] = useState(false); // Loading state for the submit button
  const [notification, setNotification] = useState(null); // State for showing notification

  // State for username and password
  const [username, setUsername] = useState(""); // Track the username input
  const [password, setPassword] = useState(""); // Track the password input

  // Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Store the image preview for display
      };
      setImageFile(file); // Store the actual file for upload to Gemini
      reader.readAsDataURL(file); // Read the file as a data URL

      // Trigger the Gemini image scan immediately after image is selected
      sendImageToGemini(file);
    }
  };

  // Function to send the image to Gemini for processing
  const sendImageToGemini = async (file) => {
    if (!file) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true); // Set loading to true when the request starts

    const ai = new GoogleGenAI({ apiKey: "AIzaSyAl7F82I8xPECmKHWxa3kuDpFlZZFPRkBE" });

    try {
      // Upload the image to Gemini
      const imageUploadResponse = await ai.files.upload({
        file: file,
      });

      const imageUri = imageUploadResponse.uri;
      const imageMimeType = imageUploadResponse.mimeType;

      // Send the image to the Gemini model for processing
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          createUserContent([ 
            "Retrieve the Aadhar card number and simply return only the number without any other extra text Also check if the image is a proper aadhar card or no if the image is not a proper aadhar card then return an error",
            createPartFromUri(imageUri, imageMimeType),
          ]),
        ],
      });

      if (response && response.text) {
        const aadharNumber = response.text.trim(); // Extract the Aadhar card number
        setCardId(aadharNumber); // Store the Aadhar number in the state

        // Show the success notification with the extracted Aadhar card number
        setNotification({
          type: "success",
          message: `Aadhar card number extracted successfully: ${aadharNumber}`,
        });
      } else {
        throw new Error("No text returned from Gemini response");
      }
    } catch (error) {
      console.error("Error sending image to Gemini:", error);
      setNotification({
        type: "error",
        message: `Failed to extract Aadhar card number. Error: ${error.message}`,
      });
    } finally {
      setLoading(false); // Set loading to false once the request completes (either success or error)
    }
  };

  // Function to handle the signup on form submission
  const handleSubmit = async () => {
    if (!cardId || !username || !password) {
      setNotification({
        type: "error",
        message: "Please make sure all fields are filled out correctly!",
      });
      return;
    }

    setLoading(true);

    try {
      // Send the POST request to the backend
      const responseFromBackend = await axios.post("http://localhost:3000/signup", {
        username: username, // Use the username entered by the user
        password: password, // Use the password entered by the user
        cardId: parseInt(cardId), // Send the Aadhar number as an integer
      });

      if (responseFromBackend.data.success) {
        setNotification({
          type: "success",
          message: responseFromBackend.data.message, // Show success message
        });
        navigate("/dashboard"); // Redirect to the login page after successful signup
      } else {
        setNotification({
          type: "error",
          message: "Signup failed. Please try again.", // If something goes wrong
        });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setNotification({
        type: "error",
        message: "Signup failed. Please try again later.",
      });
    } finally {
      setLoading(false); // Set loading to false once the request completes (either success or error)
    }
  };

  return (
    <div className="flex min-h-screen bg-black/90">
      {/* Left Side - Image & Text */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="/login1.jpg"
          alt="Desert"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="relative z-10 p-10 text-white flex flex-col justify-end h-full">
          <h1 className="text-4xl font-semibold">Capturing Moments,</h1>
          <h1 className="text-4xl font-semibold">Creating Memories</h1>
          <div className="flex mt-4 space-x-2">
            <div className="h-2 w-6 bg-gray-500 rounded"></div>
            <div className="h-2 w-6 bg-gray-300 rounded"></div>
            <div className="h-2 w-6 bg-white rounded"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          <button
            onClick={backToWebsite}
            className="absolute cursor-pointer top-4 right-4 bg-white/10 text-white px-4 py-2 rounded-lg text-sm"
          >
            Back to website →
          </button>
          <div className="">{/* You can insert your SplineModelLogin here */}</div>
          <h2
            className="text-white text-4xl font-bold"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Create an Account
          </h2>
          <p className="text-gray-400 mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-white">
              Login
            </a>
          </p>

          {/* Form Fields */}
          <div className="mt-6">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Username"
                value={username} // Bind value to state
                onChange={(e) => setUsername(e.target.value)} // Update state on input change
                className="w-full p-3 bg-white/5 rounded-lg text-white outline-none"
              />
            </div>

            {/* Image Upload Input */}
            <div className="mt-6 mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="w-full p-4 bg-white/10 text-white rounded-lg text-center cursor-pointer border border-dotted border-gray-400 hover:border-gray-500"
              >
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center text-white">
                      <span className="text-lg font-bold">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Upload your Aadhar Card</span>
                )}
              </label>
            </div>

            <div className="relative mt-4">
              <input
                type="password"
                placeholder="Enter your password"
                value={password} // Bind value to state
                onChange={(e) => setPassword(e.target.value)} // Update state on input change
                className="w-full p-3 bg-white/5 rounded-lg text-white outline-none pr-10"
              />
              <span className="absolute right-3 top-4 text-gray-400 cursor-pointer">
                👁
              </span>
            </div>
            <div className="mt-4 flex items-center">
              <input type="checkbox" id="terms" className="mr-2" />
              <label htmlFor="terms" className="text-gray-400 text-sm">
                I agree to the{" "}
                <a href="#" className="text-white">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit} // Call signup function on submit
              className="w-full mt-6 bg-white text-black hover:bg-white/80 duration-300 hover:text-black py-3 rounded-lg text-lg font-bold cursor-pointer"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin border-4 border-t-4 border-white rounded-full w-6 h-6 mr-3"></div>
                  Processing...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Div */}
      {notification && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg text-white ${
            notification.type === "success"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default SignUp;
