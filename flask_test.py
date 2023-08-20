from flask import Flask, render_template, jsonify, redirect, url_for, request
from PIL import Image
from image_generation import make_hex, generate_random_color

app = Flask(__name__)


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        if request.form.get('open') == 'Open':
            # Generate the image using Pillow
            make_hex(generate_random_color(), 'static/image.png')
            # Render the template with the image URL
            return render_template('index.html', image_url='/static/image.png')
        elif request.form.get('close') == 'Close':
            print('do something else')
            return redirect(url_for('denial'))
        else:
            pass

    else:
        print('not post')
        return render_template('index.html', image_url='/static/image.png')


@app.route('/denied')
def denial():
    return 'You do not get to see shit!'


@app.route('/generate-image')
def generate_image():
    # Generate the image using Pillow
    make_hex(generate_random_color(), 'static/image.png')

    # Return the new image URL as a JSON response
    return render_template('index.html', image_url='/static/image.png')


if __name__ == '__main__':
    app.run()
