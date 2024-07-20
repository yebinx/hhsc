import protoJs from "protobufjs";
import { existsSync, fstat, outputFileSync, readdirSync } from "fs-extra"
import { join, resolve } from "path";
import { recursionDirFindPath, success } from "./utils";
import { ApiFile, DependencyType } from "./apiInterface";
import { genCode } from "./genTsApi";

import {
    isEnum,
    isType,
    isService,
    typeGenInterface,
    typeGenInterfaceModule,
    enumGenEnum,
    serviceGenApiFunction,
    insertImport,
} from "./proto/core";
import { pathPreprocessing } from "./proto";

export interface Options {
    files?: string[]; // proto file
    output: string;
    protoDir: string; // proto dir
    apiName?: string;
    apiPath?: string;
    apiPrefixPath?: string;
    depPath?: string;
    ignore?: RegExp; // ignore
}


export function main(options: Options) {
    console.log(options);
    const apiFileMap = getProto2ApiData(options);

    const result = genCode({
        apiFileMap,
        apiName: options.apiName,
        apiPath: options.apiPath,
        apiPrefixPath: options.apiPrefixPath,
    });
    for (const filePath in result) {
        outputFileSync(filePath, result[filePath], "utf8");
        success(`${filePath} generated successfully`);
    }
}


export function getProto2ApiData(options: Options) {
    console.log("Loading PB file ......");
    const apiFileMap: { [fileName: string]: ApiFile } = {};

    const { root, pbPaths } = parseProto(
        options.protoDir,
        options.depPath
    );
    for (const p of pbPaths) {
        if (options?.ignore?.test(p.target)) {
            continue;
        }
        apiFileMap[p.path] = {
            protoPath: p.path,
            protoTargetPath: p.target,
            outputPath: join(options.output, p.target).replace(".proto", ".ts"),
            comment: "",
            imports: [],
            enums: [],
            interfaces: [],
            apiModules: [],
            apiPrefixPath: options.apiPrefixPath,
        };
    }

    const visitRoot = (item: protoJs.Root) => {
        if (item.nested && !isType(item)) {
            // Do not filter deeply nested
            Object.keys(item.nested).forEach((key) => {
                visitRoot(item.nested[key] as protoJs.Root);
            });
        }
        const apiFile = apiFileMap[item.filename];
        if (item.filename && apiFile) {
            // Generate corresponding data for service
            if (isService(item)) {
                apiFile.apiModules.push(serviceGenApiFunction(item as any));
                apiFile.apiModules.forEach((k) =>
                    k.functions.forEach((f) => {
                        if (
                            f.req.resolvedPath &&
                            f.req.dependencyType === DependencyType.EXTERNAL
                        ) {
                            insertImport(apiFile.imports, f.req);
                        }
                        if (
                            f.res.resolvedPath &&
                            f.res.dependencyType === DependencyType.EXTERNAL
                        ) {
                            insertImport(apiFile.imports, f.res);
                        }
                    })
                );
            }
            // Generate corresponding data for enum
            if (isEnum(item)) {
                apiFile.enums.push(enumGenEnum(item as any));
            }
            //  Generate corresponding data for message
            if (isType(item)) {
                const _interface = typeGenInterface(item as any);
                if ((item as any).nested) {
                    _interface.module = typeGenInterfaceModule(item as any);
                }
                apiFile.interfaces.push(_interface);
                //  Generate corresponding data for imports
                _interface.members.forEach((k) => {
                    if (k.propertyType.dependencyType === DependencyType.EXTERNAL) {
                        insertImport(apiFile.imports, k.propertyType);
                    }
                });
                _interface.module?.interfaces?.forEach((i) => {
                    i.members.forEach((k) => {
                        if (k.propertyType.dependencyType === DependencyType.EXTERNAL) {
                            insertImport(apiFile.imports, k.propertyType);
                        }
                    });
                });
            }
        }
    };
    // outputFileSync("root.json", JSON.stringify(root.nested, null, 4));
    visitRoot(root);
    console.log("Convert PB data to api data");
    return pathPreprocessing(
        {
            apiFileMap,
            output: options.output,
        },
        pbPaths
    );
}


export function parseProto(protoDir: string, dependencyPath: string) {
    const root = new protoJs.Root;
    const notFoundList: any[] = [];
    let pbPaths: Array<{ target: string, path: string }> = [];

    let files = readdirSync(protoDir);
    let protoFiles = files.filter((v) => v.endsWith(".proto"))
    
    root.resolvePath = function (origin: string, target: string) {
        if (!protoDir && root.nested && root.files.length > 0) {
            const keys = Object.keys(root.nested);
            const firstPath = root.files[0];
            const reg = firstPath.match(new RegExp(`/${keys[0]}/`));
            reg && (protoDir = firstPath.slice(0, reg.index));
        }
        let pathObj = {
            path: target,
            target: target.replace(protoDir, ""),
        };
        if (!existsSync(pathObj.path)) {
            // if (target.match(/^google/)) {
            //     console.log("target",target)
            //     pathObj = recursionDirFindPath(
            //         resolve(__dirname, "../../", "common"),
            //         target
            //     );
            // } else {
                const originDir = origin.slice(0, origin.lastIndexOf("/"));
                pathObj = recursionDirFindPath(protoDir, target);
                // This happens when the pb directory has no upper directory
                if (!protoDir) {
                    protoDir = originDir;
                }
            // }

            if (!pathObj.path && dependencyPath) {
                pathObj = recursionDirFindPath(dependencyPath, target);
            }

            if (!pathObj.path && !notFoundList.find((k) => k === target)) {
                notFoundList.push(target);
            }
        }
        pbPaths.push(pathObj);
        return pathObj.path;
    }
    root.loadSync(protoFiles, { keepCase: true, alternateCommentMode: true }).resolveAll();
    pbPaths.forEach((obj) => {
        const target = obj.target.replace(protoDir, "");
        obj.target = target.match(/^\//) ? target : "/" + target;
    });
    return {
        root,
        pbPaths,
    };
}


console.log("process.argv1", process.argv[0])
console.log("process.argv2", process.argv[1])
console.log("process.argv2", process.argv[2])
console.log("process.argv2", process.argv[3])

const apiFileMap: { [fileName: string]: ApiFile } = {};

main({
    // files: ["proto/client.proto","proto/common.proto"],
    protoDir: process.argv[2],
    output: process.argv[3],
})

