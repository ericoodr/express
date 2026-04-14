import fs from 'fs'
import path from 'path'

export async function getProjects(req, res, db, gambarSementara) {
  try {
    const result = await db.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY id ASC', [req.session.userId])
    const flash = req.session.flash
    delete req.session.flash

    res.render('my-project', {
      title: 'My Projects',
      projects: result.rows,
      flash: flash,
      gambarSementara: gambarSementara
    })
  } catch (error) {
    console.log('Error get projects:', error)
    res.render('my-project', {
      title: 'My Projects',
      projects: []
    })
  }
}

export async function getProjectsById(req, res, db) {
  try {
    const { id } = req.params
    const result = await db.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, req.session.userId])
    if (result.rows.length === 0) {
      return res.send('Project not found')
    }
    res.render('project-detail', {
      title: 'Project Detail',
      project: result.rows[0]
    })
  } catch (error) {
    console.log('Error get project by id:', error)
    res.send('Server Error')
  }
}

export async function createProject(req, res, db, gambarSementara) {
  try {
    const { name, description, tag } = req.body
    let img = null

    if (req.file) {
      img = `/uploads/${req.file.filename}`
    }

    if (!name || !description || !tag) {
      req.session.flash = { type: 'danger', message: 'Semua field harus diisi' }
      return res.redirect('/my-project')
    }

    if (!img) {
      req.session.flash = { type: 'danger', message: 'Upload gambar dulu' }
      return res.redirect('/my-project')
    }

    await db.query('INSERT INTO projects (user_id, name, description, tag, img) VALUES ($1, $2, $3, $4, $5)', [req.session.userId, name, description, tag, img])
    req.session.flash = { type: 'success', message: 'Project berhasil ditambahkan' }
    res.redirect('/my-project')
  } catch (error) {
    console.log('Error create project:', error)
    req.session.flash = { type: 'danger', message: 'Gagal menambah project' }
    res.redirect('/my-project')
  }
}

export async function getEditProject(req, res, db) {
  try {
    const { id } = req.params
    const result = await db.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, req.session.userId])
    if (result.rows.length === 0) {
      return res.redirect('/my-project')
    }
    res.render('project-edit', {
      title: 'Edit Project',
      project: result.rows[0]
    })
  } catch (error) {
    console.log('Error get edit project:', error)
    res.redirect('/my-project')
  }
}

export async function updateProject(req, res, db, gambarSementara) {
  try {
    const { id } = req.params
    const { name, description, tag } = req.body
    let img = null

    const result = await db.query('SELECT img FROM projects WHERE id = $1 AND user_id = $2', [id, req.session.userId])
    
    if (req.file) {
      if (result.rows[0].img && result.rows[0].img.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), result.rows[0].img)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      img = `/uploads/${req.file.filename}`
    } else {
      img = result.rows[0].img
    }

    await db.query('UPDATE projects SET name = $1, description = $2, tag = $3, img = $4 WHERE id = $5 AND user_id = $6', [name, description, tag, img, id, req.session.userId])
    req.session.flash = { type: 'success', message: 'Project berhasil diupdate' }
    res.redirect('/my-project')
  } catch (error) {
    console.log('Error update project:', error)
    req.session.flash = { type: 'danger', message: 'Gagal update project' }
    res.redirect('/my-project')
  }
}

export async function deleteProject(req, res, db) {
  try {
    const { id } = req.params
    
    const result = await db.query('SELECT img FROM projects WHERE id = $1 AND user_id = $2', [id, req.session.userId])
    
    if (result.rows.length > 0 && result.rows[0].img && result.rows[0].img.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), result.rows[0].img)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }
    
    await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, req.session.userId])
    req.session.flash = { type: 'success', message: 'Project berhasil dihapus' }
    res.redirect('/my-project')
  } catch (error) {
    console.log('Error delete project:', error)
    req.session.flash = { type: 'danger', message: 'Gagal hapus project' }
    res.redirect('/my-project')
  }
}