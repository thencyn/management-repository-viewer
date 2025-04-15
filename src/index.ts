#!/usr/bin/env node
import { Command } from 'commander';
import { addRepo, configFiltro, configFiltroAlias, configFiltroCodigo, configFiltroTag, selecccionarOpcionesAbrir } from './comandos-interactivos';
import { IRepoConfiguracion } from './interfaces';
import { borrarRepo, grabarNuevoRepo, obtenerReposConfiguracion, validarDirectorio } from './archivo';
import { procesoDirectoriosGit } from './util-git';
import { json } from 'stream/consumers';
import { exec } from 'child_process';
import chalk from 'chalk';

const program = new Command();

program
    .name('mrv')
    .description('Management Repository Viewer - Herramienta CLI para gestión de proyectos Git')
    .version('1.0.0');

program
    .command('status')
    .description('Muestra el estado GIT de los repositorios')
    .option('--int', 'Modo interactivo')
    .option('--ic', 'Modo interactivo solo para código')
    .option('--it', 'Modo interactivo solo para tags')
    .option('-a, --alias <alias>', 'Alias del proyecto')
    .option('-t, --tag <tags>', 'Tags separados por coma')
    .option('-j, --jerarquia <jerarquia>', 'Jerarquía Base')
    .option('-c, --codigo <codigo>', 'Código del proyecto')
    .action(async options => {
        if (+!!options.int + +!!options.ic + +!!options.it > 1) {
            console.log('No se puede usar --int, --ic y --it al mismo tiempo.');
            return;
        }

        let filtro: IRepoConfiguracion;
        if (options.int) {
            filtro = await configFiltro();
        } else  if (options.ic) {
            filtro = await configFiltroCodigo();
        } else  if (options.it) {
            filtro = await configFiltroTag();
        } else {
            filtro = {
                alias: options.alias || '',
                path: '',
                tag: options.tag?.split(',').map((t: string) => t.trim()) || [],
                jerarquia: options.jerarquia || '',
                codigo: options.codigo || '',
            };
        }
        const listaRepos = obtenerReposConfiguracion(filtro);
        if (listaRepos.length === 0) {
            console.log('No se encontraron proyectos con ese filtro.');
            return;
        }
        await procesoDirectoriosGit(listaRepos.sort((a, b) => a.alias.localeCompare(b.alias)));
    });

program
    .command('list')
    .description('Muestra el estado de los repositorios en la configuración')
    .option('--int', 'Modo interactivo')
    .option('--ic', 'Modo interactivo solo para código')
    .option('--it', 'Modo interactivo solo para tags')
    .option('-a, --alias <alias>', 'Alias del proyecto')
    .option('-t, --tag <tags>', 'Tags separados por coma')
    .option('-j, --jerarquia <jerarquia>', 'Jerarquía Base')
    .option('-c, --codigo <codigo>', 'Código de los proyectos')
    .action(async options => {
        if (+!!options.int + +!!options.ic + +!!options.it > 1) {
            console.log('No se puede usar --int, --ic y --it al mismo tiempo.');
            return;
        }

        let filtro: IRepoConfiguracion;
        if (options.int) {
            filtro = await configFiltro();
        } else  if (options.ic) {
            filtro = await configFiltroCodigo();
        } else  if (options.it) {
            filtro = await configFiltroTag();
        } else {
            filtro = {
                alias: options.alias || '',
                path: '',
                tag: options.tag?.split(',').map((t: string) => t.trim()) || [],
                jerarquia: options.jerarquia || '',
                codigo: options.codigo || '',
            };
        }
        const listaRepos = obtenerReposConfiguracion(filtro);
        if (listaRepos.length === 0) {
            console.log('No se encontraron proyectos con ese filtro.');
            return;
        }
        console.log(JSON.stringify(listaRepos.sort((a, b) => a.alias.localeCompare(b.alias)), null, 2));        
    });

program
.command('add')
.description('Agregar un nuevo repositorio al registro')
    .option('--int', 'Modo interactivo')
    .option('-a, --alias <alias>', 'Alias del proyecto Obligatorio (PK)')
    .option('-p, --path <path>', 'Ruta del proyecto Obligatorio (Unique)')
    .option('-t, --tag <tags>', 'Tags separados por coma')
    .option('-j, --jerarquia <jerarquia>', 'Jerarquía')
    .option('-c, --codigo <codigo>', 'Código del proyecto')
    .action(async options => {
        let nuevoRepo: IRepoConfiguracion;
        if (options.int) {
            nuevoRepo = await addRepo();
        } else {
            nuevoRepo = {
                alias: options.alias || '',
                path: options.path || '',
                tag: options.tag?.split(',').map((t: string) => t.trim()) || [],
                jerarquia: options.jerarquia || '',
                codigo: options.codigo || '',
            };
        }
        grabarNuevoRepo(nuevoRepo);
    });

program
    .command('del')
    .description('Eliminacion de un repositorio del registro')
    .option('--int', 'Modo interactivo')
    .option('-a, --alias <alias>', 'Alias del proyecto')
    .action(async options => {
        let repo: string = '';
        if (options.int) {
            repo = (await configFiltroAlias()).alias;
        } else {
            repo = options.alias || '';
        }
        if (!repo) {
            console.log('No se encontró el proyecto.');
            return;
        }
        borrarRepo(repo);
    });

program
    .command('open')
    .description('Abrir repositorio en la opcion seleccionada')
    .option('-c, --codigo <codigo>', 'Código de los proyectos')
    .action(async options => {
        let codigo: string = options.codigo || '';
        if (!codigo) {
            codigo = (await configFiltroCodigo()).codigo;
        }
        if (!codigo) {
            console.log('Debe ingresar el código de los proyectos.');
            return;
        }
        const listaRepos = obtenerReposConfiguracion({alias: '', jerarquia: '', codigo, tag: [], path: ''});
        if (listaRepos.length === 0) {
            console.log('No se encontraron proyectos con ese código.');
            return;
        }
        console.log(`Se abriran ${chalk.bgBlue.black(listaRepos.length)} repositorio(s).`);

        const editor = await selecccionarOpcionesAbrir();
        if (editor) {
            for (const item of listaRepos) {
                if (!validarDirectorio(item.path)) {
                    console.error(`❌ Error no se encontro el directorio: ${item.path}`);
                    continue;
                }
                const ruta = editor === 'explorer' ? item.path.replace(/\//g, '\\') : item.path;
                exec(`${editor} "${ruta}"`, (error, stdout, stderr) => {
                    if (editor !== 'explorer' && error) {
                        console.error(`❌ Error al abrir directorio: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`⚠️ ${stderr}`);
                        return;
                    }
                    // console.log(`✅ VS Code abierto en: ${item.path}`);
                });
            }
        }
    });

program.parse();

//mrv add -a "GitLab - Polla 7 FrontEnd" -p "C:/MisProgramas/Freddy/Polla/02 Juego 7 de la suerte/7suerte-frontend" -t "Freddy, Phaser , GitLab" -j "Freddy/Polla/Polla7" -c "Polla7"
//mrv add -a "GitLab - Polla 7 backend" -p "C:\MisProgramas\Freddy\Polla\02 Juego 7 de la suerte\7suerte-backend" -t "Freddy, Phaser , GitLab" -j "Freddy/Polla/Polla7" -c "Polla7"
//mrv add -a "DT-Info" -p "C:\MisProgramas\Freddy\Kairos\DT-Info\DT-Info Proyecto" -t "Freddy, Kairos" -j "Freddy/Kairos/dt-info" -c "dt-info"
//mrv add -a "Polla - Enchanted Illusions frontend" -p "C:\MisProgramas\Freddy\Polla\11-enchanted-illusions\enchanted-illusions-frontend" -t "Freddy, Phaser , GitLab" -j "Freddy/Polla/enchanted-illusions" -c "polla-ei"
//mrv add -a "Polla - Golden Scarab frontend" -p "C:\MisProgramas\Freddy\Polla\10-Golden-Scarab\golden-scarab-frontend" -t "Freddy, Phaser , GitLab" -j "Freddy/Polla/golden-scarab" -c "polla-ei"


