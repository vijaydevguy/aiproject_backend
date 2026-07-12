import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AQ.Ab8RN6LbCpaVaXwrar9jDui81a30gjWv0FSS0Dk1xYcd8-TEBw",
  //   apiKey: process.env.GEMINI_KEY,
});

export const processBatch = async (rows) => {
  try {
    const prompt = `
You are an expert CRM data extraction AI.

Your task is to convert uploaded spreadsheet records into the following CRM schema.

Schema:
{
  created_at,
  name,
  email,
  country_code,
  mobile_without_country_code,
  company,
  city,
  state,
  country,
  lead_owner,
  crm_status,
  crm_note,
  data_source,
  possession_time,
  description
}

Rules:

1. Map any column names intelligently.
2. Skip records without email and mobile.
3. First email only.
4. First mobile only.
5. Extra emails/mobile numbers go inside crm_note.
6. Allowed crm_status:
GOOD_LEAD_FOLLOW_UP
DID_NOT_CONNECT
BAD_LEAD
SALE_DONE

7. Allowed data_source:
leads_on_demand
meridian_tower
eden_park
varah_swamy
sarjapur_plots

8. Return ONLY JSON array.
9. Do not explain anything.

Records:
${JSON.stringify(rows)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text.trim();

    return JSON.parse(text);
  } catch (err) {
    throw new Error(err.message);
  }
};
