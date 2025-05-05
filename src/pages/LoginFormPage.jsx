import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, MailOpen } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyauthentication } from "../services/authenticationService";
import { getDefaultCompanyName } from "../services/dmsService";
import {
  getEmployeeImage,
  getEmployeeNameAndId,
} from "../services/employeeService";
import { doConnectionPublic, getServiceURL } from "../services/publicService";
import { getNameFromEmail } from "../utils/emailHelpers";
import { Checkbox } from "@/components/ui/checkbox";
import Lottie from 'react-lottie';
import animationData from "@/lotties/crm-animation-lotties.json";

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
      preserveAspectRatio: "xMidYMid slice"
    }
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

      try {
        // Step 1: Connect to public service.
        const publicConnection = await doConnectionPublic(email);
        if (publicConnection === "Invalid domain on Client Connection Data") {
          setError(publicConnection);
          setLoading(false);
          return;
        }

        // Step 2: Retrieve dynamic client URL.
        const clientURL = await getServiceURL(email);
        if (!clientURL || !clientURL.startsWith("http")) {
          setError("Failed to retrieve a valid client URL.");
          setLoading(false);
          return;
        }

        // Step 2: Verify authentication.
        const userName = getNameFromEmail(email);
        const userDetails = { User: userName, Pass: password };
        const authentication = await verifyauthentication(
          userDetails,
          email,
          clientURL
        );

        if (authentication !== "Authetication passed") {
          setError(authentication);
          setLoading(false);
          return;
        }

        // Optionally update userData with the client URL immediately.
        setUserData((prev) => ({ ...prev, clientURL: clientURL }));

        const employeeData = await getEmployeeNameAndId(
          userName,
          email,
          clientURL
        );

        if (!employeeData || !employeeData.length) {
          setError("Employee details not found.");
          setLoading(false);
          return;
        }

        const empNo = employeeData[0].EMP_NO;

        let employeeImage = null;
        if (empNo) {
          employeeImage = await getEmployeeImage(empNo, email, clientURL);
        }

        const organization = await getDefaultCompanyName("", email, clientURL);

        const payload = {
          token: "dummy-token",
          email,
          organization: organization,
          currentUserLogin: email,
          currentUserName: employeeData[0].USER_NAME,
          currentUserEmpNo: empNo,
          currentUserImageData:
            employeeImage !== null
              ? `data:image/jpeg;base64,${employeeImage}`
              : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBa24AAg4zVSuUsL4hJnMC9s3DguLgeQmZA&s",

          clientURL: clientURL,
        };

        // Call login from context, passing rememberMe so AuthContext
        // knows whether to persist in localStorage or sessionStorage
        login(payload, rememberMe);

        navigate("/");
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
          <Lottie
            options={defaultOptions}
            height={350}
            width={400}
          />
        </div>

        <div>
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Manage your customers efficiently and streamline your business operations with our powerful CRM system.&rdquo;
            </p>

            <footer className="text-sm text-gray-400">- iStreams ERP Solutions</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex flex-col justify-center lg:p-8 bg-slate-100 dark:bg-slate-950 px-6">
        <div className="mx-auto flex w-full flex-col justify-center gap-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight ">
              Login!
            </h1>
            <p className="text-sm text-muted-foreground">
              Please enter log in details below
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input name="email" id="email" placeholder="username@domain.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  required />
              </div>

              <div className="flex flex-col space-y-1.5">
                <div className="flex gap-2 relative">
                  <Input name="email" id="email" placeholder="*******" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required />
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
                <Link to="/forgot-password" className="text-sm font-medium leading-none hover:underline">Forgot Password?</Link>
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
              <span className="px-2 whitespace-nowrap text-gray-400">Or continue with</span>
              <Separator className="flex-1" />
            </div>
            <Button variant="outline" className="w-full">
              <MailOpen /> Login with Email
            </Button>

            <p className="text-xs text-gray-400 text-center">Don't have an account?
              <Link to="/signup" className="text-blue-500"> Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginFormPage
