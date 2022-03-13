var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var e_1, _a;
var CubicHex = /** @class */ (function () {
    function CubicHex(q, r, s) {
        if (q + r + s != 0) {
            throw ("A hex's cubic coordinates must sum to 0 but ".concat(q, " + ").concat(r, " + ").concat(s, " = ").concat(q + r + s, "."));
        }
        this.q = q;
        this.r = r;
        this.s = s;
    }
    CubicHex.prototype.minus = function (other_hex) {
        return new CubicHex(this.q - other_hex.q, this.r - other_hex.r, this.s - other_hex.s);
    };
    CubicHex.prototype.plus = function (other_hex) {
        return new CubicHex(this.q + other_hex.q, this.r + other_hex.r, this.s + other_hex.s);
    };
    CubicHex.prototype.equals = function (other_hex) {
        if (this.q == other_hex.q && this.r == other_hex.r && this.s == other_hex.s) {
            return true;
        }
        else {
            return false;
        }
    };
    CubicHex.prototype.dist = function (other_hex) {
        var dist = this.minus(other_hex);
        return (Math.abs(dist.q) + Math.abs(dist.r) + Math.abs(dist.s)) / 2;
    };
    CubicHex.prototype.to_axial = function () {
        return new AxialHex(this.q, this.r);
    };
    return CubicHex;
}());
var AxialHex = /** @class */ (function () {
    function AxialHex(q, r) {
        this.q = q;
        this.r = r;
    }
    AxialHex.prototype.minus = function (other_hex) {
        return new AxialHex(this.q - other_hex.q, this.r - other_hex.r);
    };
    AxialHex.prototype.plus = function (other_hex) {
        return new AxialHex(this.q + other_hex.q, this.r + other_hex.r);
    };
    AxialHex.prototype.equals = function (other_hex) {
        if (this.q == other_hex.q && this.r == other_hex.r) {
            return true;
        }
        else {
            return false;
        }
    };
    AxialHex.prototype.dist = function (other_hex) {
        var dist = this.minus(other_hex);
        return (Math.abs(dist.q) + Math.abs(dist.r) + Math.abs(dist.q + dist.r)) / 2;
    };
    AxialHex.prototype.to_cubic = function () {
        return new CubicHex(this.q, this.r, -(this.q + this.r));
    };
    AxialHex.prototype.to_offset = function () {
        var x = this.q;
        var y = this.r + (this.q - (this.q & 1)) / 2;
        return new OffsetHex(x, y);
    };
    AxialHex.prototype.to_double_height = function () {
        return new DoubleHeightHex(this.q, 2 * this.r + this.q);
    };
    AxialHex.prototype.euclidean = function (other_hex) {
        return this.to_double_height().euclidian(other_hex.to_double_height());
    };
    AxialHex.prototype.angle = function (other_hex, as_rad) {
        if (as_rad === void 0) { as_rad = true; }
        return this.to_double_height().angle(other_hex.to_double_height(), as_rad);
    };
    AxialHex.prototype.pixel_position = function (size) {
        if (size === void 0) { size = 1; }
        var x = size * 3 / 2 * this.q;
        var y = size * Math.pow(3, 0.5) * (0.5 * this.q + this.r);
        return [x, y];
    };
    return AxialHex;
}());
var OffsetHex = /** @class */ (function () {
    function OffsetHex(x, y) {
        this.x = x;
        this.y = y;
    }
    OffsetHex.prototype.equals = function (other_hex) {
        if (this.x == other_hex.x && this.y == other_hex.y) {
            return true;
        }
        else {
            return false;
        }
    };
    OffsetHex.prototype.to_axial = function () {
        return new AxialHex(this.x, this.y - (this.x - (this.x & 1)) / 2);
    };
    return OffsetHex;
}());
var DoubleHeightHex = /** @class */ (function () {
    function DoubleHeightHex(x, y) {
        if (((x + y) & 1) == 1) {
            throw ("The coordinates of a DoubleHeightHex must sum to an even number: ".concat(x, " and ").concat(y, " do not."));
        }
        this.x = x;
        this.y = y;
    }
    DoubleHeightHex.prototype.equals = function (other_hex) {
        if (this.x == other_hex.x && this.y == other_hex.y) {
            return true;
        }
        else {
            return false;
        }
    };
    DoubleHeightHex.prototype.minus = function (other_hex) {
        return new DoubleHeightHex(this.x - other_hex.x, this.y - other_hex.y);
    };
    DoubleHeightHex.prototype.plus = function (other_hex) {
        return new DoubleHeightHex(this.x + other_hex.x, this.y + other_hex.y);
    };
    DoubleHeightHex.prototype.to_axial = function () {
        return new AxialHex(this.x, (this.y - this.x) / 2);
    };
    DoubleHeightHex.prototype.euclidian = function (other_hex) {
        return Math.pow((9 / 4 * Math.pow((this.x - other_hex.x), 2) + 3 / 4 * Math.pow((this.y - other_hex.y), 2)), 0.5);
    };
    DoubleHeightHex.prototype.angle = function (other_hex, as_rad) {
        if (as_rad === void 0) { as_rad = true; }
        var angle = Math.atan(1 / Math.pow(3, 0.5) * (other_hex.y - this.y) / (other_hex.x - this.x));
        if (this.x > other_hex.x) {
            angle += Math.PI;
        }
        else if (this.y > other_hex.y) {
            angle += 2 * Math.PI;
        }
        if (!as_rad) {
            return angle * 180 / Math.PI;
        }
        return angle;
    };
    return DoubleHeightHex;
}());
var HexMap = /** @class */ (function () {
    function HexMap(x_dim, y_dim) {
        var e_2, _a;
        this.x_min = 0;
        this.y_min = 0;
        this.x_max = x_dim - 1;
        this.y_max = y_dim - 1;
        this.hex_table = new Map();
        try {
            for (var _b = __values(this.coords()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var coord = _c.value;
                this.set(coord, undefined);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    HexMap.prototype.coords = function () {
        var x, y, q, r, out;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    x = this.x_min;
                    _a.label = 1;
                case 1:
                    if (!(x <= this.x_max)) return [3 /*break*/, 6];
                    y = this.y_min + ((this.y_min & 1) ^ (x & 1));
                    _a.label = 2;
                case 2:
                    if (!(y <= this.y_max)) return [3 /*break*/, 5];
                    q = x;
                    r = (y - x) / 2;
                    out = [q, r];
                    return [4 /*yield*/, out];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    y += 2;
                    return [3 /*break*/, 2];
                case 5:
                    x++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    };
    HexMap.prototype.hexes = function () {
        var _a, _b, coord, e_3_1;
        var e_3, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _a = __values(this.coords()), _b = _a.next();
                    _d.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 4];
                    coord = _b.value;
                    return [4 /*yield*/, new AxialHex(coord[0], coord[1])];
                case 2:
                    _d.sent(), this.get(coord);
                    _d.label = 3;
                case 3:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_3_1 = _d.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    };
    HexMap.prototype.set = function (coord, value) {
        this.validate_coordinate(coord);
        if (!this.hex_table.has(coord[0])) {
            this.hex_table.set(coord[0], new Map());
        }
        this.hex_table.get(coord[0]).set(coord[1], value);
    };
    HexMap.prototype.get = function (coord) {
        this.validate_coordinate(coord);
        return this.hex_table.get(coord[0]).get(coord[1]);
    };
    HexMap.prototype.validate_coordinate = function (coord) {
        if (coord[0] < this.x_min) {
            throw ("X-coordinate ".concat(coord[0], " is less than ").concat(this.x_min, "."));
        }
        if (coord[0] > this.x_max) {
            throw ("X-coordinate ".concat(coord[0], " is out of range for a grid with x-dimension, ").concat(this.x_max - this.x_min + 1));
        }
        if (coord[1] < -Math.floor(coord[0] / 2)) {
            throw ("Y-coordinate ".concat(coord[1], " is too small for the ").concat(coord[0], "th column."));
        }
        if (coord[1] > Math.floor((this.x_max - this.x_min) / 2) - Math.floor(coord[0] / 2)) {
            throw ("Y-coordinate ".concat(coord[1], " is too large for a grid with y-dimension, ").concat(this.y_max - this.y_min + 1, ", in the ").concat(coord[0], "th column."));
        }
    };
    return HexMap;
}());
function draw_hex(hex_coord, color, side_length, context, offset) {
    if (offset === void 0) { offset = [0, 0]; }
    var _a = __read(hex_coord.pixel_position(side_length), 2), x = _a[0], y = _a[1];
    x += offset[0];
    y += offset[1];
    context.fillStyle = color;
    context.beginPath();
    var vert = Math.pow(3, 0.5) / 2;
    context.moveTo(x + 0.5 * side_length, y - vert * side_length);
    context.lineTo(x + side_length, y);
    context.lineTo(x + 0.5 * side_length, y + vert * side_length);
    context.lineTo(x - 0.5 * side_length, y + vert * side_length);
    context.lineTo(x - side_length, y);
    context.lineTo(x - 0.5 * side_length, y - vert * side_length);
    context.lineTo(x + 0.5 * side_length, y - vert * side_length);
    context.fill();
}
function draw_random_hexes(context, size, x_size, y_size) {
    var e_4, _a;
    var grid = new HexMap(x_size, y_size);
    try {
        for (var _b = __values(grid.coords()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var coord = _c.value;
            var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            var hex = new AxialHex(coord[0], coord[1]);
            draw_hex(hex, color, size, context);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
}
var j = new HexMap(6, 4);
try {
    for (var _b = __values(j.hexes()), _c = _b.next(); !_c.done; _c = _b.next()) {
        var x = _c.value;
        console.log(x[0]);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
    }
    finally { if (e_1) throw e_1.error; }
}
