import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import animationData from "@/lotties/crm-animation-lotties.json";
import { callSoapService } from "@/services/callSoapService";
import { Eye, EyeOff, Loader2, MailOpen } from "lucide-react";
import { useCallback, useState } from "react";
import Lottie from "react-lottie";
import { Link, useNavigate } from "react-router-dom";
import { getNameFromEmail } from "../utils/emailHelpers";

// Use the proxy path for the public service.
const PUBLIC_SERVICE_URL = import.meta.env.VITE_SOAP_ENDPOINT;
const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBa24AAg4zVSuUsL4hJnMC9s3DguLgeQmZA&s";

const LoginFormPage = () => {
  const navigate = useNavigate();
  const { login, setUserData } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Memoized login handler to prevent re-creation on each render.
  const handleLogin = useCallback(
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

localStorage.setItem("doConnectionPayload", JSON.stringify(doConnectionPayload));
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
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-slate-200 dark:bg-slate-900">
        <div>
          <img
            src={logoLight}
            alt="iStreams ERP Solutions | CRM"
            className="dark:hidden"
          />
          <img
            src={logoDark}
            alt="iStreams ERP Solutions | CRM"
            className="hidden dark:block"
          />
        </div>

        <div>
          <Lottie options={defaultOptions} height={350} width={400} />
        </div>

        <div>
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Manage your documents efficiently and streamline your
              business operations with our powerful Document Management
              System.&rdquo;
            </p>

            <footer className="text-sm text-gray-400">
              - iStreams ERP Solutions
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="flex flex-col justify-center lg:p-8 bg-slate-100 dark:bg-slate-950 px-6">
        <div className="mx-auto flex w-full flex-col justify-center gap-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight ">Login!</h1>
            <p className="text-sm text-muted-foreground">
              Please enter log in details below
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  name="email"
                  id="email"
                  placeholder="username@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <div className="flex gap-2 relative">
                  <Input
                    name="email"
                    id="email"
                    placeholder="*******"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium leading-none hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-500 text-white p-2 mb-4 rounded">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="flex items-center text-xs uppercase">
              <Separator className="flex-1" />
              <span className="px-2 whitespace-nowrap text-gray-400">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full">
              <MailOpen /> Login with Email
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Don't have an account?
              <Link to="/signup" className="text-blue-500">
                {" "}
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginFormPage;
