import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import { ThinkingLevel, Type } from '@google/genai';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { getGeminiClient } from './src/lib/gemini.ts';
import { checkDbConnection } from './src/db/index.ts';
import {
  addChatMessageRecord,
  createAnnouncementRecord,
  createAssignmentRecord,
  createChatSessionRecord,
  createStudyDocumentRecord,
  deleteStudyDocumentRecord,
  getWorkspaceData,
  markAllAnnouncementsRead,
  updateAnnouncementRecord,
  updateAssignmentRecord,
  updateDiscussionRecord,
  updateStudyDocumentSummary,
  updateStudyGoalRecord,
  updateWaiverStatus,
} from './src/db/repository.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'edutrack-ai' });
});

// Database & Supabase connectivity status endpoint
app.get('/api/db/health', async (_req, res) => {
  try {
    const status = await checkDbConnection();
    if (status.connected) {
      res.json({
        status: 'healthy',
        database: status.source,
        latencyMs: status.latencyMs,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        error: status.message,
        hint: 'Check DATABASE_URL or Supabase credentials in your .env file.',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =========================================================================
// AUTHENTICATED CLOUD SQL POSTGRESQL ENDPOINTS
// =========================================================================

app.get('/api/db/workspace', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getWorkspaceData(req.user!.uid);
    res.json(data);
  } catch (error: any) {
    console.error('GET /api/db/workspace failed:', error);
    res.status(500).json({ error: error.message || 'Failed to load workspace' });
  }
});

app.post('/api/db/assignments', requireAuth, async (req: AuthRequest, res) => {
  try {
    const created = await createAssignmentRecord({
      ...req.body,
      userUid: req.user!.uid,
    });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create assignment' });
  }
});

app.patch('/api/db/assignments/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateAssignmentRecord(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update assignment' });
  }
});

app.post('/api/db/announcements', requireAuth, async (req: AuthRequest, res) => {
  try {
    const created = await createAnnouncementRecord(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create announcement' });
  }
});

app.patch('/api/db/announcements/read-all', requireAuth, async (_req: AuthRequest, res) => {
  try {
    const result = await markAllAnnouncementsRead();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark announcements read' });
  }
});

app.patch('/api/db/announcements/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateAnnouncementRecord(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update announcement' });
  }
});

app.post('/api/db/documents', requireAuth, async (req: AuthRequest, res) => {
  try {
    const created = await createStudyDocumentRecord({
      ...req.body,
      userUid: req.user!.uid,
    });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create study document' });
  }
});

app.patch('/api/db/documents/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateStudyDocumentSummary(id, req.body.summaryJson);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update study document' });
  }
});

app.delete('/api/db/documents/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteStudyDocumentRecord(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete study document' });
  }
});

app.post('/api/db/chat/sessions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const created = await createChatSessionRecord({
      userUid: req.user!.uid,
      title: req.body.title || 'New Academic Session',
      courseScopeJson: req.body.courseScopeJson || ['CS301', 'MATH240', 'BIO110', 'ENG205'],
      deepReasoning: Boolean(req.body.deepReasoning ?? true),
    });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create chat session' });
  }
});

app.post('/api/db/chat/messages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const created = await addChatMessageRecord(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to store chat message' });
  }
});

app.patch('/api/db/study-goal', requireAuth, async (req: AuthRequest, res) => {
  try {
    const updated = await updateStudyGoalRecord(req.user!.uid, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update study goal' });
  }
});

app.patch('/api/db/waivers/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateWaiverStatus(id, req.body.status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update waiver' });
  }
});

app.patch('/api/db/discussions/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateDiscussionRecord(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update discussion' });
  }
});

// =========================================================================
// SERVER-SIDE GEMINI AI ENDPOINTS (@google/genai)
// =========================================================================

app.post('/api/ai/study-plan', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { assignments: activeAssignments } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Given these academic tasks: ${JSON.stringify(activeAssignments || [])}. Generate the optimal next single Focus Window recommendation for a university student right now.`,
      config: {
        systemInstruction:
          'You are an adaptive academic planner. Return concise JSON for the highest-priority focus session.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            estimatedMins: { type: Type.INTEGER },
            cognitiveLoad: { type: Type.STRING },
            weightLabel: { type: Type.STRING },
          },
        },
      },
    });
    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json(parsed);
  } catch (error: any) {
    console.error('POST /api/ai/study-plan error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study plan' });
  }
});

app.post('/api/ai/quick-ask', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { prompt, context } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Course Context: ${context || 'CS301, MATH240, BIO110, ENG205'}\n\nStudent question: ${prompt}`,
      config: {
        systemInstruction:
          'You are EduTrack AI Study Dock. Give a crisp, high-yield academic answer in 3-5 sentences with clear formulas or step-by-step intuition.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    res.json({ answer: response.text ?? 'Unable to generate response.' });
  } catch (error: any) {
    console.error('POST /api/ai/quick-ask error:', error);
    res.status(500).json({ error: error.message || 'AI request failed' });
  }
});

app.post('/api/ai/summarize', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { fileName, courseCode, rawContent } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze this course document (${fileName} for ${courseCode}) and produce a structured Academic Synthesis Report:\n\n${rawContent}`,
      config: {
        systemInstruction:
          'Return structured JSON matching the synthesis report format with executive overview, 3 key concepts, 2 formulas, 3 revision checklist items, and 1 high-yield exam takeaway.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidence: { type: Type.STRING },
            readingTime: { type: Type.STRING },
            executiveOverview: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kicker: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  section: { type: Type.STRING },
                },
                required: ['kicker', 'title', 'description', 'section'],
              },
            },
            formulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  latex: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'latex', 'description'],
              },
            },
            checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  checked: { type: Type.BOOLEAN },
                },
                required: ['id', 'title', 'detail', 'checked'],
              },
            },
            examTakeaway: { type: Type.STRING },
          },
          required: [
            'confidence',
            'readingTime',
            'executiveOverview',
            'keyConcepts',
            'formulas',
            'checklist',
            'examTakeaway',
          ],
        },
      },
    });
    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json(parsed);
  } catch (error: any) {
    console.error('POST /api/ai/summarize error:', error);
    res.status(500).json({ error: error.message || 'Document summarization failed' });
  }
});

app.post('/api/ai/generate-hint', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { title, description, rubric } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Generate an intelligent academic hint and common edge-case warning for this assignment.\nTitle: ${title}\nDescription: ${description}\nRubric: ${JSON.stringify(rubric || [])}`,
      config: {
        systemInstruction:
          'Return a single high-yield pedagogical hint (max 2 sentences) addressing common student failure modes for this assignment.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    res.json({ hint: response.text?.trim() || 'Review foundational invariants before submission.' });
  } catch (error: any) {
    console.error('POST /api/ai/generate-hint error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate hint' });
  }
});

// Vite SSR / Static serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduTrack AI server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
