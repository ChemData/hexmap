import os
import json
import flask
from flask import Flask, render_template, jsonify, redirect, url_for, request, after_this_request
from PIL import Image

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/encounter', methods=['POST'])
def encounter():
    data = request.form
    primary_creature = data['primary_creature']
    terrain = data['terrain']
    return jsonify(f"{primary_creature}s attack your ass in the {terrain}!")


@app.route('/save', methods=['POST'])
def save_map():
    data = request.form
    hex_grid = data['hex_map']
    with open('storage/saved_map.txt', 'w') as f:
        f.write(hex_grid)
    return jsonify(True)


@app.route('/load', methods=['GET'])
def load_map():
    try:
        with open('storage/saved_map.txt', 'r') as f:
            map_string = f.read()
        return jsonify(map_string)
    except FileNotFoundError:
        return jsonify(False)


if __name__ == '__main__':
    app.debug = True
    app.run()
