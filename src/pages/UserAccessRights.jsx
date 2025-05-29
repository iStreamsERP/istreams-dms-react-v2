import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronsUpDown,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  deleteDataModelService,
  getDataModelService,
  saveDataService,
} from "@/services/dataModelService";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertDataModelToStringData } from "@/utils/dataModelConverter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TreeNode = ({
  node,
  level = 0,
  onSelect,
  onRemove,
  isRemovable = false,
  selectedItems = [],
  useCheckbox = false,
  onSelectAll = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedItems.some((item) => item.id === node.id);

  const areAllChildrenSelected =
    hasChildren &&
    node.children.every((child) => {
      if (!child.children || child.children.length === 0) {
        return selectedItems.some((item) => item.id === child.id);
      }

      return checkAllChildrenSelected(child, selectedItems);
    });

  function checkAllChildrenSelected(node, selectedItems) {
    if (!node.children || node.children.length === 0) {
      return selectedItems.some((item) => item.id === node.id);
    }

    return node.children.every((child) => {
      if (!child.children || child.children.length === 0) {
        return selectedItems.some((item) => item.id === child.id);
      }
      return checkAllChildrenSelected(child, selectedItems);
    });
  }

  const getAllLeafNodes = (node) => {
    let leafNodes = [];

    if (!node.children || node.children.length === 0) {
      if (node.type === "Form") {
        return [node];
      }
      return [];
    }

    node.children.forEach((child) => {
      leafNodes = [...leafNodes, ...getAllLeafNodes(child)];
    });

    return leafNodes;
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();

    if (hasChildren) {
      const allLeafNodes = getAllLeafNodes(node);
      if (areAllChildrenSelected) {
        if (isRemovable) {
          onSelectAll(allLeafNodes, false); // This will call handleRemoveMultipleSelectedForms
        } else {
          onSelectAll(allLeafNodes, false); // This will call handleBulkFormsSelection
        }
      } else {
        if (isRemovable) {
          onSelectAll(allLeafNodes, false); // For removal, we always want to remove
        } else {
          onSelectAll(allLeafNodes, true); // For selection, we want to add
        }
      }
    } else if (isRemovable) {
      onRemove(node); // Call onRemove for single form removal
    } else if (onSelect) {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-sm cursor-pointer select-none",
          level > 0 && "ml-4",
          areAllChildrenSelected && hasChildren && "font-medium"
        )}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else if (onSelect && !useCheckbox) {
            onSelect(node);
          }
        }}
      >
        {hasChildren ? (
          <div className="mr-1">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        ) : (
          <div className="w-5"></div>
        )}

        {useCheckbox && (
          <div
            className="mr-2 flex items-center justify-center cursor-pointer"
            onClick={handleCheckboxClick}
          >
            {hasChildren ? (
              areAllChildrenSelected ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )
            ) : isSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </div>
        )}

        <span
          className={cn(
            "text-xs flex-grow",
            !hasChildren && !useCheckbox && "ml-1"
          )}
        >
          {node.label}
        </span>

        {!hasChildren && !isRemovable && isSelected && !useCheckbox && (
          <Check className="h-4 w-4 text-green-500" />
        )}
      </div>

      {isOpen && hasChildren && (
        <div>
          {node.children.map((childNode, index) => (
            <TreeNode
              key={`${childNode.id}-${index}`}
              node={childNode}
              level={level + 1}
              onSelect={onSelect}
              onRemove={onRemove}
              isRemovable={isRemovable}
              selectedItems={selectedItems}
              useCheckbox={useCheckbox}
              onSelectAll={onSelectAll}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({
  data,
  onSelect,
  onRemove,
  isRemovable = false,
  selectedItems = [],
  useCheckbox = false,
  onSelectAll = null,
  isSelectAllMode = false,
}) => {
  return (
    <div>
      {data.map((node, index) => (
        <TreeNode
          key={`${node.id}-${index}`}
          node={node}
          onSelect={onSelect}
          onRemove={onRemove}
          isRemovable={isRemovable}
          selectedItems={selectedItems}
          useCheckbox={useCheckbox}
          onSelectAll={onSelectAll}
          isSelectAllMode={isSelectAllMode}
        />
      ))}
    </div>
  );
};

const UserAccessRights = () => {
  const [userDetails, setUserDetails] = useState({ USER_NAME: "" });
  const [usersList, setUsersList] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  const [openUserPopover, setOpenUserPopover] = useState(false);
  const [userSearchInput, setUserSearchInput] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formsList, setFormsList] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [filteredTreeData, setFilteredTreeData] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [assignedFormsTreeData, setAssignedFormsTreeData] = useState([]);

  const { toast } = useToast();
  const { userData } = useAuth();

  useEffect(() => {
    if (!hasFetchedData && userData?.currentUserLogin && userData?.clientURL) {
      fetchUsersData();
      fetchFormsData();
      setHasFetchedData(true);
    }
  }, [userData?.currentUserLogin, userData?.clientURL, hasFetchedData]);

  useEffect(() => {
    if (formsList.length > 0) {
      const treeStructure = [],
        moduleMap = {};

      formsList.forEach((form) => {
        if (!moduleMap[form.MODULE_NAME]) {
          moduleMap[form.MODULE_NAME] = {
            id: `module-${form.MODULE_NAME}`,
            label: form.MODULE_NAME,
            children: {},
          };
        }

        const formTypes = moduleMap[form.MODULE_NAME].children;
        if (!formTypes[form.FORM_TYPE]) {
          formTypes[form.FORM_TYPE] = {
            id: `type-${form.MODULE_NAME}-${form.FORM_TYPE}`,
            label: form.FORM_TYPE,
            children: [],
          };
        }

        formTypes[form.FORM_TYPE].children.push({
          id: form.FORM_NAME,
          label: form.DESCRIPTION || form.FORM_NAME,
          formData: form,
          type: "Form",
        });
      });

      Object.values(moduleMap).forEach((module) => {
        const moduleNode = { id: module.id, label: module.label, children: [] };

        Object.values(module.children).forEach((formType) => {
          moduleNode.children.push(formType);
        });

        treeStructure.push(moduleNode);
      });

      setTreeData(treeStructure);
      setFilteredTreeData(treeStructure);
    }
  }, [formsList]);

  useEffect(() => {
    if (treeData.length > 0) {
      const filterFormsNotSelected = (tree) => {
        return tree
          .map((moduleNode) => {
            const newModuleNode = { ...moduleNode };

            if (newModuleNode.children && newModuleNode.children.length > 0) {
              newModuleNode.children = newModuleNode.children
                .map((formTypeNode) => {
                  const newFormTypeNode = { ...formTypeNode };

                  if (
                    newFormTypeNode.children &&
                    newFormTypeNode.children.length > 0
                  ) {
                    newFormTypeNode.children = newFormTypeNode.children.filter(
                      (formNode) =>
                        !selectedForms.some(
                          (selectedForm) => selectedForm.id === formNode.id
                        )
                    );
                  }

                  return newFormTypeNode;
                })
                .filter(
                  (formTypeNode) =>
                    formTypeNode.children && formTypeNode.children.length > 0
                );
            }

            return newModuleNode.children && newModuleNode.children.length > 0
              ? newModuleNode
              : null;
          })
          .filter(Boolean);
      };

      setFilteredTreeData(filterFormsNotSelected(treeData));
    }
  }, [selectedForms, treeData]);

  useEffect(() => {
    if (selectedForms.length > 0) {
      const moduleMap = {};

      selectedForms.forEach((form) => {
        const MODULE_NAME = form.formData.MODULE_NAME;
        const FORM_TYPE = form.formData.FORM_TYPE || "General";

        if (!moduleMap[MODULE_NAME]) {
          moduleMap[MODULE_NAME] = {
            id: `assigned-module-${MODULE_NAME}`,
            label: MODULE_NAME,
            children: {},
          };
        }

        const formTypes = moduleMap[MODULE_NAME].children;
        if (!formTypes[FORM_TYPE]) {
          formTypes[FORM_TYPE] = {
            id: `assigned-type-${MODULE_NAME}-${FORM_TYPE}`,
            label: FORM_TYPE,
            children: [],
          };
        }

        formTypes[FORM_TYPE].children.push({
          id: form.id,
          label: form.label,
          formData: form.formData,
          type: "Form",
        });
      });

      const assignedTreeStructure = [];
      Object.values(moduleMap).forEach((module) => {
        const moduleNode = { id: module.id, label: module.label, children: [] };

        Object.values(module.children).forEach((FORM_TYPE) => {
          moduleNode.children.push(FORM_TYPE);
        });

        assignedTreeStructure.push(moduleNode);
      });

      setAssignedFormsTreeData(assignedTreeStructure);
    } else {
      setAssignedFormsTreeData([]);
    }
  }, [selectedForms]);

  const fetchUsersData = async () => {
    setLoadingUsers(true);
    try {
      const usersRequestData = {
        DataModelName: "USER_MASTER",
        WhereCondition: "",
        Orderby: "USER_NAME",
      };
      const response = await getDataModelService(
        usersRequestData,
        userData?.currentUserLogin,
        userData?.clientURL
      );

      const formattedUsers = Array.isArray(response)
        ? response
            .map((user) => ({
              USER_NAME: user.USER_NAME?.trim(),
            }))
            .filter((user) => user.USER_NAME)
        : [];
      setUsersList(formattedUsers);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error.message,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserRoles = async (USER_NAME) => {
    if (!USER_NAME) {
      setUserRoles([]);
      return;
    }

    try {
      const rolesData = {
        DataModelName: "general_roles_users",
        WhereCondition: `USER_NAME = '${USER_NAME}'`,
        Orderby: "ROLE_ID",
      };
      const userRolesResponse = await getDataModelService(
        rolesData,
        userData?.currentUserLogin,
        userData?.clientURL
      );

      if (!Array.isArray(userRolesResponse) || userRolesResponse.length === 0) {
        setUserRoles([]);
        return;
      }

      const ROLE_ID = userRolesResponse
        .map((role) => `'${role.ROLE_ID}'`)
        .join(",");
      const masterRolesData = {
        DataModelName: "general_roles_master",
        WhereCondition: `ROLE_ID IN (${ROLE_ID})`,
        Orderby: "ROLE_ID",
      };
      const masterRolesResponse = await getDataModelService(
        masterRolesData,
        userData?.currentUserLogin,
        userData?.clientURL
      );

      if (Array.isArray(masterRolesResponse)) {
        const combinedRoles = userRolesResponse.map((userRole) => {
          const masterRole = masterRolesResponse.find(
            (mr) => mr.ROLE_ID === userRole.ROLE_ID
          );
          return {
            ROLE_ID: userRole.ROLE_ID,
            USER_NAME: userRole.USER_NAME,
            ROLE_NAME: masterRole?.ROLE_NAME || "N/A",
            ROLE_DESCRIPTION:
              masterRole?.ROLE_DESCRIPTION || "No description available",
          };
        });
        setUserRoles(combinedRoles);
      } else {
        setUserRoles([]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching user roles",
        description: error.message,
      });
      setUserRoles([]);
    }
  };

  const fetchFormsData = async () => {
    setLoadingForms(true);
    try {
      const formsRequestData = {
        DataModelName: "FORMS_MASTER",
        WhereCondition: "",
        Orderby: "MODULE_NAME, FORM_TYPE",
      };
      const response = await getDataModelService(
        formsRequestData,
        userData?.currentUserLogin,
        userData?.clientURL
      );

      const formsArray = Array.isArray(response)
        ? response
        : response?.data || [];
      setFormsList(formsArray);
    } catch (error) {
      setFormsList([]);
      toast({
        variant: "destructive",
        title: "Error fetching forms",
        description: error.message || "Failed to fetch forms master data",
      });
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchUserFormAccess = async (userName) => {
    if (!userName) {
      setSelectedForms([]);
      return;
    }

    setLoading(true);
    try {
      const rightRequestData = {
        DataModelName: "USER_RIGHTS",
        WhereCondition: `USER_NAME = '${userName}'`,
        Orderby: "MODULE_NAME, FORM_NAME",
      };

      const rightsResponse = await getDataModelService(
        rightRequestData,
        userData?.currentUserLogin,
        userData?.clientURL
      );

      if (!Array.isArray(rightsResponse)) {
        setSelectedForms([]);
        setLoading(false);
        return;
      }

      const formItems = rightsResponse.map((right) => ({
        id: right.FORM_NAME,
        label: right.FORM_NAME,
        formData: {
          MODULE_NAME: right.MODULE_NAME || "",
          FORM_NAME: right.FORM_NAME,
          DESCRIPTION: right.FORM_NAME,
          FORM_TYPE: right.FORM_TYPE || "",
        },
      }));

      try {
        const formNames = rightsResponse
          .map((right) => `'${right.FORM_NAME}'`)
          .join(",");
        if (formNames) {
          const formsRequestData = {
            DataModelName: "FORMS_MASTER",
            WhereCondition: `FORM_NAME IN (${formNames})`,
            Orderby: "MODULE_NAME, FORM_NAME",
          };

          const formsResponse = await getDataModelService(
            formsRequestData,
            userData?.currentUserLogin,
            userData?.clientURL
          );

          if (Array.isArray(formsResponse)) {
            const updatedFormItems = formItems.map((item) => {
              const formDetails =
                formsResponse.find((f) => f.FORM_NAME === item.id) || {};
              return {
                ...item,
                label: formDetails.DESCRIPTION || item.label,
                formData: {
                  ...item.formData,
                  DESCRIPTION:
                    formDetails.DESCRIPTION || item.formData.DESCRIPTION,
                  FORM_TYPE: formDetails.FORM_TYPE || item.formData.FORM_TYPE,
                },
              };
            });
            setSelectedForms(updatedFormItems);
          } else {
            setSelectedForms(formItems);
          }
        } else {
          setSelectedForms([]);
        }
      } catch (error) {
        console.error("Error fetching form details from FORMS_MASTER:", error);
        setSelectedForms(formItems);
      }
    } catch (error) {
      console.error("Error fetching user form access:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch form access rights for this user",
      });
      setSelectedForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setUserDetails({ USER_NAME: user.USER_NAME });
    setOpenUserPopover(false);
    fetchUserRoles(user.USER_NAME);
    fetchUserFormAccess(user.USER_NAME);
  };

  const handleFormSelect = (node) => {
    const isAlreadySelected = selectedForms.some((form) => form.id === node.id);

    if (!isAlreadySelected) {
      setSelectedForms((prev) => [...prev, node]);
      toast({
        title: "Form added",
        description: `${node.label} added to selection`,
      });
    } else {
      toast({
        variant: "default",
        title: "Info",
        description: "This form is already selected",
      });
    }
  };

  const handleBulkFormsSelection = (forms, shouldSelect) => {
    if (shouldSelect) {
      const formsToAdd = forms.filter(
        (form) =>
          !selectedForms.some((selectedForm) => selectedForm.id === form.id)
      );

      if (formsToAdd.length > 0) {
        setSelectedForms((prev) => [...prev, ...formsToAdd]);
        toast({
          title: "Forms added",
          description: `${formsToAdd.length} forms added to selection`,
        });
      }
    } else {
      setSelectedForms((prev) =>
        prev.filter(
          (selectedForm) => !forms.some((form) => form.id === selectedForm.id)
        )
      );

      toast({
        title: "Forms removed",
        description: `${forms.length} forms removed from selection`,
      });
    }
  };

  const handleRemoveSelectedForm = async (node) => {
    try {
      setSelectedForms((prev) => prev.filter((form) => form.id !== node.id));

      toast({
        title: "Form removed",
        description: `${node.label} removed from selection`,
        duration: 2000,
      });

      if (userDetails.USER_NAME) {
        try {
          const deletePayload = {
            UserName: userData.currentUserLogin,
            DataModelName: "USER_RIGHTS",
            WhereCondition: `USER_NAME = '${userDetails.USER_NAME}' AND FORM_NAME = '${node.id}'`,
          };

          await deleteDataModelService(
            deletePayload,
            userData.currentUserLogin,
            userData.clientURL
          );
        } catch (deleteError) {
          console.error("Error removing from database:", deleteError);
        }
      }
    } catch (error) {
      console.error("Error removing form:", error);
      toast({
        variant: "destructive",
        title: "Error removing form",
        description: error.message || "Failed to remove form access",
      });
    }
  };

  const handleRemoveMultipleSelectedForms = async (forms) => {
    try {
      setSelectedForms((prev) =>
        prev.filter(
          (selectedForm) => !forms.some((form) => form.id === selectedForm.id)
        )
      );

      toast({
        title: "Forms removed",
        description: `${forms.length} forms removed from selection`,
        duration: 2000,
      });

      if (userDetails.USER_NAME) {
        for (const node of forms) {
          try {
            const deletePayload = {
              UserName: userData.currentUserLogin,
              DataModelName: "USER_RIGHTS",
              WhereCondition: `USER_NAME = '${userDetails.USER_NAME}' AND FORM_NAME = '${node.id}'`,
            };

            await deleteDataModelService(
              deletePayload,
              userData.currentUserLogin,
              userData.clientURL
            );
          } catch (deleteError) {
            console.error(
              `Error removing form ${node.id} from database:`,
              deleteError
            );
          }
        }
      }
    } catch (error) {
      console.error("Error removing multiple forms:", error);
      toast({
        variant: "destructive",
        title: "Error removing forms",
        description: error.message || "Failed to remove form access rights",
      });
    }
  };

  const handleSave = async () => {
    if (!userDetails.USER_NAME || selectedForms.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select both a user and at least one rights item",
      });
      return;
    }

    setSaving(true);
    try {
      const existingResponse = await getDataModelService(
        {
          DataModelName: "USER_RIGHTS",
          WhereCondition: `USER_NAME = '${userDetails.USER_NAME}'`,
          Orderby: "",
        },
        userData.currentUserLogin,
        userData.clientURL
      );

      const existingForms = Array.isArray(existingResponse)
        ? existingResponse.map((right) => right.FORM_NAME)
        : [];

      for (const form of selectedForms) {
        if (existingForms.includes(form.id)) {
          continue;
        }

        const formAccessData = {
          USER_NAME: userDetails.USER_NAME,
          MODULE_NAME: form.formData.MODULE_NAME || "General",
          FORM_NAME: form.id,
          CAN_VIEW_ALLCOLUMNS: null,
        };

        const data = convertDataModelToStringData(
          "USER_RIGHTS",
          formAccessData
        );
        const savePayload = {
          UserName: userData.currentUserLogin,
          DModelData: data,
        };

        const saveResponse = await saveDataService(
          savePayload,
          userData.currentUserLogin,
          userData.clientURL
        );

        if (
          saveResponse === null ||
          saveResponse === undefined ||
          (typeof saveResponse === "object" && saveResponse.error)
        ) {
          throw new Error(
            `Failed to save form ${form.label} to user ${userDetails.USER_NAME}`
          );
        }
      }

      await fetchUserFormAccess(userDetails.USER_NAME);

      toast({
        variant: "default",
        title: "Success",
        description: `Saved rights items to user ${userDetails.USER_NAME}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Failed to save user access rights",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUserDetails({ USER_NAME: "" });
    setUserRoles([]);
    setSelectedForms([]);
  };

  const isUserSelected = !!userDetails.USER_NAME;

  return (
    <div className="flex flex-col gap-4">
      {/* User Selection and Roles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Details */}
        <Card className="flex flex-col p-4">
          <Label className="text-xs font-semibold mb-2">Select User</Label>
          <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between text-left font-normal"
              >
                {userDetails.USER_NAME || "Select user"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] h-[200px] p-0 z-50">
              <Command>
                <CommandInput
                  placeholder="Search user"
                  value={userSearchInput}
                  onValueChange={setUserSearchInput}
                />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {loadingUsers ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading users...
                      </div>
                    ) : (
                      usersList
                        .filter((user) =>
                          user.USER_NAME.toLowerCase().includes(
                            userSearchInput.toLowerCase()
                          )
                        )
                        .map((user) => (
                          <CommandItem
                            key={`user-${user.USER_NAME}`}
                            value={user.USER_NAME}
                            onSelect={() => handleUserSelect(user)}
                          >
                            {user.USER_NAME}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                userDetails.USER_NAME === user.USER_NAME
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="mt-1">
            <Label className="text-xs font-semibold mb-2">Assigned Roles</Label>
            <div className="border rounded-md dark:border-gray-800">
              <Table>
                <ScrollArea
                  className={userRoles.length > 4 ? "h-[278px]" : "h-auto"}
                >
                  <TableHeader
                    className={
                      userRoles.length > 4
                        ? "sticky top-0 bg-background z-10"
                        : ""
                    }
                  >
                    <TableRow className="dark:border-gray-800">
                      <TableHead className="text-xs">Role Name</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.length > 0 ? (
                      userRoles.map((role, index) => (
                        <TableRow key={index} className="dark:border-gray-800">
                          <TableCell className="text-xs">
                            {role.ROLE_NAME}
                          </TableCell>
                          <TableCell className="text-xs">
                            {role.ROLE_DESCRIPTION || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground py-4"
                        >
                          {userDetails.USER_NAME
                            ? "No roles assigned to this user."
                            : "Select a user to view roles."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </ScrollArea>
              </Table>
            </div>
          </div>
        </Card>

        {/* Add Access Rights */}
        <Card
          className={`flex flex-col p-4 ${
            !isUserSelected ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Label className="text-xs font-semibold mb-2">
            Add Access Rights
          </Label>
          <div className="border dark:border-gray-800 rounded-md h-[350px] overflow-hidden">
            {loadingForms ? (
              <div className="h-full w-full p-2 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Loading forms...
                </span>
              </div>
            ) : filteredTreeData.length > 0 ? (
              <ScrollArea className="h-full w-full p-2">
                <TreeView
                  data={filteredTreeData}
                  onSelect={handleFormSelect}
                  selectedItems={selectedForms}
                  useCheckbox={true}
                  onSelectAll={handleBulkFormsSelection}
                  isSelectAllMode={true}
                />
              </ScrollArea>
            ) : (
              <div className="h-full w-full p-2 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  All available forms are already added
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Remove Access Rights */}
        <Card
          className={`flex flex-col p-4 ${
            !isUserSelected ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs font-semibold">
              Remove Access Rights
            </Label>
            <span className="text-xs text-gray-500">
              Assigned Forms ({selectedForms.length})
            </span>
          </div>
          <div className="border dark:border-gray-800 rounded-md h-[350px] overflow-hidden">
            {loading ? (
              <div className="h-full w-full p-2 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Loading assigned forms...
                </span>
              </div>
            ) : assignedFormsTreeData.length > 0 ? (
              <ScrollArea className="h-full w-full p-2">
                <TreeView
                  data={assignedFormsTreeData}
                  onRemove={handleRemoveSelectedForm}
                  isRemovable={true}
                  useCheckbox={true}
                  onSelectAll={handleRemoveMultipleSelectedForms}
                  isSelectAllMode={true}
                />
              </ScrollArea>
            ) : (
              <div className="h-full w-full p-2 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  No forms assigned to this user
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!isUserSelected}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !isUserSelected || selectedForms.length === 0}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default UserAccessRights;
