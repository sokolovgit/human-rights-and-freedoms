# Права і свободи людини — практичні

КПІ ім. Ігоря Сікорського, 3 курс. Дев'ять практичних занять; до кожного — доповідь із
презентацією. Презентації пишуться як HTML + CSS і збираються в PDF через headless Chrome.

## Структура

```
docs/
  course.md      конспект силабусу: РСО, теми, критерії оцінювання
  sources.md     посібник 2023, силабус, посилання
  refs/          локальні копії PDF/DOCX (поза git)
shared/
  theme.css      дизайн-токени та лейаути — спільні для всіх практичних
  deck.js        навігація стрілками
  fonts/         Inter (woff2, кирилиця) — локально, без запитів до Google Fonts
templates/
  index.html     заготовка презентації
practicals/
  01-derzhava-ta-hromadianske-suspilstvo/
    index.html   слайди
    task.md      умова заняття, питання для обговорення, СРС, тести
    sources.md   перелік використаних джерел
  02-…/
scripts/
  build.sh       збірка → out/<slug>/praktychna-NN.pdf + out/<slug>/png/
  to-pptx.py     PNG → .pptx для аудиторій, де потрібен саме PowerPoint
  shots.mjs      поslайдові PNG для візуальної перевірки (паралельно, з ретраєм)
  check.mjs      пошук слайдів, де контент вилазить за межі кадру
  new.sh         каркас нового практичного
out/             результати збірки (поза git)
```

Стиль лежить в `shared/`, тож правка токенів оновлює всі дев'ять презентацій одразу.
Шрифти теж локальні — рендер не ходить у мережу, інакше Chrome зависає на запиті до Google Fonts.

## Використання

```bash
bash scripts/build.sh 01                 # одне заняття
bash scripts/build.sh all                # усі
bash scripts/new.sh 02 pravo-yak-rehuliator "Практичне 2"

open practicals/01-*/index.html          # показ: ←/→ гортати, f — фулскрін, a — усі слайди
```

PDF: сторінка 13.33×7.5″ (16:9), одна сторінка = один слайд.

## Як показувати

- **PDF** — `open out/<slug>/praktychna-NN.pdf`, у Preview `View → Slideshow`. Найнадійніше.
- **Браузер** — `open practicals/NN-*/index.html`; `←`/`→` гортати, `f` фулскрін, `a` усі слайди.
- **PowerPoint** — `pip install python-pptx`, далі `build.sh` покладе поряд `.pptx`
  (кожен слайд — картинка, тому текст нередагований, але показується один в один).

`build.sh` після рендеру запускає перевірку вміщення: слайди з переповненням друкуються
як `NN:+Npx`. Слайд має фіксований кадр 1280×720, тому зайвий текст не «з'їжджає» — він
просто обрізається, і помітити це на око важко.

## Лейаути

`slide--cover` · `slide--section` · `ul.bullets` · `ol.steps` · `.cols` (+`--wide`/`--narrow`) ·
`.card` · `.quote`
