module.exports={
    bValidSchema:{
            type:'object',
            properties: 
            {
                message:
                {
                    type:'object',
                    properties:
                    {
                        name: { type: "string" },
                        age: { type: "number" },
                    },
                    required: ["name","age"]
                }
                
            },
            required: ["message"]
        },
    bValidObject:{
        "message":
        {
            "name":"value1",
            "age":18
        }
    },
        
    isJson:function(str){
        try{
            
            JSON.parse(str)// throw error if not json
        }
        catch(e){
            return false
        }
        return true
    },
    // Checks that object contains every required key in schema (RECURSIVE)
    // 1 ignoring every extra keys in object 
    // 2 ignoring every unrequired keys in schema
    // 3👍 checking for nested objects
    validateSchemaLogic:(pJsonObject,pJsonSchema)=>{
        let result=true
        try{
            if(!typeof pJsonObject==='object'){
                return false
            }
            else{ 
                if(pJsonSchema.hasOwnProperty("required")){
                    for( let i=0;i< pJsonSchema.required.length;i++){
                    // check for each key
                        let key=pJsonSchema.required[i];
                        let y=typeof pJsonObject[key]
                        let z=pJsonSchema.properties[key].type
                        if(pJsonObject.hasOwnProperty(key)&&y===z){
                            if(y==='object'){
                                let a=pJsonObject[key]
                                let b=pJsonSchema.properties[key] 
                                result=result && module.exports.validateSchemaLogic(a,b)
                            }               
                        }
                        else{
                            return false
                        }
                    }
                }
                else{
                        return true
                    }
                    return result;
            }
        }
        catch(e){
            return false
        }
    }
}