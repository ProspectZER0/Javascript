//overwrite and edit some part to fix the false gathered coordinate
Window_Message.prototype.updateFloatPlacement = function() {
	if (!this._tailSprite) this.createWindowTail();
	if (this.pTarget == null) {
		this._tailSprite.opacity = 0;
		return;
	};
	
	if (this.openness < 255) this._tailSprite.opacity = 0;
	// Update the text box position

	// init pos X,Y
	var posX = this.pTarget.screenX() * $gameMap.zoom.x - this.width / 2;
	var posY = this.pTarget.screenY() * $gameMap.zoom.y + this.yOffset;
	console.log(this.yOffset);
	// set posX
	if (posX + this.width > Graphics.boxWidth) {
		posX = Graphics.boxWidth - this.width;
	} else if (posX < 0) {
		posX = 0;
	};
	this.x = posX;
	this._tailSprite.x = this.pTarget.screenX() * $gameMap.zoom.x - this.x;
	
	// set posY
	if (posY + this.height > Graphics.boxHeight) {
		var maxY = Graphics.boxHeight - this.height;
		posY = Math.min(maxY,this.pTarget.screenY() * $gameMap.zoom.y - Galv.Mstyle.yOffet - this.height);
		this.tailPos = 0;
	} else if (posY < 0) {
		posY = Math.max(this.pTarget.screenY() * $gameMap.zoom.y + 15,0); // position box under when it hits top of screen
		this.tailPos = 2;
	} else {
		this.tailPos = $gameMessage._positionType;
	};
	this.y = posY;
	
	if (this.openness > 200) {
		if (this.tailPos == 1) { // MID
			this._tailSprite.opacity = 0;
		} else if (this.tailPos == 2) { // BOT
			this._tailSprite.y = 2;
			this._tailSprite.scale.y = -1;
			this._tailSprite.opacity += 50;
		} else if (this.tailPos == 0) { // TOP
			this._tailSprite.scale.y = 1;
			this._tailSprite.y = this.height - 2;
			this._tailSprite.opacity += 50;
		};
	};
	this.updateFloats(this.x,this.width,this.y,this.height);
};

//overwrites the calculation of this.yOffset
Window_Message.prototype.changeWindowDimensions = function() {
	if (this.pTarget != null) {
		// Calc max width and line height to get dimensions
		var w = 10;
		var h = 0;

		if (Imported.Galv_MessageBusts) {
			if ($gameMessage.bustPos == 1) {
				var faceoffset = 0;
			} else {
				var faceoffset = Galv.MB.w;
			};
		} else {
			var faceoffset = Window_Base._faceWidth + 25;
		};

		// Calc X Offset
		var xO = $gameMessage._faceName ? faceoffset : 0;
		xO += Galv.Mstyle.padding[1] + Galv.Mstyle.padding[3]; // Added padding

		// Calc text width
		this.resetFontSettings();
		for (var i = 0; i < $gameMessage._texts.length; i++) {
			var lineWidth = this.testWidthEx($gameMessage._texts[i]) + this.standardPadding() * 2 + xO;
			if (w < lineWidth) w = lineWidth;
			
		};
		this.resetFontSettings();
		this.width = Math.min(Graphics.boxWidth,w);
		
		// Calc minimum lines
		var minFaceHeight = 0;
		if ($gameMessage._faceName) {
			w += 15;
			if (Imported.Galv_MessageBusts) {
				if ($gameMessage.bustPos == 1) w += Galv.MB.w;
				minFaceHeight = 0;
			} else {
				minFaceHeight = Window_Base._faceHeight + this.standardPadding() * 2;
			};
		};
		
		// Calc text height
		var textState = { index: 0 };
		textState.text = this.convertEscapeCharacters($gameMessage.allText());
		var allLineHeight = this.calcTextHeight(textState,true);
		var height = allLineHeight + this.standardPadding() * 2;
		var minHeight = this.fittingHeight($gameMessage._texts.length);
		this.height = Math.max(height,minHeight,minFaceHeight);
		this.height += Galv.Mstyle.padding[0] + Galv.Mstyle.padding[2];
		this.yOffset = -Galv.Mstyle.yOffet * $gameMap.zoom.y - this.height;
		
	} else {
		this.yOffset = 0;
		this.width = this.windowWidth();
		this.height = Galv.Mstyle.Window_Message_windowHeight.call(this);
		this.x = (Graphics.boxWidth - this.width) / 2;
	};
};