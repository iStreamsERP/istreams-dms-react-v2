import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronsUpDown, Check, Trash2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { deleteDataModelService, getDataModelService, saveDataService } from '@/services/dataModelService';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { convertDataModelToStringData } from '@/utils/dataModelConverter';

const CategoryAccessPage = () => {
    const [roleDetails, setRoleDetails] = useState({ roleName: "", roleId: "", description: "" });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [rolesList, setRolesList] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);

    const [openRolePopover, setOpenRolePopover] = useState(false);
    const [openDisplayNamePopover, setOpenDisplayNamePopover] = useState(false);

    const [roleSearchInput, setRoleSearchInput] = useState("");
    const [displayNameSearchInput, setDisplayNameSearchInput] = useState("");

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasFetchedData, setHasFetchedData] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);

    const { toast } = useToast();
    const { userData } = useAuth();

    useEffect(() => {
        if (!hasFetchedData && userData?.currentUserLogin && userData?.clientURL) {
            fetchRolesData();
            fetchCategoriesData();
            setHasFetchedData(true);
        }
    }, [userData?.currentUserLogin, userData?.clientURL, hasFetchedData]);

    const fetchRolesData = async () => {
        setLoadingRoles(true);
        try {
            const rolesdetailsData = { DataModelName: "general_roles_master", WhereCondition: "", Orderby: "ROLE_ID" };
            const response = await getDataModelService(rolesdetailsData, userData?.currentUserLogin, userData?.clientURL);
            const formattedRoles = response.map(role => ({ roleName: role.ROLE_NAME?.trim(), roleId: role.ROLE_ID.toString(), description: role.ROLE_DESCRIPTION || "" }));

            setRolesList(formattedRoles);
        } catch (error) {
            toast({ variant: "destructive", title: "Error fetching roles", description: error.message });
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchCategoriesData = async () => {
        setLoadingCategories(true);
        try {
            const categoriesRequestData = { DataModelName: 'SYNM_DMS_DOC_CATEGORIES', WhereCondition: '', Orderby: 'CATEGORY_NAME' };
            const response = await getDataModelService(categoriesRequestData, userData.currentUserLogin, userData.clientURL);

            const categoriesArray = Array.isArray(response) ? response : response?.data || [];
            const formattedCategories = categoriesArray.map((category) => ({ id: category.CATEGORY_ID, name: category.CATEGORY_NAME, disName: category.DISPLAY_NAME, md_name: category.MODULE_NAME }));

            setCategoriesList(formattedCategories);
            setFilteredCategories(formattedCategories);
        } catch (error) {
            setCategoriesList([]);
            setFilteredCategories([]);
            toast({ variant: 'destructive', title: 'Error fetching categories', description: error.message || 'Failed to fetch categories' });
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchRoleCategoryData = async (roleId) => {
        setLoading(true);
        try {
            const requestData = {
                DataModelName: "synm_dms_doc_catg_roles", WhereCondition: `ROLE_ID = '${roleId}'`, Orderby: "CATEGORY_NAME"
            };

            const response = await getDataModelService(requestData, userData?.currentUserLogin, userData?.clientURL);

            if (Array.isArray(response) && response.length > 0) {
                const categoryItems = response.map(item => {
                    const matchingCategory = categoriesList.find(cat => cat.id === item.CATEGORY_ID);

                    return { id: item.CATEGORY_ID, categoryName: item.CATEGORY_NAME || matchingCategory?.name || "", displayName: item.DISPLAY_NAME || matchingCategory?.disName || "", moduleName: item.MODULE_NAME || matchingCategory?.md_name || "" };
                });

                setSelectedCategoryItems(categoryItems);

                if (categoryItems.length > 0) {
                    const firstDisplayName = categoryItems[0].displayName;
                    setSelectedCategory({ disName: firstDisplayName });
                }
            } else {
                setSelectedCategoryItems([]);
                setSelectedCategory(null);
            }
        } catch (error) {
            console.error("Error fetching role categories:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to fetch category assignments for this role" });
            setSelectedCategoryItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setRoleDetails({ roleName: role.roleName, roleId: role.roleId, description: role.description || "" });
        setOpenRolePopover(false);

        fetchRoleCategoryData(role.roleId);
    };

    const handleDisplayNameSelect = (displayName) => {
        setOpenDisplayNamePopover(false);

        const matchingCategories = categoriesList.filter(c => c.disName === displayName);

        if (matchingCategories.length > 0) {
            setSelectedCategory({ disName: displayName });

            const existingItemsMap = {};
            selectedCategoryItems.forEach(item => {
                const key = `${item.categoryName}-${item.moduleName}`;
                existingItemsMap[key] = item;
            });

            const newItems = [...selectedCategoryItems];
            let addedCount = 0;

            matchingCategories.forEach(category => {
                const key = `${category.name}-${category.md_name}`;
                if (!existingItemsMap[key]) {
                    newItems.push({ id: category.id, categoryName: category.name, displayName: category.disName, moduleName: category.md_name });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                setSelectedCategoryItems(newItems);
                toast({
                    title: "Categories Added", description: `Added ${addedCount} new categories to the selection`, duration: 2000
                });
            } else {
                toast({ variant: "default", title: "Info", description: "These categories are already selected", duration: 2000 });
            }
        }
    };


    const handleCategoryDelete = async (categoryId, categoryName) => {
        if (deleting) return;
        setDeleting(true);

        try {
            if (!roleDetails.roleId || !categoryName) {
                throw new Error("Role ID or Category Name not found");
            }

            const deletePayload = { UserName: userData.currentUserLogin, DataModelName: "synm_dms_doc_catg_roles", WhereCondition: `ROLE_ID = '${roleDetails.roleId}' AND CATEGORY_NAME = '${categoryName}'` };

            await deleteDataModelService(deletePayload, userData.currentUserLogin, userData.clientURL);

            setSelectedCategoryItems(prev => prev.filter(item => item.categoryName !== categoryName));

            toast({ title: "Category removed", description: `${categoryName} has been removed successfully`, duration: 2000 });

        } catch (error) {
            console.error("Delete error:", error);
            toast({ variant: "destructive", title: "Error removing category", description: error.message || "Failed to remove category" });
        } finally {
            setDeleting(false);
        }
    };

    const getAllUniqueDisplayNames = () => {
        const uniqueDisplayNames = categoriesList
            .map(cat => cat.disName)
            .filter((value, index, self) => self.indexOf(value) === index && value);

        return uniqueDisplayNames;
    };

    const handleSave = async () => {
        if (!roleDetails.roleId || selectedCategoryItems.length === 0) {
            toast({ variant: "destructive", title: "Validation Error", description: "Please select both a role and at least one category item" });
            return;
        }

        setSaving(true);
        try {
            for (const item of selectedCategoryItems) {
                const categoryRoleData = { ROLE_ID: roleDetails.roleId, CATEGORY_ID: item.id, CATEGORY_NAME: item.categoryName, MODULE_NAME: item.moduleName, DISPLAY_NAME: item.displayName };

                const data = convertDataModelToStringData("synm_dms_doc_catg_roles", categoryRoleData);

                const savePayload = { UserName: userData.currentUserLogin, DModelData: data };

                const saveResponse = await saveDataService(savePayload, userData.currentUserLogin, userData.clientURL);

                if (saveResponse === null || saveResponse === undefined ||
                    (typeof saveResponse === 'object' && saveResponse.error)) {
                    throw new Error(`Failed to save category ${item.categoryName} to role ${roleDetails.roleName}`);
                }
            }

            setRoleDetails({ roleName: "", roleId: "", description: "" });
            setSelectedCategory(null);
            setSelectedCategoryItems([]);

            toast({ variant: "default", title: "Success", description: `Saved ${selectedCategoryItems.length} category items to role ${roleDetails.roleName}`, duration: 3000 });
        } catch (error) {
            console.error("Save error:", error);
            toast({ variant: "destructive", title: "Save failed", description: error.message || "Failed to save category access rights" });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setRoleDetails({ roleName: "", roleId: "", description: "" });
        setSelectedCategory(null);
        setSelectedCategoryItems([]);
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Category Form</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Role Details */}
                <Card className="border">
                    <CardTitle className="text-lg font-semibold pl-4 pt-2">Role Details</CardTitle>

                    <CardContent className="h-auto pl-4 pr-4 space-y-0 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="roleId">Role ID</Label>
                                <Input name="roleId" value={roleDetails.roleId} disabled />
                            </div>

                            <div>
                                <Label>Select Role Name</Label>
                                <Popover open={openRolePopover} onOpenChange={setOpenRolePopover}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between text-left font-normal">
                                            {roleDetails.roleName || "Select role name"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] h-[200px] p-0 z-50">
                                        <Command>
                                            <CommandInput placeholder="Search role name" value={roleSearchInput} onValueChange={setRoleSearchInput} />
                                            <CommandList>
                                                <CommandEmpty>No roles found.</CommandEmpty>
                                                <CommandGroup>
                                                    {loadingRoles ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Loading roles...
                                                        </div>
                                                    ) : (
                                                        rolesList.filter(role =>
                                                            role.roleName.toLowerCase().includes(roleSearchInput.toLowerCase())
                                                        ).map((role) => (
                                                            <CommandItem key={`role-${role.roleId}`} value={role.roleName} onSelect={() => handleRoleSelect(role)} >
                                                                {role.roleName}
                                                                <Check className={cn("ml-auto h-4 w-4", roleDetails.roleId === role.roleId ? "opacity-100" : "opacity-0")} />
                                                            </CommandItem>
                                                        ))
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input name="description" value={roleDetails.description} disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Select Display Name */}
                <Card className={cn("border", !roleDetails.roleId && "opacity-50 pointer-events-none")}>
                    <CardTitle className="text-lg font-semibold pl-4 pt-2 mb-3">Category Selection</CardTitle>

                    <CardContent className="pl-4 pr-4 space-y-4 pb-4">
                        <div>
                            <Label className="block mb-1">Display Name</Label>
                            <Popover open={openDisplayNamePopover} onOpenChange={setOpenDisplayNamePopover}>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='w-full justify-between text-left'>
                                        {'Select Display Name'}
                                        <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-[var(--radix-popover-trigger-width)] h-[200px] p-0 z-50'>
                                    <Command>
                                        <CommandInput placeholder='Search Display Name...' value={displayNameSearchInput} onValueChange={setDisplayNameSearchInput} />
                                        <CommandList>
                                            <CommandGroup>
                                                {loadingCategories ? (
                                                    <div className='p-4 text-center text-sm text-muted-foreground'>
                                                        Loading display names...
                                                    </div>
                                                ) : (
                                                    getAllUniqueDisplayNames()
                                                        .filter(displayName =>
                                                            displayName.toLowerCase().includes(displayNameSearchInput.toLowerCase())
                                                        )
                                                        .map((displayName) => (
                                                            <CommandItem key={`display-name-${displayName}`} value={displayName} onSelect={() => handleDisplayNameSelect(displayName)} >
                                                                <div className='flex justify-between items-center w-full'>
                                                                    <span>{displayName}</span>
                                                                    {selectedCategory?.disName === displayName && (<Check className='h-4 w-4 text-primary' />)}
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

                        <div className="rounded-md border">
                            <ScrollArea className="h-[150px]">
                                {loading ? (
                                    <div className="text-sm text-center py-4">
                                        Loading assigned categories...
                                    </div>
                                ) : selectedCategoryItems.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="text-xs font-medium">
                                                <TableHead>Category Name</TableHead>
                                                <TableHead>Module Name</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedCategoryItems.map((item) => (
                                                <TableRow key={`selected-${item.id}-${item.categoryName}`} className="text-xs">
                                                    <TableCell className="py-0">{item.categoryName}</TableCell>
                                                    <TableCell className="py-0">{item.moduleName}</TableCell>
                                                    <TableCell className="py-0">
                                                        <Button variant="ghost" size="sm" onClick={() => handleCategoryDelete(item.id, item.categoryName)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700" disabled={deleting} >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-sm text-center py-4">
                                        {roleDetails.roleId ? "No categories assigned to this role" : "Select a role to view or add categories"}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end mt-4">
                <Button variant="outline" className="mr-2" onClick={handleCancel}>Cancel</Button>
                <Button disabled={!roleDetails.roleId || saving} onClick={handleSave}>{saving ? "Saving..." : "Save"}</Button>
            </div>
        </div>
    );
};

export default CategoryAccessPage;
