# Calculadora factures tarifa 3.1A (Espanya)

Calcula la factura a partir de la corba horària
(dada de potència consumida cada hora en kW)

## Estat: funciona && en desenvolupament

## Tasques pendents

- Implementar coste interrumpibilidad a 'tarifa3.js'
- Poder canviar preus del coste interrumpibilidad a la taula principal
- Buscar com es determina TOU estiu/hivern

- Afegir mes i any a resultat i a console.log de tarifa3
- Crear array de resultats i poder exportar-los
- Detectar automàticament els divendres sants (buscar regla)
	El domingo de Pascua nunca puede caer ni antes del 22 de marzo ni después del 25 de abril.
- Implementar cookies per guardar inputs usuari (potencia,preus,etc)
- Habilitar un div pels errors (funció "err" a 'utils.js')
- Complement reactiva com extreure
