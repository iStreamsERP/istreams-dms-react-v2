// Maps permission keys to their API parameters
export const PERMISSION_MAP = {
  DASHBOARD_FULL_VIEW: {
    service: "DMS_CheckRights_ForTheUser",
    params: (userName, isAdmin) => ({
      UserName: userName,
      FormName: "DMS-DASHBOARDADMIN",
      FormDescription: "Dashboard Full View",
      UserType: isAdmin ? "ADMINISTRATOR" : "USER",
    }),
  },
  VIEW_ALL_DOCS: {
    service: "DMS_CheckRights_ForTheUser",
    params: (userName, isAdmin) => ({
      UserName: userName,
      FormName: "DMS-DOCUMENTLISTVIEWALL",
      FormDescription: "View Rights For All Documents",
      UserType: isAdmin ? "ADMINISTRATOR" : "USER",
    }),
  },
  EDIT_ALL_DOCS: {
    service: "DMS_CheckRights_ForTheUser",
    params: (userName, isAdmin) => ({
      UserName: userName,
      FormName: "DMS-DOCUMENTLISTEDITALL",
      FormDescription: "Edit Rights For All Documents",
      UserType: isAdmin ? "ADMINISTRATOR" : "USER",
    }),
  },
  VIEW_TEAMS_FULL: {
    service: "DMS_CheckRights_ForTheUser",
    params: (userName, isAdmin) => ({
      UserName: userName,
      FormName: "DMS-TEAMSFULLVIEW",
      FormDescription: "View Rights For Entire Team",
      UserType: isAdmin ? "ADMINISTRATOR" : "USER",
    }),
  },
};

// List of all permission keys
export const PERMISSION_KEYS = Object.keys(PERMISSION_MAP);
