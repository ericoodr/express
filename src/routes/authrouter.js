import express from 'express';
import bcrypt from 'bcrypt';
import db from '../../config/database.js';

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    console.log('=== REGISTER REQUEST ===');
    console.log('Body:', req.body);
    
    const { full_name, email, password, confirm_password } = req.body;
    
    if (password !== confirm_password) {
        console.log('Password tidak cocok');
        req.session.flash = { type: 'danger', message: 'Password tidak cocok' };
        return res.redirect('/register');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');
    
    try {
        const result = await db.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [full_name, email, hashedPassword]
        );
        console.log('Insert success, user id:', result.rows[0].id);
        req.session.flash = { type: 'success', message: 'Registrasi berhasil! Silakan login.' };
        return res.redirect('/login');
    } catch (err) {
        console.log('Database error:', err.message);
        req.session.flash = { type: 'danger', message: 'Email sudah terdaftar atau error: ' + err.message };
        return res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    console.log('=== LOGIN REQUEST ===');
    console.log('Email:', req.body.email);
    
    const { email, password } = req.body;
    
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('Query result rows:', result.rows.length);
        
        if (result.rows.length === 0) {
            console.log('User not found');
            req.session.flash = { type: 'danger', message: 'Email atau password salah' };
            return res.redirect('/login');
        }
        
        const user = result.rows[0];
        console.log('User found:', user.id, user.full_name);
        
        const match = await bcrypt.compare(password, user.password);
        console.log('Password match:', match);
        
        if (!match) {
            console.log('Password wrong');
            req.session.flash = { type: 'danger', message: 'Email atau password salah' };
            return res.redirect('/login');
        }
        
        req.session.userId = user.id;
        req.session.userName = user.full_name;
        console.log('Session saved:', req.session.userId, req.session.userName);
        
        req.session.flash = { type: 'success', message: 'Login berhasil!' };
        console.log('Redirecting to /my-project');
        return res.redirect('/my-project');
        
    } catch (err) {
        console.log('Login error:', err.message);
        req.session.flash = { type: 'danger', message: 'Terjadi kesalahan: ' + err.message };
        return res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

export default router;