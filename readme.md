# Management Repository Viewer

Una herramienta de línea de comandos para gestionar múltiples repositorios Git.

---

## 🚀 Instalación

```sh
npm install -g management-repository-viewer
```

## 📦 Comandos disponibles

### 🔹 mrv add
Agregar un nuevo repositorio al archivo de configuración.

- **Interactivo:** te guiará paso a paso para agregar un repositorio.
```sh
mrv add --int
```

- **Por comandos:**
```sh
mrv add -a alias -p "path/al/repositorio" -t "tag1,tag2" -j "jerarquia" -c "codigo"
mrv add -a "Mario Phaser" -p "C:\MisProgramas\Phaser\mario" -t "Phaser , Juegos" -j "Programas/Juegos/Phaser" -c "juego-phaser"
```

### 🔹 mrv del
Eimina un repositorio al archivo de configuración.

- **Interactivo:** Mostrará una lista ordenada con los alias de los repositorios, desde la cual se podrá seleccionar aquel que se desea eliminar.
```sh
mrv del --int 
```

- **Por comandos:**
```sh
mrv del -a alias
mrv del -a "Mario Phaser"
```

### 🔹 mrv list
Muestra el archivo de configuración actual, permitiendo aplicar filtros para acotar su visualización.

- **Todos:** Mostrar todos
```sh
mrv list
```

- **Interactivo:** te pedira ingresar cualquiera de los siguientes filtros Alias, Jerarquía, Código o Tag.
```sh
mrv list --int
```

- **Interactivo códigos:** te pedira seleccionar un código de un listado.
```sh
mrv list --ic
```

- **Interactivo tags:** te pedira seleccionar un tag de un listado.
```sh
mrv list --it
```

- **Por comandos:**
```sh
mrv list -a alias -t "tag1,tag2" -j "jerarquia" -c "codigo"
mrv list -a "Mario Phaser" 
mrv list -t "Phaser , Juegos" 
mrv list -t "Juegos" 
mrv list -j "Programas/Juegos/Phaser" 
mrv list -c "juego-phaser"
```

- **Resultado:**
```json
[
  {
    "alias": "Mario Phaser",
    "path": "C:/MisProgramas/Phaser/mario",
    "tag": [
      "Phaser",
      "Juegos"
    ],
    "jerarquia": "Programas/Juegos/Phaser",
    "codigo": "juego-phaser"
  }
]
```

### 🔹 mrv status
Muestra el status de GIT de los repositorios configurados, se pueden aplicar filtros para acotar su visualización.

- **Todos:** Mostrar todos
```sh
mrv status
```

- **Interactivo:** te pedira ingresar cualquiera de los siguientes filtros Alias, Jerarquía, Código o Tag.
```sh
mrv status --int
```

- **Interactivo códigos:** te pedira seleccionar un código de un listado.
```sh
mrv status --ic
```

- **Interactivo tags:** te pedira seleccionar un tag de un listado.
```sh
mrv status --it
```

- **Por comandos:**
```sh
mrv status -a alias -t "tag1,tag2" -j "jerarquia" -c "codigo"
mrv status -a "Mario Phaser" 
mrv status -t "Phaser , Juegos" 
mrv status -t "Juegos" 
mrv status -j "Programas/Juegos/Phaser" 
mrv status -c "juego-phaser"
```

- **Resultado:** la salida que aca se muestra no incluye los colores de consola. Aquí se mostrarán todos los repositorios que cumplan con el filtro de búsqueda, permitiendo identificar rápidamente cuáles requieren actualización.
```sh
Mario Phaser
        ~develop 0↓ 1↑ 8M 4+ 1-
        main 2↓
```

### 🔹 mrv open
Se selecciona un código o se recibe por parámetro, se abrirán todos los proyectos asociados a este código, en el explorador de archivos o Visual Studio Code.

- **Seleccion por Codigo:** se mostrara una lista desplegable interactiva con los códigos ingresados en nuestro archivo de configuración
```sh
mrv open
```

- **Por comandos:**
```sh
mrv open -c "juego-phaser"
```




## 🧠 Autor

⚙️ Desarrollado por [Thencyn](https://github.com/thencyn)