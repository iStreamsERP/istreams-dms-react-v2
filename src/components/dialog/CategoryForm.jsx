import { Button } from "@/components/ui/button";
import {
  DialogContent,
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
import {
  getDataModelFromQueryService,
  getDataModelService,
  saveDataService,
} from "@/services/dataModelService";
import { convertDataModelToStringData } from "@/utils/dataModelConverter";
import { useEffect, useState } from "react";

export function CategoryForm({ mode, selectedItem }) {
  console.log(mode, selectedItem);

  const { userData } = useAuth();
  const { toast } = useToast();

  const initialFormData = {
    CATEGORY_NAME: "",
    DISPLAY_NAME: "",
    MODULE_NAME: "",
    INCLUDE_CUSTOM_COLUMNS: "",
    IS_DEFAULT_COLUMN: "",
    ATTACHMENT_LIMIT_IN_KB: "",
    PATH_FOR_LAN: "",
    PATH_FOR_REMOTE: "",
    IS_FILE_STORAGE: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [modules, setModules] = useState([]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const payload = {
      SQLQuery: `SELECT * FROM PROJECT_MODULES_LIST`,
    };
    const response = await getDataModelFromQueryService(
      payload,
      userData.currentUserLogin,
      userData.clientURL
    );

    setModules(response || []);
  };

  useEffect(() => {
    if (mode === "edit") fetchCategory();
  }, []);

  const fetchCategory = async () => {
    const payload = {
      DataModelName: "SYNM_DMS_DOC_CATEGORIES",
      WhereCondition: `CATEGORY_NAME = '${selectedItem.CATEGORY_NAME}'`,
      Orderby: "",
    };

    const response = await getDataModelService(
      payload,
      userData.currentUserLogin,
      userData.clientURL
    );

    setFormData(response[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const convertedDataModel = convertDataModelToStringData(
        "SYNM_DMS_DOC_CATEGORIES",
        formData
      );

      const payload = {
        UserName: userData.currentUserLogin,
        DModelData: convertedDataModel,
      };

      const response = await saveDataService(
        payload,
        userData.currentUserLogin,
        userData.clientURL
      );

      toast({
        title: "Success",
        description: response,
      });

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

          <div className="space-y-2">
            <Label htmlFor="INCLUDE_CUSTOM_COLUMNS">Include Custom Column</Label>
            <Input
              id="INCLUDE_CUSTOM_COLUMNS"
              name="INCLUDE_CUSTOM_COLUMNS"
              value={formData.INCLUDE_CUSTOM_COLUMNS}
              onChange={handleInputChange}
            />
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
          <Button type="submit" className="w-full mt-4">
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
