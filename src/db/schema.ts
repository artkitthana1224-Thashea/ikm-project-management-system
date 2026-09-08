import { pgTable, text, timestamp, boolean, varchar, uuid } from 'drizzle-orm/pg-core';

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  isGroup: boolean('is_group').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMembers = pgTable('chat_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(), // using the employee id (e.g. E-001)
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  senderId: varchar('sender_id', { length: 255 }).notNull(), // employee id
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  column: varchar('column', { length: 50 }).notNull().default('todo'),
  projectId: varchar('project_id', { length: 50 }),
  priority: varchar('priority', { length: 20 }).default('Medium'),
  dueDate: timestamp('due_date'),
  assigneeId: varchar('assignee_id', { length: 255 }), // employee id
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(), // employee id
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskAttachments = pgTable('task_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(), // employee id
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  fileSize: varchar('file_size', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
