var HexDisplay;
(function (HexDisplay) {
    var HEX_HEIGHT = Math.pow(3, 0.5);
    var TERRAIN_COLORS = {
        "water": "#0076ec",
        "grass": "#55ff8a",
        "mountains": "#777777",
        "desert": "#ece95a",
        "empty": "#ffffff"
    };
    var CURRENT_DRAW = { 'property': null, 'value': false };
    function EmptyHex() {
        return { 'terrain': 'empty', 'player_visible': false };
    }
    function RandomHex() {
        var new_hex = EmptyHex();
        new_hex.terrain = getRandomElement(Object.keys(TERRAIN_COLORS));
        return new_hex;
    }
    function RandomColor() {
        var r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        var g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        var b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    }
    var getRandomElement = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };
    function DrawHex(x, y, hexagon, grid_view, coordinate_label, ctx) {
        if (grid_view.player_view && !hexagon.player_visible) {
            return;
        }
        var color = TERRAIN_COLORS['empty'];
        if (grid_view.show_terrain) {
            color = TERRAIN_COLORS[hexagon.terrain];
        }
        DrawHexagon(x, y, grid_view.scale, color, ctx);
        if (grid_view.show_coordinates) {
            ctx.font = "".concat(Math.floor(0.3 * grid_view.scale), "px Arial");
            ctx.fillStyle = 'black';
            ctx.fillText(coordinate_label, x - grid_view.scale * 0.4, y + grid_view.scale * 0.4 * HEX_HEIGHT);
        }
    }
    function DrawHexagon(x, y, s, color, ctx, border_color) {
        if (border_color === void 0) { border_color = 'black'; }
        var half_height = Math.pow(3, 0.5) / 2;
        var vertexes = [
            [-0.5, -half_height], [0.5, -half_height], [1, 0], [0.5, half_height],
            [-0.5, half_height], [-1, 0]
        ];
        ctx.beginPath();
        ctx.moveTo(x + s * vertexes[0][0], y + s * vertexes[0][1]);
        for (var i = 1; i < vertexes.length; i++) {
            ctx.lineTo(x + s * vertexes[i][0], y + s * vertexes[i][1]);
        }
        ctx.closePath();
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fill();
    }
    function EmptyHexGrid(n_rows, n_cols) {
        var array = Array(0);
        for (var row = 0; row < n_rows; row++) {
            var new_row = Array(0);
            for (var col = 0; col < n_cols; col++) {
                new_row = new_row.concat([EmptyHex()]);
            }
            array = array.concat([new_row]);
        }
        return { 'array': array, 'offset': [0, 0], 'first_is_up': true };
    }
    function RandomHexGrid(n_rows, n_cols) {
        var array = Array(0);
        for (var row = 0; row < n_rows; row++) {
            var new_row = Array(0);
            for (var col = 0; col < n_cols; col++) {
                new_row = new_row.concat([RandomHex()]);
            }
            array = array.concat([new_row]);
        }
        return { 'array': array, 'offset': [0, 0], 'first_is_up': true };
    }
    function AddRows(array, n_rows, top) {
        if (top) {
            array.offset[1] -= n_rows;
        }
        if (n_rows > 0) {
            var new_rows = EmptyHexGrid(n_rows, array.array[0].length).array;
            if (top) {
                array.array = new_rows.concat(array.array);
            }
            else {
                array.array = array.array.concat(new_rows);
            }
        }
        else if (n_rows < 0) {
            if (top) {
                array.array = array.array.slice(-n_rows, array.array.length);
            }
            else {
                array.array = array.array.slice(0, array.array.length + n_rows);
            }
        }
    }
    function AddColumns(array, n_cols, left) {
        if (left) {
            array.offset[0] -= n_cols;
        }
        if (n_cols > 0) {
            for (var i = 0; i < array.array.length; i++) {
                if (left) {
                    array.array[i] = Array(n_cols).fill(EmptyHex()).concat(array.array[i]);
                }
                else {
                    array.array[i] = array.array[i].concat(Array(n_cols).fill(EmptyHex()));
                }
            }
        }
        else if (n_cols < 0) {
            for (var i = 0; i < array.array.length; i++) {
                if (left) {
                    array.array[i] = array.array[i].slice(-n_cols, array.array[i].length);
                }
                else {
                    array.array[i] = array.array[i].slice(0, array.array[i].length + n_cols);
                }
            }
        }
    }
    function DisplayGrid(grid, view, canvas) {
        var ctx = canvas.getContext('2d');
        clearHexCanvas();
        for (var row = 0; row < grid.array.length; row++) {
            for (var col = 0; col < grid.array[0].length; col++) {
                DisplayHex(grid, { 'col': col, 'row': row }, view, canvas);
            }
        }
    }
    function DisplayHex(grid, coordinates, view, canvas, clear_first) {
        if (clear_first === void 0) { clear_first = false; }
        var ctx = canvas.getContext('2d');
        var x_center = 3 / 2 * coordinates.col * view.scale + view.offset_x;
        var offset_down = (Boolean(coordinates.col % 2) == grid.first_is_up);
        var y_center = HEX_HEIGHT * view.scale * (coordinates.row + 0.5 * +offset_down) + view.offset_y;
        var coordinate_label = (coordinates.col + grid.offset[0]) + ', ' + (coordinates.row + grid.offset[1]);
        if (clear_first) {
            DrawHexagon(x_center, y_center, view.scale, '#ffffff', ctx, '#ffffff');
        }
        DrawHex(x_center, y_center, grid.array[coordinates.row][coordinates.col], view, coordinate_label, ctx);
    }
    function standard_position(pt, view) {
        return { 'x': (pt.x - view.offset_x) / view.scale, 'y': (pt.y - view.offset_y) / view.scale };
    }
    function normal_to_axial(coord, grid) {
        var q = coord.col;
        var r = coord.row - (coord.col + (coord.col & 1)) / 2;
        if (grid.first_is_up) {
            r = coord.row - (coord.col - (coord.col & 1)) / 2;
        }
        return { 'q': q, 'r': r };
    }
    function axial_to_normal(coord, grid) {
        var col = coord.q;
        var row = coord.r + (coord.q + (coord.q & 1)) / 2;
        if (grid.first_is_up) {
            row = coord.r + (coord.q - (coord.q & 1)) / 2;
        }
        return { 'col': col, 'row': row };
    }
    function cubic_to_axial(coord) {
        return { 'q': coord.q, 'r': coord.r };
    }
    function axial_to_cubic(coord) {
        return { 'q': coord.q, 'r': coord.r, 's': -coord.q - coord.r };
    }
    function axial_round(coord) {
        var x = coord.q;
        var y = coord.r;
        var xgrid = Math.round(x);
        var ygrid = Math.round(y);
        x -= xgrid;
        y -= ygrid;
        var dx = Math.round(x + 0.5 * y) * +(x * x >= y * y);
        var dy = Math.round(y + 0.5 * x) * +(x * x < y * y);
        return { 'q': xgrid + dx, 'r': ygrid + dy };
    }
    function pixel_to_normal(pt) {
        pt = standard_position(pt, VIEW);
        var q = (2 / 3 * pt.x);
        var r = (-1 / 3 * pt.x + HEX_HEIGHT / 3 * pt.y);
        return axial_to_normal(cubic_to_axial(cubic_round(axial_to_cubic({ 'q': q, 'r': r }))), HEX_GRID);
    }
    function cubic_round(coord) {
        var q = Math.round(coord.q);
        var r = Math.round(coord.r);
        var s = Math.round(coord.s);
        var q_diff = Math.abs(q - coord.q);
        var r_diff = Math.abs(r - coord.r);
        var s_diff = Math.abs(s - coord.s);
        if ((q_diff > r_diff) && (q_diff > s_diff)) {
            q = -r - s;
        }
        else if (r_diff > s_diff) {
            r = -q - s;
        }
        else {
            s = -q - r;
        }
        return { 'q': q, 'r': r, 's': s };
    }
    function printPos(event) {
        var bounds = CANVAS.getBoundingClientRect();
        var pt = { 'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top };
        console.log(pixel_to_normal(pt));
    }
    function shape(array) {
        return [array[0].length, array.length];
    }
    function DefaultView(side_length) {
        return { 'offset_x': side_length, 'offset_y': HEX_HEIGHT / 2 * side_length, 'scale': side_length,
            'show_terrain': true, 'show_coordinates': false, 'player_view': false };
    }
    function zoomIn() {
        clearHexCanvas();
        VIEW.scale = Math.min(300, VIEW.scale * 1.2);
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    }
    function zoomOut() {
        clearHexCanvas();
        VIEW.scale = Math.max(20, VIEW.scale * 0.8);
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    }
    function shift_hexgrid(direction) {
        clearHexCanvas();
        if (direction == 'left') {
            VIEW.offset_x += VIEW.scale;
            VIEW.offset_x = Math.min(VIEW.scale, VIEW.offset_x);
        }
        else if (direction == 'right') {
            VIEW.offset_x -= VIEW.scale;
            VIEW.offset_x = Math.max(-(VIEW.scale * (1.5 * (HEX_GRID.array[0].length - 1) + 2) - CANVAS.width), VIEW.offset_x);
        }
        else if (direction == 'up') {
            VIEW.offset_y += VIEW.scale;
            VIEW.offset_y = Math.min(HEX_HEIGHT / 2 * VIEW.scale, VIEW.offset_y);
        }
        else if (direction == 'down') {
            VIEW.offset_y -= VIEW.scale;
            VIEW.offset_y = Math.max(-(VIEW.scale * HEX_HEIGHT * (HEX_GRID.array.length + 0.5) - CANVAS.height), VIEW.offset_y);
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    }
    function clearHexCanvas() {
        var context = CANVAS.getContext('2d');
        context.clearRect(0, 0, CANVAS.width, CANVAS.height);
    }
    function addTerrainButtons() {
        var draw_button_div = document.getElementById("draw_buttons");
        var _loop_1 = function (i) {
            var terrain_type = Object.keys(TERRAIN_COLORS)[i];
            var button_name = "".concat(terrain_type, "_button");
            var button = document.createElement("BUTTON");
            var text = document.createTextNode(terrain_type);
            button.id = button_name;
            button.appendChild(text);
            draw_button_div.appendChild(button);
            button.addEventListener('click', function () {
                CURRENT_DRAW.property = 'terrain';
                CURRENT_DRAW.value = terrain_type;
            });
        };
        for (var i = 0; i < Object.keys(TERRAIN_COLORS).length; i++) {
            _loop_1(i);
        }
    }
    var HEX_GRID = RandomHexGrid(20, 30);
    var CANVAS = document.getElementById("hexcanvas");
    var VIEW = DefaultView(30);
    DisplayGrid(HEX_GRID, VIEW, CANVAS);
    addTerrainButtons();
    // Event Listeners
    var zoom_in_button = document.getElementById('zoom_in');
    zoom_in_button.addEventListener('click', zoomIn);
    var zoom_out_button = document.getElementById('zoom_out');
    zoom_out_button.addEventListener('click', zoomOut);
    var add_left_button = document.getElementById('add_left');
    add_left_button.addEventListener('click', function () {
        AddColumns(HEX_GRID, 1, true);
    });
    var add_right_button = document.getElementById('add_right');
    add_right_button.addEventListener('click', function () {
        AddColumns(HEX_GRID, 1, false);
    });
    var add_top_button = document.getElementById('add_top');
    add_top_button.addEventListener('click', function () {
        AddRows(HEX_GRID, 1, true);
    });
    var add_bottom_button = document.getElementById('add_bottom');
    add_bottom_button.addEventListener('click', function () {
        AddRows(HEX_GRID, 1, false);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key == 'a') {
            shift_hexgrid('left');
        }
        else if (event.key == 'd') {
            shift_hexgrid('right');
        }
        else if (event.key == 'w') {
            shift_hexgrid('up');
        }
        else if (event.key == 's') {
            shift_hexgrid('down');
        }
    });
    CANVAS.addEventListener('mousemove', function (event) {
        if (event.buttons == 1) {
            // Nothing is selected to draw with, so you shouldn't make changes
            if (CURRENT_DRAW == null) {
                return;
            }
            var bounds = CANVAS.getBoundingClientRect();
            var pt = { 'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top };
            var coordinates = pixel_to_normal(pt);
            HEX_GRID.array[coordinates.row][coordinates.col][CURRENT_DRAW.property] = CURRENT_DRAW.value;
            DisplayGrid(HEX_GRID, VIEW, CANVAS);
            //DisplayHex(HEX_GRID, coordinates, VIEW, CANVAS, true)
        }
    });
    var coordinates_checkbox = document.getElementById('coordinates_checkbox');
    coordinates_checkbox.addEventListener('change', function (event) {
        if (this.checked) {
            VIEW.show_coordinates = true;
        }
        else {
            VIEW.show_coordinates = false;
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });
    var terrain_checkbox = document.getElementById('terrain_checkbox');
    terrain_checkbox.addEventListener('change', function (event) {
        if (this.checked) {
            VIEW.show_terrain = true;
        }
        else {
            VIEW.show_terrain = false;
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });
    var player_view_checkbox = document.getElementById("player_view_checkbox");
    player_view_checkbox.addEventListener('change', function (event) {
        if (this.checked) {
            VIEW.player_view = true;
        }
        else {
            VIEW.player_view = false;
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });
    var player_visibility = document.getElementById('player_visibility');
    player_visibility.addEventListener('click', function () {
        CURRENT_DRAW.property = 'player_visible';
        CURRENT_DRAW.value = true;
    });
    var dm_visibility = document.getElementById('dm_visibility');
    dm_visibility.addEventListener('click', function () {
        CURRENT_DRAW.property = 'player_visible';
        CURRENT_DRAW.value = false;
    });
})(HexDisplay || (HexDisplay = {}));
