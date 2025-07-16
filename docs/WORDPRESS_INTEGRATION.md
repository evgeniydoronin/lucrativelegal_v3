# 🔌 Интеграция с WordPress

## 📋 Обзор

Руководство по интеграции модульной архитектуры Lucrative Legal Group v3 с WordPress.

## 🏗️ Структура WordPress темы

```
wp-content/themes/lucrativelegal/
├── style.css                  # Основной файл темы
├── index.php                  # Главный шаблон
├── functions.php              # Функции темы
├── screenshot.png             # Скриншот темы
├── components/                # 🧩 Компоненты (из src/)
│   ├── hero/
│   │   ├── hero.php
│   │   ├── hero.scss
│   │   └── hero.js
│   ├── services/
│   ├── shared/
│   │   ├── header/
│   │   ├── footer/
│   │   └── navigation/
│   └── ...
├── template-parts/            # Части шаблонов
│   ├── header.php
│   ├── footer.php
│   └── content/
├── inc/                       # Дополнительные функции
│   ├── component-loader.php   # Загрузчик компонентов
│   ├── enqueue-scripts.php    # Подключение ресурсов
│   ├── customizer.php         # Настройки темы
│   ├── post-types.php         # Кастомные типы постов
│   └── admin/                 # Админ функции
├── assets/                    # Собранные файлы (из dist/)
│   ├── css/
│   ├── js/
│   ├── images/
│   └── fonts/
├── page-templates/            # Шаблоны страниц
│   ├── page-home.php
│   ├── page-services.php
│   └── page-contact.php
├── archive-templates/         # Шаблоны архивов
├── single-templates/          # Шаблоны записей
└── languages/                 # Переводы
    ├── lucrativelegal.pot
    └── ru_RU.po
```

## 📝 Основные файлы темы

### style.css

```css
/*
Theme Name: Lucrative Legal Group
Description: Modern modular theme for legal services
Version: 3.0.0
Author: Your Name
Text Domain: lucrativelegal
Domain Path: /languages
Requires at least: 6.0
Tested up to: 6.3
Requires PHP: 8.0
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Tags: business, legal, modern, responsive, accessibility-ready
*/

/* Основные стили подключаются через functions.php */
```

### functions.php

```php
<?php
/**
 * Lucrative Legal Group Theme Functions
 */

// Предотвращаем прямой доступ
if (!defined('ABSPATH')) {
    exit;
}

// Константы темы
define('LLG_THEME_VERSION', '3.0.0');
define('LLG_THEME_PATH', get_template_directory());
define('LLG_THEME_URL', get_template_directory_uri());

// Подключаем основные файлы
require_once LLG_THEME_PATH . '/inc/component-loader.php';
require_once LLG_THEME_PATH . '/inc/enqueue-scripts.php';
require_once LLG_THEME_PATH . '/inc/customizer.php';
require_once LLG_THEME_PATH . '/inc/post-types.php';

/**
 * Настройка темы
 */
function llg_theme_setup() {
    // Поддержка переводов
    load_theme_textdomain('lucrativelegal', LLG_THEME_PATH . '/languages');
    
    // Поддержка HTML5
    add_theme_support('html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ]);
    
    // Поддержка миниатюр
    add_theme_support('post-thumbnails');
    
    // Размеры изображений
    add_image_size('hero-bg', 1920, 1080, true);
    add_image_size('service-thumb', 400, 300, true);
    add_image_size('portfolio-thumb', 600, 400, true);
    
    // Поддержка меню
    register_nav_menus([
        'primary' => __('Primary Menu', 'lucrativelegal'),
        'footer' => __('Footer Menu', 'lucrativelegal'),
        'legal' => __('Legal Menu', 'lucrativelegal')
    ]);
    
    // Поддержка логотипа
    add_theme_support('custom-logo', [
        'height' => 100,
        'width' => 300,
        'flex-height' => true,
        'flex-width' => true
    ]);
    
    // Поддержка заголовка документа
    add_theme_support('title-tag');
    
    // Поддержка RSS ссылок
    add_theme_support('automatic-feed-links');
    
    // Поддержка широких блоков Gutenberg
    add_theme_support('align-wide');
    
    // Поддержка кастомных цветов
    add_theme_support('editor-color-palette', [
        [
            'name' => __('Primary Blue', 'lucrativelegal'),
            'slug' => 'primary-blue',
            'color' => '#667eea'
        ],
        [
            'name' => __('Secondary Purple', 'lucrativelegal'),
            'slug' => 'secondary-purple',
            'color' => '#764ba2'
        ],
        [
            'name' => __('Accent Pink', 'lucrativelegal'),
            'slug' => 'accent-pink',
            'color' => '#f093fb'
        ]
    ]);
}
add_action('after_setup_theme', 'llg_theme_setup');

/**
 * Регистрация виджетов
 */
function llg_widgets_init() {
    register_sidebar([
        'name' => __('Footer Widget Area 1', 'lucrativelegal'),
        'id' => 'footer-1',
        'description' => __('Add widgets here to appear in footer.', 'lucrativelegal'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h3 class="widget-title">',
        'after_title' => '</h3>'
    ]);
    
    register_sidebar([
        'name' => __('Footer Widget Area 2', 'lucrativelegal'),
        'id' => 'footer-2',
        'description' => __('Add widgets here to appear in footer.', 'lucrativelegal'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h3 class="widget-title">',
        'after_title' => '</h3>'
    ]);
}
add_action('widgets_init', 'llg_widgets_init');

/**
 * Глобальная функция для подключения компонентов
 */
function get_component($name, $args = []) {
    return LLG_Component_Loader::load_component($name, $args);
}

/**
 * Хук для кастомизации компонентов
 */
function llg_component_args($args, $component_name) {
    // Можно модифицировать аргументы компонентов
    return $args;
}
add_filter('llg_component_args', 'llg_component_args', 10, 2);
```

## 🧩 Система загрузки компонентов

### inc/component-loader.php

```php
<?php
/**
 * Загрузчик компонентов
 */

class LLG_Component_Loader {
    
    private static $loaded_components = [];
    private static $component_configs = [];
    
    /**
     * Загрузка компонента
     */
    public static function load_component($name, $args = []) {
        // Проверяем существование компонента
        $component_path = LLG_THEME_PATH . "/components/{$name}/{$name}.php";
        
        if (!file_exists($component_path)) {
            if (WP_DEBUG) {
                error_log("Component not found: {$name}");
            }
            return false;
        }
        
        // Загружаем конфигурацию компонента
        self::load_component_config($name);
        
        // Подключаем ресурсы компонента
        self::enqueue_component_assets($name);
        
        // Применяем фильтры к аргументам
        $args = apply_filters('llg_component_args', $args, $name);
        $args = apply_filters("llg_component_{$name}_args", $args);
        
        // Устанавливаем переменные для компонента
        $component_id = 'component-' . $name . '-' . uniqid();
        $component_classes = self::get_component_classes($name, $args);
        
        // Добавляем в список загруженных
        self::$loaded_components[] = $name;
        
        // Хук перед загрузкой компонента
        do_action('llg_before_component_load', $name, $args);
        do_action("llg_before_{$name}_component_load", $args);
        
        // Подключаем компонент
        ob_start();
        include $component_path;
        $output = ob_get_clean();
        
        // Хук после загрузки компонента
        do_action('llg_after_component_load', $name, $args);
        do_action("llg_after_{$name}_component_load", $args);
        
        return $output;
    }
    
    /**
     * Загрузка конфигурации компонента
     */
    private static function load_component_config($name) {
        if (isset(self::$component_configs[$name])) {
            return self::$component_configs[$name];
        }
        
        $config_path = LLG_THEME_PATH . "/components/{$name}/config.json";
        
        if (file_exists($config_path)) {
            $config = json_decode(file_get_contents($config_path), true);
            self::$component_configs[$name] = $config;
            return $config;
        }
        
        return [];
    }
    
    /**
     * Подключение ресурсов компонента
     */
    private static function enqueue_component_assets($name) {
        $config = self::load_component_config($name);
        
        // CSS
        $css_path = "/components/{$name}/{$name}.css";
        if (file_exists(LLG_THEME_PATH . $css_path)) {
            wp_enqueue_style(
                "llg-component-{$name}",
                LLG_THEME_URL . $css_path,
                [],
                LLG_THEME_VERSION
            );
        }
        
        // JavaScript
        $js_path = "/components/{$name}/{$name}.js";
        if (file_exists(LLG_THEME_PATH . $js_path)) {
            $dependencies = ['jquery'];
            
            // Добавляем зависимости из конфига
            if (isset($config['dependencies']['js'])) {
                $dependencies = array_merge($dependencies, $config['dependencies']['js']);
            }
            
            wp_enqueue_script(
                "llg-component-{$name}",
                LLG_THEME_URL . $js_path,
                $dependencies,
                LLG_THEME_VERSION,
                true
            );
            
            // Передаем данные в JavaScript
            wp_localize_script("llg-component-{$name}", "llgComponent{$name}Data", [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce("llg_{$name}_nonce"),
                'config' => $config
            ]);
        }
    }
    
    /**
     * Получение CSS классов компонента
     */
    private static function get_component_classes($name, $args) {
        $classes = [$name];
        
        // Добавляем модификаторы из аргументов
        if (isset($args['modifier'])) {
            if (is_array($args['modifier'])) {
                foreach ($args['modifier'] as $modifier) {
                    $classes[] = "{$name}--{$modifier}";
                }
            } else {
                $classes[] = "{$name}--{$args['modifier']}";
            }
        }
        
        // Добавляем кастомные классы
        if (isset($args['css_class'])) {
            $classes[] = $args['css_class'];
        }
        
        return implode(' ', $classes);
    }
    
    /**
     * Получение списка загруженных компонентов
     */
    public static function get_loaded_components() {
        return self::$loaded_components;
    }
}
```

## 📦 Подключение ресурсов

### inc/enqueue-scripts.php

```php
<?php
/**
 * Подключение стилей и скриптов
 */

/**
 * Подключение основных ресурсов
 */
function llg_enqueue_scripts() {
    // Основные стили
    wp_enqueue_style(
        'llg-main-styles',
        LLG_THEME_URL . '/assets/css/main.css',
        [],
        LLG_THEME_VERSION
    );
    
    // Google Fonts
    wp_enqueue_style(
        'llg-google-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
        [],
        null
    );
    
    // GSAP
    wp_enqueue_script(
        'gsap',
        'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
        [],
        '3.13.0',
        true
    );
    
    wp_enqueue_script(
        'gsap-scrolltrigger',
        'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
        ['gsap'],
        '3.13.0',
        true
    );
    
    // Lenis для плавного скролла
    wp_enqueue_script(
        'lenis',
        'https://unpkg.com/lenis@1.1.5/dist/lenis.min.js',
        [],
        '1.1.5',
        true
    );
    
    // Основной JavaScript
    wp_enqueue_script(
        'llg-main-script',
        LLG_THEME_URL . '/assets/js/main.js',
        ['jquery', 'gsap', 'gsap-scrolltrigger', 'lenis'],
        LLG_THEME_VERSION,
        true
    );
    
    // Передаем данные в JavaScript
    wp_localize_script('llg-main-script', 'llgData', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'homeUrl' => home_url('/'),
        'themeUrl' => LLG_THEME_URL,
        'nonce' => wp_create_nonce('llg_nonce'),
        'isAdmin' => is_admin(),
        'isMobile' => wp_is_mobile(),
        'currentPage' => get_queried_object_id(),
        'settings' => [
            'animationsEnabled' => get_theme_mod('llg_animations_enabled', true),
            'performanceMode' => get_theme_mod('llg_performance_mode', 'auto'),
            'debugMode' => WP_DEBUG
        ]
    ]);
    
    // Условные скрипты
    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'llg_enqueue_scripts');

/**
 * Подключение админских ресурсов
 */
function llg_admin_enqueue_scripts($hook) {
    // Только на страницах темы
    if (strpos($hook, 'llg-') === false) {
        return;
    }
    
    wp_enqueue_style(
        'llg-admin-styles',
        LLG_THEME_URL . '/assets/css/admin.css',
        [],
        LLG_THEME_VERSION
    );
    
    wp_enqueue_script(
        'llg-admin-script',
        LLG_THEME_URL . '/assets/js/admin.js',
        ['jquery'],
        LLG_THEME_VERSION,
        true
    );
}
add_action('admin_enqueue_scripts', 'llg_admin_enqueue_scripts');

/**
 * Оптимизация загрузки ресурсов
 */
function llg_optimize_resources() {
    // Удаляем ненужные стили WordPress
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-block-style');
    
    // Удаляем emoji скрипты
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    
    // Удаляем ненужные мета теги
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'rsd_link');
}
add_action('wp_enqueue_scripts', 'llg_optimize_resources', 100);

/**
 * Добавление атрибутов к скриптам
 */
function llg_add_script_attributes($tag, $handle, $src) {
    // Добавляем defer к основным скриптам
    $defer_scripts = [
        'llg-main-script',
        'gsap',
        'gsap-scrolltrigger',
        'lenis'
    ];
    
    if (in_array($handle, $defer_scripts)) {
        $tag = str_replace(' src', ' defer src', $tag);
    }
    
    return $tag;
}
add_filter('script_loader_tag', 'llg_add_script_attributes', 10, 3);

/**
 * Preload критических ресурсов
 */
function llg_preload_resources() {
    // Preload основного CSS
    echo '<link rel="preload" href="' . LLG_THEME_URL . '/assets/css/main.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">';
    
    // Preload Google Fonts
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
    
    // Preload критических изображений
    if (is_front_page()) {
        $hero_image = get_theme_mod('llg_hero_background');
        if ($hero_image) {
            echo '<link rel="preload" href="' . esc_url($hero_image) . '" as="image">';
        }
    }
}
add_action('wp_head', 'llg_preload_resources', 1);
```

## 🎨 Пример компонента Hero

### components/hero/hero.php

```php
<?php
/**
 * Hero Component
 */

// Настройки по умолчанию
$defaults = [
    'title' => get_bloginfo('name'),
    'subtitle' => get_bloginfo('description'),
    'background' => get_theme_mod('llg_hero_background', ''),
    'cta_text' => __('Get Started', 'lucrativelegal'),
    'cta_link' => '#contact',
    'show_scroll_indicator' => true,
    'parallax' => get_theme_mod('llg_hero_parallax', true),
    'overlay_opacity' => get_theme_mod('llg_hero_overlay', 0.4),
    'text_align' => get_theme_mod('llg_hero_text_align', 'center'),
    'height' => get_theme_mod('llg_hero_height', 'fullscreen')
];

// Объединяем с переданными параметрами
$args = wp_parse_args($args ?? [], $defaults);
extract($args);

// Генерируем уникальный ID
$component_id = 'hero-' . uniqid();

// CSS классы
$css_classes = ['hero'];
$css_classes[] = "hero--{$height}";
$css_classes[] = "hero--{$text_align}";

if ($parallax) {
    $css_classes[] = 'hero--parallax';
}

if (!empty($args['css_class'])) {
    $css_classes[] = $args['css_class'];
}

// Data атрибуты
$data_attrs = [
    'data-component' => 'hero',
    'data-parallax' => $parallax ? 'true' : 'false',
    'data-overlay-opacity' => $overlay_opacity
];

// Применяем фильтры WordPress
$title = apply_filters('llg_hero_title', $title);
$subtitle = apply_filters('llg_hero_subtitle', $subtitle);
$background = apply_filters('llg_hero_background', $background);

// Получаем изображение из медиабиблиотеки
if (is_numeric($background)) {
    $background_data = wp_get_attachment_image_src($background, 'hero-bg');
    $background = $background_data ? $background_data[0] : '';
}

// Schema.org разметка
$schema = [
    '@context' => 'https://schema.org',
    '@type' => 'Organization',
    'name' => $title,
    'description' => $subtitle,
    'url' => home_url()
];
?>

<section 
    id="<?php echo esc_attr($component_id); ?>" 
    class="<?php echo esc_attr(implode(' ', $css_classes)); ?>"
    <?php foreach ($data_attrs as $attr => $value): ?>
        <?php echo esc_attr($attr); ?>="<?php echo esc_attr($value); ?>"
    <?php endforeach; ?>
    itemscope 
    itemtype="https://schema.org/Organization"
>
    <?php if (!empty($background)): ?>
        <div class="hero__media">
            <div 
                class="hero__background" 
                data-bg-src="<?php echo esc_url($background); ?>"
                style="background-image: url(<?php echo esc_url($background); ?>);"
            ></div>
            <div 
                class="hero__overlay" 
                style="opacity: <?php echo esc_attr($overlay_opacity); ?>;"
            ></div>
        </div>
    <?php endif; ?>
    
    <div class="hero__container">
        <div class="hero__content">
            <?php if (!empty($title)): ?>
                <h1 class="hero__title" itemprop="name">
                    <?php echo wp_kses_post($title); ?>
                </h1>
            <?php endif; ?>
            
            <?php if (!empty($subtitle)): ?>
                <p class="hero__subtitle" itemprop="description">
                    <?php echo wp_kses_post($subtitle); ?>
                </p>
            <?php endif; ?>
            
            <?php if (!empty($cta_text) && !empty($cta_link)): ?>
                <div class="hero__actions">
                    <a 
                        href="<?php echo esc_url($cta_link); ?>" 
                        class="hero__cta btn btn--primary"
                        itemprop="url"
                    >
                        <?php echo esc_html($cta_text); ?>
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <?php if ($show_scroll_indicator): ?>
        <div class="hero__scroll-indicator" data-scroll-target="next-section">
            <span class="hero__scroll-text">
                <?php _e('Scroll Down', 'lucrativelegal'); ?>
            </span>
            <div class="hero__scroll-arrow"></div>
        </div>
    <?php endif; ?>
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
        <?php echo wp_json_encode($schema); ?>
    </script>
</section>

<?php
// WordPress action для дополнительной функциональности
do_action('llg_after_hero_component', $args);
?>
```

## 🎛️ Customizer интеграция

### inc/customizer.php

```php
<?php
/**
 * WordPress Customizer настройки
 */

function llg_customize_register($wp_customize) {
    
    // Секция Hero
    $wp_customize->add_section('llg_hero', [
        'title' => __('Hero Section', 'lucrativelegal'),
        'priority' => 30
    ]);
    
    // Hero фоновое изображение
    $wp_customize->add_setting('llg_hero_background', [
        'default' => '',
        'sanitize_callback' => 'absint'
    ]);
    
    $wp_customize->add_control(new WP_Customize_Media_Control($wp_customize, 'llg_hero_background', [
        'label' => __('Hero Background Image', 'lucrativelegal'),
        'section' => 'llg_hero',
        'mime_type' => 'image'
    ]));
    
    // Hero заголовок
    $wp_customize->add_setting('llg_hero_title', [
        'default' => get_bloginfo('name'),
        'sanitize_callback' => 'sanitize_text_field'
    ]);
    
    $wp_customize->add_control('llg_hero_title', [
        'label' => __('Hero Title', 'lucrativelegal'),
        'section' => 'llg_hero',
        'type' => 'text'
    ]);
    
    // Hero подзаголовок
    $wp_customize->add_setting('llg_hero_subtitle', [
        'default' => get_bloginfo('description'),
        'sanitize_callback' => 'sanitize_textarea_field'
    ]);
    
    $wp_customize->add_control('llg_hero_subtitle', [
        'label' => __('Hero Subtitle', 'lucrativelegal'),
        'section' => 'llg_hero',
        'type' => 'textarea'
    ]);
    
    // Параллакс эффект
    $wp_customize->add_setting('llg_hero_parallax', [
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean'
    ]);
    
    $wp_customize->add_control('llg_hero_parallax', [
        'label' => __('Enable Parallax Effect', 'lucrativelegal'),
        'section' => 'llg_hero',
        'type' => 'checkbox'
    ]);
    
    // Прозрачность оверлея
    $wp_customize->add_setting('llg_hero_overlay', [
        'default' => 0.4,
        'sanitize_callback' => 'llg_sanitize_float'
    ]);
    
    $wp_customize->add_control('llg_hero_overlay', [
        'label' => __('Overlay Opacity', 'lucrativelegal'),
        'section' => 'llg_hero',
        'type' => 'range',
        'input_attrs' => [
            'min' => 0,
            'max' => 1,
            'step' => 0.1
        ]
    ]);
    
    // Секция производительности
    $wp_customize->add_section('llg_performance', [
        'title' => __('Performance Settings', 'lucrativelegal'),
        'priority' => 160
    ]);
    
    // Включение анимаций
    $wp_customize->add_setting('llg_animations_enabled', [
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean'
    ]);
    
    $wp_customize->add_control('llg_animations_enabled', [
        'label' => __('Enable Animations', 'lucrativelegal'),
        'section' => 'llg_performance',
        'type' => 'checkbox'
    ]);
    
    // Режим производительности
    $wp_customize->add_setting('llg_performance_mode', [
        'default' => 'auto',
        'sanitize_callback' => 'llg_sanitize_select'
    ]);
    
    $wp_customize->add_control('llg_performance_mode', [
        'label' => __('Performance Mode', 'lucrativelegal'),
        'section' => 'llg_performance',
        'type' => 'select',
        'choices' => [
            'auto' => __('Auto', 'lucrativelegal'),
            'high' => __('High Performance', 'lucrativelegal'),
            'low' => __('Low Performance', 'lucrativelegal')
        ]
    ]);
}
add_action('customize_register', 'llg_customize_register');

/**
 * Sanitization функции
 */
function llg_sanitize_float($input) {
    return floatval($input);
}

function llg_sanitize_select($input, $setting) {
    $choices = $setting->manager->get_control($setting->id)->choices;
    return array_key_exists($input, $choices) ? $input : $setting->default;
}
```

## 📄 Шаблоны страниц

### page-templates/page-home.php

```php
<?php
/**
 * Template Name: Home Page
 */

get_header(); ?>

<main class="main-content">
    <?php
    // Hero секция
    get_component('hero', [
