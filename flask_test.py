import os
import json
import flask
from flask import Flask, render_template, jsonify, redirect, url_for, request, after_this_request
from encounter_generation import generator

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


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


@app.route('/encounter', methods=['GET'])
def encounter():
    data = request.args
    party = int(data['party_size'])*[int(data['party_level'])]
    primary_enemy = data['primary_enemy']
    if primary_enemy == "":
        primary_enemy = None
    env_type = data['environment_type']
    if env_type == "":
        env_type = None
    new_encounter, difficulty, mob_type = generator.hex_encounter(data['difficulty'], party, primary_enemy, environment_type=env_type)
    encounter_html = new_encounter.html_with_links()
    encounter_html = f'<h3>{difficulty.capitalize()} {mob_type.capitalize()}</h3>\n' + encounter_html
    return jsonify(encounter_html)


@app.route('/mob_set_names', methods=['GET'])
def mob_set_names():
    set_names = [(key, x.name) for key, x in generator.MOB_SETS.items()]
    set_names.sort(key=lambda x: x[1])
    output = [{'value': x[0], 'name': x[1]} for x in set_names]
    return jsonify(output)


@app.route('/environment_set_names', methods=['GET'])
def environment_set_names():
    set_names = [(key, x['name']) for key, x in generator.ENVIRONMENT_SETS.items()]
    set_names.sort(key=lambda x: x[1])
    output = [{'value': x[0], 'name': x[1]} for x in set_names]
    return jsonify(output)


if __name__ == '__main__':
    app.debug = True
    app.run()
