import express from 'express'

const router = express.Router()

router.get('/api/status', async (_req, res) => {
  try {
    res.json({
      status: 'Online',
      dbTime: new Date().toISOString(),
      message: 'Hello from Express inside Electron!'
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router