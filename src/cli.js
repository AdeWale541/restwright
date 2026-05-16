// import arg from 'arg'
//import defaultConfig from './default.json' with { type: 'json' };
// import { mapArgsToOutput } from './helper/functions.js';
const {input,select,confirm}= require('@inquirer/prompts')
const { execSync } = require('child_process');
const {promisify,styleText} = require('util');
const path = require('path');
const fs = require('fs');
const defaultConfig= require('./resources/default.json');
const {mapCliArgsToOutput,getUserConfig}= require('./helper/functions.js')
const packageDependencies= require('./resources/dependencies.json')


const exec = promisify(require('child_process').exec);

module.exports= createProject = async(args)=>{
    const inputs = await getConfig(args)
    console.log(inputs);

    const currentPath = process.cwd();
    const folderName = inputs.packageName;
    const appPath = path.join(currentPath, folderName);

    await createDirectory(appPath)
    process.chdir(appPath)
    await installNPMDependencies()
    await updatePackageJson(appPath,inputs)
    await runCmd("npm i")
}

const getConfig=async(rawArgs)=>{
    let impConfig={}    
    let packageName= rawArgs[2]

    if(!packageName || packageName.startsWith("-") ){
        packageName = await input({ message: 'Enter the name of your playwright project' });
    }

    impConfig.packageName= packageName

    const cliArgs = rawArgs.splice(2)    
    
    const inputArgs = mapCliArgsToOutput(cliArgs)

    if (inputArgs.default){
        const keys = Object.keys(defaultConfig)
        let defInputs={}

        keys.forEach(key =>{
            defInputs[key]= defaultConfig[key].default
            impConfig[key]= inputArgs[key] ? inputArgs[key] : defInputs[key]
        })
        return impConfig
    }

    let userDefault = await confirm({message:"Do you want to use the default configuration?"})

    if (userDefault){
        const keys = Object.keys(defaultConfig)
        let defInputs={}

        keys.forEach(key =>{
            defInputs[key]= defaultConfig[key].default
            impConfig[key]= inputArgs[key] ? inputArgs[key] : defInputs[key]
        })
        return impConfig
    }

    inputArgs.default= false //Ensures questions aren't read out for default anymore


    const inputArgKeys= Object.keys(inputArgs)
    let questionConfig= defaultConfig

    for (const key of inputArgKeys) {
        delete questionConfig[key]
    }

    const answerArgs = await getUserConfig(questionConfig)

    impConfig= {...impConfig,...inputArgs,...answerArgs}    
    return impConfig
}

const runCmd= async(command)=>{
  try {
    const { stdout, stderr } = await exec(command);
    // console.log(stdout);
    console.log(stderr);
  } catch {
    (error) => {
      console.log(styleText(["bold","red"],"Process Failed:"),error);
    };
  }
}

const createDirectory = async (appPath) => {
    try {
        fs.mkdirSync(appPath);
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log(styleText(["bold","red"],"Process Failed:"),'Directory already exists. Please choose another name for the project.');
        } else {
            console.log(styleText(["bold","red"],"Process Failed:"),err);
        }
        process.exit(1);
    }
}

const installNPMDependencies = async (appPath) => {
    await runCmd("npm init -y")
}

const updatePackageJson = async (appPath,input) => {
    const filename = `${appPath}/package.json`

    const rawData = fs.readFileSync(filename);
    fs.unlinkSync(filename)

    const data = await JSON.parse(rawData);
    
    const dependencies= parsePackageDependencies(input)

    const newData = {...data, ...dependencies}
    console.log("package.json", newData);
    const newJSONData = JSON.stringify(newData, null, 2)
    fs.writeFileSync(filename, newJSONData)
}

const parsePackageDependencies = (input) => {
    let defDevDependencies= packageDependencies.devDependencies
    let defDependencies= packageDependencies.dependencies

    let devPackageKeys= Object.keys(defDevDependencies)
    let packageKeys= Object.keys(defDependencies)

    let devDependencies={}
    let dependencies={}

    for (const key of devPackageKeys) {
        if(typeof defDevDependencies[key]==="string"){
            devDependencies[key]= defDevDependencies[key]
            continue;
        }

        if(defDevDependencies[key].dependentValue === input[defDevDependencies[key].dependency]){
            devDependencies[key]= defDevDependencies[key].value
        } 
    }

    for (const key of packageKeys) {
        if(typeof defDependencies[key]==="string"){
            dependencies[key]= defDependencies[key]
            continue;
        }

        if(defDependencies[key].dependentValue === input[defDependencies[key].dependency]){
            dependencies[key]= defDependencies[key].value
        } 
    }

    return {devDependencies,dependencies}
}