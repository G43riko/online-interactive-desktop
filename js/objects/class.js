class Class extends Table{
	constructor(position, size, title, attributes = {}, methods = {}, access = PUBLIC_ACCESS){
		super(position, size, [[]]);
		this._name = OBJECT_CLASS;
		this._title = title;
		this._access = access;
		this._methods = methods;
		this._attr = attributes;
		this._fontSize	= 15;
		this._lineHeight = 30;
		this._headerColor = "#24D330";
		this._bodyColor = "#CCFFCC";
		Entity.changeAttr(this, ATTRIBUTE_BORDER_COLOR, shadeColor1(this._headerColor, -20));

		this._makeData();

		this.size.set(this._size.x, this.data.length * this._lineHeight);
		this._calcMaxTextWidth();
		this._checkSize();
	}

	static _parseAttribute(string){
		var tmp = string.replace(/ /g, '').split(":");
		return {
			type: tmp[1],
			access: tmp[0][0],
			name:  tmp[0].slice(1, tmp[0].length)
		};
	}

	static _parseMethod(string){
		var tmp = string.replace(/ /g, '').split(")"),
			tmp2 = tmp[0].split("("),
			args = tmp2[1].split(",").map(a => a.split(":"));
		if(args[0][0] == "void")
			args = "void";
		return {
			returnType: tmp[1].replace(":", ""),
			access: tmp[0][0],
			name:  tmp2[0].slice(1, tmp2[0].length),
			args: args
		};
	}

	addMethod(name, returnType = "void", args = "void", access = PUBLIC_ACCESS){
		this._methods[name] = {
			name: name,
			retType: returnType,
			access: access,
			args: args
		};
		this._makeData();
	}

	static toAccess(access){
		switch(access){
			case "+": return "public";
			case "-": return "private";
			case "#": return "protected";
			default : return "";
		}
	}

	addAttribute(name, type, access = PUBLIC_ACCESS){
		this._attr[name] = {
			name: name,
			type: type,
			access: access
		};
		this._makeData();
	}

	static _methodToString(e){
		var args = (Array.isArray(e.args) ? e.args.map(e => e[0] + ": " + e[1]).join(", ") : e.args);
		return 	e.access + " " + e.name + "(" + args + "): " + e.retType;
	}

	static _attributeToString(e){
		return e.access + " " + e.name + ": " + e.type;
	}

	_makeData(){
		this.data = [[this._title]];
		each(this._attr, e => this.data.push([Class._attributeToString(e)]));
		each(this._methods, e => this.data.push([Class._methodToString(e)]));
	}

	getJavaSource(){
		var result = Class.toAccess(this._access) + " class " + this._title + "{\n\t";

		result += $.map(this._attr, e => Class.toAccess(e.access) + " " + e.type + " " + e.name + ";\n").join("\t");

		result += $.map(this._methods, function(e){
			var args = (Array.isArray(e.args) ? e.args.map(e => e[1] + " " + e[0]).join(", ") : ""),
				subRes = "\n\t" + Class.toAccess(e.access) + " " + e.retType + " ";
				subRes += e.name + "(" + args + "){\n\t\tTODO auto generated body\n\t}\n";
			return subRes;
		}).join("\t");
		result += "}";

		return result;
	}
}