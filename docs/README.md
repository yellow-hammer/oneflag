# Документация OneFlag

Self-hosted сервис управления фича-флагами и remote-config на чистом OneScript: дашборд без сборщика JS, REST API,
живое обновление по Server-Sent Events, аудит в формате CloudEvents.

## Назначение

Команде нужен выключатель, который срабатывает без выкладки, работает внутри закрытого контура и не тянет за собой
чужой стек. Аналоги вроде Unleash и Flagsmith это умеют, но требуют отдельной инфраструктуры и языка, которого
в команде может не быть.

Главное свойство сервиса: **изменение флага доходит до приложений мгновенно**. Оператор щёлкает тумблер в дашборде -
подключённые приложения меняют поведение в ту же секунду, без перезапуска и без опроса сервера.

## Быстрый старт

```
docker compose up --build
```

Дашборд: <http://localhost:3333>, логин `admin`, пароль `admin`.

Без Docker:

```
opm install oneflag
oneflag serve
```

| Команда | Назначение |
|---|---|
| `oneflag serve` | Запуск сервера с дашбордом и API |
| `oneflag flags [окружение]` | Список флагов окружения, без запуска сервера |
| `oneflag help` | Справка |

Из исходников:

```
opm install --dev
cp .env.example .env
oscript src/main.os serve
```

## Разделы

| Раздел | Содержание |
|---|---|
| [HTTP API](api/index.md) | Эндпоинты управления, оценки, потока и служебные |
| [Продуктовое описание](product/index.md) | Задача, устройство, сравнение с альтернативами, ограничения |
| [Выпуск релиза](release.md) | Порядок публикации новой версии |

## Устройство

| Слой | Чем сделан |
|---|---|
| Контейнер компонентов | [autumn](https://github.com/autumn-library/autumn), CLI - `autumn-cli` |
| HTTP-сервер и контроллеры | [winow](https://github.com/autumn-library/winow), каталог `app` |
| Дашборд | JinjOS-шаблоны через [winow-view](https://github.com/yellow-hammer/winow-view), htmx и Alpine.js |
| Хранение | ORM [entity](https://github.com/oscript-library/entity): sqlite, postgresql, json, memory |
| Оценка флагов | `FlagEvaluator` из [oneflag-sdk](https://github.com/yellow-hammer/oneflag-sdk) |
| События | [sse](https://github.com/yellow-hammer/sse), аудит - [cloudevents](https://github.com/yellow-hammer/cloudevents) |
| Ошибки API | [problem-details](https://github.com/yellow-hammer/problem-details), RFC 9457 |
| Метрики | [prometheus](https://github.com/yellow-hammer/prometheus) и `prometheus-metrics embed` |

Контроллеры лежат в `app`, а не в `src`, потому что заготовка winow читает каталог контроллеров раньше, чем autumn
применяет `autumn-properties.json`, и всегда получает значение по умолчанию `./app`.

## Модель флага

```json
{
  "ключ": "new-checkout",
  "тип": "boolean",
  "варианты": { "вкл": true, "выкл": false },
  "настройки": {
    "prod": {
      "включен": true,
      "вариантПоУмолчанию": "вкл",
      "процентВыкатки": 25,
      "правила": [
        { "атрибут": "plan", "оператор": "равно", "значения": ["pro"], "вариант": "вкл" }
      ]
    }
  }
}
```

Порядок разрешения значения и полный список операторов правил описаны в
[документации oneflag-sdk](https://github.com/yellow-hammer/oneflag-sdk/blob/main/docs/api/Классы/FlagEvaluator.md):
сервер и SDK используют один и тот же класс, поэтому значение флага не может разойтись между дашбордом и приложением.

## Конфигурация

Параметры читаются из переменных окружения, при локальном запуске - из `.env` (см. `.env.example`). Приоритет
у переменных окружения.

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `ONEFLAG_PORT` | `3333` | Порт HTTP-сервера |
| `ONEFLAG_STORAGE_KIND` | `sqlite` | Вид хранилища: sqlite, postgresql, json, memory |
| `ONEFLAG_STORAGE` | `data/oneflag.db` | Строка соединения или путь |
| `ONEFLAG_SECRET` | - | Секрет подписи токенов, **обязательно замените** |
| `ONEFLAG_ADMIN_LOGIN` / `ONEFLAG_ADMIN_PASSWORD` | `admin` / `admin` | Учётные данные дашборда |
| `ONEFLAG_SDK_KEY` | `local-sdk-key` | Ключ доступа для SDK |
| `ONEFLAG_ENVIRONMENTS` | `dev,stage,prod` | Список окружений |
| `ONEFLAG_DEFAULT_ENVIRONMENT` | `dev` | Окружение по умолчанию |
| `ONEFLAG_AUDIT_LIMIT` | `500` | Сколько записей аудита хранить |
| `ONEFLAG_TOKEN_TTL` | `28800` | Срок жизни токена входа, секунды |

## Тесты

```
opm run install
opm run test
```
