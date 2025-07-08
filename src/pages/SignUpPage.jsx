import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { SignUpStep1 } from "@/components/auth/SignUpSteps/SignUpStep1";
import { SignUpStep2 } from "@/components/auth/SignUpSteps/SignUpStep2";
import { SignUpStep3 } from "@/components/auth/SignUpSteps/SignUpStep3";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";
import animationData from "@/lotties/crm-animation-lotties.json";
import { sendEmail } from "@/services/emailService";
import { generateOTP } from "@/utils/generateOTP";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase.config";
import { callSoapService } from "@/api/callSoapService";

const PUBLIC_SERVICE_URL = import.meta.env.VITE_SOAP_ENDPOINT;

const SignUpPage = () => {
  const [formValues, setFormValues] = useState({
    FULL_NAME: "",
    LOGIN_EMAIL_ADDRESS: "",
    LOGIN_MOBILE_NO: "",
    LOGIN_PASSWORD: "",
    COMPANY_NAME: "",
    GST_VAT_NO: "",
    FULL_ADDRESS: "",
    CITY: "",
    STATE_NAME: "",
    COUNTRY: "",
    PIN_CODE: "",
    GPS_LOCATION: "",
    GPS_LATITUDE: "",
    GPS_LONGITUDE: "",
    userType: "",
    confirmPassword: "",
    acknowledged: false,
  });

  const [step, setStep] = useState(1);
  const [contactInfo, setContactInfo] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpForEmail, setOtpForEmail] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const recaptchaRef = useRef(null);

  const setupRecaptcha = () => {
    if (!auth) throw new Error("🔥 auth is undefined!");
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        siteKey: "6LcUGW4rAAAAAB35Or18Oizvq3zL48MrZtoUgtpE",
        callback: () => {
          console.log("✅ Captcha solved!");
        },
      });
      recaptchaRef.current.render().catch(console.error);
    }
    return recaptchaRef.current;
  };

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    setError("");
    if (isEmail) {
      if (!contactInfo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError("Please enter a valid email address");
        return;
      }

      try {
        setLoading(true);
        const generatedOtp = generateOTP(6);
        setOtpForEmail(generatedOtp);

        const emailData = {
          toEmail: contactInfo,
          subject: "Your iStreams ERP Verification Code",
          body: `Your verification code is: ${generatedOtp}`,
          displayName: "iStreams ERP",
        };

        await sendEmail(emailData);
        setOtpSent(true);
        setOtpTimer(120);
        setStep(2);
      } catch (err) {
        console.error("Email OTP error:", err);
        setError("Failed to send OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }

      const appVerifier = setupRecaptcha();
      try {
        const confirmation = await signInWithPhoneNumber(auth, contactInfo, appVerifier);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setOtpTimer(120);
        setStep(2);
        alert("✅ OTP sent!");
      } catch (err) {
        console.error("Error sending OTP:", err);
        if (err.code === "auth/too-many-requests") {
          setError("Too many SMS requests. Please wait a while before retrying.");
        } else {
          setError("Could not send OTP. Please try again.");
        }
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (isEmail) {
      if (!otp) {
        setError("Please enter the OTP");
        return;
      }
      if (otp === otpForEmail) {
        setFormValues((prev) => ({
          ...prev,
          LOGIN_EMAIL_ADDRESS: contactInfo,
        }));
        setEmailVerified(true);
        setStep(3);
      } else {
        setError("Invalid OTP. Please check and try again.");
      }
    } else {
      if (!confirmationResult) {
        setError("Please request an OTP first.");
        return;
      }
      if (otp.length === 0) {
        alert("Enter the OTP you received.");
        return;
      }

      try {
        const result = await confirmationResult.confirm(otp);
        setFormValues((prev) => ({
          ...prev,
          LOGIN_MOBILE_NO: contactInfo,
        }));
        setPhoneVerified(true);
        setStep(3);
        console.log("User signed in:", result.user);
      } catch (err) {
        console.error("Invalid OTP:", err);
        setError("Invalid OTP, please try again.");
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
    setOtp("");
    setOtpForEmail("");
  };

  const handleOptionalVerify = async (contact, isEmail) => {
    try {
      if (isEmail) {
        setEmailVerified(true);
        setFormValues(prev => ({ ...prev, LOGIN_EMAIL_ADDRESS: contact }));
      } else {
        setPhoneVerified(true);
        setFormValues(prev => ({ ...prev, LOGIN_MOBILE_NO: contact }));
      }
      return true; // Indicate success
    } catch (error) {
      console.error("Optional verify failed:", error);
      return false;
    }
  };

  const handleSignup = useCallback(async (values) => {
    setLoading(true);
    setError("");

    try {
      if (!values || Object.values(values).some(v => v === undefined)) {
        throw new Error("Form data is incomplete");
      }

      const dbResponse = await callSoapService(
        PUBLIC_SERVICE_URL,
        "ConnectToPublicDB",
        ""
      );
      console.log("DB Connection:", dbResponse);

      const payload = {
        ...values
      };

      console.log("Final Payload:", payload);

      const response = await callSoapService(
        PUBLIC_SERVICE_URL,
        "Public_User_CreateProfile",
        payload
      );

      if (typeof response === "string" && response.includes("SUCCESS")) {
        const loginCredential = isEmail
          ? values.LOGIN_EMAIL_ADDRESS
          : values.LOGIN_MOBILE_NO;

        await login(loginCredential, values.LOGIN_PASSWORD);
        navigate("/login");
      } else {
        throw new Error(response || "Profile creation failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isEmail, login, navigate]);

  const stepTitles = {
    1: "Create Your Account",
    2: "Verify Your Identity",
    3: "Complete Your Profile",
  };

  const stepSubtitles = {
    1: "Join our platform in just a few steps",
    2: "Enter the code we sent to your contact",
    3: "Finalize your account details",
  };

  return (
    <>
      <div id="recaptcha-container" /> {/* Firebase needs this div */}
      <AuthLayout
        animationData={animationData}
        logoLight={logoLight}
        logoDark={logoDark}
        title={stepTitles[step]}
        subtitle={stepSubtitles[step]}
      >
        <Card className="border-0 shadow-none">
          <CardContent>
            {step === 1 && (
              <SignUpStep1
                isEmail={isEmail}
                setIsEmail={setIsEmail}
                contactInfo={contactInfo}
                setContactInfo={setContactInfo}
                loading={loading}
                error={error}
                setError={setError}
                handleSendOtp={handleSendOtp}
              />
            )}

            {step === 2 && (
              <SignUpStep2
                contactInfo={contactInfo}
                otp={otp}
                setOtp={setOtp}
                otpTimer={otpTimer}
                otpSent={otpSent}
                loading={loading}
                error={error}
                handleVerifyOtp={handleVerifyOtp}
                handleSendOtp={handleSendOtp}
                handleBack={handleBack}
              />
            )}

            {step === 3 && (
              <SignUpStep3
                initialValues={formValues}
                setFormValues={setFormValues}
                handleSignup={handleSignup}
                loading={loading}
                isEmailPrimary={isEmail}
                emailVerified={emailVerified}
                phoneVerified={phoneVerified}
                onOptionalVerify={handleOptionalVerify}
              />
            )}
          </CardContent>
        </Card>
      </AuthLayout>
    </>
  );
};

export default SignUpPage;
