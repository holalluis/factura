# Factura tarifa 3.1A

Calcula la factura a partir de la corba horària
(dada de potència consumida cada hora en kW)

## Estat: funciona && en desenvolupament

## Tasques pendents

- Implementar coste interrumpibilidad a 'tarifa3.js'
- Poder canviar preus del coste interrumpibilidad a la taula principal
- Buscar com es determina TOU estiu/hivern
- Detectar automàticament els divendres sants (buscar regla, per exemple segon divendres abril)
	El domingo de Pascua nunca puede caer ni antes del 22 de marzo ni después del 25 de abril.
- Implementar cookies per guardar inputs usuari (potencia,preus,etc)
- Habilitar un div pels errors (funció "err" a 'utils.js')
- Complement reactiva
