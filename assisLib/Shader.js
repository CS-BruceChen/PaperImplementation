class Shader {
    constructor(gl,vsPath, fsPath, attributeVar, uniformVar) {
        this.initShader(gl,vsPath, fsPath, attributeVar, uniformVar);
        this.primitives = [];
    }

    async initShader(gl,vsPath, fsPath, attributeVar, uniformVar){
        //type check
        if (Object.prototype.toString.call(attributeVar) != '[object Array]' || Object.prototype.toString.call(uniformVar) != '[object Array]') {
            alert("ShaderInfo ERR::wrong type, parameters should be Array");
            return;
        }

        let vsSource = await getShaderString(vsPath);
        let fsSource = await getShaderString(fsPath);
        var program = getShaderProgram(gl,vsSource,fsSource);
        
        //init shader's member
        this.program = program;
        this.attributeLocations = getShaderVarLocation(gl,attributeVar,program);
        this.uniformLocations = getShaderVarLocation(gl,uniformVar,program);
    }

    /*
    attributeInfo should be like:
    {
        varName0 : [
            [],
        ],
        varName1 : [
            [],
        ],
        ...
    }
    */

    typeCheck(attributeInfo){
        //make sure input a {}
        var infoType = Object.prototype.toString.call(attributeInfo);
        if(infoType != '[object Object]') return false;

        //make sure input have the same key list to the attributeVar
        var varNames = Object.keys(attributeInfo);
        var attriNames = Object.keys(this.attributeLocations);
        if(varNames.length != attriNames.length) return false;
        
        //make sure every key's value's type is 2D Array
        for(var i = 0; i < varNames.length; ++i){
            if(varNames[i] != attriNames[i]) return false;
            var varType = Object.prototype.toString.call(attributeInfo[varNames[i]]);
            if(varType != '[object Array]') return false;
            var varElementType = Object.prototype.toString.call(attributeInfo[varNames[i]][0]);
            if(varElementType != '[object Array]') return false;
        }

        return true;
        

    }

    addPrimitive(primitiveType,primitiveInfo){//primitiveInfo is an object
        var legalType = ['point','polygon'];
        var isRightInfoType = this.typeCheck(primitiveInfo);
        
        if(!legalType.includes(primitiveType)) {
            alert('wrong type of input point type');
            return;
        }
        if(!isRightInfoType) {
            alert('wrong type or format of input point date');
            return;
        }
        
        this.primitives.push({
            type : primitiveType,
            data : primitiveInfo,
        })
    }

    addDataToTopPrimitive(varName,value){
        var len = this.primitives.length;
        if(len <= 0) {
            alert('EMPTY ARRAY ERR::primitives is empty now!');
            return;
        }
        if(this.primitives[len-1].type == 'point') {
            alert('TYPE ERR::can not add extra data to a point');
            return;
        }
        this.primitives[len-1].data[varName].push(value);
    }

    

    
};
