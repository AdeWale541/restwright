// import defaultConfig from '../default.json' with { type: 'json' };
const defaultConfig= require('../default.json');


const mapArgsToOutput=(args)=>{

    let inputArgs={}
    let errors = []

    let argumentConfigs= Object.keys(defaultConfig)
    defaultConfig.browser
    
    for (let arg of args) {
        for (const argConfig of argumentConfigs) {
            
            if(!inputArgs[argConfig]
                // && defaultConfig[argConfig].args.includes(arg)
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


module.exports={mapArgsToOutput}