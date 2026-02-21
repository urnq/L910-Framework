module.exports = async (req, res, next) => {
    req.body = {};

    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
        return next();
    }

    const contentType = req.headers['content-type'];

    if (contentType && contentType.includes('application/json')) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                if (body) {
                    req.body = JSON.parse(body);
                }
                next();
            } catch (err) {
                res.status(400).json({ error: 'Неверный формат JSON' });
            }
        });

        req.on('error', (err) => {
            res.status(500).json({ error: 'Ошибка чтения тела запроса' });
        });
    } else {
        next();
    }
};