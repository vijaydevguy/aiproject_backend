 import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY,
});

const MODEL_FALLBACKS = [
  "gemini-3.5-flash",
  "gemini-3.5-pro",
  "gemini-3.0-mini",
];
const MAX_ATTEMPTS = 4;

const buildPrompt = (rows) => `
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

const extractErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error?.message) return err.error.message;
  return JSON.stringify(err);
};

const isRetryableError = (message) => /high demand|temporar|unavailable|503|429|rate limit/i.test(message);

export const processBatch = async (rows) => {
  const prompt = buildPrompt(rows);
  let lastError;

  for (const model of MODEL_FALLBACKS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const text = response?.text?.trim();
        if (!text) {
          throw new Error(`Empty response from model ${model}`);
        }

        return JSON.parse(text);
      } catch (err) {
        lastError = err;
        const errorMessage = extractErrorMessage(err);
        const retryable = isRetryableError(errorMessage);

        if (attempt < MAX_ATTEMPTS && retryable) {
          continue;
        }

        if (retryable) {
          break;
        }

        throw new Error(`Model ${model} failed: ${errorMessage}`);
      }
    }
  }

  throw new Error(`All models failed after ${MAX_ATTEMPTS} attempts each. Last error: ${extractErrorMessage(lastError)}`);
};
