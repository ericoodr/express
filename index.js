import express from 'express'
import { engine } from 'express-handlebars'
import db from './config/database.js'
import session from 'express-session'
import multer from 'multer'
import { getProjects, getProjectsById, createProject, getEditProject, updateProject, deleteProject } from './src/assets/scripts/project.js'

const uploadFile = multer({ storage: multer.memoryStorage() })
let gambarSementara = ''

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('src'))
app.use('/assets', express.static('src/assets'))

app.use(session({
  secret: 'rahasia',
  resave: false,
  saveUninitialized: true
}))

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: 'src/views/layouts',
  partialsDir: 'src/views/partials',
  helpers: {
    formatDate: function(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}))

app.set('view engine', 'hbs')
app.set('views', 'src/views')

let pesanMasuk = [
  {
    id: 1,
    nama: 'lorem ipsum',
    email: 'lorem@gmail.com',
    pesan: 'Halo website ini keren',
    tanggal: new Date().toISOString()
  },
  {
    id: 2,
    nama: 'ipsum lorem',
    email: 'ipsum@gmail.com',
    pesan: 'Saya suka desainnya',
    tanggal: new Date().toISOString()
  }
]

let idBerikutnya = 3

app.get('/', (req, res) => {
  const cari = req.query.search
  let hasilFilter = pesanMasuk

  if (cari) {
    hasilFilter = pesanMasuk.filter(msg =>
      msg.nama.toLowerCase().includes(cari.toLowerCase())
    )
  }

  res.render('index', {
    title: 'Home',
    messages: hasilFilter,
    keyword: cari || ''
  })
})

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' })
})

app.post('/contact', (req, res) => {
  const { nama, email, pesan } = req.body

  if (!nama || !email || !pesan) {
    return res.send(`<script>alert('Isi semua data!'); window.history.back();</script>`)
  }

  pesanMasuk.push({
    id: idBerikutnya++,
    nama: nama,
    email: email,
    pesan: pesan,
    tanggal: new Date().toISOString()
  })

  res.redirect('/')
})

app.get('/hapus-pesan/:id', (req, res) => {
  const id = parseInt(req.params.id)
  pesanMasuk = pesanMasuk.filter(m => m.id !== id)
  res.redirect('/')
})

app.get('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id)
  pesanMasuk = pesanMasuk.filter(m => m.id !== id)
  res.redirect('/')
})

app.post('/upload-gambar', uploadFile.single('image'), (req, res) => {
  try {
    const base64 = req.file.buffer.toString('base64')
    gambarSementara = `data:${req.file.mimetype};base64,${base64}`
    req.session.flash = 'Gambar berhasil diupload'
    res.redirect('/my-project')
  } catch (error) {
    console.log('gagal upload')
    res.redirect('/my-project')
  }
})

app.get('/my-project', async (req, res) => getProjects(req, res, db, gambarSementara))
app.post('/my-project', async (req, res) => createProject(req, res, db, gambarSementara))
app.get('/my-project/:id', async (req, res) => getProjectsById(req, res, db))
app.get('/my-project/edit/:id', async (req, res) => getEditProject(req, res, db))
app.post('/my-project/edit/:id', async (req, res) => updateProject(req, res, db, gambarSementara))
app.post('/my-project/delete/:id', async (req, res) => deleteProject(req, res, db))

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})