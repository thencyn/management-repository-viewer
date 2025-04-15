import fs from 'fs';
import path from 'path';
import { MrvConfiguracion, IRepoConfiguracion } from "./interfaces";
import chalk from 'chalk';

const CONFIG_FILE = path.resolve(__dirname, './mrv.config.json');

export function grabarNuevoRepo(item: IRepoConfiguracion) {
    if (item.alias.trim() === '') {
        console.log(chalk.bgRed('El alias no puede estar vacío.'));
        return;        
    }
    if (item.path.trim() === '') {
        console.log(chalk.bgRed('El path no puede estar vacío.'));
        return;        
    }

    item.alias = item.alias.trim();
    item.path = item.path.trim().replace(/\\/g, '/');

    let currentConfig: MrvConfiguracion = {
        RepoConfiguracion: []
    };

    if (fs.existsSync(CONFIG_FILE)) {
        currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
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
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
    console.log(`✅ Proyecto ${chalk.black.bgGreen.bold(item.alias)} agregado correctamente.`);
    // console.log(`✅ Proyecto ${item.alias} agregado correctamente.`);
    console.log(CONFIG_FILE);
}

export function borrarRepo(aliasRepo: string) {
    if (aliasRepo.trim() === '') {
        console.log(chalk.bgRed('El alias no puede estar vacío.'));
        return;        
    }
    
    aliasRepo = aliasRepo.trim();

    let currentConfig: MrvConfiguracion = {
        RepoConfiguracion: []
    };

    if (fs.existsSync(CONFIG_FILE)) {
        currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }

    const existeAlias = currentConfig.RepoConfiguracion.some(x => x.alias === aliasRepo);
    if (!existeAlias) {
        console.log(`El alias ${chalk.bgRed(aliasRepo)} no existe.`);
        // console.log(`El alias ${item.alias} ya existe.`);
        return;
    }

    currentConfig.RepoConfiguracion = currentConfig.RepoConfiguracion.filter(x => x.alias !== aliasRepo);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
    console.log(`✅ Proyecto ${chalk.black.bgGreen.bold(aliasRepo)} eliminado correctamente.`);
}


export function obtenerReposConfiguracion(filtro: IRepoConfiguracion): IRepoConfiguracion[] {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.log(chalk.bgRed('El archivo de configuración no existe.'));
        return [];
    }

    const config: MrvConfiguracion = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    return config.RepoConfiguracion
        .filter(repo => {
            return (!filtro.alias || repo.alias === filtro.alias) &&
                    (!filtro.jerarquia || repo.jerarquia.startsWith(filtro.jerarquia)) &&
                    (!filtro.codigo || repo.codigo === filtro.codigo) &&
                    (!filtro.tag || filtro.tag.length === 0 || repo.tag.some(tag => filtro.tag.includes(tag)));
        });
}

export function validarDirectorio(path: string) {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
}