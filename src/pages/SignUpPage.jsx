import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import animationData from "@/lotties/crm-animation-lotties.json";
import { callSoapService } from "@/services/callSoapService";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import Lottie from "react-lottie";
import { Link, useNavigate } from "react-router-dom";
import { getNameFromEmail } from "../utils/emailHelpers";

// Use the proxy path for the public service.
const PUBLIC_SERVICE_URL = import.meta.env.VITE_SOAP_ENDPOINT;
const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBa24AAg4zVSuUsL4hJnMC9s3DguLgeQmZA&s";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [acknowledged, setAcknowledged] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, setUserData } = useAuth();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Memoized login handler to prevent re-creation on each render.
  const handleSignup = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      if (!email) {
        setError("Username is required!");
        setLoading(false);
        return;
      } else if (!password) {
        setError("Password is required!");
        setLoading(false);
        return;
      }

      let userName = "";
      let clientURL = "";

      const doConnectionPayload = {
        LoginUserName: email,
      };

      localStorage.setItem(
        "doConnectionPayload",
        JSON.stringify(doConnectionPayload)
      );
      try {
        // Step 1: Connect to public service.
        const publicDoConnectionResponse = await callSoapService(
          PUBLIC_SERVICE_URL,
          "doConnection",
          doConnectionPayload
        );

        if (publicDoConnectionResponse === "SUCCESS") {
          // Step 2: Get client URL.
          clientURL = await callSoapService(
            PUBLIC_SERVICE_URL,
            "GetServiceURL",
            doConnectionPayload
          );

          const clientDoConnectionResponse = await callSoapService(
            clientURL,
            "doConnection",
            doConnectionPayload
          );

          if (clientDoConnectionResponse === "SUCCESS") {
            // Step 1.1: Verify authentication.
            userName = getNameFromEmail(email);

            const authenticationPayload = {
              username: userName,
              password: password,
            };

            const authenticationResponse = await callSoapService(
              clientURL,
              "verifyauthentication",
              authenticationPayload
            );

            if (authenticationResponse === "Authetication passed") {
              // Step 1.2: Authentication passed, proceed to get employee details.
              let employeeNo = "";
              let employeeImage = null;

              const clientEmpDetailsPayload = {
                userfirstname: userName,
              };

              const getClientEmpDetails = await callSoapService(
                clientURL,
                "getemployeename_and_id",
                clientEmpDetailsPayload
              );

              employeeNo = getClientEmpDetails[0]?.EMP_NO;

              if (employeeNo) {
                const getEmployeeImagePayload = {
                  EmpNo: employeeNo,
                };

                const employeeImageResponse = await callSoapService(
                  clientURL,
                  "getpic_bytearray",
                  getEmployeeImagePayload
                );

                employeeImage = employeeImageResponse
                  ? `data:image/jpeg;base64,${employeeImageResponse}`
                  : DEFAULT_AVATAR_URL;
              }

              const organizationPayload = {
                CompanyCode: 1,
                BranchCode: 1,
              };

              const getOrganization = await callSoapService(
                clientURL,
                "General_Get_DefaultCompanyName",
                organizationPayload
              );

              const isAdminPayload = {
                UserName: getClientEmpDetails[0]?.USER_NAME,
              };

              const isAdminResponse = await callSoapService(
                clientURL,
                "DMS_Is_Admin_User",
                isAdminPayload
              );

              let isAdmin = isAdminResponse === "Yes";

              const payload = {
                organizationName: getOrganization,
                userEmail: email,
                userName: getClientEmpDetails[0]?.USER_NAME,
                userEmployeeNo: getClientEmpDetails[0]?.EMP_NO,
                userAvatar: employeeImage,
                clientURL: clientURL,
                isAdmin,
              };

              login(payload, rememberMe);

              navigate("/");
            } else {
              setError(authenticationResponse);
            }
          } else {
            setError(clientDoConnectionResponse);
          }
        } else {
          setError(publicDoConnectionResponse);
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, setUserData, navigate]
  );
  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-200 p-10 dark:bg-slate-900 lg:flex">
        <div className="flex gap-x-3 h-20">
          <img
            src={logoLight}
            alt="iStreams ERP Solutions | CRM"
            className="dark:hidden object-fill"
          />
          <img
            src={logoDark}
            alt="iStreams ERP Solutions | CRM"
            className="hidden dark:block object-fill"
          />
        </div>

        <div>
          <Lottie options={defaultOptions} />
        </div>

        <div>
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Manage your customers efficiently and streamline your
              business operations with our powerful CRM system.&rdquo;
            </p>

            <footer className="text-sm text-gray-400">
              - iStreams ERP Solutions
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="flex flex-col justify-center overflow-y-auto bg-slate-100 px-6 dark:bg-slate-950 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center gap-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid w-full items-center gap-4">
              {/* Name Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  name="name"
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  name="email"
                  id="email"
                  placeholder="username@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Type Selection */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value) => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* GST NO Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="gstNo">GST NO</Label>
                <Input
                  name="gstNo"
                  id="gstNo"
                  placeholder="Your GST Number"
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative flex gap-2">
                  <Input
                    name="password"
                    id="password"
                    placeholder="*******"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none"
                >
                  I acknowledge and agree to collaborate in iStreams
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded bg-red-500 p-2 text-white">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <p className="text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;