import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.js';
import { messages, chats, chatMembers, tasks, taskComments, taskAttachments } from './src/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

// In-memory presence store initialized with defaults
const userPresence: Record<string, { status: 'online' | 'busy' | 'away' | 'offline'; lastSeen: string }> = {
  'U-001': { status: 'online', lastSeen: new Date().toISOString() },
  'E-001': { status: 'online', lastSeen: new Date().toISOString() },
  'E-002': { status: 'busy', lastSeen: new Date().toISOString() },
  'E-003': { status: 'online', lastSeen: new Date().toISOString() },
  'E-004': { status: 'offline', lastSeen: new Date().toISOString() },
  'E-005': { status: 'online', lastSeen: new Date().toISOString() },
  'E-006': { status: 'away', lastSeen: new Date().toISOString() },
  'E-007': { status: 'online', lastSeen: new Date().toISOString() },
  'E-008': { status: 'offline', lastSeen: new Date().toISOString() },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', sql: !!process.env.SQL_HOST });
  });

  // --- Presence APIs ---
  app.get('/api/presence', (req, res) => {
    res.json(userPresence);
  });

  app.post('/api/presence', (req, res) => {
    const { userId, status } = req.body;
    if (userId) {
      userPresence[userId] = {
        status: status || 'online',
        lastSeen: new Date().toISOString(),
      };
    }
    res.json({ success: true, presence: userPresence });
  });

  // --- Chat APIs ---
  app.get('/api/messages/:chatId', async (req, res) => {
    try {
      const result = await db.select()
        .from(messages)
        .where(eq(messages.chatId, req.params.chatId))
        .orderBy(messages.createdAt);
      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const { chatId, senderId, content } = req.body;
      const [msg] = await db.insert(messages).values({
        chatId,
        senderId,
        content
      }).returning();
      res.json(msg);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to insert message' });
    }
  });

  app.get('/api/chats', async (req, res) => {
    try {
      const chatList = await db.select().from(chats).orderBy(desc(chats.createdAt));
      // Fetch members for each chat
      const allMembers = await db.select().from(chatMembers);
      
      const chatsWithMembers = chatList.map(c => {
        const members = allMembers.filter(m => m.chatId === c.id).map(m => m.userId);
        return {
          ...c,
          members
        };
      });
      res.json(chatsWithMembers);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });

  app.post('/api/chats', async (req, res) => {
    try {
      const { id, name, isGroup, members } = req.body;
      const [chat] = await db.insert(chats).values({
        id: id || undefined,
        name,
        isGroup: isGroup || false
      }).onConflictDoNothing().returning();

      const activeChatId = chat ? chat.id : id;

      // If initial members provided, insert into chat_members
      if (activeChatId && Array.isArray(members) && members.length > 0) {
        for (const userId of members) {
          await db.insert(chatMembers).values({
            chatId: activeChatId,
            userId
          }).catch(() => {});
        }
      }
      
      res.json(chat || { id: activeChatId, name, isGroup });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to insert chat' });
    }
  });

  // Chat Members APIs (Approval / Invite / Remove)
  app.get('/api/chats/:chatId/members', async (req, res) => {
    try {
      const members = await db.select()
        .from(chatMembers)
        .where(eq(chatMembers.chatId, req.params.chatId));
      res.json(members);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch chat members' });
    }
  });

  app.post('/api/chats/:chatId/members', async (req, res) => {
    try {
      const { userIds } = req.body;
      const chatId = req.params.chatId;
      const usersToAdd = Array.isArray(userIds) ? userIds : [req.body.userId];
      
      const added = [];
      for (const uid of usersToAdd) {
        if (!uid) continue;
        const [member] = await db.insert(chatMembers).values({
          chatId,
          userId: uid
        }).returning();
        if (member) added.push(member);
      }
      res.json({ success: true, added });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add chat members' });
    }
  });

  app.delete('/api/chats/:chatId/members/:userId', async (req, res) => {
    try {
      await db.delete(chatMembers)
        .where(and(eq(chatMembers.chatId, req.params.chatId), eq(chatMembers.userId, req.params.userId)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  });

  // --- Kanban Tasks APIs ---
  app.get('/api/tasks', async (req, res) => {
    try {
      const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
      // Fetch comment counts and attachment counts
      const allComments = await db.select().from(taskComments);
      const allAttachments = await db.select().from(taskAttachments);

      const enrichedTasks = result.map(t => {
        const taskCommentsList = allComments.filter(c => c.taskId === t.id);
        const taskAttachmentsList = allAttachments.filter(a => a.taskId === t.id);
        return {
          ...t,
          commentsCount: taskCommentsList.length,
          attachmentsCount: taskAttachmentsList.length,
          recentComments: taskCommentsList.slice(-2),
          attachments: taskAttachmentsList
        };
      });

      res.json(enrichedTasks);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const { title, description, column, projectId, priority, dueDate, assigneeId } = req.body;
      const [task] = await db.insert(tasks).values({
        title: title || 'Untitled Task',
        description: description || '',
        column: column || 'todo',
        projectId: projectId || 'General',
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null
      }).returning();
      res.json({ ...task, commentsCount: 0, attachmentsCount: 0, attachments: [], recentComments: [] });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { title, description, column, projectId, priority, dueDate, assigneeId } = req.body;
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (column !== undefined) updateData.column = column;
      if (projectId !== undefined) updateData.projectId = projectId;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;

      const [updatedTask] = await db.update(tasks)
        .set(updateData)
        .where(eq(tasks.id, req.params.id))
        .returning();

      res.json(updatedTask);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.put('/api/tasks/:id/column', async (req, res) => {
    try {
      const { column } = req.body;
      const [task] = await db.update(tasks).set({ column }).where(eq(tasks.id, req.params.id)).returning();
      res.json(task);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update task column' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      // First delete comments and attachments
      await db.delete(taskComments).where(eq(taskComments.taskId, taskId));
      await db.delete(taskAttachments).where(eq(taskAttachments.taskId, taskId));
      // Delete task
      const [deleted] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();
      res.json({ success: true, deleted });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  app.get('/api/tasks/:id/comments', async (req, res) => {
    try {
      const result = await db.select().from(taskComments).where(eq(taskComments.taskId, req.params.id)).orderBy(taskComments.createdAt);
      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch task comments' });
    }
  });

  app.post('/api/tasks/:id/comments', async (req, res) => {
    try {
      const { userId, content } = req.body;
      const [comment] = await db.insert(taskComments).values({
        taskId: req.params.id,
        userId,
        content
      }).returning();
      res.json(comment);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create task comment' });
    }
  });

  app.delete('/api/tasks/:taskId/comments/:id', async (req, res) => {
    try {
      await db.delete(taskComments).where(eq(taskComments.id, req.params.id));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  app.get('/api/tasks/:id/attachments', async (req, res) => {
    try {
      const result = await db.select().from(taskAttachments).where(eq(taskAttachments.taskId, req.params.id)).orderBy(taskAttachments.createdAt);
      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch task attachments' });
    }
  });

  app.post('/api/tasks/:id/attachments', async (req, res) => {
    try {
      const { userId, fileName, fileType, fileSize } = req.body;
      const [attachment] = await db.insert(taskAttachments).values({
        taskId: req.params.id,
        userId,
        fileName,
        fileType,
        fileSize
      }).returning();
      res.json(attachment);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add task attachment' });
    }
  });

  app.delete('/api/tasks/:taskId/attachments/:id', async (req, res) => {
    try {
      await db.delete(taskAttachments).where(eq(taskAttachments.id, req.params.id));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

