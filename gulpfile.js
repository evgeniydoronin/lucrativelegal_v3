const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const os = require('os');

// Функция для получения локального IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ищем IPv4, не внутренний, не loopback
      if (interface.family === 'IPv4' && 
          !interface.internal && 
          interface.address !== '127.0.0.1') {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Пути к файлам
const paths = {
  styles: {
    src: 'src/styles/**/*.scss',
    main: 'src/styles/main.scss',
    dest: 'dist/css/',
    watch: 'src/styles/**/*.scss'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    main: 'src/scripts/main.js',
    dest: 'dist/js/',
    watch: 'src/scripts/**/*.js'
  },
  html: {
    src: 'src/**/*.html',
    dest: 'dist/',
    watch: 'src/**/*.html'
  },
  images: {
    src: 'src/assets/images/**/*',
    dest: 'dist/assets/images/',
    watch: 'src/assets/images/**/*'
  },
  fonts: {
    src: 'src/assets/fonts/**/*',
    dest: 'dist/assets/fonts/',
    watch: 'src/assets/fonts/**/*'
  },
  videos: {
    src: 'src/assets/videos/**/*',
    dest: 'dist/assets/videos/',
    watch: 'src/assets/videos/**/*'
  },
  components: {
    src: 'src/components/**/*',
    watch: 'src/components/**/*'
  }
};

// Обработка ошибок
const handleError = (err) => {
  console.log('Gulp Error:', err.toString());
};

// Компиляция SCSS
function styles() {
  return gulp
    .src(paths.styles.main)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: ['node_modules']
    }))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Минификация CSS для production
function stylesMin() {
  return gulp
    .src(paths.styles.main)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['node_modules']
    }))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.styles.dest));
}

// Обработка JavaScript (все файлы из src/scripts)
function scripts() {
  return gulp
    .src('src/scripts/**/*.js')
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Минификация JavaScript для production
function scriptsMin() {
  return gulp
    .src('src/scripts/main.js')
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scripts.dest));
}

// Обработка компонентов
function components() {
  return gulp
    .src('src/components/**/*.{scss,js}')
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(gulp.dest('dist/components/'))
    .pipe(browserSync.stream());
}

// Обработка HTML с file-include
function html() {
  return gulp
    .src('src/index.html')
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'src/',
      indent: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Минификация HTML для production
function htmlMin() {
  return gulp
    .src('src/index.html')
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'src/',
      indent: true
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest(paths.html.dest));
}

// Копирование изображений (без оптимизации)
function images() {
  return gulp
    .src(paths.images.src)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(gulp.dest(paths.images.dest));
}

// Копирование шрифтов
function fonts() {
  return gulp
    .src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

// Копирование видео файлов
function videos() {
  return gulp
    .src(paths.videos.src)
    .pipe(plumber({ errorHandler: handleError }))
    .pipe(gulp.dest(paths.videos.dest));
}

// Копирование ресурсов
function assets(done) {
  return gulp.parallel(images, fonts, videos)(done);
}

// Browser-Sync сервер
function serve() {
  const localIP = getLocalIP();
  
  browserSync.init({
    server: {
      baseDir: './dist'
    },
    host: '0.0.0.0',
    port: 3000,
    ui: { port: 3001 },
    notify: false,
    open: false,
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: true
    }
  }, function() {
    // Callback выполняется после инициализации
    const port = browserSync.getOption('port');
    const uiPort = browserSync.getOption('ui.port');
    
    // Красивый вывод адресов с реальными портами
    console.log('\n🌐 Development Server Started!');
    console.log(`📱 Local:    http://localhost:${port}`);
    console.log(`🌍 Network:  http://${localIP}:${port}`);
    console.log(`⚙️  UI:       http://${localIP}:${uiPort}`);
    console.log('\n📋 For remote access from Arch Linux:');
    console.log(`   http://${localIP}:${port}\n`);
  });
}

// Отслеживание изменений
function watchFiles() {
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.scripts.watch, scripts);
  gulp.watch(paths.components.watch, gulp.series(components, styles, scripts));
  gulp.watch(paths.html.watch, html);
  gulp.watch(paths.images.watch, images);
  gulp.watch(paths.fonts.watch, fonts);
  gulp.watch(paths.videos.watch, videos);
}

// Очистка dist папки
function clean(done) {
  const { deleteSync } = require('del');
  deleteSync(['dist/**/*']);
  done();
}

// Создание компонента
function createComponent(done) {
  const componentName = process.argv[4] || 'new-component';
  const fs = require('fs');
  const path = require('path');
  
  const componentDir = `src/components/${componentName}`;
  
  // Создаем папку компонента
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  // HTML шаблон
  const htmlTemplate = `<!-- ${componentName} component -->
<div class="llg-${componentName}" data-component="${componentName}">
  <div class="llg-container">
    <div class="llg-grid">
      <div class="col-span-4 md:col-span-8 xl:col-span-12">
        <h2 class="llg-heading-l">{{title}}</h2>
        <p class="llg-body">{{content}}</p>
      </div>
    </div>
  </div>
</div>`;
  
  // SCSS шаблон
  const scssTemplate = `// ${componentName} component styles
@use '../abstracts' as *;

.llg-${componentName} {
  @apply llg-section-spacing;
  
  // Component specific styles here
  
  &__container {
    @apply llg-container llg-spacing;
  }
  
  &__content {
    // Content styles
  }
}`;
  
  // JavaScript шаблон
  const jsTemplate = `// ${componentName} component
export class ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Component {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaults, ...options };
    this.init();
  }
  
  get defaults() {
    return {
      // Default options
    };
  }
  
  init() {
    this.setupEventListeners();
    console.log('✅ ${componentName} component initialized');
  }
  
  setupEventListeners() {
    // Event listeners
  }
  
  destroy() {
    // Cleanup
    console.log('🗑️ ${componentName} component destroyed');
  }
  
  static autoInit(selector = '[data-component="${componentName}"]') {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => new ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Component(el));
  }
}

// Auto-initialization
document.addEventListener('DOMContentLoaded', () => {
  ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Component.autoInit();
});

export default ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Component;`;
  
  // README шаблон
  const readmeTemplate = `# ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Component

## Description
Brief description of the ${componentName} component.

## Usage
\`\`\`html
${htmlTemplate}
\`\`\`

## Options
- \`option1\`: Description
- \`option2\`: Description

## Methods
- \`init()\`: Initialize component
- \`destroy()\`: Cleanup component

## Events
- \`${componentName}:initialized\`: Fired when component is initialized
- \`${componentName}:destroyed\`: Fired when component is destroyed
`;
  
  // Создаем файлы
  fs.writeFileSync(path.join(componentDir, `${componentName}.html`), htmlTemplate);
  fs.writeFileSync(path.join(componentDir, `${componentName}.scss`), scssTemplate);
  fs.writeFileSync(path.join(componentDir, `${componentName}.js`), jsTemplate);
  fs.writeFileSync(path.join(componentDir, 'README.md'), readmeTemplate);
  
  console.log(`✅ Component "${componentName}" created successfully!`);
  done();
}

// WordPress сборка
function wordpressBuild() {
  return gulp.parallel(
    () => gulp.src('dist/**/*').pipe(gulp.dest('wordpress/assets/')),
    () => gulp.src('src/components/**/*.php').pipe(gulp.dest('wordpress/components/'))
  )();
}

// Экспорт задач
exports.styles = styles;
exports.scripts = scripts;
exports.components = components;
exports.html = html;
exports.images = images;
exports.fonts = fonts;
exports.videos = videos;
exports.assets = assets;
exports.clean = clean;
exports.serve = serve;
exports.createComponent = createComponent;

// Составные задачи
exports.build = gulp.series(
  clean,
  gulp.parallel(stylesMin, scriptsMin, htmlMin, assets, components)
);

exports.dev = gulp.series(
  clean,
  gulp.parallel(styles, scripts, html, assets),
  gulp.parallel(serve, watchFiles)
);

exports.watch = gulp.parallel(serve, watchFiles);

// WordPress задачи
exports['wordpress:build'] = gulp.series(exports.build, wordpressBuild);

// Задачи для отдельных частей
exports['sass:build'] = stylesMin;
exports['sass:watch'] = gulp.series(styles, () => gulp.watch(paths.styles.watch, styles));
exports['html:build'] = htmlMin;
exports['assets:copy'] = assets;

// Задача по умолчанию
exports.default = exports.dev;
