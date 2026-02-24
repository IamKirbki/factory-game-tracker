import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- EXPRESS & POSTGRES CONFIG ---
const server = express()
server.use(cors())
server.use(express.json())

// const pool = new Pool({
//   user: 'user',
//   host: 'localhost',
//   database: 'factory_db',
//   password: 'password',
//   port: 5432,
// })

server.get('/api/status', async (_req, res) => {
  try {
    // const result = await pool.query('SELECT NOW()')
    res.json({
      status: 'Online',
      dbTime: new Date().toISOString(),
      message: 'Hello from Express inside Electron!'
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// --- ELECTRON WINDOW CONFIG ---
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

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

app.whenReady().then(() => {
  // Start Express on port 3001
  server.listen(3001, () => {
    console.log('🚀 Express Server running on http://localhost:3001')
  })
  createWindow()
})