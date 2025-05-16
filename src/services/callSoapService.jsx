import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import GlobalVariables from "../iStServices/GlobalVariables";

const NAMESPACE = "http://tempuri.org/";

const buildSoapEnvelope = (methodName, paramXML) =>
  `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${methodName} xmlns="${NAMESPACE}">
      ${paramXML}
    </${methodName}>
  </soap:Body>
</soap:Envelope>`;

const callSoapServiceforMethods = async (url, methodName, parameterDetails) => {
  const paramXML = Object.entries(parameterDetails)
    .map(([key, value]) => `<${key}>${value}</${key}>`)
    .join("");

  const soapEnvelope = buildSoapEnvelope(methodName, paramXML);
  const soapAction = `"${NAMESPACE}${methodName}"`;

  try {
    const { data } = await axios.post(url, soapEnvelope, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: soapAction,
      },
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const response = parser.parse(data);

    const body = response["soap:Envelope"]["soap:Body"];
    const methodResponse = body[`${methodName}Response`];
    const result = methodResponse[`${methodName}Result`];

    return result;
  } catch (error) {
    console.error("❌ SOAP error:", error.message);
    if (error.response) {
      console.error("🔻 Response status:", error.response.status);
      console.error("🔻 Response body:", error.response.data);
    }
    throw error;
  }
};

export const callSoapService = async (url, methodName, parameterDetails) => {
  try {
    if (
      GlobalVariables.doConnectionParameter &&
      typeof GlobalVariables.doConnectionParameter === "object"
    ) {
      await callSoapServiceforMethods(
        url,
        "doConnection",
        GlobalVariables.doConnectionParameter
      );
    } else {
      console.warn("⚠️ doConnectionParameter is missing or invalid.");
    }

    const result = await callSoapServiceforMethods(
      url,
      methodName,
      parameterDetails
    );
    return result;
  } catch (error) {
    console.error("SOAP error (main call):", error);
    throw error;
  }
};
