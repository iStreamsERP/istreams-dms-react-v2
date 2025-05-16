import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronsUpDown, Check, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { deleteDataModelService, getDataModelService, saveDataService } from '@/services/dataModelService';
import { useAuth } from '@/contexts/AuthContext';
import { convertDataModelToStringData } from '@/utils/dataModelConverter';

const UserRole = () => {
  const [roleDetails, setRoleDetails] = useState({ roleName: "", roleId: "New", description: "" });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [openRolePopover, setOpenRolePopover] = useState(false);
  const [roleSearchInput, setRoleSearchInput] = useState("");
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [isNewRole, setIsNewRole] = useState(false);
  const [isRoleSaved, setIsRoleSaved] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalRoleName, setOriginalRoleName] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { userData } = useAuth();

  useEffect(() => {
    if (!hasFetchedUsers && userData?.currentUserLogin && userData?.clientURL) {
      fetchRolesData();
      fetchUsersData();
      setHasFetchedUsers(true);
    }
  }, [userData?.currentUserLogin, userData?.clientURL, hasFetchedUsers]);

  const fetchRolesData = async () => {
    setLoadingRoles(true);
    try {
      const rolesdetailsData = { DataModelName: "general_roles_master", WhereCondition: "", Orderby: "ROLE_ID" };

      const response = await getDataModelService(rolesdetailsData, userData?.currentUserLogin, userData?.clientURL);

      const formattedRoles = response.map(role => ({ roleName: role.ROLE_NAME?.trim(), roleId: role.ROLE_ID.toString(), description: role.ROLE_DESCRIPTION || "" }));

      setRolesList(formattedRoles);
    } catch (error) {
      toast({
        variant: "destructive", title: "Error fetching roles", description: error.message,
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUsersForRole = async (roleId) => {
    setLoadingUsers(true);
    try {
      const usersRequestData = { DataModelName: 'general_roles_users', WhereCondition: `ROLE_ID = '${roleId}'`, Orderby: 'USER_NAME' };

      const response = await getDataModelService(usersRequestData, userData.currentUserLogin, userData.clientURL);

      const usersArray = Array.isArray(response) ? response : response?.data || [];
      const formattedUsers = usersArray.map((user) => ({
        id: user.USER_NAME,  // Using USER_NAME as ID for consistency
        name: user.USER_NAME?.trim() || `User`,
      }));

      setSelectedUsers(formattedUsers);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching users for role',
        description: error.message || 'Failed to fetch users',
      });
      setSelectedUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUsersData = async () => {
    setLoadingUsers(true);
    try {
      const usersRequestData = { DataModelName: 'user_master', WhereCondition: '', Orderby: 'USER_NAME' };
      const response = await getDataModelService(usersRequestData, userData.currentUserLogin, userData.clientURL);

      const usersArray = Array.isArray(response) ? response : response?.data || [];
      const formattedUsers = usersArray.map((user) => ({ id: user.USER_NAME, name: user.USER_NAME?.trim() || `User` }));

      setUsersList(formattedUsers);
    } catch (error) {
      setUsersList([]);
      toast({
        variant: 'destructive',
        title: 'Error fetching users data',
        description: error.message || 'Failed to fetch users',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleSelect = (role) => {
    setRoleDetails({ roleName: role.roleName, roleId: role.roleId, description: role.description || "" });
    setOriginalRoleName(role.roleName);
    setIsRoleSaved(role.roleId !== "New");
    setIsNewRole(role.roleId === "New");
    setIsEditMode(false);
    setSelectedUsers([]);

    if (role.roleId !== "New") {
      fetchUsersForRole(role.roleId);
    } else {
      setSelectedUsers([]);
    }
    setOpenRolePopover(false);
  };

  const handleUserSelect = useCallback((user) => {
    setSelectedUsers((prev) => {
      const exists = prev.some(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleDetails(prev => {
      const newDetails = { ...prev, [name]: value };
      if (!isEditMode && (name === "description" || name === "roleName")) {
        setIsRoleSaved(false);
      }
      return newDetails;
    });
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    setIsRoleSaved(false);
  };

  const cancelEdit = () => {
    // Reset to original values
    const originalRole = rolesList.find(role => role.roleId === roleDetails.roleId);
    if (originalRole) {
      setRoleDetails({ roleId: originalRole.roleId, roleName: originalRole.roleName, description: originalRole.description });
    }
    setIsEditMode(false);
    setIsRoleSaved(true);
  };

  const showDeleteConfirmation = (role) => {
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  const hideDeleteConfirmation = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  const handleDelete = async (role) => {
    setIsDeleting(true);
    try {
      const deleteUsersPayload = { UserName: userData.currentUserLogin, DataModelName: "general_roles_users", WhereCondition: `ROLE_ID = '${role.roleId}'` };
      await deleteDataModelService(deleteUsersPayload, userData.currentUserLogin, userData.clientURL);

      const deleteRolePayLoad = { UserName: userData.currentUserLogin, DataModelName: "general_roles_master", WhereCondition: `ROLE_ID = '${role.roleId}'` };
      const deleteResponse = await deleteDataModelService(deleteRolePayLoad, userData.currentUserLogin, userData.clientURL);

      setRolesList(prev => prev.filter(r => r.roleId !== role.roleId));
      setSavedConfigs(prev => prev.filter(config => config.role.roleId !== role.roleId));

      if (roleDetails.roleId === role.roleId) {
        setRoleDetails({ roleName: "", roleId: "NEW", description: "" });
        setSelectedUsers([]);
        setIsRoleSaved(false);
        setIsNewRole(false);
        setIsEditMode(false);
      }

      toast({ title: "Role deleted successfully", description: deleteResponse || "Role and associated users have been removed", duration: 2000 });
    } catch (error) {
      toast({ variant: "destructive", title: "Error deleting role", description: error.message || "Failed to delete role" });
    } finally {
      setIsDeleting(false);
      hideDeleteConfirmation();
    }
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const handleSaveRoleDetails = async () => {
    if (!roleDetails.roleName.trim()) {
      toast({ title: "Role name is required", variant: "destructive" });
      return;
    }

    if (!roleDetails.description.trim()) {
      toast({ title: "Role description is required", variant: "destructive" });
      return;
    }

    if (isNewRole) {
      const roleExists = rolesList.some(role =>
        role.roleName.toLowerCase() === roleDetails.roleName.toLowerCase()
      );

      if (roleExists) {
        toast({
          title: "Role already exists",
          description: "Please choose a different role name",
          variant: "destructive"
        });
        return;
      }
    }

    // For edit mode, check if another role with same name exists (not counting the current role)
    if (isEditMode) {
      const roleExists = rolesList.some(role =>
        role.roleName.toLowerCase() === roleDetails.roleName.toLowerCase() &&
        role.roleId !== roleDetails.roleId
      );

      if (roleExists) {
        toast({
          title: "Role name already taken",
          description: "Please choose a different role name",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const roleFormData = {
        ROLE_ID: isNewRole ? -1 : roleDetails.roleId, // -1 for new, existing ID for edit
        ROLE_NAME: roleDetails.roleName,
        ROLE_DESCRIPTION: roleDetails.description,
        USER_NAME: userData.currentUserName,
        ENT_DATE: ""
      };

      const convertedDataModel = convertDataModelToStringData("general_roles_master", roleFormData);

      const roleSavePayload = { UserName: userData.currentUserLogin, DModelData: convertedDataModel };

      const saveResponse = await saveDataService(roleSavePayload, userData.currentUserLogin, userData.clientURL);

      let newRoleId = roleDetails.roleId;

      // Update UI state
      if (isNewRole) {
        try {
          if (typeof saveResponse === 'string' && saveResponse.includes('ID:')) {
            const idMatch = saveResponse.match(/ID:\s*(\d+)/i);
            if (idMatch && idMatch[1]) {
              newRoleId = idMatch[1];
            }
          }
        } catch (error) {
          // Silently handle parsing error
        }

        if (newRoleId === "New" || newRoleId === -1 || !newRoleId) {
          const existingIds = rolesList
            .map((role) => parseInt(role.roleId))
            .filter((id) => !isNaN(id));
          const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
          newRoleId = (maxId + 1).toString();
        }

        const newRole = { roleName: roleDetails.roleName, roleId: newRoleId, description: roleDetails.description };

        setRolesList(prev => [...prev, newRole]);
      } else if (isEditMode) {
        // Update the local state for edited role
        setRolesList(prev => prev.map(role =>
          role.roleId === roleDetails.roleId ?
            { ...role, roleName: roleDetails.roleName, description: roleDetails.description } :
            role
        ));

        // Update saved configs to reflect the name change
        setSavedConfigs(prev => prev.map(config =>
          config.role.roleId === roleDetails.roleId ?
            { ...config, role: { ...config.role, roleName: roleDetails.roleName, description: roleDetails.description } } :
            config
        ));
      }

      setRoleDetails((prev) => ({ ...prev, roleId: newRoleId }));
      setIsRoleSaved(true);
      setIsNewRole(false);
      setIsEditMode(false);
      setOriginalRoleName(roleDetails.roleName);

      toast({
        title: isEditMode ? "Role details updated successfully" : "Role details saved successfully",
        description: saveResponse || `Changes have been saved to the database`,
        duration: 1500
      });

      fetchRolesData();

    } catch (error) {
      toast({
        variant: "destructive",
        title: isEditMode ? "Error updating role details" : "Error saving role details",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleSave = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const user of selectedUsers) {
        const userRoleData = { ROLE_ID: roleDetails.roleId, USER_NAME: user.name, IS_ACTIVE: "T" };

        const data = convertDataModelToStringData("general_roles_users", userRoleData);

        const savePayload = { UserName: userData.currentUserLogin, DModelData: data };

        const saveResponse = await saveDataService(savePayload, userData.currentUserLogin, userData.clientURL);

        if (saveResponse === null || saveResponse === undefined ||
          (typeof saveResponse === 'object' && saveResponse.error)) {
          throw new Error(`Failed to save user ${user.name} to role ${roleDetails.roleName}`);
        }
      }

      const config = { role: roleDetails, users: selectedUsers.map(user => ({ name: user.name })) };

      setSavedConfigs(prev => [...prev, config]);

      toast({
        title: "Success",
        description: `Saved ${selectedUsers.length} user(s) to role ${roleDetails.roleName}`,
        duration: 2000
      });

    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Failed to save user-role mappings",
      });
    }
  };

  const handleUserDelete = async (userId, userName) => {
    try {
      if (roleDetails.roleId !== "New") {
        const deletePayload = { UserName: userData.currentUserLogin, DataModelName: "general_roles_users", WhereCondition: `ROLE_ID = '${roleDetails.roleId}' AND USER_NAME = '${userName}'` };

        await deleteDataModelService(deletePayload, userData.currentUserLogin, userData.clientURL);
      }

      // Update UI state
      setSelectedUsers(prev => prev.filter(u => u.id !== userId));

      // Update saved configs
      setSavedConfigs(prev => prev.map(config => {
        if (config.role.roleId === roleDetails.roleId) {
          return {
            ...config,
            users: config.users.filter(u => u.name !== userName)
          };
        }
        return config;
      }));

      toast({
        title: "User removed",
        description: `User ${userName} has been removed from role ${roleDetails.roleName}`,
        duration: 2000
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error removing user",
        description: error.message || "Failed to remove user from role"
      });
    }
  };

  const canSaveConfiguration = isRoleSaved && selectedUsers.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">User Role Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Role Details */}
        <Card className="border">
          <CardTitle className="text-lg font-semibold pl-4 pt-2">Role Details</CardTitle>

          <CardContent className="h-[180px] pl-4 pr-4 space-y-0">
            <div className="grid grid-cols-1 grid-cols-2 gap-3">
              <div>
                <Label htmlFor="roleId">Role ID</Label>
                <Input name="roleId" value={roleDetails.roleId} disabled />
              </div>

              <div>
                <Label>Select Role Name</Label>
                {isEditMode ? (
                  <Input name="roleName" value={roleDetails.roleName} onChange={handleInputChange} placeholder="Enter role name" />
                ) : (
                  <Popover open={openRolePopover} onOpenChange={setOpenRolePopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                        {roleDetails.roleName || "Select role name"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] h-[200px] p-0 z-50">
                      <Command>
                        <CommandInput placeholder="Search role name" value={roleSearchInput}
                          onValueChange={setRoleSearchInput} />
                        <CommandList>
                          <CommandEmpty>
                            <div className="flex justify-between items-center px-2">
                              <span>No role found.</span>
                              {roleSearchInput && (
                                <Button size="sm"
                                  onClick={() => {
                                    const newRole = toTitleCase(roleSearchInput.trim());
                                    setRoleDetails({ roleName: newRole, roleId: "New", description: "" });
                                    setIsNewRole(true);
                                    setOpenRolePopover(false);
                                  }} >
                                  Add "{roleSearchInput}"
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>

                          <CommandGroup>
                            {loadingRoles ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Loading roles...
                              </div>
                            ) : (
                              rolesList.map((role) => (
                                <CommandItem key={`role-${role.roleId}`} value={role.roleName} onSelect={() => handleRoleSelect(role)} >
                                  {role.roleName}
                                  <Check className={cn("ml-auto h-4 w-4", roleDetails.roleName === role.roleName ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" value={roleDetails.description}
                onChange={handleInputChange} placeholder="Enter role description" className="min-h-[60px]"
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-2">
            {!isEditMode && isRoleSaved && roleDetails.roleId !== "New" && (
              <>
                <Button size="icon" variant="ghost" onClick={() => showDeleteConfirmation(roleDetails)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
                <Button variant="outline" onClick={enableEditMode}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Role
                </Button>
              </>
            )}

            {isEditMode && (
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            )}

            {(!isRoleSaved || isNewRole || isEditMode) && (
              <Button onClick={handleSaveRoleDetails} disabled={!roleDetails.roleName || !roleDetails.description} >
                {isEditMode ? "Update" : "Save"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Select Users */}
        <Card className={cn("border", !isRoleSaved && "opacity-50 pointer-events-none")}>
          <CardTitle className="text-lg font-semibold pl-4 pt-2">Select Users</CardTitle>

          <CardContent className="h-[240px] pl-4 pr-4 space-y-0">
            {!isRoleSaved && (
              <div className="text-sm text-muted-foreground mb-4">
                Please save the Role Details first to enable this section.
              </div>
            )}
            <div className="space-y-0 mb-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full justify-between text-left'>
                    {selectedUsers.length > 0 ? `${selectedUsers.length} user(s) selected` : 'Click to select users'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[var(--radix-popover-trigger-width)] h-[200px] p-0 z-50'>
                  <Command>
                    <CommandInput placeholder='Search users...' />
                    <CommandList>
                      <CommandGroup>
                        {loadingUsers ? (
                          <div className='p-4 text-center text-sm text-muted-foreground'>
                            Loading users...
                          </div>
                        ) : (
                          usersList.map((user) => (
                            <CommandItem key={`${user.id}`} onSelect={() => handleUserSelect(user)} >
                              <div className='flex justify-between items-center w-full'>
                                <span>{user.name}</span>
                                {selectedUsers.some(u => u.id === user.id) && (
                                  <Check className='h-4 w-4 text-primary' />
                                )}
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedUsers.length > 0 && (
              <div className="space-y-0">
                <div className="border rounded-md">
                  <ScrollArea className="h-[175px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow className="text-xs font-medium">
                          <TableHead className="w-[60%]">Name</TableHead>
                          <TableHead className="w-[10%]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs font-medium">
                        {selectedUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="truncate max-w-[180px] py-0">{user.name}</TableCell>
                            <TableCell className="py-0">
                              <Button size="icon" variant='ghost' onClick={() => handleUserDelete(user.id, user.name)} >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <div className="flex justify-end">
          {canSaveConfiguration && (
            <Button
              onClick={() => {
                handleSave();
                // Reset form after successful save
                setRoleDetails({ roleName: "", roleId: "New", description: "" });
                setSelectedUsers([]);
                setIsRoleSaved(false);
                setIsNewRole(false);
                setIsEditMode(false);
              }}
            >
              Save Configuration
            </Button>
          )}
        </div>
      </div>

      <div className="">
        {/* ConfigurationTable */}
        {savedConfigs.length > 0 && (
          <Card className="border">
            <CardTitle className="text-lg font-semibold pl-4 pt-2">Saved Configurations</CardTitle>

            <CardContent className="h-[320px] pt-3 pl-4 pr-4 space-y-0">
              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs font-medium">
                      <TableHead>Role Name</TableHead>
                      <TableHead>Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-medium">
                    {savedConfigs.map((config, index) => (
                      <TableRow key={`${config.role.roleId}-${index}`}>
                        <TableCell className="max-w-[220px] truncate">{config.role.roleName}</TableCell>
                        <TableCell>{config.users.map(user => user.name).join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">Delete Role</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete the role "{roleToDelete?.roleName}"?</p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={hideDeleteConfirmation} disabled={isDeleting} >Cancel</Button>
              <Button variant="destructive" onClick={() => roleToDelete && handleDelete(roleToDelete)}
                disabled={isDeleting} className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRole;