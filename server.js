const MiniExpress = require('./framework/mini-express');
const bodyParser = require('./middleware/bodyParser');
const logger = require('./middleware/logger');
const streamerRoutes = require('./routes/streamers');
const viewerRoutes = require('./routes/viewers');

const app = new MiniExpress();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(bodyParser);

app.error((err, req, res, next) => {
    console.error('Найдена ошибка:', err);
    res.status(500).json({ 
        error: 'Что-то пошло не так',
        message: err.message 
    });
});

app.get('/streamers', streamerRoutes.getAllStreamers);
app.get('/streamers/:id', streamerRoutes.getStreamerById);
app.post('/streamers', streamerRoutes.createStreamer);
app.put('/streamers/:id', streamerRoutes.updateStreamer);
app.patch('/streamers/:id', streamerRoutes.patchStreamer);
app.delete('/streamers/:id', streamerRoutes.deleteStreamer);

app.get('/viewers', viewerRoutes.getAllViewers);
app.get('/viewers/:id', viewerRoutes.getViewerById);
app.post('/viewers', viewerRoutes.createViewer);
app.put('/viewers/:id', viewerRoutes.updateViewer);
app.patch('/viewers/:id', viewerRoutes.patchViewer);
app.delete('/viewers/:id', viewerRoutes.deleteViewer);

app.get('/', (req, res) => {
    res.json({
        message: 'Twitch API работает!',
        endpoints: {
            streamers: {
                GET: ['/streamers', '/streamers/:id'],
                POST: '/streamers',
                PUT: '/streamers/:id',
                PATCH: '/streamers/:id',
                DELETE: '/streamers/:id'
            },
            viewers: {
                GET: ['/viewers', '/viewers/:id'],
                POST: '/viewers',
                PUT: '/viewers/:id',
                PATCH: '/viewers/:id',
                DELETE: '/viewers/:id'
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Тестируйте API: http://localhost:${PORT}`);
});