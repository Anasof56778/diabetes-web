[app]

title           = GB SMART
package.name    = gbsmart
package.domain  = mx.ittla

source.dir      = .
source.main     = main.py

source.include_exts     = py,png,jpg,jpeg,kv,atlas
source.include_patterns = main.py,aplicacion_diabetes_2.py,img/Logo.png
source.exclude_patterns = index.html,app.html,style.css,script.js,*.sql,*.toml,*.json,netlify/**,node_modules/**,.github/**,.claude/**,GlucosaBien*/**

version = 1.0.0

requirements = python3==3.11.8,kivy==2.3.0,kivymd==1.2.0

orientation = portrait

android.permissions      = INTERNET
android.api              = 33
android.minapi           = 26
android.ndk              = 25b
android.archs            = arm64-v8a
android.enable_androidx  = True
android.accept_sdk_license = True

[buildozer]
log_level    = 2
warn_on_root = 1
