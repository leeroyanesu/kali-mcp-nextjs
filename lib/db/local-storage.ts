import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), ".local_db");

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getFilePath(table: string) {
  ensureDbDir();
  return path.join(DB_DIR, `${table}.json`);
}

function readTable(table: string): any[] {
  const filePath = getFilePath(table);
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeTable(table: string, data: any[]) {
  const filePath = getFilePath(table);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function localSaveChat(data: any) {
  const chats = readTable("chats");
  chats.push({ ...data, createdAt: data.createdAt || new Date() });
  writeTable("chats", chats);
}

export async function localGetChatById(id: string) {
  const chats = readTable("chats");
  return chats.find((c) => c.id === id) || null;
}

export async function localGetChatsByUserId(userId: string) {
  const chats = readTable("chats");
  return chats.filter((c) => c.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function localSaveMessages(messages: any[]) {
  const allMessages = readTable("messages");
  allMessages.push(...messages.map(m => ({ ...m, createdAt: m.createdAt || new Date() })));
  writeTable("messages", allMessages);
}

export async function localGetMessagesByChatId(chatId: string) {
  const allMessages = readTable("messages");
  return allMessages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function localUpdateMessage(id: string, parts: any) {
  const allMessages = readTable("messages");
  const index = allMessages.findIndex((m) => m.id === id);
  if (index !== -1) {
    allMessages[index].parts = parts;
    writeTable("messages", allMessages);
  }
}

export async function localDeleteChatById(id: string) {
  const chats = readTable("chats");
  const messages = readTable("messages");
  
  const filteredChats = chats.filter((c: any) => c.id !== id);
  const filteredMessages = messages.filter((m: any) => m.chatId !== id);
  
  writeTable("chats", filteredChats);
  writeTable("messages", filteredMessages);
}

export async function localDeleteAllChatsByUserId(userId: string) {
  const chats = readTable("chats");
  const messages = readTable("messages");
  
  const userChats = chats.filter((c: any) => c.userId === userId);
  const userChatIds = new Set(userChats.map((c: any) => c.id));
  
  const filteredChats = chats.filter((c: any) => c.userId !== userId);
  const filteredMessages = messages.filter((m: any) => !userChatIds.has(m.chatId));
  
  writeTable("chats", filteredChats);
  writeTable("messages", filteredMessages);
  
  return { deletedCount: userChats.length };
}

export async function localUpdateChatTitle(id: string, title: string) {
  const chats = readTable("chats");
  const index = chats.findIndex((c) => c.id === id);
  if (index !== -1) {
    chats[index].title = title;
    writeTable("chats", chats);
  }
}

export async function localSaveDocument(data: any) {
  const documents = readTable("documents");
  const newDoc = { ...data, createdAt: data.createdAt || new Date() };
  documents.push(newDoc);
  writeTable("documents", documents);
  return [newDoc];
}

export async function localGetDocumentById(id: string) {
  const documents = readTable("documents");
  return documents
    .filter((d) => d.id === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
}

export async function localGetDocumentsById(id: string) {
  const documents = readTable("documents");
  return documents
    .filter((d) => d.id === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function localUpdateDocumentContent(id: string, content: string) {
  const documents = readTable("documents");
  const latest = documents
    .filter((d) => d.id === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
  if (!latest) return [];
  
  latest.content = content;
  writeTable("documents", documents);
  return [latest];
}
