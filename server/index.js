import express from "express"
import cors from "cors"
import multer from "multer"

const app = express()
const port = 8000
const upload = multer({ dest : 'uploads/' })

app.use(cors())


app.get('/', (req, res) => res.send('Hello World!'))

app.post('upload/pdf', upload.single('pdf'), (req, res) =>  {
    return res.json({ message : "File uploaded"})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))