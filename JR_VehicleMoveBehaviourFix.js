/*:
 * @plugindesc Vehicle Behaviour Fix
 * 
 * @author JR with aid from Sakuya
 * 
 * @help
 * Doesn't really need any Plugin Parameter
 * 
 * This plugin overwrites the boat (vehicle) hit box
 * to 2 x 3 tile long, but the 2 x 3 tile hit box will
 * be reset to 1 x 1 when the player drive the vehicle
 * 
 * Another addition, since the default will reset the vehicle
 * direction to left whenever player get off the vehicle, I
 * overwrite the player to always face down when get off the vehicle
 * 
 * We made that if under the vehicle (plus Y 1 to vehicle
 * coordinate) isn't passable, then the player won't get off the vehicle
 * 
*/

var JR = JR || {};
JR.VehicleFix = {};

Game_Player.prototype.moveDiagonally = function(horz, vert) {
	this._diagSlide = null;
	
	if (this._normMove) {
		if (!this.isInVehicle()) {
			this.moveDiagonallyNorm(horz,vert);
		} else {
			this._diagDir = false;
			this.moveStraight(this.getOtherdir(horz,vert));
		}
		return;
	};

	var qDirX = this.quadDirX(horz);
	var qDirY = this.quadDirY(vert);
	var targetQuadX = $gameMap.roundXWithDirectionQuad(this._x, horz, qDirX);
	var targetQuadY = $gameMap.roundYWithDirectionQuad(this._y, vert, qDirY);
	var diag = this.canPassDiagonally(targetQuadX, targetQuadY, horz, vert, qDirX, qDirY);


	if (diag) {
		this._diagDir = Galv.PMOVE.getDir(horz,vert);
		this._tileQuadrant.x = qDirX;
		this._tileQuadrant.y = qDirY;
		this._x = targetQuadX;
		this._y = targetQuadY;
        this._realX = $gameMap.xWithDirectionQuad(this._x, this.reverseDir(horz), qDirX);
        this._realY = $gameMap.yWithDirectionQuad(this._y, this.reverseDir(vert), qDirY);
        this.increaseSteps();
		if (Imported.Galv_ShadowDarken) this.checkShadow();
	} else {
		// DIAGONAL IS BLOCKED, CHECK HORZ AND VERT FOR POSSIBLE MOVE

		var qDirYh = this.quadDirY(horz);
		var targetQuadYh = $gameMap.roundYWithDirectionQuad(this._y, horz, qDirYh);	
		var normX = this.canPass(targetQuadX, targetQuadYh, horz, qDirX, qDirYh);
		
		var qDirXv = this.quadDirX(vert);
		var targetQuadXv = $gameMap.roundXWithDirectionQuad(this._x, vert, qDirXv);
		var normY = this.canPass(targetQuadXv, targetQuadY, vert, qDirXv, qDirY);
		
		if (normY) {
			this._diagDir = false;
			this.moveStraight(vert);
		} else if (normX) {
			this._diagDir = false;
			this.moveStraight(horz);
		}
    };
	
	this._diagStraigten = false;
    if (this._direction === this.reverseDir(horz)) this.setDirection(horz);
    if (this._direction === this.reverseDir(vert)) this.setDirection(vert);
	this._diagStraigten = true;
};

Game_Player.prototype.getOnVehicle = function() {
    var direction = this.direction();
    var x1 = Math.round(this.x);
    var y1 = Math.round(this.y);
    var x2 = $gameMap.roundXWithDirection(x1, direction);
    var y2 = $gameMap.roundYWithDirection(y1, direction);
    if ($gameMap.airship().pos(x1, y1)) {
        this._vehicleType = 'airship';
    } else if ($gameMap.ship().pos(x2, y2)) {
        this._vehicleType = 'ship';
    } else if ($gameMap.boat().pos(x2, y2)) {
        this._vehicleType = 'boat';
    }
    if (this.isInVehicle()) {
        this._vehicleGettingOn = true;
        if (!this.isInAirship()) {
            this.forceMoveForward();
        } else {
			Galv.PMOVE.center();
		}
		this._normMove = true;
        this.gatherFollowers();
    }
    return this._vehicleGettingOn;
};

Game_Player.prototype.getOffVehicle = function() {
    if (this.vehicle().isLandOk(this.x, this.y, 2)) {
        // if (this.isInAirship()) {
            this.setDirection(2);
        // }
        this._followers.synchronize(this.x, this.y, this.direction());
        this.vehicle().getOff();
        if (!this.isInAirship()) {
			this._normMove = false;
            this.forceMoveForward();
            this.setTransparent(false);
        }
        this._vehicleGettingOff = true;
        this.setMoveSpeed(4);
        this.setThrough(false);
        this.makeEncounterCount();
        this.gatherFollowers();
    }
    return this._vehicleGettingOff;
};

//Game_Vehicle
JR.VehicleFix.GameVehicle_getOn = Game_Vehicle.prototype.getOn;
Game_Vehicle.prototype.getOn = function() {
    JR.VehicleFix.GameVehicle_getOn.call(this)
	$gamePlayer.copyPosition(this);
};

JR.VehicleFix.GameVehicle_pos = Game_Vehicle.prototype.pos;
Game_Vehicle.prototype.pos = function(x, y) {
	if ($gamePlayer.isInVehicle()) return JR.VehicleFix.GameVehicle_pos.call(this, x, y);
    return this._x - 2 <= x && this._x + 2 >= x && this._y - 1 <= y && this._y >= y;
};

JR.VehicleFix.GameVehicle_update = Game_Vehicle.prototype.update;
Game_Vehicle.prototype.update = function() {
    JR.VehicleFix.GameVehicle_update.call(this);
};

Game_Vehicle.prototype.updatePattern = function() {
    if (!this.isMoving()) {
        this.resetPattern();
    } else {
        this._pattern = (this._pattern + 1) % this.maxPattern();
    };
};