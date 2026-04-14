import multer from 'multer'

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.session.flash = { type: 'danger', message: 'Gagal upload: File terlalu besar, maksimal 5MB' }
      return res.redirect('/my-project')
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      req.session.flash = { type: 'danger', message: 'Gagal upload: Terlalu banyak file' }
      return res.redirect('/my-project')
    } else {
      req.session.flash = { type: 'danger', message: `Gagal upload: ${err.message}` }
      return res.redirect('/my-project')
    }
  }
  
  if (err) {
    req.session.flash = { type: 'danger', message: `Gagal upload: ${err.message}` }
    return res.redirect('/my-project')
  }
  
  next()
}

export default uploadErrorHandler