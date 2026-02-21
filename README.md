# L910-Framework

## Описание 
Неполноценная альтернатива твича, с поддержкой маршрутизации, middleware,вроде рабочая обработка запросов и Express
## Вариант 3: Твич 

## Сущности

### 1. Стримеры (Streamers)
| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Уникальный идентификатор |
| username | string | Имя пользователя |
| displayName | string | Отображаемое имя |
| followers | number | Количество подписчиков |
| isPartner | boolean | Партнер Twitch |
| streamingSince | Date | Дата начала стримов |
| categories | array | Категории стримов |
| averageViewers | number | Среднее количество зрителей |
| language | string | Язык стрима |

### 2. Зрители (Viewers)
| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Уникальный идентификатор |
| username | string | Имя пользователя |
| displayName | string | Отображаемое имя |
| subscriptions | array | Подписки на стримеров |
| subscriptionSince | Date или null | Дата первой подписки |
| totalWatchTime | number | Общее время просмотра (часы) |
| isPrime | boolean | Наличие Twitch Prime |
| preferredCategories | array | Предпочитаемые категории |
| messagesSent | number | Количество сообщений в чате |
| lastActive | Date | Последняя активность |

## Маршруты API

### Стримеры (Streamers)
| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | /streamers | Получить всех стримеров |
| GET | /streamers/:id | Получить стримера по ID |
| POST | /streamers | Создать нового стримера |
| PUT | /streamers/:id | Полностью обновить стримера |
| PATCH | /streamers/:id | Частично обновить стримера |
| DELETE | /streamers/:id | Удалить стримера |

### Зрители (Viewers)
| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | /viewers | Получить всех зрителей |
| GET | /viewers/:id | Получить зрителя по ID |
| POST | /viewers | Создать нового зрителя |
| PUT | /viewers/:id | Полностью обновить зрителя |
| PATCH | /viewers/:id | Частично обновить зрителя |
| DELETE | /viewers/:id | Удалить зрителя |

## Фильтрация и query параметры

### Стримеры
- `?language=en` - фильтр по языку
- `?minFollowers=10000` - минимальное количество подписчиков
- `?category=Gaming` - фильтр по категории

### Зрители
- `?isPrime=true` - фильтр по наличию Prime
- `?minWatchTime=1000` - минимальное время просмотра

## Примеры запросов

### Создание стримера
```bash
curl -X POST http://localhost:3000/streamers \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_streamer",
    "displayName": "New Streamer",
    "followers": 5000,
    "isPartner": false,
    "categories": ["GTA", "Just Chatting"],
    "language": "en"
  }'