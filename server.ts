import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("aura.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    theme_preference TEXT DEFAULT 'system',
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    status_stage TEXT,
    value REAL,
    order_index INTEGER,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    color_code TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lead_tags (
    lead_id TEXT,
    tag_id TEXT,
    PRIMARY KEY(lead_id, tag_id),
    FOREIGN KEY(lead_id) REFERENCES leads(id),
    FOREIGN KEY(tag_id) REFERENCES tags(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    lead_id TEXT,
    title TEXT,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    is_completed INTEGER DEFAULT 0,
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS list_leads (
    list_id TEXT,
    lead_id TEXT,
    PRIMARY KEY(list_id, lead_id),
    FOREIGN KEY(list_id) REFERENCES lists(id),
    FOREIGN KEY(lead_id) REFERENCES leads(id)
  );
`);

// Seed a default user if none exists
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (id, email, full_name) VALUES (?, ?, ?)").run(
    "default-user",
    "user@example.com",
    "Aura User"
  );
}

// Seed sample leads if none exist
const leadCount = db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
if (leadCount.count === 0) {
  const sampleLeads = [
    { id: 'l1', first_name: 'Sarah', last_name: 'Chen', company: 'TechFlow', email: 'sarah@techflow.io', phone: '+1 555-0123', status_stage: 'Lead', value: 5000, order_index: 0, tags: JSON.stringify(['High Priority', 'Tech']) },
    { id: 'l2', first_name: 'Michael', last_name: 'Rodriguez', company: 'BuildScale', email: 'm.rodriguez@buildscale.com', phone: '+1 555-0124', status_stage: 'Contacted', value: 12000, order_index: 0, tags: JSON.stringify(['Enterprise', 'Follow-up']) },
    { id: 'l3', first_name: 'Emma', last_name: 'Wilson', company: 'Brightly', email: 'emma@brightly.co', phone: '+1 555-0125', status_stage: 'Proposal', value: 8500, order_index: 0, tags: JSON.stringify(['SaaS']) },
    { id: 'l4', first_name: 'David', last_name: 'Kim', company: 'Nexus Systems', email: 'david.kim@nexus.com', phone: '+1 555-0126', status_stage: 'Negotiation', value: 25000, order_index: 0, tags: JSON.stringify(['Urgent']) },
    { id: 'l5', first_name: 'Olivia', last_name: 'Taylor', company: 'Starlight', email: 'olivia@starlight.org', phone: '+1 555-0127', status_stage: 'Lead', value: 3200, order_index: 1, tags: JSON.stringify(['New']) },
  ];

  const insertLead = db.prepare(`
    INSERT INTO leads (id, user_id, first_name, last_name, company, email, phone, status_stage, value, order_index, tags)
    VALUES (?, 'default-user', ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((leads) => {
    for (const lead of leads) {
      insertLead.run(lead.id, lead.first_name, lead.last_name, lead.company, lead.email, lead.phone, lead.status_stage, lead.value, lead.order_index, lead.tags);
    }
  });

  transaction(sampleLeads);
}

// Seed sample tags if none exist
const tagCount = db.prepare("SELECT COUNT(*) as count FROM tags").get() as { count: number };
if (tagCount.count === 0) {
  const sampleTags = [
    { id: 't1', name: 'High Priority', color_code: '#ef4444' },
    { id: 't2', name: 'Enterprise', color_code: '#3b82f6' },
    { id: 't3', name: 'Tech', color_code: '#10b981' },
    { id: 't4', name: 'Follow-up', color_code: '#f59e0b' },
    { id: 't5', name: 'SaaS', color_code: '#8b5cf6' },
  ];

  const insertTag = db.prepare("INSERT INTO tags (id, user_id, name, color_code) VALUES (?, 'default-user', ?, ?)");
  for (const tag of sampleTags) {
    insertTag.run(tag.id, tag.name, tag.color_code);
  }
}

// Seed sample tasks if none exist
const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
if (taskCount.count === 0) {
  const sampleTasks = [
    { id: 'tk1', lead_id: 'l1', title: 'Call Sarah Chen', description: 'Discuss TechFlow proposal details', priority: 'high', status: 'todo' },
    { id: 'tk2', lead_id: 'l2', title: 'Follow-up email', description: 'Check in on Michael Rodriguez regarding BuildScale contract', priority: 'medium', status: 'in-progress' },
    { id: 'tk3', lead_id: 'l3', title: 'Review proposal', description: 'Go over Emma Wilson\'s Brightly proposal', priority: 'medium', status: 'todo' },
    { id: 'tk4', lead_id: 'l4', title: 'Schedule demo', description: 'Set up a technical demo with David Kim', priority: 'high', status: 'todo' },
    { id: 'tk5', lead_id: 'l5', title: 'Initial outreach', description: 'Send first contact email to Olivia Taylor', priority: 'low', status: 'completed' },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, user_id, lead_id, title, description, priority, status, is_completed)
    VALUES (?, 'default-user', ?, ?, ?, ?, ?, ?)
  `);

  for (const task of sampleTasks) {
    insertTask.run(task.id, task.lead_id, task.title, task.description, task.priority, task.status, task.status === 'completed' ? 1 : 0);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/leads", (req, res) => {
    const leads = db.prepare("SELECT * FROM leads ORDER BY order_index ASC").all();
    const leadsWithTags = (leads as any[]).map(lead => ({
      ...lead,
      tags: lead.tags ? JSON.parse(lead.tags) : []
    }));
    res.json(leadsWithTags);
  });

  app.post("/api/leads", (req, res) => {
    const { id, first_name, last_name, company, email, phone, status_stage, value, order_index, tags } = req.body;
    db.prepare(`
      INSERT INTO leads (id, user_id, first_name, last_name, company, email, phone, status_stage, value, order_index, tags)
      VALUES (?, 'default-user', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, first_name, last_name, company, email, phone, status_stage, value, order_index, tags ? JSON.stringify(tags) : JSON.stringify([]));
    res.status(201).json({ success: true });
  });

  app.patch("/api/leads/:id/stage", (req, res) => {
    const { id } = req.params;
    const { status_stage, order_index } = req.body;
    db.prepare("UPDATE leads SET status_stage = ?, order_index = ? WHERE id = ?").run(status_stage, order_index, id);
    res.json({ success: true });
  });

  app.delete("/api/leads/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM list_leads WHERE lead_id = ?").run(id);
    db.prepare("DELETE FROM tasks WHERE lead_id = ?").run(id);
    db.prepare("DELETE FROM leads WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/leads/bulk-delete", (req, res) => {
    const { ids } = req.body;
    const deleteListLeads = db.prepare("DELETE FROM list_leads WHERE lead_id = ?");
    const deleteTasks = db.prepare("DELETE FROM tasks WHERE lead_id = ?");
    const deleteLead = db.prepare("DELETE FROM leads WHERE id = ?");
    
    const transaction = db.transaction((leadIds: string[]) => {
      for (const id of leadIds) {
        deleteListLeads.run(id);
        deleteTasks.run(id);
        deleteLead.run(id);
      }
    });
    transaction(ids);
    res.json({ success: true });
  });

  app.post("/api/leads/bulk-status", (req, res) => {
    const { ids, status_stage } = req.body;
    const updateStatus = db.prepare("UPDATE leads SET status_stage = ? WHERE id = ?");
    
    const transaction = db.transaction((leadIds: string[], status: string) => {
      for (const id of leadIds) {
        updateStatus.run(status, id);
      }
    });
    transaction(ids, status_stage);
    res.json({ success: true });
  });

  app.get("/api/tasks", (req, res) => {
    const { lead_id } = req.query;
    let tasks;
    if (lead_id) {
      tasks = db.prepare("SELECT * FROM tasks WHERE lead_id = ? ORDER BY created_at DESC").all(lead_id);
    } else {
      tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
    }
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { id, lead_id, title, description, priority, status, due_date } = req.body;
    db.prepare(`
      INSERT INTO tasks (id, user_id, lead_id, title, description, priority, status, due_date)
      VALUES (?, 'default-user', ?, ?, ?, ?, ?, ?)
    `).run(id, lead_id, title, description, priority || 'medium', status || 'todo', due_date);
    res.status(201).json({ success: true });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { is_completed, status, priority, title, description } = req.body;
    
    const updates = [];
    const params = [];
    
    if (is_completed !== undefined) {
      updates.push("is_completed = ?");
      params.push(is_completed ? 1 : 0);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      params.push(priority);
    }
    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    
    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Lists API
  app.get("/api/lists", (req, res) => {
    const lists = db.prepare("SELECT * FROM lists ORDER BY created_at DESC").all();
    res.json(lists);
  });

  app.post("/api/lists", (req, res) => {
    const { id, name } = req.body;
    db.prepare("INSERT INTO lists (id, user_id, name) VALUES (?, 'default-user', ?)").run(id, name);
    res.status(201).json({ success: true });
  });

  app.get("/api/lists/:id/leads", (req, res) => {
    const { id } = req.params;
    const leads = db.prepare(`
      SELECT l.* FROM leads l
      JOIN list_leads ll ON l.id = ll.lead_id
      WHERE ll.list_id = ?
    `).all(id);
    res.json(leads);
  });

  app.post("/api/lists/:id/leads", (req, res) => {
    const { id } = req.params;
    const { lead_ids } = req.body;
    const insert = db.prepare("INSERT OR IGNORE INTO list_leads (list_id, lead_id) VALUES (?, ?)");
    const transaction = db.transaction((ids) => {
      for (const leadId of ids) insert.run(id, leadId);
    });
    transaction(lead_ids);
    res.json({ success: true });
  });

  app.delete("/api/lists/:id/leads/:leadId", (req, res) => {
    const { id, leadId } = req.params;
    db.prepare("DELETE FROM list_leads WHERE list_id = ? AND lead_id = ?").run(id, leadId);
    res.json({ success: true });
  });

  app.get("/api/tags", (req, res) => {
    const tags = db.prepare("SELECT * FROM tags").all();
    res.json(tags);
  });

  app.get("/api/analytics/summary", (req, res) => {
    const totalLeads = db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
    const winRate = 65; // Mocked for now
    const revenue = db.prepare("SELECT SUM(value) as total FROM leads").get() as { total: number };
    const tasksDue = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE is_completed = 0").get() as { count: number };
    
    res.json({
      totalLeads: totalLeads.count,
      winRate,
      revenue: revenue.total || 0,
      tasksDue: tasksDue.count
    });
  });

  app.get("/api/analytics/pipeline", (req, res) => {
    const stages = db.prepare("SELECT status_stage as name, COUNT(*) as value FROM leads GROUP BY status_stage").all();
    res.json(stages);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
