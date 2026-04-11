export function validateProject(req, res, next) {
  const { name, description, tag } = req.body
  
  const errors = []

  if (!name || name.trim() === '') {
    errors.push('Nama project wajib diisi')
  } else if (name.length < 3) {
    errors.push('Nama project minimal 3 karakter')
  } else if (name.length > 100) {
    errors.push('Nama project maksimal 100 karakter')
  }

  if (!description || description.trim() === '') {
    errors.push('Deskripsi project wajib diisi')
  } else if (description.length > 1000) {
    errors.push('Deskripsi project maksimal 1000 karakter')
  }

  if (!tag || tag.trim() === '') {
    errors.push('Tag project wajib diisi')
  }

  if (errors.length > 0) {
    req.session.flash = { type: 'danger', message: errors.join(' | ') }
    return res.redirect('/my-project')
  }

  next()
}

export function validateContact(req, res, next) {
  const { nama, email, pesan } = req.body
  
  const errors = []

  if (!nama || nama.trim() === '') {
    errors.push('Nama wajib diisi')
  }

  if (!email || email.trim() === '') {
    errors.push('Email wajib diisi')
  } else if (!email.includes('@') || !email.includes('.')) {
    errors.push('Email tidak valid (harus mengandung @ dan .)')
  }

  if (!pesan || pesan.trim() === '') {
    errors.push('Pesan wajib diisi')
  } else if (pesan.length > 500) {
    errors.push('Pesan maksimal 500 karakter')
  }

  if (errors.length > 0) {
    const errorMessage = errors.join('\\n')
    return res.send(`
      <script>
        alert('${errorMessage}');
        window.history.back();
      </script>
    `)
  }

  next()
}