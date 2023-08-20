import random
from math import sqrt
import numpy as np
from PIL import Image, ImageDraw


HALF_HEIGHT = sqrt(3)/2


class Hex:

    def __init__(self, color):
        self.color = color

    @classmethod
    def random_color(cls):
        return cls(generate_random_color())


def generate_random_color():
    # Generate random values for red, green, and blue components
    red = random.randint(0, 255)
    green = random.randint(0, 255)
    blue = random.randint(0, 255)

    # Convert the RGB values to a hexadecimal string
    color_code = "#{:02x}{:02x}{:02x}".format(red, green, blue)

    return color_code


class HexGrid:

    def __init__(self, x_dim: int, y_dim: int):
        self.array = np.full((x_dim, y_dim), None, dtype='object')
        self.offset = np.array([0, 0])
        self.start_high = True  # If True, the first column is higher than the second, if 0, the second column is higher

    def __repr__(self):
        return repr(self.array)

    @property
    def width(self):
        return self.array.shape[1]

    @property
    def height(self):
        return self.array.shape[0]

    def add_top_rows(self, n: int):
        self.offset[1] -= n
        if n > 0:
            self.array = np.concatenate([np.full((n, self.array.shape[1]), None), self.array], axis=0)
        elif n < 0:
            n *= -1
            n = min(n, self.height)
            self.array = self.array[n:, :]

    def add_bottom_rows(self, n: int):
        if n > 0:
            self.array = np.concatenate([self.array, np.full((n, self.array.shape[1]), None)], axis=0)
        elif n < 0:
            n *= -1
            n = min(n, self.height)
            self.array = self.array[:n-1, :]

    def add_left_columns(self, n: int):
        self.offset[0] -= n
        if n % 1 == 0:
            self.start_high = not self.start_high
        if n > 0:
            self.array = np.concatenate([np.full((self.array.shape[0], n), None), self.array], axis=1)
        elif n < 0:
            n *= -1
            n = min(n, self.width)
            self.array = self.array[:, n:]

    def add_right_columns(self, n: int):
        if n > 0:
            self.array = np.concatenate([self.array, np.full((self.array.shape[0], n), None)], axis=1)
        elif n < 0:
            n *= -1
            n = min(n, self.width)
            self.array = self.array[:, :n-1]

    def index(self, x, y):
        return self.array[y-self.offset[1], x-self.offset[0]]

    def set(self, x, y, value):
        self.array[y, x] = value

    def iter(self):
        for x_cor in range(self.width):
            for y_cor in range(self.height):
                yield x_cor, y_cor, self.array[y_cor, x_cor]


class HexGridView:

    def __init__(self, pixel_width: int, pixel_height: int, edge_length: int, x_offset: float = 0, y_offset: float = 0,
                 standard_view: bool = False):
        self.pixel_width = pixel_width
        self.pixel_height = pixel_height
        self.edge_length = edge_length
        self.x_offset = x_offset
        self.y_offset = y_offset
        if standard_view:
            self.x_offset = edge_length
            self.y_offset = HALF_HEIGHT * edge_length

    def to_img(self, grid: HexGrid, path: str):
        """Apply the view to a grid and store the image."""
        img = Image.new("RGB", (self.pixel_width, self.pixel_height), "#ffffff")
        draw_on = ImageDraw.Draw(img)
        for x_ind, y_ind, hex in grid.iter():
            x_center = 3/2*x_ind*self.edge_length + self.x_offset
            offset_down = (x_ind % 2) == grid.start_high
            y_center = sqrt(3)*(y_ind + 0.5*offset_down)*self.edge_length + self.y_offset
            coords = self._hex_coords(x_center, y_center)
            draw_on.polygon(tuple(coords), fill=hex.color, outline="black")
        img.save(path)

    def _hex_coords(self, center_x: float, center_y: float):
        # These are the corner coordinates for a hexagon centered at 0, 0 with side length 1
        coords = np.array([[-1/2, -HALF_HEIGHT], [1/2, -HALF_HEIGHT],
                           [1, 0], [1/2, HALF_HEIGHT], [-1/2, HALF_HEIGHT], [-1, 0]])

        # Scale
        coords *= self.edge_length

        # Transpose
        coords[:, 0] += center_x
        coords[:, 1] += center_y

        output = [(p[0], p[1]) for p in coords]
        return output


grid = HexGrid(3, 4)
grid.add_left_columns(1)
for x, y, _ in grid.iter():
    grid.set(x, y, Hex.random_color())


r = HexGridView(1000, 1000, 100, standard_view=True)
r.to_img(grid, 'test_output.png')