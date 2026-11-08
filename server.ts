import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Multi-Turn AI PSLF Counselor Chat Endpoint with Google Search Grounding
 * Uses gemini-3.8-flash with { googleSearch: {} }
 */
app.post('/api/pslf-assistant/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], borrowerContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context-rich system instruction from active Steps 1-3
    const contextStr = borrowerContext
      ? `
CURRENT BORROWER ACTIVE PORTFOLIO CONTEXT:
- Borrower: ${borrowerContext.borrowerName || 'Borrower'} (${borrowerContext.occupation || 'Public Service'})
- Employer: ${borrowerContext.employerName || 'Public Employer'}
- Employer Category: ${borrowerContext.employerCategory || '501(c)(3) Non-Profit'}
- Contracted Hours: ${borrowerContext.hoursPerWeek || 40} hrs/week (Full-Time >= 30 hrs: ${borrowerContext.isFullTime ? 'YES' : 'NO'})
- Employer EIN: ${borrowerContext.ein || 'XX-XXXXXXX'}
- Employer Status: ${borrowerContext.employerStatus || 'Qualifies'}
- Total Federal Debt: $${Number(borrowerContext.totalDebt || 0).toLocaleString()}
- Direct Loans (Natively PSLF-Eligible): $${Number(borrowerContext.directBalance || 0).toLocaleString()}
- Legacy Non-Direct Loans (FFEL / Perkins): $${Number(borrowerContext.nonDirectBalance || 0).toLocaleString()} (${borrowerContext.nonDirectCount || 0} loans requiring Direct Consolidation)
- Direct Parent PLUS Loans Present: ${borrowerContext.hasParentPlus ? 'YES (restricted to ICR or Double Consolidation)' : 'NO'}
- Household Finances: AGI $${Number(borrowerContext.agi || 0).toLocaleString()}, Family Size ${borrowerContext.familySize || 1}, Tax Filing Status: ${borrowerContext.filingStatus || 'single'}, State Region: ${borrowerContext.region || 'lower48'}
- Recommended Repayment Strategy: Statutory Income-Based Repayment (IBR - 20 U.S.C. § 1098e)
- PSLF Readiness Score: ${borrowerContext.readinessScore || '0'}/100 (${borrowerContext.readinessStatus || 'Needs Action'})
`
      : 'No active borrower context provided.';

    const systemInstruction = `You are an elite, independent student loan counselor specializing in federal debt relief programs and Public Service Loan Forgiveness (PSLF) under the Higher Education Act (HEA 20 U.S.C. § 1087e(m)) and 34 CFR § 685.219.

${contextStr}

COUNSELING STANDARDS & 2026 REGULATORY RULES:
1. Ground your guidance directly in the borrower's active context above whenever relevant (their employer, loan mix, and income).
2. Employer Eligibility:
   - 501(c)(3) non-profits and government agencies (federal, state, municipal, public school districts, military) qualify automatically.
   - Other non-profit organizations (e.g. 501(c)(4)-(19)) are conditional: qualify ONLY if their primary service is public health, emergency management, safety, or education.
   - For-profit corporations never qualify, even if contracted to work on a public job site.
   - Full-Time standard: average of at least 30 hours per week (or combination of concurrent qualifying employers).
3. Loan Eligibility & Consolidation:
   - Direct Loans (Sub, Unsub, Grad PLUS, Direct Consolidation) qualify natively.
   - FFEL (Stafford) and Federal Perkins loans will NEVER receive PSLF credits unless consolidated into a Direct Consolidation Loan on StudentAid.gov.
   - Under current permanent regulations, consolidating loans does NOT reset qualifying payments to zero; it results in a weighted average payment count.
4. Repayment Plans & Current Litigation:
   - Recommend statutory Income-Based Repayment (IBR - 20 U.S.C. § 1098e). IBR was enacted by Congress and is immune to court injunctions, legally guaranteeing qualifying PSLF credit.
   - Note that SAVE is currently blocked/inactive due to federal court injunctions.
5. Litigation & Administrative Forbearance Note (PSLF Buyback):
   - Months spent in court-ordered administrative pauses do not automatically count toward 120 payments.
   - Once a borrower reaches 120 months of certified qualifying public service employment, they can submit an official "PSLF Buyback" request on StudentAid.gov to buy back those paused months at their historical IDR rate for immediate full discharge.
6. Edge Cases:
   - AmeriCorps / Peace Corps: Full-time service qualifies; Segal Education Awards can be used to make qualifying lump-sum payments.
   - Married Filing Separately (MFS): Excludes spouse's income under IDR plans so monthly payments are based solely on borrower's AGI.
   - Parent PLUS Double Consolidation: Workaround via multi-step consolidation across multiple servicers to unlock 10% IBR/SAVE instead of 20% ICR.
   - Employer Transitions: Gaps between public service jobs do not erase previously certified credits.

Use your Google Search tool whenever the question touches on current litigation status, court injunction dates, Department of Education announcements, servicer operational status, or recently updated policies.
Provide concise, authoritative, practical, and empathetic responses with clean formatting and bullet points.`;

    // Map conversation history for multi-turn chat
    const contents: any[] = [];
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.role === 'model' || msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    let response;
    let webSources: { uri: string; title: string }[] = [];

    try {
      // First try with Google Search Grounding enabled
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      // Extract Grounding Chunks with web citations
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri) {
            webSources.push({
              uri: chunk.web.uri,
              title: chunk.web.title || chunk.web.uri,
            });
          }
        }
      }
    } catch (groundingError) {
      console.warn('Google Search grounding fallback:', groundingError);
      // Fallback without tools if grounding error occurs
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });
    }

    const reply = response.text || 'I could not generate guidance at this time. Please try asking again.';
    return res.json({ reply, webSources });
  } catch (error: any) {
    console.error('Error in PSLF Assistant API:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to contact AI PSLF Counselor',
    });
  }
});

/**
 * Nearby PSLF-Qualifying Public Service Employers Finder with Google Maps Grounding
 * Uses gemini-3.8-flash with { googleMaps: {} }
 * Extracts URLs from groundingChunks and returns links for the web app
 */
app.post('/api/pslf-assistant/nearby-employers', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    const locationQuery = query || 'public school districts, 501(c)(3) hospitals, municipal government agencies, and public universities';

    const systemInstruction = `You are a public service career counselor and PSLF specialist.
The user is looking for qualifying Public Service employers (such as public school districts, non-profit 501(c)(3) hospitals/health centers, municipal/county government offices, state universities, and civil agencies) that qualify for Public Service Loan Forgiveness under 34 CFR § 685.219.
Identify and describe the premier qualifying public service employers and public agencies in or near the requested location.
For each employer:
- State their official name and why their tax/charter status qualifies (e.g., 501(c)(3) non-profit or government agency)
- Mention the types of public service careers they support
- Confirm that full-time employment (>= 30 hrs/wk) at these organizations earns PSLF credit.`;

    const config: any = {
      systemInstruction,
      tools: [{ googleMaps: {} }],
    };

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      };
    }

    const promptText = `Find qualifying PSLF public service employers near: ${locationQuery}. Include public school district administration centers, 501(c)(3) hospital systems, county/city government headquarters, and public university campuses.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config,
    });

    // Extract Maps Grounding URLs and review snippets as required
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapPlaces: {
      title: string;
      uri: string;
      snippet?: string;
    }[] = [];

    for (const chunk of chunks) {
      if ((chunk as any).maps?.uri) {
        const mapsObj = (chunk as any).maps;
        let snippet = '';
        if (mapsObj.placeAnswerSources?.reviewSnippets && mapsObj.placeAnswerSources.reviewSnippets.length > 0) {
          snippet = mapsObj.placeAnswerSources.reviewSnippets[0];
        }
        mapPlaces.push({
          title: mapsObj.title || 'Qualifying Public Service Employer',
          uri: mapsObj.uri,
          snippet,
        });
      }
    }

    return res.json({
      text: response.text || 'Found qualifying public service employers in this area.',
      mapPlaces,
    });
  } catch (error: any) {
    console.error('Error in Nearby Employers Maps Grounding API:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to search nearby qualifying employers',
    });
  }
});

/**
 * Fast Employer Classifier using gemini-3.1-flash-lite for instant responses
 */
app.post('/api/pslf-assistant/quick-classify', async (req, res) => {
  try {
    const { employerName } = req.body;
    if (!employerName) {
      return res.status(400).json({ error: 'Employer name is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Classify if this organization is likely a PSLF qualifying employer (Government or 501(c)(3) Non-Profit) or Ineligible: "${employerName}". Reply in 1 concise sentence explaining why.`,
    });

    return res.json({
      classification: response.text || 'Unable to classify.',
    });
  } catch (error: any) {
    console.error('Error in quick classify:', error);
    return res.status(500).json({ error: 'Classification failed' });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`PSLF Counselor server listening on port ${port}`);
});
