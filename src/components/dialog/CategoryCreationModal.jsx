import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { callSoapService } from "@/services/callSoapService";
import { convertDataModelToStringData } from "@/utils/dataModelConverter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

export function CategoryCreationModal({ mode, selectedItem, onSuccess }) {
  const { userData } = useAuth();
  const { toast } = useToast();

  const initialFormData = {
    CATEGORY_NAME: "",
    DISPLAY_NAME: "",
    MODULE_NAME: "DMS",
    IS_DEFAULT_COLUMN: "",
    ATTACHMENT_LIMIT_IN_KB: "",
    PATH_FOR_LAN: "",
    PATH_FOR_REMOTE: "",
    IS_FILE_STORAGE: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [modules, setModules] = useState([]);
  const [customColumnOptions, setCustomColumnOptions] = useState([
    { INCLUDE_CUSTOM_COLUMNS: "X_VENDOR_ID" },
    { INCLUDE_CUSTOM_COLUMNS: "X_VENDOR_NAME" },
    { INCLUDE_CUSTOM_COLUMNS: "X_VENDOR_INVOICE_SNO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_VENDOR_INVOICE_NO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_VENDOR_INVOICE_DATE" },
    { INCLUDE_CUSTOM_COLUMNS: "X_DELIVERY_NOTE_NO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_DELIVERY_DATE" },
    { INCLUDE_CUSTOM_COLUMNS: "X_PURCHASE_ORDER_REFNO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_CLIENT_ID" },
    { INCLUDE_CUSTOM_COLUMNS: "X_CLIENT_NAME" },
    { INCLUDE_CUSTOM_COLUMNS: "X_CLIENT_INVOICE_SNO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_CLIENT_PO_NO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_CLIENT_PO_DATE" },
    { INCLUDE_CUSTOM_COLUMNS: "X_CLIENT_TENDER_REF" },
  ]);

  const [openCustomColumnOptions, setOpenCustomColumnOptions] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const init = async () => {
      await fetchModules();
      if (mode === "edit") {
        await fetchCategory();
      }
    };
    init();
  }, [mode]);

  const fetchModules = async () => {
    const payload = {
      SQLQuery: `SELECT * FROM PROJECT_MODULES_LIST`,
    };

    const response = await callSoapService(
      userData.clientURL,
      "DataModel_GetDataFrom_Query",
      payload
    );

    setModules(response || []);
  };

  const fetchCategory = async () => {
    const payload = {
      DataModelName: "SYNM_DMS_DOC_CATEGORIES",
      WhereCondition: `CATEGORY_NAME = '${selectedItem.CATEGORY_NAME}'`,
      Orderby: "",
    };

    const response = await callSoapService(
      userData.clientURL,
      "DataModel_GetData",
      payload
    );

    const data = response?.[0] || {};

    setFormData((prev) => ({
      ...prev,
      ...data,
      INCLUDE_CUSTOM_COLUMNS: data.INCLUDE_CUSTOM_COLUMNS
        ? data.INCLUDE_CUSTOM_COLUMNS.split(",").map((item) => item.trim())
        : [],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const convertedDataModel = convertDataModelToStringData(
        "SYNM_DMS_DOC_CATEGORIES",
        formData
      );

      const payload = {
        UserName: userData.userEmail,
        DModelData: convertedDataModel,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_SaveData",
        payload
      );

      toast({
        title: "Success",
        description: response,
      });
      onSuccess();
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription>
          Configure category settings. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSave}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="CATEGORY_NAME">Category Name</Label>
            <Input
              id="CATEGORY_NAME"
              name="CATEGORY_NAME"
              value={formData.CATEGORY_NAME}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="DISPLAY_NAME">Display Name</Label>
            <Input
              id="DISPLAY_NAME"
              name="DISPLAY_NAME"
              value={formData.DISPLAY_NAME}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full mt-4">
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}