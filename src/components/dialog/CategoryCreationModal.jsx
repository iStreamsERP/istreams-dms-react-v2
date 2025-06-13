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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function CategoryCreationModal({ mode, selectedItem, onSuccess }) {
  const { userData } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = {
    CATEGORY_NAME: "",
    DISPLAY_NAME: "",
    MODULE_NAME: "",
    INCLUDE_CUSTOM_COLUMNS: [],
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
    { INCLUDE_CUSTOM_COLUMNS: "X_PURCHASE_ORDER_NO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_PURCHASE_ORDER_DATE" },
    { INCLUDE_CUSTOM_COLUMNS: "X_GRN_NO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_GRN_DOCUMENT_NO" },
    { INCLUDE_CUSTOM_COLUMNS: "X_GRN_DOCUMENT_DATE" },
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

    const sanitizedValue = value.replace(/[^a-zA-Z0-9\s_]/g, "");

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await fetchModules();
        if (mode === "edit") {
          await fetchCategory();
        }
      } finally {
        setIsLoading(false);
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
    setIsLoading(true);

    try {
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
        CATEGORY_NAME:
          data.CATEGORY_NAME?.replace(/[^a-zA-Z0-9\s_]/g, "") || "",
        DISPLAY_NAME: data.DISPLAY_NAME?.replace(/[^a-zA-Z0-9\s_]/g, "") || "",
        INCLUDE_CUSTOM_COLUMNS: data.INCLUDE_CUSTOM_COLUMNS
          ? data.INCLUDE_CUSTOM_COLUMNS.split(",").map((item) => item.trim())
          : [],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
        <DialogTitle>
          {mode === "edit" ? "Edit" : "Create"} Category
          {isLoading && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin inline-block" />
          )}
        </DialogTitle>
        <DialogDescription>
          {isLoading
            ? "Loading category details..."
            : "Configure category settings. Click save when you're done."}
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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

            <div className="space-y-2">
              <Label htmlFor="INCLUDE_CUSTOM_COLUMNS">
                Include Custom Column
              </Label>

              <Popover
                open={openCustomColumnOptions}
                onOpenChange={setOpenCustomColumnOptions}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomColumnOptions}
                    className="w-full justify-between text-left gap-2 min-h-10 font-normal flex items-center h-auto py-2"
                  >
                    {/* Display summary of selected values */}
                    <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
                      {formData.INCLUDE_CUSTOM_COLUMNS.length > 0 ? (
                        formData.INCLUDE_CUSTOM_COLUMNS.map((value) => (
                          <span
                            key={value}
                            className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-sm truncate"
                          >
                            {value}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          Select custom columns
                        </span>
                      )}
                    </div>
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command className="w-full justify-start">
                    <CommandInput
                      placeholder="Search custom columns..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No custom columns found.</CommandEmpty>
                      <CommandGroup>
                        {customColumnOptions.map((item, index) => (
                          <CommandItem
                            key={index}
                            value={item.INCLUDE_CUSTOM_COLUMNS}
                            onSelect={(currentValue) => {
                              // Update the state array: add if not present, remove if already present
                              setFormData((prev) => {
                                const currentSelections =
                                  prev.INCLUDE_CUSTOM_COLUMNS || [];
                                if (currentSelections.includes(currentValue)) {
                                  // Remove the item if it's already selected
                                  return {
                                    ...prev,
                                    INCLUDE_CUSTOM_COLUMNS:
                                      currentSelections.filter(
                                        (val) => val !== currentValue
                                      ),
                                  };
                                } else {
                                  // Otherwise add the new selection
                                  return {
                                    ...prev,
                                    INCLUDE_CUSTOM_COLUMNS: [
                                      ...currentSelections,
                                      currentValue,
                                    ],
                                  };
                                }
                              });
                              setOpenCustomColumnOptions(false);
                            }}
                          >
                            {item.INCLUDE_CUSTOM_COLUMNS}
                            <Check
                              className={cn(
                                "ml-auto",
                                // Use a condition to check if the current item is included in the array
                                formData.INCLUDE_CUSTOM_COLUMNS.includes(
                                  item.INCLUDE_CUSTOM_COLUMNS
                                )
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="MODULE_NAME">Module Name</Label>
              <Select
                value={formData.MODULE_NAME}
                onValueChange={(value) =>
                  handleSelectChange("MODULE_NAME", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Modules</SelectLabel>
                    {modules.map((module) => (
                      <SelectItem
                        key={module.MODULE_NAME}
                        value={module.MODULE_NAME}
                      >
                        {module.MODULE_NAME}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {mode === "edit" ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  );
}
