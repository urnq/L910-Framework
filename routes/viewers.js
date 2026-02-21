const fs = require('fs').promises;
const path = require('path');

const VIEWERS_FILE = path.join(__dirname, '../data/viewers.json');

async function readViewers() {
    try {
        const data = await fs.readFile(VIEWERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Ошибка чтения viewers.json:', err);
        return [];
    }
}

async function writeViewers(viewers) {
    try {
        await fs.writeFile(VIEWERS_FILE, JSON.stringify(viewers, null, 4), 'utf8');
        return true;
    } catch (err) {
        console.error('Ошибка записи viewers.json:', err);
        return false;
    }
}

function generateId(viewers) {
    const maxId = viewers.reduce((max, v) => Math.max(max, v.id), 100);
    return maxId + 1;
}

async function getAllViewers(req, res) {
    const viewers = await readViewers();
    
    const { isPrime, minWatchTime } = req.query;
    
    let filteredViewers = [...viewers];
    
    if (isPrime !== undefined) {
        filteredViewers = filteredViewers.filter(v => v.isPrime === (isPrime === 'true'));
    }
    
    if (minWatchTime) {
        filteredViewers = filteredViewers.filter(v => v.totalWatchTime >= parseInt(minWatchTime));
    }
    
    res.json(filteredViewers);
}

async function getViewerById(req, res) {
    const viewers = await readViewers();
    const viewer = viewers.find(v => v.id === parseInt(req.params.id));
    
    if (!viewer) {
        return res.status(404).json({ error: 'Зритель не найден' });
    }
    
    res.json(viewer);
}

async function createViewer(req, res) {
    const viewers = await readViewers();
    
    let newViewer;
    
    if (Object.keys(req.body).length === 0) {
        const usernames = ['pro_gamer', 'joskiey_chel', 'kopac', 'fillipov'];
        const categories = [['GTA'], ['Pool'], ['Dota 2'], ['Hot Tubs'], ['Just Chatting'], ['MineCraft']];
        
        const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];
        
        newViewer = {
            id: generateId(viewers),
            username: randomUsername + '_' + Math.floor(Math.random() * 1000),
            displayName: randomUsername.charAt(0).toUpperCase() + randomUsername.slice(1),
            subscriptions: [],
            subscriptionSince: null,
            totalWatchTime: Math.floor(Math.random() * 5000),
            isPrime: Math.random() > 0.7,
            preferredCategories: categories[Math.floor(Math.random() * categories.length)],
            messagesSent: Math.floor(Math.random() * 10000),
            lastActive: new Date().toISOString()
        };
    } else {
        newViewer = {
            id: generateId(viewers),
            ...req.body,
            lastActive: new Date().toISOString()
        };
    }
    
    viewers.push(newViewer);
    
    const success = await writeViewers(viewers);
    
    if (success) {
        res.status(201).json(newViewer);
    } else {
        res.status(500).json({ error: 'Не удалось сохранить зрителя' });
    }
}

async function updateViewer(req, res) {
    const viewers = await readViewers();
    const index = viewers.findIndex(v => v.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: 'Зритель не найден' });
    }
    
    const updatedViewer = {
        id: parseInt(req.params.id),
        ...req.body,
        lastActive: new Date().toISOString()
    };
    
    viewers[index] = updatedViewer;
    
    const success = await writeViewers(viewers);
    
    if (success) {
        res.json(updatedViewer);
    } else {
        res.status(500).json({ error: 'Не удалось обновить зрителя' });
    }
}

async function patchViewer(req, res) {
    const viewers = await readViewers();
    const index = viewers.findIndex(v => v.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: 'Зритель не найден' });
    }
    
    const patchedViewer = {
        ...viewers[index],
        ...req.body,
        lastActive: new Date().toISOString(),

        updateCount: (viewers[index].updateCount || 0) + 1
    };
    
    viewers[index] = patchedViewer;
    
    const success = await writeViewers(viewers);
    
    if (success) {
        res.json(patchedViewer);
    } else {
        res.status(500).json({ error: 'Не удалось обновить зрителя' });
    }
}

async function deleteViewer(req, res) {
    const viewers = await readViewers();
    const index = viewers.findIndex(v => v.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: 'Зритель не найден' });
    }
    
    const deletedViewer = viewers[index];
    viewers.splice(index, 1);
    
    const success = await writeViewers(viewers);
    
    if (success) {
        res.json({ 
            message: 'Зритель успешно удален', 
            deletedViewer 
        });
    } else {
        res.status(500).json({ error: 'Не удалось удалить зрителя' });
    }
}

module.exports = {
    getAllViewers,
    getViewerById,
    createViewer,
    updateViewer,
    patchViewer,
    deleteViewer
};