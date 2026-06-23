# Guía de Operación — Casos Críticos Travelkit

> Herramienta para registrar y dar seguimiento a los casos críticos del operativo Travelkit.
> Acceso: **https://casos.travelkit.us** · Ruta principal: **`/casos`**

---

## Parte 1 · Guía de operación

### 1.1 Cómo entra el operativo

1. Abre **https://casos.travelkit.us** en el navegador.
2. Te lleva a la pantalla **"Portal Casos Críticos"** (login).
3. Ingresa tu **correo** y **contraseña** (los crea un administrador en el sistema).
4. Pulsa **Ingresar al sistema**.
5. Entras directamente al listado de casos (`/casos`).

> Si no tienes usuario, pídeselo a un administrador. El acceso es **solo para personal Travelkit autorizado**.
> Para salir, usa el botón **"Cerrar sesión"** (arriba a la derecha).

### 1.2 Pantalla principal

Al entrar ves:
- **Indicadores (arriba):** Casos totales, Abiertos, En seguimiento y Resueltos.
- **Filtros:** para buscar por rango de fechas, número de caso, voucher, nombre, documento de identidad, fecha de nacimiento, área, estatus o proveedor. Pulsa **Buscar** para aplicar y **Limpiar** para reiniciar.
- **Vistas:** botones **Tabla** y **Kanban**.
- **Botones (arriba a la derecha):** **Tareas pendientes** y **Nuevo caso**.

### 1.3 Cómo registrar un caso

1. Pulsa **+ Nuevo caso** (arriba a la derecha).
2. Se abre el formulario. Llena los campos:
   - **Obligatorios:** N.º de Caso, Voucher, Nombre del Paciente.
   - **Proveedor:** WTA o WMC.
   - **Área:** System, Claims, Calidad, Reembolsos o Comercial.
   - Documento de identidad, fecha de nacimiento, estatus, fecha del evento, país de origen del viaje y país del servicio, descripción.
3. **Documentos del caso:** pulsa **Adjuntar archivos** para subir PDFs, imágenes, etc.
4. Pulsa **Registrar caso**.

El caso aparece de inmediato en el listado.

### 1.4 Estatus de un caso

Los casos pasan por estos estados (cada uno con su color):

| Estatus | Color | Significado |
|---|---|---|
| **Abierto** | 🔴 Rojo | Recién registrado, requiere atención |
| **En seguimiento** | 🔵 Azul | En gestión por el operativo |
| **Respuesta Proveedor** | 🟠 Naranja | Esperando o recibiendo respuesta del proveedor |
| **Resuelto** | 🟢 Verde | Caso cerrado con éxito |

### 1.5 Vista Kanban (arrastrar y soltar)

1. Pulsa el botón **Kanban**.
2. Verás **4 columnas**, una por estatus.
3. **Arrastra** la tarjeta de un caso de una columna a otra para **cambiar su estatus**. El cambio se guarda solo.
4. Pulsa una tarjeta para abrir el detalle del caso.

> Útil para mover casos rápidamente según avanzan (ej. de "En seguimiento" a "Respuesta Proveedor").

### 1.6 Detalle de un caso

Pulsa el botón **+** en la columna *Opciones* (o haz clic en la fila / tarjeta). Se abre una ventana centrada con:
- Todos los datos del caso.
- **Documentos** adjuntos (con enlace para abrirlos).
- **Recordatorios** (ver abajo).
- **Seguimiento**: historial de notas con fecha y hora.

Para **agregar una nota de seguimiento**, escribe abajo y pulsa **Enviar**.

### 1.7 Recordatorios

Los recordatorios son tareas con fecha límite (ej. *"Llamar a la central"*, *"Verificar respuesta del proveedor"*).

**Crear un recordatorio:**
1. Abre el caso.
2. En la sección **Recordatorios**, escribe el texto.
3. Elige la **fecha y hora límite**.
4. Deja activado **"Recordatorio por correo"** si quieres aviso por email.
5. Pulsa **Agregar**.

**Qué pasa después:**
- Si la fecha límite pasa y no se ha completado, se marca en **rojo "Vencido"**.
- Cuando llega la fecha, el sistema envía **un correo de aviso** al buzón operativo (si el recordatorio por correo está activado).
- Al marcar el recordatorio como **completado (✓)**, pasa automáticamente al **Seguimiento** del caso con la fecha en que se realizó.

**Ver todos los pendientes:**
- Pulsa **Tareas pendientes** (arriba). Muestra todos los recordatorios sin completar de **todos los casos**, ordenados por fecha, con los vencidos resaltados. Desde ahí puedes marcarlos como completados o abrir el caso.

### 1.8 Casos de reembolso automáticos (por correo)

Algunos casos **se crean solos**, sin registrarlos a mano:

- Cuando llega un correo a **`asistencia@travelkit.us`** con un asunto de reembolso, por ejemplo:
  ```
  Documento de tipo Reembolso | 1655346-02 [ALFONSO MARIA MARTINEZ RESTREPO] | GB-80G6M
  ```
- El sistema toma del asunto el **número de caso**, el **nombre del paciente** y el **voucher**, y crea el caso con **Proveedor WTA**, **Área Reembolsos** y estatus **Abierto**.
- Si el número de caso ya existe, **no se duplica**.

> Por eso es normal ver casos de reembolso en el listado sin haberlos registrado tú. Solo dales seguimiento como a cualquier otro caso.

---

## Parte 2 · Manual del usuario (uso diario)

Pasos rápidos, sin tecnicismos.

### Entrar
1. Abre la página.
2. Escribe tu correo y contraseña.
3. Clic en **Ingresar al sistema**.

### Registrar un caso nuevo
1. Clic en **+ Nuevo caso**.
2. Llena al menos: **N.º de Caso**, **Voucher** y **Nombre del Paciente**.
3. Elige **Proveedor** y **Área**.
4. (Opcional) Adjunta documentos.
5. Clic en **Registrar caso**.

### Buscar un caso
1. Usa los **filtros** de arriba (número, nombre, voucher, etc.).
2. Clic en **Buscar**. Para ver todo de nuevo, clic en **Limpiar**.

### Cambiar el estado de un caso
- **Forma fácil:** clic en **Kanban** y **arrastra** el caso a la columna del nuevo estado.
- O abre el caso y cámbialo desde ahí.

### Dejar una nota de lo que hiciste
1. Abre el caso (clic en la fila o en el botón **+**).
2. Escribe abajo en **Seguimiento** y clic en **Enviar**.

### Ponerte un recordatorio (ej. "llamar a la central")
1. Abre el caso.
2. En **Recordatorios**, escribe la tarea y la **fecha/hora**.
3. Clic en **Agregar**.
4. Cuando la termines, marca el **✓** — quedará registrada en el seguimiento.

### Ver tus pendientes del día
- Clic en **Tareas pendientes** (arriba). Lo que esté en **rojo** ya está vencido: atiéndelo primero.

### Salir
- Clic en **Cerrar sesión** (arriba a la derecha).

---

*Documento de uso interno · Travelkit*
