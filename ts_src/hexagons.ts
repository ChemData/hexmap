namespace HexDisplay {
    let HEX_HEIGHT = 3 ** 0.5

    let SETTLEMENTS = {
        'city': {
            'name': 'City',
            'icon_path': 'city.svg'
        },
        'village': {
            'name': 'Village',
            'icon_path': 'village.svg'
        },
        'monster': {
            'name': 'Singular Monster',
            'icon_path': 'monster.svg'
        },
        'monster_den': {
            'name': 'Monster Den',
            'icon_path': 'monster_den.svg'
        },
        'obelisk': {
            'name': 'Obelisk',
            'icon_path': 'obelisk.svg'
        },
        'wildfolk_camp': {
            'name': 'Wildfolk Camp',
            'icon_path': 'wildfolk_camp.svg'
        },
        'bandit_camp': {
            'name': 'Bandit Camp',
            'icon_path': 'bandit_camp.svg'
        },
        'friendly_beast': {
            'name': 'Friendly Beast',
            'icon_path': 'friendly_beast.svg'
        },
        'anomaly': {
            'name': 'Anomaly',
            'icon_path': 'anomaly.svg'
        },
        'retreat': {
            'name': 'Retreat',
            'icon_path': 'retreat.svg'
        },
    }

    for (let k in SETTLEMENTS) {
        let new_image = new Image()
        new_image.src = 'static/images/' + SETTLEMENTS[k]['icon_path']
        SETTLEMENTS[k]['icon'] = new_image
    }

    type Cursor = {
        function: (Function | null)
        trigger_on_move: boolean
        edits: boolean
    }

    type Brush = {
        property: (string | null)
        value: (string | boolean)

    }

    type Hex = {
        terrain: string,
        player_visible: boolean,
        primary_creature: (string | null),
        climate: (string | null),
        settlement: (Settlement | null),
        rivers: [string, string, string, string, string, string],
        roads: [string, string, string, string, string, string],
        position: NormalCoord
    }

    type Settlement = {
        name: string,
        type: string
    }

    function EmptyHex(position: [number, number] = [0, 0]): Hex {
        return {
            'terrain': 'empty',
            'player_visible': false,
            'primary_creature': null,
            'climate': null,
            'settlement': null,
            'rivers': ['none', 'none', 'none', 'none', 'none', 'none'],
            'roads': ['none', 'none', 'none', 'none', 'none', 'none'],
            'position': {'col': position[0], 'row': position[1]}}
    }

    function RandomHex(position: [number, number] = [0, 0]): Hex {
        let new_hex = EmptyHex(position);
        new_hex.terrain = getRandomElement(Object.keys(TERRAIN_INFO));
        return new_hex
    }

    function RandomColor(): string {
        let r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        let g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        let b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        return '#' + r + g + b
    }

    const getRandomElement = (arr: any[]) =>
        arr[Math.floor(Math.random() * arr.length)]

    function DrawHex(x: number, y: number, hex: Hex, grid_view: HexGridView, coordinate_label: string, ctx: CanvasRenderingContext2D) {
        //x and y are the center pixel positions of the hexagon
        if (grid_view.player_view && !hex.player_visible) {
            return
        }
        let color = TERRAIN_INFO['empty']['color']
        if (grid_view.show_terrain) {
            color = TERRAIN_INFO[hex.terrain]['color']
        }
        DrawHexagon(x, y, grid_view.scale, color, ctx)
        if (grid_view.show_terrain) {
            if ('texture' in TERRAIN_INFO[hex.terrain]){
                ctx.drawImage(TERRAIN_INFO[hex.terrain]['texture'], x - grid_view.scale * 0.5, y - grid_view.scale * 0.5, grid_view.scale, grid_view.scale)
            }
        }
        if (grid_view.show_coordinates) {
            ctx.font = `${Math.floor(0.3*grid_view.scale)}px Arial`;
            ctx.fillStyle = 'black'
            ctx.fillText(coordinate_label, x-grid_view.scale*0.4, y+grid_view.scale*0.4*HEX_HEIGHT)
        }
        for (let direction = 0; direction < hex.rivers.length; direction ++) {
            if (TERRAIN_INFO[hex.terrain]['ocean']){
                break
            }
            if (hex.rivers[direction] != 'none' && VIEW.show_rivers){
                console.log(RIVERS)
                console.log(ROADS)
                let river_info = RIVERS[hex.rivers[direction]]
                drawLine(x, y, direction, river_info['color'], river_info['width']*VIEW.scale, ctx)
            }
            if (hex.roads[direction] != 'none' && VIEW.show_roads){
                let road_info = ROADS[hex.roads[direction]]
                drawLine(x, y, direction, road_info['color'], road_info['width']*VIEW.scale, ctx)
            }
        }
        if (hex.settlement != null) {
            if (grid_view.show_settlements) {
                ctx.drawImage(SETTLEMENTS[hex.settlement.type]['icon'], x - grid_view.scale * 0.4, y - grid_view.scale * 0.4, grid_view.scale*0.8, grid_view.scale*0.8)
            }
            if (grid_view.show_settlement_names) {
                ctx.font = `${Math.floor(0.3*grid_view.scale)}px Arial`;
                ctx.fillStyle = 'black'
                ctx.fillText(hex.settlement.name, x-grid_view.scale*0.5, y-grid_view.scale*0.3*HEX_HEIGHT)
            }
        }
    }

    function drawLine(x: number, y: number, direction: number, color: string, line_width: number, ctx: CanvasRenderingContext2D){
        ctx.lineWidth = line_width
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + VIEW.scale * HEX_HEIGHT/2 * Math.sin(direction/3 * Math.PI),
            y - VIEW.scale * HEX_HEIGHT/2 * Math.cos(direction/3 * Math.PI))
        ctx.closePath()
        ctx.strokeStyle = color
        ctx.stroke()
    }

    function DrawHexagon(x: number, y: number, s: number, color: string, ctx: CanvasRenderingContext2D, border_color: string='black'): void {
        let half_height = 3 ** 0.5 / 2;
        let vertexes = [
            [-0.5, -half_height], [0.5, -half_height], [1, 0], [0.5, half_height],
            [-0.5, half_height], [-1, 0]
        ]
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + s * vertexes[0][0], y + s * vertexes[0][1])
        for (let i = 1; i < vertexes.length; i++) {
            ctx.lineTo(x + s * vertexes[i][0], y + s * vertexes[i][1])
        }
        ctx.closePath()
        ctx.strokeStyle = 'black'
        ctx.stroke()
        ctx.fillStyle = color
        ctx.fill()
    }

    type HexGrid = {
        array: Hex[][],
        offset: [number, number],
        first_is_up: boolean
    }

    function EmptyHexGrid(n_rows: number, n_cols: number, offset: [number, number] = [0, 0]): HexGrid {
        let array: Hex[][] = Array<Hex[]>(0)
        for (let row = 0; row < n_rows; row++) {
            let new_row = Array<Hex>(0);
            for (let col = 0; col < n_cols; col++) {
                new_row = new_row.concat([EmptyHex([col + offset[0], row + offset[1]])]);
            }
            array = array.concat([new_row])
        }
        return {'array': array, 'offset': offset, 'first_is_up': true};
    }

    function RandomHexGrid(n_rows: number, n_cols: number): HexGrid {
        let array: Hex[][] = Array<Hex[]>(0)
        for (let row = 0; row < n_rows; row++) {
            let new_row = Array<Hex>(0);
            for (let col = 0; col < n_cols; col++) {
                new_row = new_row.concat([RandomHex()]);
            }
            array = array.concat([new_row])
        }
        return {'array': array, 'offset': [0, 0], 'first_is_up': true};
    }

    function AddRows(array: HexGrid, n_rows: number, top: boolean) {
        if (top) {
            array.offset[1] -= n_rows;
        }
        if (n_rows > 0) {
            if (top) {
                let new_rows = EmptyHexGrid(n_rows, array.array[0].length, array.offset).array;
                array.array = new_rows.concat(array.array);
            } else {
                let new_rows = EmptyHexGrid(n_rows, array.array[0].length, [array.offset[0], shape(array.array)[1]+array.offset[1]]).array;
                array.array = array.array.concat(new_rows)
            }

        } else if (n_rows < 0) {
            if (top) {
                array.array = array.array.slice(-n_rows, array.array.length)
            } else {
                array.array = array.array.slice(0, array.array.length + n_rows)
            }
        }
    }

    function AddColumns(array: HexGrid, n_cols: number, left: boolean) {
        if (left) {
            array.offset[0] -= n_cols
        }
        if (n_cols > 0) {
            let array_width = shape(array.array)[0]
            for (let i = 0; i < array.array.length; i++) {
                if (left) {
                    let new_row = EmptyHexGrid(1, n_cols, [array.offset[0], array.offset[1] + i])
                    array.array[i] = new_row.array[0].concat(array.array[i]);
                } else {
                    let new_row = EmptyHexGrid(1, n_cols, [array_width + array.offset[0], array.offset[1]+i])
                    array.array[i] = array.array[i].concat(new_row.array[0]);
                }
            }
        } else if (n_cols < 0) {
            for (let i = 0; i < array.array.length; i++) {
                if (left) {
                    array.array[i] = array.array[i].slice(-n_cols, array.array[i].length);
                } else {
                    array.array[i] = array.array[i].slice(0, array.array[i].length + n_cols);
                }
            }
        }
        console.log(array)
    }

    function DisplayGrid(grid: HexGrid, view: HexGridView, canvas: HTMLCanvasElement): void {
        clearHexCanvas()
        for (let row = 0; row < grid.array.length; row++) {
            for (let col = 0; col < grid.array[0].length; col++) {
                DisplayHex(grid, grid.array[row][col], view, canvas)
            }
        }
    }

    function DisplayHex(grid: HexGrid, hex: Hex, view: HexGridView, canvas: HTMLCanvasElement, clear_first: boolean=false): void {
        let ctx = canvas.getContext('2d')
        let x_center = 3 / 2 * hex.position.col * view.scale + view.offset_x;
        let offset_down = (Boolean(hex.position.col % 2) == grid.first_is_up)
        let y_center = HEX_HEIGHT * view.scale * (hex.position.row + 0.5 * +offset_down) + view.offset_y
        let coordinate_label = hex.position.col + ', ' + (hex.position.row)
        if (clear_first) {
            DrawHexagon(x_center, y_center, view.scale, '#ffffff', ctx, '#ffffff');
        }
        DrawHex(x_center, y_center, hex, view, coordinate_label, ctx)
    }

    type NormalCoord = {
        col: number,
        row: number
    }

    type AxialCoord = {
        q: number,
        r: number
    }

    type CubicCoord = {
        q: number,
        r: number,
        s: number
    }

    type Point = {
        x: number,
        y: number
    }

    function standard_position(pt: Point, view: HexGridView): Point {
        return {'x': (pt.x - view.offset_x) / view.scale, 'y': (pt.y - view.offset_y) / view.scale}
    }

    function normal_to_axial(coord: NormalCoord, grid: HexGrid): AxialCoord {
        let q = coord.col;
        let r = coord.row - (coord.col + (coord.col & 1)) / 2;
        if (grid.first_is_up) {
            r = coord.row - (coord.col - (coord.col & 1)) / 2;
        }
        return {'q': q, 'r': r}
    }

    function axial_to_normal(coord: AxialCoord, grid: HexGrid): NormalCoord {
        let col = coord.q;
        let row = coord.r + (coord.q + (coord.q & 1)) / 2;
        if (grid.first_is_up) {
            row = coord.r + (coord.q - (coord.q & 1)) / 2;
        }
        return {'col': col, 'row': row}
    }

    function cubic_to_axial(coord: CubicCoord): AxialCoord {
        return {'q': coord.q, 'r': coord.r}
    }

    function axial_to_cubic(coord: AxialCoord): CubicCoord {
        return {'q': coord.q, 'r': coord.r, 's': -coord.q - coord.r}
    }

    function axial_round(coord: AxialCoord): AxialCoord {
        let x = coord.q
        let y = coord.r
        let xgrid = Math.round(x)
        let ygrid = Math.round(y)
        x -= xgrid
        y -= ygrid
        let dx = Math.round(x + 0.5 * y) * +(x * x >= y * y)
        let dy = Math.round(y + 0.5 * x) * +(x * x < y * y)
        return {'q': xgrid + dx, 'r': ygrid + dy}

    }

    function pixel_to_normal(pt: Point): NormalCoord {
        pt = standard_position(pt, VIEW)
        let q = (2 / 3 * pt.x)
        let r = (-1 / 3 * pt.x + HEX_HEIGHT / 3 * pt.y)
        return axial_to_normal(cubic_to_axial(cubic_round(axial_to_cubic({'q': q, 'r': r}))), HEX_GRID)
    }

    function cubic_round(coord: CubicCoord): CubicCoord {
        let q = Math.round(coord.q)
        let r = Math.round(coord.r)
        let s = Math.round(coord.s)
        let q_diff = Math.abs(q - coord.q)
        let r_diff = Math.abs(r - coord.r)
        let s_diff = Math.abs(s - coord.s)

        if ((q_diff > r_diff) && (q_diff > s_diff)) {
            q = -r - s
        } else if (r_diff > s_diff) {
            r = -q - s
        } else {
            s = -q - r
        }
        return {'q': q, 'r': r, 's': s}
    }

    function printPos(event) {
        let bounds = CANVAS.getBoundingClientRect();
        let pt = {'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top}
        console.log(pixel_to_normal(pt))
    }

    function ClickCoordinates(event) {
        let bounds = CANVAS.getBoundingClientRect();
        let pt = {'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top}
        return pixel_to_normal(pt)
    }

    function shape(array: any[][]): [number, number] {
        return [array[0].length, array.length];
    }

    function movementDirection(from_hex: Hex, to_hex: Hex): [number, number] {
        let delta_x = to_hex.position.col - from_hex.position.col;
        let delta_y = to_hex.position.row - from_hex.position.row - (from_hex.position.col % 2);
        if (delta_x == 0){
            if (from_hex.position.row == to_hex.position.row){
                return null
            }
            if (from_hex.position.row < to_hex.position.row){
                return [3, 0]
            } else {
                return [0, 3]
            }
        }
        if (delta_x == -1 && delta_y == -1) {
            return [5, 2]
        }
        if (delta_x == 1 && delta_y == -1) {
            return [1, 4]
        }
        if (delta_x == -1 && delta_y == 0) {
            return [4, 1]
        }
        if (delta_x == 1 && delta_y == 0) {
            return [2, 5]
        }

        return null
    }

    type HexGridView = {
        offset_x: number,
        offset_y: number,
        scale: number,
        show_terrain: boolean,
        show_coordinates: boolean
        player_view: boolean
        show_settlements: boolean
        show_settlement_names: boolean
        show_rivers: boolean
        show_roads: boolean
    }

    function DefaultView(side_length: number): HexGridView {
        return {'offset_x': side_length, 'offset_y': HEX_HEIGHT / 2 * side_length, 'scale': side_length,
        'show_terrain': true, 'show_coordinates': false, 'player_view': false, 'show_settlements': true,
            'show_settlement_names': true, 'show_roads': true, 'show_rivers': true}
    }

    function paintHex(hex) {
        hex[CURRENT_BRUSH.property] = CURRENT_BRUSH.value
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    }

    function paintPath(hex) {
        if(hex == PREVIOUS_HEX){return}
        let movement_direction = movementDirection(PREVIOUS_HEX, hex);
        if (movement_direction == null){return}
        console.log(CURRENT_BRUSH)
        PREVIOUS_HEX[CURRENT_BRUSH.property][movement_direction[0]] = CURRENT_BRUSH.value
        hex[CURRENT_BRUSH.property][movement_direction[1]] = CURRENT_BRUSH.value
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    }

    function addSettlement(hex) {
        if(CURRENT_BRUSH.value == 'delete'){
            hex.settlement = null
            DisplayGrid(HEX_GRID, VIEW, CANVAS)
            return
        }
        if(hex.settlement != null){
            window.alert('A settlement already exists on this hex.')
            return
        }
        let new_name = window.prompt("What would you like to name the new settlement?")
        if(new_name == null){
            return
        }
        hex.settlement = {'name': new_name, 'type': CURRENT_BRUSH.value}
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    }

    function zoomIn(redraw: boolean = true, fixed_point: (Point | null) = null) {
        let old_scale = VIEW.scale
        VIEW.scale = Math.min(300, VIEW.scale * 1.2)
        let scaling_factor = VIEW.scale/old_scale
        if (fixed_point != null){
            VIEW.offset_x -= fixed_point.x * (scaling_factor-1)
            VIEW.offset_y -= fixed_point.y * (scaling_factor-1)
        } else {
            VIEW.offset_x *= VIEW.scale/old_scale
            VIEW.offset_y *= VIEW.scale/old_scale}
        if (redraw){
            clearHexCanvas()
            DisplayGrid(HEX_GRID, VIEW, CANVAS)
        }

    }

    function zoomOut(redraw: boolean = true, fixed_point: (Point | null) = null) {
        let old_scale = VIEW.scale
        VIEW.scale = Math.max(10, VIEW.scale * 0.8)
        let scaling_factor = VIEW.scale/old_scale
        if (fixed_point != null){
            VIEW.offset_x -= fixed_point.x * (scaling_factor-1)
            VIEW.offset_y -= fixed_point.y * (scaling_factor-1)
        } else {
            VIEW.offset_x *= VIEW.scale/old_scale
            VIEW.offset_y *= VIEW.scale/old_scale}
        if (redraw){
            clearHexCanvas()
            DisplayGrid(HEX_GRID, VIEW, CANVAS)
        }
    }

    function centerOnPoint(point: Point, redraw: boolean = true): void {
        VIEW.offset_x = CANVAS.width/2 - point.x
        VIEW.offset_y = CANVAS.height/2 - point.y
        if (redraw) {
            clearHexCanvas()
            DisplayGrid(HEX_GRID, VIEW, CANVAS)
        }
    }

    function shift_hexgrid(direction: string) {
        clearHexCanvas()
        if (direction == 'left') {
            VIEW.offset_x += VIEW.scale
            VIEW.offset_x = Math.min(VIEW.scale, VIEW.offset_x)
        } else if (direction == 'right') {
            VIEW.offset_x -= VIEW.scale
            VIEW.offset_x = Math.max(-(VIEW.scale * (1.5 * (HEX_GRID.array[0].length - 1) + 2) - CANVAS.width), VIEW.offset_x)
        } else if (direction == 'up') {
            VIEW.offset_y += VIEW.scale
            VIEW.offset_y = Math.min(HEX_HEIGHT / 2 * VIEW.scale, VIEW.offset_y)
        } else if (direction == 'down') {
            VIEW.offset_y -= VIEW.scale
            VIEW.offset_y = Math.max(-(VIEW.scale * HEX_HEIGHT * (HEX_GRID.array.length + 0.5) - CANVAS.height), VIEW.offset_y)
        }
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    }

    function clearHexCanvas() {
        let context = CANVAS.getContext('2d');
        context.clearRect(0, 0, CANVAS.width, CANVAS.height)
    }

    function loadSavedMap(map_name: string){
        $.post(
            'load',
            {'save_name': map_name},
            function(data, status){
                data = JSON.parse(data)
                if (data == false){
                    alert('There is no saved map with that name.')
                }
                else {
                    HEX_GRID = data
                    DisplayGrid(HEX_GRID, VIEW, CANVAS)
                }
            }
        )
    }

    function addTerrainButtons() {
        //I am just keeping this around to see how to programatically generate buttons
        let draw_button_div = document.getElementById("draw_buttons");
        for (let i = 0; i < Object.keys(TERRAIN_INFO).length; i++) {
            let terrain_type = Object.keys(TERRAIN_INFO)[i];
            let button_name = `${terrain_type}_button`
            let button = document.createElement("BUTTON");
            let text = document.createTextNode(terrain_type)
            button.id = button_name
            button.appendChild(text);
            draw_button_div.appendChild(button);
            button.addEventListener('click', function () {
                CURRENT_BRUSH.property = 'terrain';
                CURRENT_BRUSH.value = terrain_type;
                CURRENT_CURSOR.function = paintHex;
                CURRENT_CURSOR.trigger_on_move = true;
            });
        }
    }

    function populateSettlementList(){
        let dropdown = $("#settlement_dropdown")
        dropdown.empty()
        dropdown.append(`<option value=delete>Delete</option>`)
        for (let i = 0; i < Object.keys(SETTLEMENTS).length; i++) {
            let settlement_key = Object.keys(SETTLEMENTS)[i];
            dropdown.append(`<option value="${settlement_key}">${SETTLEMENTS[settlement_key]['name']}</option>`)
        }
    }

    function populateSaveList(){
        $.get(
            'saved_map_names',
            {},
            function(data, status){
                let saved_names = data
                let dropdown = $("#saved_maps_dropdown")
                dropdown.empty()
                for (let i=0; i<saved_names.length; i++){
                    dropdown.append(`<option value="${saved_names[i]}">${saved_names[i]}</option>`)
                }
            }
        )
    }

    function populateMobSetNames(){
        $.get(
            'mob_set_names',
            {},
            function(data, status){
                let mob_set_names = data
                let dropdown = $("#mob_set_dropdown")
                dropdown.empty()
                dropdown.append(`<option value="">None</option>`)
                for (let i=0; i<mob_set_names.length; i++){
                    dropdown.append(`<option value="${mob_set_names[i]['value']}">${mob_set_names[i]['name']}</option>`)
                }
            }
        )
    }

    function populateEnvironmentList(){
        $.get(
            'environment_set_names',
            {},
            function(data, status){
                let environment_set_names = data
                let dropdown = $("#environment_dropdown")
                dropdown.empty()
                dropdown.append(`<option value="">None</option>`)
                for (let i=0; i<environment_set_names.length; i++){
                    dropdown.append(`<option value="${environment_set_names[i]['value']}">${environment_set_names[i]['name']}</option>`)
                }
            }
        )
    }


    function editable(): boolean{
        let edit_checkbox = <HTMLInputElement>document.getElementById('editable_switch')
        return edit_checkbox.checked
    }

    let CANVAS = <HTMLCanvasElement>document.getElementById("hexcanvas");
    let CURRENT_CURSOR: Cursor = {'function': null, 'trigger_on_move': false, 'edits': false};
    let CURRENT_BRUSH: Brush = {'property': null, 'value': false}
    let HEX_GRID = EmptyHexGrid(20, 30)
    let VIEW = DefaultView(30)
    let TERRAIN_INFO: any;
    let PREVIOUS_HEX: Hex | null = null;

    async function loadTerrain() {
        try {
            const response = await fetch('../static/info/terrain.json')
            TERRAIN_INFO = await response.json();
            for (let k in TERRAIN_INFO) {
                if ('texture' in TERRAIN_INFO[k]){
                    let new_image = new Image()
                    new_image.src = 'static/images/terrain/' + TERRAIN_INFO[k]['texture'] + '.svg'
                    TERRAIN_INFO[k]['texture'] = new_image
                }
            }
        } catch (error){
            console.error("error loading JSON file:", error)
        }
    }

    async function loadRivers() {
        try {
            const response = await fetch('../static/info/rivers.json')
            RIVERS = await response.json();
        } catch (error){
            console.error("error loading JSON file:", error)
        }
    }
    async function loadRoads() {
        try {
            const response = await fetch('../static/info/roads.json')
            ROADS = await response.json();
        } catch (error){
            console.error("error loading JSON file:", error)
        }
    }


    loadTerrain()
    let RIVERS = {};
    loadRivers();
    let ROADS = {};
    loadRoads();
    populateSaveList()
    populateSettlementList()
    populateMobSetNames()
    populateEnvironmentList()

    // Event Listeners
    // Navigation
    document.getElementById('hexcanvas').addEventListener('wheel', function(event){
        event.preventDefault()
        let bounds = CANVAS.getBoundingClientRect();
        let pt = {'x': event.clientX - bounds.left, 'y': event.clientY - bounds.top}
        pt.x -= VIEW.offset_x
        pt.y -= VIEW.offset_y
        if (event.deltaY > 0){
            zoomIn(true, pt)
        } else {
            zoomOut(true, pt)
        }
    })

    document.addEventListener("keydown", function (event) {
        if (event.key == 'a') {
            shift_hexgrid('left');
        } else if (event.key == 'd') {
            shift_hexgrid('right');
        } else if (event.key == 'w') {
            shift_hexgrid('up');
        } else if (event.key == 's') {
            shift_hexgrid('down');
        }
    })

    // Map Modification
    document.getElementById('add_left').addEventListener('click', function () {
        if(!editable()){return}
        AddColumns(HEX_GRID, 1, true);
    });

    document.getElementById('add_right').addEventListener('click', function () {
        if(!editable()){return}
        AddColumns(HEX_GRID, 1, false);
    });

    document.getElementById('add_top').addEventListener('click', function () {
        if(!editable()){return}
        AddRows(HEX_GRID, 1, true);
    });

    document.getElementById('add_bottom').addEventListener('click', function () {
        if(!editable()){return}
        AddRows(HEX_GRID, 1, false)
    });

    document.getElementById('hexcanvas').addEventListener('mouseup', function(event) {
        if (CURRENT_CURSOR.edits && !editable()){return}
        let coordinates = ClickCoordinates(event)
        let hex = HEX_GRID.array[coordinates.row][coordinates.col];
        if (hex == null){return}
        if(CURRENT_CURSOR.function != null){
            CURRENT_CURSOR.function(hex, coordinates)
        }
        PREVIOUS_HEX = null;
    })

    document.getElementById('hexcanvas').addEventListener('mousedown', function(event){
        let coordinates = ClickCoordinates(event)
        PREVIOUS_HEX = HEX_GRID.array[coordinates.row][coordinates.col];
    })

    document.getElementById('hexcanvas').addEventListener('mousemove', function(event) {
        if(event.buttons != 1){return}
        event.preventDefault()
        if (CURRENT_CURSOR.edits && !editable()){return}
        if (!CURRENT_CURSOR.trigger_on_move) {
            return
        }
        let coordinates = ClickCoordinates(event)
        try {
            let hex = HEX_GRID.array[coordinates.row][coordinates.col];
        }
        catch (error) {
            return
        }
        let hex = HEX_GRID.array[coordinates.row][coordinates.col];
        if (hex == null){return}
        if (hex == PREVIOUS_HEX){return}
        if(CURRENT_CURSOR.function != null){
            CURRENT_CURSOR.function(hex, coordinates)
        }
        PREVIOUS_HEX = hex;
    })

    document.getElementById('terrain_dropdown').addEventListener('change', function(){
        let terrain_type = $("#terrain_dropdown").find(":selected").val().toString()
        CURRENT_BRUSH.property = 'terrain'
        CURRENT_BRUSH.value = terrain_type
        CURRENT_CURSOR.function = paintHex
        CURRENT_CURSOR.trigger_on_move = true
        CURRENT_CURSOR.edits = true
    })

    document.getElementById('river_dropdown').addEventListener('click', function(){
        let river_type = (document.getElementById('river_dropdown') as HTMLSelectElement).value;
        CURRENT_BRUSH.property = 'rivers'
        CURRENT_BRUSH.value = river_type
        CURRENT_CURSOR.function = paintPath
        CURRENT_CURSOR.trigger_on_move = true
        CURRENT_CURSOR.edits = true
    })

    document.getElementById('road_dropdown').addEventListener('click', function(){
        let road_type = (document.getElementById('road_dropdown') as HTMLSelectElement).value;
        CURRENT_BRUSH.property = 'roads'
        CURRENT_BRUSH.value = road_type
        CURRENT_CURSOR.function = paintPath
        CURRENT_CURSOR.trigger_on_move = true
        CURRENT_CURSOR.edits = true
    })

    document.getElementById('settlement_dropdown').addEventListener('change', function(){
        let settlement_type = $("#settlement_dropdown").find(":selected").val().toString()
        CURRENT_BRUSH.property = 'settlement'
        CURRENT_BRUSH.value = settlement_type
        CURRENT_CURSOR.function = addSettlement
        CURRENT_CURSOR.trigger_on_move = false
        CURRENT_CURSOR.edits = true
    })

    document.getElementById('visibility_dropdown').addEventListener('change', function(){
        let player_visible = $("#visibility_dropdown").find(":selected").val().toString()
        CURRENT_BRUSH.property = 'player_visible'
        CURRENT_BRUSH.value = player_visible == 'true'
        CURRENT_CURSOR.function = paintHex
        CURRENT_CURSOR.trigger_on_move = true
        CURRENT_CURSOR.edits = true
    });

    // Display Modification
    (document.getElementById('terrain_checkbox') as HTMLInputElement).addEventListener('change', function(){
        VIEW.show_terrain = this.checked;
        DisplayGrid(HEX_GRID, VIEW, CANVAS);
    });

    (document.getElementById('player_view_checkbox') as HTMLInputElement).addEventListener('change', function(){
        VIEW.player_view = this.checked;
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    });

    (document.getElementById('settlement_checkbox') as HTMLInputElement).addEventListener('change', function(){
        VIEW.show_settlements = this.checked;
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    });

    (document.getElementById('settlement_name_checkbox') as HTMLInputElement).addEventListener('change', function(){
        VIEW.show_settlement_names = this.checked;
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    });

    (document.getElementById('river_checkbox') as HTMLInputElement).addEventListener('change', function(){
        VIEW.show_rivers = this.checked;
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    });

    (document.getElementById('road_checkbox') as HTMLInputElement).addEventListener('change', function(){
        VIEW.show_roads = this.checked;
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
    });

    // Misc
    document.getElementById('encounter_gen').addEventListener('click', function(){
        let party_size = $("#party_size").val()
        let party_level = $("#party_level").val()
        let difficulty = $("#difficulty_dropdown").find(":selected").val()
        let primary_enemy = $("#mob_set_dropdown").find(":selected").val()
        let environment_type = $("#environment_dropdown").find(":selected").val()
        $.get(
            'encounter',
            {
                'environment_type': environment_type,
                'party_size': party_size,
                'party_level': party_level,
                'difficulty': difficulty,
                'primary_enemy': primary_enemy},
            function(data, status){
                let div = document.getElementById("encounter_display")
                div.replaceChildren()
                div.innerHTML += data
            }
        ).fail(function(data, error){
            alert(data['responseText']);
        })
    })

    document.getElementById('hex_info').addEventListener('click', function(){
        CURRENT_CURSOR.function = function(hex){
            console.log(hex)
        }
        CURRENT_CURSOR.trigger_on_move = false
        CURRENT_CURSOR.edits = false
    })

    document.getElementById('hex_link').addEventListener('click', function(){
        CURRENT_CURSOR.function = function(hex, coord: NormalCoord){
            let url = `http://192.168.4.106:8800/doku.php?id=hex:hex_${coord.col+HEX_GRID.offset[0]}_${coord.row+HEX_GRID.offset[1]}`
            window.open(url, '_blank')
        }
        CURRENT_CURSOR.trigger_on_move = false
        CURRENT_CURSOR.edits = false
    })

    // Map Storage
    document.getElementById('save').addEventListener('click', function(){
        let save_name = prompt('Save name: ')
        if ((save_name != '') && (save_name != null)){
            $.post(
                'save',
                {'hex_map': JSON.stringify(HEX_GRID),
                'save_name': save_name}
        )
            populateSaveList()
        } else {
            alert('Invalid name - The map was not saved.')
        }
        populateSaveList()
    })

    document.getElementById('load').addEventListener('click', function(){
        let load_name = $("#saved_maps_dropdown").find(":selected").text()
        loadSavedMap(load_name);
    })

    document.getElementById('delete').addEventListener('click', function(){
        $.post(
            'delete_save',
            {'to_delete': $("#saved_maps_dropdown").find(":selected").text()},
            function(data, alert){
            }
        )
        populateSaveList()
    })

    document.getElementById('new_map').addEventListener('click', function(){
        if(!editable()){
            return
        }
        document.getElementById('newMapModal').style.display = "block"
        document.getElementById('overlay').style.display = "block"
    })

    function hideNewMapModal(){
        document.getElementById('newMapModal').style.display = "none";
        document.getElementById('overlay').style.display = "none";
        (document.getElementById('n_cols_input') as HTMLInputElement).value = "10";
        (document.getElementById('n_rows_input') as HTMLInputElement).value = "10";
    }

    document.getElementById('newMapCancelButton').addEventListener('click', function(){
        hideNewMapModal()
    })

    document.getElementById("newMapSubmitButton").addEventListener("click", function(){

        let n_cols = Number((document.getElementById('n_cols_input') as HTMLInputElement).value);
        let n_rows = Number((document.getElementById('n_rows_input') as HTMLInputElement).value);
        HEX_GRID = EmptyHexGrid(n_rows, n_cols)
        DisplayGrid(HEX_GRID, VIEW, CANVAS)
        hideNewMapModal();
    })

    document.getElementById('test').addEventListener('click', function(){
        console.log(movementDirection(HEX_GRID.array[2][2], HEX_GRID.array[2][2]))
        console.log(movementDirection(HEX_GRID.array[2][2], HEX_GRID.array[3][2]))

        console.log('Odd Column')
        console.log(movementDirection(HEX_GRID.array[0][1], HEX_GRID.array[1][2]))
        console.log(movementDirection(HEX_GRID.array[0][1], HEX_GRID.array[0][2]))
        console.log(movementDirection(HEX_GRID.array[0][1], HEX_GRID.array[0][0]))
        console.log(movementDirection(HEX_GRID.array[0][1], HEX_GRID.array[1][0]))

        console.log('Even Column')
        console.log(movementDirection(HEX_GRID.array[2][4], HEX_GRID.array[2][5]))
        console.log(movementDirection(HEX_GRID.array[2][4], HEX_GRID.array[1][5]))
        console.log(movementDirection(HEX_GRID.array[2][4], HEX_GRID.array[1][3]))
        console.log(movementDirection(HEX_GRID.array[2][4], HEX_GRID.array[2][3]))

    })
}

