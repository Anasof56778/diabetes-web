from kivymd.app import MDApp
from kivy.lang import Builder
from kivy.properties import BooleanProperty, StringProperty, NumericProperty, ListProperty
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivy.uix.screenmanager import Screen
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.label import MDLabel
from kivymd.uix.selectioncontrol import MDCheckbox
import re
import random
import string
from datetime import datetime

KV = '''
MDNavigationLayout:
    ScreenManager:
        id: screen_manager
        
        LoginScreen:
            name: "login"
        
        MenuScreen:
            name: "menu"
            
        RecoveryScreen:
            name: "recovery"

        CuestionarioScreen:
            name: "cuestionario"

        MetricasScreen:
            name: "metricas"

    MDNavigationDrawer:
        id: nav_drawer
        md_bg_color: 0.31, 0.75, 0.77, 1  # Verde agua igual al login
        radius: (0, 16, 16, 0)

        MDNavigationDrawerMenu:
            MDNavigationDrawerHeader:
                title: "Menú Principal"
                text: "Glucosa del Bienestar"
                spacing: "4dp"
                padding: "12dp", 0, 0, "56dp"
                
            MDNavigationDrawerItem:
                icon: "home"
                text: "Inicio"
                on_release: 
                    screen_manager.current = 'menu'
                    nav_drawer.set_state("close")

            MDNavigationDrawerItem:
                icon: "clipboard-list"
                text: "Cuestionario Diario"
                on_release: 
                    screen_manager.current = 'cuestionario'
                    nav_drawer.set_state("close")

            MDNavigationDrawerItem:
                icon: "chart-line"
                text: "Mis Métricas"
                on_release: 
                    screen_manager.current = 'metricas'
                    nav_drawer.set_state("close")

            MDNavigationDrawerItem:
                icon: "history"
                text: "Ver Historial"
                on_release: 
                    app.mostrar_historial()
                    nav_drawer.set_state("close")

            MDNavigationDrawerItem:
                icon: "face-agent"
                text: "Soporte Técnico"
                on_release: 
                    app.mostrar_soporte()
                    nav_drawer.set_state("close")

            MDNavigationDrawerDivider:

            MDNavigationDrawerItem:
                icon: "logout"
                text: "Cerrar Sesión"
                theme_text_color: "Custom"
                text_color: 0.8, 0.3, 0.3, 1
                icon_color: 0.8, 0.3, 0.3, 1
                on_release: app.cerrar_sesion()

<LoginScreen>:
    name: "login"
    
    MDBoxLayout:
        orientation: "vertical"
        spacing: "25dp"  # Aumentado
        padding: "25dp"  # Aumentado
        md_bg_color: 0.93, 0.95, 0.97, 1

        MDTopAppBar:
            title: "Glucosa del Bienestar"
            md_bg_color: 0.31, 0.75, 0.77, 1
            title_align: "center"
            elevation: 4

        MDCard:
            orientation: "vertical"
            size_hint: None, None
            size: "350dp", "580dp"  # Aumentado
            pos_hint: {"center_x": 0.5}
            md_bg_color: 1, 1, 1, 1
            elevation: 8
            padding: "25dp"  # Aumentado
            spacing: "15dp"  # Aumentado
            radius: [20, 20, 20, 20]

            MDBoxLayout:
                orientation: "vertical"
                spacing: "10dp"
                size_hint_y: None
                height: "120dp"
                pos_hint: {"center_x": 0.5}

                Image:
                    source: "aplicacion diabetes/logo_diabetes.jpg"
                    size_hint: None, None
                    size: "100dp", "100dp"
                    pos_hint: {"center_x": 0.5}

                MDLabel:
                    text: "Glucosa del Bienestar"
                    font_style: "H5"
                    halign: "center"
                    theme_text_color: "Custom"
                    text_color: 0.17, 0.24, 0.31, 1
                    font_size: "22sp"  # Aumentado

            MDLabel:
                id: titulo_form
                text: "Iniciar Sesión"
                font_style: "H4"  # Aumentado
                halign: "center"
                theme_text_color: "Custom"
                text_color: 0.17, 0.24, 0.31, 1
                font_size: "20sp"  # Aumentado

            MDTextField:
                id: nombre
                hint_text: "Nombre completo"
                mode: "fill"
                fill_color: 0.93, 0.95, 0.97, 1
                opacity: 0
                disabled: True
                font_size: "16sp"  # Aumentado

            MDTextField:
                id: email
                hint_text: "Correo electrónico"
                mode: "fill"
                fill_color: 0.93, 0.95, 0.97, 1
                font_size: "16sp"  # Aumentado

            MDTextField:
                id: password
                hint_text: "Contraseña"
                password: True
                mode: "fill"
                fill_color: 0.93, 0.95, 0.97, 1
                font_size: "16sp"  # Aumentado

            MDTextField:
                id: confirm
                hint_text: "Confirmar contraseña"
                password: True
                mode: "fill"
                fill_color: 0.93, 0.95, 0.97, 1
                opacity: 0
                disabled: True
                font_size: "16sp"  # Aumentado

            MDRaisedButton:
                id: boton_principal
                text: "Iniciar Sesión"
                md_bg_color: 0.17, 0.24, 0.31, 1
                pos_hint: {"center_x": 0.5}
                on_release: app.accion_principal()
                font_size: "16sp"  # Aumentado
                size_hint_y: None
                height: "50dp"  # Aumentado

            MDBoxLayout:
                orientation: "horizontal"
                halign: "center"
                spacing: "8dp"  # Aumentado

                MDLabel:
                    id: label_toggle
                    text: "¿No tienes cuenta?"
                    halign: "center"
                    theme_text_color: "Custom"
                    text_color: 0.17, 0.24, 0.31, 1
                    font_size: "14sp"  # Aumentado

                MDTextButton:
                    id: boton_toggle
                    text: "Regístrate aquí"
                    text_color: 0.31, 0.75, 0.77, 1
                    on_release: app.toggle_modo()
                    font_size: "14sp"  # Aumentado

            MDBoxLayout:
                id: recuperacion_layout
                orientation: "horizontal"
                halign: "center"
                spacing: "8dp"  # Aumentado

                MDLabel:
                    text: ""
                    size_hint_x: 0.3

                MDTextButton:
                    text: "¿Olvidaste tu contraseña?"
                    text_color: 0.8, 0.3, 0.3, 1
                    font_size: "14sp"  # Aumentado
                    on_release: app.mostrar_recuperacion()

                MDLabel:
                    text: ""
                    size_hint_x: 0.3

        MDLabel:
            text: "Tu salud es nuestra prioridad 💚"
            halign: "center"
            theme_text_color: "Secondary"
            font_size: "16sp"  # Aumentado

<MenuScreen>:
    name: "menu"
    
    MDBoxLayout:
        orientation: 'vertical'

        MDTopAppBar:
            title: "Glucosa del Bienestar"
            elevation: 4
            md_bg_color: 0.31, 0.75, 0.77, 1
            left_action_items: [["menu", lambda x: app.root.ids.nav_drawer.set_state("open")]]

        ScrollView:
            MDBoxLayout:
                orientation: "vertical"
                padding: "25dp"  # Aumentado
                spacing: "25dp"  # Aumentado
                md_bg_color: 0.93, 0.95, 0.97, 1
                adaptive_height: True

                MDBoxLayout:
                    orientation: "horizontal"
                    spacing: "15dp"
                    size_hint_y: None
                    height: "120dp"

                    Image:
                        source: "aplicacion diabetes/logo_diabetes.jpg"
                        size_hint: None, None
                        size: "100dp", "100dp"

                    MDLabel:
                        text: "¡Bienvenido/a a Glucosa del Bienestar!"
                        font_style: "H5"
                        theme_text_color: "Custom"
                        text_color: 0.17, 0.24, 0.31, 1
                        font_size: "18sp"  # Aumentado
                        bold: True

                MDCard:
                    md_bg_color: 1, 1, 1, 1
                    padding: "25dp"  # Aumentado
                    radius: 15
                    elevation: 6
                    
                    MDLabel:
                        text: "Tu Salud en Nuestras Manos"
                        font_style: "H5"
                        halign: "center"
                        theme_text_color: "Custom"
                        text_color: 0.17, 0.24, 0.31, 1
                        font_size: "18sp"  # Aumentado
                        size_hint_y: None
                        height: self.texture_size[1]
                        padding: [0, 10]

                    MDLabel:
                        text: "Una empresa 100% responsable al cuidado y manejo de tu salud, donde haremos un historial del manejo de la glucosa para mejorar tu calidad de vida."
                        halign: "center"
                        theme_text_color: "Secondary"
                        font_size: "16sp"  # Aumentado
                        size_hint_y: None
                        height: self.texture_size[1]
                        padding: [0, 10]

                MDGridLayout:
                    cols: 2
                    spacing: "15dp"
                    size_hint_y: None
                    height: "200dp"

                    MDCard:
                        md_bg_color: 0.31, 0.75, 0.77, 1
                        padding: "20dp"
                        radius: 12
                        elevation: 4
                        on_release: app.ir_a_cuestionario()
                        
                        MDBoxLayout:
                            orientation: "vertical"
                            spacing: "10dp"

                            MDIcon:
                                icon: "clipboard-list"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                font_size: "30sp"
                                halign: "center"

                            MDLabel:
                                text: "Cuestionario Diario"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "16sp"  # Aumentado
                                bold: True

                    MDCard:
                        md_bg_color: 0.17, 0.24, 0.31, 1
                        padding: "20dp"
                        radius: 12
                        elevation: 4
                        on_release: app.ir_a_metricas()
                        
                        MDBoxLayout:
                            orientation: "vertical"
                            spacing: "10dp"

                            MDIcon:
                                icon: "chart-line"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                font_size: "30sp"
                                halign: "center"

                            MDLabel:
                                text: "Mis Métricas"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "16sp"  # Aumentado
                                bold: True

                MDCard:
                    md_bg_color: 1, 1, 1, 1
                    padding: "20dp"
                    radius: 12
                    elevation: 4
                    
                    MDBoxLayout:
                        orientation: "vertical"
                        spacing: "15dp"

                        MDLabel:
                            text: "Resumen de Hoy"
                            font_style: "H5"
                            theme_text_color: "Custom"
                            text_color: 0.17, 0.24, 0.31, 1
                            font_size: "18sp"  # Aumentado

                        MDBoxLayout:
                            orientation: "horizontal"
                            spacing: "15dp"

                            MDLabel:
                                text: "Última medición:"
                                theme_text_color: "Secondary"
                                font_size: "16sp"  # Aumentado
                                size_hint_x: 0.6

                            MDLabel:
                                id: ultima_medicion
                                text: "No registrada"
                                theme_text_color: "Custom"
                                text_color: 0.31, 0.75, 0.77, 1
                                bold: True
                                font_size: "16sp"  # Aumentado

                        MDBoxLayout:
                            orientation: "horizontal"
                            spacing: "15dp"

                            MDLabel:
                                text: "Estado general:"
                                theme_text_color: "Secondary"
                                font_size: "16sp"  # Aumentado
                                size_hint_x: 0.6

                            MDLabel:
                                id: estado_actual
                                text: "Sin datos"
                                theme_text_color: "Custom"
                                text_color: 0.8, 0.3, 0.3, 1
                                bold: True
                                font_size: "16sp"  # Aumentado

<RecoveryScreen>:
    name: "recovery"
    md_bg_color: 0.93, 0.95, 0.97, 1

    MDBoxLayout:
        orientation: "vertical"
        spacing: "25dp"  # Aumentado
        padding: "25dp"  # Aumentado

        MDTopAppBar:
            title: "Glucosa del Bienestar"
            md_bg_color: 0.31, 0.75, 0.77, 1
            title_align: "center"
            left_action_items: [["arrow-left", lambda x: app.volver_login()]]

        MDCard:
            orientation: "vertical"
            size_hint: None, None
            size: "350dp", "580dp"  # Aumentado
            pos_hint: {"center_x": 0.5}
            md_bg_color: 1, 1, 1, 1
            elevation: 8
            padding: "25dp"  # Aumentado
            spacing: "20dp"  # Aumentado
            radius: [20, 20, 20, 20]

            MDBoxLayout:
                orientation: "vertical"
                spacing: "10dp"
                size_hint_y: None
                height: "120dp"
                pos_hint: {"center_x": 0.5}

                Image:
                    source: "aplicacion diabetes\logo_diabetes.jpg"
                    size_hint: None, None
                    size: "100dp", "100dp"
                    pos_hint: {"center_x": 0.5}

                MDLabel:
                    text: "Recuperar Contraseña"
                    font_style: "H4"  # Aumentado
                    halign: "center"
                    theme_text_color: "Custom"
                    text_color: 0.17, 0.24, 0.31, 1
                    font_size: "20sp"  # Aumentado

            MDLabel:
                id: instrucciones
                text: "Ingresa tu correo electrónico para recibir un código de verificación"
                halign: "center"
                theme_text_color: "Secondary"
                font_size: "16sp"  # Aumentado
                size_hint_y: None
                height: "50dp"

            MDTextField:
                id: recovery_email
                hint_text: "Correo electrónico"
                mode: "fill"
                fill_color: 0.93, 0.95, 0.97, 1
                icon_left: "email"
                size_hint_y: None
                height: "60dp"  # Aumentado
                font_size: "16sp"  # Aumentado

            MDTextField:
                id: codigo_verificacion
                hint_text: "Código de verificación"
                mode: "fill"
                fill_color: 0.93, 0.95, 0.97, 1
                icon_left: "lock-reset"
                opacity: 0
                disabled: True
                size_hint_y: None
                height: "60dp"  # Aumentado
                font_size: "16sp"  # Aumentado

            MDRaisedButton:
                id: boton_recuperacion
                text: "Enviar Código"
                md_bg_color: 0.17, 0.24, 0.31, 1
                pos_hint: {"center_x": 0.5}
                size_hint: None, None
                size: "220dp", "50dp"  # Aumentado
                font_size: "16sp"  # Aumentado
                on_release: app.procesar_recuperacion()

            MDRaisedButton:
                id: boton_verificar
                text: "Verificar Código"
                md_bg_color: 0.31, 0.75, 0.77, 1
                pos_hint: {"center_x": 0.5}
                size_hint: None, None
                size: "220dp", "50dp"  # Aumentado
                opacity: 0
                disabled: True
                font_size: "16sp"  # Aumentado
                on_release: app.verificar_codigo()

            MDLabel:
                id: nueva_password_label
                text: ""
                halign: "center"
                theme_text_color: "Custom"
                text_color: 0.2, 0.6, 0.2, 1
                font_style: "Subtitle1"
                bold: True
                opacity: 0
                font_size: "16sp"  # Aumentado
                size_hint_y: None
                height: "40dp"

        MDLabel:
            text: "Tu salud es nuestra prioridad 💚"
            halign: "center"
            theme_text_color: "Secondary"
            font_size: "16sp"  # Aumentado

<CuestionarioScreen>:
    name: "cuestionario"
    
    MDBoxLayout:
        orientation: 'vertical'

        MDTopAppBar:
            title: "Cuestionario de Salud"
            elevation: 4
            md_bg_color: 0.31, 0.75, 0.77, 1
            left_action_items: [["arrow-left", lambda x: app.volver_menu()]]

        ScrollView:
            MDBoxLayout:
                orientation: "vertical"
                padding: "25dp"
                spacing: "20dp"
                md_bg_color: 0.93, 0.95, 0.97, 1
                adaptive_height: True

                MDCard:
                    md_bg_color: 1, 1, 1, 1
                    padding: "25dp"
                    radius: 15
                    elevation: 6
                    
                    MDLabel:
                        text: "Cuestionario de Evaluación de Diabetes"
                        font_style: "H5"
                        halign: "center"
                        theme_text_color: "Custom"
                        text_color: 0.17, 0.24, 0.31, 1
                        font_size: "18sp"
                        size_hint_y: None
                        height: self.texture_size[1]

                    MDLabel:
                        text: "Responde las siguientes preguntas para evaluar tu riesgo de diabetes. Marca todas las opciones que apliquen."
                        halign: "center"
                        theme_text_color: "Secondary"
                        font_size: "16sp"
                        size_hint_y: None
                        height: self.texture_size[1]

                MDCard:
                    md_bg_color: 1, 1, 1, 1
                    padding: "20dp"
                    radius: 12
                    elevation: 4
                    
                    MDBoxLayout:
                        orientation: "vertical"
                        spacing: "15dp"
                        id: preguntas_container

                MDRaisedButton:
                    text: "Evaluar Respuestas"
                    md_bg_color: 0.31, 0.75, 0.77, 1
                    pos_hint: {"center_x": 0.5}
                    size_hint: None, None
                    size: "250dp", "50dp"
                    font_size: "16sp"
                    on_release: app.evaluar_cuestionario()

<MetricasScreen>:
    name: "metricas"
    
    MDBoxLayout:
        orientation: 'vertical'

        MDTopAppBar:
            title: "Mis Métricas de Salud"
            elevation: 4
            md_bg_color: 0.31, 0.75, 0.77, 1
            left_action_items: [["arrow-left", lambda x: app.volver_menu()]]

        ScrollView:
            MDBoxLayout:
                orientation: "vertical"
                padding: "25dp"
                spacing: "20dp"
                md_bg_color: 0.93, 0.95, 0.97, 1
                adaptive_height: True

                MDCard:
                    md_bg_color: 1, 1, 1, 1
                    padding: "25dp"
                    radius: 15
                    elevation: 6
                    
                    MDLabel:
                        text: "Panel de Métricas de Salud"
                        font_style: "H5"
                        halign: "center"
                        theme_text_color: "Custom"
                        text_color: 0.17, 0.24, 0.31, 1
                        font_size: "18sp"

                MDGridLayout:
                    cols: 2
                    spacing: "15dp"
                    size_hint_y: None
                    height: "400dp"

                    MDCard:
                        md_bg_color: 0.31, 0.75, 0.77, 1
                        padding: "20dp"
                        radius: 12
                        elevation: 4
                        
                        MDBoxLayout:
                            orientation: "vertical"
                            spacing: "10dp"

                            MDIcon:
                                icon: "water"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                font_size: "30sp"
                                halign: "center"

                            MDLabel:
                                text: "Nivel de Glucosa"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "16sp"
                                bold: True

                            MDLabel:
                                id: nivel_glucosa
                                text: "120 mg/dL"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "20sp"
                                bold: True

                            MDLabel:
                                id: estado_glucosa
                                text: "Normal"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "14sp"

                    MDCard:
                        md_bg_color: 0.17, 0.24, 0.31, 1
                        padding: "20dp"
                        radius: 12
                        elevation: 4
                        
                        MDBoxLayout:
                            orientation: "vertical"
                            spacing: "10dp"

                            MDIcon:
                                icon: "bed"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                font_size: "30sp"
                                halign: "center"

                            MDLabel:
                                text: "Calidad de Sueño"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "16sp"
                                bold: True

                            MDLabel:
                                id: calidad_sueno
                                text: "7.5/10"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "20sp"
                                bold: True

                            MDLabel:
                                id: estado_sueno
                                text: "Buena"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "14sp"

                    MDCard:
                        md_bg_color: 0.8, 0.5, 0.3, 1
                        padding: "20dp"
                        radius: 12
                        elevation: 4
                        
                        MDBoxLayout:
                            orientation: "vertical"
                            spacing: "10dp"

                            MDIcon:
                                icon: "heart"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                font_size: "30sp"
                                halign: "center"

                            MDLabel:
                                text: "Frecuencia Cardíaca"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "16sp"
                                bold: True

                            MDLabel:
                                id: frecuencia_cardiaca
                                text: "72 lpm"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "20sp"
                                bold: True

                            MDLabel:
                                id: estado_cardiaca
                                text: "Normal"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "14sp"

                    MDCard:
                        md_bg_color: 0.5, 0.7, 0.3, 1
                        padding: "20dp"
                        radius: 12
                        elevation: 4
                        
                        MDBoxLayout:
                            orientation: "vertical"
                            spacing: "10dp"

                            MDIcon:
                                icon: "chart-bell-curve"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                font_size: "30sp"
                                halign: "center"

                            MDLabel:
                                text: "Estabilidad General"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "16sp"
                                bold: True

                            MDLabel:
                                id: estabilidad_general
                                text: "85%"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "20sp"
                                bold: True

                            MDLabel:
                                id: estado_estabilidad
                                text: "Estable"
                                theme_text_color: "Custom"
                                text_color: 1, 1, 1, 1
                                halign: "center"
                                font_size: "14sp"

                MDCard:
                    md_bg_color: 1, 1, 1, 1
                    padding: "20dp"
                    radius: 12
                    elevation: 4
                    
                    MDBoxLayout:
                        orientation: "vertical"
                        spacing: "15dp"

                        MDLabel:
                            text: "Recomendaciones"
                            font_style: "H6"
                            theme_text_color: "Custom"
                            text_color: 0.17, 0.24, 0.31, 1
                            font_size: "16sp"

                        MDLabel:
                            id: recomendaciones
                            text: "Basado en tus métricas actuales, te recomendamos mantener tu rutina actual y continuar con los controles regulares."
                            theme_text_color: "Secondary"
                            font_size: "14sp"
'''

class LoginScreen(Screen):
    pass

class MenuScreen(Screen):
    pass

class RecoveryScreen(Screen):
    pass

class CuestionarioScreen(Screen):
    pass

class MetricasScreen(Screen):
    pass

class PreguntaItem(MDBoxLayout):
    def __init__(self, pregunta, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "vertical"
        self.spacing = "10dp"
        self.size_hint_y = None
        self.height = "120dp"
        
        label = MDLabel(
            text=pregunta,
            theme_text_color="Custom",
            text_color=(0.17, 0.24, 0.31, 1),
            font_size="16sp",
            size_hint_y=None,
            height="60dp"
        )
        self.add_widget(label)
        
        checkbox = MDCheckbox(
            size_hint=(None, None),
            size=("30dp", "30dp")
        )
        self.add_widget(checkbox)

class RegistroApp(MDApp):
    modo_registro = BooleanProperty(False)
    codigo_verificacion = StringProperty("")
    temp_password = StringProperty("")
    email_recuperacion = StringProperty("")
    respuestas_cuestionario = ListProperty([])
    
    usuarios = {
        "usuario1@gmail.com": "123456",
        "admin@glucosa.com": "admin123"
    }

    # Preguntas para el cuestionario de diabetes
    preguntas_diabetes = [
        "¿Tiene sed excesiva con frecuencia?",
        "¿Orina con más frecuencia de lo normal?",
        "¿Ha experimentado pérdida de peso inexplicable?",
        "¿Se siente más cansado de lo habitual?",
        "¿Tiene visión borrosa?",
        "¿Sus heridas tardan más en sanar?",
        "¿Experimenta hormigueo en manos o pies?",
        "¿Tiene antecedentes familiares de diabetes?",
        "¿Tiene sobrepeso u obesidad?",
        "¿Su presión arterial es alta?"
    ]

    def build(self):
        self.theme_cls.primary_palette = "Teal"
        self.theme_cls.font_styles["H5"] = ["Roboto", 24, False, 0.15]
        self.theme_cls.font_styles["H6"] = ["Roboto", 20, False, 0.15]
        return Builder.load_string(KV)

    def on_start(self):
        # Inicializar métricas por defecto
        self.actualizar_metricas()

    def validar_email(self, email):
        patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(patron, email) is not None

    def toggle_modo(self):
        self.modo_registro = not self.modo_registro
        pantalla = self.root.ids.screen_manager.get_screen("login")
        nombre = pantalla.ids.nombre
        confirm = pantalla.ids.confirm
        titulo = pantalla.ids.titulo_form
        boton = pantalla.ids.boton_principal
        label = pantalla.ids.label_toggle
        toggle = pantalla.ids.boton_toggle
        recuperacion_layout = pantalla.ids.recuperacion_layout

        if self.modo_registro:
            titulo.text = "Crear Cuenta Nueva"
            boton.text = "Registrarse"
            label.text = "¿Ya tienes cuenta?"
            toggle.text = "Inicia sesión aquí"
            nombre.opacity = 1
            nombre.disabled = False
            confirm.opacity = 1
            confirm.disabled = False
            recuperacion_layout.opacity = 0
            recuperacion_layout.disabled = True
        else:
            titulo.text = "Iniciar Sesión"
            boton.text = "Iniciar Sesión"
            label.text = "¿No tienes cuenta?"
            toggle.text = "Regístrate aquí"
            nombre.opacity = 0
            nombre.disabled = True
            confirm.opacity = 0
            confirm.disabled = True
            recuperacion_layout.opacity = 1
            recuperacion_layout.disabled = False

    def accion_principal(self):
        pantalla = self.root.ids.screen_manager.get_screen("login")
        email = pantalla.ids.email.text.strip()
        password = pantalla.ids.password.text.strip()

        if not email or not password:
            self.mostrar_dialogo("Error", "Por favor, completa todos los campos.")
            return

        if not self.validar_email(email):
            self.mostrar_dialogo("Error", "Por favor, ingresa un correo válido.")
            return

        if self.modo_registro:
            nombre = pantalla.ids.nombre.text.strip()
            confirm = pantalla.ids.confirm.text.strip()

            if not nombre:
                self.mostrar_dialogo("Error", "Por favor, ingresa tu nombre completo.")
                return
            if len(password) < 6:
                self.mostrar_dialogo("Error", "La contraseña debe tener al menos 6 caracteres.")
                return
            if password != confirm:
                self.mostrar_dialogo("Error", "Las contraseñas no coinciden.")
                return

            # Guarda el nuevo usuario
            self.usuarios[email] = password
            self.mostrar_dialogo("¡Registro exitoso!", f"Bienvenido/a {nombre}.\nTu cuenta ha sido creada correctamente.")
            self.limpiar_campos()
            self.toggle_modo()
            self.root.ids.screen_manager.current = "menu"
        else:
            # Validar inicio de sesión
            if email in self.usuarios and self.usuarios[email] == password:
                self.root.ids.screen_manager.current = "menu"
                self.actualizar_metricas()
            else:
                self.mostrar_dialogo("Error", "Correo o contraseña incorrectos.")

    def limpiar_campos(self):
        pantalla = self.root.ids.screen_manager.get_screen("login")
        for campo in ["nombre", "email", "password", "confirm"]:
            pantalla.ids[campo].text = ""

    def mostrar_dialogo(self, titulo, mensaje):
        dialogo = MDDialog(
            title=titulo,
            text=mensaje,
            buttons=[MDFlatButton(text="Aceptar", on_release=lambda x: dialogo.dismiss())],
        )
        dialogo.open()

    def cerrar_sesion(self):
        try:
            self.root.ids.nav_drawer.set_state("close")
        except:
            pass
        self.root.ids.screen_manager.current = "login"
        self.limpiar_campos()

    def mostrar_recuperacion(self):
        self.root.ids.screen_manager.current = "recovery"
        self.resetear_recuperacion()

    def volver_login(self):
        self.root.ids.screen_manager.current = "login"
        self.resetear_recuperacion()

    def volver_menu(self):
        self.root.ids.screen_manager.current = "menu"

    def resetear_recuperacion(self):
        pantalla = self.root.ids.screen_manager.get_screen("recovery")
        pantalla.ids.recovery_email.text = ""
        pantalla.ids.codigo_verificacion.text = ""
        pantalla.ids.codigo_verificacion.opacity = 0
        pantalla.ids.codigo_verificacion.disabled = True
        pantalla.ids.boton_verificar.opacity = 0
        pantalla.ids.boton_verificar.disabled = True
        pantalla.ids.nueva_password_label.opacity = 0
        pantalla.ids.nueva_password_label.text = ""
        pantalla.ids.boton_recuperacion.text = "Enviar Código"
        pantalla.ids.instrucciones.text = "Ingresa tu correo electrónico para recibir un código de verificación"

    def generar_codigo_verificacion(self):
        return ''.join(random.choices(string.digits, k=6))

    def generar_password_temporal(self):
        caracteres = string.ascii_letters + string.digits
        return ''.join(random.choices(caracteres, k=8))

    def enviar_codigo_email(self, email, codigo, password_temp):
        mensaje = f"""
📧 Correo enviado a: {email}

🔐 Código de verificación: {codigo}
🔑 Contraseña temporal: {password_temp}

⚠️ Esta contraseña temporal expirará en 24 horas.
Por seguridad, cambia tu contraseña después de iniciar sesión.
"""
        self.mostrar_dialogo("Código Enviado", mensaje)
        return True

    def procesar_recuperacion(self):
        pantalla = self.root.ids.screen_manager.get_screen("recovery")
        email = pantalla.ids.recovery_email.text.strip()

        if not email:
            self.mostrar_dialogo("Error", "Por favor, ingresa tu correo electrónico.")
            return

        if not self.validar_email(email):
            self.mostrar_dialogo("Error", "Por favor, ingresa un correo válido.")
            return

        if email not in self.usuarios:
            self.mostrar_dialogo("Error", "Este correo no está registrado en el sistema.")
            return

        self.codigo_verificacion = self.generar_codigo_verificacion()
        self.temp_password = self.generar_password_temporal()
        self.email_recuperacion = email

        if self.enviar_codigo_email(email, self.codigo_verificacion, self.temp_password):
            pantalla.ids.codigo_verificacion.opacity = 1
            pantalla.ids.codigo_verificacion.disabled = False
            pantalla.ids.boton_verificar.opacity = 1
            pantalla.ids.boton_verificar.disabled = False
            pantalla.ids.boton_recuperacion.text = "Reenviar Código"
            pantalla.ids.instrucciones.text = "Revisa tu correo e ingresa el código de verificación de 6 dígitos"

    def verificar_codigo(self):
        pantalla = self.root.ids.screen_manager.get_screen("recovery")
        codigo_ingresado = pantalla.ids.codigo_verificacion.text.strip()

        if not codigo_ingresado:
            self.mostrar_dialogo("Error", "Por favor, ingresa el código de verificación.")
            return

        if codigo_ingresado == self.codigo_verificacion:
            self.usuarios[self.email_recuperacion] = self.temp_password
            pantalla.ids.nueva_password_label.text = f"Tu nueva contraseña: {self.temp_password}"
            pantalla.ids.nueva_password_label.opacity = 1
            pantalla.ids.instrucciones.text = "✅ Código verificado correctamente. Usa esta contraseña para iniciar sesión."
            
            self.mostrar_dialogo(
                "¡Contraseña Actualizada!", 
                f"Tu contraseña ha sido restablecida.\n\n"
                f"🔑 Contraseña temporal: {self.temp_password}\n\n"
                f"Por seguridad, cambia tu contraseña después de iniciar sesión."
            )
        else:
            self.mostrar_dialogo("Error", "El código de verificación es incorrecto.")

    def ir_a_cuestionario(self):
        self.root.ids.screen_manager.current = "cuestionario"
        self.cargar_preguntas()

    def ir_a_metricas(self):
        self.root.ids.screen_manager.current = "metricas"
        self.actualizar_metricas()

    def cargar_preguntas(self):
        pantalla = self.root.ids.screen_manager.get_screen("cuestionario")
        container = pantalla.ids.preguntas_container
        container.clear_widgets()
        
        for pregunta in self.preguntas_diabetes:
            item = PreguntaItem(pregunta=pregunta)
            container.add_widget(item)

    def evaluar_cuestionario(self):
        pantalla = self.root.ids.screen_manager.get_screen("cuestionario")
        container = pantalla.ids.preguntas_container
        
        respuestas = []
        for widget in container.children:
            if isinstance(widget, PreguntaItem):
                # Verificar si el checkbox está marcado
                for child in widget.children:
                    if isinstance(child, MDCheckbox):
                        respuestas.append(child.active)
                        break
        
        total_si = sum(respuestas)
        
        if total_si <= 2:
            resultado = "BAJO RIESGO"
            mensaje = "Tienes un bajo riesgo de diabetes. Continúa con hábitos saludables."
            color = "green"
        elif total_si <= 5:
            resultado = "RIESGO MODERADO"
            mensaje = "Tienes un riesgo moderado. Te recomendamos consultar a tu médico para una evaluación más detallada."
            color = "orange"
        else:
            resultado = "ALTO RIESGO"
            mensaje = "Tienes un alto riesgo de diabetes. Es importante que consultes a un médico lo antes posible para realizar pruebas específicas."
            color = "red"
        
        dialogo = MDDialog(
            title=f"Resultado: {resultado}",
            text=f"Respuestas positivas: {total_si}/10\n\n{mensaje}",
            buttons=[MDFlatButton(text="Entendido", on_release=lambda x: dialogo.dismiss())],
            md_bg_color=color
        )
        dialogo.open()

    def actualizar_metricas(self):
        try:
            pantalla = self.root.ids.screen_manager.get_screen("metricas")
            
            # Valores simulados - en una app real estos vendrían de una base de datos
            glucosa = random.randint(80, 180)
            sueno = round(random.uniform(6.0, 9.5), 1)
            cardiaca = random.randint(60, 100)
            estabilidad = random.randint(70, 95)
            
            # Actualizar valores
            pantalla.ids.nivel_glucosa.text = f"{glucosa} mg/dL"
            pantalla.ids.calidad_sueno.text = f"{sueno}/10"
            pantalla.ids.frecuencia_cardiaca.text = f"{cardiaca} lpm"
            pantalla.ids.estabilidad_general.text = f"{estabilidad}%"
            
            # Actualizar estados
            pantalla.ids.estado_glucosa.text = "Normal" if glucosa < 140 else "Elevado"
            pantalla.ids.estado_sueno.text = "Excelente" if sueno > 8 else "Buena" if sueno > 6 else "Regular"
            pantalla.ids.estado_cardiaca.text = "Normal" if 60 <= cardiaca <= 100 else "Irregular"
            pantalla.ids.estado_estabilidad.text = "Muy Estable" if estabilidad > 85 else "Estable"
            
            # Generar recomendaciones
            recomendaciones = self.generar_recomendaciones(glucosa, sueno, cardiaca, estabilidad)
            pantalla.ids.recomendaciones.text = recomendaciones
            
        except Exception as e:
            print(f"Error actualizando métricas: {e}")

    def generar_recomendaciones(self, glucosa, sueno, cardiaca, estabilidad):
        recomendaciones = []
        
        if glucosa > 140:
            recomendaciones.append("• Considera reducir el consumo de azúcares y carbohidratos simples")
        elif glucosa < 70:
            recomendaciones.append("• Vigila tus niveles de glucosa, podrían estar bajos")
        else:
            recomendaciones.append("• Tus niveles de glucosa están en rango normal, ¡sigue así!")
            
        if sueno < 7:
            recomendaciones.append("• Intenta dormir al menos 7-8 horas por noche")
        else:
            recomendaciones.append("• Tu calidad de sueño es adecuada")
            
        if cardiaca > 90:
            recomendaciones.append("• Practica técnicas de relajación para reducir tu frecuencia cardíaca")
        elif cardiaca < 60:
            recomendaciones.append("• Consulta con tu médico sobre tu frecuencia cardíaca")
        else:
            recomendaciones.append("• Tu frecuencia cardíaca está en rango normal")
            
        if estabilidad < 80:
            recomendaciones.append("• Mantén una rutina constante de alimentación y ejercicio")
        else:
            recomendaciones.append("• Tu estabilidad general es muy buena")
            
        return "\n".join(recomendaciones)

    def mostrar_historial(self):
        self.mostrar_dialogo("Historial", 
                           "Aquí podrías ver:\n\n"
                           "• Todas tus mediciones\n"
                           "• Gráficos de tendencia\n"
                           "• Estadísticas\n"
                           "• Exportar datos")

    def mostrar_soporte(self):
        self.mostrar_dialogo("Soporte Técnico", 
                           "Opciones de contacto:\n\n"
                           "📞 Teléfono: +1-800-GLUCOSA\n"
                           "📧 Email: soporte@glucosabienestar.com\n"
                           "💬 WhatsApp: +1-800-GLUCOSA")

if __name__ == "__main__":
    RegistroApp().run()
