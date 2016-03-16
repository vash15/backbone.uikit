Base View
=============
La view


## API

### Methods

#### addClass
Può essere una stringa o una funzione e serve per comporre il nome CSS della classe.

#### initialize([options])

#### findPlaceholder(name)

#### appendAndRenderToPlaceholder(name, view)

#### destroy
Rimuove la view dal DOM, spegne gli eventi ad essa associata e richiama l'evento `onDestroy`.

#### setZindex(zIndex)
Imposta uno z-index alla view. `zIndex` deve essere un intero positivo.

#### getZindex
Ritorno lo z-index della view.

#### addEvents(events)
Metodo di comodo per aggiungere eventi alla view base. È preferibile usarlo al posto della property `events`.

### Events

#### onDestroy
Viene richiamato al destroy della view. Se la view possiede delle view figlie, questo metodo richiama tutti i destroy


## Usage

```javascript

var MyView = BaseView.extend({

	addClass: 'my-view',

	onDestroy: function () {
		console.log("onDestroy view");
		MyView.__super__.onDestroy.apply(this, arguments);
	}

});

```
