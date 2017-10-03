import { readdir, readFile, statSync } from 'fs';

export interface IFsFunctions {
    readJson: (file: any) => Promise<any>;
    isFile: (path: string) => boolean;
    readDir: (path: string) => Promise<any>;
}

export const fsf: IFsFunctions = {
    readJson,
    isFile,
    readDir,
};

function readJson(file) {
    return new Promise<any>((resolve, reject) => {
        readFile(file, (err, data) => err ? reject(err) : resolve(JSON.parse(data.toString())));
    });
}

function isFile(path: string) {
    try {
        return statSync(path).isFile();
    } catch (err) {
        return false;
    }
}

function readDir(path: string) {
    return new Promise<string[]>((resolve, reject) => {
        readdir(path, (err, files) => err ? reject(err) : resolve(files));
    });
}
