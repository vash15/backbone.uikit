Base View
=============

È la view base da cui ereditare tutte le view dell'applicazione. Molto importante è il metodo `destroy` che aiuta a distruggere l'elemento dal DOM e rimuovere gli eventi appesi ad essa. Inoltre, gestisce il destroy automatico di tutte le sue view figlie.

## API

### Property

#### touchActiveClassName
È il nome della classe CSS da applicare quando l'elemto è "attivo". Default: `active-state`

#### addClass
Può essere una stringa o una funzione e serve per comporre il nome CSS della classe.

### Methods

#### initialize([options])

Options:
- `removeOnDestroy` Default: `true`

#### findPlaceholder(name)
Trova un elemento html all'interno della view avente la il data `data-placeholder` uguale al `name`.

#### appendAndRenderToPlaceholder(name, view)
Trova un elemento html all'interno della view avente la il data `data-placeholder` uguale al `name`. Una volta trovato, appende la view e la renderizza.

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

var BaseView = require('backbone.uikit').BaseView;

var MyView = BaseView.extend({

	addClass: 'my-view',

	initialize: function(){
		MyView.__super__.initialize.apply(this, arguments);

		this.views.labelView = new LabelView({ message: '42!' });

	},

	render: function(){
		this.$el.empty().append( this.views.labelView.el );
		this.views.labelView.render();
		return this;
	},

	onDestroy: function () {
		console.log('onDestroy view');
		MyView.__super__.onDestroy.apply(this, arguments);
	}

});

```
