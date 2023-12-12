import express from 'express'
import https from 'https'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

const app = express()

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dummy PHP API',
      version: '1.0.0',
    },
  },
  apis: ['./index.ts'], // files containing annotations as above
})

app
  .use(cors({
    origin: 'https://localhost:3001',
    credentials: true,
  }))
  .use(express.json())
  .use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * @openapi
 * /:
 *   get:
 *     description: Health check endpoint.
 *     responses:
 *       200:
 *         description: Returns server is running.
 */
app.get('/', (_req, res) => {
  res.send('Server is running')
})

/**
 * @openapi
 * /check-cookie:
 *   get:
 *     description: Log cookie on console.
 */
app.get('/check-cookie', (req, res) => {
  const cookie = req.headers.cookie
  console.log('Cookie: ', req.headers.cookie)
  console.log('referer: ', req.headers.referer)

  res.json({ cookie })
})

/**
 * @openapi
 * /set-cookie:
 *   post:
 *     description: Try to set a cookie.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              cookieValue:
 *                type: string
 *              cookieOption:
 *                type: object
 *                description: Browser cookie options
 */
app.post('/set-cookie', (req, res) => {
  const { cookieValue, cookieOption } = req.body

  console.log(req.body)
  
  if (cookieValue) {
    res
      .cookie('cookieName', cookieValue, cookieOption)
      .send('Cookie is set')
  } else {
    res.status(400).send('cookieValue is required')
  }
})

const server = process.env.MODE === 'http'
  ? app
  : https.createServer({
    key: fs.readFileSync(path.join(__dirname, './certificates/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './certificates/cert.pem')),
  }, app)

server.listen(Number(process.env.PORT), '0.0.0.0', () => {
  console.log('Server is running')
})
