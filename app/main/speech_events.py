#!/usr/bin/python
# coding: utf-8

import logging
from flask_socketio import SocketIO, emit
import json
from .. import socketio, chatbot, KEYWORDS_DATASET

#Sauvegarde l'entrainement à la reconnaissance de mots clés
@socketio.on('save_keywords_dataset', namespace='/client')
def save_keywords_dataset(dataset):
    logging.info("Saving keywords dataset")
    with open(KEYWORDS_DATASET, 'w') as file:
        file.write(dataset)

#Charge l'entrainement à la reconnaissance de mots clés
@socketio.on('load_keywords_dataset', namespace='/client')
def load_keywords_dataset():
	try:
		with open(KEYWORDS_DATASET, 'r') as f:
			dataset = json.load(f)
			emit("load_keywords_dataset", dataset, namespace="/client", broadcast=True)
	except IOError:
		with open(KEYWORDS_DATASET, 'w') as f:
			f.write("[]")
	except ValueError:
		pass


@socketio.on('train', namespace='/client')
def train_chatbot(conversation):
	print(conversation)
	logging.info("Chatbot trained with: ".join(conversation))
	chatbot.train(conversation)