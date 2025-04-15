export interface MrvConfiguracion {
    RepoConfiguracion: IRepoConfiguracion[];
}

export interface IRepoConfiguracion {
    path: string;
    alias: string;
    tag: string[];
    jerarquia: string;
    codigo: string;
}



export interface IGitRutasInformacion {
    path: string;
    alias: string;
    tag?: string[];
    jerarquia?: string;
    ramaActual?: IGitInformacionRamaActual;
    listaRamasLocales?: IGitInformacionRama[];
    listaRamasRemotas?: string[];
    tieneOrigenRemoto?: boolean;
    esRepositorio: boolean;
}

export interface IGitInformacionRama {
    nombreRama: string;
    cantidadCambiosBajar: number;
}

export interface IGitInformacionRamaActual {
    nombreRama: string;
    archivosConCambios: string[];
    archivosAgregados: string[];
    archivosEliminados: string[];
    pendientesSubir: number;
    pendientesBajar: number;
}