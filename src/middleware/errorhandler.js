export function notFoundHandler(req, res) {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Halaman Tidak Ditemukan</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: black;
          color: white;
        }
        h1 { font-size: 50px; color: orange; }
        a { color: rgb(1, 169, 247); text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>Maaf, halaman yang Anda cari tidak ada.</p>
      <a href="/">← Kembali ke Home</a>
    </body>
    </html>
  `)
}

export function errorHandler(err, req, res, next) {
  console.error('Terjadi error:', err.message)
  

  if (err.code === '23505') {
    
    req.session.flash = { 
      type: 'danger', 
      message: 'Gagal menyimpan: Data sudah ada (duplikat)' 
    }
    return res.redirect('/my-project')
  }
  
  if (err.code === '23503') {

    req.session.flash = { 
      type: 'danger', 
      message: 'Gagal menghapus: Data sedang digunakan di tempat lain' 
    }
    return res.redirect('/my-project')
  }
  
  if (err.code === '42P01') {

    req.session.flash = { 
      type: 'danger', 
      message: 'Error database: Tabel tidak ditemukan. Coba restart server.' 
    }
    return res.redirect('/my-project')
  }

  req.session.flash = { 
    type: 'danger', 
    message: 'Terjadi kesalahan pada server. Silakan coba lagi.' 
  }
  
  res.redirect('/my-project')
}