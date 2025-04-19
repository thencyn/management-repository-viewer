# Management Repository Viewer

Una herramienta de línea de comandos para gestionar múltiples repositorios Git. Si trabajas con varios repositorios y necesitas verificar rápidamente su estado, esta herramienta te permite obtener una visualización rápida de todos ellos.

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
mrv add -a "Mario Phaser" -p "C:\MisProgramas\Phaser\mario" -t "Phaser , Juegos" -j "Programas/Juegos/Phaser" -c "juego-phaser"
```



### 🔹 mrv add-auto
Agregar multiples repositorios a partir de una ruta base maximo recorrido 2 niveles.

- **Por comandos:**
```sh
mrv add-auto -p "C:\MisProgramas\" -t "Tag1, Tag2"
```
En este ejemplo al tener como ruta base **C:\MisProgramas** sucede lo siguiente:
1) Recorre todas las carpetas dentro de este repositorio y sus subcarpetas.
2) Analiza si es un directorio de Git valido
3) A las carpetas que son repositorios validos se guardan en una estructura y agrega el tag esta como parametro de entrada, vamos a utilizar el siguiente ejemplo:
```sh
mrv add-auto -p "C:\MisProgramas\" -t "Juegos"
```
Vamos a suponer que en este directorio existe un repositorio valido de GIT: **C:\MisProgramas\Phaser\mario** , se guardaran los siguientes datos en nuestro archivo de configuración
  **alias:** mario  $\rightarrow$ nombre de la ultima carpeta del path
  **path:** C:/MisProgramas/Phaser/mario
  **jerarquia:** MisProgramas/Phaser/mario
  **tag:** ["Juegos"]
  **codigo:** Phaser $\rightarrow$ nombre de la primera carpeta despues de la carpeta base
4) Guarda los datos en el archivo de configuracion

En caso de no especificar el parámetro -p, se tomará por defecto la ruta desde donde se está ejecutando el prompt.


### 🔹 mrv del
Elimina un repositorio al archivo de configuración.

- **Interactivo:** Mostrará una lista ordenada con los alias de los repositorios, desde la cual se podrá seleccionar aquel que se desea eliminar.
```sh
mrv del --int 
```

- **Por comandos:**
```sh
mrv del -a alias
mrv del -a "Mario Phaser"
```



### 🔹 mrv del-mass
Elimina uno varios repositorios de forma interactiva.
1) Al ejecutar el comando nos preguntara si deseamos realizar un filtro por Código, Tag o Sin Filtro.
2) Una vez seleccionado el filtro nos desplegara una lista de selcción multiple, con todos los alias de nuestros proyectos.
3) Una vez seleccionados los proyectos pulsamos enter y estos seran borrados de la configuración.

- **Por comandos:**
```sh
mrv del-mass
```



### 🔹 mrv rename
Se utiliza para renombrar Alias, Jerarquia, Codigo, Tags o Path. Puede renombrar mas de un repositorio segun la opción seleccionada

- **Por comandos:**
```sh
mrv rename -a "mario" -na "Mario-Phaser" ➡️ Renombra un repositorio con el alias de mario a Mario-Phaser
mrv rename -p "C:\MisProgramas\Phaser\mario" -np "C:\MisProgramas\Juegos\mario" ➡️ Modifica el path de un repositorio
mrv rename -t "Juegos" -nt "Juegos-Phaser" ➡️ Renombra todos los tag "Juegos" que se encuentran en el archivo de configuración por otro tag llamado "Juegos-Phaser"
mrv rename -j "MisProgramas/Phaser/mario" -nj "MisProgramas/Juegos/mario" ➡️ Renombra todas las jerarquias "MisProgramas/Phaser/mario" por "MisProgramas/Juegos/mario"
mrv rename -c "mario" -nc "Mario-Phaser" ➡️ Renombra todos los códigos "mario" por "Mario-Phaser"
```



### 🔹 mrv tag
Se utiliza para agregar o quitar tag a distintos proyectos, funciona en modo interactivo
1) Al ejecutar el prompt nos preguntara si desemos agregar o quitar tag.
2) En caso de agregar tag nos preguntara el nombre del nuevo tag, en caso de quitar nos ofrecera una lista para seleccionar el tag que deseamos eliminar.
3) Por último se nos presentaran los proyectos donde deseamos agregar o quitar el tag.

- **Por comandos:**
```sh
mrv tag
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