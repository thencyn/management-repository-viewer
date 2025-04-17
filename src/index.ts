#!/usr/bin/env node
import { Command } from 'commander';
import * as Interactivos from './comandos-interactivos';
import { IRepoConfiguracion } from './interfaces';
import { administracionTag, borrarRepo, grabarNuevoRepo, obtenerDirectorios, obtenerReposConfiguracion, renombrar, validarDirectorio } from './archivo';
import { procesoDirectoriosGit } from './util-git';
import { json } from 'stream/consumers';
import { exec } from 'child_process';
import chalk from 'chalk';
const PACKAGE = require('../package.json');

const program = new Command();

program
    .name('mrv')
    .description('Management Repository Viewer - Herramienta CLI para gestión de proyectos Git')
    .version(`
Version: ${PACKAGE.version}
Autor: ${PACKAGE.author}
`);

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
            filtro = await Interactivos.configFiltro();
        } else  if (options.ic) {
            filtro = await Interactivos.configFiltroCodigo();
        } else  if (options.it) {
            filtro = await Interactivos.configFiltroTag();
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
            filtro = await Interactivos.configFiltro();
        } else  if (options.ic) {
            filtro = await Interactivos.configFiltroCodigo();
        } else  if (options.it) {
            filtro = await Interactivos.configFiltroTag();
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
	.command('add-auto')
	.description('Agregar un listado de repositorios al registro (2 niveles de profundidad)')
	.option('-p, --path <path>', 'Ruta base donde buscar repositorios de GIT')
	.option('-t, --tag <tags>', 'Tags separados por coma, que se  utilizaran para todos los repos encontrados.')
	.action(async options => {
		const { path } = options;
		if (!path) {
			console.log(chalk.red('Debe proporcionar una ruta con -p'));
			return;
		}
		else if (!validarDirectorio(path)) {
			console.log(chalk.red('La ruta no es válida o no existe'));
			return;
		}
		const listaTags = options.tag?.split(',').map((t: string) => t.trim()) || [];
		const listaRepos = await obtenerDirectorios(path, 2, listaTags);
		for (const item of listaRepos) {
			await grabarNuevoRepo(item, true);
		}
    });


program
	.command('add')
	.description('Agregar un nuevo repositorio al registro')
    .option('--exp', 'Modo interactivo')
    .option('--int', 'Modo interactivo')
    .option('-a, --alias <alias>', 'Alias del proyecto Obligatorio (PK)')
    .option('-p, --path <path>', 'Ruta del proyecto Obligatorio (Unique)')
    .option('-t, --tag <tags>', 'Tags separados por coma')
    .option('-j, --jerarquia <jerarquia>', 'Jerarquía')
    .option('-c, --codigo <codigo>', 'Código del proyecto')
    .action(async options => {
        let nuevoRepo: IRepoConfiguracion;
        if (options.int) {
            nuevoRepo = await Interactivos.addRepo();
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
            repo = (await Interactivos.configFiltroAlias()).alias;
        } else {
            repo = options.alias || '';
        }
        if (!repo) {
            console.log('No se encontró el proyecto.');
            return;
        }
        await borrarRepo(repo);
    });

	program
    .command('del-mass')
    .description('Eliminacion masiva de repositorios del registro')
    .action(async options => {
		const opcionFiltro = await Interactivos.selecccionarOpcionesParaFiltrar();
		if (opcionFiltro) {
			let filtro: IRepoConfiguracion | null;
			if (opcionFiltro === 'Codigo') {
				filtro = await Interactivos.configFiltroCodigo();
			} else  if (opcionFiltro === 'Tag') {
				filtro = await Interactivos.configFiltroTag();
			} else {
				filtro = null;
			}
			const listaRepos = await obtenerReposConfiguracion(filtro);
			if (listaRepos.length === 0) {
				console.log('No se encontraron proyectos con ese filtro.');
				return;
			}

			const lista = await Interactivos.selecccionarMultipleProyectoAlias(listaRepos);
			if (lista.length > 0) {
				for (const repo of lista) {
					await borrarRepo(repo);
				}
			}
		}
    });

program
    .command('open')
    .description('Abrir repositorio en la opcion seleccionada')
    .option('-c, --codigo <codigo>', 'Código de los proyectos')
    .action(async options => {
        let codigo: string = options.codigo || '';
        if (!codigo) {
            codigo = (await Interactivos.configFiltroCodigo()).codigo;
        }
        if (!codigo) {
            console.log('Debe ingresar el código de los proyectos.');
            return;
        }
        const listaRepos = obtenerReposConfiguracion({codigo, alias: '', jerarquia: '', tag: [], path: ''});
        if (listaRepos.length === 0) {
            console.log('No se encontraron proyectos con ese código.');
            return;
        }
        console.log(`Se abriran ${chalk.bgBlue.black(listaRepos.length)} repositorio(s).`);

        const editor = await Interactivos.selecccionarOpcionesAbrir();
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

program
    .command('rename')
    .description('Renombrar Alias, Jerarquia, Codigo, Tags o Path')
	.option('-a, --alias <alias>', 'Alias del proyecto')
	.option('--na <alias>', 'Nuevo Alias del proyecto')
    .option('-p, --path <path>', 'Ruta del proyecto')
    .option('--np <path>', 'Nueva ruta del proyecto')
    .option('-t, --tag <tags>', 'Tag')
    .option('--nt <tags>', 'Nuevo nombre Tag')
    .option('-j, --jerarquia <jerarquia>', 'Jerarquía')
    .option('--nj <jerarquia>', 'Nueva jerarquía')
    .option('-c, --codigo <codigo>', 'Código del proyecto')
    .option('--nc <codigo>', 'Nuevo código del proyecto')
    .action(async options => {
		let valorActual = '';
		let valorNuevo = '';
		let tipoCambio: 'alias' | 'path' | 'tag' | 'jerarquia' | 'codigo';
		if (options.alias && options.na) {
			valorActual = options.alias;
			valorNuevo = options.na;
			tipoCambio = 'alias';
		} else if (options.path && options.np) {
			valorActual = options.path;
			valorNuevo = options.np;
			tipoCambio = 'path';
		} else if (options.tag && options.nt) {
			valorActual = options.tag;
			valorNuevo = options.nt;
			tipoCambio = 'tag';
		} else if (options.jerarquia && options.nj) {
			valorActual = options.jerarquia;
			valorNuevo = options.nj;
			tipoCambio = 'jerarquia';
		} else if (options.codigo && options.nc) {
			valorActual = options.codigo;
			valorNuevo = options.nc;
			tipoCambio = 'codigo';
		} else {
			console.log(chalk.red('Debe ingresar al menos un campo para renombrar'));
			return;
		}
		await renombrar(valorActual, valorNuevo, tipoCambio!);
    });

	program
    .command('tag')
    .description('Se utiliza para agregar o quitar tags a los repositorios en la configuracion')
	.action(async options => {
		const accion = await Interactivos.selecccionarOpcionAgregarQuitar();
		let tag: string = '';
		if (accion === 'Agregar') {
			tag = await Interactivos.ingreseTag();
		} else {
			[tag] = (await Interactivos.configFiltroTag()).tag;
		}
		if (!tag) {
			return;
		}

		let listaRepos: IRepoConfiguracion[] = [];
		if (accion === 'Quitar') {
			listaRepos = await obtenerReposConfiguracion({tag: [tag], alias: '', jerarquia: '', codigo: '', path: ''});
		} else {
			listaRepos = await obtenerReposConfiguracion();
		}

		const lista = await Interactivos.selecccionarMultipleProyectoAlias(listaRepos);
		if (lista.length > 0) {
			await administracionTag(tag, lista, accion);
		} else {
			console.log(chalk.red('No se seleccionó ningún repositorio'));
			return;
		}
    });

program.parse();
