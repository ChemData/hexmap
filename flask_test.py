import os
import json
import flask
from flask import Flask, render_template, jsonify, redirect, url_for, request, after_this_request
from data_load import MOB_SETS, ENVIRONMENT_SETS

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
    save_name = data['save_name']
    os.makedirs('storage', exist_ok=True)
    with open(f'storage/{save_name}.txt', 'w') as f:
        f.write(hex_grid)
    return jsonify(True)


@app.route('/load', methods=['POST'])
def load_map():
    data = request.form
    save_name = data['save_name']
    try:
        with open(f'storage/{save_name}.txt', 'r') as f:
            map_string = f.read()
        return jsonify(map_string)
    except FileNotFoundError:
        return jsonify(False)


@app.route('/saved_map_names', methods=['GET'])
def saved_map_names():
    try:
        save_names = [os.path.splitext(x)[0] for x in os.listdir('storage') if x.endswith('txt')]
    except FileNotFoundError:
        return []
    return save_names

@app.route('/delete_save', methods=['POST'])
def delete_save():
    to_delete = request.form['to_delete']
    try:
        os.remove(os.path.join('storage', f'{to_delete}.txt'))
    except FileNotFoundError:
        return jsonify(False)
    return jsonify(True)


@app.route('/mob_set_names', methods=['GET'])
def mob_set_names():
    return jsonify([x['name'] for x in MOB_SETS.values()])


if __name__ == '__main__':
    app.debug = True
    app.run()
