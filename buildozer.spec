[app]

# Nombre e identificador de la app
title           = GB SMART
package.name    = gbsmart
package.domain  = mx.ittla

# Archivo principal
source.dir      = .
source.main     = main.py

# Extensiones a incluir en el APK
source.include_exts = py,png,jpg,jpeg,kv,atlas

# Solo incluir los archivos necesarios de la app móvil
source.include_patterns = main.py,aplicacion_diabetes_2.py,img/Logo.png

# Excluir archivos web y de configuración
source.exclude_patterns = index.html,app.html,style.css,script.js,*.sql,*.toml,*.json,netlify/**,node_modules/**,.github/**,.claude/**,GlucosaBien*/**

version         = 1.0.0

# Requerimientos de Python y librerías
requirements    = python3,kivy==2.3.0,kivymd==1.2.0,android

# Orientación de la pantalla
orientation     = portrait

# Icono e imagen de splash (coloca tu logo en img/Logo.png)
# icon.filename   = %(source.dir)s/img/Logo.png
# presplash.filename = %(source.dir)s/img/Logo.png

# Permisos de Android
android.permissions = INTERNET

# API de Android
android.api         = 33
android.minapi      = 26
android.ndk         = 25b
android.sdk         = 33

# Arquitecturas (arm64-v8a para dispositivos modernos, armeabi-v7a para compatibilidad)
android.archs       = arm64-v8a,armeabi-v7a

# Habilitar AndroidX
android.enable_androidx = True

# Gradle
android.gradle_dependencies =

# No pedir acceso al almacenamiento externo
android.add_compile_options = -target 26

[buildozer]

# Nivel de log (0 = silencioso, 1 = info, 2 = debug)
log_level = 2

# Advertir cuando hay archivos grandes en el APK
warn_on_root = 1
