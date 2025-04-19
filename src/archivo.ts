import fs from "fs";
import path from "path";
import os from 'os';
import { MrvConfiguracion, IRepoConfiguracion } from "./interfaces";
import chalk from "chalk";
import { verificarRepositorioGit } from "./util-git";
import readline from 'readline';

const CONFIGDIR = path.join(os.homedir(), '.management-repository-viewer');
const CONFIG_FILE = path.resolve(CONFIGDIR, "./mrv.config.json");
if (!fs.existsSync(CONFIGDIR)) {
	fs.mkdirSync(CONFIGDIR, { recursive: true });
}

export function grabarNuevoRepo(item: IRepoConfiguracion, esMasivo: boolean = false) {
	if (item.alias.trim() === "") {
		console.log(chalk.bgRed("El alias no puede estar vacío."));
		return;
	}
	if (item.path.trim() === "") {
		console.log(chalk.bgRed("El path no puede estar vacío."));
		return;
	}

	item.alias = item.alias.trim();
	item.path = item.path.trim().replace(/\\/g, "/");

	let currentConfig: MrvConfiguracion = {
		RepoConfiguracion: [],
	};

	if (fs.existsSync(CONFIG_FILE)) {
		currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
	}

	const existeAlias = currentConfig.RepoConfiguracion.some(x => x.alias === item.alias);
	if (existeAlias) {
		console.log(`El alias ${chalk.bgRed(item.alias)} ya existe.`);
		// console.log(`El alias ${item.alias} ya existe.`);
		return;
	}

	const existePath = currentConfig.RepoConfiguracion.some(x => x.path === item.path);
	if (existePath) {
		console.log(`El path ${chalk.bgRed(item.path)} ya existe.`);
		// console.log(`El path ${item.path} ya existe.`);
		return;
	}

	currentConfig.RepoConfiguracion.push(item);
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), "utf-8");
	console.log(`✅ Proyecto ${chalk.black.bgGreen(item.alias)} agregado correctamente.`);
	// console.log(`✅ Proyecto ${item.alias} agregado correctamente.`);
	if (!esMasivo) {
		console.log(CONFIG_FILE);
	}
}

export function borrarRepo(aliasRepo: string) {
	if (aliasRepo.trim() === "") {
		console.log(chalk.bgRed("El alias no puede estar vacío."));
		return;
	}

	aliasRepo = aliasRepo.trim();

	let currentConfig: MrvConfiguracion = {
		RepoConfiguracion: [],
	};

	if (fs.existsSync(CONFIG_FILE)) {
		currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
	}

	const existeAlias = currentConfig.RepoConfiguracion.some(x => x.alias === aliasRepo);
	if (!existeAlias) {
		console.log(`El alias ${chalk.bgRed(aliasRepo)} no existe.`);
		// console.log(`El alias ${item.alias} ya existe.`);
		return;
	}

	currentConfig.RepoConfiguracion = currentConfig.RepoConfiguracion.filter(x => x.alias !== aliasRepo);
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), "utf-8");
	console.log(`✅ Proyecto ${chalk.black.bgGreen(aliasRepo)} eliminado correctamente.`);
}

export function obtenerReposConfiguracion(filtro: IRepoConfiguracion | null = null): IRepoConfiguracion[] {
	if (!fs.existsSync(CONFIG_FILE)) {
		console.log(chalk.bgRed("El archivo de configuración no existe."));
		return [];
	}

	const config: MrvConfiguracion = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
	if (filtro === null) {
		return config.RepoConfiguracion;
	}
	return config.RepoConfiguracion.filter(repo => {
		return (
			(!filtro.alias || repo.alias === filtro.alias) &&
			(!filtro.jerarquia || repo.jerarquia.startsWith(filtro.jerarquia)) &&
			(!filtro.codigo || repo.codigo === filtro.codigo) &&
			(!filtro.tag ||
				filtro.tag.length === 0 ||
				repo.tag.some((tag) => filtro.tag.includes(tag)))
		);
	});
}

export function validarDirectorio(path: string) {
	return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}

export async function obtenerDirectorios(pathBase: string, nivelProfundidad: number, listaTags: string[]) {
	const encontrados: IRepoConfiguracion[] = [];
	pathBase = pathBase.replace(/[\\\/]$/, '');
	const obtenerCodigo = (value: string) => {
		value = value.replace(/\\/g, '/');
	}
	const recorrer = async (dir: string, nivel: number, nivelMax: number) => {
		if (nivel > 2) return;

		let items: string[];
		try {
			items = await fs.promises.readdir(dir);
		} catch (err) {
			console.error(chalk.red(`No se pudo leer el directorio: ${dir}`));
			return;
		}

		for (const item of items) {
			const fullPath = path.join(dir, item);
			try {
				const stat = await fs.promises.stat(fullPath);
				if (stat.isDirectory()) {
					// console.log(`Leyendo: ${fullPath}`);
					readline.clearLine(process.stdout, 0); // 0: borrar toda la línea
					readline.cursorTo(process.stdout, 0);  // volver al inicio
					process.stdout.write(`Leyendo: ${fullPath}`);
					const esGit = await verificarRepositorioGit(fullPath);
					if (esGit) {
						const relative = path.relative(pathBase, fullPath);


						const proyecto: IRepoConfiguracion = {
							alias: item,
							path: fullPath,
							jerarquia: `${pathBase.slice(pathBase.lastIndexOf('\\') + 1)}/${relative.replace(/\\/g, '/')}`,
							tag: listaTags,
							codigo: `${relative.replace(/\\/g, '/').indexOf('/') === -1 ? relative : relative.replace(/\\/g, '/').slice(0, relative.replace(/\\/g, '/').indexOf('/'))}`,
						};
						encontrados.push(proyecto);
					} else {
						await recorrer(fullPath, nivel + 1, nivelMax);
					}
				}
			} catch {
				continue;
			}
		}
	}
	await recorrer(pathBase, 1, nivelProfundidad);
	readline.clearLine(process.stdout, 0); // 0: borrar toda la línea
	readline.cursorTo(process.stdout, 0);  // volver al inicio
	process.stdout.write(`✅ Lectura Terminada `);
	console.log('');
	return encontrados;
}

export async function renombrar(valorActual: string, nuevoValor: string, tipoCambio: 'alias' | 'path' | 'tag' | 'jerarquia' | 'codigo') {
	if (!fs.existsSync(CONFIG_FILE)) {
		console.log(chalk.bgRed("El archivo de configuración no existe."));
		return;
	}
	if (valorActual.trim() === "") {
		console.log(chalk.bgRed("El valor actual no puede estar vacío."));
		return;
	}
	if (nuevoValor.trim() === "") {
		console.log(chalk.bgRed("El nuevo valor no puede estar vacío."));
		return;
	}

	valorActual = valorActual.trim();
	nuevoValor = nuevoValor.trim();

	let currentConfig: MrvConfiguracion = {
		RepoConfiguracion: [],
	};
	currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
	let totalRenombrados = 0;
	if (tipoCambio === 'alias') {
		const existeAlias = currentConfig.RepoConfiguracion.some(x => x.alias === valorActual);
		if (!existeAlias) {
			console.log(`El alias ${chalk.bgRed(valorActual)} no existe.`);
			return;
		}
		const existeNuevoAlias = currentConfig.RepoConfiguracion.some(x => x.alias === nuevoValor);
		if (existeNuevoAlias) {
			console.log(`El nuevo alias ${chalk.bgRed(nuevoValor)} ya existe.`);
			return;
		}
		const item = currentConfig.RepoConfiguracion.find(x => x.alias === valorActual);
		item!.alias = nuevoValor;
		totalRenombrados++;
	} else if (tipoCambio === 'path') {
		const existePath = currentConfig.RepoConfiguracion.some(x => x.path === valorActual);
		if (!existePath) {
			console.log(`El path ${chalk.bgRed(valorActual)} no existe.`);
			return;
		}
		const existeNuevoPath = currentConfig.RepoConfiguracion.some(x => x.path === nuevoValor);
		if (existeNuevoPath) {
			console.log(`El nuevo path ${chalk.bgRed(nuevoValor)} ya existe.`);
			return;
		}
		const item = currentConfig.RepoConfiguracion.find(x => x.path === valorActual);
		item!.path = nuevoValor;
		totalRenombrados++;
	} else if (tipoCambio === 'tag') {
		currentConfig.RepoConfiguracion.forEach(x => {
			if (x.tag.includes(valorActual)) {
				x.tag = Array.from(new Set(x.tag.map(tag => tag === valorActual ? nuevoValor : tag)));
				totalRenombrados++;
			}
		});
	} else if (tipoCambio === 'jerarquia') {
		currentConfig.RepoConfiguracion.forEach(x => {
			if (x.jerarquia === valorActual) {
				x.jerarquia = nuevoValor;
				totalRenombrados++;
			}
		});
	} else if (tipoCambio === 'codigo') {
		currentConfig.RepoConfiguracion.forEach(x => {
			if (x.codigo === valorActual) {
				x.codigo = nuevoValor;
				totalRenombrados++;
			}
		});
	}

	// const existeAlias = currentConfig.RepoConfiguracion.some(x => x.alias === valorActual);
	// if (!existeAlias) {
	// 	console.log(`El alias ${chalk.bgRed(valorActual)} no existe.`);
	// 	return;
	// }

	currentConfig.RepoConfiguracion.forEach(x => {
		if (x.alias === valorActual) {
			x.alias = nuevoValor;
			x.path = x.path.replace(valorActual, nuevoValor);
			x.jerarquia = x.jerarquia.replace(valorActual, nuevoValor);
			x.codigo = x.codigo.replace(valorActual, nuevoValor);
		}
	});

	fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), "utf-8");
	console.log(`✅ Se han modificado ${chalk.black.bgGreen(totalRenombrados)} Proyectos.`);
}


export async function administracionTag(tag: string, listaAlias: string[], accion: "Agregar" | "Quitar") {
	if (!fs.existsSync(CONFIG_FILE)) {
		console.log(chalk.bgRed("El archivo de configuración no existe."));
		return;
	}
	tag = tag.trim();
	if (tag.trim() === "") {
		console.log(chalk.bgRed("El valor del tag no puede ser vacío."));
		return;
	}

	let currentConfig: MrvConfiguracion = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
	for (const item of currentConfig.RepoConfiguracion) {
		if (listaAlias.includes(item.alias)) {
			if (accion === "Agregar") {
				if (!item.tag.includes(tag)) {
					item.tag.push(tag);
				}
			} else if (accion === "Quitar") {
				item.tag = item.tag.filter(x => x !== tag);
			}
		}
	}
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), "utf-8");
	console.log(`✅ Se ha ${chalk.black.bgGreen(accion)} el tag ${chalk.black.bgGreen(tag)}.`);
}