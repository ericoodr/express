import express from 'express';
import bcrypt from 'bcrypt';
import db from '../../config/database.js'

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    const { full_name, email, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        req.session.flash = { type: 'danger', message: 'Password tidak cocok' };
        return res.redirect('/register');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await db.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)',
            [full_name, email, hashedPassword]
        );
        req.session.flash = { type: 'success', message: 'Registrasi berhasil' };
        res.redirect('/login');
    } catch (err) {
        req.session.flash = { type: 'danger', message: 'Email sudah terdaftar' };
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
        req.session.flash = { type: 'danger', message: 'Login gagal' };
        return res.redirect('/login');
    }
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
        req.session.flash = { type: 'danger', message: 'Login gagal' };
        return res.redirect('/login');
    }
    
    req.session.userId = user.id;
    req.session.userName = user.full_name;
    
    req.session.flash = { type: 'success', message: 'Login berhasil' };
    res.redirect('/my-project');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

export default router;