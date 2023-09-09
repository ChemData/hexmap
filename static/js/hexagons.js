var HexDisplay;
(function (HexDisplay) {
    let HEX_HEIGHT = Math.pow(3, 0.5);
    let TERRAIN_COLORS = {
        "water": "#0076ec",
        "grass": "#55ff8a",
        "mountains": "#777777",
        "desert": "#ece95a",
        "empty": "#ffffff"
    };
    let CURRENT_CURSOR = null;
    let CURRENT_BRUSH = { 'property': null, 'value': false };
    function EmptyHex() {
        return { 'terrain': 'empty', 'player_visible': false, 'primary_creature': null, 'climate': null };
    }
    function RandomHex() {
        let new_hex = EmptyHex();
        new_hex.terrain = getRandomElement(Object.keys(TERRAIN_COLORS));
        return new_hex;
    }
    function RandomColor() {
        let r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        let g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        let b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    }
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    function DrawHex(x, y, hexagon, grid_view, coordinate_label, ctx) {
        if (grid_view.player_view && !hexagon.player_visible) {
            return;
        }
        let color = TERRAIN_COLORS['empty'];
        if (grid_view.show_terrain) {
            color = TERRAIN_COLORS[hexagon.terrain];
        }
        DrawHexagon(x, y, grid_view.scale, color, ctx);
        if (grid_view.show_coordinates) {
            ctx.font = `${Math.floor(0.3 * grid_view.scale)}px Arial`;
            ctx.fillStyle = 'black';
            ctx.fillText(coordinate_label, x - grid_view.scale * 0.4, y + grid_view.scale * 0.4 * HEX_HEIGHT);
        }
    }
    function DrawHexagon(x, y, s, color, ctx, border_color = 'black') {
        let half_height = Math.pow(3, 0.5) / 2;
        let vertexes = [
            [-0.5, -half_height], [0.5, -half_height], [1, 0], [0.5, half_height],
            [-0.5, half_height], [-1, 0]
        ];
        ctx.beginPath();
        ctx.moveTo(x + s * vertexes[0][0], y + s * vertexes[0][1]);
        for (let i = 1; i < vertexes.length; i++) {
            ctx.lineTo(x + s * vertexes[i][0], y + s * vertexes[i][1]);
        }
        ctx.closePath();
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fill();
    }
    function EmptyHexGrid(n_rows, n_cols) {
        let array = Array(0);
        for (let row = 0; row < n_rows; row++) {
            let new_row = Array(0);
            for (let col = 0; col < n_cols; col++) {
                new_row = new_row.concat([EmptyHex()]);
            }
            array = array.concat([new_row]);
        }
        return { 'array': array, 'offset': [0, 0], 'first_is_up': true };
    }
    function RandomHexGrid(n_rows, n_cols) {
        let array = Array(0);
        for (let row = 0; row < n_rows; row++) {
            let new_row = Array(0);
            for (let col = 0; col < n_cols; col++) {
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
            let new_rows = EmptyHexGrid(n_rows, array.array[0].length).array;
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
            for (let i = 0; i < array.array.length; i++) {
                if (left) {
                    array.array[i] = Array(n_cols).fill(EmptyHex()).concat(array.array[i]);
                }
                else {
                    array.array[i] = array.array[i].concat(Array(n_cols).fill(EmptyHex()));
                }
            }
        }
        else if (n_cols < 0) {
            for (let i = 0; i < array.array.length; i++) {
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
        clearHexCanvas();
        for (let row = 0; row < grid.array.length; row++) {
            for (let col = 0; col < grid.array[0].length; col++) {
                DisplayHex(grid, { 'col': col, 'row': row }, view, canvas);
            }
        }
    }
    function DisplayHex(grid, coordinates, view, canvas, clear_first = false) {
        let ctx = canvas.getContext('2d');
        let x_center = 3 / 2 * coordinates.col * view.scale + view.offset_x;
        let offset_down = (Boolean(coordinates.col % 2) == grid.first_is_up);
        let y_center = HEX_HEIGHT * view.scale * (coordinates.row + 0.5 * +offset_down) + view.offset_y;
        let coordinate_label = (coordinates.col + grid.offset[0]) + ', ' + (coordinates.row + grid.offset[1]);
        if (clear_first) {
            DrawHexagon(x_center, y_center, view.scale, '#ffffff', ctx, '#ffffff');
        }
        DrawHex(x_center, y_center, grid.array[coordinates.row][coordinates.col], view, coordinate_label, ctx);
    }
    function standard_position(pt, view) {
        return { 'x': (pt.x - view.offset_x) / view.scale, 'y': (pt.y - view.offset_y) / view.scale };
    }
    function normal_to_axial(coord, grid) {
        let q = coord.col;
        let r = coord.row - (coord.col + (coord.col & 1)) / 2;
        if (grid.first_is_up) {
            r = coord.row - (coord.col - (coord.col & 1)) / 2;
        }
        return { 'q': q, 'r': r };
    }
    function axial_to_normal(coord, grid) {
        let col = coord.q;
        let row = coord.r + (coord.q + (coord.q & 1)) / 2;
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
        let x = coord.q;
        let y = coord.r;
        let xgrid = Math.round(x);
        let ygrid = Math.round(y);
        x -= xgrid;
        y -= ygrid;
        let dx = Math.round(x + 0.5 * y) * +(x * x >= y * y);
        let dy = Math.round(y + 0.5 * x) * +(x * x < y * y);
        return { 'q': xgrid + dx, 'r': ygrid + dy };
    }
    function pixel_to_normal(pt) {
        pt = standard_position(pt, VIEW);
        let q = (2 / 3 * pt.x);
        let r = (-1 / 3 * pt.x + HEX_HEIGHT / 3 * pt.y);
        return axial_to_normal(cubic_to_axial(cubic_round(axial_to_cubic({ 'q': q, 'r': r }))), HEX_GRID);
    }
    function cubic_round(coord) {
        let q = Math.round(coord.q);
        let r = Math.round(coord.r);
        let s = Math.round(coord.s);
        let q_diff = Math.abs(q - coord.q);
        let r_diff = Math.abs(r - coord.r);
        let s_diff = Math.abs(s - coord.s);
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
        let bounds = CANVAS.getBoundingClientRect();
        let pt = { 'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top };
        console.log(pixel_to_normal(pt));
    }
    function ClickCoordinates(event) {
        let bounds = CANVAS.getBoundingClientRect();
        let pt = { 'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top };
        let coordinates = pixel_to_normal(pt);
        return coordinates;
    }
    function shape(array) {
        return [array[0].length, array.length];
    }
    function DefaultView(side_length) {
        return { 'offset_x': side_length, 'offset_y': HEX_HEIGHT / 2 * side_length, 'scale': side_length,
            'show_terrain': true, 'show_coordinates': false, 'player_view': false };
    }
    function zoomIn(redraw = true, fixed_point = null) {
        let old_scale = VIEW.scale;
        VIEW.scale = Math.min(300, VIEW.scale * 1.2);
        let scaling_factor = VIEW.scale / old_scale;
        if (fixed_point != null) {
            VIEW.offset_x -= fixed_point.x * (scaling_factor - 1);
            VIEW.offset_y -= fixed_point.y * (scaling_factor - 1);
        }
        else {
            VIEW.offset_x *= VIEW.scale / old_scale;
            VIEW.offset_y *= VIEW.scale / old_scale;
        }
        if (redraw) {
            clearHexCanvas();
            DisplayGrid(HEX_GRID, VIEW, CANVAS);
        }
    }
    function zoomOut(redraw = true, fixed_point = null) {
        let old_scale = VIEW.scale;
        VIEW.scale = Math.max(10, VIEW.scale * 0.8);
        let scaling_factor = VIEW.scale / old_scale;
        if (fixed_point != null) {
            VIEW.offset_x -= fixed_point.x * (scaling_factor - 1);
            VIEW.offset_y -= fixed_point.y * (scaling_factor - 1);
        }
        else {
            VIEW.offset_x *= VIEW.scale / old_scale;
            VIEW.offset_y *= VIEW.scale / old_scale;
        }
        if (redraw) {
            clearHexCanvas();
            DisplayGrid(HEX_GRID, VIEW, CANVAS);
        }
    }
    function centerOnPoint(point, redraw = true) {
        VIEW.offset_x = CANVAS.width / 2 - point.x;
        VIEW.offset_y = CANVAS.height / 2 - point.y;
        if (redraw) {
            clearHexCanvas();
            DisplayGrid(HEX_GRID, VIEW, CANVAS);
        }
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
        let context = CANVAS.getContext('2d');
        context.clearRect(0, 0, CANVAS.width, CANVAS.height);
    }
    function loadSavedMap(map_name) {
        $.post('load', { 'save_name': map_name }, function (data, status) {
            data = JSON.parse(data);
            if (data == false) {
                alert('There is no saved map with that name.');
            }
            else {
                HEX_GRID = data;
                DisplayGrid(HEX_GRID, VIEW, CANVAS);
            }
        });
    }
    function addTerrainButtons() {
        let draw_button_div = document.getElementById("draw_buttons");
        for (let i = 0; i < Object.keys(TERRAIN_COLORS).length; i++) {
            let terrain_type = Object.keys(TERRAIN_COLORS)[i];
            let button_name = `${terrain_type}_button`;
            let button = document.createElement("BUTTON");
            let text = document.createTextNode(terrain_type);
            button.id = button_name;
            button.appendChild(text);
            draw_button_div.appendChild(button);
            button.addEventListener('click', function () {
                CURRENT_BRUSH.property = 'terrain';
                CURRENT_BRUSH.value = terrain_type;
                CURRENT_CURSOR = 'brush';
            });
        }
    }
    function populateSaveList() {
        $.get('saved_map_names', {}, function (data, status) {
            let saved_names = data;
            let dropdown = $("#saved_maps_dropdown");
            dropdown.empty();
            for (let i = 0; i < saved_names.length; i++) {
                dropdown.append(`<option value="${saved_names[i]}">${saved_names[i]}</option>`);
            }
        });
    }
    function populateMobSetNames() {
        $.get('mob_set_names', {}, function (data, status) {
            let mob_set_names = data;
            let dropdown = $("#mob_set_dropdown");
            dropdown.empty();
            dropdown.append(`<option value="">None</option>`);
            for (let i = 0; i < mob_set_names.length; i++) {
                dropdown.append(`<option value="${mob_set_names[i]['value']}">${mob_set_names[i]['name']}</option>`);
            }
        });
    }
    function populateEnvironmentList() {
        $.get('environment_set_names', {}, function (data, status) {
            let environment_set_names = data;
            let dropdown = $("#environment_dropdown");
            dropdown.empty();
            dropdown.append(`<option value="">None</option>`);
            for (let i = 0; i < environment_set_names.length; i++) {
                dropdown.append(`<option value="${environment_set_names[i]['value']}">${environment_set_names[i]['name']}</option>`);
            }
        });
    }
    let HEX_GRID = EmptyHexGrid(20, 30);
    populateSaveList();
    let CANVAS = document.getElementById("hexcanvas");
    let VIEW = DefaultView(30);
    DisplayGrid(HEX_GRID, VIEW, CANVAS);
    addTerrainButtons();
    populateMobSetNames();
    populateEnvironmentList();
    // Event Listeners
    document.getElementById('hexcanvas').addEventListener('wheel', function (event) {
        event.preventDefault();
        let bounds = CANVAS.getBoundingClientRect();
        let pt = { 'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top };
        pt.x -= VIEW.offset_x;
        pt.y -= VIEW.offset_y;
        if (event.deltaY > 0) {
            zoomIn(true, pt);
        }
        else {
            zoomOut(true, pt);
        }
    });
    document.getElementById('add_left').addEventListener('click', function () {
        AddColumns(HEX_GRID, 1, true);
    });
    document.getElementById('add_right').addEventListener('click', function () {
        AddColumns(HEX_GRID, 1, false);
    });
    document.getElementById('add_top').addEventListener('click', function () {
        AddRows(HEX_GRID, 1, true);
    });
    document.getElementById('add_bottom').addEventListener('click', function () {
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
    CANVAS.addEventListener('mouseup', function (event) {
        if (CURRENT_CURSOR == 'encounter') {
            let coordinates = ClickCoordinates(event);
            let hex = HEX_GRID.array[coordinates.row][coordinates.col];
            $.post('encounter', {
                'primary_creature': hex.primary_creature,
                'terrain': hex.terrain
            }, function (data, status) {
                alert(data);
            });
        }
    });
    CANVAS.addEventListener('mousemove', function (event) {
        if (event.buttons == 1) {
            // Nothing is selected with the cursor, so you shouldn't make changes
            if (CURRENT_CURSOR == null) {
                return;
            }
            else if (CURRENT_CURSOR == 'brush') {
                let coordinates = ClickCoordinates(event);
                HEX_GRID.array[coordinates.row][coordinates.col][CURRENT_BRUSH.property] = CURRENT_BRUSH.value;
                DisplayGrid(HEX_GRID, VIEW, CANVAS);
            }
        }
    });
    let coordinates_checkbox = document.getElementById('coordinates_checkbox');
    coordinates_checkbox.addEventListener('change', function (event) {
        if (this.checked) {
            VIEW.show_coordinates = true;
        }
        else {
            VIEW.show_coordinates = false;
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });
    let terrain_checkbox = document.getElementById('terrain_checkbox');
    terrain_checkbox.addEventListener('change', function (event) {
        if (this.checked) {
            VIEW.show_terrain = true;
        }
        else {
            VIEW.show_terrain = false;
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });
    let player_view_checkbox = document.getElementById("player_view_checkbox");
    player_view_checkbox.addEventListener('change', function (event) {
        if (this.checked) {
            VIEW.player_view = true;
        }
        else {
            VIEW.player_view = false;
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });
    document.getElementById('player_visibility').addEventListener('click', function () {
        CURRENT_BRUSH.property = 'player_visible';
        CURRENT_BRUSH.value = true;
        CURRENT_CURSOR = 'brush';
    });
    document.getElementById('dm_visibility').addEventListener('click', function () {
        CURRENT_BRUSH.property = 'player_visible';
        CURRENT_BRUSH.value = false;
        CURRENT_CURSOR = 'brush';
    });
    document.getElementById('encounter_gen').addEventListener('click', function () {
        let party_size = $("#party_size").val();
        let party_level = $("#party_level").val();
        let difficulty = $("#difficulty_dropdown").find(":selected").val();
        let primary_enemy = $("#mob_set_dropdown").find(":selected").val();
        let environment_type = $("#environment_dropdown").find(":selected").val();
        $.get('encounter', {
            'environment_type': environment_type,
            'party_size': party_size,
            'party_level': party_level,
            'difficulty': difficulty,
            'primary_enemy': primary_enemy
        }, function (data, status) {
            console.log(data);
            let div = document.getElementById("encounter_display");
            div.replaceChildren();
            div.innerHTML += data;
        });
    });
    document.getElementById('save').addEventListener('click', function () {
        let save_name = prompt('Save name: ');
        if ((save_name != '') && (save_name != null)) {
            $.post('save', { 'hex_map': JSON.stringify(HEX_GRID),
                'save_name': save_name });
            populateSaveList();
        }
        else {
            alert('Invalid name - The map was not saved.');
        }
        populateSaveList();
    });
    document.getElementById('load').addEventListener('click', function () {
        let load_name = $("#saved_maps_dropdown").find(":selected").text();
        loadSavedMap(load_name);
    });
    document.getElementById('delete').addEventListener('click', function () {
        $.post('delete_save', { 'to_delete': $("#saved_maps_dropdown").find(":selected").text() }, function (data, alert) {
        });
        populateSaveList();
    });
})(HexDisplay || (HexDisplay = {}));
