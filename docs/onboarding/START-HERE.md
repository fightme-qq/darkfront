# Start Here

Если агент открывает проект с пустым контекстом, сначала нужно прочитать файлы в таком порядке:

1. [AGENTS.md](/g:/vs/auto pets/AGENTS.md:1)
2. [docs/design/GDD-MVP.md](/g:/vs/auto pets/docs/design/GDD-MVP.md:1)
3. [docs/architecture/CLAUDE.md](/g:/vs/auto pets/docs/architecture/CLAUDE.md:1)
4. [docs/design/SAP-UNITS.md](/g:/vs/auto pets/docs/design/SAP-UNITS.md:1)

## Короткая инструкция для нового чата

Скажи агенту одной фразой:

```text
Прочитай AGENTS.md, потом docs/onboarding/START-HERE.md и после этого кратко перескажи текущее устройство проекта, архитектурные правила, mobile-first приоритет и MVP-границы.
```

## Что агент должен понять после чтения

- какой это проект и на каком он стеке
- что проект делается `mobile-first` под landscape-мобильный UX
- что Expo / React Native поведение важнее web-preview удобства
- что уже реально реализовано, а что пока только target architecture
- что gameplay-логика должна уходить в domain, а не в UI
- какие документы являются источником истины по дизайну и технике
- что `docs/design/GDD-MVP.md` и `docs/design/SAP-UNITS.md` описывают продукт и контент
- что `docs/architecture/CLAUDE.md` описывает техническое направление реализации
- что в `docs/architecture/CLAUDE.md` есть отдельный блок про `F2P architecture direction`
- что после явного одобрения результата пользователем изменения нужно не только оставить локально, но и закоммитить/запушить в Git

## Обязанность по актуализации контекста

Если в ходе работы агент вносит важные долгоживущие изменения, он должен обновить onboarding-файлы проекта, чтобы следующий чат не стартовал с устаревшим контекстом.

Это касается в первую очередь:

- новых skills в папке `skills/`
- новых важных документов в `docs/`
- изменений стартового порядка чтения
- существенных изменений архитектуры
- новых критичных правил в `AGENTS.md`
- изменений стека, окружения или способа запуска проекта
- появления новых устойчивых workflow-инструментов, вроде preview-shell, генераторов или обязательных скриптов
- изменения platform priority, если это влияет на mobile-first поведение

В таких случаях агент должен проверить и при необходимости обновить:

1. [skills/project-onboarding.md](/g:/vs/auto pets/skills/project-onboarding.md:1)
2. [docs/onboarding/START-HERE.md](/g:/vs/auto pets/docs/onboarding/START-HERE.md:1)
3. [README.md](/g:/vs/auto pets/README.md:1)
4. [AGENTS.md](/g:/vs/auto pets/AGENTS.md:1), если изменились именно правила или архитектурные guardrails

Важно:

- обновлять только действительно важные и устойчивые изменения
- не записывать туда временные эксперименты, разовые фиксы или мелкие локальные правки
- если добавлен новый skill, onboarding должен явно подсказывать, когда его читать и зачем он нужен

## Если нужен только быстрый вход

Минимальный набор чтения:

1. [AGENTS.md](/g:/vs/auto pets/AGENTS.md:1)
2. [docs/design/GDD-MVP.md](/g:/vs/auto pets/docs/design/GDD-MVP.md:1)
3. [docs/architecture/CLAUDE.md](/g:/vs/auto pets/docs/architecture/CLAUDE.md:1)
