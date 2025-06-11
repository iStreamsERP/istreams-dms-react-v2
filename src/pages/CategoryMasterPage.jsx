import AccessDenied from "@/components/AccessDenied";
import { CategoryCreationModal } from "@/components/dialog/CategoryCreationModal";
import GlobalSearchInput from "@/components/GlobalSearchInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { callSoapService } from "@/services/callSoapService";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BarLoader, PacmanLoader } from "react-spinners";

const CategoryMasterPage = () => {
  const { userData } = useAuth();
  const { toast } = useToast();

  const [userRights, setUserRights] = useState("");
  const [rightsChecked, setRightsChecked] = useState(false);

  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [mode, setMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserRights();
    fetchAllProductsData();
  }, []);

  const fetchUserRights = async () => {
    try {
      const userType = userData.isAdmin ? "ADMINISTRATOR" : "USER";
      const payload = {
        UserName: userData.userName,
        FormName: "DMS-CATEGORYMASTER",
        FormDescription: "Category Master",
        UserType: userType,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_CheckRights_ForTheUser",
        payload
      );

      setUserRights(response);
    } catch (error) {
      console.error("Failed to fetch user rights:", error);
      toast({
        variant: "destructive",
        title: error,
      });
    } finally {
      setRightsChecked(true);
    }
  };

  const fetchAllProductsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        DataModelName: "SYNM_DMS_DOC_CATEGORIES",
        WhereCondition: "",
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );

      setTableList(response);
    } catch (error) {
      setError(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const result = window.confirm(
      "Are you sure you want to delete? This action cannot be undone."
    );

    if (!result) {
      return;
    }

    try {
      const payload = {
        UserName: userData.userEmail,
        DataModelName: "SYNM_DMS_DOC_CATEGORIES",
        WhereCondition: `CATEGORY_NAME = '${item.CATEGORY_NAME}'`,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_DeleteData",
        payload
      );

      toast({
        variant: "destructive",
        title: response,
      });

      fetchAllProductsData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: error?.message || "Unknown error occurred.",
      });
    }
  };

  const handleCreate = () => {
    setMode("create");
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setMode("edit");
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: "CATEGORY_NAME",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0"
        >
          Category Name
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className="capitalize"
          style={{
            width: 350,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={row.getValue("CATEGORY_NAME") || "-"}
        >
          {row.getValue("CATEGORY_NAME") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "DISPLAY_NAME",
      header: () => (
        <p className="truncate" style={{ width: 350 }}>
          Display Name
        </p>
      ),
      cell: ({ row }) => (
        <div
          className="capitalize"
          style={{
            width: 350,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={row.getValue("DISPLAY_NAME") || "-"}
        >
          {row.getValue("DISPLAY_NAME") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div style={{ width: 40 }}>Action</div>,
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleEdit(item)}
                className="flex items-center gap-1"
              >
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 flex items-center gap-1"
                onClick={() => handleDelete(item)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fuzzyFilter = (row, columnId, filterValue) => {
    const value = row.getValue(columnId);
    return String(value || "")
      .toLowerCase()
      .includes(filterValue.toLowerCase());
  };

  const table = useReactTable({
    data: tableList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="flex flex-col gap-y-4">
      {!rightsChecked ? (
        <div className="flex justify-center items-start">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : userRights !== "Allowed" ? (
        <AccessDenied />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 items-center">
            <GlobalSearchInput
              value={globalFilter}
              onChange={setGlobalFilter}
            />

            <div className="flex items-center gap-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <Settings2 /> View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={handleCreate}>
                Create
                <Plus />
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <CategoryCreationModal
                    mode={mode}
                    selectedItem={selectedItem}
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      fetchAllProductsData();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <PacmanLoader color="#6366f1" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-red-500"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryMasterPage;
