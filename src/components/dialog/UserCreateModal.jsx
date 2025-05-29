import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { callSoapService } from "@/services/callSoapService";
import { createNewUser } from "@/services/userManagementService";
import { getDomainFromEmail } from "@/utils/emailHelpers";
import axios from "axios";
import { Check, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";

// Validate the entire form on submission.
const validateForm = (data) => {
  const errors = {};

  if (!data.newUserName || data.newUserName.trim().length < 2) {
    errors.newUserName = "Username must be at least 2 characters.";
  }
  if (!data.password || data.password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.emailAddress || !emailRegex.test(data.emailAddress)) {
    errors.emailAddress = "Please enter a valid email address.";
  }
  if (!data.mobileNumber || data.mobileNumber.trim().length < 10) {
    errors.mobileNumber = "Mobile number must be at least 10 digits.";
  }
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = "Full name is required.";
  }
  if (!data.empNo || data.empNo.trim().length < 2) {
    errors.empNo = "Employee number is required.";
  }

  return errors;
};

// Validate a single field on blur.
const validateInput = (name, value) => {
  switch (name) {
    case "newUserName":
      if (!value || value.trim().length < 2) {
        return "Username must be at least 2 characters.";
      }
      break;
    case "password":
      if (!value || value.trim().length < 6) {
        return "Password must be at least 6 characters.";
      }
      break;
    case "emailAddress":
      {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          return "Please enter a valid email address.";
        }
      }
      break;
    case "mobileNumber":
      if (!value || !/^\d{10}$/.test(value)) {
        return "Mobile number must be exactly 10 digits.";
      }
      break;
    case "fullName":
      if (!value || value.trim().length < 2) {
        return "Full name must be at least 2 characters.";
      }
      break;
    case "empNo":
      if (!value || value.trim().length < 2) {
        return "Employee number must be at least 2 characters.";
      }
      break;
    default:
      return "";
  }
  return "";
};

const UserCreateModal = ({ user, open, onClose }) => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const DOMAIN_NAME = getDomainFromEmail(userData.currentUserLogin);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const initialFormData = {
    loginUserName: userData.currentUserName,
    newUserName: "",
    password: "",
    isAdminUser: false,
    emailAddress: "",
    mobileNumber: "",
    fullName: "",
    empNo: "",
    domainName: DOMAIN_NAME,
    employeeImage: "",
    accountExpired: false,
    accountLocked: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  const [isFocused, setIsFocused] = useState({
    newUserName: false,
    password: false,
    isAdminUser: false,
    emailAddress: false,
    mobileNumber: false,
    fullName: false,
    empNo: false,
    employeeImage: false,
    accountExpired: false,
    accountLocked: false,
  });

  useEffect(() => {
    if (user) {
      const DOMAIN_NAME = getDomainFromEmail(user?.EMAIL_ADDRESS);
      setFormData({
        loginUserName: userData.currentUserName,
        newUserName: user?.USER_NAME || "",
        password: "",
        isAdminUser: user?.USER_TYPE || false,
        emailAddress: user?.EMAIL_ADDRESS || "",
        mobileNumber: user?.MOBILE_NO || "",
        fullName: user?.FULL_NAME || "",
        empNo: user?.EMP_NO || "",
        domainName: DOMAIN_NAME,
        employeeImage: user?.employeeImage || "",
        accountExpired: user?.ACCOUNT_EXPIRED || false,
        accountLocked: user?.ACCOUNT_LOCKED || false,
      });
      fetchUserImage();
    } else {
      setFormData(initialFormData);
    }
  }, [user, open]);

  const fetchUserImage = async () => {
    try {
      const response = await axios.get(
        `https://cloud.istreams-erp.com:4498/api/empImage/view?email=${encodeURIComponent(
          userData.currentUserLogin
        )}&fileName=EMPLOYEE_IMAGE_${user.EMP_NO}`,
        {
          responseType: "blob",
        }
      );

      const blob = response.data;

      const mimeType = blob.type;
      const extension = mimeType.split("/")[1] || "png";
      const filename = `EMPLOYEE_IMAGE_${user.EMP_NO}.${extension}`;

      const file = new File([blob], filename, { type: mimeType });

      setFormData((prev) => ({
        ...prev,
        employeeImage: file,
      }));

      // Optional: Preview the image
      const imagePreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(imagePreviewUrl);
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Error fetching user image: ${error.message}`,
      });
    }
  };

  const handleChange = async (eventOrValue, fieldName) => {
    if (eventOrValue && eventOrValue.target) {
      const { name, value, type, checked, files } = eventOrValue.target;

      if (type === "file") {
        const file = files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);

          setFormData((prevData) => ({
            ...prevData,
            [name]: file,
          }));

          if (user) {
            await handleUpdatedImage(formData.empNo);
          }
        } else {
          setPreviewUrl(null);
        }
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]:
            name === "newUserName"
              ? value.toUpperCase()
              : type === "checkbox"
              ? checked
              : value,
        }));
      }

      if (user) {
        setIsFocused((prev) => ({ ...prev, [name]: true }));
      }
    } else {
      // For custom components (like Select or toggle switch)
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: eventOrValue,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMessage = validateInput(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
    setIsFocused((prev) => ({ ...prev, [name]: false }));
  };

  const handleUpdate = async (key, value) => {
    try {
      setLoading((prev) => ({ ...prev, [key]: true }));
      const payload = {
        FQ_USER_NAME: user.EMAIL_ADDRESS,
        USER_NAME_ONLY: user.USER_NAME,
        COLUMN_NAME: key,
        VALUE: value,
      };

      const response = await callSoapService(
        userData.clientURL,
        "UM_Update_User",
        payload
      );

      console.log(response);

      toast({
        title: response,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating user:",
        error,
      });
    } finally {
      setIsFocused((prev) => ({ ...prev, [key]: false }));
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleUploadImage = async (empNo) => {
    setLoading(true);

    const file = formData.employeeImage;
    const form = new FormData();
    form.append("file", file);
    form.append("email", userData.currentUserLogin);
    form.append("fileName", `EMPLOYEE_IMAGE_${empNo}`);

    try {
      const uploadUrl =
        "https://cloud.istreams-erp.com:4498/api/empImage/upload";
      const response = await axios.post(uploadUrl, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast({ title: "Employee saved and image uploaded!" });
      } else {
        toast({
          variant: "destructive",
          title: `Upload failed (status ${response.status})`,
        });
      }
    } catch (error) {
      console.error("Image upload error:", error);

      toast({
        variant: "destructive",
        title: "Error saving image.",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatedImage = async (empNo) => {
    setLoading(true);

    const file = formData.employeeImage;

    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("email", userData.currentUserLogin);
      payload.append("fileName", `EMPLOYEE_IMAGE_${empNo}`);
      console.log(
        `https://cloud.istreams-erp.com:4498/api/empImage/update?email=${userData.currentUserLogin}&fileName=EMPLOYEE_IMAGE_${empNo}`
      );

      debugger;

      const response = await axios.put(
        `https://cloud.istreams-erp.com:4498/api/empImage/update?email=${userData.currentUserLogin}&fileName=EMPLOYEE_IMAGE_${empNo}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "User saved and image updated!",
        });
      } else {
        toast({
          variant: "destructive",
          title: `image update failed with status: ${response.status}`,
        });
      }
    } catch (error) {
      console.error("Image upload error:", error);

      toast({
        variant: "destructive",
        title: "Error saving image.",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await createNewUser(
        formData,
        userData.userEmail,
        userData.clientURL
      );

      if (!user) {
        await handleUploadImage(formData.empNo);
      }

      toast({
        title: "Employee saved successfully!",
        description: response,
      });

      setFormData(initialFormData);
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating user:",
        error,
      });
    }
  };

  return (
    <DialogContent className="max-h-[80vh] w-full overflow-y-auto sm:w-[600px] sm:max-w-[600px] z-[999]">
      <DialogHeader>
        <DialogTitle>
          <div className="flex flex-row items-center gap-1">
            <UserPlus className="h-5 w-5" />
            <span> {!user ? "Add New" : "Edit User"}</span>
          </div>
        </DialogTitle>
        <DialogDescription>
          {!user
            ? "Please fill in the details to add a new user."
            : `Please fill in the details to edit user ${user?.USER_NAME}.`}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-2 sm:gap-6 py-2 sm:grid-cols-2">
          {/* Left Side */}
          <div className="grid gap-2">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="newUserName" className="text-left">
                User Name
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  name="newUserName"
                  id="newUserName"
                  type="text"
                  placeholder="Type username"
                  className="w-full"
                  value={formData.newUserName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  tabIndex={-1}
                />
                {loading["USER_NAME"] || (isFocused.newUserName && user) ? (
                  <Button
                    className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                    onMouseDown={() =>
                      handleUpdate("USER_NAME", formData.newUserName)
                    }
                  >
                    {loading["USER_NAME"] ? (
                      <BeatLoader color="#000" size={8} />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}
              </div>
              {errors.newUserName && (
                <span className="text-xs text-red-500">
                  {errors.newUserName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Type password"
                  className="w-full"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  tabIndex={-1}
                />
                {loading["password"] || (isFocused.password && user) ? (
                  <Button
                    className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                    onMouseDown={handleUpdate}
                  >
                    {loading["password"] ? (
                      <BeatLoader color="#000" size={8} />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}
              </div>
              {errors.password && (
                <span className="text-xs text-red-500">{errors.password}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="isAdminUser" className="text-left">
                User Type
              </Label>
              <div className="flex items-center gap-1">
                <ToggleGroup
                  type="single"
                  value={formData.isAdminUser ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      isAdminUser: value === "true",
                    }))
                  }
                  className="flex justify-start"
                >
                  <ToggleGroupItem value="false" aria-label="Toggle user">
                    User
                  </ToggleGroupItem>
                  <ToggleGroupItem value="true" aria-label="Toggle admin">
                    Admin
                  </ToggleGroupItem>
                </ToggleGroup>
                {loading["USER_TYPE"] || (isFocused.isAdminUser && user) ? (
                  <Button
                    className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                    onMouseDown={() =>
                      handleUpdate("USER_TYPE", formData.isAdminUser)
                    }
                  >
                    {loading["USER_TYPE"] ? (
                      <BeatLoader color="#000" size={8} />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="emailAddress" className="text-left">
                Email Address
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  name="emailAddress"
                  id="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  className="w-full"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  tabIndex={-1}
                />
                {loading["EMAIL_ADDRESS"] ||
                (isFocused.emailAddress && user) ? (
                  <Button
                    className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                    onMouseDown={() =>
                      handleUpdate("EMAIL_ADDRESS", formData.emailAddress)
                    }
                  >
                    {loading["EMAIL_ADDRESS"] ? (
                      <BeatLoader color="#000" size={8} />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}
              </div>
              {errors.emailAddress && (
                <span className="text-xs text-red-500">
                  {errors.emailAddress}
                </span>
              )}
            </div>

            <div className="flex w-full items- gap-1">
              <div className="flex-grow">
                <Label htmlFor="mobileNumber" className="text-left">
                  Mobile Number
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    name="mobileNumber"
                    id="mobileNumber"
                    type="text"
                    placeholder="Enter mobile number"
                    className="w-full"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    tabIndex={-1}
                  />
                  {loading["MOBILE_NO"] || (isFocused.mobileNumber && user) ? (
                    <Button
                      className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                      onMouseDown={() =>
                        handleUpdate("MOBILE_NO", formData.mobileNumber)
                      }
                    >
                      {loading["MOBILE_NO"] ? (
                        <BeatLoader color="#000" size={8} />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                    </Button>
                  ) : null}
                </div>
                {errors.mobileNumber && (
                  <span className="text-xs text-red-500">
                    {errors.mobileNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="fullName" className="text-left">
                Full Name
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  name="fullName"
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  className="w-full"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  tabIndex={-1}
                />
                {loading["FULL_NAME"] || (isFocused.fullName && user) ? (
                  <Button
                    className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                    onMouseDown={() =>
                      handleUpdate("FULL_NAME", formData.fullName)
                    }
                  >
                    {loading["FULL_NAME"] ? (
                      <BeatLoader color="#000" size={8} />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}
              </div>
              {errors.fullName && (
                <span className="text-xs text-red-500">{errors.fullName}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="empNo" className="text-left">
                Employee Number
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  name="empNo"
                  id="empNo"
                  type="text"
                  placeholder="Enter employee number"
                  className="w-full"
                  value={formData.empNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  tabIndex={-1}
                />
                {loading["EMP_NO"] || (isFocused.empNo && user) ? (
                  <Button
                    className="flex w-[10%] min-w-[40px] items-center justify-center p-2 bg-green-500"
                    onMouseDown={() => handleUpdate("EMP_NO", formData.empNo)}
                  >
                    {loading["EMP_NO"] ? (
                      <BeatLoader color="#000" size={8} />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                ) : null}
              </div>
              {errors.empNo && (
                <span className="text-xs text-red-500">{errors.empNo}</span>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-2">
            <div className="w-full">
              <Label htmlFor="image_file" className="text-left">
                Upload Image
              </Label>
              <label
                htmlFor="employeeImage"
                className="flex aspect-square h-[240px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {formData.employeeImage ? (
                  <img
                    src={previewUrl}
                    alt={formData.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Click to Upload
                  </div>
                )}
              </label>
              <input
                id="employeeImage"
                name="employeeImage"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
              {errors.employeeImage && (
                <p className="text-xs text-red-500">{errors.employeeImage}</p>
              )}
            </div>

            <div>
              <Label htmlFor="domainName" className="text-left">
                Domain Name
              </Label>
              <Input
                name="domainName"
                id="domainName"
                type="text"
                placeholder="Enter domain name"
                className="w-full"
                value={formData.domainName}
                onChange={handleChange}
                onBlur={handleBlur}
                readOnly={true}
                tabIndex={-1}
              />
              {errors.domainName && (
                <span className="text-xs text-red-500">
                  {errors.domainName}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="accountExpired"
                  id="accountExpired"
                  checked={formData.accountExpired}
                  onCheckedChange={(checked) =>
                    handleChange(checked, "accountExpired")
                  }
                />
                <label
                  htmlFor="accountExpired"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Account Expired
                </label>
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    name="accountLocked"
                    id="accountLocked"
                    checked={formData.accountLocked}
                    onCheckedChange={(checked) =>
                      handleChange(checked, "accountLocked")
                    }
                  />
                  <label
                    htmlFor="accountLocked"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Account Locked
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!user ? (
          <>
            <Separator />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button variant="default" type="submit">
                Save
              </Button>
            </div>
          </>
        ) : null}
      </form>
    </DialogContent>
  );
};

export default UserCreateModal;
