import simpleGit, { BranchSummary, FetchResult, LogResult, SimpleGit, StatusResult } from "simple-git";
import { IGitInformacionRama, IGitRutasInformacion, IRepoConfiguracion } from "./interfaces";
import { validarDirectorio } from "./archivo";

const Colores = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
};

async function verificarDirectorioGit(directorio: IRepoConfiguracion): Promise<IGitRutasInformacion> {


    const listaRamas: IGitInformacionRama[] = [];
    // const tieneOrigenRemoto = await verificarOrigenRemoto(directorio);
    const git: SimpleGit = simpleGit(directorio.path);
    const isRepo: boolean = await verificarRepositorioGit(directorio.path);
    if (!isRepo) {
    return {
        path: directorio.path,
        alias: directorio.alias,
        tag: directorio.tag,
        jerarquia: directorio.jerarquia,
        esRepositorio: false,
    };

    }

    const ramasLocales = (await git.branchLocal()).all;
    const ramasRemotas = (await git.branch()).all.filter((rama) => rama.includes("/origin/")).map((rama) => rama.slice(rama.lastIndexOf("/") + 1));
    const status: StatusResult = await git.status();
    // const log: LogResult = await git.log();
    // const fetch: FetchResult = (await git.fetch());
    const ramasLocalesConRamaRemota = ramasLocales.filter((rama) => ramasRemotas.includes(rama));
    for (const rama of ramasLocalesConRamaRemota) {
        // const fetch = await git.fetch("origin", rama);
        const raw = await git.raw(["rev-list", "--count", rama + "..origin/" + rama]);
        listaRamas.push({
            nombreRama: rama,
            cantidadCambiosBajar: parseInt(raw.trim()),
        });
      // console.log(listaRamas);
    }

    // const ramasRemotasCambios = (await git.listRemote(['--heads'])).split('\n')
    //   .filter(Boolean)
    //   .map((line) => line.split('\t')[1].replace('refs/heads/', ''));
    // const referenciaRamaLocal = (await git.revparse(['HEAD'])).trim();
    // const referenciaRamaRemota = ramasRemotasCambios.find((ramaRemota) => ramaRemota.endsWith(referenciaRamaLocal));
    // // const cambiosPorDescargar = referenciaRamaRemota ? await git.revlist([`${referenciaRamaLocal}..${referenciaRamaRemota}`]) : [];
    // // console.log(`La rama ${referenciaRamaLocal} tiene ${cambiosPorDescargar.length} cambios por descargar.`);
    // console.log({
    //   ramasRemotasCambios,
    //   referenciaRamaLocal,
    //   referenciaRamaRemota,
    // });

    // Obtén una lista de todas las ramas locales
    // git.branchLocal((err, branchList) => {
    //   if (err) console.error('Error getting branches: ', err);

    //   // Recorre todas las ramas locales
    //   branchList.all.forEach((branch) => {
    //       // Obtén las últimas actualizaciones del repositorio remoto
    //       git.fetch('origin', branch, (err) => {
    //           if (err) console.error(`Error fetching ${branch}: `, err);

    //           // Lista todos los commits que están en la rama remota pero no en la rama local
    //           git.raw(['rev-list', '--count', branch + '..origin/' + branch], (err, result) => {
    //               if (err) console.error(`Error counting commits for ${branch}: `, err);

    //               // Result es el número de commits que están en la rama remota pero no en tu rama local
    //               console.log(`Number of remote commits for ${branch}: `, result.trim());
    //           });
    //       });
    //   });
    // });

    return {
        path: directorio.path,
        alias: directorio.alias,
        tag: directorio.tag,
        jerarquia: directorio.jerarquia,
        ramaActual: {
            nombreRama: status.current ?? "",
            archivosConCambios: status.modified ?? [],
            archivosAgregados: status.not_added ?? [],
            archivosEliminados: status.deleted ?? [],
            pendientesBajar: listaRamas.find((rama) => rama.nombreRama === status.current)?.cantidadCambiosBajar ?? 0,
            pendientesSubir: status.ahead ?? 0,
        },
        listaRamasLocales: listaRamas,
        listaRamasRemotas: ramasRemotas,
        tieneOrigenRemoto: true,
        esRepositorio: true,
    };
}


export async function procesoDirectoriosGit(listaDirectorios: IRepoConfiguracion[]) {
    for (const item of listaDirectorios) {
        if (!validarDirectorio(item.path)) {
            console.error(`❌ Error para el alias ${item.alias}, no se encontro el directorio: ${item.path}\n`);
            continue;
        }
        const informacion = await verificarDirectorioGit(item);
        let texto = `${Colores.bg.green}${Colores.fg.black}${informacion.alias}${Colores.reset}\n`;
        if (!informacion.esRepositorio) {
            texto += ` ${Colores.fg.red}~ NO ES UN REPOSITORIO VALIDO ${Colores.reset}`;
        } else if (informacion.esRepositorio && informacion.ramaActual) {
            if (informacion.ramaActual.pendientesBajar > 0) {
                texto += `\t${Colores.fg.black}${Colores.bg.red}~${informacion.ramaActual.nombreRama}${Colores.reset}`;
            } else if (informacion.ramaActual.archivosConCambios?.length > 0) {
                texto += `\t${Colores.fg.black}${Colores.bg.yellow}~${informacion.ramaActual.nombreRama}${Colores.reset}`;
            } else if (informacion.ramaActual.archivosAgregados?.length > 0) {
                texto += `\t${Colores.fg.black}${Colores.bg.green}~${informacion.ramaActual.nombreRama}${Colores.reset}`;
            } else if (informacion.ramaActual.archivosEliminados?.length > 0) {
                texto += `\t${Colores.fg.black}${Colores.bg.red}~${informacion.ramaActual.nombreRama}${Colores.reset}`;
            } else {
                texto += `\t~${informacion.ramaActual.nombreRama}`;
            }
            texto += ` ${Colores.fg.red}${informacion.ramaActual.pendientesBajar ?? 0}↓${Colores.reset}`;
            texto += ` ${Colores.fg.blue}${informacion.ramaActual.pendientesSubir ?? 0}↑${Colores.reset}`;
            texto += ` ${Colores.fg.yellow}${informacion.ramaActual.archivosConCambios?.length ?? 0}M${Colores.reset}`;
            texto += ` ${Colores.fg.green}${informacion.ramaActual.archivosAgregados?.length ?? 0}+${Colores.reset}`;
            texto += ` ${Colores.fg.red}${informacion.ramaActual.archivosEliminados?.length ?? 0}-${Colores.reset}`;
            texto += '\n';
            if (informacion.listaRamasLocales) {
                for (const iterator of informacion.listaRamasLocales.filter(x => x.nombreRama !== informacion.ramaActual?.nombreRama)) {
                    texto += `\t${Colores.fg.black}${!iterator.cantidadCambiosBajar ? Colores.fg.white : Colores.bg.red}${iterator.nombreRama}${Colores.reset} ${Colores.fg.red}${iterator.cantidadCambiosBajar ?? 0}↓${Colores.reset}\n`;
                }
            }
        }
        console.log(texto);
    }
}

export async function verificarRepositorioGit(path: string) {
	const git: SimpleGit = simpleGit(path);
    return await git.checkIsRepo();

}