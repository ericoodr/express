// middleware/auth.js
export function requireLogin(req, res, next) {
    if (!req.session.userId) {
        req.session.flash = { type: 'danger', message: 'Silakan login dulu' };
        return res.redirect('/login');
    }
    next();
}

export async function isOwner(req, res, next, db) {
    const { id } = req.params;
    const result = await db.query('SELECT user_id FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
        req.session.flash = { type: 'danger', message: 'Project tidak ditemukan' };
        return res.redirect('/my-project');
    }
    
    if (result.rows[0].user_id !== req.session.userId) {
        req.session.flash = { type: 'danger', message: 'Bukan project kamu' };
        return res.redirect('/my-project');
    }
    
    next();
}