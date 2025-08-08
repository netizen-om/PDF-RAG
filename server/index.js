import express from "express"
import cors from "cors"
import multer from "multer"

const app = express()
const port = 8000

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname )
  }
})

const upload = multer({ storage : storage })

app.use(cors())


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/upload/pdf', upload.single('pdf'), (req, res) =>  {
    return res.json({ message : "File uploaded"})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))