import math
import random
from PIL import Image, ImageDraw


def make_hex(color, store_path):
    side = 6
    xy = [
        ((math.cos(th) + 1) * 90,
         (math.sin(th) + 1) * 60)
        for th in [i * (2 * math.pi) / side for i in range(side)]
    ]

    img = Image.new("RGB", (600, 600), "#ffffff")
    img1 = ImageDraw.Draw(img)
    img1.polygon(xy, fill=color, outline="black")
    img.save(store_path)


def generate_random_color():
    # Generate random values for red, green, and blue components
    red = random.randint(0, 255)
    green = random.randint(0, 255)
    blue = random.randint(0, 255)

    # Convert the RGB values to a hexadecimal string
    color_code = "#{:02x}{:02x}{:02x}".format(red, green, blue)

    return color_code


