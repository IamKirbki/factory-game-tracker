import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { BetterSqlite3Adapter } from '@iamkirbki/database-handler-better-sqlite3';
import { Container } from '@iamkirbki/database-handler-core';
import router from '../src/backend/routes'
import apiRouter from '../src/backend/routes/api'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

Object.assign(globalThis, { __filename, __dirname })

const server = express()
server.use(cors())
server.use(express.json())

server.use("/", router)
server.use("/api", apiRouter)

async function initDatabase() {
  const dbFolder = app.getPath('userData');
  const dbPath = path.join(dbFolder, "factory_game_tracker.db");

  const adapter = new BetterSqlite3Adapter();

  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, '');
      console.log('DB Created at:', dbPath);
    }

    await adapter.connect(dbPath);
    Container.getInstance().registerAdapter('default', adapter, true);
    console.log('✅ SQLite Connected');

    Container.getInstance().logging = true;

    const migrationPath = app.isPackaged
      ? path.join(process.resourcesPath, '/src/migrations/migration.sql')
      : path.join(__dirname, '../src/migrations/migration.sql');

    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      for (const statement of migrationSQL.split(';')) {
        if (statement.trim()) {
          (await adapter.prepare(statement.trim())).run();
        }
      }
      console.log('✅ Migrations complete');
    } else {
      console.warn('⚠️ Migration file not found at:', migrationPath);
    }
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err);
  }
}



process.env.DIST = path.join(__dirname, './dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.menuBarVisible = false

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.whenReady().then(async () => {
  await initDatabase();

  server.listen(3001, () => {
    console.log('🚀 Express Server running on http://localhost:3001')
  })
  createWindow()
})