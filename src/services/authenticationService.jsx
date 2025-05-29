import { createSoapEnvelope, parseDataModelResponse } from "../utils/soapUtils";
import { doConnection } from "./connectionService";
import {
  verifyauthenticationPayload
} from "./payloadBuilders";
import soapClient from "./soapClient";

// verifyauthentication.
export const verifyauthentication = async (
  userDetails,
  email,
  dynamicClientUrl
) => {
  const payload = verifyauthenticationPayload(userDetails);

  const doConnectionResponse = await doConnection(email, dynamicClientUrl);
  if (doConnectionResponse === "ERROR") {
    throw new Error("Connection failed: Unable to authenticate.");
  }

  const SOAP_ACTION = "http://tempuri.org/verifyauthentication";
  const soapBody = createSoapEnvelope("verifyauthentication", payload);

  const soapResponse = await soapClient(
    dynamicClientUrl,
    SOAP_ACTION,
    soapBody
  );
  const parsedResponse = parseDataModelResponse(
    soapResponse,
    "verifyauthentication"
  );
  return parsedResponse;
};

export const isAdminDmsService = async (payload, email, dynamicClientUrl) => {
  const doConnectionResponse = await doConnection(email, dynamicClientUrl);
  if (doConnectionResponse === "ERROR") {
    throw new Error("Connection failed: Unable to authenticate.");
  }

  const SOAP_ACTION = "http://tempuri.org/DMS_Is_Admin_User";
  const soapBody = createSoapEnvelope("DMS_Is_Admin_User", payload);

  const soapResponse = await soapClient(
    dynamicClientUrl,
    SOAP_ACTION,
    soapBody
  );
  const parsedResponse = parseDataModelResponse(
    soapResponse,
    "DMS_Is_Admin_User"
  );
  return parsedResponse;
};
