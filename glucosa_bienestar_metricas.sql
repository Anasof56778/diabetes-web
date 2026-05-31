-- ============================================================
-- GB SMART · Glucosa del Bienestar
-- Esquema completo de base de datos · MySQL 8.x
-- ITTLA 2026
-- ============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE IF NOT EXISTS `glucosa_bienestar`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `glucosa_bienestar`;

-- ============================================================
-- TABLA: usuarios
-- Contraseña almacenada como hash bcrypt (NUNCA texto plano)
-- ============================================================
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id`                  INT            NOT NULL AUTO_INCREMENT,
  `nombre`              VARCHAR(100)   NOT NULL,
  `email`               VARCHAR(255)   NOT NULL,
  `password_hash`       VARCHAR(255)   NOT NULL COMMENT 'bcrypt hash, 12 rondas',
  `telefono`            VARCHAR(20)    DEFAULT NULL,
  `fecha_nacimiento`    DATE           DEFAULT NULL,
  `genero`              ENUM('M','F','otro') DEFAULT NULL,
  `rol`                 ENUM('usuario','medico','admin') NOT NULL DEFAULT 'usuario',
  `dos_pasos_activo`    TINYINT(1)     NOT NULL DEFAULT 0,
  `verificado`          TINYINT(1)     NOT NULL DEFAULT 0  COMMENT '1 = email confirmado',
  `foto_perfil`         VARCHAR(500)   DEFAULT NULL,
  `ultimo_acceso`       TIMESTAMP      NULL DEFAULT NULL,
  `activo`              TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  INDEX `idx_email`  (`email`),
  INDEX `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: codigos_verificacion
-- Códigos de un solo uso para: 2FA, verificación de email,
-- recuperación de contraseña.
-- El código se almacena como hash bcrypt.
-- ============================================================
DROP TABLE IF EXISTS `codigos_verificacion`;
CREATE TABLE `codigos_verificacion` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `usuario_id`    INT           NOT NULL,
  `codigo_hash`   VARCHAR(255)  NOT NULL COMMENT 'bcrypt del código de 6 dígitos',
  `tipo`          ENUM('2fa','email_verificacion','recuperacion_password') NOT NULL,
  `intentos`      TINYINT       NOT NULL DEFAULT 0,
  `usado`         TINYINT(1)    NOT NULL DEFAULT 0,
  `expira_en`     TIMESTAMP     NOT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_tipo` (`usuario_id`, `tipo`),
  INDEX `idx_expira`       (`expira_en`),
  CONSTRAINT `fk_codigos_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: sesiones
-- Registro de sesiones activas para invalidación de JWT.
-- El campo token_jti almacena el JWT ID (claim "jti").
-- ============================================================
DROP TABLE IF EXISTS `sesiones`;
CREATE TABLE `sesiones` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `usuario_id`    INT           NOT NULL,
  `token_jti`     VARCHAR(255)  NOT NULL COMMENT 'JWT ID para revocación',
  `ip`            VARCHAR(45)   DEFAULT NULL,
  `user_agent`    VARCHAR(500)  DEFAULT NULL,
  `activa`        TINYINT(1)    NOT NULL DEFAULT 1,
  `expira_en`     TIMESTAMP     NOT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jti` (`token_jti`),
  INDEX `idx_activa` (`activa`),
  CONSTRAINT `fk_sesiones_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: metricas
-- Métricas diarias de salud registradas por la app.
-- ============================================================
DROP TABLE IF EXISTS `metricas`;
CREATE TABLE `metricas` (
  `id`                    INT             NOT NULL AUTO_INCREMENT,
  `usuario_id`            INT             NOT NULL,
  `glucosa`               SMALLINT        DEFAULT NULL COMMENT 'mg/dL',
  `sueno`                 DECIMAL(3,1)    DEFAULT NULL COMMENT 'horas (0.0–24.0)',
  `frecuencia_cardiaca`   SMALLINT        DEFAULT NULL COMMENT 'bpm',
  `estabilidad`           TINYINT         DEFAULT NULL COMMENT 'porcentaje 0–100',
  `recomendaciones`       TEXT            DEFAULT NULL,
  `fecha`                 TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_fecha` (`usuario_id`, `fecha`),
  CONSTRAINT `fk_metricas_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: historial_glucosa
-- Registros detallados de glucosa con contexto de medición.
-- ============================================================
DROP TABLE IF EXISTS `historial_glucosa`;
CREATE TABLE `historial_glucosa` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `usuario_id`      INT          NOT NULL,
  `valor`           SMALLINT     UNSIGNED NOT NULL COMMENT 'mg/dL (rango típico: 40–500)',
  `hora_medicion`   DATETIME     NOT NULL,
  `contexto`        ENUM('ayunas','post_desayuno','post_almuerzo','post_cena','aleatorio')
                                 NOT NULL DEFAULT 'aleatorio',
  `notas`           VARCHAR(500) DEFAULT NULL,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_hora` (`usuario_id`, `hora_medicion`),
  CONSTRAINT `fk_glucosa_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: cuestionarios
-- Resultados del cuestionario diario de riesgo.
-- Las respuestas se guardan como JSON para flexibilidad.
-- ============================================================
DROP TABLE IF EXISTS `cuestionarios`;
CREATE TABLE `cuestionarios` (
  `id`            INT        NOT NULL AUTO_INCREMENT,
  `usuario_id`    INT        NOT NULL,
  `respuestas`    JSON       NOT NULL COMMENT 'Array de {pregunta, respuesta} objects',
  `puntuacion`    TINYINT    NOT NULL COMMENT '0–10',
  `nivel_riesgo`  ENUM('bajo','moderado','alto') NOT NULL,
  `fecha`         TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_fecha` (`usuario_id`, `fecha`),
  CONSTRAINT `fk_cuestionarios_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: recordatorios
-- Recordatorios de medicación, medición de glucosa, etc.
-- ============================================================
DROP TABLE IF EXISTS `recordatorios`;
CREATE TABLE `recordatorios` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `usuario_id`    INT          NOT NULL,
  `titulo`        VARCHAR(100) NOT NULL,
  `tipo`          ENUM('medicamento','glucosa','ejercicio','cita','otro') NOT NULL,
  `hora`          TIME         NOT NULL,
  `dias_semana`   SET('lun','mar','mie','jue','vie','sab','dom')
                               NOT NULL DEFAULT 'lun,mar,mie,jue,vie',
  `activo`        TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_activo` (`usuario_id`, `activo`),
  CONSTRAINT `fk_recordatorios_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- TABLA: notificaciones_apk
-- Emails de usuarios que quieren ser notificados del APK.
-- ============================================================
DROP TABLE IF EXISTS `notificaciones_apk`;
CREATE TABLE `notificaciones_apk` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `email`       VARCHAR(255) NOT NULL,
  `nombre`      VARCHAR(100) DEFAULT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email_apk` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Restaurar configuración original
-- ============================================================
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

-- Dump completado: esquema GB SMART v1.0
