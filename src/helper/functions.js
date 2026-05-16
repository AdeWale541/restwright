// import defaultConfig from '../default.json' with { type: 'json' };
const defaultConfig= require('../resources/default.json');
const inquirer= require('@inquirer/prompts')

const mapCliArgsToOutput=(args)=>{

    let inputArgs={}
    let errors = []

    let argumentConfigs= Object.keys(defaultConfig)
    defaultConfig.browser
    
    for (let arg of args) {
        for (const argConfig of argumentConfigs) {
            
            if(!inputArgs[argConfig]
                && customIncludes(defaultConfig[argConfig],arg,args)
            ){                
                const value = getArgValue(defaultConfig[argConfig],arg,args)
                inputArgs[argConfig]=value

                if(defaultConfig[argConfig].implies){
                    let keys= Object.keys(defaultConfig[argConfig].implies)
                    keys.forEach(key => {
                        inputArgs[key]=  inputArgs[key] ? inputArgs[key] : defaultConfig[argConfig]["implies"][key]
                    });
                }
            }
        }
    }
    return inputArgs
}

const getUserConfig= async (questionConfig)=>{
    let keys=Object.keys(questionConfig)
    let answer={}    

    for (const key of keys) {
        if(questionConfig[key].implies){
            let dependentKey= Object.keys(questionConfig[key].implies)
            console.log(dependentKey,"dependentKey");
            
            if(answer[dependentKey] != questionConfig[key]["implies"][dependentKey] && answer[dependentKey] != undefined){
                continue;
            }
        }

        switch (questionConfig[key].question.type) {
            case "confirm":
                answer[key]= await inquirer[questionConfig[key].question.type]({message:questionConfig[key].question.value})

                break;
            case "select":{
                    answer[key]= await inquirer[questionConfig[key].question.type]({
                        message:questionConfig[key].question.value,
                        choices: questionConfig[key].lov
                    })
                }
                break;
            case "input":
                answer[key]= await inquirer[questionConfig[key].question.type]({message:questionConfig[key].question.value})
                
                break;
            default:
                throw new Error(`Question Type ${questionConfig[key].question.type} does not exist on the list of accepted question types`)
                break;
        }
    }
            return answer
}

const customIncludes=(argConfig,singleArg,cliArgs)=>{
    const argValidationType = argConfig.lov ? "input" : "boolean"

    switch (argValidationType) {
        case "input":{
            const index= cliArgs.indexOf(singleArg);
            const value= cliArgs[index+1]
            const status= argConfig.args.includes(singleArg) && argConfig.lov.includes(value);

            if(!status){
                return false
            }
            
            if(status && value && !value.startsWith("--")){
                return true
            }
            break;
        }
        default:{
            const index= argConfig.args.indexOf(singleArg);
                        
            if(index >=0){
                return true
            }
            break; 
        }   
    }
    return false
}

const getArgValue=(argConfig,singleArg,cliArgs)=>{
    const argValidationType = argConfig.lov ? "input" : "boolean"

    switch (argValidationType) {
        case "input":{
            const index= cliArgs.indexOf(singleArg);
            const value= cliArgs[index+1]
            const status= argConfig.args.includes(singleArg) && argConfig.lov.includes(value);

            if(!status){
                throw new Error(`Invalid argument value ${singleArg}`)
            }

            
            if(status && value && !value.startsWith("--")){
                return value
            }
            break;
        }
        default:{
            const index= argConfig.args.indexOf(singleArg);
                        
            if(index >=0){
                return true
            }
            break;   
        } 
    }
}

module.exports={mapCliArgsToOutput,getUserConfig}