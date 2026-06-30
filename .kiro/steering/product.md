# Product

## Overview

- **Nombre**: Calculadora Científica
- **Propósito**: Aplicación web que permite resolver expresiones matemáticas complejas, incluyendo operaciones científicas, fracciones, trigonometría, logaritmos, potencias y raíces.
- **Usuarios objetivo**: Uso personal; nivel matemático equivalente a tercer año del Colegio Nacional Buenos Aires.
- **Plataforma**: Web, exclusivamente desktop (no responsive).

## Capacidades principales

- Ingreso de expresión completa antes de evaluar (no modo secuencial)
- Operaciones básicas con paréntesis para agrupación
- Funciones científicas: trigonométricas, logaritmos, potencias, raíces, factorial
- Soporte para fracciones con toggle decimal ↔ fracción en el resultado
- Constantes π y e
- Conversión grados/radianes
- Memoria de un slot (M+, M-, MR, MC)
- Historial de las últimas 10 operaciones por sesión

## Alcance v1

### Incluido
- Todas las funciones científicas mencionadas arriba
- Entrada por botones y por teclado
- Mensajes de error en español
- TDD: tests escritos antes que la implementación
- Tests unitarios (lógica de cálculo) y E2E (flujos de usuario)

### Fuera de alcance (v1)
- Modo graficador (previsto para v2)
- Álgebra simbólica
- Diseño responsive / mobile
- Persistencia del historial entre sesiones
- Números complejos / imaginarios
- Múltiples temas visuales

## Criterio de éxito

La calculadora puede modelar y resolver correctamente ejercicios de potencias, raíces y fracciones del nivel de tercer año del Colegio Nacional Buenos Aires.
