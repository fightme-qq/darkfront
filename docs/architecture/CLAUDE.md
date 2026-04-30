# Technical Design Notes

Этот файл задает техническое направление проекта `Darkfront: Last Stand`.

Он не заменяет продуктовые документы, а дополняет их:

- `docs/design/GDD-MVP.md` описывает продукт и core loop
- `docs/design/SAP-UNITS.md` описывает контентную грамматику и reference по SAP
- `docs/architecture/CLAUDE.md` описывает техническую реализацию

## 1. Project Summary

- Рабочее название: `Darkfront: Last Stand`
- Жанр: `auto battler`
- Главный референс: `Super Auto Pets`
- Формат MVP: короткий `arena-like` run с асинхронными боями
- Главная цель: воспроизвести качество core loop `SAP`, а не просто скопировать список механик

## 2. Mobile-First Rule

Проект делается в первую очередь для мобильного landscape-формата.

Это критичное правило, а не пожелание.

Любая новая фича должна сначала оцениваться так:

1. Как она работает на телефоне
2. Удобна ли она для touch-взаимодействия
3. Читается ли она на маленькой высоте landscape-экрана
4. Не ломает ли она мобильный pacing и layout

Из этого следуют обязательные принципы:

- `mobile first, web second`
- Expo / React Native поведение важнее web-preview удобства
- touch UX важнее hover UX
- drag, drop, select, swap и confirm-паттерны должны проектироваться сначала для пальца
- web preview нужен как локальный инструмент проверки, а не как главный target platform

Если web и mobile требуют разных решений, приоритет у mobile.

## 3. Product Goals

Игра должна:

- быстро объясняться
- оставаться глубокой за счет синергий
- поддерживать сессии длиной `10-20` минут
- быть хорошо читаемой в поражении и победе
- расширяться через контент, а не через бесконтрольное усложнение правил

## 3.1. Approval And Git Sync Rule

Если пользователь посмотрел результат, дал явный позитивный фидбек и не просит оставить изменения только локально, агент должен считать работу одобренной для сохранения в репозитории.

Практическое правило:

- если правка получилась
- пользователь подтвердил, что результат нормальный
- и нет отдельного запрета на push

тогда изменения нужно:

1. закоммитить
2. запушить в основной удаленный репозиторий проекта

Это нужно для того, чтобы GitHub оставался актуальным source of truth, а одобренные изменения не зависали только в локальной рабочей копии.

## 4. MVP Scope

В MVP входит:

- один run до `10` побед или `5` поражений
- команда из `5` слотов
- магазин с `buy`, `sell`, `freeze`, `roll`
- один боевой ряд
- детерминированный battle resolver
- ограниченный набор триггеров и эффектов
- `3-4` тира контента
- один основной thematic pack

В MVP не входит:

- real-time PvP
- тяжелая meta-progression
- mana-heavy системы уровня `Unicorn Pack`
- toys / hard mode toys
- множество режимов
- grid-based бой

## 5. Architectural North Star

Главный принцип:

`simulation first, presentation second`

Кодовая база должна позволять:

- тестировать бой без UI
- воспроизводить одинаковый результат по одному и тому же seed
- сериализовать состояние run
- расширять контент декларативно
- разбирать спорные бои через event log

## 6. Layered Architecture

### 6.1. Content Layer

Хранит статические данные:

- описания юнитов
- описания еды
- tier tables
- trigger dictionaries
- effect dictionaries
- балансные числа

Предпочтительные форматы:

- `JSON`
- или `TypeScript`-объекты с валидацией

### 6.2. Domain Layer

Сердце проекта. Здесь живут:

- сущности юнита, команды, магазина и run
- shop engine
- battle engine
- merge / experience rules
- event queue
- effect resolver
- RNG abstraction

Этот слой не должен знать ничего о:

- `React`
- `DOM`
- `Canvas`
- `localStorage`
- сетевых запросах

### 6.3. Application Layer

Оркестрирует use cases:

- `startRun`
- `startTurn`
- `rollShop`
- `buyUnit`
- `sellUnit`
- `mergeUnits`
- `freezeSlot`
- `feedUnit`
- `startBattle`
- `resolveRound`
- `saveRun`
- `loadRun`

### 6.4. Infrastructure Layer

Отвечает за:

- storage
- загрузку данных
- seed generation
- telemetry
- remote config
- внешние сервисы

### 6.5. Presentation Layer

Содержит:

- экраны
- battle playback
- touch drag / drop
- selection states
- tooltips / info panels
- анимации событий

UI только показывает и отправляет команды. Он не должен быть носителем игровых правил.

## 7. Determinism Rules

Для auto battler это критично.

Обязательные правила:

- весь случайный выбор идет через единый RNG-интерфейс
- никаких `Math.random()` внутри доменной логики
- один и тот же input snapshot плюс тот же seed дают тот же результат
- battle log должен позволять дебажить resolution order

## 8. Event Model

Вместо ad-hoc логики лучше строить бой через явные события.

Минимальный набор событий для MVP:

- `TURN_STARTED`
- `SHOP_ROLLED`
- `PET_BOUGHT`
- `PET_SOLD`
- `PETS_MERGED`
- `FOOD_USED`
- `BATTLE_STARTED`
- `ABILITY_TRIGGERED`
- `DAMAGE_DEALT`
- `PET_HURT`
- `PET_FAINTED`
- `PET_SUMMONED`
- `BATTLE_ENDED`
- `ROUND_RESOLVED`

Хорошая практика:

- domain меняет state
- одновременно пишет нормализованный event log

## 9. Resolution Order

Самая опасная часть жанра — не контент, а неявный порядок резолва.

Пример каркаса:

1. `Start of battle`
2. выбор атакующих
3. одновременный обмен уроном
4. death check
5. faint triggers
6. summon resolution
7. empty-front checks
8. переход к следующему обмену

Если появляется новый trigger type, он обязан быть явно встроен в эту последовательность.

## 10. Content Authoring Rules

Каждый юнит должен описываться как данные, а не как отдельный кусок bespoke-кода.

Желательная структура:

- `id`
- `name`
- `tier`
- `baseStats`
- `tags`
- `triggers`
- `targeting`
- `effectsByLevel`

Антипаттерн:

- отдельные `if (unit.id === "...")` как основной способ расширять контент

## 11. Recommended MVP Trigger Set

Чтобы не утонуть в сложности, в ранней версии лучше поддержать только:

- `Buy`
- `Sell`
- `Start of turn`
- `End turn`
- `Start of battle`
- `Hurt`
- `Faint`
- `Friend summoned`
- `Level-up`

Позже можно добавлять:

- `Before attack`
- `After attack`
- `Knock out`
- `Enemy summoned`
- `Transform`

## 12. Balance Direction

В `SAP-like` проекте баланс не должен начинаться с бесконечного числа юнитов.

Сначала важно добиться:

- нескольких рабочих архетипов
- стабильной ранней игры
- читаемого midgame power curve
- отсутствия одной доминирующей экономической линии

Приоритеты баланса:

1. Ясность решений
2. Темп матча
3. Разнообразие билдов
4. Красота отдельных карт

## 13. Testing Strategy

Минимальный обязательный набор тестов, когда тестовый слой появится:

- merge и опыт
- level-up rewards
- freeze / roll / shop refresh
- порядок start-of-battle триггеров
- faint и summon chains
- ничьи и одновременные смерти
- детерминизм по seed

До появления тестов минимум после изменений:

- `npm run typecheck`

## 14. UX Requirements

Даже сильный battle core развалится без хорошего shop UX.

Обязательные свойства:

- основные действия в `1-2` тапа
- читаемые числа атаки и здоровья
- понятный selection state
- предсказуемое drag/drop или tap-to-place поведение
- touch-friendly зоны на мобильном landscape
- никаких решений, которые хороши только из-за hover мыши

## 15. Performance Requirements

MVP не обязан быть технически сложным, но обязан быть отзывчивым.

- shop actions должны ощущаться моментальными
- бой должен быстро симулироваться даже при длинных summon chains
- UI не должен пересчитывать доменную логику на каждом рендере

## 16. Non-Goals

Мы не оптимизируем проект на старте под:

- максимально широкий feature set
- ультра-сложный late game
- сетевую архитектуру реального времени
- все pack-механики SAP сразу

Правильный путь:

- сначала чистый playable core
- потом контент
- потом расширяющие системы

## 17. F2P Architecture Direction

Если проект развивается не как онлайн-clone `Super Auto Pets`, а как `f2p` игра, использующая `SAP` только как core-mechanic reference, архитектура должна заранее разделять несколько независимых слоев.

### 17.1. Four System Groups

Минимум нужно мыслить четырьмя системами:

- `core simulation`
- `content and balance`
- `meta progression`
- `economy and live ops`

### 17.2. What Must Be Separated Early

С самого начала нужно разделять:

- правила боя и магазина
- контент юнитов и эффектов
- балансные числа
- мета-прогрессию аккаунта
- валюты и награды
- presentation/UI

Правильная зависимость такая:

`simulation -> content -> balance -> meta/economy -> presentation`

UI не должен быть источником истины ни для механики, ни для монетизации.

### 17.3. Recommended High-Level Layout

Желательное разбиение:

- `src/core/`
  - rng
  - battle
  - shop
  - triggers
  - effects
  - resolver
  - run state
- `src/content/`
  - units
  - foods
  - statuses
  - packs
  - encounters
- `src/balance/`
  - run economy
  - shop numbers
  - xp curves
  - reward tables
  - difficulty curves
  - meta economy
- `src/meta/`
  - profile
  - unlocks
  - quests
  - currencies
  - progression state
- `src/app/`
  - use cases / orchestration
- `src/ui/`
  - screens
  - components
  - transitions
  - input handling
- `src/infra/`
  - save/load
  - analytics
  - remote config
  - time provider

### 17.4. Simulation Rules

Для `SAP-like` core обязательны:

- детерминированный RNG
- фиксированный resolution order
- воспроизводимость боев по seed
- возможность симулировать бой и магазин без UI
- event log хотя бы на уровне внутреннего debug pipeline

### 17.5. Content As Data

Нужно выносить в данные не только числа, но и грамматику контента.

Не только:

- `balance.ts`

Но и:

- базовые статы
- цену
- тир
- теги
- триггеры
- таргетинг
- эффекты
- scaling by level
- availability rules

### 17.6. Balance Layer

Балансные числа должны быть отделены от симулятора.

Лучше дробить баланс по подсистемам:

- `runEconomy`
- `shopBalance`
- `unitStatCurves`
- `xpCurves`
- `difficultyBalance`
- `rewardTables`
- `metaEconomy`

Типичные числа balance layer:

- стартовое золото
- roll cost
- buy/sell cost
- shop slot count
- tier unlock timing
- max stat caps
- xp thresholds
- enemy power curves
- reward payouts
- unlock costs

### 17.7. Meta Progression

Так как игра `f2p` и не опирается на live PvP как на главный replay driver, нужен отдельный meta loop.

Нужно заранее ответить:

- зачем игрок начинает следующий run
- что остается между забегами
- что анлочивается аккаунтом
- какие есть долгосрочные цели вне одного боя

Это может быть:

- account progression
- unlock tree
- collection layer
- relic/modifier system
- chapter progression
- quests
- battle pass / seasonal layer

Важно, чтобы meta progression не ломала честность core simulation.

### 17.8. PvE Encounter Architecture

Если игра не онлайн, replayability должна идти не через matchmaking, а через encounter design.

Нужен отдельный `encounter system`, который поддерживает:

- scripted enemy teams
- seeded runs
- daily challenge seeds
- wave chains
- boss encounters
- difficulty modifiers

### 17.9. Economy And Live Ops

Для `f2p` особенно важно не смешивать:

- run economy
- meta soft currency
- premium currency
- reward distribution
- monetization surfaces

Нужно отдельно проектировать:

- `sources`
- `sinks`
- `payout pacing`
- `unlock pacing`
- `engagement rewards`

Монетизация не должна быть захардкожена в battle/shop code.

### 17.10. Long-Lived Product Concerns

Если проект рассчитывается как долго живущая `f2p` игра, заранее нужны extension points для:

- save schema versioning
- analytics events
- remote config
- content validation
- simulation test fixtures
- daily seed support
- encounter authoring

### 17.11. Practical Rule

Для `SAP-like f2p` проекта три ключевых правила такие:

1. `engine must live without UI`
2. `content must be data, not special-case code`
3. `balance, meta and monetization must be separate layers`
