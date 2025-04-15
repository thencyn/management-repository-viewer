import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { IRepoConfiguracion } from "./interfaces";
import { obtenerReposConfiguracion } from "./archivo";
import chalk from "chalk";

export async function addRepo() {
	try {
		const { alias, repoPath, jerarquia, codigo } = await inquirer.prompt([
			{
				type: "input",
				name: "alias",
				message: "Ingrese Alias (pk):",
			},
			{
				type: "input",
				name: "repoPath",
				message: "Ingrese Path (Unique):",
			},
			{
				type: "input",
				name: "jerarquia",
				message: "Ingrese Jerarquia:",
			},
			{
				type: "input",
				name: "codigo",
				message: "Ingrese Código:",
			},
		]);

		const tags: string[] = [];
		while (true) {
			const { tag } = await inquirer.prompt([
				{
					type: "input",
					name: "tag",
					message: "Ingrese tag (deje vacío para terminar):",
				},
			]);

			if (!tag) break;
			tags.push(tag);
		}

		return <IRepoConfiguracion>{
			path: repoPath,
			alias,
			tag: tags,
			jerarquia,
			codigo,
		};
	} catch (error: any) {
		if (error.isTtyError) {
			console.log(chalk.red("❌ La terminal no soporta prompts interactivos."));
		} else if (error.message?.includes("User force closed")) {
			console.log(chalk.yellow("\n🛑 Operación cancelada por el usuario."));
		} else {
			console.error(chalk.red("Ocurrió un error inesperado:"), error);
		}
		process.exit(1);
	}
}

export async function configFiltro() {
	try {
		const { alias, jerarquia, codigo } = await inquirer.prompt([
			{
				type: "input",
				name: "alias",
				message: "Ingrese Alias (pk):",
			},
			{
				type: "input",
				name: "jerarquia",
				message: "Ingrese Jerarquia:",
			},
			{
				type: "input",
				name: "codigo",
				message: "Ingrese Código:",
			},
		]);

		const tags: string[] = [];
		while (true) {
			const { tag } = await inquirer.prompt([
				{
					type: "input",
					name: "tag",
					message: "Ingrese tag (deje vacío para terminar):",
				},
			]);

			if (!tag) break;
			tags.push(tag);
		}

		return <IRepoConfiguracion>{
			path: "",
			alias,
			tag: tags,
			jerarquia,
			codigo,
		};
	} catch (error: any) {
		if (error.isTtyError) {
			console.log(chalk.red("❌ La terminal no soporta prompts interactivos."));
		} else if (error.message?.includes("User force closed")) {
			console.log(chalk.yellow("\n🛑 Operación cancelada por el usuario."));
		} else {
			console.error(chalk.red("Ocurrió un error inesperado:"), error);
		}
		process.exit(1);
	}
}

export async function configFiltroCodigo() {
	const listaRepos = await obtenerReposConfiguracion({
		alias: "",
		jerarquia: "",
		codigo: "",
		tag: [],
		path: "",
	});
	const listaCodigos = new Set(
		listaRepos.filter((repo) => repo.codigo).map((repo) => repo.codigo)
	);
	// if (listaCodigos.size === 0) {
	//   console.log('No hay códigos disponibles.');
	//   return;
	// }
	try {
		const { codigo } = await inquirer.prompt([
			{
				type: "list",
				name: "codigo",
				message: "Seleccione Código:",
				choices: Array.from(listaCodigos),
			},
		]);

		return <IRepoConfiguracion>{
			path: "",
			alias: "",
			tag: [],
			jerarquia: "",
			codigo,
		};
	} catch (error: any) {
		if (error.isTtyError) {
			console.log(chalk.red("❌ La terminal no soporta prompts interactivos."));
		} else if (error.message?.includes("User force closed")) {
			console.log(chalk.yellow("\n🛑 Operación cancelada por el usuario."));
		} else {
			console.error(chalk.red("Ocurrió un error inesperado:"), error);
		}
		process.exit(1);
	}
}

export async function configFiltroTag() {
	const listaRepos = await obtenerReposConfiguracion({
		alias: "",
		jerarquia: "",
		codigo: "",
		tag: [],
		path: "",
	});
	const listaTags = new Set(listaRepos.flatMap((x) => x.tag).filter((x) => x));
	// if (listaCodigos.size === 0) {
	//   console.log('No hay códigos disponibles.');
	//   return;
	// }
	try {
		const { tag } = await inquirer.prompt([
			{
				type: "list",
				name: "tag",
				message: "Seleccione Tag:",
				choices: Array.from(listaTags),
			},
		]);

		return <IRepoConfiguracion>{
			path: "",
			alias: "",
			tag: [tag],
			jerarquia: "",
			codigo: "",
		};
	} catch (error: any) {
		if (error.isTtyError) {
			console.log(chalk.red("❌ La terminal no soporta prompts interactivos."));
		} else if (error.message?.includes("User force closed")) {
			console.log(chalk.yellow("\n🛑 Operación cancelada por el usuario."));
		} else {
			console.error(chalk.red("Ocurrió un error inesperado:"), error);
		}
		process.exit(1);
	}
}

export async function configFiltroAlias() {
	const listaRepos = await obtenerReposConfiguracion({
		alias: "",
		jerarquia: "",
		codigo: "",
		tag: [],
		path: "",
	});
	const listaAlias = new Set(listaRepos.map((x) => x.alias));
	// if (listaCodigos.size === 0) {
	//   console.log('No hay códigos disponibles.');
	//   return;
	// }
	try {
		const { alias } = await inquirer.prompt([
			{
				type: "list",
				name: "alias",
				message: "Seleccione Alias:",
				choices: Array.from(listaAlias).sort((x, y) => x.localeCompare(y)),
			},
		]);

		return <IRepoConfiguracion>{
			path: "",
			alias: alias,
			tag: [],
			jerarquia: "",
			codigo: "",
		};
	} catch (error: any) {
		if (error.isTtyError) {
			console.log(chalk.red("❌ La terminal no soporta prompts interactivos."));
		} else if (error.message?.includes("User force closed")) {
			console.log(chalk.yellow("\n🛑 Operación cancelada por el usuario."));
		} else {
			console.error(chalk.red("Ocurrió un error inesperado:"), error);
		}
		process.exit(1);
	}
}

export async function selecccionarOpcionesAbrir() {
	try {
		const { opcion } = await inquirer.prompt([
			{
				type: "list",
				name: "opcion",
				message: "Seleccione Alias:",
				choices: ["explorer", "code"],
			},
		]);
		return opcion;
	} catch (error: any) {
		if (error.isTtyError) {
			console.log(chalk.red("❌ La terminal no soporta prompts interactivos."));
		} else if (error.message?.includes("User force closed")) {
			console.log(chalk.yellow("\n🛑 Operación cancelada por el usuario."));
		} else {
			console.error(chalk.red("Ocurrió un error inesperado:"), error);
		}
		process.exit(1);
	}
}
