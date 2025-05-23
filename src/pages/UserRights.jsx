import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronsUpDown, Check, ChevronRight, ChevronDown, X, CheckSquare, Square } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { deleteDataModelService, getDataModelService, saveDataService } from '@/services/dataModelService';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { convertDataModelToStringData } from '@/utils/dataModelConverter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TreeNode = ({ node, level = 0, onSelect, onRemove, isRemovable = false, selectedItems = [], useCheckbox = false, onSelectAll = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedItems.some(item => item.id === node.id);

    const areAllChildrenSelected = hasChildren && node.children.every(child => {
        if (!child.children || child.children.length === 0) {
            return selectedItems.some(item => item.id === child.id);
        }

        return checkAllChildrenSelected(child, selectedItems);
    });

    function checkAllChildrenSelected(node, selectedItems) {
        if (!node.children || node.children.length === 0) {
            return selectedItems.some(item => item.id === node.id);
        }

        return node.children.every(child => {
            if (!child.children || child.children.length === 0) {
                return selectedItems.some(item => item.id === child.id);
            }
            return checkAllChildrenSelected(child, selectedItems);
        });
    }

    const getAllLeafNodes = (node) => {
        let leafNodes = [];

        if (!node.children || node.children.length === 0) {
            if (node.type === 'Form') {
                return [node];
            }
            return [];
        }

        node.children.forEach(child => {
            leafNodes = [...leafNodes, ...getAllLeafNodes(child)];
        });

        return leafNodes;
    };

    const handleCheckboxClick = (e) => {
        e.stopPropagation();

        if (hasChildren) {
            const allLeafNodes = getAllLeafNodes(node);
            if (areAllChildrenSelected) {
                onSelectAll(allLeafNodes, false);
            } else {
                onSelectAll(allLeafNodes, true);
            }
        } else if (onSelect) {
            onSelect(node);
        }
    };

    return (
        <div>
            <div className={cn("flex items-center py-1 px-2 rounded-sm cursor-pointer select-none",
                level > 0 && "ml-4", areAllChildrenSelected && hasChildren && "font-medium")}
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
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                ) : (
                    <div className="w-5"></div>
                )}

                {useCheckbox && (
                    <div className="mr-2 flex items-center justify-center cursor-pointer" onClick={handleCheckboxClick} >
                        {hasChildren ? (
                            areAllChildrenSelected ?
                                <CheckSquare className="h-4 w-4 text-primary" /> :
                                <Square className="h-4 w-4" />
                        ) : (
                            isSelected ?
                                <CheckSquare className="h-4 w-4 text-primary" /> :
                                <Square className="h-4 w-4" />
                        )}
                    </div>
                )}

                <span className={cn("text-sm flex-grow", !hasChildren && !useCheckbox && "ml-1")}>
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
                            key={`${childNode.id}-${index}`} node={childNode}
                            level={level + 1} onSelect={onSelect}
                            onRemove={onRemove} isRemovable={isRemovable}
                            selectedItems={selectedItems} useCheckbox={useCheckbox} onSelectAll={onSelectAll}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const TreeView = ({ data, onSelect, onRemove, isRemovable = false, selectedItems = [], useCheckbox = false, onSelectAll = null, isSelectAllMode = false
}) => {
    return (
        <div>
            {data.map((node, index) => (
                <TreeNode
                    key={`${node.id}-${index}`} node={node} onSelect={onSelect}
                    onRemove={onRemove} isRemovable={isRemovable} selectedItems={selectedItems}
                    useCheckbox={useCheckbox} onSelectAll={onSelectAll} isSelectAllMode={isSelectAllMode}
                />
            ))}
        </div>
    );
};

const UserRights = () => {
    const [userDetails, setUserDetails] = useState({ userName: "" });
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
            const treeStructure = [], moduleMap = {};

            formsList.forEach(form => {
                if (!moduleMap[form.MODULE_NAME]) {
                    moduleMap[form.MODULE_NAME] = { id: `module-${form.MODULE_NAME}`, label: form.MODULE_NAME, children: {} };
                }

                const formTypes = moduleMap[form.MODULE_NAME].children;
                if (!formTypes[form.FORM_TYPE]) {
                    formTypes[form.FORM_TYPE] = { id: `type-${form.MODULE_NAME}-${form.FORM_TYPE}`, label: form.FORM_TYPE, children: [] };
                }

                formTypes[form.FORM_TYPE].children.push({ id: form.FORM_NAME, label: form.DESCRIPTION || form.FORM_NAME, formData: form, type: 'Form' });
            });

            Object.values(moduleMap).forEach(module => {
                const moduleNode = { id: module.id, label: module.label, children: [] };

                Object.values(module.children).forEach(formType => {
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
                return tree.map(moduleNode => {
                    const newModuleNode = { ...moduleNode };

                    if (newModuleNode.children && newModuleNode.children.length > 0) {
                        newModuleNode.children = newModuleNode.children.map(formTypeNode => {
                            const newFormTypeNode = { ...formTypeNode };

                            if (newFormTypeNode.children && newFormTypeNode.children.length > 0) {
                                newFormTypeNode.children = newFormTypeNode.children.filter(formNode =>
                                    !selectedForms.some(selectedForm => selectedForm.id === formNode.id)
                                );
                            }

                            return newFormTypeNode;
                        }).filter(formTypeNode =>
                            formTypeNode.children && formTypeNode.children.length > 0
                        );
                    }

                    return newModuleNode.children && newModuleNode.children.length > 0 ? newModuleNode : null;
                }).filter(Boolean);
            };

            setFilteredTreeData(filterFormsNotSelected(treeData));
        }
    }, [selectedForms, treeData]);

    useEffect(() => {
        if (selectedForms.length > 0) {
            const moduleMap = {};

            selectedForms.forEach(form => {
                const moduleName = form.formData.MODULE_NAME;
                const formType = form.formData.FORM_TYPE || "General";

                if (!moduleMap[moduleName]) {
                    moduleMap[moduleName] = { id: `assigned-module-${moduleName}`, label: moduleName, children: {} };
                }

                const formTypes = moduleMap[moduleName].children;
                if (!formTypes[formType]) {
                    formTypes[formType] = { id: `assigned-type-${moduleName}-${formType}`, label: formType, children: [] };
                }

                formTypes[formType].children.push({ id: form.id, label: form.label, formData: form.formData, type: 'Form' });
            });

            const assignedTreeStructure = [];
            Object.values(moduleMap).forEach(module => {
                const moduleNode = { id: module.id, label: module.label, children: [] };

                Object.values(module.children).forEach(formType => {
                    moduleNode.children.push(formType);
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
            const usersRequestData = { DataModelName: "USER_MASTER", WhereCondition: "", Orderby: "USER_NAME" };
            const response = await getDataModelService(usersRequestData, userData?.currentUserLogin, userData?.clientURL);

            const formattedUsers = Array.isArray(response) ? response.map(user => ({
                userName: user.USER_NAME?.trim()
            })).filter(user => user.userName) : [];
            setUsersList(formattedUsers);
        } catch (error) {
            toast({ variant: "destructive", title: "Error fetching users", description: error.message });
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchUserRoles = async (userName) => {
        if (!userName) {
            setUserRoles([]);
            return;
        }

        try {
            const rolesData = { DataModelName: "general_roles_users", WhereCondition: `USER_NAME = '${userName}'`, Orderby: "ROLE_ID" };
            const userRolesResponse = await getDataModelService(rolesData, userData?.currentUserLogin, userData?.clientURL);

            if (!Array.isArray(userRolesResponse) || userRolesResponse.length === 0) {
                setUserRoles([]);
                return;
            }

            const roleIds = userRolesResponse.map(role => `'${role.ROLE_ID}'`).join(',');
            const masterRolesData = { DataModelName: "general_roles_master", WhereCondition: `ROLE_ID IN (${roleIds})`, Orderby: "ROLE_ID" };
            const masterRolesResponse = await getDataModelService(masterRolesData, userData?.currentUserLogin, userData?.clientURL);

            if (Array.isArray(masterRolesResponse)) {
                const combinedRoles = userRolesResponse.map(userRole => {
                    const masterRole = masterRolesResponse.find(mr => mr.ROLE_ID === userRole.ROLE_ID);
                    return {
                        ROLE_ID: userRole.ROLE_ID, USER_NAME: userRole.USER_NAME, ROLE_NAME: masterRole?.ROLE_NAME || 'N/A', DESCRIPTION: masterRole?.ROLE_DESCRIPTION || 'No description available'
                    };
                });
                setUserRoles(combinedRoles);
            } else {
                setUserRoles([]);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error fetching user roles", description: error.message });
            setUserRoles([]);
        }
    };

    const fetchFormsData = async () => {
        setLoadingForms(true);
        try {
            const formsRequestData = { DataModelName: 'FORMS_MASTER', WhereCondition: '', Orderby: 'MODULE_NAME, FORM_TYPE' };
            const response = await getDataModelService(formsRequestData, userData?.currentUserLogin, userData?.clientURL);

            const formsArray = Array.isArray(response) ? response : response?.data || [];
            setFormsList(formsArray);
        } catch (error) {
            setFormsList([]);
            toast({ variant: 'destructive', title: 'Error fetching forms', description: error.message || 'Failed to fetch forms master data' });
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
            const rightRequestData = { DataModelName: "USER_RIGHTS", WhereCondition: `USER_NAME = '${userName}'`, Orderby: "MODULE_NAME, FORM_NAME" };

            const rightsResponse = await getDataModelService(rightRequestData, userData?.currentUserLogin, userData?.clientURL);

            if (!Array.isArray(rightsResponse)) {
                setSelectedForms([]);
                setLoading(false);
                return;
            }

            const formItems = rightsResponse.map(right => ({
                id: right.FORM_NAME, label: right.FORM_NAME,
                formData: {
                    MODULE_NAME: right.MODULE_NAME || '', FORM_NAME: right.FORM_NAME, DESCRIPTION: right.FORM_NAME, FORM_TYPE: right.FORM_TYPE || ''
                }
            }));

            try {
                const formNames = rightsResponse.map(right => `'${right.FORM_NAME}'`).join(',');
                if (formNames) {
                    const formsRequestData = { DataModelName: "FORMS_MASTER", WhereCondition: `FORM_NAME IN (${formNames})`, Orderby: "MODULE_NAME, FORM_NAME" };

                    const formsResponse = await getDataModelService(formsRequestData, userData?.currentUserLogin, userData?.clientURL);

                    if (Array.isArray(formsResponse)) {
                        const updatedFormItems = formItems.map(item => {
                            const formDetails = formsResponse.find(f => f.FORM_NAME === item.id) || {};
                            return {
                                ...item,
                                label: formDetails.DESCRIPTION || item.label,
                                formData: {
                                    ...item.formData,
                                    DESCRIPTION: formDetails.DESCRIPTION || item.formData.DESCRIPTION,
                                    FORM_TYPE: formDetails.FORM_TYPE || item.formData.FORM_TYPE
                                }
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
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch form access rights for this user" });
            setSelectedForms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setUserDetails({ userName: user.userName });
        setOpenUserPopover(false);
        fetchUserRoles(user.userName);
        fetchUserFormAccess(user.userName);
    };

    const handleFormSelect = (node) => {
        const isAlreadySelected = selectedForms.some(form => form.id === node.id);

        if (!isAlreadySelected) {
            setSelectedForms(prev => [...prev, node]);
            toast({ title: "Form added", description: `${node.label} added to selection` });
        } else {
            toast({ variant: "default", title: "Info", description: "This form is already selected" });
        }
    };

    const handleBulkFormsSelection = (forms, shouldSelect) => {
        if (shouldSelect) {
            const formsToAdd = forms.filter(form =>
                !selectedForms.some(selectedForm => selectedForm.id === form.id)
            );

            if (formsToAdd.length > 0) {
                setSelectedForms(prev => [...prev, ...formsToAdd]);
                toast({
                    title: "Forms added",
                    description: `${formsToAdd.length} forms added to selection`
                });
            }
        } else {
            setSelectedForms(prev =>
                prev.filter(selectedForm =>
                    !forms.some(form => form.id === selectedForm.id)
                )
            );

            toast({ title: "Forms removed", description: `${forms.length} forms removed from selection` });
        }
    };

    const handleRemoveSelectedForm = async (node) => {
        try {
            setSelectedForms(prev => prev.filter(form => form.id !== node.id));

            toast({ title: "Form removed", description: `${node.label} removed from selection`, duration: 2000 });

            if (userDetails.userName) {
                try {
                    const deletePayload = { UserName: userData.currentUserLogin, DataModelName: "USER_RIGHTS", WhereCondition: `USER_NAME = '${userDetails.userName}' AND FORM_NAME = '${node.id}'` };

                    await deleteDataModelService(deletePayload, userData.currentUserLogin, userData.clientURL);
                } catch (deleteError) {
                    console.error("Error removing from database:", deleteError);
                }
            }
        } catch (error) {
            console.error("Error removing form:", error);
            toast({ variant: "destructive", title: "Error removing form", description: error.message || "Failed to remove form access" });
        }
    };

    const handleRemoveMultipleSelectedForms = async (forms) => {
        try {
            setSelectedForms(prev =>
                prev.filter(selectedForm =>
                    !forms.some(form => form.id === selectedForm.id)
                )
            );

            toast({ title: "Forms removed", description: `${forms.length} forms removed from selection`, duration: 2000 });

            if (userDetails.userName) {
                for (const node of forms) {
                    try {
                        const deletePayload = { UserName: userData.currentUserLogin, DataModelName: "USER_RIGHTS", WhereCondition: `USER_NAME = '${userDetails.userName}' AND FORM_NAME = '${node.id}'` };

                        await deleteDataModelService(deletePayload, userData.currentUserLogin, userData.clientURL);
                    } catch (deleteError) {
                        console.error(`Error removing form ${node.id} from database:`, deleteError);
                    }
                }
            }
        } catch (error) {
            console.error("Error removing multiple forms:", error);
            toast({ variant: "destructive", title: "Error removing forms", description: error.message || "Failed to remove form access rights" });
        }
    };

    const handleSave = async () => {
        if (!userDetails.userName || selectedForms.length === 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please select both a user and at least one rights item"
            });
            return;
        }

        setSaving(true);
        try {
            const existingResponse = await getDataModelService(
                { DataModelName: "USER_RIGHTS", WhereCondition: `USER_NAME = '${userDetails.userName}'`, Orderby: "" },
                userData.currentUserLogin, userData.clientURL
            );

            const existingForms = Array.isArray(existingResponse) ? existingResponse.map(right => right.FORM_NAME) : [];

            for (const form of selectedForms) {
                if (existingForms.includes(form.id)) {
                    continue;
                }

                const formAccessData = {
                    USER_NAME: userDetails.userName, MODULE_NAME: form.formData.MODULE_NAME || 'General',
                    FORM_NAME: form.id, CAN_VIEW_ALLCOLUMNS: null
                };

                const data = convertDataModelToStringData("USER_RIGHTS", formAccessData);
                const savePayload = { UserName: userData.currentUserLogin, DModelData: data };

                const saveResponse = await saveDataService(savePayload, userData.currentUserLogin, userData.clientURL);

                if (saveResponse === null || saveResponse === undefined ||
                    (typeof saveResponse === 'object' && saveResponse.error)) {
                    throw new Error(`Failed to save form ${form.label} to user ${userDetails.userName}`);
                }
            }

            await fetchUserFormAccess(userDetails.userName);

            toast({ variant: "default", title: "Success", description: `Saved ${selectedForms.length} rights items to user ${userDetails.userName}`, duration: 3000 });
        } catch (error) {
            console.error("Save error:", error);
            toast({ variant: "destructive", title: "Save failed", description: error.message || "Failed to save user access rights" });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setUserDetails({ userName: "", userId: "" });
        setUserRoles([]);
        setSelectedForms([]);
    };

    const isUserSelected = !!userDetails.userName;

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold">User Rights Management</h1>

            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* User Details */}
                <Card className="border flex-grow">
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Select User */}
                            <div className="col-span-1">
                                <Label>User Name</Label>
                                <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                                            {userDetails.userName || "Select user"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] h-[200px] p-0 z-50">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search user" value={userSearchInput} onValueChange={setUserSearchInput}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No users found.</CommandEmpty>
                                                <CommandGroup>
                                                    {loadingUsers ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Loading users...
                                                        </div>
                                                    ) : (
                                                        usersList.filter(user =>
                                                            user.userName.toLowerCase().includes(userSearchInput.toLowerCase())
                                                        ).map((user) => (
                                                            <CommandItem
                                                                key={`user-${user.userName}`} value={user.userName} onSelect={() => handleUserSelect(user)}
                                                            >
                                                                {user.userName}
                                                                <Check className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    userDetails.userName === user.userName ? "opacity-100" : "opacity-0"
                                                                )} />
                                                            </CommandItem>
                                                        ))
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Assigned Roles */}
                            <div className="col-span-2">
                                <Label>Assigned Roles</Label>
                                <div className="border rounded-md h-32 overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[150px]">Role Name</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {userRoles.length > 0 ? (
                                                userRoles.map((role, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{role.ROLE_NAME}</TableCell>
                                                        <TableCell>{role.DESCRIPTION || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                                                        {userDetails.userName ? "No roles assigned to this user." : "Select a user to view roles."}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Buttons */}
                <div className="flex gap-4 md:self-end md:pb-6">
                    <Button variant="outline" onClick={handleCancel} disabled={!isUserSelected}>Cancel</Button>

                    <Button onClick={handleSave} disabled={saving || !isUserSelected || selectedForms.length === 0}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Rights */}
                <Card className={cn("border", !isUserSelected && "opacity-50 pointer-events-none")}>
                    <CardTitle className="text-lg font-semibold pl-6 pt-4">Add Access Rights</CardTitle>
                    <CardContent className="p-6 pt-2">
                        <div className="flex flex-col space-y-4">
                            <div className="border rounded-md h-80 overflow-hidden">
                                {loadingForms ? (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-sm text-muted-foreground">Loading forms...</span>
                                    </div>
                                ) : filteredTreeData.length > 0 ? (
                                    <ScrollArea className="h-full w-full p-2">
                                        <TreeView
                                            data={filteredTreeData} onSelect={handleFormSelect}
                                            selectedItems={selectedForms} useCheckbox={true}
                                            onSelectAll={handleBulkFormsSelection} isSelectAllMode={true}
                                        />
                                    </ScrollArea>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-sm text-muted-foreground">All available forms are already added</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Remove Rights */}
                <Card className={cn("border", !isUserSelected && "opacity-50 pointer-events-none")}>
                    <CardTitle className="text-lg font-semibold pl-6 pt-4">Remove Access Rights</CardTitle>
                    <CardContent className="p-6 pt-2">
                        <div className="flex flex-col space-y-4">
                            <div className="border rounded-md h-80 overflow-hidden">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-sm text-muted-foreground">Loading assigned forms...</span>
                                    </div>
                                ) : assignedFormsTreeData.length > 0 ? (
                                    <ScrollArea className="h-full w-full p-2">
                                        <TreeView
                                            data={assignedFormsTreeData} onRemove={handleRemoveSelectedForm}
                                            isRemovable={true} useCheckbox={true}
                                            onSelectAll={handleRemoveMultipleSelectedForms} isSelectAllMode={true}
                                        />
                                    </ScrollArea>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-sm text-muted-foreground">No forms assigned to this user</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between">
                                <span>Assigned Forms ({selectedForms.length})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserRights;