function draw_hexagon(x, y, side_length, color, context) {
    context.fillStyle = color;
    context.beginPath();
    var vert = 3**0.5/2;
    context.moveTo(x+0.5*side_length, y);
    context.lineTo(x+1.5*side_length, y);
    context.lineTo(x+2*side_length, y+vert*side_length);
    context.lineTo(x+1.5*side_length, y+2*vert*side_length);
    context.lineTo(x+0.5*side_length, y+2*vert*side_length);
    context.lineTo(x, y+vert*side_length);
    context.lineTo(x+0.5*side_length, y);
    context.fill();
}

function draw_grid_hexagon(x_pos, y_pos, side_length, color, context) {
    if ((x_pos+y_pos)%2 != 0) {
        throw `(${x_pos}, ${y_pos}) is not a valid position in a hex grid.`
    }
    draw_hexagon(x_pos*1.5*side_length, y_pos*3**0.5/2*side_length, side_length, color, context);
}

function draw_random_hexes(cols, rows, side_length, context) {
    for (let x=0; x < cols; x++) {
        for (let y=x%2; y < rows; y+=2) {
            var color = '#'+Math.floor(Math.random()*16777215).toString(16);
            draw_grid_hexagon(x, y, side_length, color, context);
        }
    }
}
