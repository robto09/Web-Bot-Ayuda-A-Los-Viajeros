#!flask/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, request, abort, redirect,url_for,jsonify, send_from_directory, render_template
from flask_cors import CORS, cross_origin
from pymongo import MongoClient, DESCENDING
import random
import sys
import os
import hashlib
import uuid
import datetime
from time import strptime
from time import mktime
import json

reload(sys)
sys.setdefaultencoding('utf-8')
client = MongoClient('mongodb://robert22:temporal1@ds021989.mlab.com:21989/transportes')
db = client.transportes
app = Flask(__name__, static_url_path='/')
cors = CORS(app)

app.config['DEBUG'] = True
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['ENCODING'] = 'utf-8'

def hash_password(password):
    # uuid is used to generate a random number
    salt = uuid.uuid4().hex
    return hashlib.sha256(salt.encode() + password.encode()).hexdigest() + ':' + salt
    
def check_password(hashed_password, user_password):
    password, salt = hashed_password.split(':')
    return password == hashlib.sha256(salt.encode() + user_password.encode()).hexdigest()
	
def dijkstra(G, a, z):
    """
    Algoritmo de Dijkstra
    Determina el camino mas corto entre los vertices 'a' y 'z' de un
    grafo ponderado y conexo 'G'.
    """
    assert a in G
    assert z in G

    # Definicion de infinito como un valor mayor
    # al doble de suma de todos los pesos
    Inf = 0
    for u in G:
        for v, w in G[u]:
            Inf += w

    # Inicializacion de estructuras auxiliares:
    #  L: diccionario vertice -> etiqueta
    #  S: conjunto de vertices con etiquetas temporales
    #  A: vertice -> vertice previo (en camino longitud minima)
    L = dict([(u, Inf) for u in G]) #py3: L = {u:Inf for u in G}
    L[a] = 0
    S = set([u for u in G]) #py3: S = {u for u in G}
    A = { }

    # Funcion auxiliar, dado un vertice retorna su etiqueta
    # se utiliza para encontrar el vertice the etiqueta minima
    def W(v):
        return L[v]
    # Iteracion principal del algoritmo de Dijkstra
    while z in S:
        u = min(S, key=W)
        S.discard(u)
        for v, w in G[u]:
            if v in S:
                if L[u] + w < L[v]:
                    L[v] = L[u] + w
                    A[v] = u

    # Reconstruccion del camino de longitud minima
    P = []
    u = z
    while u != a:
        P.append(u)
        u = A[u]
    P.append(a)
    P.reverse()

    # retorna longitud minima y camino de longitud minima
    return L[z], P

def construirGrafoDistancias():
    dict_grafo = db['rutasCiudades'].find()
    grafo = {}
    for dg in dict_grafo:
        orig = unicode(dg['origen']).encode('utf-8')
        dest = unicode(dg['destino']).encode('utf-8')
        if grafo.has_key(orig):
            grafo[orig].append((dest,dg['distancia']))
        else:
            grafo[orig] = [(dest,dg['distancia'])]
    return grafo	

def obtenerAgencias(p_dict_medios, p_opcion, p_inicio, p_fin, p_fecha):
    '''Lo primero es construir el Grafo de distancias y obtener
       la ruta optima entre origen y el destino. Cualquier otra ruta
       será desestimada'''		
    G1 = construirGrafoDistancias()
    ini = unicode(p_inicio).encode('utf-8')
    fin = unicode(p_fin).encode('utf-8')
    p,w = dijkstra(G1, ini,fin)

    dict_recorridos = {}
    dict_rec_precios = {}
    maxReservasTren = 10

    
    '''Ahora que ya tenemos la ruta optima, buscamos entre los medios de transporte'''
    if p_dict_medios['avion'] == 1:        
            '''Por tiempo, los aviones siempre son más rápidos. Así que
               lo que hacemos es buscar la agencia de avion que tenga 
               plazas libres y que tenga vuelo para la fecha propuesta
               por el cliente'''
        
            rdo = db['airlines'].find({"$where":"this.Pasajeros>this.TotalReservas",
                                        "InicioRuta":p_inicio,
                                        "FinRuta":p_fin,
                                        "FechaSalida":{"$gte":p_fecha}}).sort("FechaSalida",DESCENDING).limit(1)
            for res in rdo:
                if dict_recorridos.has_key('avion'):
                    dict_recorridos['avion'].append([res])
                else:
                    dict_recorridos['avion'] = [res]
                if dict_rec_precios.has_key(res['Precio']):
                    dict_rec_precios[res['Precio']].append({'Agencia':res['Aerolinea'],'Medio':'avion','recorrido':res})
                else:
                    dict_rec_precios[res['Precio']] = [{'Agencia':res['Aerolinea'],'Medio':'avion','recorrido':res}]
    if p_dict_medios['tren'] == 1:
        '''Busco todas las agencias que hacen la ruta'''
        agencias = db['trainlines'].aggregate([ {"$group" : {'_id':"$AgenciaTren"}} ])
        for ag in agencias:
            w_aux = [x for x in w]
            inicio = w_aux.pop(0)
            final = w_aux.pop(0)
            acabar = False
            descartar = False
            l_recorrido = []
            vPrecio = 0
            while(acabar==False and descartar == False):
                '''Buscamos una ruta para la agencia que estamos tratando
                   que vaya de inicio a final en la hora que nos han pasado
                   y ordenado por hora'''
                
                rdo = db['trainlines'].find({'AgenciaTren':ag['_id'],
                                               'TotalReservas':{"$lte":maxReservasTren},
                                               "InicioRuta":inicio,
                                               "FinRuta":final,
                                               "FechaSalida":{"$gte":p_fecha}}).sort("FechaSalida",DESCENDING).limit(1)
                numRegs = rdo.count()
                    
                if numRegs > 0:
                    for res in rdo:
                        l_recorrido.append(res)
                        vPrecio = vPrecio+res['Precio']
                else:
                    descartar = True
                
                if not descartar:    
                    if len(w_aux) == 0:
                        acabar = True
                    else:
                        inicio = final
                        final = w_aux.pop(0)
            if len(l_recorrido) > 0:
                if dict_recorridos.has_key('tren'):
                    dict_recorridos['tren'].append(l_recorrido)
                else:
                    dict_recorridos['tren'] = [l_recorrido]
                if dict_rec_precios.has_key(vPrecio):
                    dict_rec_precios[vPrecio].append({'Agencia':ag['_id'],'Medio':'tren','recorrido':l_recorrido})
                else:
                    dict_rec_precios[vPrecio] = [{'Agencia':ag['_id'],'Medio':'tren','recorrido':l_recorrido}] 
                    
                    
    if p_dict_medios['bus'] == 1:
        '''Busco todas las agencias que hacen la ruta'''
        agencias = db['buslines'].aggregate([ {"$group" : {'_id':"$AgenciaBus"}} ])
        for ag in agencias:
            w_aux = [x for x in w]
            inicio = w_aux.pop(0)
            final = w_aux.pop(0)
            acabar = False
            descartar = False
            l_recorrido = []
            vPrecio = 0
            while(acabar==False and descartar == False):
                '''Buscamos una ruta para la agencia que estamos tratando
                   que vaya de inicio a final en la hora que nos han pasado
                   y ordenado por hora'''
                
                rdo = db['buslines'].find({'AgenciaBus':ag['_id'],
                                               "$where":"this.Capacidad>this.Asignacion",
                                               "InicioRuta":inicio,
                                               "FinRuta":final,
                                               "FechaSalida":{"$gte":p_fecha}}).sort("FechaSalida",DESCENDING).limit(1)
                numRegs = rdo.count()
                    
                if numRegs > 0:
                    for res in rdo:
                        l_recorrido.append(res)
                        vPrecio = vPrecio+res['Precio']
                else:
                    descartar = True
                
                if not descartar:    
                    if len(w_aux) == 0:
                        acabar = True
                    else:
                        inicio = final
                        final = w_aux.pop(0)
            if len(l_recorrido) > 0:
                if dict_recorridos.has_key('bus'):
                    dict_recorridos['bus'].append(l_recorrido)
                else:
                    dict_recorridos['bus'] = [l_recorrido]
                if dict_rec_precios.has_key(vPrecio):
                    dict_rec_precios[vPrecio].append({'Agencia':ag['_id'],'Medio':'bus','recorrido':l_recorrido})
                else:
                    dict_rec_precios[vPrecio] = [{'Agencia':ag['_id'],'Medio':'bus','recorrido':l_recorrido}] 

                    
    if p_dict_medios['taxi'] == 1:
        '''Busco todas las agencias que hacen la ruta'''
        agencias = db['taxilines'].aggregate([ {"$group" : {'_id':"$AgenciaTaxi"}} ])
        for ag in agencias:
            w_aux = [x for x in w]
            inicio = w_aux.pop(0)
            final = w_aux.pop(0)
            acabar = False
            descartar = False
            l_recorrido = []
            vPrecio = 0
            while(acabar==False and descartar == False):
                '''Buscamos una ruta para la agencia que estamos tratando
                   que vaya de inicio a final en la hora que nos han pasado
                   y ordenado por hora'''
                
                rdo = db['taxilines'].find({'AgenciaTaxi':ag['_id'],
                                               "FlgDisp":"S",
                                               "InicioRuta":inicio,
                                               "FinRuta":final}).limit(1)
                numRegs = rdo.count()
                    
                if numRegs > 0:
                    for res in rdo:
                        l_recorrido.append(res)
                        if vPrecio == 0:
                            vPrecio = vPrecio+res['PrecioKms']
                else:
                    descartar = True
                    l_recorrido = []
                
                if not descartar:    
                    if len(w_aux) == 0:
                        acabar = True
                    else:
                        inicio = final
                        final = w_aux.pop(0)                
            if len(l_recorrido) > 0:
                if dict_recorridos.has_key('taxi'):
                    dict_recorridos['taxi'].append(l_recorrido)
                else:
                    dict_recorridos['taxi'] = [l_recorrido]
                if dict_rec_precios.has_key(vPrecio*p):
                    dict_rec_precios[vPrecio*p].append({'Agencia':ag['_id'],'Medio':'taxi','recorrido':l_recorrido})
                else:
                    dict_rec_precios[vPrecio*p] = [{'Agencia':ag['_id'],'Medio':'taxi','recorrido':l_recorrido}] 

    '''Ahora ya tenemos las agencias que cumplen con los recorridos optimos
       las ordenamos en el orden establecido por el usuario'''
    
    l_ordenes = []
    if p_opcion == 'tiempo':
        '''Si el factor es el tiempo, el avión siempre será el primero.
           El resto tendrán el mismo tiempo'''
        if dict_recorridos.has_key('avion'):
            l_ordenes.append(dict_recorridos['avion'])
        if dict_recorridos.has_key('tren'):
            l_ordenes.append(dict_recorridos['tren'])
        if dict_recorridos.has_key('bus'):
            l_ordenes.append(dict_recorridos['bus'])            
        if dict_recorridos.has_key('taxi'):
            l_ordenes.append(dict_recorridos['taxi'])
        ''''Ahora que ya lo tenemos todos, solamente falta ponerlo bien'''
        rdo = []
        if len(l_ordenes) > 0:
            for le in l_ordenes:
                for ages in le:
                    if type(ages) is dict:
                        if ages.has_key('Aerolinea'):
                            rdo.append({'Agencia':ages['Aerolinea'],'Ruta':ages['InicioRuta']+'-'+ages['FinRuta'],'Precio':ages['Precio'],'Medio':'avion'})
                        elif ages.has_key('AgenciaBus'):
                            rdo.append({'Agencia':ages['AgenciaBus'],'Ruta':ages['InicioRuta']+'-'+ages['FinRuta'],'Precio':ages['Precio'],'Medio':'bus'})
                        elif ages.has_key('AgenciaTren'):
                            rdo.append({'Agencia':ages['AgenciaTren'],'Ruta':ages['InicioRuta']+'-'+ages['FinRuta'],'Precio':ages['Precio'],'Medio':'tren'})
                        elif ages.has_key('AgenciaTaxi'):
                            rdo.append({'Agencia':ages['AgenciaTaxi'],'Ruta':ages['InicioRuta']+'-'+ages['FinRuta'],'Precio':ages['PrecioKms']*p,'Medio':'taxi'})
                    elif type(le) is list:
                        agencia = ''
                        recorrido = ''
                        medio = ''
                        if le[0][0].has_key('Aerolinea'): 
                            agencia = le[0][0]['Aerolinea'] 
                            medio = 'avion'                            
                        if le[0][0].has_key('AgenciaBus'): 
                            agencia = le[0][0]['AgenciaBus']
                            medio = 'bus'
                        if le[0][0].has_key('AgenciaTren'): 
                            agencia = le[0][0]['AgenciaTren']
                            medio = 'tren'
                        if le[0][0].has_key('AgenciaTaxi'): 
                            agencia = le[0][0]['AgenciaTaxi']
                            medio = 'taxi'
                        numReg = 1
                        precio = 0
                        for recs in le[0]:
                            if recs.has_key('Precio'):
                                precio = precio+recs['Precio']
                            else:
                                precio = precio+(recs['PrecioKms']*p)
                            recorrido = recorrido + recs['InicioRuta']+'-'
                            if numReg == len(le[0]):
                                recorrido = recorrido + recs['FinRuta']                                
                            numReg = numReg+1
                        rdo.append({'Agencia':agencia,'Ruta':recorrido,'Precio':precio,'Medio':medio})
                             
                                            
        return rdo
                
    else:
        '''Si la opción es el dinero, ya no podemos hacer suposiciones'''
        '''Lo que si tenemos es un diccionario con los precios como clave.
           Así que lo único que tenemos que hacer es coger las claves,
           ordenarlas, y devolver un resultado que sea tratable por el
           javascript'''
        claves = dict_rec_precios.keys()
        claves.sort()
        rdo = []
        for cl in claves:
            for ages in dict_rec_precios[cl]:
                agencia = ages['Agencia']
                medio = ages['Medio']
                precio = cl
                if type(ages['recorrido']) is dict:
                    rdo.append({'Agencia':ages['Agencia'],'Ruta':ages['recorrido']['InicioRuta']+'-'+ages['recorrido']['FinRuta'],'Precio':cl,'Medio':medio})
                else:
                    recorrido = ''
                    numReg = 1
                    for recs in ages['recorrido']:
                        recorrido = recorrido + recs['InicioRuta']+'-'
                        if numReg == len(ages['recorrido']):
                            recorrido = recorrido + recs['FinRuta']                                
                        numReg = numReg+1
                        
                    rdo.append({'Agencia':agencia,'Ruta':recorrido,'Precio':precio,'Medio':medio})
        return rdo


def reservar(p_agencia, p_recorrido, p_medio, p_fecha, p_usuario, p_numRvas=1):
    '''Hemos de hacer una reserva por cada paso del recorrido, pero primero
       hemo de analizar el medio que usamos para poder ir a buscar la tabla
       que nos interesa'''
    vPrecio = 0
    l_recorrido = p_recorrido.split('-')
    if p_medio == 'avion':
            rdo = db['airlines'].find({"$where":"this.Pasajeros>this.TotalReservas",
                                        "InicioRuta":l_recorrido[0],
                                        "FinRuta":l_recorrido[1],
                                        "Aerolinea":p_agencia,
                                        "FechaSalida":{"$gte":p_fecha}}).sort("FechaSalida",DESCENDING).limit(1)
            for r in rdo: 
                vTotalReservas = int(r['TotalReservas'])+p_numRvas                
                db['airlines'].update({'_id':r['_id']},{'$set':{'TotalReservas':vTotalReservas}})
                dict_reservas = {'Agencia':p_agencia, 'InicioRuta':r['InicioRuta'],
                                 'FinRuta':r['FinRuta'],'FechaSalida':r['Intervalo'],
                                 'Precio':r['Precio']*p_numRvas,
                                 'Usuario':p_usuario,'NumPasajeros':p_numRvas} 
                db['bookings'].insert(dict_reservas)
                vPrecio = vPrecio+(r['Precio']*p_numRvas)
            return vPrecio 
    if p_medio == 'bus':
        vInicio = l_recorrido.pop(0) 
        vFinal = l_recorrido.pop(0)
        vSalir = False
        while(vSalir == False):
            rdo = db['buslines'].find({"$where":"this.Capacidad>this.Asignacion",
                                        "InicioRuta":vInicio,
                                        "FinRuta":vFinal,
                                        "AgenciaBus":p_agencia,
                                        "FechaSalida":{"$gte":p_fecha}}).sort("FechaSalida",DESCENDING).limit(1)
            for r in rdo:
                vAsignacion = int(r['Asignacion'])+p_numRvas
                db['buslines'].update({'_id':r['_id']},{'$set':{'Asignacion':vAsignacion}})
                dict_reservas = {'Agencia':p_agencia, 'InicioRuta':r['InicioRuta'],
                                 'FinRuta':r['FinRuta'],'FechaSalida':r['Intervalo'],
                                 'Precio':r['Precio']*p_numRvas,
                                 'Usuario':p_usuario,'NumPasajeros':p_numRvas} 
                db['bookings'].insert(dict_reservas)
                if len(l_recorrido) == 0:
                    vSalir = True
                else:
                    vInicio = vFinal
                    vFinal = l_recorrido.pop(0)
                
                vPrecio = vPrecio+(r['Precio']*p_numRvas)
        return vPrecio 

        
    if p_medio == 'tren':
        vInicio = l_recorrido.pop(0) 
        vFinal = l_recorrido.pop(0)
        vSalir = False
        while(vSalir == False):
            rdo = db['trainlines'].find({'TotalReservas':{"$lte":maxReservasTren},
                                        "InicioRuta":vInicio,
                                        "FinRuta":vFinal,
                                        "AgenciaTren":p_agencia,
                                        "FechaSalida":{"$gte":p_fecha}}).sort("FechaSalida",DESCENDING).limit(1)
            for r in rdo:
                vTotalReservas = r['TotalReservas']+p_numRvas
                db['trainlines'].update({'_id':r['_id']},{'$set':{'TotalReservas':vTotalReservas}})
                dict_reservas = {'Agencia':p_agencia, 'InicioRuta':r['InicioRuta'],
                                 'FinRuta':r['FinRuta'],'FechaSalida':r['Intervalo'],
                                 'Precio':int(r['Precio'])*p_numRvas,
                                 'Usuario':p_usuario,'NumPasajeros':p_numRvas} 
                db['bookings'].insert(dict_reservas)
                if len(l_recorrido) == 0:
                    vSalir = True
                else:
                    vInicio = vFinal
                    vFinal = l_recorrido.pop(0)
                vPrecio = vPrecio+(r['Precio']*p_numRvas)
        return vPrecio 

@cross_origin()
@app.route('/')
def root():
	return render_template('index.html')


@app.route('/<string:page_name>/')
def send_page(page_name):
	if page_name != 'favicon.ico':
		return render_template("%s" %page_name)
	else: return ""

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

@app.route('/imgs/<path:path>')
def send_img(path):
    return send_from_directory('imgs', path)


@app.route('/api/web-bot/crearUsuario',methods=['POST'])
def crearUsuario():
	userMode = 'USER'
	if request.form.has_key('mode'):
		userMode = request.form['mode']
	
	userName = request.form['userName']
	password = hash_password(request.form['password'])
	
	
	usuario = {'userName':userName,
						 'password':password,	'creationDate':datetime.datetime.now(),
						 'userMode':userMode}
	
	db['users'].insert(usuario)
	return jsonify({'rdo':'OK'})

@app.route('/api/web-bot/devolverUsuario',methods=['POST'])
def devolverUsurio():
	usuario = request.form['userName']
	password = request.form['password']
	if usuario == '' or password == '':
		return jsonify({'rdo':'KO'})
	rdo = db['users'].find_one({'userName':usuario},{'userName':1,'userMode':1,'_id':0,'password':1})
	rdo_check = None
	if rdo != None:
		rdo_check = check_password(rdo['password'],password)
	if rdo == None or len(rdo) == 0 or rdo_check == False:
		return jsonify({'rdo':'KO'})
	else:
		return jsonify(rdo);
	
	
@app.route('/api/web-bot/existeUsuario',methods=['GET'])
def checkUsuario():
	userName = request.args.get('userName')
	rdo = db['users'].find_one({'userName':userName},{'userName':1,'_id':0})
	print rdo
	if rdo == None or len(rdo) == 0:
		return jsonify({'rdo':'KO'})
	return jsonify({'rdo':'OK'})

@app.route('/api/web-bot/creaAerolinea',methods=['POST'])
def grabarRutaAerea():
	aerolinea  = request.form['aeroLinea']
	inicioRuta = request.form['inicioRuta']
	finRuta    = request.form['finalRuta']
	pasajeros  = int(request.form['pasajeros'])
	intervalo  = request.form['intervalo']	
	precio		 = float(request.form['precio']	)
	l_intervalo = intervalo.split('T')
	l_dia = l_intervalo[0].split('-')
	intervalo = l_dia[2]+'/'+l_dia[1]+'/'+l_dia[0]+' '+l_intervalo[1]
	fechaSalida = datetime.datetime.strptime(intervalo,'%d/%m/%Y %H:%M')
	rutaAerea = {'Aerolinea':aerolinea, 'InicioRuta':inicioRuta, 'FinRuta':finRuta,
								 'Pasajeros':pasajeros, 'Intervalo':intervalo,'Precio':precio,
								 'TotalReservas':0, 'FechaSalida':fechaSalida}
	db['airlines'].insert(rutaAerea)
	return jsonify({'rdo':'OK'})

@app.route('/api/web-bot/creaLineaTaxi',methods=['POST'])
def grabarRutaTaxi():
	agenciaTaxi  = request.form['agenciaTaxi']
	placaVehic = request.form['placaVehic']
	idConduc	 = request.form['idConductor']
	nombreCond = request.form['nombreCond']
	apellidoCond = request.form['apellidoCond']
	inicioRuta = request.form['inicioRuta']
	finRuta    = request.form['finalRuta']
	precioKms	 = float(request.form['precioKms'])
	rutaTaxi = {'AgenciaTaxi':agenciaTaxi, 'PlacaVehic':placaVehic,
							 'IdConductor':idConduc, 'NombreCond':nombreCond,
							 'ApellidoCond':apellidoCond, 'InicioRuta':inicioRuta, 'FinRuta':finRuta, 'PrecioKms':precioKms,'TotalReservas':0,
						   'FlgDisp':'S'}
	db['taxilines'].insert(rutaTaxi)
	return jsonify({'rdo':'OK'})

@app.route('/api/web-bot/creaLineaTren',methods=['POST'])
def grabarRutaTren():
	agenciaTren  = request.form['agenciaTren']
	inicioRuta = request.form['inicioRutaTren']
	finRuta    = request.form['finalRutaTren']
	intervalo  = request.form['intervaloTren']	
	l_intervalo = intervalo.split('T')
	l_dia = l_intervalo[0].split('-')
	intervalo = l_dia[2]+'/'+l_dia[1]+'/'+l_dia[0]+' '+l_intervalo[1]
	fechaSalida = datetime.datetime.strptime(intervalo,'%d/%m/%Y %H:%M')	
	precio		 = float(request.form['precioTren'])
	rutaTren = {'AgenciaTren':agenciaTren, 'InicioRuta':inicioRuta, 'FinRuta':finRuta, 'Intervalo':intervalo, 'Precio':precio,'TotalReservas':0, 'FechaSalida':fechaSalida}
	db['trainlines'].insert(rutaTren)
	return jsonify({'rdo':'OK'})

@app.route('/api/web-bot/creaLineaBus',methods=['POST'])
def grabarRutaBus():
	agenciaBus  = request.form['agenciaBus']
	conductor	 = request.form['conductor']
	inicioRuta = request.form['inicioRuta']
	finRuta    = request.form['finalRuta']
	intervalo  = request.form['intervalo']	
	l_intervalo = intervalo.split('T')
	l_dia = l_intervalo[0].split('-')	
	intervalo = l_dia[2]+'/'+l_dia[1]+'/'+l_dia[0]+' '+l_intervalo[1]
	fechaSalida = datetime.datetime.strptime(intervalo,'%d/%m/%Y %H:%M')	
	precio		 = float(request.form['precio'])
	capacidad  = int(request.form['capacidad'])
	asignacion = int(request.form['asignacion'])
	rutaBus = {'AgenciaBus':agenciaBus, 'Conductor':conductor, 'Precio':precio,
							'InicioRuta':inicioRuta, 'FinRuta':finRuta, 'Intervalo':intervalo,
						  'Capacidad':capacidad,'Asignacion':asignacion, 'FechaSalida':fechaSalida}
	db['buslines'].insert(rutaBus)
	return jsonify({'rdo':'OK'})


@app.route('/api/web-bot/getNumLineasAereas',methods=['GET'])
def devolverNumRutasAereas():
	numRegs = db['airlines'].count()
	return jsonify({'rdo':numRegs})

@app.route('/api/web-bot/getNumLineasTaxi',methods=['GET'])
def devolverNumRutasTaxi():
	numRegs = db['taxilines'].count()
	return jsonify({'rdo':numRegs})

@app.route('/api/web-bot/getNumLineasTren',methods=['GET'])
def devolverNumRutasTren():
	numRegs = db['trainlines'].count()
	return jsonify({'rdo':numRegs})

@app.route('/api/web-bot/getNumLineasBus',methods=['GET'])
def devolverNumRutasBus():
	numRegs = db['buslines'].count()
	return jsonify({'rdo':numRegs})


@app.route('/api/web-bot/getLineasAereas',methods=['GET'])
def devolverLineasAereas():
	rdo = db['airlines'].find({},{'_id':0,'Aerolinea':1,'InicioRuta':1, 'FinRuta':1,
															 'Pasajeros':1, 'Intervalo':1,'Precio':1})
	l_rdos = []
	for result in rdo:		
		l_rdo = []
		l_rdo.append(result["Aerolinea"])
		l_rdo.append(result["InicioRuta"])
		l_rdo.append(result["FinRuta"])
		l_rdo.append(result["Pasajeros"])
		l_rdo.append(result["Intervalo"])
		l_rdo.append(result["Precio"])
		l_rdos.append(l_rdo)
	dict_devolver = {'rdo':l_rdos}	
	print dict_devolver
	return jsonify(dict_devolver)

@app.route('/api/web-bot/getLineasTaxis',methods=['GET'])
def devolverLineasTaxi():
	rdo = db['taxilines'].find({},{'_id':0,'AgenciaTaxi':1,'PlacaVehic':1,'IdConductor':1, 'NombreCond':1, 'ApellidoCond':1,'InicioRuta':1, 'FinRuta':1,'PrecioKms':1})
	l_rdos = []
	for result in rdo:		
		l_rdo = []
		l_rdo.append(result["AgenciaTaxi"])
		l_rdo.append(result["PlacaVehic"])
		l_rdo.append(result["IdConductor"])
		l_rdo.append(result["NombreCond"])
		l_rdo.append(result["ApellidoCond"])
		l_rdo.append(result["InicioRuta"])
		l_rdo.append(result["FinRuta"])
		l_rdo.append(result["PrecioKms"])
		l_rdos.append(l_rdo)
	dict_devolver = {'rdo':l_rdos}	
	print dict_devolver
	return jsonify(dict_devolver)

@app.route('/api/web-bot/getLineasTren',methods=['GET'])
def devolverLineasTren():
	rdo = db['trainlines'].find({},{'_id':0,'AgenciaTren':1,'InicioRuta':1, 'FinRuta':1,'Intervalo':1,'Precio':1})
	l_rdos = []
	for result in rdo:		
		print result
		l_rdo = []
		l_rdo.append(result["AgenciaTren"])
		l_rdo.append(result["InicioRuta"])
		l_rdo.append(result["FinRuta"])
		l_rdo.append(result["Precio"])
		l_rdo.append(result["Intervalo"])
		l_rdos.append(l_rdo)
	dict_devolver = {'rdo':l_rdos}	
	return jsonify(dict_devolver)

@app.route('/api/web-bot/getLineasBus',methods=['GET'])
def devolverLineasBus():
	rdo = db['buslines'].find({},{'_id':0,'AgenciaBus':1,'InicioRuta':1, 'FinRuta':1,'Intervalo':1,'Conductor':1, 'Capacidad':1,'Asignacion':1,'Precio':1})
	l_rdos = []
	for result in rdo:		
		print result
		l_rdo = []
		l_rdo.append(result["AgenciaBus"])
		l_rdo.append(result["Conductor"])
		l_rdo.append(result["InicioRuta"])
		l_rdo.append(result["FinRuta"])
		l_rdo.append(result["Precio"])
		l_rdo.append(result["Intervalo"])
		l_rdo.append(result["Capacidad"])
		l_rdo.append(result["Asignacion"])
		l_rdos.append(l_rdo)
	dict_devolver = {'rdo':l_rdos}	
	return jsonify(dict_devolver)

@app.route('/api/web-bot/obtenerAgencias',methods=['POST'])
def obtencionAgencias():
	print "Estoy aquiiii"
	medios 			= request.form['dict_medios']
	opcion			= request.form['opcion']
	inicio			= request.form['inicio']
	fin					= request.form['fin']
	fecha				= datetime.datetime.fromtimestamp(mktime(strptime(request.form['fecha'],'%d/%m/%Y %H:%M')))
	print medios, opcion, inicio, fin,fecha
	print type(medios)
	dict_medios = json.loads(medios)
	rdo = obtenerAgencias(dict_medios, opcion, inicio, fin, fecha)
	return jsonify({'rdo':rdo})

@app.route('/api/web-bot/reservar',methods=['POST'])
def reserva():
	#def reservar(p_agencia, p_recorrido, p_medio, p_fecha, p_usuario, p_numRvas=1)
	agencia   = request.form['agencia']
	recorrido = request.form['recorrido']
	medio		  = request.form['medio']
	num_rsvas = int(request.form['numRsvas'])
	usuario 	= request.form['usuario']
	fecha			= datetime.datetime.fromtimestamp(mktime(strptime(request.form['fecha'],'%d/%m/%Y %H:%M')))
	rdo = reservar(agencia, recorrido, medio, fecha, usuario, num_rsvas)
	return jsonify({'rdo':rdo})

@app.route('/api/web-bot/getNumReservas/<string:usuario>')
def devolverNumReservas(usuario):
	regs = db['bookings'].find({'Usuario':usuario})
	rdo = regs.count();
	return jsonify({'rdo':rdo})

@app.route('/api/web-bot/devolverReservas/<string:usuario>')
def devolverReservas(usuario):
	regs = db['bookings'].find({'Usuario':usuario},{'_id':0})
	rdo = []
	
	for reg in regs:
		rdo.append(reg)
	
	return jsonify({'rdo':rdo})


if __name__ == '__main__':
	#hashed_pwd = hash_password('Lota5971!')
	#rdo = check_password(hashed_pwd,'Lota5971!')
	app.run(host="0.0.0.0")
