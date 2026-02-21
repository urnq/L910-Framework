const fs = require('fs').promises;
const path = require('path');

const STREAMERS_FILE = path.join(__dirname, '../data/streamers.json');

async function readStreamers() {
    try {
        const data = await fs.readFile(STREAMERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Ошибка чтения streamers.json:', err);
        return [];
    }
}

async function writeStreamers(streamers) {
    try {
        await fs.writeFile(STREAMERS_FILE, JSON.stringify(streamers, null, 4), 'utf8');
        return true;
    } catch (err) {
        console.error('Ошибка записи streamers.json:', err);
        return false;
    }
}

function generateId(streamers) {
    const maxId = streamers.reduce((max, s) => Math.max(max, s.id), 0);
    return maxId + 1;
}
async function getAllStreamers(req, res) {
    const streamers = await readStreamers();
    
    const { language, minFollowers, category } = req.query;
    
    let filteredStreamers = [...streamers];
    
    if (language) {
        filteredStreamers = filteredStreamers.filter(s => s.language === language);
    }
    
    if (minFollowers) {
        filteredStreamers = filteredStreamers.filter(s => s.followers >= parseInt(minFollowers));
    }
    
    if (category) {
        filteredStreamers = filteredStreamers.filter(s => 
            s.categories.some(c => c.toLowerCase().includes(category.toLowerCase()))
        );
    }
    
    res.json(filteredStreamers);
}

async function getStreamerById(req, res) {
    const streamers = await readStreamers();
    const streamer = streamers.find(s => s.id === parseInt(req.params.id));
    
    if (!streamer) {
        return res.status(404).json({ error: 'Стример не найден' });
    }
    
    res.json(streamer);
}

async function createStreamer(req, res) {
    const streamers = await readStreamers();
    
    let newStreamer;
    
    if (Object.keys(req.body).length === 0) {
        const names = ['xQc', 'cuteGirl', 'avice'];
        const langs = ['en', 'ru'];
        const categories = [['Just Chatting'], ['Dota 2'], ['Pool'], ['Hot Tubs'], ['MineCraft'], ['GTA']];
        
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        newStreamer = {
            id: generateId(streamers),
            username: randomName.toLowerCase(),
            displayName: randomName,
            followers: Math.floor(Math.random() * 10000000) + 1000,
            isPartner: Math.random() > 0.5,
            streamingSince: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            categories: categories[Math.floor(Math.random() * categories.length)],
            averageViewers: Math.floor(Math.random() * 50000) + 100,
            language: langs[Math.floor(Math.random() * langs.length)]
        };
    } else {
        newStreamer = {
            id: generateId(streamers),
            ...req.body
        };
    }
    
    streamers.push(newStreamer);
    
    const success = await writeStreamers(streamers);
    
    if (success) {
        res.status(201).json(newStreamer);
    } else {
        res.status(500).json({ error: 'Не удалось сохранить стримера' });
    }
}

async function updateStreamer(req, res) {
    const streamers = await readStreamers();
    const index = streamers.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: 'Стример не найден' });
    }
    
    const requiredFields = ['username', 'displayName', 'followers', 'isPartner', 'categories', 'language'];
    const missingFields = requiredFields.filter(field => !(field in req.body));
    
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            error: 'Отсутствуют обязательные поля', 
            missing: missingFields 
        });
    }
    
    const updatedStreamer = {
        id: parseInt(req.params.id),
        ...req.body
    };
    
    streamers[index] = updatedStreamer;
    
    const success = await writeStreamers(streamers);
    
    if (success) {
        res.json(updatedStreamer);
    } else {
        res.status(500).json({ error: 'Не удалось обновить стримера' });
    }
}

async function patchStreamer(req, res) {
    const streamers = await readStreamers();
    const index = streamers.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: 'Стример не найден' });
    }
    
    const updatedStreamer = {
        ...streamers[index],
        ...req.body,
        lastUpdated: new Date().toISOString()
    };
    
    streamers[index] = updatedStreamer;
    
    const success = await writeStreamers(streamers);
    
    if (success) {
        res.json(updatedStreamer);
    } else {
        res.status(500).json({ error: 'Не удалось обновить стримера' });
    }
}

async function deleteStreamer(req, res) {
    const streamers = await readStreamers();
    const index = streamers.findIndex(s => s.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ error: 'Стример не найден' });
    }
    
    const deletedStreamer = streamers[index];
    streamers.splice(index, 1);
    
    const success = await writeStreamers(streamers);
    
    if (success) {
        res.json({ 
            message: 'Стример успешно удален', 
            deletedStreamer 
        });
    } else {
        res.status(500).json({ error: 'Не удалось удалить стримера' });
    }
}

module.exports = {
    getAllStreamers,
    getStreamerById,
    createStreamer,
    updateStreamer,
    patchStreamer,
    deleteStreamer
};