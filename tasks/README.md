# Задачи проекта

Задачи запускаются через `opm run <имя>` из корня проекта.

| Задача | Команда | Назначение |
|---|---|---|
| Установка зависимостей | `opm run install` | `opm install --dev -l` в `oscript_modules` |
| Тесты | `opm run test` | Прогон OneUnit по каталогу `tests` с отчётом JUnit в `out` |
| Покрытие | `opm run coverage` | Тесты со сбором покрытия, отчёты GenericCoverage и Cobertura |
| Сборка | `opm run build` | Сборка пакета `.ospx` в каталог `out` |

Файл `oscript.cfg` указывает раннеру на локальный каталог зависимостей.