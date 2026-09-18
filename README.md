# Terrasense

Dispositivo de **medición** de parámetros del suelo y del ambiente que muestra los datos en una página web.

Terrasense lee humedad y temperatura del suelo, humedad y temperatura del aire, nivel de luz ambiental y pH del suelo mediante sensores conectados a un Arduino Uno. Los datos viajan por comunicación serial (cable) hacia un backend en Node + TypeScript, que los persiste y los expone al frontend.

Es un **proyecto de secundario**: el objetivo es que funcione de punta a punta y se entienda, no montar una arquitectura de producción. Por eso se usa Node + TypeScript sin frameworks ni base de datos, y se corre todo en una sola computadora.

> **Importante:** Terrasense **no** actúa sobre el cultivo. No riega, no ventila y no calefacciona. Lo único que hace es medir e informar.

---

## Problema que resuelve

Los granjeros y dueños de cultivos necesitan saber en qué estado está su tierra, pero medir cada variable a mano es lento y poco frecuente. Terrasense automatiza la toma de esos datos y los centraliza en una sola pantalla.

**Público objetivo:** productores agrícolas, huertas y cualquier persona que quiera monitorear una parcela.

---

## Estado del proyecto

Fase 2 en curso.

| Área | Estado |
| :--- | :--- |
| Hardware — Fase 0 y 1 (selección, pinout, simulación) | Completado |
| Hardware — Fase 2 (protoboard físico, código real) | Pendiente |
| Frontend — Maquetado estructural (HTML + CSS gris) | Completado |
| Frontend — CSS de alta fidelidad | Pendiente |
| Backend — Contrato del mensaje serial | **Pendiente — bloquea todo lo demás** |
| Backend — `package.json` y `tsconfig.json` | Completado |
| Backend — Tipos y modelo de datos | En curso (`back/tipos.ts` son variables sueltas, faltan las `interface`) |
| Backend — Lectura/escritura de archivos (fs) | Pendiente |
| Backend — API HTTP para el frontend | Pendiente |
| Backend — Comunicación serial (`serialport`) | Pendiente |
| TIMI — Wireframes, paleta, UI Kit, modelado 3D base | Completado |

---

## Stack

- **Hardware:** Arduino Uno (C/C++ vía Arduino IDE), simulaciones en Tinkercad
- **Backend:** Node.js 24 + TypeScript 7 (`fs` para persistencia, `serialport` para leer el Arduino)
- **Frontend:** HTML + CSS (sin framework por ahora)
- **Formato de intercambio:** JSON
- **Diseño:** Figma (wireframes y UI Kit), Whimsical (mapa de navegación)

---

## Estructura del repositorio

### Hoy

```text
proyecto2026/
├── README.md
├── package.json
├── tsconfig.json           # configuración de TypeScript (solo chequeo, no compila)
├── front/
│   ├── index.html          # Maquetado principal (usa style.css)
│   ├── style.css
│   ├── wireframe.html      # Wireframe estructural (usa archivo.css)
│   ├── archivo.css
│   ├── wireframe1.html     # Wireframe alternativo (usa diseño.css)
│   ├── diseño.css
│   ├── pagina.html         # Pantalla en construcción (usa pagina.css, todavía vacío)
│   ├── pagina.css
│   └── images/
│       ├── imagenfondo.png                 # fondo del wireframe (11 MB, sin optimizar)
│       ├── Anotación 2026-08-18 153734.png # captura de trabajo (387 KB)
│       ├── 157038f1...594d8f4.png          # export de Figma (8 MB, sin optimizar)
│       ├── 67cd5ae0...5bb618c0.png         # export de Figma
│       └── a4a9a27a...9dc38c1e.png         # export de Figma
├── back/
│   ├── index.ts            # Prueba de arranque
│   └── tipos.ts            # Variables de prueba de sensores
└── firmware/
    └── terrasense.ino      # Sketch del Arduino
```

### A dónde va

El backend no debería ser un solo archivo. La estructura propuesta separa las cuatro responsabilidades descritas en [Arquitectura del backend](#arquitectura-del-backend):

```text
proyecto2026/
├── front/                  # sin cambios
├── firmware/
│   └── terrasense.ino      # el sketch del Arduino, versionado acá
├── back/
│   ├── index.ts            # arranque: conecta las piezas y levanta el server
│   ├── tipos.ts            # interfaces Medicion, Usuario
│   ├── serial/
│   │   ├── lector.ts       # abre el puerto COM, emite líneas
│   │   └── mock.ts         # emite líneas falsas, para trabajar sin hardware
│   ├── parser.ts           # string → Medicion | error
│   ├── storage.ts          # fs: guardar y leer mediciones
│   └── api/
│       └── rutas.ts        # endpoints HTTP
├── datos/                  # archivos que genera el backend (no versionar)
├── package.json
└── tsconfig.json
```

### Frontend (`front/`)

Cuatro páginas HTML, cada una con su propia hoja de estilos. No hay build, ni JS propio, ni assets compartidos: cada par HTML/CSS es independiente.

```text
front/
├── index.html ────────► style.css      # Maquetado principal. Único con contenido
│                                       # (<p> de humedad) y con un <script> roto
│                                       # apuntando a back\pr.js (ver Deuda técnica)
│
├── wireframe.html ────► archivo.css    # Wireframe estructural: 8 <section> grises
│   └── usa images/imagenfondo.png      # + una imagen de fondo
│
├── wireframe1.html ───► diseño.css     # Variante del mismo wireframe: 4 <section>
│
├── pagina.html ───────► pagina.css     # Pantalla en construcción: <body> y CSS
│                                       # los dos vacíos (0 bytes)
│
└── images/                             # Exports de Figma y capturas de trabajo
```

Los tres pares de arriba son versiones del mismo diseño, no pantallas distintas. La [Deuda técnica](#deuda-técnica-conocida) incluye unificarlos en un solo par antes de aplicar el CSS de alta fidelidad de Fase 2.

### Hardware (`firmware/`)

Todo el código del Arduino vive en un solo sketch. El Arduino IDE exige que el `.ino` se llame igual que la carpeta que lo contiene, así que el nombre del archivo no es opcional.

```text
firmware/
└── terrasense.ino    # Sketch del Arduino Uno — HOY ESTÁ VACÍO (0 bytes)
                      # El código real todavía vive en las simulaciones de Tinkercad
```

Lo que ese archivo tiene que terminar conteniendo, y cómo se conecta con el resto:

```text
                          firmware/terrasense.ino
                          ┌──────────────────────────────┐
  A_  Humedad de suelo ──►│                              │
  A_  LDR (luz)        ──►│  setup()                     │
  A_  pH (PH-4502C)    ──►│    Serial.begin(9600)        │
  D_  DS18B20 (OneWire)──►│    dht.begin() / sensors...  │
  D_  DHT11            ──►│                              │
                          │  loop()                      │
                          │    leer los 6 valores        │
                          │    Serial.println(linea) ────┼──► USB / serial ──► back/
                          │    delay(5000)               │
                          └──────────────────────────────┘
```

El formato exacto de `linea` es el [contrato del mensaje](#contrato-del-mensaje--a-cerrar-antes-de-codear), que sigue sin cerrarse y bloquea tanto al firmware como al backend. Los pines concretos (`A_`, `D_`) están [pendientes de documentar](#pinout).

---

## Hardware

### Entradas — variables medidas

| Variable | Sensor | Unidad | Señal |
| :--- | :--- | :--- | :--- |
| Humedad del suelo | Capacitive Soil Moisture Sensor v1.2 | % | Analógica |
| Temperatura del suelo | DS18B20 (sonda impermeable) | °C | Digital (OneWire) |
| Humedad del aire | DHT11 | % RH | Digital |
| Temperatura del aire | DHT11 | °C | Digital |
| Luz ambiental | LDR GL5528 | % (relativo) | Analógica |
| pH del suelo | Sonda de vidrio + placa PH-4502C | 0 – 14 | Analógica |

### Salidas

Ninguna. El dispositivo solo mide y envía; no actúa sobre el entorno.

### Consumo y ocupación de pines

| # | Modelo | Pines | Alimentación | Consumo |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Capacitive Soil Moisture v1.2 | 1 analógico | 3.3 – 5.5 V | ~5 mA |
| 2 | DS18B20 | 1 digital + pull-up 4.7 kΩ | 3.0 – 5.5 V | ~1.5 mA |
| 3 | DHT11 | 1 digital | 3.3 – 6 V | ~1.5 mA |
| 4 | LDR GL5528 + resistencia 10 kΩ | 1 analógico | pasivo | ~0.25 mA |
| 5 | PH-4502C + sonda BNC | 1 analógico | 5 V | ~10 mA |

**Total: 3 pines analógicos + 2 digitales.** El Uno tiene 6 analógicos y 12 digitales útiles (D2–D13), así que sobra margen.

**Pasivos y accesorios necesarios:** 1 resistencia de 4.7 kΩ (pull-up del DS18B20), 1 resistencia de 10 kΩ (divisor del LDR), protoboard y cables dupont.

### Pinout

> Pendiente de documentar. La cantidad de pines está definida (3 analógicos + 2 digitales), pero falta fijar en este README a qué pin concreto va cada sensor. Completar con los valores usados en las simulaciones de Tinkercad.

| Componente | Pin |
| :--- | :--- |
| Humedad de suelo | A_ |
| LDR | A_ |
| pH (PH-4502C) | A_ |
| DS18B20 | D_ |
| DHT11 | D_ |

### Lista de compras

| Producto | Precio (ARS) |
| :--- | ---: |
| Sensor de humedad y temperatura de suelo | 2.394 |
| Sensor DHT11 (humedad y temperatura de aire) | 2.152 |
| Sensor de luz ambiental | 104 |
| Módulo sensor de pH PH-4502C | 57.500 |
| Kit de solución buffer para calibrar el pH | 36.137 |
| **Total aproximado** | **98.287** |

Precios relevados al momento de la investigación de Fase 0; pueden haber cambiado. No incluye resistencias, protoboard ni cables.

---

## Comunicación Hardware ↔ Backend

- **Medio:** cable (comunicación serial USB).
- **Librería del lado de Node:** `serialport`.
- **Velocidad:** 9600 baudios. Tiene que ser el mismo número en el sketch y en Node.

### Contrato del mensaje — a cerrar antes de codear

Este es el punto donde se tocan Hardware y Backend, y **es lo primero que hay que definir**: mientras no esté cerrado, ninguno de los dos lados puede avanzar sin riesgo de tener que rehacerlo. Decisiones que faltan tomar y anotar acá:

1. **Un mensaje = una línea, terminada en `\n`.** El Arduino usa `Serial.println()` y Node usa el `ReadlineParser` con delimitador `\n`. Sin esto los datos llegan cortados en pedazos arbitrarios, porque el serial es un stream de bytes, no de mensajes.
2. **Formato: JSON o CSV.** Armar JSON a mano en C++ con `Serial.print` es tedioso y propenso a errores. Una línea CSV (`42.5,18.3,61.0,22.7,78.2,6.4`) es mucho más simple del lado del Arduino, y Node la convierte a objeto igual de fácil. Elegir uno y documentarlo.
3. **Frecuencia de envío.** Para parámetros de suelo, cada 5–10 segundos sobra. Mandar cada 100 ms llena el disco y el frontend no lo puede seguir.
4. **Lecturas fallidas.** El DHT11 devuelve `NaN` cada tanto. ¿El Arduino manda `-1`, manda `null`, o directamente no manda la línea? Si no se define, Node termina guardando `NaN` en el JSON y rompiendo el frontend.
5. **Orden de los campos**, si se elige CSV.

### El timestamp lo pone Node, no el Arduino

El Arduino Uno **no tiene reloj de tiempo real**. No sabe qué hora es y no puede generar una fecha. El backend le pone el timestamp a cada lectura en el momento en que la recibe.

Ejemplo del objeto ya armado del lado de Node (el `timestamp` no viene por el cable, lo agrega el backend):

```json
{
  "timestamp": "2026-08-26T14:32:00Z",
  "suelo": {
    "humedad": 42.5,
    "temperatura": 18.3
  },
  "aire": {
    "humedad": 61.0,
    "temperatura": 22.7
  },
  "luz": 78.2,
  "ph": 6.4
}
```

### Trampas conocidas del serial en Windows

- **El puerto COM lo puede abrir un solo programa a la vez.** Si el Monitor Serie del Arduino IDE está abierto, Node falla con `Access denied`. Es la causa número uno de "no funciona": cerrar el monitor.
- **El número de COM cambia** según el puerto USB donde se enchufe la placa. No hardcodearlo: leerlo de una variable de entorno o listar los puertos disponibles al arrancar.
- **Abrir el puerto resetea el Arduino** (por DTR). Las primeras líneas pueden ser basura del arranque: descartar lo que no parsee en vez de crashear.
- **Si se desconecta el cable, el proceso Node no muere solo.** Hay que manejar el evento de error/cierre y reintentar, o el backend queda vivo pero mudo.

---

## Arquitectura del backend

Cuatro capas, cada una en su archivo. La regla es que ninguna sepa de la de al lado más de lo necesario:

```text
Arduino ──serial──► [1 lector] ──► [2 parser] ──► [3 storage] ──► [4 API HTTP] ──► Frontend
```

| # | Capa | Responsabilidad | Lo que NO sabe |
| :--- | :--- | :--- | :--- |
| 1 | **Lector serial** | Abrir el puerto, leer líneas, emitirlas como strings | Qué es un pH |
| 2 | **Parser + validador** | String → `Medicion` válida, o error | Que existe un puerto serie |
| 3 | **Storage** | Guardar la `Medicion` en disco con `fs` | De dónde vino el dato |
| 4 | **API HTTP** | Leer del storage y servirlo al frontend | Que existe un Arduino |

La ventaja concreta: cada capa se prueba sola. El parser se testea tirándole strings a mano, sin Arduino conectado. Y la API se puede levantar con datos falsos mientras el protoboard todavía no está armado.

### Persistencia

Un objeto JSON por línea (formato **JSON Lines**, `.jsonl`), y cada medición nueva es un `appendFile`.

La alternativa intuitiva —un array en un `mediciones.json` con ciclo `leer → push → escribir entero`— funciona con 50 registros y se vuelve lenta y frágil con 50.000: reescribe el archivo completo en cada medición, y si se corta a la mitad se pierde todo el histórico. Con JSON Lines se escribe solo lo nuevo, y una línea corrupta cuesta una lectura, no el archivo.

Aparte, mantener **la última medición en memoria**, en una variable. El endpoint que el frontend consulta cada pocos segundos lee de ahí, sin tocar el disco.

### API

Con dos endpoints alcanza para arrancar:

| Endpoint | Devuelve |
| :--- | :--- |
| `GET /api/actual` | La última medición — lo que el dashboard muestra en grande |
| `GET /api/historico?desde=...` | Un array de mediciones, para los gráficos |

**Servir el `front/` desde el mismo servidor Node**, en vez de abrir el HTML con doble clic. Si la página se abre como archivo (`file://`) y hace `fetch` a `localhost:3000`, el navegador lo bloquea por CORS. Sirviendo todo desde el mismo origen, el problema no existe.

Para actualizar la pantalla, un `fetch` cada N segundos (*polling*) alcanza. WebSockets es más elegante, pero es complejidad que este proyecto todavía no necesita.

### Orden de trabajo sugerido

Pensado para **no depender del hardware para avanzar**: el backend puede estar terminado antes de que el protoboard exista.

1. Crear `package.json`.
2. Definir las `interface` en `back/tipos.ts` y **cerrar el contrato del mensaje serial**, documentándolo arriba.
3. Escribir el **mock**: un módulo que emite líneas falsas con el formato acordado cada 5 segundos.
4. Parser + storage, probados contra el mock.
5. API HTTP + servir el front. En este punto la página ya muestra datos (falsos) de punta a punta.
6. Recién ahora, el lector serial real. Como todo lo demás ya funciona, si algo falla el problema está en el puerto o en el firmware, no en la lógica del backend.
7. Usuarios y login **al final**: no bloquean nada.

---

## Modelo de datos

### Mediciones

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `timestamp` | string | Fecha ISO 8601, generada por el backend al recibir la lectura |
| `humedad` | number | Humedad del suelo en % |
| `temperatura` | number | Temperatura en °C |
| `luz` | number | Nivel de luz ambiental |
| `ph` | number | pH del suelo (0 – 14) |

### Usuarios

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `nombre_de_usuario` | string | Identificador del usuario |
| `mail` | string | Correo electrónico |
| `contraseña` | string | Debe guardarse hasheada, nunca en texto plano |

---

## Flujo de la información

```text
Sensores → Arduino → (serial, JSON) → Backend → Frontend → Usuario
```

El backend recibe las lecturas del hardware, las guarda y las entrega al frontend, que las renderiza en pantalla.

---

## Cómo correr el proyecto

### Frontend

Por ahora, abrir `front/index.html` directamente en el navegador. No hay build ni dependencias.

Cuando exista la API, el front pasa a servirse desde el backend (ver [API](#api)) y se accede por `http://localhost:3000`.

### Backend

Requiere **Node.js 24 o superior**. La primera vez, `npm install` (instala TypeScript y los tipos de Node, que son las dos únicas dependencias por ahora).

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Ejecuta `back/index.ts` con Node. Por ahora solo imprime un valor de prueba. |
| `npm run check` | Chequea los tipos de todo `back/` con `tsc`. No genera archivos. |

#### Por qué no hace falta compilar

Node 24 ejecuta archivos `.ts` directamente: al leerlos **borra las anotaciones de tipo** y corre el JavaScript que queda. No los compila ni los verifica — un error de tipos no lo detiene.

Esa es la división de trabajo del proyecto: **Node ejecuta, TypeScript revisa**. Por eso hay dos comandos y no uno, y por eso `tsconfig.json` tiene `noEmit: true` — no existe un paso de build ni una carpeta `dist/`.

#### `tsconfig.json`

Configura el chequeo de tipos del backend (`include: ["back/**/*.ts"]`; el front es HTML/CSS y el firmware es C++, así que quedan afuera). Las opciones que importan:

| Opción | Por qué está |
| :--- | :--- |
| `noEmit` | No se compila nada: Node ya ejecuta los `.ts`. `tsc` solo revisa. |
| `erasableSyntaxOnly` | Prohíbe la sintaxis que Node **no** puede borrar (`enum`, `namespace`, parámetros con `private`). Sin esto, el código pasa el chequeo pero explota al ejecutarlo. |
| `verbatimModuleSyntax` | Obliga a escribir `import type` cuando se importa un tipo, para que Node sepa qué línea borrar. |
| `module` / `moduleResolution: nodenext` | El proyecto es ESM (`"type": "module"` en `package.json`); esto hace que TypeScript resuelva los imports igual que Node. |
| `allowImportingTsExtensions` | Permite `import { Medicion } from "./tipos.ts"` — en ESM la extensión va sí o sí, y como no se compila, es la del archivo real. |
| `strict` | El punto de usar TypeScript. Incluye `strictNullChecks`, que es lo que va a atajar los `NaN` del DHT11 descritos arriba. |
| `noUncheckedIndexedAccess` | Al partir la línea CSV del serial, `partes[5]` pasa a ser `string | undefined`. Obliga a contemplar la línea corta o corrupta antes de usarla. |

Las tres últimas son las que le dan sentido a definir las `interface` de `back/tipos.ts`: sin `strict`, el compilador acepta cualquier cosa y el contrato no sirve de nada.

### Hardware

1. Abrir el sketch en el Arduino IDE.
2. Instalar las librerías `DHT sensor library`, `OneWire` y `DallasTemperature`.
3. Seleccionar placa **Arduino Uno** y el puerto COM correspondiente.
4. Subir el programa y abrir el monitor serie a 9600 baudios.
5. **Cerrar el monitor serie** antes de levantar el backend, o Node no va a poder abrir el puerto.

---

## Deuda técnica conocida

- Hay tres pares HTML/CSS distintos (`style.css`, `archivo.css`, `diseño.css`) que son versiones del mismo wireframe. Unificarlos antes de aplicar el CSS definitivo de Fase 2.
- `front/index.html` incluye `<script src="back\pr.js">`, que apunta a una ruta que ya no existe y usa barra invertida (los navegadores esperan `/`). Sacarlo o corregirlo.
- `back/tipos.ts` declara variables con valores en vez de tipos. Lo que hace falta son `interface`, que en TypeScript existen solo en tiempo de compilación y obligan a que las cuatro capas del backend hablen el mismo idioma. El chequeo ya está configurado (`npm run check`), falta el contenido.
- El pinout no está documentado (ver [Pinout](#pinout)).

---

## Equipo

| Rol | Integrante | Grupo |
| :--- | :--- | :--- |
| Frontend | Juan Ignacio Balenzuela | 4 |
| Backend | Salomon Mizrahi | 4 |
| TIMI | Sebastián Lifischtz | 2 |
| Hardware | Joaquín Nitkin | 4 |

---

## Links del proyecto

| Recurso | Link |
| :--- | :--- |
| Repositorio | https://github.com/juanignaciobalenzuela/proyecto2026 |
| Figma (diseño) | https://www.figma.com/design/LOfVQZUNdQiagKO3WrTWsm/Terrasense |
| Mapa de navegación (Whimsical) | https://whimsical.com/seba911/67-SGUzQjrn235iadRxaFBt8v |
| Tinkercad (simulación general) | https://www.tinkercad.com/things/8hIHPngK105-simulacion-proyecto |
| Tinkercad (diseño 3D) | https://www.tinkercad.com/things/8pvMpRjLoZF |
| Carpeta Drive compartida | https://drive.google.com/drive/folders/1iYzrdeP41GJWMEvDUcp_GPrCAFDjBN_9 |

### Simulaciones individuales

- [Humedad de suelo](https://www.tinkercad.com/things/gMeaHPNx0Oa-simulacion-sensor-humedad-suelo)
- [Temperatura de suelo](https://www.tinkercad.com/things/2sOLplP9QpR-copy-of-simulacion-sensor-temperatura-suelo)
- [Humedad de aire](https://www.tinkercad.com/things/6KYQubaLGYE-simulacion-sensor-aire)
- [Luz ambiental](https://www.tinkercad.com/things/4f4dBM66pOP-simulacion-sensor-luz)
- [pH](https://www.tinkercad.com/things/7x7wQgSI96c-simulacion-sensor-ph)
- [Conductividad eléctrica](https://www.tinkercad.com/things/jwHggfrYNdC-simulacion-sensor-conductividad-electrica) — simulado, pero no forma parte del set de sensores definido

---

## Próximos pasos

### Bloqueante

- [ ] **Cerrar el formato exacto del mensaje serial** entre Hardware y Backend, y documentarlo arriba

### Backend

- [x] Crear `package.json`
- [x] Configurar TypeScript (`tsconfig.json` + `npm run check`)
- [ ] Definir las `interface` en `back/tipos.ts`
- [ ] Escribir el mock de datos para desarrollar sin hardware
- [ ] Parser, storage (JSON Lines) y API HTTP
- [ ] Implementar la comunicación serial con `serialport`
- [ ] Servir el `front/` desde el backend

### Hardware

- [ ] Ensamblar el circuito en protoboard
- [ ] Documentar el pinout definitivo en este README
- [ ] Adaptar el código de la simulación al hardware real y verificar lecturas
- [ ] Relevar la alimentación energética (definir si alcanza con USB o hace falta fuente externa)
- [ ] Versionar el sketch en `firmware/`

### Frontend y diseño

- [ ] Unificar los wireframes duplicados en un solo par HTML/CSS
- [ ] Sacar o corregir el `<script src="back\pr.js">` de `index.html`
- [ ] Aplicar el CSS de alta fidelidad con el UI Kit de TIMI
- [ ] Calcular tolerancias y revisar el diseño 3D con el docente
